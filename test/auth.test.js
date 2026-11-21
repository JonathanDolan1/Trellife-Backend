import './setup.js'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import Cryptr from 'cryptr'

const { authService } = await import('../api/auth/auth.service.js')

const user = { _id: 'u1', fullname: 'Alice', imgUrl: 'a.png' }

test('a fresh login token is valid', () => {
    const encoded = authService.getLoginToken(user)
    const decoded = authService.validateToken(encoded)
    assert.equal(decoded._id, 'u1')
})

test('a login token older than 7 days is rejected', (t) => {
    const encoded = authService.getLoginToken(user)
    const eightDays = 8 * 24 * 60 * 60 * 1000
    t.mock.method(Date, 'now', () => Date.prototype.getTime.call(new Date()) + eightDays)
    assert.equal(authService.validateToken(encoded), null)
})

test('an old-style login token with no issue time is rejected', () => {
    const cryptr = new Cryptr(process.env.SECRET1)
    const oldStyle = cryptr.encrypt(JSON.stringify(user))
    assert.equal(authService.validateToken(oldStyle), null)
})

test('a garbage login token is rejected without throwing', () => {
    assert.equal(authService.validateToken('not-a-real-value'), null)
})
