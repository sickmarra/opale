const express = require('express')
const { getDb } = require('../database')
const { authenticate, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// GET /api/services — public
router.get('/', async (req, res) => {
  try {
    const pool = getDb()
    const result = await pool.query('SELECT * FROM services ORDER BY name')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// POST /api/services — admin only
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, description, price } = req.body
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Nome e prezzo sono obbligatori' })
  }
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'Prezzo non valido' })
  }

  try {
    const pool = getDb()
    const result = await pool.query(
      'INSERT INTO services (name, description, price) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), description?.trim() || null, price]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// PUT /api/services/:id — admin only
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, description, price } = req.body
  try {
    const pool = getDb()
    const serviceResult = await pool.query('SELECT * FROM services WHERE id = $1', [req.params.id])
    const service = serviceResult.rows[0]
    if (!service) return res.status(404).json({ error: 'Servizio non trovato' })

    const result = await pool.query(
      'UPDATE services SET name = $1, description = $2, price = $3 WHERE id = $4 RETURNING *',
      [
        name?.trim() || service.name,
        description?.trim() ?? service.description,
        price ?? service.price,
        req.params.id
      ]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// DELETE /api/services/:id — admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const pool = getDb()
    const serviceResult = await pool.query('SELECT * FROM services WHERE id = $1', [req.params.id])
    if (!serviceResult.rows[0]) return res.status(404).json({ error: 'Servizio non trovato' })

    await pool.query('DELETE FROM services WHERE id = $1', [req.params.id])
    res.json({ message: 'Servizio eliminato' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

module.exports = router
