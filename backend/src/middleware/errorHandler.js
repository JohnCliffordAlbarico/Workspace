// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Default error
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal server error'

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = err.message
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    statusCode = 409
    message = 'Resource already exists'
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    statusCode = 400
    message = 'Invalid reference to related resource'
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Route not found' })
}

// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
