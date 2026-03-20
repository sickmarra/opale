const express = require('express')
const { getDb } = require('../database')

const router = express.Router()

// GET /api/availability?date=YYYY-MM-DD
router.get('/', async (req, res) => {
  const { date } = req.query
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Formato data non valido. Usa YYYY-MM-DD' })
  }

  try {
    const pool = getDb()
    const result = await pool.query(
      "SELECT start_hour, end_hour FROM bookings WHERE date = $1 AND status = 'confirmed'",
      [date]
    )

    const occupiedHours = new Set()
    for (const booking of result.rows) {
      for (let h = booking.start_hour; h < booking.end_hour; h++) {
        occupiedHours.add(h)
      }
    }

    res.json({ date, occupiedHours: Array.from(occupiedHours).sort((a, b) => a - b) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// GET /api/availability/month?year=2024&month=3
router.get('/month', async (req, res) => {
  const year = parseInt(req.query.year, 10)
  const month = parseInt(req.query.month, 10)
  if (!year || !month || isNaN(year) || isNaN(month) || year < 2020 || year > 2100 || month < 1 || month > 12) {
    return res.status(400).json({ error: 'Anno e mese non validi' })
  }

  try {
    const pool = getDb()
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`

    const result = await pool.query(
      "SELECT date, start_hour, end_hour FROM bookings WHERE date >= $1 AND date <= $2 AND status = 'confirmed'",
      [startDate, endDate]
    )

    const dateMap = {}
    for (const booking of result.rows) {
      if (!dateMap[booking.date]) dateMap[booking.date] = new Set()
      for (let h = booking.start_hour; h < booking.end_hour; h++) {
        dateMap[booking.date].add(h)
      }
    }

    const TOTAL_SLOTS = 15
    const response = {}
    for (const [date, hours] of Object.entries(dateMap)) {
      response[date] = {
        occupiedCount: hours.size,
        fullyBooked: hours.size >= TOTAL_SLOTS
      }
    }

    res.json(response)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

module.exports = router
