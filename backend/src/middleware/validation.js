// Validation middleware using simple validation rules
export const validate = (schema) => {
  return (req, res, next) => {
    const errors = []

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field]

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`)
        continue
      }

      // Skip other validations if field is not required and not provided
      if (!rules.required && (value === undefined || value === null)) {
        continue
      }

      // Type check
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`)
      }

      // Min length check
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`)
      }

      // Max length check
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must not exceed ${rules.maxLength} characters`)
      }

      // Enum check
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`)
      }

      // Min value check
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`)
      }

      // Max value check
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must not exceed ${rules.max}`)
      }

      // Custom validation
      if (rules.custom && !rules.custom(value)) {
        errors.push(rules.customMessage || `${field} is invalid`)
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors })
    }

    next()
  }
}

// Common validation schemas
export const workspaceValidation = {
  name: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 255
  }
}

export const taskValidation = {
  workspace_id: {
    required: true,
    type: 'string'
  },
  title: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 500
  },
  description: {
    required: false,
    type: 'string',
    maxLength: 5000
  },
  priority: {
    required: false,
    type: 'string',
    enum: ['low', 'medium', 'high', 'critical']
  },
  status: {
    required: false,
    type: 'string',
    enum: ['pending', 'in_progress', 'completed', 'cancelled']
  },
  goal_time_minutes: {
    required: false,
    type: 'number',
    min: 0
  }
}

export const taskUpdateValidation = {
  title: {
    required: false,
    type: 'string',
    minLength: 1,
    maxLength: 500
  },
  description: {
    required: false,
    type: 'string',
    maxLength: 5000
  },
  priority: {
    required: false,
    type: 'string',
    enum: ['low', 'medium', 'high', 'critical']
  },
  status: {
    required: false,
    type: 'string',
    enum: ['pending', 'in_progress', 'completed', 'cancelled']
  },
  goal_time_minutes: {
    required: false,
    type: 'number',
    min: 0
  },
  actual_time_minutes: {
    required: false,
    type: 'number',
    min: 0
  }
}

export const userUpdateValidation = {
  email: {
    required: false,
    type: 'string',
    custom: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    customMessage: 'email must be a valid email address'
  },
  profile_img: {
    required: false,
    type: 'string'
  }
}
