const dbURL = process.env.MONGO_URL
if (!dbURL) {
  throw new Error('MONGO_URL is not set. Put it in the Render environment (or a local .env).')
}

export default {
  dbURL,
  dbName: process.env.DB_NAME || 'trellifeDB'
}
