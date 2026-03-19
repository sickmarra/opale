import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const COOKIE_KEY = 'opale_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY)
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(COOKIE_KEY, 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(COOKIE_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5"
      style={{ background: 'rgba(10,10,10,0.97)', borderTop: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0 text-[#C85A1E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="font-body text-xs text-muted leading-relaxed">
            Utilizziamo cookie tecnici essenziali per il funzionamento del sito. Leggi la nostra{' '}
            <Link to="/cookie" className="text-text hover:text-[#C85A1E] transition-colors underline underline-offset-2">
              Cookie Policy
            </Link>{' '}
            e la{' '}
            <Link to="/privacy" className="text-text hover:text-[#C85A1E] transition-colors underline underline-offset-2">
              Privacy Policy
            </Link>.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={decline}
            className="flex-1 sm:flex-none font-body text-xs text-muted hover:text-text transition-colors px-4 py-2.5 tracking-widest uppercase"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Rifiuta
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none font-body text-xs tracking-widest uppercase px-5 py-2.5"
            style={{ background: '#C85A1E', color: '#ffffff' }}
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  )
}
