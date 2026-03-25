import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { bookingsApi, servicesApi } from '../api'

/* ── Admin Booking Card ───────────────────────────────────────────────── */
function AdminBookingCard({ booking, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const date = parseISO(booking.date)
  const dur  = booking.end_hour - booking.start_hour

  async function del() {
    setDeleting(true); try { await onDelete(booking.id) } finally { setDeleting(false) }
  }

  return (
    <div className="card space-y-2.5 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-body text-[9px] text-muted tracking-[0.22em] uppercase mb-1">#{booking.id}</p>
          <h3 className="font-heading text-base font-light text-text capitalize">
            {format(date, "EEE d MMM", { locale: it })}
          </h3>
          <p className="font-body text-sm text-muted">
            {booking.start_hour}:00 – {booking.end_hour}:00 · {dur}h
          </p>
        </div>
        <p className="font-heading text-2xl font-light" style={{ color:'#C85A1E' }}>€{booking.total_price}</p>
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5 px-3 py-2"
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-7 h-7 flex items-center justify-center flex-shrink-0"
          style={{ background:'rgba(200,90,30,0.15)', border:'1px solid rgba(200,90,30,0.25)' }}>
          <span className="font-heading text-sm font-light" style={{ color:'#C85A1E' }}>
            {booking.user_name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-body text-xs text-text font-medium">{booking.user_name}</p>
          <p className="font-body text-[10px] text-muted">{booking.user_email}</p>
        </div>
      </div>

      {booking.services?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {booking.services.map(s => (
            <span key={s.id} className="font-body text-[9px] text-muted px-2 py-1 tracking-wide"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
              {s.name}
            </span>
          ))}
        </div>
      )}
      {booking.notes && <p className="font-body text-xs text-muted italic">"{booking.notes}"</p>}

      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }} className="pt-2">
        {confirmDel ? (
          <div className="flex gap-2">
            <button onClick={() => setConfirmDel(false)} className="btn-secondary flex-1 h-9 text-xs">Annulla</button>
            <button onClick={del} disabled={deleting} className="btn-danger flex-1 h-9 text-xs flex items-center justify-center">
              {deleting ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin"/> : 'Elimina'}
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDel(true)}
            className="w-full font-body text-xs py-1.5 tracking-widest uppercase transition-colors"
            style={{ color:'rgba(192,57,43,0.6)' }}>
            Elimina prenotazione
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Service Modal ────────────────────────────────────────────────────── */
function ServiceModal({ service, onSave, onClose }) {
  const [name, setName]   = useState(service?.name || '')
  const [desc, setDesc]   = useState(service?.description || '')
  const [price, setPrice] = useState(service?.price || '')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  async function save() {
    if (!name.trim()) { setError('Nome obbligatorio'); return }
    const p = parseFloat(price)
    if (isNaN(p) || p < 0) { setError('Prezzo non valido'); return }
    setSaving(true)
    try { await onSave({ name: name.trim(), description: desc.trim(), price: p }); onClose() }
    catch (e) { setError(e.response?.data?.error || 'Errore') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)' }}>
      <div className="w-full max-w-sm space-y-4 animate-slide-up"
        style={{ background:'#111', border:'1px solid rgba(255,255,255,0.1)', padding:'1.5rem' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-light text-text">{service ? 'Modifica servizio' : 'Nuovo servizio'}</h2>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {error && <div className="px-3 py-2.5" style={{ background:'rgba(192,57,43,0.08)', borderLeft:'2px solid #C0392B' }}>
          <p className="font-body text-xs text-red-400">{error}</p>
        </div>}
        <div>
          <label className="label">Nome</label>
          <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Es. Make-up Artist"/>
        </div>
        <div>
          <label className="label">Descrizione</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} className="input-field" rows={2} placeholder="Breve descrizione..."/>
        </div>
        <div>
          <label className="label">Prezzo (€)</label>
          <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="input-field" placeholder="50"/>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 h-11">Annulla</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1 h-11 flex items-center justify-center gap-2">
            {saving && <div className="w-4 h-4 border border-text/50 border-t-text rounded-full animate-spin"/>}
            {saving ? 'Salvo…' : 'Salva'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Admin Page ───────────────────────────────────────────────────────── */
export default function AdminPage() {
  const [tab, setTab]           = useState('bookings')
  const [bookings, setBookings] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)
  const [search, setSearch]     = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    Promise.all([bookingsApi.getAll(), servicesApi.getAll()])
      .then(([b, s]) => { setBookings(b.data); setServices(s.data) })
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  async function delBooking(id)   { await bookingsApi.delete(id); setBookings(p => p.filter(b => b.id !== id)) }
  async function saveService(data) {
    if (modal && modal !== 'new') {
      const r = await servicesApi.update(modal.id, data)
      setServices(p => p.map(s => s.id === modal.id ? r.data : s))
    } else {
      const r = await servicesApi.create(data); setServices(p => [...p, r.data])
    }
  }
  async function delService(id)   { await servicesApi.delete(id); setServices(p => p.filter(s => s.id !== id)) }

  const filtered = bookings.filter(b => {
    const matchSearch = !search || b.user_name?.toLowerCase().includes(search.toLowerCase()) || b.user_email?.toLowerCase().includes(search.toLowerCase())
    const matchDate   = !dateFilter || b.date === dateFilter
    return matchSearch && matchDate
  })
  const today    = new Date().toISOString().split('T')[0]
  const upcoming = filtered.filter(b => b.date >= today)
  const past     = filtered.filter(b => b.date < today)
  const revenue  = bookings.reduce((s, b) => s + b.total_price, 0)
  const todayCnt = bookings.filter(b => b.date === today).length

  return (
    <main className="page-container space-y-5 animate-fade-in">
      {modal !== null && (
        <ServiceModal service={modal === 'new' ? null : modal} onSave={saveService} onClose={() => setModal(null)} />
      )}

      {/* Header */}
      <header className="pt-2">
        <p className="font-body text-[9px] text-muted tracking-[0.28em] uppercase mb-1">Pannello</p>
        <h1 className="font-heading text-4xl font-light text-text leading-tight mb-2">
          il tuo<span style={{ color: '#C85A1E' }}>.</span><br/>admin
        </h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { val: bookings.length, label: 'Totali' },
          { val: todayCnt,        label: 'Oggi' },
          { val: `€${revenue}`,  label: 'Incasso', highlight: true },
        ].map(({ val, label, highlight }) => (
          <div key={label} className="card text-center py-4">
            <p className="font-heading text-2xl font-light" style={{ color: highlight ? '#C85A1E' : '#F5F0E8' }}>{val}</p>
            <p className="font-body text-[9px] text-muted tracking-[0.2em] uppercase mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
        {['bookings','services'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 font-body text-xs tracking-[0.12em] uppercase transition-all duration-200"
            style={{ background: tab === t ? '#C85A1E' : 'transparent', color: tab === t ? '#F5F0E8' : '#7A7268' }}>
            {t === 'bookings' ? 'Prenotazioni' : 'Servizi Extra'}
          </button>
        ))}
      </div>

      {/* BOOKINGS */}
      {tab === 'bookings' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <input value={search} onChange={e => setSearch(e.target.value)} className="input-field" placeholder="Cerca per nome o email…"/>
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="input-field"/>
            {(search || dateFilter) && (
              <button onClick={() => { setSearch(''); setDateFilter('') }}
                className="font-body text-[10px] text-muted tracking-widest uppercase">
                Azzera filtri
              </button>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border border-primary border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div className="space-y-2">
                  <p className="font-body text-[9px] text-muted tracking-[0.22em] uppercase">Prossime ({upcoming.length})</p>
                  {upcoming.map(b => <AdminBookingCard key={b.id} booking={b} onDelete={delBooking}/>)}
                </div>
              )}
              {past.length > 0 && (
                <div className="space-y-2 opacity-60">
                  <p className="font-body text-[9px] text-muted tracking-[0.22em] uppercase">Passate ({past.length})</p>
                  {past.map(b => <AdminBookingCard key={b.id} booking={b} onDelete={delBooking}/>)}
                </div>
              )}
              {filtered.length === 0 && (
                <div className="card text-center py-12">
                  <p className="font-body text-sm text-muted">Nessuna prenotazione trovata</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* SERVICES */}
      {tab === 'services' && (
        <div className="space-y-3">
          <button onClick={() => setModal('new')} className="btn-primary w-full h-12">
            + Nuovo servizio extra
          </button>
          {services.length === 0 ? (
            <div className="card text-center py-12">
              <p className="font-body text-sm text-muted">Nessun servizio extra</p>
            </div>
          ) : services.map(s => (
            <div key={s.id} className="card flex items-center gap-3 animate-slide-up">
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-text">{s.name}</p>
                {s.description && <p className="font-body text-[10px] text-muted mt-0.5 truncate">{s.description}</p>}
              </div>
              <span className="font-heading text-xl font-light flex-shrink-0" style={{ color:'#C85A1E' }}>€{s.price}</span>
              <div className="flex gap-0.5 flex-shrink-0">
                <button onClick={() => setModal(s)} className="p-2 text-muted hover:text-text transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button onClick={() => delService(s.id)} className="p-2 transition-colors"
                  style={{ color:'rgba(192,57,43,0.5)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
