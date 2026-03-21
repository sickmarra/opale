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

export default function PrivacyPolicyPage() {
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
            Privacy<br />Policy<span style={{ color: '#C85A1E' }}>.</span>
          </h1>
          <p className="font-body text-xs text-muted mt-4">Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2rem' }}>

          <Section title="1. Titolare del Trattamento">
            <p>
              Il titolare del trattamento dei dati personali è <strong className="text-text">Opale Studio</strong>, con sede in Via De Gasperi 16, 81030 Lusciano (CE), Italia. P.IVA 04771840610.
            </p>
            <p>
              Email: <a href="mailto:info.abfotografiapubblicitaria@gmail.com" className="text-text hover:text-[#C85A1E] transition-colors">info.abfotografiapubblicitaria@gmail.com</a>
            </p>
          </Section>

          <Section title="2. Dati Raccolti">
            <p>Raccogliamo le seguenti categorie di dati personali:</p>
            <ul className="list-none space-y-1.5 mt-2">
              {[
                'Dati di registrazione: nome completo, indirizzo email, password (in forma cifrata)',
                'Dati di prenotazione: date, orari, servizi selezionati, note',
                'Dati di navigazione: indirizzo IP, browser, pagine visitate (solo a fini tecnici)',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#C85A1E] mt-1 text-[10px]">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="3. Finalità e Base Giuridica">
            <p>I dati vengono trattati per le seguenti finalità:</p>
            <ul className="list-none space-y-1.5 mt-2">
              {[
                { title: 'Esecuzione del contratto', desc: 'Gestione dell\'account e delle prenotazioni (art. 6, par. 1, lett. b GDPR)' },
                { title: 'Obblighi legali', desc: 'Adempimento di obblighi fiscali e contabili (art. 6, par. 1, lett. c GDPR)' },
                { title: 'Interesse legittimo', desc: 'Sicurezza del servizio e prevenzione frodi (art. 6, par. 1, lett. f GDPR)' },
                { title: 'Comunicazioni di servizio', desc: 'Invio di email relative alle prenotazioni (art. 6, par. 1, lett. b GDPR)' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#C85A1E] mt-1 text-[10px]">▸</span>
                  <span><strong className="text-text">{item.title}:</strong> {item.desc}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="4. Conservazione dei Dati">
            <p>
              I dati vengono conservati per il tempo strettamente necessario alle finalità per cui sono stati raccolti:
            </p>
            <ul className="list-none space-y-1.5 mt-2">
              {[
                'Dati account: fino alla cancellazione dell\'account o per 5 anni dall\'ultima attività',
                'Dati prenotazioni: 10 anni per obblighi fiscali',
                'Token di reset password: 1 ora dalla creazione',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#C85A1E] mt-1 text-[10px]">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="5. Diritti dell'Interessato">
            <p>Ai sensi del GDPR (artt. 15-22) hai diritto a:</p>
            <ul className="list-none space-y-1.5 mt-2">
              {[
                'Accesso ai tuoi dati personali',
                'Rettifica di dati inesatti o incompleti',
                'Cancellazione ("diritto all\'oblio")',
                'Limitazione del trattamento',
                'Portabilità dei dati',
                'Opposizione al trattamento',
                'Revocare il consenso in qualsiasi momento',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#C85A1E] mt-1 text-[10px]">▸</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Per esercitare i tuoi diritti, contattaci a{' '}
              <a href="mailto:info.abfotografiapubblicitaria@gmail.com" className="text-text hover:text-[#C85A1E] transition-colors">
                info.abfotografiapubblicitaria@gmail.com
              </a>. Puoi inoltre proporre reclamo al Garante per la protezione dei dati personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-text hover:text-[#C85A1E] transition-colors">www.garanteprivacy.it</a>).
            </p>
          </Section>

          <Section title="6. Sicurezza">
            <p>
              Adottiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati personali da accessi non autorizzati, perdita o divulgazione. Le password vengono archiviate in forma cifrata (bcrypt). Le comunicazioni avvengono tramite protocollo HTTPS.
            </p>
          </Section>

          <Section title="7. Responsabili del Trattamento (Sub-processor)">
            <p>Per erogare il servizio ci avvaliamo dei seguenti fornitori terzi, ciascuno dei quali tratta i dati in conformità al GDPR:</p>
            <ul className="list-none space-y-2 mt-2">
              {[
                { name: 'Render Inc.', role: 'Hosting dell\'applicazione (backend + frontend)', location: 'USA — server regione EU (Frankfurt). Trasferimento basato su Standard Contractual Clauses.' },
                { name: 'Neon Technologies', role: 'Database PostgreSQL (dati account e prenotazioni)', location: 'USA — possibile server EU. Trasferimento basato su Standard Contractual Clauses.' },
                { name: 'Brevo (ex Sendinblue)', role: 'Invio email transazionali (conferma account, prenotazione, reset password)', location: 'Francia (UE) — trattamento all\'interno dell\'UE.' },
                { name: 'Google LLC', role: 'Autenticazione opzionale tramite Google OAuth', location: 'USA — trasferimento basato su Standard Contractual Clauses. Si applica la Privacy Policy di Google.' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#C85A1E] mt-1 text-[10px]">▸</span>
                  <span><strong className="text-text">{item.name}</strong> — {item.role}. <em>{item.location}</em></span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="8. Trasferimenti Extra-UE">
            <p>
              Alcuni fornitori sopra indicati (Render, Neon, Google) sono basati negli USA. I trasferimenti avvengono nel rispetto delle garanzie previste dal GDPR (art. 46) mediante Standard Contractual Clauses approvate dalla Commissione Europea.
            </p>
          </Section>

          <Section title="9. Aggiornamenti">
            <p>
              La presente policy può essere aggiornata periodicamente. Le modifiche sostanziali saranno comunicate via email agli utenti registrati.
            </p>
          </Section>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="px-6 py-5 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link to="/cookie" className="font-body text-[10px] text-muted hover:text-text transition-colors tracking-widest uppercase">Cookie Policy</Link>
          <span className="text-muted/30 text-[10px]">·</span>
          <span className="font-body text-[10px] text-muted/40">© {new Date().getFullYear()} Opale Studio · P.IVA 04771840610</span>
        </div>
      </footer>
    </div>
  )
}
