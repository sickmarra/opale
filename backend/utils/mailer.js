// Resend HTTP API — niente SMTP, usa HTTPS porta 443 (sempre aperta)

const FROM = `"Opale Studio" <onboarding@resend.dev>`
const BRAND_COLOR = '#C85A1E'
const BG_COLOR = '#0D0D0D'
const CARD_COLOR = '#141414'
const TEXT_COLOR = '#F5F0E8'
const MUTED_COLOR = '#9A9A9A'

async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log(`[DEV] Email a ${to} — ${subject}`)
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`Resend API error ${res.status}: ${data.message || JSON.stringify(data)}`)
  }
  return data
}

function baseTemplate(content) {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Opale Studio</title>
</head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_COLOR};padding:40px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${CARD_COLOR};border:1px solid rgba(255,255,255,0.06);">
        <!-- Header -->
        <tr>
          <td style="padding:32px 36px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="font-family:'Georgia',serif;font-size:28px;font-weight:300;letter-spacing:-0.01em;color:${TEXT_COLOR};">
              opale<span style="color:${BRAND_COLOR};">.</span>
            </span>
          </td>
        </tr>
        <!-- Content -->
        <tr><td style="padding:36px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 36px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;color:${MUTED_COLOR};letter-spacing:0.05em;text-transform:uppercase;">Opale Studio · Sala Pose Fotografica</p>
            <p style="margin:0;font-size:10px;color:rgba(154,154,154,0.5);">info@opalestudio.it</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function verificationEmail(fullName, verifyUrl) {
  return baseTemplate(`
    <p style="margin:0 0 6px;font-size:11px;color:${MUTED_COLOR};letter-spacing:0.25em;text-transform:uppercase;">Conferma Account</p>
    <h1 style="margin:0 0 20px;font-family:'Georgia',serif;font-size:32px;font-weight:300;color:${TEXT_COLOR};line-height:1.1;">
      Ciao, ${fullName}<span style="color:${BRAND_COLOR};">.</span>
    </h1>
    <p style="margin:0 0 16px;font-size:14px;color:${MUTED_COLOR};line-height:1.7;">
      Grazie per esserti registrato/a su Opale Studio. Per attivare il tuo account e iniziare a prenotare la sala, clicca sul pulsante qui sotto.
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:${MUTED_COLOR};line-height:1.7;">
      Il link è valido per <strong style="color:${TEXT_COLOR};">24 ore</strong>.
    </p>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${verifyUrl}"
        style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;padding:14px 36px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;font-weight:500;">
        Conferma Email
      </a>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;">
      <p style="margin:0 0 8px;font-size:12px;color:rgba(154,154,154,0.6);">
        Se non hai creato questo account, ignora questa email.
      </p>
      <p style="margin:0;font-size:11px;color:rgba(154,154,154,0.4);word-break:break-all;">
        Link diretto: ${verifyUrl}
      </p>
    </div>
  `)
}

