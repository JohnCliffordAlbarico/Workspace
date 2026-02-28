import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { login, register, logout, getSession } from '../handlers/authHandlers.js'

const router = express.Router()

// Login
router.post('/login', authLimiter, asyncHandler(login))

// Register
router.post('/register', authLimiter, asyncHandler(register))

// Logout
router.post('/logout', authenticate, asyncHandler(logout))

// Get current session
router.get('/session', authenticate, asyncHandler(getSession))

export default router
