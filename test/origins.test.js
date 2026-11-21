import './setup.js'
import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'

const { getAllowedOrigins, config } = await import('../config/index.js')

afterEach(() => {
    process.env.NODE_ENV = 'test'
})

test('production allows only the deployed site', () => {
    process.env.NODE_ENV = 'production'
    assert.deepEqual(getAllowedOrigins(), ['https://trellife-t8ap.onrender.com'])
})

test('local dev also allows the Vite port', () => {
    assert.ok(getAllowedOrigins().includes('http://localhost:5173'))
})

test('body size limit is 2mb', () => {
    assert.equal(config.maxBodySize, '2mb')
})
