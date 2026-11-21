import './setup.js'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'

const { authService } = await import('../api/auth/auth.service.js')
const { authRoutes } = await import('../api/auth/auth.routes.js')
const { config } = await import('../config/index.js')

// Runs the real auth routes on a throwaway local port (127.0.0.1 only).
test('login is blocked with 429 after the configured number of attempts', async (t) => {
    t.mock.method(authService, 'login', async () => { throw new Error('bad password') })

    const app = express()
    app.use(express.json())
    app.use('/api/auth', authRoutes)
    const server = app.listen(0, '127.0.0.1')
    await new Promise(resolve => server.once('listening', resolve))
    t.after(() => server.close())

    const url = `http://127.0.0.1:${server.address().port}/api/auth/login`
    const statuses = []
    for (let i = 0; i < config.authRateLimit.limit + 1; i++) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'alice', password: 'wrong' }),
        })
        statuses.push(response.status)
    }

    const lastStatus = statuses[statuses.length - 1]
    assert.equal(statuses[0], 401)
    assert.equal(lastStatus, 429)
})
