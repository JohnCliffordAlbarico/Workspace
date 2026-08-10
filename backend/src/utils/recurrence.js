/**
 * Calculate the next due date based on recurrence pattern
 * @param {Date|string} currentDueDate - The due_date of the completed task
 * @param {string} pattern - 'daily' | 'weekly' | 'monthly'
 * @returns {string|null} ISO 8601 date string for the next occurrence, or null if pattern is invalid
 */
export const calculateNextDueDate = (currentDueDate, pattern) => {
  const base = currentDueDate ? new Date(currentDueDate) : new Date()

  switch (pattern) {
    case 'daily':
      base.setDate(base.getDate() + 1)
      break
    case 'weekly':
      base.setDate(base.getDate() + 7)
      break
    case 'monthly': {
      const targetMonth = base.getMonth() + 1
      const targetYear = base.getFullYear() + Math.floor(targetMonth / 12)
      const normalizedMonth = targetMonth % 12
      // Get last day of target month to handle month-end edge cases
      // e.g., Jan 31 → Feb 28 (not Mar 3)
      const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate()
      base.setDate(Math.min(base.getDate(), lastDay))
      base.setMonth(normalizedMonth)
      base.setFullYear(targetYear)
      break
    }
    default:
      return null
  }

  return base.toISOString()
}
