import './setup.js'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const { requireAuth } = await import('../middlewares/requireAuth.middleware.js')
const { asyncLocalStorage } = await import('../services/als.service.js')
const { makeRes } = await import('./fakes.js')

function runWithUser(loggedinUser, handler) {
    const store = {}
    if (loggedinUser) store.loggedinUser = loggedinUser
    return asyncLocalStorage.run(store, handler)
}

test('anonymous request is rejected with 401 (guest bypass is off by default)', () => {
    const req = {}
    const res = makeRes()
    let nextCalled = false
    runWithUser(null, () => requireAuth(req, res, () => { nextCalled = true }))
    assert.equal(nextCalled, false)
    assert.equal(res.statusCode, 401)
})

test('logged-in request passes and carries the user', () => {
    const req = {}
    const res = makeRes()
    let nextCalled = false
    const user = { _id: 'u1', fullname: 'Alice' }
    runWithUser(user, () => requireAuth(req, res, () => { nextCalled = true }))
    assert.equal(nextCalled, true)
    assert.equal(req.loggedinUser._id, 'u1')
})
