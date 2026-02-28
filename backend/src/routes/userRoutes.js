import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { auditLog } from '../middleware/auditLog.js'
import { validate, userUpdateValidation } from '../middleware/validation.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import {
  getCurrentUser,
  updateUser,
  getUserByPublicId
} from '../handlers/userHandlers.js'

const router = express.Router()

// Get current user profile
router.get('/me', authenticate, asyncHandler(getCurrentUser))

// Update user profile
router.put('/me', authenticate, validate(userUpdateValidation), auditLog('users'), asyncHandler(updateUser))

// Get user by public_id
router.get('/:publicId', authenticate, asyncHandler(getUserByPublicId))

export default router
