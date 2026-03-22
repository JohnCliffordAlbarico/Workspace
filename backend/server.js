import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import compression from 'compression'
import authRoutes from './src/routes/authRoutes.js'
import userRoutes from './src/routes/userRoutes.js'
import workspaceRoutes from './src/routes/workspaceRoutes.js'
import taskRoutes from './src/routes/taskRoutes.js'
import musicRoutes from './src/routes/musicRoutes.js'
import { apiLimiter } from './src/middleware/rateLimiter.js'
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js'

dotenv.config()

const app = express()

// Enable compression for all responses
app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  }
}))

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL_PROD]
  : [process.env.FRONTEND_URL_DEV]

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  next()
})

// Cache control for API responses
app.use((req, res, next) => {
  // Don't cache by default
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  next()
})

app.use(apiLimiter)

app.get('/', (req, res) => {
  res.send('Server running')
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Mount routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/music', musicRoutes)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
