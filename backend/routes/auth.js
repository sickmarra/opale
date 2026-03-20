const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { getDb } = require('../database')
const { authenticate } = require('../middleware/auth')
const { authLimiter, emailLimiter } = require('../middleware/rateLimiter')
const { OAuth2Client } = require('google-auth-library')
const { sendVerificationEmail, sendForgotPasswordEmail } = require('../utils/mailer')

const router = express.Router()
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  const { email, password, full_name } = req.body
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La password deve essere di almeno 6 caratteri' })
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email non valida' })
  }

  try {
    const pool = getDb()
    const existing = await pool.query('SELECT id, email, full_name, email_verified FROM users WHERE email = $1', [email.toLowerCase()])
    if (existing.rows.length > 0) {
      const existingUser = existing.rows[0]
      // Se esiste ma non è verificato → reinvia il link di verifica invece di dare errore
      if (!existingUser.email_verified) {
        const verificationToken = crypto.randomBytes(32).toString('hex')
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
        await pool.query(
          `UPDATE users SET verification_token=$1, verification_token_expires=$2 WHERE id=$3`,
          [verificationToken, verificationExpires, existingUser.id]
        )
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        const verifyUrl = `${frontendUrl}/verifica-email?token=${verificationToken}`
        sendVerificationEmail(existingUser, verifyUrl).catch(err => console.error('Verification email error:', err.message))
        return res.status(200).json({ message: 'Ti abbiamo reinviato l\'email di conferma. Controlla la tua casella.' })
      }
      return res.status(409).json({ error: 'Email già registrata' })
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 ore

    const result = await pool.query(
      `INSERT INTO users (email, password, full_name, email_verified, verification_token, verification_token_expires)
       VALUES ($1, $2, $3, FALSE, $4, $5)
       RETURNING id, email, full_name, role`,
      [email.toLowerCase(), hashedPassword, full_name.trim(), verificationToken, verificationExpires]
    )
    const user = result.rows[0]

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const verifyUrl = `${frontendUrl}/verifica-email?token=${verificationToken}`
    sendVerificationEmail(user, verifyUrl).catch(err => console.error('Verification email error:', err.message))

    res.status(201).json({ message: 'Registrazione completata! Controlla la tua email per confermare l\'account.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// GET /api/auth/verify-email?token=xxx
router.get('/verify-email', async (req, res) => {
  const { token } = req.query
  if (!token) {
    return res.status(400).json({ error: 'Token mancante' })
  }

  try {
    const pool = getDb()
    const result = await pool.query(
      'SELECT id, email, full_name, role, verification_token_expires FROM users WHERE verification_token = $1 AND email_verified = FALSE',
      [token]
    )
    const user = result.rows[0]

    if (!user) {
      return res.status(400).json({ error: 'Link non valido o già utilizzato' })
    }

    if (new Date(user.verification_token_expires) < new Date()) {
      return res.status(400).json({ error: 'Link scaduto. Registrati di nuovo.' })
    }

    await pool.query(
      'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = $1',
      [user.id]
    )

    const jwtToken = generateToken(user.id)
    const safeUser = { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
    res.json({ token: jwtToken, user: safeUser, message: 'Email confermata! Benvenuto/a in Opale Studio.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatorie' })
  }

  try {
    const pool = getDb()
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
    const user = result.rows[0]
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' })
    }

    const passwordMatch = bcrypt.compareSync(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenziali non valide' })
    }

    if (!user.email_verified) {
      return res.status(403).json({ error: 'EMAIL_NOT_VERIFIED', message: 'Devi confermare la tua email prima di accedere. Controlla la tua casella di posta.' })
    }

    const safeUser = { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
    const token = generateToken(user.id)
    res.json({ token, user: safeUser })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// POST /api/auth/google
router.post('/google', async (req, res) => {
  const { credential } = req.body
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload()

    const pool = getDb()
    let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [payload.email.toLowerCase()])
    let user = userResult.rows[0]

    if (!user) {
      // Google ha già verificato l'email — creiamo direttamente come verificato
      const randomPassword = bcrypt.hashSync(Math.random().toString(36).slice(-8), 10)
      const insertResult = await pool.query(
        'INSERT INTO users (email, password, full_name, email_verified) VALUES ($1, $2, $3, TRUE) RETURNING id, email, full_name, role',
        [payload.email.toLowerCase(), randomPassword, payload.name]
      )
      user = insertResult.rows[0]
    } else if (!user.email_verified) {
      // Utente esistente non verificato che ora accede con Google: verifica automaticamente
      await pool.query(
        'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = $1',
        [user.id]
      )
    }

    const safeUser = { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
    const token = generateToken(user.id)
    res.json({ token, user: safeUser })
  } catch (error) {
    console.error('Google Auth Error:', error)
    res.status(401).json({ error: 'Autenticazione Google fallita' })
  }
})

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user })
})

// POST /api/auth/resend-verification
router.post('/resend-verification', emailLimiter, async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email obbligatoria' })

  try {
    const pool = getDb()
    const result = await pool.query('SELECT id, email, full_name, email_verified FROM users WHERE email = $1', [email.toLowerCase()])
    const user = result.rows[0]

    // Risposta generica per sicurezza
    if (!user || user.email_verified) {
      return res.json({ message: 'Se l\'email esiste e non è ancora verificata, riceverai un nuovo link.' })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await pool.query(
      'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
      [verificationToken, verificationExpires, user.id]
    )

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const verifyUrl = `${frontendUrl}/verifica-email?token=${verificationToken}`
    sendVerificationEmail(user, verifyUrl).catch(err => console.error('Resend verification error:', err.message))

    res.json({ message: 'Se l\'email esiste e non è ancora verificata, riceverai un nuovo link.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// POST /api/auth/forgot-password
router.post('/forgot-password', emailLimiter, async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ error: 'Email obbligatoria' })
  }

  try {
    const pool = getDb()
    const userResult = await pool.query('SELECT id, email, full_name FROM users WHERE email = $1', [email.toLowerCase()])
    const user = userResult.rows[0]

    if (!user) {
      return res.json({ message: "Se l'email è registrata, riceverai le istruzioni per il recupero." })
    }

    await pool.query('UPDATE password_reset_tokens SET used = 1 WHERE user_id = $1', [user.id])

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    )

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`

    await sendForgotPasswordEmail(user, resetUrl)
    console.log(`🔑 Reset password email inviata a ${user.email}`)

    res.json({ message: "Se l'email è registrata, riceverai le istruzioni per il recupero." })
  } catch (err) {
    console.error('Forgot password error:', err.message)
    res.status(500).json({ error: "Errore nell'invio dell'email. Riprova più tardi." })
  }
})

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) {
    return res.status(400).json({ error: 'Token e nuova password sono obbligatori' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La password deve essere di almeno 6 caratteri' })
  }

  try {
    const pool = getDb()
    const tokenResult = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE token = $1 AND used = 0',
      [token]
    )
    const resetToken = tokenResult.rows[0]

    if (!resetToken) {
      return res.status(400).json({ error: 'Link non valido o già utilizzato' })
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Link scaduto. Richiedi un nuovo link di recupero.' })
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, resetToken.user_id])
    await pool.query('UPDATE password_reset_tokens SET used = 1 WHERE id = $1', [resetToken.id])

    res.json({ message: 'Password aggiornata con successo. Ora puoi accedere.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// DELETE /api/auth/account  — GDPR "diritto all'oblio"
router.delete('/account', authenticate, async (req, res) => {
  const { confirmEmail } = req.body

  if (!confirmEmail) {
    return res.status(400).json({ error: "Inserisci la tua email per confermare l'eliminazione." })
  }

  try {
    const pool = getDb()
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id])
    const user = userResult.rows[0]

    if (!user) return res.status(404).json({ error: 'Utente non trovato.' })

    if (user.role === 'admin') {
      return res.status(403).json({ error: "L'account amministratore non può essere eliminato da questa interfaccia." })
    }

    if (confirmEmail.toLowerCase().trim() !== user.email.toLowerCase()) {
      return res.status(400).json({ error: "L'email inserita non corrisponde all'account." })
    }

    // ON DELETE CASCADE rimuove automaticamente bookings e booking_services
    await pool.query('DELETE FROM users WHERE id = $1', [user.id])

    res.json({ message: 'Account e tutti i dati associati eliminati con successo.' })
  } catch (err) {
    console.error('Delete account error:', err)
    res.status(500).json({ error: 'Errore interno del server.' })
  }
})

module.exports = router
