// Shared test setup. Tests never touch the network or a real database.
// The values below are dummies that exist only so the modules can load.
process.env.MONGO_URL = 'mongodb://test-only.invalid/none'
process.env.SECRET1 = 'dummy-value-for-tests-only'
process.env.NODE_ENV = 'test'
