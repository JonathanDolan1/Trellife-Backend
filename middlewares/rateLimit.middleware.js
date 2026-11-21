import { rateLimit } from 'express-rate-limit'
import { config } from '../config/index.js'

// Limits password guessing and mass signups. Counts per IP address and
// lives in memory, so it resets when the server restarts.
export const authRateLimit = rateLimit({
    windowMs: config.authRateLimit.windowMs,
    limit: config.authRateLimit.limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { err: 'Too many attempts, please try again later' },
})
