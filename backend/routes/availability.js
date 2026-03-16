const express = require('express')
const { getDb } = require('../database')

const router = express.Router()

// GET /api/availability?date=YYYY-MM-DD
// Returns array of occupied hours for a given date
router.get('/', (req, res) => {
  const { date } = req.query
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Formato data non valido. Usa YYYY-MM-DD' })
  }

  const db = getDb()
  const bookings = db.prepare(
    "SELECT start_hour, end_hour FROM bookings WHERE date = ? AND status = 'confirmed'"
  ).all(date)

  const occupiedHours = new Set()
  for (const booking of bookings) {
    for (let h = booking.start_hour; h < booking.end_hour; h++) {
      occupiedHours.add(h)
    }
  }

  res.json({ date, occupiedHours: Array.from(occupiedHours).sort((a, b) => a - b) })
})

// GET /api/availability/month?year=2024&month=3
// Returns days with at least one occupied slot for the month
router.get('/month', (req, res) => {
  const { year, month } = req.query
  if (!year || !month) {
    return res.status(400).json({ error: 'Anno e mese sono obbligatori' })
  }

  const db = getDb()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`

  const bookings = db.prepare(
    "SELECT date, start_hour, end_hour FROM bookings WHERE date >= ? AND date <= ? AND status = 'confirmed'"
  ).all(startDate, endDate)

  // For each date, calculate occupied hours
  const dateMap = {}
  for (const booking of bookings) {
    if (!dateMap[booking.date]) dateMap[booking.date] = new Set()
    for (let h = booking.start_hour; h < booking.end_hour; h++) {
      dateMap[booking.date].add(h)
    }
  }

  // Total available slots: 8-23 = 15 hours
  const TOTAL_SLOTS = 15
  const result = {}
  for (const [date, hours] of Object.entries(dateMap)) {
    result[date] = {
      occupiedCount: hours.size,
      fullyBooked: hours.size >= TOTAL_SLOTS
    }
  }

  res.json(result)
})

module.exports = router
