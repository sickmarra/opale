require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { initDatabase } = require('./database')
const authRoutes = require('./routes/auth')
const bookingsRoutes = require('./routes/bookings')
const servicesRoutes = require('./routes/services')
const availabilityRoutes = require('./routes/availability')

const app = express()
const PORT = process.env.PORT || 3001

// Fidati del primo proxy (necessario per IP reale su Render)
app.set('trust proxy', 1)

// ── Security Headers ────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  next()
})

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '50kb' }))

// Initialize DB and start server
async function startServer() {
  try {
    await initDatabase()
  } catch (err) {
    console.error('❌ Errore inizializzazione database:', err)
    process.exit(1)
  }
}
startServer()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/availability', availabilityRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok', studio: 'Opale Studio' }))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Errore interno del server' })
})

app.listen(PORT, () => {
  console.log(`\n🌟 Opale Studio API avviata su http://localhost:${PORT}`)
  console.log(`   Admin: ${process.env.ADMIN_EMAIL || 'admin@opalestudio.it'}`)
})
