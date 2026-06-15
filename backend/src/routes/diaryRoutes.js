import express from 'express'
import multer from 'multer'
import { authenticate } from '../middleware/auth.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import {
  getDiaryEntries,
  getDiaryEntry,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
  uploadDiaryCover,
  deleteDiaryCover
} from '../handlers/diaryHandlers.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

// All routes require authentication
router.use(authenticate)

router.get('/', asyncHandler(getDiaryEntries))
router.get('/:id', asyncHandler(getDiaryEntry))
router.post('/', writeLimiter, asyncHandler(createDiaryEntry))
router.put('/:id', writeLimiter, asyncHandler(updateDiaryEntry))
router.delete('/:id', writeLimiter, asyncHandler(deleteDiaryEntry))
router.post('/:id/cover', writeLimiter, upload.single('image'), asyncHandler(uploadDiaryCover))
router.delete('/:id/cover', writeLimiter, asyncHandler(deleteDiaryCover))

export default router
