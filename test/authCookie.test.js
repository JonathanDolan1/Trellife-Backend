import './setup.js'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const { authService } = await import('../api/auth/auth.service.js')
const { login } = await import('../api/auth/auth.controller.js')
const { makeRes } = await import('./fakes.js')

test('login sets an httpOnly, sameSite=lax cookie with a 7-day lifetime', async (t) => {
    t.mock.method(authService, 'login', async () => ({ _id: 'u1', fullname: 'Alice' }))
    const res = makeRes()
    await login({ body: { username: 'alice', password: 'pw' } }, res)
    assert.equal(res.cookies.length, 1)
    const options = res.cookies[0].options
    assert.equal(options.httpOnly, true)
    assert.equal(options.sameSite, 'lax')
    assert.equal(options.maxAge, 7 * 24 * 60 * 60 * 1000)
})
