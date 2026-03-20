import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import Logo from '../components/Logo'

function PasswordBar({ password }) {
  function score(pw) {
    if (!pw) return 0
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }
  const s = score(password)
  const labels = ['', 'Debole', 'Discreta', 'Buona', 'Forte']
  const colors = ['', '#E05D4A', '#D4902A', '#5B9BD4', '#3CB371']
  if (!password) return null
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div
            key={i}
            className="flex-1 h-0.5 transition-all duration-500"
            style={{ background: i <= s ? colors[s] : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>
      <p className="font-body text-[10px] tracking-widest uppercase" style={{ color: s > 0 ? colors[s] : 'transparent' }}>
        {labels[s]}
      </p>
    </div>
  )
}

export default function RegisterPage() {
  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) { setError('Password di almeno 6 caratteri'); return }
    setError('')
    setLoading(true)
    try {
      await register(email, password, fullName)
      setEmailSent(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle(credentialResponse.credential)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Autenticazione con Google fallita')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Accesso con Google fallito')
  }

  if (emailSent) {
    return (
      <div className="min-h-dvh relative overflow-hidden bg-[#080808] flex flex-col items-center justify-center px-6">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute rounded-full" style={{
            width:'55vw', height:'55vw', maxWidth:460, maxHeight:460,
            background:'radial-gradient(circle, rgba(200,90,30,0.18) 0%, transparent 70%)',
            top:'-8%', right:'-15%', filter:'blur(80px)',
          }}/>
        </div>
        <div className="relative z-10 w-full max-w-sm text-center animate-slide-up">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(200,90,30,0.12)', border: '1px solid rgba(200,90,30,0.3)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#C85A1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
          </div>
          <p className="font-body text-[10px] text-muted tracking-[0.3em] uppercase mb-3">Quasi fatto</p>
          <h1 className="font-heading font-light text-text mb-4" style={{ fontSize: 'clamp(2.2rem, 9vw, 3.5rem)', letterSpacing: '-0.01em', lineHeight: 0.95 }}>
            Controlla<br/>la tua email<span style={{ color: '#C85A1E' }}>.</span>
          </h1>
          <p className="font-body text-sm text-muted leading-relaxed mb-2">
            Ti abbiamo inviato un link di conferma a
          </p>
          <p className="font-body text-sm text-text mb-6 break-all">{email}</p>
          <p className="font-body text-xs text-muted leading-relaxed mb-8">
            Clicca sul link nell'email per attivare il tuo account. Controlla anche la cartella spam.
          </p>
          <Link to="/login" className="font-body text-xs text-muted hover:text-[#C85A1E] transition-colors tracking-widest uppercase">
            Torna al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh relative overflow-hidden bg-[#080808] flex flex-col">

      {/* Ambient light */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute rounded-full" style={{
          width:'55vw', height:'55vw', maxWidth:460, maxHeight:460,
          background:'radial-gradient(circle, rgba(26,92,71,0.18) 0%, transparent 70%)',
          top:'-8%', right:'-15%', filter:'blur(80px)',
          animation:'orbDrift2 16s ease-in-out infinite',
        }}/>
        <div className="absolute rounded-full" style={{
          width:'40vw', height:'40vw', maxWidth:340, maxHeight:340,
          background:'radial-gradient(circle, rgba(200,90,30,0.16) 0%, transparent 70%)',
          bottom:'5%', left:'-10%', filter:'blur(70px)',
          animation:'orbDrift1 12s ease-in-out infinite',
        }}/>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-8 pb-4 animate-fade-in">
        <Logo size="sm" />
        <Link to="/login" className="font-body text-xs text-muted hover:text-text transition-colors tracking-widest uppercase">
          Accedi
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 pb-12">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="mb-8 animate-slide-up sm:text-center">
            <p className="font-body text-[10px] text-muted tracking-[0.3em] uppercase mb-3">
              Nuovo account
            </p>
            <h1
              className="font-heading font-light leading-[0.9] text-text mb-2"
              style={{ fontSize: 'clamp(3rem, 12vw, 5.5rem)', letterSpacing: '-0.01em' }}
            >
              il tuo<span style={{ color: '#C85A1E' }}>.</span><br className="sm:hidden" />
              spazio
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 w-full">

          {error && (
            <div className="px-4 py-3 animate-slide-up" style={{ background:'rgba(192,57,43,0.08)', borderLeft:'2px solid #C0392B' }}>
              <p className="font-body text-xs text-red-400 tracking-wide">{error}</p>
            </div>
          )}

          <div className="animate-slide-up-d1">
            <label className="label">Nome completo</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              className="input-field" placeholder="Mario Rossi" required autoComplete="name"/>
          </div>

          <div className="animate-slide-up-d2">
            <label className="label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input-field" placeholder="tu@email.com" required autoComplete="email"/>
          </div>

          <div className="animate-slide-up-d3">
            <label className="label">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field pr-10" placeholder="Min. 6 caratteri"
                required autoComplete="new-password"/>
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors" tabIndex={-1}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <PasswordBar password={password} />
          </div>

          <div className="pt-2 animate-slide-up-d4 flex flex-col gap-4">
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3 h-12">
              {loading
                ? <div className="w-4 h-4 border border-text/50 border-t-text rounded-full animate-spin"/>
                : 'Crea account'
              }
            </button>
            <div className="flex items-center gap-3 py-2">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-xs text-muted font-body tracking-wider uppercase">Oppure</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
              />
            </div>
          </div>
        </form>

        <p className="mt-8 font-body text-xs text-muted tracking-wide animate-slide-up-d4 sm:text-center">
          Hai già un account?{' '}
          <Link to="/login" className="text-[#C85A1E] hover:underline underline-offset-4">Accedi</Link>
        </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-px"
        style={{ background:'linear-gradient(90deg, transparent, rgba(26,92,71,0.5) 50%, transparent)' }}/>
    </div>
  )
}
