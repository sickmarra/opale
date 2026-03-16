import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Carousel from '../components/Carousel'
import BookingCalendar from '../components/BookingCalendar'
import Logo from '../components/Logo'

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleDateSelect(date) {
    navigate('/prenota', { state: { selectedDate: date.toISOString() } })
  }

  return (
    <main className="page-container space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <header className="pt-2 flex items-start justify-between">
        <div>
          <p className="font-body text-[10px] text-muted tracking-[0.28em] uppercase mb-1">
            Ciao, {user?.full_name?.split(' ')[0]}
          </p>
          <Logo size="sm" />
        </div>
        <button
          onClick={logout}
          className="p-2 text-muted hover:text-text transition-colors mt-1"
          aria-label="Esci"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </header>

      {/* ── Carousel ── */}
      <div className="animate-slide-up-d1">
        <Carousel />
      </div>

      {/* ── Hero CTA ── */}
      <div className="animate-slide-up-d2 space-y-1">
        <h2
          className="font-heading font-light text-text leading-[1]"
          style={{ fontSize: 'clamp(2.4rem, 10vw, 4rem)', letterSpacing: '-0.01em' }}
        >
          Prenota la tua<br/>
          <em className="not-italic" style={{ color: '#C85A1E' }}>sessione.</em>
        </h2>
        <p className="font-body text-muted text-sm mt-2 leading-relaxed">
          Sala pose professionale disponibile<br/>tutti i giorni dalle 8:00 alle 23:00.
        </p>
      </div>

      {/* ── Pricing pills ── */}
      <div className="animate-slide-up-d2 grid grid-cols-2 gap-3">
        <div
          className="p-4 space-y-1"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <p className="font-body text-[9px] text-muted tracking-[0.25em] uppercase">Lun – Ven</p>
          <div className="flex items-baseline gap-1">
            <span className="font-heading text-4xl font-light text-text">30</span>
            <span className="font-body text-muted text-xs">€ / ora</span>
          </div>
        </div>
        <div
          className="p-4 space-y-1 relative overflow-hidden"
          style={{
            background: 'rgba(200,90,30,0.07)',
            border: '1px solid rgba(200,90,30,0.22)',
          }}
        >
          <div className="absolute top-0 right-0 w-12 h-12 rounded-full"
            style={{ background:'radial-gradient(circle, rgba(200,90,30,0.2) 0%, transparent 70%)', filter:'blur(12px)', transform:'translate(20%,-20%)' }}/>
          <p className="font-body text-[9px] text-muted tracking-[0.25em] uppercase">Sab – Dom</p>
          <div className="flex items-baseline gap-1">
            <span className="font-heading text-4xl font-light" style={{ color: '#C85A1E' }}>35</span>
            <span className="font-body text-muted text-xs">€ / ora</span>
          </div>
        </div>
      </div>

      {/* ── CTA button ── */}
      <div className="animate-slide-up-d3">
        <button
          onClick={() => navigate('/prenota')}
          className="btn-primary w-full h-14 text-base tracking-[0.2em]"
          style={{ fontSize: '0.75rem' }}
        >
          Prenota ora
        </button>
      </div>

      {/* ── Divider ── */}
      <div className="animate-slide-up-d3 flex items-center gap-4">
        <div className="hairline flex-1" />
        <p className="font-body text-[9px] text-muted tracking-[0.25em] uppercase">Disponibilità</p>
        <div className="hairline flex-1" />
      </div>

      {/* ── Calendar ── */}
      <div className="animate-slide-up-d4">
        <p className="font-body text-xs text-muted mb-3" style={{ letterSpacing: '0.04em' }}>
          Tocca un giorno per prenotare direttamente
        </p>
        <BookingCalendar onSelectDate={handleDateSelect} />
      </div>

    </main>
  )
}
