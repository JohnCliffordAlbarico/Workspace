import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { validate, categoryValidation } from '../middleware/validation.js'
import { auditLog } from '../middleware/auditLog.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import {
  getCategories,
  getCompletedCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  completeCategory,
  reopenCategory,
  getCategoryStats,
  getAllCategoryStats,
  getAllocationHistory,
  reorderCategories
} from '../handlers/categoryHandlers.js'

const router = express.Router()

// Get all active categories
router.get('/', authenticate, asyncHandler(getCategories))

// Get completed categories
router.get('/completed', authenticate, asyncHandler(getCompletedCategories))

// Batch stats for all categories (must be before /:id routes)
router.get('/stats', authenticate, asyncHandler(getAllCategoryStats))

// Reorder categories (must be before /:id routes)
router.put('/reorder', writeLimiter, authenticate, auditLog('focus_categories'), asyncHandler(reorderCategories))

// Get category by ID
router.get('/:id', authenticate, asyncHandler(getCategoryById))

// Get category stats
router.get('/:id/stats', authenticate, asyncHandler(getCategoryStats))

// Get allocation history
router.get('/:id/allocation-history', authenticate, asyncHandler(getAllocationHistory))

// Create category
router.post('/', writeLimiter, authenticate, validate(categoryValidation), auditLog('focus_categories'), asyncHandler(createCategory))

// Update category
router.put('/:id', writeLimiter, authenticate, validate(categoryValidation), auditLog('focus_categories'), asyncHandler(updateCategory))

// Delete category
router.delete('/:id', writeLimiter, authenticate, auditLog('focus_categories'), asyncHandler(deleteCategory))

// Complete category
router.patch('/:id/complete', writeLimiter, authenticate, auditLog('focus_categories'), asyncHandler(completeCategory))

// Reopen category
router.patch('/:id/reopen', writeLimiter, authenticate, auditLog('focus_categories'), asyncHandler(reopenCategory))

export default router
