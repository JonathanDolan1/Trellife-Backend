import './setup.js'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const { authService } = await import('../api/auth/auth.service.js')
const { userService } = await import('../api/user/user.service.js')
const { utilService } = await import('../services/util.service.js')

test('login rejects an object instead of a username before any database call', async (t) => {
    const lookup = t.mock.method(userService, 'getByUsername', async () => null)
    await assert.rejects(authService.login({ $ne: null }, 'pw'))
    assert.equal(lookup.mock.callCount(), 0)
})

test('login rejects an object instead of a password', async (t) => {
    t.mock.method(userService, 'getByUsername', async () => null)
    await assert.rejects(authService.login('alice', { $gt: '' }))
})

test('signup rejects a password over 72 bytes', async (t) => {
    const add = t.mock.method(userService, 'add', async () => ({}))
    await assert.rejects(authService.signup('alice', 'x'.repeat(73), 'Alice'))
    assert.equal(add.mock.callCount(), 0)
})

test('signup rejects a missing full name', async (t) => {
    t.mock.method(userService, 'add', async () => ({}))
    await assert.rejects(authService.signup('alice', 'pw', ''))
})

test('escapeRegex makes regex characters literal', () => {
    const pattern = new RegExp(utilService.escapeRegex('a.*(b)+[c]'))
    assert.equal(pattern.test('a.*(b)+[c]'), true)
    assert.equal(pattern.test('aXXXbbc'), false)
})
