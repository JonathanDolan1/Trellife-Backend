import express from 'express'
import http from 'http'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import compression from 'compression'
import helmet from 'helmet'
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'
import { logger } from './services/logger.service.js'
import './config.js'
import { config, getAllowedOrigins } from './config/index.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

logger.info('server.js loaded...')

const app = express()
// Render puts one proxy in front of the app. Trusting exactly one hop lets
// the rate limiter see the real client IP instead of the proxy's.
app.set('trust proxy', 1)
const server = http.createServer(app)

// Express App Config
// Standard security headers (no sniffing, frame protection, HSTS, etc.).
// The content security policy is off for now: the built app loads images
// and scripts from several outside hosts, and a wrong policy would break
// the page. Tightening it is a follow-up.
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cookieParser())
app.use(express.json({ limit: config.maxBodySize }))
app.use(express.urlencoded({ limit: config.maxBodySize, extended: true }))
app.use(express.static('public'))
app.use(compression())

// Production allows only the deployed site; local dev also allows the
// Vite and test ports.
const corsOptions = {
    origin: getAllowedOrigins(),
    credentials: true,
}

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')))
}
app.use(cors(corsOptions))

// Routes and Socket
import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { boardRoutes } from './api/board/board.routes.js'
import { openAiRoutes } from './api/open-ai/open-ai.routes.js'
import { setupSocketAPI } from './services/socket.service.js'


app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 413) {
        console.error('Request entity too large:', err)
        return res.status(413).json({ error: 'Request entity too large' })
    }
    next(err)
})

app.all('*', setupAsyncLocalStorage)


// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/board', boardRoutes)
app.use('/api/open-ai', openAiRoutes)

setupSocketAPI(server)

app.use((req, res, next) => {
    console.log(`Unmatched route: ${req.method} ${req.url}`)
    next()
})

// Make every unmatched server-side-route fall back to index.html
app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3030

server.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})