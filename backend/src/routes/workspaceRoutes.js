import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { auditLog } from '../middleware/auditLog.js'
import { validate, workspaceValidation } from '../middleware/validation.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
} from '../handlers/workspaceHandlers.js'

const router = express.Router()

// Get all workspaces for current user
router.get('/', authenticate, asyncHandler(getWorkspaces))

// Get workspace by ID
router.get('/:id', authenticate, asyncHandler(getWorkspaceById))

// Create workspace
router.post('/', writeLimiter, authenticate, validate(workspaceValidation), auditLog('workspaces'), asyncHandler(createWorkspace))

// Update workspace
router.put('/:id', writeLimiter, authenticate, validate(workspaceValidation), auditLog('workspaces'), asyncHandler(updateWorkspace))

// Delete workspace
router.delete('/:id', writeLimiter, authenticate, auditLog('workspaces'), asyncHandler(deleteWorkspace))

export default router
