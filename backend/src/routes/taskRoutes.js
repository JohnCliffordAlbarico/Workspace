import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { auditLog } from '../middleware/auditLog.js'
import { validate, taskValidation, taskUpdateValidation } from '../middleware/validation.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import {
  getTasks,
  getTaskById,
  getSubtasks,
  createTask,
  updateTask,
  deleteTask
} from '../handlers/taskHandlers.js'

const router = express.Router()

// Get all tasks (optionally filtered by workspace)
router.get('/', authenticate, asyncHandler(getTasks))

// Get task by ID
router.get('/:id', authenticate, asyncHandler(getTaskById))

// Get subtasks for a parent task
router.get('/:id/subtasks', authenticate, asyncHandler(getSubtasks))

// Create task
router.post('/', writeLimiter, authenticate, validate(taskValidation), auditLog('tasks'), asyncHandler(createTask))

// Update task
router.put('/:id', writeLimiter, authenticate, validate(taskUpdateValidation), auditLog('tasks'), asyncHandler(updateTask))

// Delete task
router.delete('/:id', writeLimiter, authenticate, auditLog('tasks'), asyncHandler(deleteTask))

export default router
