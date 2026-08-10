import { supabaseAdmin } from '../config/supabase.js'
import { encrypt, decrypt } from './crypto.js'

/**
 * Check if a category's recurrence is due and generate a task if needed.
 * @param {Object} category - The category row from the database
 * @returns {Object|null} The created task, or null if no task was needed
 */
const generateTaskForCategory = async (category) => {
  const now = new Date()
  const lastGenerated = category.last_generated_at ? new Date(category.last_generated_at) : null

  // Determine if we need to generate based on pattern and last_generated_at
  if (lastGenerated) {
    const diffMs = now.getTime() - lastGenerated.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    switch (category.recurrence_pattern) {
      case 'daily':
        // Only generate if at least 1 day has passed
        if (diffDays < 0.95) return null
        break
      case 'weekly':
        // Only generate if at least 7 days have passed
        if (diffDays < 6.95) return null
        break
      case 'monthly':
        // Only generate if at least 28 days have passed (handle variable month lengths)
        if (diffDays < 27.95) return null
        break
      default:
        return null
    }
  }

  // Count existing tasks for this category to determine the next number
  const { count, error: countError } = await supabaseAdmin
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', category.id)
    .eq('user_id', category.user_id)

  if (countError) {
    console.error('Error counting tasks for category:', countError)
    return null
  }

  const taskNumber = (count || 0) + 1

  // Format the date for the title
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const title = `${category.name} #${taskNumber} - ${dateStr}`

  // Get the next position value
  const { data: maxPosTask } = await supabaseAdmin
    .from('tasks')
    .select('position')
    .eq('category_id', category.id)
    .eq('user_id', category.user_id)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const nextPosition = (maxPosTask?.position ?? -1) + 1

  // Calculate due date based on pattern
  let dueDate = null
  switch (category.recurrence_pattern) {
    case 'daily':
      dueDate = new Date(now)
      dueDate.setDate(dueDate.getDate() + 1)
      break
    case 'weekly':
      dueDate = new Date(now)
      dueDate.setDate(dueDate.getDate() + 7)
      break
    case 'monthly': {
      dueDate = new Date(now)
      const targetMonth = dueDate.getMonth() + 1
      const targetYear = dueDate.getFullYear() + Math.floor(targetMonth / 12)
      const normalizedMonth = targetMonth % 12
      const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate()
      dueDate.setDate(Math.min(dueDate.getDate(), lastDay))
      dueDate.setMonth(normalizedMonth)
      dueDate.setFullYear(targetYear)
      break
    }
  }

  // Create the task
  const { data: task, error: createError } = await supabaseAdmin
    .from('tasks')
    .insert({
      category_id: category.id,
      user_id: category.user_id,
      title: encrypt(title),
      description: null,
      priority: 'medium',
      status: 'pending',
      position: nextPosition,
      due_date: dueDate ? dueDate.toISOString() : null,
      recurrence_pattern: 'none',  // Generated tasks don't recurse themselves
      recurring_series_id: null
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating recurring task:', createError)
    return null
  }

  // Update last_generated_at on the category
  await supabaseAdmin
    .from('focus_categories')
    .update({ last_generated_at: now.toISOString() })
    .eq('id', category.id)

  return {
    ...task,
    title: decrypt(task.title),
    description: task.description ? decrypt(task.description) : null
  }
}

/**
 * Check all recurring categories and generate tasks where needed.
 * Called on server start and periodically.
 */
export const checkRecurringCategories = async () => {
  try {
    // Find all active categories with a recurrence pattern set
    const { data: categories, error } = await supabaseAdmin
      .from('focus_categories')
      .select('*')
      .eq('status', 'active')
      .neq('recurrence_pattern', 'none')

    if (error) {
      console.error('Error fetching recurring categories:', error)
      return
    }

    if (!categories || categories.length === 0) return

    let generated = 0
    for (const category of categories) {
      const task = await generateTaskForCategory(category)
      if (task) {
        generated++
        console.log(`[Scheduler] Generated task: ${task.title} for category "${category.name}"`)
      }
    }

    if (generated > 0) {
      console.log(`[Scheduler] Generated ${generated} recurring task(s)`)
    }
  } catch (error) {
    console.error('[Scheduler] Error checking recurring categories:', error)
  }
}

/**
 * Start the scheduler — runs immediately on startup, then every hour.
 */
export const startCategoryScheduler = () => {
  // Run once shortly after server start (give DB connection time to establish)
  setTimeout(() => {
    checkRecurringCategories()
  }, 5000)

  // Then check every hour
  setInterval(() => {
    checkRecurringCategories()
  }, 60 * 60 * 1000) // 1 hour
}
