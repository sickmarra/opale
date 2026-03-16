import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay,
         isBefore, startOfDay, getDay, addMonths, subMonths } from 'date-fns'
import { it } from 'date-fns/locale'
import { availabilityApi } from '../api'

const DAYS_SHORT = ['Do','Lu','Ma','Me','Gi','Ve','Sa']

export default function BookingCalendar({ selectedDate, onSelectDate, readOnly = false }) {
  const [viewDate, setViewDate]   = useState(selectedDate || new Date())
  const [monthData, setMonthData] = useState({})
  const [loading, setLoading]     = useState(false)
  const today = startOfDay(new Date())

  useEffect(() => { fetchMonth(viewDate) }, [viewDate])

  async function fetchMonth(d) {
    setLoading(true)
    try {
      const res = await availabilityApi.getMonth(d.getFullYear(), d.getMonth() + 1)
      setMonthData(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  const monthStart = startOfMonth(viewDate)
  const days       = eachDayOfInterval({ start: monthStart, end: endOfMonth(viewDate) })
  const startPad   = getDay(monthStart)
  const cells      = [...Array(startPad).fill(null), ...days]

  function getStatus(day) {
    if (isBefore(day, today)) return 'past'
    const key = format(day, 'yyyy-MM-dd')
    const d = monthData[key]
    if (d?.fullyBooked) return 'full'
    if (d?.occupiedCount > 0) return 'partial'
    return 'available'
  }

  return (
    <div className="card">

      {/* Month nav */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setViewDate(d => subMonths(d, 1))}
          className="p-2 text-muted hover:text-text transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div className="text-center flex items-center gap-2">
          <h3 className="font-heading text-lg font-light text-text capitalize tracking-wide">
            {format(viewDate, 'MMMM yyyy', { locale: it })}
          </h3>
          {loading && (
            <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <button
          onClick={() => setViewDate(d => addMonths(d, 1))}
          className="p-2 text-muted hover:text-text transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center font-body text-[9px] text-muted uppercase tracking-[0.2em] py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />

          const status   = getStatus(day)
          const isSel    = selectedDate && isSameDay(day, selectedDate)
          const isToday  = isSameDay(day, today)
          const isPast   = status === 'past'
          const isFull   = status === 'full'
          const disabled = readOnly || isPast || isFull

          return (
            <button
              key={day.toString()}
              disabled={disabled}
              onClick={() => !disabled && onSelectDate?.(day)}
              className="relative flex items-center justify-center font-body text-sm transition-all duration-150"
              style={{
                aspectRatio: '1',
                borderRadius: 2,
                cursor: disabled ? 'not-allowed' : 'pointer',
                background: isSel
                  ? 'linear-gradient(135deg, #C85A1E, #A04018)'
                  : 'transparent',
                color: isSel ? '#F5F0E8'
                     : isPast ? 'rgba(122,114,104,0.25)'
                     : isFull ? 'rgba(122,114,104,0.2)'
                     : isToday ? '#C85A1E'
                     : '#F5F0E8',
                fontWeight: isToday && !isSel ? 600 : 400,
                boxShadow: isSel ? '0 4px 20px rgba(200,90,30,0.35)' : 'none',
                textDecoration: isFull ? 'line-through' : 'none',
              }}
            >
              {format(day, 'd')}
              {/* availability dot */}
              {!isPast && !isFull && !isSel && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: status === 'partial' ? '#D4902A' : '#1A5C47' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        {[
          { color:'#1A5C47', label:'Disponibile' },
          { color:'#D4902A', label:'Parziale' },
          { color:'rgba(122,114,104,0.3)', label:'Esaurito' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }}/>
            <span className="font-body text-[9px] text-muted tracking-wide">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
