import { supabaseAdmin } from '../config/supabase.js'
import { encrypt, decrypt } from './crypto.js'

/**
 * Get today's date range boundaries (start and end of day in UTC).
 * @returns {{ start: string, end: string }} ISO 8601 timestamps
 */
const getTodayRange = () => {
  const now = new Date()
  const start = new Date(now)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setUTCHours(23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

/**
 * Check if a category's recurrence is due and generate a task if needed.
 * Logic: if the category already has at least one task for today, skip.
 * Otherwise, create a new task with format "Category Name #N - Month DD, YYYY".
 * @param {Object} category - The category row from the database
 * @returns {Object|null} The created task, or null if no task was needed
 */
const generateTaskForCategory = async (category) => {
  const now = new Date()
  const { start: todayStart, end: todayEnd } = getTodayRange()

  // ─── Guard: already has a task for today? → skip ─────────────
  const { data: existingToday, error: checkError } = await supabaseAdmin
    .from('tasks')
    .select('id')
    .eq('category_id', category.id)
    .eq('user_id', category.user_id)
    .neq('status', 'cancelled')
    .gte('due_date', todayStart)
    .lte('due_date', todayEnd)
    .limit(1)

  if (checkError) {
    console.error('[Scheduler] Error checking today\'s tasks:', checkError)
    return null
  }

  if (existingToday && existingToday.length > 0) {
    // Already has a task for today — skip generation
    return null
  }

  // ─── Decrypt category name (stored encrypted in DB) ────────
  const categoryName = decrypt(category.name)

  // ─── Count all non-cancelled tasks in this category for numbering ──
  const { count, error: countError } = await supabaseAdmin
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', category.id)
    .eq('user_id', category.user_id)
    .neq('status', 'cancelled')

  if (countError) {
    console.error('[Scheduler] Error counting tasks:', countError)
    return null
  }

  const taskNumber = (count || 0) + 1

  // ─── Format title: "Category Name #N - Mon DD, YYYY" ──────────
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
  const title = `${categoryName} #${taskNumber} - ${dateStr}`

  // ─── Get next position ────────────────────────────────────────
  const { data: maxPosTask } = await supabaseAdmin
    .from('tasks')
    .select('position')
    .eq('category_id', category.id)
    .eq('user_id', category.user_id)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const nextPosition = (maxPosTask?.position ?? -1) + 1

  // ─── Calculate due date based on pattern ──────────────────────
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

  // ─── Create the task ──────────────────────────────────────────
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
    console.error('[Scheduler] Error creating recurring task:', createError)
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
        console.log(`[Scheduler] Generated task: ${task.title} for category "${decrypt(category.name)}"`)
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
