import configProd from './prod.js'
import configDev from './dev.js'


export var config

if (process.env.NODE_ENV === 'production') {
  config = configProd
} else {
  config = configDev
}

// Guest mode lets requests with no login through as an anonymous "Guest".
// Off unless GUEST_MODE=true. The public demo logs in as a real Guest
// account instead, so it does not need this.
config.isGuestMode = process.env.GUEST_MODE === 'true'

// Security tuning, all in one place.
// Login and signup attempts allowed per IP address in each time window.
config.authRateLimit = {
  windowMs: 15 * 60 * 1000,
  limit: 20,
}
// Largest JSON or form body the server accepts.
config.maxBodySize = '2mb'
// Browser origins allowed to call the API and open sockets in production.
config.allowedOrigins = ['https://trellife.onrender.com']
const devOrigins = [
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://localhost:3000',
]

export function getAllowedOrigins() {
  if (process.env.NODE_ENV === 'production') return config.allowedOrigins
  return [...config.allowedOrigins, ...devOrigins]
}


