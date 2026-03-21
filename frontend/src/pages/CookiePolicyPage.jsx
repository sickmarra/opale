import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="font-heading text-xl font-light text-text mb-3" style={{ letterSpacing: '-0.01em' }}>
        {title}
      </h2>
      <div className="space-y-3 font-body text-sm text-muted leading-relaxed">
        {children}
      </div>
    </div>
  )
}

const cookies = [
  {
    name: 'opale_token',
    tipo: 'Tecnico / Autenticazione',
    durata: '30 giorni',
    scopo: 'Mantiene la sessione utente autenticata tramite JWT',
  },
  {
    name: 'opale_user',
    tipo: 'Tecnico / Autenticazione',
    durata: '30 giorni',
    scopo: 'Dati utente in cache locale (localStorage)',
  },
  {
    name: 'opale_cookie_consent',
    tipo: 'Tecnico / Preferenze',
    durata: 'Persistente',
    scopo: 'Memorizza il consenso ai cookie dell\'utente',
  },
]

export default function CookiePolicyPage() {
  return (
    <div className="min-h-dvh bg-[#080808] flex flex-col">

      {/* Header */}
      <header className="px-6 pt-8 pb-6 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/">
          <Logo size="sm" />
        </Link>
        <Link to="/" className="font-body text-xs text-muted hover:text-text transition-colors tracking-widest uppercase">
          ← Home
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
        <div className="mb-10">
          <p className="font-body text-[10px] text-muted tracking-[0.3em] uppercase mb-3">Legale</p>
          <h1
            className="font-heading font-light text-text"
            style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)', letterSpacing: '-0.02em', lineHeight: 0.95 }}
          >
            Cookie<br />Policy<span style={{ color: '#C85A1E' }}>.</span>
          </h1>
          <p className="font-body text-xs text-muted mt-4">Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2rem' }}>

          <Section title="1. Cosa sono i Cookie">
            <p>
              I cookie sono piccoli file di testo che i siti web salvano sul tuo dispositivo durante la navigazione. Vengono utilizzati per far funzionare il sito correttamente e per ricordare le tue preferenze.
            </p>
          </Section>

          <Section title="2. Cookie Utilizzati">
            <p>Questo sito utilizza esclusivamente cookie tecnici, necessari per il corretto funzionamento del servizio. Non utilizziamo cookie di profilazione o di tracciamento di terze parti.</p>

            {/* Cookie table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Nome', 'Tipo', 'Durata', 'Scopo'].map(h => (
                      <th key={h} className="text-left py-2 pr-4 font-body text-[10px] text-muted tracking-widest uppercase font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cookies.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="py-3 pr-4 font-body text-text font-medium whitespace-nowrap">{c.name}</td>
                      <td className="py-3 pr-4 text-muted whitespace-nowrap">{c.tipo}</td>
                      <td className="py-3 pr-4 text-muted whitespace-nowrap">{c.durata}</td>
                      <td className="py-3 text-muted">{c.scopo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="3. Cookie Tecnici vs Profilazione">
            <p>
              I <strong className="text-text">cookie tecnici</strong> sono strettamente necessari al funzionamento del sito e non richiedono il consenso dell'utente ai sensi dell'art. 122 del Codice Privacy e delle Linee Guida del Garante.
            </p>
            <p>
              Non utilizziamo cookie di <strong className="text-text">profilazione</strong> né cookie di terze parti a scopo pubblicitario o di analisi del comportamento.
            </p>
          </Section>

          <Section title="4. Come Gestire i Cookie">
            <p>
              Puoi controllare e/o eliminare i cookie tramite le impostazioni del tuo browser. Puoi cancellare tutti i cookie già presenti sul tuo dispositivo e impostare la maggior parte dei browser per impedire che vengano installati.
            </p>
            <p>
              Tieni presente che disabilitare i cookie tecnici potrebbe compromettere il funzionamento del servizio di prenotazione.
            </p>
            <p>Guide per i principali browser:</p>
            <ul className="list-none space-y-1.5 mt-1">
              {[
                { name: 'Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                { name: 'Firefox', url: 'https://support.mozilla.org/it/kb/Gestione%20dei%20cookie' },
                { name: 'Safari', url: 'https://support.apple.com/it-it/guide/safari/sfri11471' },
                { name: 'Edge', url: 'https://support.microsoft.com/it-it/windows/eliminare-e-gestire-i-cookie' },
              ].map(b => (
                <li key={b.name} className="flex items-center gap-2">
                  <span className="text-[#C85A1E] text-[10px]">▸</span>
                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-text hover:text-[#C85A1E] transition-colors">
                    {b.name}
                  </a>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="5. Contatti">
            <p>
              Per qualsiasi domanda relativa ai cookie, puoi contattarci a{' '}
              <a href="mailto:info.abfotografiapubblicitaria@gmail.com" className="text-text hover:text-[#C85A1E] transition-colors">
                info.abfotografiapubblicitaria@gmail.com
              </a>
            </p>
          </Section>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="px-6 py-5 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link to="/privacy" className="font-body text-[10px] text-muted hover:text-text transition-colors tracking-widest uppercase">Privacy Policy</Link>
          <span className="text-muted/30 text-[10px]">·</span>
          <span className="font-body text-[10px] text-muted/40">© {new Date().getFullYear()} Opale Studio · P.IVA 12345678901</span>
        </div>
      </footer>
    </div>
  )
}