function bookingConfirmationEmail(user, booking, services) {
  const dateObj = new Date(booking.date + 'T12:00:00')
  const giorni = ['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato']
  const mesi = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre']
  const dateStr = `${giorni[dateObj.getDay()]} ${dateObj.getDate()} ${mesi[dateObj.getMonth()]} ${dateObj.getFullYear()}`
  const duration = booking.end_hour - booking.start_hour

  const servicesRows = services.length
    ? services.map(s => `
      <tr>
        <td style="padding:8px 0;font-size:13px;color:${MUTED_COLOR};border-bottom:1px solid rgba(255,255,255,0.04);">${s.name}</td>
        <td style="padding:8px 0;font-size:13px;color:${TEXT_COLOR};text-align:right;border-bottom:1px solid rgba(255,255,255,0.04);">€${s.price}</td>
      </tr>`).join('')
    : ''

  return baseTemplate(`
    <p style="margin:0 0 6px;font-size:11px;color:${MUTED_COLOR};letter-spacing:0.25em;text-transform:uppercase;">Prenotazione Confermata</p>
    <h1 style="margin:0 0 6px;font-family:'Georgia',serif;font-size:32px;font-weight:300;color:${TEXT_COLOR};line-height:1.1;">
      #${booking.id}<span style="color:${BRAND_COLOR};">.</span>
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${MUTED_COLOR};">Ciao ${user.full_name}, la tua prenotazione è confermata.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.06);margin-bottom:24px;">
      <tr>
        <td style="padding:10px 0;font-size:12px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid rgba(255,255,255,0.04);">Data</td>
        <td style="padding:10px 0;font-size:13px;color:${TEXT_COLOR};text-align:right;text-transform:capitalize;border-bottom:1px solid rgba(255,255,255,0.04);">${dateStr}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:12px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid rgba(255,255,255,0.04);">Orario</td>
        <td style="padding:10px 0;font-size:13px;color:${TEXT_COLOR};text-align:right;border-bottom:1px solid rgba(255,255,255,0.04);">${booking.start_hour}:00 – ${booking.end_hour}:00 (${duration}h)</td>
      </tr>
      ${servicesRows}
      <tr>
        <td style="padding:12px 0;font-size:12px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.1em;">Totale</td>
        <td style="padding:12px 0;font-family:'Georgia',serif;font-size:24px;font-weight:300;color:${BRAND_COLOR};text-align:right;">€${booking.total_price}</td>
      </tr>
    </table>

    ${booking.notes ? `<div style="background:rgba(255,255,255,0.03);border-left:2px solid rgba(200,90,30,0.3);padding:12px 16px;margin-bottom:24px;"><p style="margin:0;font-size:12px;color:${MUTED_COLOR};">Note: ${booking.notes}</p></div>` : ''}

    <p style="margin:0;font-size:12px;color:rgba(154,154,154,0.5);">
      Per modifiche o cancellazioni accedi al tuo profilo o contattaci a info@opalestudio.it
    </p>
  `)
}

function forgotPasswordEmail(fullName, resetUrl) {
  return baseTemplate(`
    <p style="margin:0 0 6px;font-size:11px;color:${MUTED_COLOR};letter-spacing:0.25em;text-transform:uppercase;">Recupero Password</p>
    <h1 style="margin:0 0 20px;font-family:'Georgia',serif;font-size:32px;font-weight:300;color:${TEXT_COLOR};line-height:1.1;">
      Reimposta<span style="color:${BRAND_COLOR};">.</span>
    </h1>
    <p style="margin:0 0 16px;font-size:14px;color:${MUTED_COLOR};line-height:1.7;">
      Ciao ${fullName}, abbiamo ricevuto una richiesta di reimpostazione della password per il tuo account Opale Studio.
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:${MUTED_COLOR};line-height:1.7;">
      Clicca sul pulsante qui sotto per scegliere una nuova password. Il link è valido per <strong style="color:${TEXT_COLOR};">1 ora</strong>.
    </p>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${resetUrl}"
        style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;padding:14px 36px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;font-weight:500;">
        Reimposta Password
      </a>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;">
      <p style="margin:0 0 8px;font-size:12px;color:rgba(154,154,154,0.6);">
        Se non hai richiesto il recupero password, ignora questa email. Il tuo account è al sicuro.
      </p>
      <p style="margin:0;font-size:11px;color:rgba(154,154,154,0.4);word-break:break-all;">
        Link diretto: ${resetUrl}
      </p>
    </div>
  `)
}

async function sendVerificationEmail(user, verifyUrl) {
  return sendEmail({
    to: user.email,
    subject: 'Conferma il tuo account — Opale Studio',
    html: verificationEmail(user.full_name, verifyUrl),
  })
}

async function sendBookingConfirmationEmail(user, booking, services = []) {
  return sendEmail({
    to: user.email,
    subject: `Prenotazione Confermata — Opale Studio #${booking.id}`,
    html: bookingConfirmationEmail(user, booking, services),
  })
}

async function sendForgotPasswordEmail(user, resetUrl) {
  return sendEmail({
    to: user.email,
    subject: 'Reimposta la tua password — Opale Studio',
    html: forgotPasswordEmail(user.full_name, resetUrl),
  })
}

module.exports = { sendVerificationEmail, sendBookingConfirmationEmail, sendForgotPasswordEmail }
