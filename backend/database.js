const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
})

function getDb() {
  return pool
}

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('client', 'admin')),
      email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      verification_token TEXT,
      verification_token_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  // Aggiungi colonne se non esistono (per DB già creati)
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE`).catch(() => {})
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token TEXT`).catch(() => {})
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP`).catch(() => {})
  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      start_hour INTEGER NOT NULL,
      end_hour INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'cancelled')),
      total_price REAL NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking_services (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      service_id INTEGER NOT NULL REFERENCES services(id),
      price_at_booking REAL NOT NULL
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Seed admin user if not exists
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@opalestudio.it'
  const existingAdmin = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail])
  if (existingAdmin.rows.length === 0) {
    const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Opale2024!', 10)
    await pool.query(
      'INSERT INTO users (email, password, full_name, role, email_verified) VALUES ($1, $2, $3, $4, TRUE)',
      [adminEmail, hashedPassword, 'Admin Opale', 'admin']
    )
    console.log(`✅ Admin creato: ${adminEmail}`)
  }

  // Seed default services if none exist
  const servicesCount = await pool.query('SELECT COUNT(*) as count FROM services')
  if (parseInt(servicesCount.rows[0].count) === 0) {
    await pool.query('INSERT INTO services (name, description, price) VALUES ($1, $2, $3)', ['Stylist', 'Servizio di styling professionale per il tuo shooting', 50])
    await pool.query('INSERT INTO services (name, description, price) VALUES ($1, $2, $3)', ['Make-up Artist', 'Trucco professionale a cura di artisti esperti', 80])
    await pool.query('INSERT INTO services (name, description, price) VALUES ($1, $2, $3)', ['Fondale Extra', 'Fondale colorato aggiuntivo a scelta', 20])
    await pool.query('INSERT INTO services (name, description, price) VALUES ($1, $2, $3)', ['Attrezzatura Luce', 'Kit luce aggiuntivo per effetti speciali', 30])
    console.log('✅ Servizi extra predefiniti creati')
  }

  console.log('✅ Database inizializzato')
}

module.exports = { getDb, initDatabase }
