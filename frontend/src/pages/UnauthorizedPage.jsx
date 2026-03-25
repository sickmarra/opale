import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-bg bg-opale-gradient flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-sm">
        <Logo />

        <div className="space-y-1 pt-4">
          <p className="font-body text-[9px] text-muted tracking-[0.25em] uppercase">Accesso negato</p>
          <h1 className="font-heading text-6xl font-light text-text">403</h1>
          <p className="font-body text-sm text-muted leading-relaxed pt-1">
            Non hai i permessi necessari per visualizzare questa pagina.
          </p>
        </div>

        <div
          className="w-full h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }}
        />

        <button
          onClick={() => navigate('/', { replace: true })}
          className="btn-primary w-full h-12 flex items-center justify-center"
        >
          Torna alla home
        </button>
      </div>
    </div>
  )
}
