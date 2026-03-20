import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const { verifyEmail } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setErrorMsg('Link non valido.')
      return
    }

    verifyEmail(token)
      .then(() => {
        setStatus('success')
        setTimeout(() => navigate('/', { replace: true }), 2500)
      })
      .catch(err => {
        setStatus('error')
        setErrorMsg(err.response?.data?.error || 'Link non valido o scaduto.')
      })
  }, [])

  return (
    <div className="min-h-dvh relative overflow-hidden bg-[#080808] flex flex-col">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute rounded-full" style={{
          width:'60vw', height:'60vw', maxWidth:520, maxHeight:520,
          background:'radial-gradient(circle, rgba(200,90,30,0.2) 0%, transparent 70%)',
          top:'-12%', left:'-18%', filter:'blur(70px)',
          animation:'orbDrift1 14s ease-in-out infinite',
        }}/>
        <div className="absolute rounded-full" style={{
          width:'45vw', height:'45vw', maxWidth:380, maxHeight:380,
          background:'radial-gradient(circle, rgba(26,92,71,0.16) 0%, transparent 70%)',
          bottom:'0%', right:'-12%', filter:'blur(80px)',
          animation:'orbDrift2 18s ease-in-out infinite',
        }}/>
      </div>

      <header className="relative z-10 flex items-center px-6 pt-8 pb-4 animate-fade-in">
        <Logo size="sm" />
      </header>

      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 pb-12">
        <div className="w-full max-w-sm text-center animate-slide-up">

          {status === 'loading' && (
            <>
              <div className="mb-8 flex justify-center">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="font-body text-[10px] text-muted tracking-[0.3em] uppercase mb-3">Un momento</p>
              <h1 className="font-heading font-light text-text" style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)', letterSpacing: '-0.01em', lineHeight: 0.95 }}>
                Verifica in corso<span style={{ color: '#C85A1E' }}>.</span>
              </h1>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,178,113,0.1)', border: '1px solid rgba(59,178,113,0.3)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#3BB271" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>
              <p className="font-body text-[10px] text-muted tracking-[0.3em] uppercase mb-3">Tutto pronto</p>
              <h1 className="font-heading font-light text-text mb-4" style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)', letterSpacing: '-0.01em', lineHeight: 0.95 }}>
                Email confermata<span style={{ color: '#C85A1E' }}>.</span>
              </h1>
              <p className="font-body text-sm text-muted">
                Benvenuto/a in Opale Studio. Stai per essere reindirizzato/a…
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
              </div>
              <p className="font-body text-[10px] text-muted tracking-[0.3em] uppercase mb-3">Attenzione</p>
              <h1 className="font-heading font-light text-text mb-4" style={{ fontSize: 'clamp(2.2rem, 9vw, 3.5rem)', letterSpacing: '-0.01em', lineHeight: 0.95 }}>
                Link non valido<span style={{ color: '#C85A1E' }}>.</span>
              </h1>
              <p className="font-body text-sm text-muted mb-8 leading-relaxed">{errorMsg}</p>
              <div className="flex flex-col gap-3 items-center">
                <Link to="/register" className="btn-primary px-8 py-3 text-sm tracking-widest uppercase">
                  Registrati di nuovo
                </Link>
                <Link to="/login" className="font-body text-xs text-muted hover:text-[#C85A1E] transition-colors tracking-widest uppercase mt-2">
                  Torna al login
                </Link>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  )
}
