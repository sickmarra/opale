const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDb } = require('../database')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// POST /api/auth/register
router.post('/register', (req, res) => {
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

  const db = getDb()
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
  if (existing) {
    return res.status(409).json({ error: 'Email già registrata' })
  }

  const hashedPassword = bcrypt.hashSync(password, 10)
  const result = db.prepare(
    'INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)'
  ).run(email.toLowerCase(), hashedPassword, full_name.trim())

  const user = db.prepare('SELECT id, email, full_name, role FROM users WHERE id = ?').get(result.lastInsertRowid)
  const token = generateToken(user.id)
  res.status(201).json({ token, user })
})

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatorie' })
  }

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
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
})

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user })
})

module.exports = router
