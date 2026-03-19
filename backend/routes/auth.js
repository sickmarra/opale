const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { getDb } = require('../database')
const { authenticate } = require('../middleware/auth')
const { OAuth2Client } = require('google-auth-library')
const { sendWelcomeEmail, sendForgotPasswordEmail } = require('../utils/mailer')

const router = express.Router()
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
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
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email già registrata' })
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    const result = await pool.query(
      'INSERT INTO users (email, password, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, role',
      [email.toLowerCase(), hashedPassword, full_name.trim()]
    )
    const user = result.rows[0]
    const token = generateToken(user.id)

    sendWelcomeEmail(user).catch(err => console.error('Welcome email error:', err.message))

    res.status(201).json({ token, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
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
      const randomPassword = bcrypt.hashSync(Math.random().toString(36).slice(-8), 10)
      const insertResult = await pool.query(
        'INSERT INTO users (email, password, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, role',
        [payload.email.toLowerCase(), randomPassword, payload.name]
      )
      user = insertResult.rows[0]
      sendWelcomeEmail(user).catch(err => console.error('Welcome email error:', err.message))
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

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
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

module.exports = router
