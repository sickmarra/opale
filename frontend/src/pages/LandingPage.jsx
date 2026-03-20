import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-dvh relative overflow-x-hidden bg-[#050505] flex flex-col">

      {/* ── Animated ambient light ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: '60vw', height: '60vw', maxWidth: 600, maxHeight: 600,
            background: 'radial-gradient(circle, rgba(200,90,30,0.18) 0%, transparent 60%)',
            top: '0%', left: '50%', transform: 'translate(-50%, -50%)',
            filter: 'blur(80px)',
            animation: 'pulse 8s ease-in-out infinite alternate',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '50vw', height: '50vw', maxWidth: 500, maxHeight: 500,
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%)',
            bottom: '-10%', right: '-10%',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="z-10 mb-12 animate-fade-in">
          <Logo size="xl" />
        </div>

        <div className="z-10 animate-slide-up">
          <h1
            className="font-heading font-bold text-text leading-[0.9] mb-6 drop-shadow-2xl"
            style={{ fontSize: 'clamp(4.5rem, 16vw, 9rem)', letterSpacing: '-0.03em' }}
          >
            il tuo<span style={{ color: '#C85A1E' }}>.</span><br className="sm:hidden" />spazio
          </h1>
          <p className="font-body text-muted text-base sm:text-lg max-w-md mx-auto mb-12 px-4">
            Esplora, prenota e crea. Il tuo studio fotografico professionale a portata di click, senza compromessi.
          </p>
        </div>

        <div className="z-10 flex flex-col sm:flex-row gap-4 w-full max-w-md animate-slide-up-d2">
          <Link to="/login" className="btn-primary w-full text-center flex items-center justify-center text-[15px] py-4 rounded-[100px] shadow-lg shadow-primary/20">
            Accedi
          </Link>
          <Link to="/register" className="btn-secondary w-full text-center flex items-center justify-center text-[15px] py-4 rounded-[100px] border-white/10 hover:border-white/30 bg-white/5">
            Registrati
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
