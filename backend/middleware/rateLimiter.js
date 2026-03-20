/**
 * In-memory rate limiter — nessuna dipendenza npm.
 * Usa una Map per tracciare le richieste per IP + path.
 * Compatibile con proxy Render (legge x-forwarded-for).
 */
const store = new Map()

// Pulizia periodica delle entry scadute (ogni 5 min)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000).unref?.()

function createLimiter(maxRequests, windowMs, message) {
  return function rateLimitMiddleware(req, res, next) {
    const forwarded = req.headers['x-forwarded-for']
    const ip = forwarded ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress || 'unknown')
    const key = `${req.path}:${ip}`
    const now = Date.now()

    let entry = store.get(key)
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowMs }
      store.set(key, entry)
    }
    entry.count++

    const remaining = Math.max(0, maxRequests - entry.count)
    res.setHeader('X-RateLimit-Limit', maxRequests)
    res.setHeader('X-RateLimit-Remaining', remaining)
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000))

    if (entry.count > maxRequests) {
      return res.status(429).json({ error: message })
    }
    next()
  }
}

// 10 tentativi per 15 minuti (login, register, reset password)
const authLimiter = createLimiter(
  10,
  15 * 60 * 1000,
  'Troppi tentativi. Riprova tra 15 minuti.'
)

// 3 email per ora (resend-verification, forgot-password)
const emailLimiter = createLimiter(
  3,
  60 * 60 * 1000,
  "Troppe richieste email. Riprova tra un'ora."
)

module.exports = { authLimiter, emailLimiter }
