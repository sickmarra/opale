const jwt = require('jsonwebtoken')
const { getDb } = require('../database')

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token mancante o non valido' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const pool = getDb()
    const result = await pool.query('SELECT id, email, full_name, role FROM users WHERE id = $1', [payload.userId])
    const user = result.rows[0]
    if (!user) return res.status(401).json({ error: 'Utente non trovato' })
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token non valido o scaduto' })
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso riservato agli amministratori' })
  }
  next()
}

module.exports = { authenticate, requireAdmin }
