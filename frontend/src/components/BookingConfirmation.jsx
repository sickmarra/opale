import { useState } from 'react'
import { format, getDay } from 'date-fns'
import { it } from 'date-fns/locale'
import { bookingsApi, servicesApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function BookingConfirmation({ date, startHour, endHour, serviceIds, studioPrice, onSuccess, onBack }) {
  const { user } = useAuth()
  const [notes, setNotes]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [booked, setBooked]   = useState(null)
  const [services, setServices] = useState([])

  useState(() => {
    if (serviceIds.length > 0) servicesApi.getAll().then(r => setServices(r.data))
  })

  const selectedServices = services.filter(s => serviceIds.includes(s.id))
  const extrasTotal = selectedServices.reduce((s, x) => s + x.price, 0)
  const total       = studioPrice + extrasTotal
  const duration    = endHour - startHour
  const isWeekend   = [0,6].includes(getDay(date))

  async function handleConfirm() {
    setLoading(true); setError('')
    try {
      const res = await bookingsApi.create({
        date: format(date, 'yyyy-MM-dd'),
        start_hour: startHour, end_hour: endHour,
        service_ids: serviceIds,
        notes: notes.trim() || undefined,
      })
      setBooked(res.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Errore durante la prenotazione')
    } finally {
      setLoading(false)
    }
  }

  /* ── Success ── */
  if (booked) return (
    <div className="card space-y-6 animate-slide-up">
      <div className="text-center space-y-3 py-2">
        <div
          className="w-16 h-16 mx-auto flex items-center justify-center"
          style={{ background:'rgba(26,92,71,0.12)', border:'1px solid rgba(26,92,71,0.3)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#3CB371" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <p className="font-body text-[9px] text-muted tracking-[0.25em] uppercase mb-1">Confermata</p>
          <h2 className="font-heading text-3xl font-light text-text">Prenotazione #{booked.id}</h2>
          <p className="font-body text-sm text-muted mt-1 capitalize">
            {format(date, "d MMMM yyyy", { locale: it })}
          </p>
        </div>
      </div>

      {/* Summary rows */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        {[
          { label: 'Data', value: format(date,"EEEE d MMMM",{locale:it}), cap: true },
          { label: 'Orario', value: `${startHour}:00 – ${endHour}:00 (${duration}h)` },
          ...(selectedServices.map(s => ({ label: s.name, value: `€${s.price}` }))),
          { label: 'Totale', value: `€${total}`, highlight: true },
        ].map((row, i) => (
          <div key={i} className="flex justify-between py-3 px-1"
            style={{ borderBottom: i < 2 + selectedServices.length ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <span className="font-body text-xs text-muted tracking-wide">{row.label}</span>
            <span
              className={`font-body text-sm ${row.cap ? 'capitalize' : ''}`}
              style={{ color: row.highlight ? '#C85A1E' : '#F5F0E8', fontFamily: row.highlight ? '"Cormorant Garamond",serif' : undefined, fontSize: row.highlight ? '1.25rem' : undefined }}
            >{row.value}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2.5">
        <div
          className="flex items-center gap-2.5 px-4 py-3"
          style={{ background: 'rgba(26,92,71,0.08)', border: '1px solid rgba(60,179,113,0.15)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#3CB371" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
          <p className="font-body text-[11px] text-muted leading-snug">
            Email di conferma inviata a <strong className="text-text">{user.email}</strong>
          </p>
        </div>
        <button onClick={onSuccess} className="btn-primary w-full h-12 flex items-center justify-center">
          Torna alla home
        </button>
      </div>
    </div>
  )

  /* ── Form ── */
  return (
    <div className="card space-y-5 animate-slide-up">
      <div>
        <p className="font-body text-[9px] text-muted tracking-[0.25em] uppercase mb-1">Riepilogo</p>
        <h2 className="font-heading text-2xl font-light text-text capitalize">
          {format(date, "EEEE d MMMM", { locale: it })}
        </h2>
      </div>

      {/* Price breakdown */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        {[
          { label: 'Orario', value: `${startHour}:00 – ${endHour}:00 (${duration}h)` },
          { label: `Studio (${isWeekend?'weekend':'feriale'})`, value: `€${studioPrice}` },
          ...selectedServices.map(s => ({ label: s.name, value: `€${s.price}` })),
        ].map((row, i) => (
          <div key={i} className="flex justify-between py-2.5 px-1"
            style={{ borderBottom: i < 1 + selectedServices.length ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <span className="font-body text-xs text-muted">{row.label}</span>
            <span className="font-body text-sm text-text">{row.value}</span>
          </div>
        ))}
        <div className="flex justify-between py-3 px-1">
          <span className="font-body text-xs text-muted tracking-wide uppercase">Totale</span>
          {total > 0 && <span className="font-heading text-2xl font-light" style={{ color:'#C85A1E' }}>€{total}</span>}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label">Note aggiuntive</label>
        <textarea
          className="input-field"
          rows={3}
          placeholder="Tipo di shooting, richieste particolari..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          maxLength={500}
        />
      </div>

      {error && (
        <div className="px-4 py-3" style={{ background:'rgba(192,57,43,0.08)', borderLeft:'2px solid #C0392B' }}>
          <p className="font-body text-xs text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex-1 h-12">Indietro</button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="btn-primary flex-1 h-12 flex items-center justify-center gap-2"
        >
          {loading && <div className="w-4 h-4 border border-text/50 border-t-text rounded-full animate-spin"/>}
          {loading ? 'Prenotando…' : 'Conferma'}
        </button>
      </div>
    </div>
  )
}
