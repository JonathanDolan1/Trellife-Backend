import express from 'express'
import { login, signup, logout, getCurrentUser } from './auth.controller.js'
import { authRateLimit } from '../../middlewares/rateLimit.middleware.js'

export const authRoutes = express.Router()

authRoutes.get('/user', getCurrentUser)
authRoutes.post('/login', authRateLimit, login)
authRoutes.post('/signup', authRateLimit, signup)
authRoutes.post('/logout', logout)