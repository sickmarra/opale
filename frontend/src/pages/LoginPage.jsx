import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Credenziali non valide')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh relative overflow-hidden bg-[#080808] flex flex-col">

      {/* ── Animated ambient light ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: '60vw', height: '60vw', maxWidth: 520, maxHeight: 520,
            background: 'radial-gradient(circle, rgba(200,90,30,0.22) 0%, transparent 70%)',
            top: '-12%', left: '-18%',
            filter: 'blur(70px)',
            animation: 'orbDrift1 14s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '45vw', height: '45vw', maxWidth: 380, maxHeight: 380,
            background: 'radial-gradient(circle, rgba(26,92,71,0.16) 0%, transparent 70%)',
            bottom: '0%', right: '-12%',
            filter: 'blur(80px)',
            animation: 'orbDrift2 18s ease-in-out infinite',
          }}
        />
      </div>

      {/* ── Header mark ── */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-8 pb-4 animate-fade-in">
        <Logo size="sm" />
        <Link to="/register" className="font-body text-xs text-muted hover:text-text transition-colors tracking-widest uppercase">
          Registrati
        </Link>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 pb-12">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Big editorial heading */}
          <div className="mb-10 animate-slide-up sm:text-center">
            <p className="font-body text-[10px] text-muted tracking-[0.3em] uppercase mb-3">
              Benvenuto/a
            </p>
            <h1
              className="font-heading font-light leading-[0.9] text-text"
              style={{ fontSize: 'clamp(3.5rem, 14vw, 5rem)', letterSpacing: '-0.01em' }}
            >
              Accedi<br className="sm:hidden" />
              <em className="not-italic sm:ml-3" style={{ color: '#C85A1E' }}>allo studio</em>
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 w-full animate-slide-up-d1">

          {error && (
            <div
              className="px-4 py-3 animate-slide-up"
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

          <div className="animate-slide-up-d3">
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="••••••••"
                required
                autoComplete="current-password"
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
          </div>

          <div className="pt-2 animate-slide-up-d4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3 h-12"
            >
              {loading
                ? <div className="w-4 h-4 border border-text/50 border-t-text rounded-full animate-spin" />
                : 'Accedi'
              }
            </button>
          </div>
        </form>

        {/* Bottom link */}
        <p className="mt-8 font-body text-xs text-muted tracking-wide animate-slide-up-d4 sm:text-center">
          Non hai un account?{' '}
          <Link to="/register" className="text-[#C85A1E] hover:underline underline-offset-4">
            Crea account
          </Link>
        </p>
        </div>
      </main>

      {/* ── Decorative bottom line ── */}
      <div
        className="fixed bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(200,90,30,0.4) 50%, transparent)' }}
      />
    </div>
  )
}
