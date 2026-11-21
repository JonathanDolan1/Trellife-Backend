import './setup.js'
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { ObjectId } from 'mongodb'

const { dbService } = await import('../services/db.service.js')
const { updateUser, updateUserFavorites } = await import('../api/user/user.controller.js')
const { makeCollection, makeRes } = await import('./fakes.js')

const aliceId = new ObjectId()
const bobId = new ObjectId()
const liveBoardId = new ObjectId()
const deletedBoardId = new ObjectId().toString()
let users
let boards

beforeEach(() => {
    users = makeCollection([
        { _id: aliceId, username: 'alice', password: 'hash-a', fullname: 'Alice', favorites: [deletedBoardId], isAdmin: false },
        { _id: bobId, username: 'bob', password: 'hash-b', fullname: 'Bob', favorites: [deletedBoardId, liveBoardId.toString()] },
    ])
    boards = makeCollection([{ _id: liveBoardId, title: 'live' }])
    dbService.getCollection = async (name) => {
        if (name === 'user') return users
        if (name === 'board') return boards
        throw new Error('unexpected collection ' + name)
    }
})

function aliceRequest(params, body) {
    return { params, body, loggedinUser: { _id: aliceId.toString(), fullname: 'Alice' } }
}

test('a user cannot update another user', async () => {
    const res = makeRes()
    await updateUser(aliceRequest({ id: bobId.toString() }, { fullname: 'Hacked' }), res)
    assert.equal(res.statusCode, 403)
    const bob = users.store.find(u => u._id.equals(bobId))
    assert.equal(bob.fullname, 'Bob')
})

test('a user can update their own name, but not username, password or isAdmin', async () => {
    const res = makeRes()
    const body = { fullname: 'Alice B', username: 'bob', password: 'x', isAdmin: true }
    await updateUser(aliceRequest({ id: aliceId.toString() }, body), res)
    assert.equal(res.statusCode, 200)
    const alice = users.store.find(u => u._id.equals(aliceId))
    assert.equal(alice.fullname, 'Alice B')
    assert.equal(alice.username, 'alice')
    assert.equal(alice.password, 'hash-a')
    assert.equal(alice.isAdmin, false)
    assert.equal(res.body.password, undefined)
})

test('favorites cleanup is refused while the board still exists', async () => {
    const res = makeRes()
    await updateUserFavorites(aliceRequest({}, { boardId: liveBoardId.toString() }), res)
    assert.equal(res.statusCode, 409)
    const bob = users.store.find(u => u._id.equals(bobId))
    assert.ok(bob.favorites.includes(liveBoardId.toString()))
})

test('favorites cleanup rejects a non-string board id', async () => {
    const res = makeRes()
    await updateUserFavorites(aliceRequest({}, { boardId: { $ne: null } }), res)
    assert.equal(res.statusCode, 400)
})

test('favorites cleanup works after the board is deleted', async () => {
    const res = makeRes()
    await updateUserFavorites(aliceRequest({}, { boardId: deletedBoardId }), res)
    assert.equal(res.statusCode, 200)
    for (const user of users.store) {
        assert.equal(user.favorites.includes(deletedBoardId), false)
    }
})
