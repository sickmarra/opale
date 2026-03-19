import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api'
import Logo from '../components/Logo'

function passwordStrength(pw) {
  if (!pw) return { level: 0, label: '' }
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { level: 1, label: 'Debole', color: '#C0392B' }
  if (score <= 2) return { level: 2, label: 'Discreta', color: '#E67E22' }
  if (score <= 3) return { level: 3, label: 'Buona', color: '#F1C40F' }
  return { level: 4, label: 'Ottima', color: '#3CB371' }
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  const strength = passwordStrength(password)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) {
      return setError('Le password non coincidono')
    }
    setError('')
    setLoading(true)
    try {
      await authApi.resetPassword({ token, password })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nel reset della password')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-dvh bg-[#080808] flex flex-col items-center justify-center px-6">
        <div className="max-w-sm text-center space-y-4">
          <p className="font-body text-sm text-muted">Link non valido o mancante.</p>
          <Link to="/recupera-password" className="btn-primary inline-flex items-center justify-center px-6 h-11">
            Richiedi nuovo link
          </Link>
        </div>
      </div>
    )
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
              Nuova password
            </p>
            <h1
              className="font-heading font-light leading-[0.9] text-text mb-2"
              style={{ fontSize: 'clamp(3rem, 12vw, 4.5rem)', letterSpacing: '-0.01em' }}
            >
              reimposta<span style={{ color: '#C85A1E' }}>.</span>
            </h1>
          </div>

          {done ? (
            <div className="animate-slide-up space-y-5">
              <div
                className="flex items-start gap-3 px-4 py-4"
                style={{ background: 'rgba(26,92,71,0.08)', borderLeft: '2px solid rgba(60,179,113,0.4)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#3CB371" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <div>
                  <p className="font-body text-sm text-text mb-1">Password aggiornata</p>
                  <p className="font-body text-xs text-muted leading-relaxed">
                    Puoi ora accedere con la tua nuova password.
                  </p>
                </div>
              </div>
              <button onClick={() => navigate('/login')} className="btn-primary w-full h-12 flex items-center justify-center">
                Vai al login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 w-full animate-slide-up-d1">

              {error && (
                <div
                  className="px-4 py-3"
                  style={{ background: 'rgba(192,57,43,0.08)', borderLeft: '2px solid #C0392B' }}
                >
                  <p className="font-body text-xs text-red-400 tracking-wide">{error}</p>
                </div>
              )}

              <div className="animate-slide-up-d2">
                <label className="label">Nuova password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                    tabIndex={-1}
                  >
                    {showPw
                      ? <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {password && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1,2,3,4].map(i => (
                        <div
                          key={i}
                          className="h-0.5 flex-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength.level ? strength.color : 'rgba(255,255,255,0.08)' }}
                        />
                      ))}
                    </div>
                    <span className="font-body text-[10px] tracking-wide" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="animate-slide-up-d3">
                <label className="label">Conferma password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="pt-2 animate-slide-up-d4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-3 h-12"
                >
                  {loading
                    ? <div className="w-4 h-4 border border-text/50 border-t-text rounded-full animate-spin" />
                    : 'Aggiorna password'
                  }
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <div
        className="fixed bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(200,90,30,0.4) 50%, transparent)' }}
      />
    </div>
  )
}
