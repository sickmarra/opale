const express = require('express')
const { getDb } = require('../database')
const { authenticate, requireAdmin } = require('../middleware/auth')
const { sendBookingConfirmationEmail } = require('../utils/mailer')

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
router.get('/', authenticate, async (req, res) => {
  try {
    const pool = getDb()
    let bookings

    if (req.user.role === 'admin') {
      const result = await pool.query(`
        SELECT b.*, u.full_name as user_name, u.email as user_email
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        ORDER BY b.date DESC, b.start_hour DESC
      `)
      bookings = result.rows
    } else {
      const result = await pool.query(`
        SELECT b.*
        FROM bookings b
        WHERE b.user_id = $1
        ORDER BY b.date DESC, b.start_hour DESC
      `, [req.user.id])
      bookings = result.rows
    }

    // Attach services to each booking
    if (bookings.length > 0) {
      const bookingIds = bookings.map(b => b.id)
      const placeholders = bookingIds.map((_, i) => `$${i + 1}`).join(',')
      const servicesResult = await pool.query(`
        SELECT bs.booking_id, s.id, s.name, s.description, bs.price_at_booking as price
        FROM booking_services bs
        JOIN services s ON bs.service_id = s.id
        WHERE bs.booking_id IN (${placeholders})
      `, bookingIds)

      const serviceMap = {}
      for (const s of servicesResult.rows) {
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
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// POST /api/bookings
router.post('/', authenticate, async (req, res) => {
  const rawDate = req.body.date
  const start_hour = parseInt(req.body.start_hour, 10)
  const end_hour = parseInt(req.body.end_hour, 10)
  const service_ids = Array.isArray(req.body.service_ids) ? req.body.service_ids.map(Number).filter(Number.isFinite) : []
  const notes = typeof req.body.notes === 'string' ? req.body.notes.slice(0, 500) : null
  const date = rawDate

  if (!date || isNaN(start_hour) || isNaN(end_hour)) {
    return res.status(400).json({ error: 'Data, ora inizio e ora fine sono obbligatorie' })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Formato data non valido' })
  }
  if (start_hour < MIN_HOUR || end_hour > MAX_HOUR || start_hour >= end_hour) {
    return res.status(400).json({ error: `Orario non valido. Deve essere tra ${MIN_HOUR}:00 e ${MAX_HOUR}:00` })
  }

  const bookingDate = new Date(`${date}T${String(start_hour).padStart(2, '0')}:00:00`)
  if (bookingDate < new Date()) {
    return res.status(400).json({ error: 'Non puoi prenotare nel passato' })
  }

  try {
    const pool = getDb()

    // Check availability
    const conflicts = await pool.query(`
      SELECT id FROM bookings
      WHERE date = $1 AND status = 'confirmed'
      AND start_hour < $2 AND end_hour > $3
    `, [date, end_hour, start_hour])

    if (conflicts.rows.length > 0) {
      return res.status(409).json({ error: 'Uno o più slot orari selezionati sono già prenotati' })
    }

    const durationHours = end_hour - start_hour
    let totalPrice = calculatePrice(date, durationHours)

    // Validate and get services
    let selectedServices = []
    if (service_ids.length > 0) {
      const placeholders = service_ids.map((_, i) => `$${i + 1}`).join(',')
      const servResult = await pool.query(
        `SELECT * FROM services WHERE id IN (${placeholders})`,
        service_ids
      )
      selectedServices = servResult.rows
      for (const s of selectedServices) totalPrice += s.price
    }

    // Create booking
    const bookingResult = await pool.query(
      'INSERT INTO bookings (user_id, date, start_hour, end_hour, total_price, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, date, start_hour, end_hour, totalPrice, notes?.trim() || null]
    )
    const booking = bookingResult.rows[0]

    // Insert booking_services
    for (const s of selectedServices) {
      await pool.query(
        'INSERT INTO booking_services (booking_id, service_id, price_at_booking) VALUES ($1, $2, $3)',
        [booking.id, s.id, s.price]
      )
    }

    booking.services = selectedServices.map(s => ({ id: s.id, name: s.name, price: s.price }))

    // Send booking confirmation email (non-blocking)
    const userResult = await pool.query('SELECT id, email, full_name FROM users WHERE id = $1', [req.user.id])
    sendBookingConfirmationEmail(userResult.rows[0], booking, booking.services)
      .catch(err => console.error('Booking email error:', err.message))

    res.status(201).json(booking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// PUT /api/bookings/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const pool = getDb()
    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id])
    const booking = bookingResult.rows[0]

    if (!booking) return res.status(404).json({ error: 'Prenotazione non trovata' })
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Non puoi modificare questa prenotazione' })
    }

    const { date, service_ids } = req.body
    const start_hour = req.body.start_hour !== undefined ? parseInt(req.body.start_hour, 10) : undefined
    const end_hour = req.body.end_hour !== undefined ? parseInt(req.body.end_hour, 10) : undefined
    const notes = typeof req.body.notes === 'string' ? req.body.notes.slice(0, 500) : req.body.notes

    const newDate = date || booking.date
    const newStart = start_hour ?? booking.start_hour
    const newEnd = end_hour ?? booking.end_hour

    if (newStart < MIN_HOUR || newEnd > MAX_HOUR || newStart >= newEnd) {
      return res.status(400).json({ error: 'Orario non valido' })
    }

    // Check conflicts (excluding current booking)
    const conflicts = await pool.query(`
      SELECT id FROM bookings
      WHERE date = $1 AND status = 'confirmed' AND id != $2
      AND start_hour < $3 AND end_hour > $4
    `, [newDate, booking.id, newEnd, newStart])

    if (conflicts.rows.length > 0) {
      return res.status(409).json({ error: 'Uno o più slot orari selezionati sono già prenotati' })
    }

    const durationHours = newEnd - newStart
    let totalPrice = calculatePrice(newDate, durationHours)

    let selectedServices = []
    if (service_ids !== undefined) {
      if (service_ids.length > 0) {
        const placeholders = service_ids.map((_, i) => `$${i + 1}`).join(',')
        const servResult = await pool.query(
          `SELECT * FROM services WHERE id IN (${placeholders})`,
          service_ids
        )
        selectedServices = servResult.rows
        for (const s of selectedServices) totalPrice += s.price
      }
      await pool.query('DELETE FROM booking_services WHERE booking_id = $1', [booking.id])
      for (const s of selectedServices) {
        await pool.query(
          'INSERT INTO booking_services (booking_id, service_id, price_at_booking) VALUES ($1, $2, $3)',
          [booking.id, s.id, s.price]
        )
      }
    } else {
      const existingServices = await pool.query(
        'SELECT price_at_booking FROM booking_services WHERE booking_id = $1',
        [booking.id]
      )
      for (const s of existingServices.rows) totalPrice += s.price_at_booking
    }

    await pool.query(
      'UPDATE bookings SET date = $1, start_hour = $2, end_hour = $3, total_price = $4, notes = $5 WHERE id = $6',
      [newDate, newStart, newEnd, totalPrice, notes?.trim() ?? booking.notes, booking.id]
    )

    const updated = await pool.query('SELECT * FROM bookings WHERE id = $1', [booking.id])
    const updatedServices = await pool.query(`
      SELECT s.id, s.name, s.description, bs.price_at_booking as price
      FROM booking_services bs JOIN services s ON bs.service_id = s.id
      WHERE bs.booking_id = $1
    `, [booking.id])

    const result = updated.rows[0]
    result.services = updatedServices.rows

    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// DELETE /api/bookings/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const pool = getDb()
    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id])
    const booking = bookingResult.rows[0]

    if (!booking) return res.status(404).json({ error: 'Prenotazione non trovata' })
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Non puoi eliminare questa prenotazione' })
    }

    await pool.query('DELETE FROM bookings WHERE id = $1', [req.params.id])
    res.json({ message: 'Prenotazione eliminata' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

module.exports = router
