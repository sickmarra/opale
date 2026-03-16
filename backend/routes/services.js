const express = require('express')
const { getDb } = require('../database')
const { authenticate, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// GET /api/services — public
router.get('/', (req, res) => {
  const db = getDb()
  const services = db.prepare('SELECT * FROM services ORDER BY name').all()
  res.json(services)
})

// POST /api/services — admin only
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { name, description, price } = req.body
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Nome e prezzo sono obbligatori' })
  }
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'Prezzo non valido' })
  }

  const db = getDb()
  const result = db.prepare(
    'INSERT INTO services (name, description, price) VALUES (?, ?, ?)'
  ).run(name.trim(), description?.trim() || null, price)

  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(service)
})

// PUT /api/services/:id — admin only
router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const { name, description, price } = req.body
  const db = getDb()
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id)
  if (!service) return res.status(404).json({ error: 'Servizio non trovato' })

  db.prepare(
    'UPDATE services SET name = ?, description = ?, price = ? WHERE id = ?'
  ).run(
    name?.trim() || service.name,
    description?.trim() ?? service.description,
    price ?? service.price,
    req.params.id
  )

  const updated = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id)
  res.json(updated)
})

// DELETE /api/services/:id — admin only
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDb()
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id)
  if (!service) return res.status(404).json({ error: 'Servizio non trovato' })

  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id)
  res.json({ message: 'Servizio eliminato' })
})

module.exports = router
