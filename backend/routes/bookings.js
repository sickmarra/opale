const express = require('express')
const { getDb } = require('../database')
const { authenticate, requireAdmin } = require('../middleware/auth')

const router = express.Router()

const MIN_HOUR = 8
const MAX_HOUR = 23

function calculatePrice(dateStr, durationHours) {
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay() // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  return (isWeekend ? 35 : 30) * durationHours
}

// GET /api/bookings
// Admin: all bookings with user info; User: own bookings
router.get('/', authenticate, (req, res) => {
  const db = getDb()

  let bookings
  if (req.user.role === 'admin') {
    bookings = db.prepare(`
      SELECT b.*, u.full_name as user_name, u.email as user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.date DESC, b.start_hour DESC
    `).all()
  } else {
    bookings = db.prepare(`
      SELECT b.*
      FROM bookings b
      WHERE b.user_id = ?
      ORDER BY b.date DESC, b.start_hour DESC
    `).all(req.user.id)
  }

  // Attach services to each booking
  const bookingIds = bookings.map(b => b.id)
  if (bookingIds.length > 0) {
    const services = db.prepare(`
      SELECT bs.booking_id, s.id, s.name, s.description, bs.price_at_booking as price
      FROM booking_services bs
      JOIN services s ON bs.service_id = s.id
      WHERE bs.booking_id IN (${bookingIds.map(() => '?').join(',')})
    `).all(...bookingIds)

    const serviceMap = {}
    for (const s of services) {
      if (!serviceMap[s.booking_id]) serviceMap[s.booking_id] = []
      serviceMap[s.booking_id].push({ id: s.id, name: s.name, description: s.description, price: s.price })
    }
    for (const b of bookings) {
      b.services = serviceMap[b.id] || []
    }
  } else {
    for (const b of bookings) b.services = []
  }

  res.json(bookings)
})

// POST /api/bookings
router.post('/', authenticate, (req, res) => {
  const { date, start_hour, end_hour, service_ids = [], notes } = req.body

  if (!date || start_hour === undefined || end_hour === undefined) {
    return res.status(400).json({ error: 'Data, ora inizio e ora fine sono obbligatorie' })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Formato data non valido' })
  }
  if (start_hour < MIN_HOUR || end_hour > MAX_HOUR || start_hour >= end_hour) {
    return res.status(400).json({ error: `Orario non valido. Deve essere tra ${MIN_HOUR}:00 e ${MAX_HOUR}:00` })
  }

  // Check booking is not in the past
  const bookingDate = new Date(`${date}T${String(start_hour).padStart(2, '0')}:00:00`)
  if (bookingDate < new Date()) {
    return res.status(400).json({ error: 'Non puoi prenotare nel passato' })
  }

  const db = getDb()

  // Check availability - no overlap
  const conflicts = db.prepare(`
    SELECT id FROM bookings
    WHERE date = ? AND status = 'confirmed'
    AND start_hour < ? AND end_hour > ?
  `).all(date, end_hour, start_hour)

  if (conflicts.length > 0) {
    return res.status(409).json({ error: 'Uno o più slot orari selezionati sono già prenotati' })
  }

  const durationHours = end_hour - start_hour
  let totalPrice = calculatePrice(date, durationHours)

  // Validate and get services
  let selectedServices = []
  if (service_ids.length > 0) {
    selectedServices = db.prepare(
      `SELECT * FROM services WHERE id IN (${service_ids.map(() => '?').join(',')})`
    ).all(...service_ids)
    for (const s of selectedServices) {
      totalPrice += s.price
    }
  }

  // Create booking
  const bookingResult = db.prepare(
    'INSERT INTO bookings (user_id, date, start_hour, end_hour, total_price, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, date, start_hour, end_hour, totalPrice, notes?.trim() || null)

  const bookingId = bookingResult.lastInsertRowid

  // Insert booking_services
  if (selectedServices.length > 0) {
    const insertBS = db.prepare(
      'INSERT INTO booking_services (booking_id, service_id, price_at_booking) VALUES (?, ?, ?)'
    )
    for (const s of selectedServices) {
      insertBS.run(bookingId, s.id, s.price)
    }
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId)
  booking.services = selectedServices.map(s => ({ id: s.id, name: s.name, price: s.price }))

  res.status(201).json(booking)
})

// PUT /api/bookings/:id — user can edit own, admin can edit any
router.put('/:id', authenticate, (req, res) => {
  const db = getDb()
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id)

  if (!booking) return res.status(404).json({ error: 'Prenotazione non trovata' })
  if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Non puoi modificare questa prenotazione' })
  }

  const { date, start_hour, end_hour, service_ids, notes } = req.body

  const newDate = date || booking.date
  const newStart = start_hour ?? booking.start_hour
  const newEnd = end_hour ?? booking.end_hour

  if (newStart < MIN_HOUR || newEnd > MAX_HOUR || newStart >= newEnd) {
    return res.status(400).json({ error: 'Orario non valido' })
  }

  // Check conflicts (excluding current booking)
  const conflicts = db.prepare(`
    SELECT id FROM bookings
    WHERE date = ? AND status = 'confirmed' AND id != ?
    AND start_hour < ? AND end_hour > ?
  `).all(newDate, booking.id, newEnd, newStart)

  if (conflicts.length > 0) {
    return res.status(409).json({ error: 'Uno o più slot orari selezionati sono già prenotati' })
  }

  const durationHours = newEnd - newStart
  let totalPrice = calculatePrice(newDate, durationHours)

  let selectedServices = []
  if (service_ids !== undefined) {
    if (service_ids.length > 0) {
      selectedServices = db.prepare(
        `SELECT * FROM services WHERE id IN (${service_ids.map(() => '?').join(',')})`
      ).all(...service_ids)
      for (const s of selectedServices) totalPrice += s.price
    }
    // Update booking_services
    db.prepare('DELETE FROM booking_services WHERE booking_id = ?').run(booking.id)
    const insertBS = db.prepare(
      'INSERT INTO booking_services (booking_id, service_id, price_at_booking) VALUES (?, ?, ?)'
    )
    for (const s of selectedServices) {
      insertBS.run(booking.id, s.id, s.price)
    }
  } else {
    // Keep existing services, recalculate price
    const existingServices = db.prepare(`
      SELECT bs.price_at_booking FROM booking_services bs WHERE bs.booking_id = ?
    `).all(booking.id)
    for (const s of existingServices) totalPrice += s.price_at_booking
  }

  db.prepare(
    'UPDATE bookings SET date = ?, start_hour = ?, end_hour = ?, total_price = ?, notes = ? WHERE id = ?'
  ).run(newDate, newStart, newEnd, totalPrice, notes?.trim() ?? booking.notes, booking.id)

  const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id)
  const updatedServices = db.prepare(`
    SELECT s.id, s.name, s.description, bs.price_at_booking as price
    FROM booking_services bs JOIN services s ON bs.service_id = s.id
    WHERE bs.booking_id = ?
  `).all(booking.id)
  updated.services = updatedServices

  res.json(updated)
})

// DELETE /api/bookings/:id
router.delete('/:id', authenticate, (req, res) => {
  const db = getDb()
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id)

  if (!booking) return res.status(404).json({ error: 'Prenotazione non trovata' })
  if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Non puoi eliminare questa prenotazione' })
  }

  db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id)
  res.json({ message: 'Prenotazione eliminata' })
})

module.exports = router
