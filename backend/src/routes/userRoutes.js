import express from 'express'
import multer from 'multer'
import { authenticate } from '../middleware/auth.js'
import { 
  getProfile, 
  updateProfile, 
  uploadProfileImage,
  deleteProfileImage,
  changePassword
} from '../handlers/userHandlers.js'

const router = express.Router()

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Profile routes
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, updateProfile)
router.post('/profile/image', authenticate, upload.single('image'), uploadProfileImage)
router.delete('/profile/image', authenticate, deleteProfileImage)

// Password routes
router.post('/change-password', authenticate, changePassword)

export default router
