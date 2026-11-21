import './setup.js'
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { ObjectId } from 'mongodb'

const { dbService } = await import('../services/db.service.js')
const { boardService } = await import('../api/board/board.service.js')
const { makeCollection } = await import('./fakes.js')

const boardA = new ObjectId()
const boardB = new ObjectId()
const alice = { _id: 'alice', fullname: 'Alice', imgUrl: 'a.png' }
const mallory = { _id: 'mallory', fullname: 'Mallory', imgUrl: 'm.png' }
let collection

beforeEach(() => {
    collection = makeCollection([
        { _id: boardA, title: 'A', createdBy: alice, members: [alice] },
        { _id: boardB, title: 'B', createdBy: alice, members: [alice] },
    ])
    dbService.getCollection = async () => collection
})

test('update uses the URL id, not an _id in the body', async () => {
    await boardService.update(boardA.toString(), { _id: boardB.toString(), title: 'changed' }, mallory)
    const a = collection.store.find(doc => doc._id.equals(boardA))
    const b = collection.store.find(doc => doc._id.equals(boardB))
    assert.equal(a.title, 'changed')
    assert.equal(b.title, 'B')
})

test('update cannot replace createdBy', async () => {
    await boardService.update(boardA.toString(), { createdBy: mallory }, mallory)
    const a = collection.store.find(doc => doc._id.equals(boardA))
    assert.equal(a.createdBy._id, 'alice')
})

test('update cannot remove members or add someone else', async () => {
    const stranger = { _id: 'stranger', fullname: 'S' }
    await boardService.update(boardA.toString(), { members: [stranger] }, mallory)
    const a = collection.store.find(doc => doc._id.equals(boardA))
    assert.deepEqual(a.members.map(m => m._id), ['alice'])
})

test('a user can join a board (add themselves)', async () => {
    await boardService.update(boardA.toString(), { members: [alice, { _id: 'mallory', fullname: 'Fake name' }] }, mallory)
    const a = collection.store.find(doc => doc._id.equals(boardA))
    assert.deepEqual(a.members.map(m => m._id), ['alice', 'mallory'])
    // Identity comes from the login token, not from the request body.
    assert.equal(a.members[1].fullname, 'Mallory')
})

test('update returns the saved board with its id', async () => {
    const saved = await boardService.update(boardA.toString(), { title: 'x' }, alice)
    assert.equal(saved._id, boardA.toString())
    assert.equal(saved.createdBy._id, 'alice')
})
