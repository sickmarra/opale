import { useState, useEffect } from 'react'
import { format, getDay } from 'date-fns'
import { it } from 'date-fns/locale'
import { availabilityApi } from '../api'

const MIN_HOUR = 8
const MAX_HOUR = 23

export default function TimeSlotPicker({ date, onSelectionChange }) {
  const [occupied, setOccupied] = useState([])
  const [startHour, setStartHour] = useState(null)
  const [endHour, setEndHour]     = useState(null)
  const [loading, setLoading]     = useState(false)

  const isWeekend  = date ? [0, 6].includes(getDay(date)) : false
  const hourlyRate = isWeekend ? 35 : 30

  useEffect(() => {
    if (!date) return
    setStartHour(null); setEndHour(null)
    onSelectionChange(null, null, 0)
    fetchAvailability()
  }, [date])

  useEffect(() => {
    if (startHour !== null && endHour !== null)
      onSelectionChange(startHour, endHour, (endHour - startHour) * hourlyRate)
    else
      onSelectionChange(null, null, 0)
  }, [startHour, endHour])

  async function fetchAvailability() {
    setLoading(true)
    try {
      const res = await availabilityApi.getDay(format(date, 'yyyy-MM-dd'))
      setOccupied(res.data.occupiedHours)
    } catch {}
    finally { setLoading(false) }
  }

  function handleSlot(hour) {
    if (occupied.includes(hour)) return
    if (startHour === null) { setStartHour(hour); setEndHour(hour + 1); return }
    if (hour === startHour) { setStartHour(null); setEndHour(null); return }
    if (hour < startHour) { setStartHour(hour); return }
    const newEnd = hour + 1
    const conflict = occupied.some(h => h >= startHour && h < newEnd)
    if (conflict) { setStartHour(hour); setEndHour(hour + 1) }
    else setEndHour(newEnd)
  }

  const hours    = Array.from({ length: MAX_HOUR - MIN_HOUR }, (_, i) => MIN_HOUR + i)
  const inSel    = h => startHour !== null && endHour !== null && h >= startHour && h < endHour
  const duration = startHour !== null && endHour !== null ? endHour - startHour : 0

  if (loading) return (
    <div className="card flex items-center justify-center py-10">
      <div className="w-5 h-5 border border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="card space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-body text-[9px] text-muted tracking-[0.25em] uppercase mb-1">Selezione orario</p>
          <p className="font-heading text-lg font-light text-text capitalize">
            {format(date, "EEEE d MMMM", { locale: it })}
          </p>
        </div>
        <div className="text-right">
          <p className="font-heading text-2xl font-light" style={{ color:'#C85A1E' }}>€{hourlyRate}</p>
          <p className="font-body text-[9px] text-muted tracking-wide">{isWeekend ? 'weekend' : 'feriale'} / ora</p>
        </div>
      </div>

      {/* Hour grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {hours.map(hour => {
          const isOccupied = occupied.includes(hour)
          const selected   = inSel(hour)
          const isStart    = hour === startHour
          const isEnd      = endHour !== null && hour === endHour - 1

          return (
            <button
              key={hour}
              onClick={() => handleSlot(hour)}
              disabled={isOccupied}
              className="relative py-2.5 font-body text-xs transition-all duration-100"
              style={{
                borderRadius: 0,
                background: isOccupied ? 'rgba(255,255,255,0.03)'
                           : selected  ? (isStart || isEnd ? 'linear-gradient(135deg,#C85A1E,#A04018)' : 'rgba(200,90,30,0.35)')
                           : 'rgba(255,255,255,0.04)',
                border: isOccupied ? '1px solid rgba(255,255,255,0.04)'
                       : selected  ? 'none'
                       : '1px solid rgba(255,255,255,0.08)',
                color: isOccupied ? 'rgba(122,114,104,0.25)'
                      : selected   ? '#F5F0E8'
                      : '#A09890',
                cursor: isOccupied ? 'not-allowed' : 'pointer',
                textDecoration: isOccupied ? 'line-through' : 'none',
                letterSpacing: '0.04em',
                boxShadow: (isStart || isEnd) && selected ? '0 2px 12px rgba(200,90,30,0.3)' : 'none',
              }}
            >
              {hour}:00
            </button>
          )
        })}
      </div>

      {/* Selection summary */}
      {duration > 0 ? (
        <div
          className="flex items-center justify-between px-4 py-3 animate-slide-up"
          style={{ background:'rgba(200,90,30,0.08)', border:'1px solid rgba(200,90,30,0.2)' }}
        >
          <div>
            <p className="font-heading text-xl font-light text-text">
              {startHour}:00 → {endHour}:00
            </p>
            <p className="font-body text-[10px] text-muted tracking-wide mt-0.5">
              {duration} {duration === 1 ? 'ora' : 'ore'} · studio
            </p>
          </div>
          <div className="text-right">
            <p className="font-heading text-3xl font-light" style={{ color:'#C85A1E' }}>
              €{duration * hourlyRate}
            </p>
          </div>
        </div>
      ) : (
        <p className="font-body text-center text-[11px] text-muted tracking-wide leading-relaxed">
          Tocca uno slot per iniziare.<br/>Tocca un secondo per estendere la durata.
        </p>
      )}
    </div>
  )
}
