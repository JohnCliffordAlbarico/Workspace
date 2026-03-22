import express from 'express'
import multer from 'multer'
import {
  getMusicPreferences,
  getActivePlatformPlaylist,
  createMusicPreference,
  updateMusicPreference,
  deleteMusicPreference,
  uploadPlaylistCover,
  deletePlaylistCover
} from '../handlers/musicHandlers.js'
import { authenticate } from '../middleware/auth.js'
import { musicLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

// Apply music-specific rate limiter
router.use(musicLimiter)

// All routes require authentication
router.use(authenticate)

// Get all music preferences
router.get('/', getMusicPreferences)

// Get active playlist for specific platform
router.get('/active/:platform', getActivePlatformPlaylist)

// Create new music preference
router.post('/', createMusicPreference)

// Update music preference
router.put('/:id', updateMusicPreference)

// Delete music preference
router.delete('/:id', deleteMusicPreference)

// Upload playlist cover image
router.post('/:id/cover', upload.single('image'), uploadPlaylistCover)

// Delete playlist cover image
router.delete('/:id/cover', deletePlaylistCover)

export default router
