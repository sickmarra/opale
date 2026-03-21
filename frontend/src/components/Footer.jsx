import { Link } from 'react-router-dom'

export default function Footer({ minimal = false }) {
  const year = new Date().getFullYear()

  if (minimal) {
    return (
      <footer className="relative z-10 py-6 px-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link to="/privacy" className="font-body text-[10px] text-muted hover:text-text transition-colors tracking-widest uppercase">Privacy Policy</Link>
          <span className="text-muted/30 text-[10px]">·</span>
          <Link to="/cookie" className="font-body text-[10px] text-muted hover:text-text transition-colors tracking-widest uppercase">Cookie Policy</Link>
          <span className="text-muted/30 text-[10px]">·</span>
          <span className="font-body text-[10px] text-muted/40 tracking-wide">© {year} Opale Studio</span>
        </div>
      </footer>
    )
  }

  return (
    <footer className="relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Main footer content */}
      <div className="px-6 py-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <span
              className="font-heading font-light text-text"
              style={{ fontSize: '1.6rem', letterSpacing: '-0.01em' }}
            >
              opale<span style={{ color: '#C85A1E' }}>.</span>
            </span>
            <p className="font-body text-xs text-muted mt-3 leading-relaxed max-w-[220px]">
              Sala pose fotografica professionale. Prenota il tuo spazio creativo.
            </p>
            <p className="font-body text-[10px] text-muted/50 mt-3 tracking-wide">
              P.IVA 12345678901
            </p>
          </div>

          {/* Contatti */}
          <div>
            <p className="font-body text-[10px] text-muted tracking-[0.25em] uppercase mb-4">Contatti</p>
            <div className="space-y-2.5">
              <a
                  href="mailto:info.abfotografiapubblicitaria@gmail.com"
                  className="flex items-center gap-2 font-body text-xs text-muted hover:text-text transition-colors group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 group-hover:text-[#C85A1E] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                info.abfotografiapubblicitaria@gmail.com
              </a>
              <a
                href="tel:+390000000000"
                className="flex items-center gap-2 font-body text-xs text-muted hover:text-text transition-colors group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 group-hover:text-[#C85A1E] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                +39 000 000 0000
              </a>
              <div className="flex items-start gap-2 font-body text-xs text-muted">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Via Example 1, 00100 Roma, IT
              </div>
            </div>
          </div>

          {/* Link legali */}
          <div>
            <p className="font-body text-[10px] text-muted tracking-[0.25em] uppercase mb-4">Legale</p>
            <div className="space-y-2.5">
              <Link to="/privacy" className="block font-body text-xs text-muted hover:text-text transition-colors">
                Privacy Policy
              </Link>
              <Link to="/cookie" className="block font-body text-xs text-muted hover:text-text transition-colors">
                Cookie Policy
              </Link>
              <a
                href="https://www.iubenda.com/it/gdpr"
                target="_blank"
                rel="noopener noreferrer"
                className="block font-body text-xs text-muted hover:text-text transition-colors"
              >
                GDPR
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="px-6 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-body text-[10px] text-muted/40 tracking-wide">
            © {year} Opale Studio. Tutti i diritti riservati.
          </p>
          <p className="font-body text-[10px] text-muted/30 tracking-wide">
            Made with care by{' '}
            <span className="text-muted/50 hover:text-muted transition-colors cursor-default">sickmarra</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
