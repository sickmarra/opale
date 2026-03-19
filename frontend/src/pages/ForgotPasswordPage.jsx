import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api'
import Logo from '../components/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.forgotPassword({ email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nell\'invio dell\'email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh relative overflow-hidden bg-[#080808] flex flex-col">

      {/* Ambient light */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: '60vw', height: '60vw', maxWidth: 520, maxHeight: 520,
            background: 'radial-gradient(circle, rgba(200,90,30,0.18) 0%, transparent 70%)',
            top: '-12%', left: '-18%',
            filter: 'blur(70px)',
            animation: 'orbDrift1 14s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '45vw', height: '45vw', maxWidth: 380, maxHeight: 380,
            background: 'radial-gradient(circle, rgba(26,92,71,0.14) 0%, transparent 70%)',
            bottom: '0%', right: '-12%',
            filter: 'blur(80px)',
            animation: 'orbDrift2 18s ease-in-out infinite',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-8 pb-4 animate-fade-in">
        <Logo size="sm" />
        <Link to="/login" className="font-body text-xs text-muted hover:text-text transition-colors tracking-widest uppercase">
          Accedi
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 pb-12">
        <div className="w-full max-w-sm sm:max-w-md">

          <div className="mb-10 animate-slide-up sm:text-center">
            <p className="font-body text-[10px] text-muted tracking-[0.3em] uppercase mb-3">
              Recupero accesso
            </p>
            <h1
              className="font-heading font-light leading-[0.9] text-text mb-2"
              style={{ fontSize: 'clamp(3rem, 12vw, 4.5rem)', letterSpacing: '-0.01em' }}
            >
              password<span style={{ color: '#C85A1E' }}>.</span>
            </h1>
          </div>

          {sent ? (
            <div className="animate-slide-up space-y-5">
              <div
                className="flex items-start gap-3 px-4 py-4"
                style={{ background: 'rgba(26,92,71,0.08)', borderLeft: '2px solid rgba(60,179,113,0.4)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#3CB371" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <div>
                  <p className="font-body text-sm text-text mb-1">Email inviata</p>
                  <p className="font-body text-xs text-muted leading-relaxed">
                    Controlla la tua casella email. Il link per reimpostare la password è valido per <strong className="text-text">1 ora</strong>.
                  </p>
                </div>
              </div>
              <Link to="/login" className="btn-secondary w-full h-12 flex items-center justify-center">
                Torna al login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 w-full animate-slide-up-d1">
              <p className="font-body text-sm text-muted leading-relaxed animate-slide-up">
                Inserisci l'email del tuo account e ti invieremo un link per reimpostare la password.
              </p>

              {error && (
                <div
                  className="px-4 py-3"
                  style={{ background: 'rgba(192,57,43,0.08)', borderLeft: '2px solid #C0392B' }}
                >
                  <p className="font-body text-xs text-red-400 tracking-wide">{error}</p>
                </div>
              )}

              <div className="animate-slide-up-d2">
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="pt-2 animate-slide-up-d3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-3 h-12"
                >
                  {loading
                    ? <div className="w-4 h-4 border border-text/50 border-t-text rounded-full animate-spin" />
                    : 'Invia link di recupero'
                  }
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 font-body text-xs text-muted tracking-wide animate-slide-up-d4 sm:text-center">
            Ricordi la password?{' '}
            <Link to="/login" className="text-[#C85A1E] hover:underline underline-offset-4">
              Accedi
            </Link>
          </p>
        </div>
      </main>

      <div
        className="fixed bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(200,90,30,0.4) 50%, transparent)' }}
      />
    </div>
  )
}
