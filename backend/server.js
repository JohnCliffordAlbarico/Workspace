import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './src/routes/userRoutes.js'
import workspaceRoutes from './src/routes/workspaceRoutes.js'
import taskRoutes from './src/routes/taskRoutes.js'
import { apiLimiter } from './src/middleware/rateLimiter.js'
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js'

dotenv.config()

const app = express()

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL_PROD]
  : [process.env.FRONTEND_URL_DEV]

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

// Middleware
app.use(express.json())
app.use(apiLimiter)

app.get('/', (req, res) => {
  res.send(`Server running `);
})

// Mount routes
app.use('/api/users', userRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/tasks', taskRoutes)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

app.listen(process.env.PORT, () => {
  console.log(`Server running on port http://localhost:${process.env.PORT}`)
})
