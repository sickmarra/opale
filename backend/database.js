const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')

const DB_PATH = path.join(__dirname, 'opale.db')

let db

function getDb() {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}

function initDatabase() {
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('client', 'admin')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      start_hour INTEGER NOT NULL,
      end_hour INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'cancelled')),
      total_price REAL NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS booking_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      service_id INTEGER NOT NULL REFERENCES services(id),
      price_at_booking REAL NOT NULL
    );
  `)

  // Seed admin user if not exists
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@opalestudio.it'
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail)
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Opale2024!', 10)
    db.prepare(
      'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)'
    ).run(adminEmail, hashedPassword, 'Admin Opale', 'admin')
    console.log(`✅ Admin creato: ${adminEmail}`)
  }

  // Seed default services if none exist
  const servicesCount = db.prepare('SELECT COUNT(*) as count FROM services').get()
  if (servicesCount.count === 0) {
    const insertService = db.prepare(
      'INSERT INTO services (name, description, price) VALUES (?, ?, ?)'
    )
    insertService.run('Stylist', 'Servizio di styling professionale per il tuo shooting', 50)
    insertService.run('Make-up Artist', 'Trucco professionale a cura di artisti esperti', 80)
    insertService.run('Fondale Extra', 'Fondale colorato aggiuntivo a scelta', 20)
    insertService.run('Attrezzatura Luce', 'Kit luce aggiuntivo per effetti speciali', 30)
    console.log('✅ Servizi extra predefiniti creati')
  }

  console.log('✅ Database inizializzato')
}

module.exports = { getDb, initDatabase }
