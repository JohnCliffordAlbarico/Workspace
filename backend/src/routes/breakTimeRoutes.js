import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { auditLog } from '../middleware/auditLog.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import {
  getBreakTimes,
  getAvailableBreakMinutes,
  createBreakTime,
  activateBreakTime,
  completeBreakTime,
  deleteBreakTime
} from '../handlers/breakTimeHandlers.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Get all break time entries (optionally filtered by status)
router.get('/', asyncHandler(getBreakTimes))

// Get total available break minutes
router.get('/available', asyncHandler(getAvailableBreakMinutes))

// Create break time entry
router.post('/', writeLimiter, auditLog('break_time'), asyncHandler(createBreakTime))

// Activate break time (start using break minutes)
router.post('/activate', writeLimiter, auditLog('break_time'), asyncHandler(activateBreakTime))

// Complete break time
router.put('/:id/complete', writeLimiter, auditLog('break_time'), asyncHandler(completeBreakTime))

// Delete break time entry
router.delete('/:id', writeLimiter, auditLog('break_time'), asyncHandler(deleteBreakTime))

export default router
