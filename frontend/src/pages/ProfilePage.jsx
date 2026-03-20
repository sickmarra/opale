import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { format, parseISO, getDay } from 'date-fns'
import { it } from 'date-fns/locale'
import { bookingsApi, servicesApi } from '../api'
import { useAuth } from '../context/AuthContext'

/* ── Booking Card ─────────────────────────────────────────────────────── */
function BookingCard({ booking, allServices, onDelete, onEdit }) {
  const [confirmDel, setConfirmDel] = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const date    = parseISO(booking.date)
  const isPast  = date < new Date()
  const dur     = booking.end_hour - booking.start_hour

  async function del() {
    setDeleting(true)
    try { await onDelete(booking.id) }
    finally { setDeleting(false); setConfirmDel(false) }
  }

  return (
    <div
      className="card space-y-3 animate-slide-up"
      style={{ opacity: isPast ? 0.55 : 1, borderLeft: isPast ? undefined : '2px solid rgba(200,90,30,0.35)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-body text-[9px] text-muted tracking-[0.22em] uppercase mb-1">
            {isPast ? 'Passata' : 'Confermata'} · #{booking.id}
          </p>
          <h3 className="font-heading text-lg font-light text-text capitalize">
            {format(date, "EEEE d MMM", { locale: it })}
          </h3>
          <p className="font-body text-sm text-muted mt-0.5">
            {booking.start_hour}:00 – {booking.end_hour}:00
            <span className="ml-1 text-[10px]">({dur}h)</span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-heading text-2xl font-light" style={{ color:'#C85A1E' }}>€{booking.total_price}</p>
          <p className="font-body text-[9px] text-muted tracking-wide">{[0,6].includes(getDay(date)) ? 'weekend' : 'feriale'}</p>
        </div>
      </div>

      {booking.services?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {booking.services.map(s => (
            <span key={s.id} className="font-body text-[9px] text-muted px-2 py-1 tracking-wide"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
              {s.name}
            </span>
          ))}
        </div>
      )}

      {booking.notes && (
        <p className="font-body text-xs text-muted italic leading-relaxed">"{booking.notes}"</p>
      )}

      {!isPast && (
        <div className="flex gap-2 pt-1" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => onEdit(booking)} className="btn-secondary flex-1 h-9 text-xs">Modifica</button>
          {confirmDel ? (
            <>
              <button onClick={() => setConfirmDel(false)} className="btn-secondary flex-1 h-9 text-xs">Annulla</button>
              <button onClick={del} disabled={deleting} className="btn-danger flex-1 h-9 text-xs flex items-center justify-center">
                {deleting ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin"/> : 'Elimina'}
              </button>
            </>
          ) : (
            <button onClick={() => setConfirmDel(true)} className="btn-danger flex-1 h-9 text-xs">Elimina</button>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Edit Modal ───────────────────────────────────────────────────────── */
function EditModal({ booking, allServices, onSave, onClose }) {
  const [startHour, setStartHour] = useState(booking.start_hour)
  const [endHour, setEndHour]     = useState(booking.end_hour)
  const [selIds, setSelIds]       = useState(booking.services?.map(s => s.id) || [])
  const [notes, setNotes]         = useState(booking.notes || '')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const hours = Array.from({ length: 15 }, (_, i) => 8 + i)

  async function save() {
    if (startHour >= endHour) { setError("L'inizio deve essere prima della fine"); return }
    setSaving(true)
    try { await onSave(booking.id, { start_hour: startHour, end_hour: endHour, service_ids: selIds, notes }); onClose() }
    catch (e) { setError(e.response?.data?.error || 'Errore') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)' }}>
      <div className="w-full max-w-sm space-y-4 animate-slide-up max-h-[90dvh] overflow-y-auto"
        style={{ background:'#111', border:'1px solid rgba(255,255,255,0.1)', padding:'1.5rem' }}>

        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-light text-text">Modifica</h2>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && <div className="px-3 py-2.5" style={{ background:'rgba(192,57,43,0.08)', borderLeft:'2px solid #C0392B' }}>
          <p className="font-body text-xs text-red-400">{error}</p>
        </div>}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Inizio</label>
            <select value={startHour} onChange={e => setStartHour(Number(e.target.value))} className="input-field">
              {hours.map(h => <option key={h} value={h}>{h}:00</option>)}
            </select>
          </div>
          <div>
            <label className="label">Fine</label>
            <select value={endHour} onChange={e => setEndHour(Number(e.target.value))} className="input-field">
              {hours.filter(h => h > startHour).map(h => <option key={h} value={h+1}>{h+1}:00</option>)}
            </select>
          </div>
        </div>

        {allServices.length > 0 && (
          <div>
            <label className="label">Servizi extra</label>
            <div className="space-y-1.5">
              {allServices.map(s => (
                <label key={s.id} className="flex items-center gap-3 py-2.5 px-3 cursor-pointer transition-all"
                  style={{ background: selIds.includes(s.id) ? 'rgba(200,90,30,0.07)' : 'rgba(255,255,255,0.03)',
                           border: '1px solid ' + (selIds.includes(s.id) ? 'rgba(200,90,30,0.25)' : 'rgba(255,255,255,0.07)') }}>
                  <input type="checkbox" checked={selIds.includes(s.id)}
                    onChange={e => setSelIds(p => e.target.checked ? [...p,s.id] : p.filter(i => i !== s.id))}
                    className="accent-primary w-3.5 h-3.5"/>
                  <span className="font-body text-sm text-text flex-1">{s.name}</span>
                  <span className="font-body text-sm text-muted">€{s.price}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="label">Note</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field" rows={2} placeholder="Note..." />
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

/* ── Delete Account Modal ─────────────────────────────────────────────── */
function DeleteAccountModal({ userEmail, onClose, onDeleted }) {
  const [confirmEmail, setConfirmEmail] = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const { deleteAccount } = useAuth()

  async function handleDelete() {
    if (!confirmEmail) { setError('Inserisci la tua email per confermare'); return }
    setLoading(true)
    setError('')
    try {
      await deleteAccount(confirmEmail)
      onDeleted()
    } catch (err) {
      setError(err.response?.data?.error || 'Errore durante l\'eliminazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm animate-slide-up"
        style={{ background: '#111', border: '1px solid rgba(192,57,43,0.3)', padding: '1.5rem' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-light text-text">Elimina account</h2>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <p className="font-body text-xs text-muted leading-relaxed mb-4">
          Questa azione è <strong className="text-text">irreversibile</strong>. Verranno eliminati il tuo account e tutte le prenotazioni associate, in conformità con il tuo diritto all'oblio (GDPR art. 17).
        </p>

        <div className="mb-4 px-3 py-2.5" style={{ background: 'rgba(192,57,43,0.06)', borderLeft: '2px solid rgba(192,57,43,0.4)' }}>
          <p className="font-body text-[10px] text-muted tracking-widest uppercase mb-1">Conferma con la tua email</p>
          <p className="font-body text-xs text-text break-all">{userEmail}</p>
        </div>

        <input
          type="email"
          value={confirmEmail}
          onChange={e => setConfirmEmail(e.target.value)}
          placeholder="Inserisci la tua email"
          className="input-field mb-3"
          autoComplete="off"
        />

        {error && (
          <div className="px-3 py-2 mb-3" style={{ background: 'rgba(192,57,43,0.08)', borderLeft: '2px solid #C0392B' }}>
            <p className="font-body text-xs text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 h-10 text-xs">Annulla</button>
          <button
            onClick={handleDelete}
            disabled={loading || confirmEmail.toLowerCase() !== userEmail?.toLowerCase()}
            className="flex-1 h-10 font-body text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2"
            style={{
              background: confirmEmail.toLowerCase() === userEmail?.toLowerCase() ? 'rgba(192,57,43,0.8)' : 'rgba(192,57,43,0.2)',
              color: confirmEmail.toLowerCase() === userEmail?.toLowerCase() ? '#fff' : 'rgba(255,255,255,0.3)',
              border: '1px solid rgba(192,57,43,0.4)',
            }}>
            {loading
              ? <div className="w-4 h-4 border border-white/40 border-t-white rounded-full animate-spin"/>
              : 'Elimina tutto'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Profile Page ─────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings]             = useState([])
  const [allServices, setAllServices]       = useState([])
  const [loading, setLoading]               = useState(true)
  const [editingBooking, setEditingBooking] = useState(null)
  const [filter, setFilter]                 = useState('upcoming')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    Promise.all([bookingsApi.getAll(), servicesApi.getAll()])
      .then(([b, s]) => { setBookings(b.data); setAllServices(s.data) })
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  async function handleDelete(id) {
    await bookingsApi.delete(id)
    setBookings(p => p.filter(b => b.id !== id))
  }
  async function handleEdit(id, data) {
    const r = await bookingsApi.update(id, data)
    setBookings(p => p.map(b => b.id === id ? { ...r.data, services: r.data.services || [] } : b))
  }

  const today    = new Date().toISOString().split('T')[0]
  const upcoming = bookings.filter(b => b.date >= today).sort((a,b) => a.date.localeCompare(b.date))
  const past     = bookings.filter(b => b.date < today).sort((a,b) => b.date.localeCompare(a.date))
  const displayed = filter === 'upcoming' ? upcoming : past

  return (
    <main className="page-container space-y-6 animate-fade-in">
      {editingBooking && (
        <EditModal booking={editingBooking} allServices={allServices} onSave={handleEdit} onClose={() => setEditingBooking(null)} />
      )}
      {showDeleteModal && (
        <DeleteAccountModal
          userEmail={user?.email}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => navigate('/', { replace: true })}
        />
      )}

      {/* Header */}
      <header className="pt-2">
        <p className="font-body text-[9px] text-muted tracking-[0.28em] uppercase mb-1">Il tuo account</p>
        <h1 className="font-heading text-4xl font-light text-text leading-tight mb-2">
          il tuo<span style={{ color: '#C85A1E' }}>.</span><br/>profilo
        </h1>
        <p className="font-body text-xs text-muted mb-1">{user?.full_name}</p>
        <p className="font-body text-xs text-muted mt-1">{user?.email}</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { val: upcoming.length, label: 'Prossime' },
          { val: past.length,     label: 'Passate' },
          { val: `€${bookings.reduce((s,b) => s+b.total_price,0)}`, label: 'Speso', highlight: true },
        ].map(({ val, label, highlight }) => (
          <div key={label} className="card text-center py-4 space-y-0.5">
            <p className="font-heading text-2xl font-light" style={{ color: highlight ? '#C85A1E' : '#F5F0E8' }}>{val}</p>
            <p className="font-body text-[9px] text-muted tracking-[0.2em] uppercase">{label}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button onClick={() => navigate('/prenota')} className="btn-primary w-full h-12">
        + Nuova prenotazione
      </button>

      {/* Tabs */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <p className="section-title">Prenotazioni</p>
          <div className="hairline flex-1"/>
        </div>
        <div className="flex gap-1 p-1" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
          {['upcoming','past'].map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              className="flex-1 py-2 font-body text-xs tracking-[0.1em] uppercase transition-all duration-200"
              style={{
                background: filter === tab ? '#C85A1E' : 'transparent',
                color: filter === tab ? '#F5F0E8' : '#7A7268',
              }}>
              {tab === 'upcoming' ? `Prossime (${upcoming.length})` : `Passate (${past.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border border-primary border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : displayed.length === 0 ? (
        <div className="card text-center py-12">
          <p className="font-body text-sm text-muted">
            {filter === 'upcoming' ? 'Nessuna prenotazione futura' : 'Nessuna prenotazione passata'}
          </p>
          {filter === 'upcoming' && (
            <button onClick={() => navigate('/prenota')} className="font-body text-xs mt-3 tracking-widest uppercase"
              style={{ color:'#C85A1E' }}>
              Prenota ora →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(b => (
            <BookingCard key={b.id} booking={b} allServices={allServices} onDelete={handleDelete} onEdit={setEditingBooking} />
          ))}
        </div>
      )}

      {/* Logout */}
      <button onClick={logout}
        className="w-full py-3 font-body text-xs text-muted hover:text-text transition-colors flex items-center justify-center gap-2 tracking-widest uppercase">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Esci
      </button>

      {/* Zona privacy / GDPR */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
        <p className="font-body text-[9px] text-muted tracking-[0.28em] uppercase mb-3">Privacy & Dati</p>
        <div className="space-y-2">
          <Link to="/privacy" className="flex items-center gap-2 font-body text-xs text-muted hover:text-text transition-colors tracking-wide">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Privacy Policy
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 font-body text-xs transition-colors tracking-wide"
            style={{ color: 'rgba(192,57,43,0.7)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#C0392B'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(192,57,43,0.7)'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            Elimina il mio account (diritto all'oblio)
          </button>
        </div>
      </div>
    </main>
  )
}
