import { supabaseAdmin } from '../config/supabase.js'
import { encrypt, decrypt } from '../utils/crypto.js'
import { calculateNextDueDate } from '../utils/recurrence.js'

// Helper function to calculate and create break time entries
const calculateAndCreateBreakTime = async (userId, taskId, actualTimeMinutes, previousTimeMinutes = 0) => {
  if (!actualTimeMinutes || actualTimeMinutes <= 0) return

  // Calculate how many 25-minute blocks were completed
  const previousBlocks = Math.floor(previousTimeMinutes / 25)
  const currentBlocks = Math.floor(actualTimeMinutes / 25)
  
  // Only create new break time if we crossed a new 25-minute threshold
  const newBlocksEarned = currentBlocks - previousBlocks

  if (newBlocksEarned > 0) {
    // Create break time entries (5 minutes per 25-minute block)
    const breakEntries = []
    for (let i = 0; i < newBlocksEarned; i++) {
      breakEntries.push({
        user_id: userId,
        task_id: taskId,
        earned_minutes: 5,
        remaining_minutes: 5,
        status: 'available'
      })
    }

    const { error } = await supabaseAdmin
      .from('break_time')
      .insert(breakEntries)

    if (error) {
      console.error('Error creating break time:', error)
    }
  }
}

// Get all tasks for a user (optionally filtered by category)
export const getTasks = async (req, res) => {
  try {
    const { categoryId, status, page, limit } = req.query

    let query = supabaseAdmin
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Apply ordering
    query = query
      .order('completed_at', { ascending: false, nullsFirst: false })
      .order('position', { ascending: true })

    // Only apply pagination if page and limit are provided
    if (page && limit) {
      const pageNum = parseInt(page)
      const limitNum = parseInt(limit)
      const offset = (pageNum - 1) * limitNum

      const { data, error, count } = await query.range(offset, offset + limitNum - 1)

      if (error) throw error

      const decrypted = data.map(task => ({
        ...task,
        title: decrypt(task.title),
        description: decrypt(task.description)
      }))

      return res.json({
        data: decrypted,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count,
          totalPages: Math.ceil(count / limitNum)
        }
      })
    }

    // No pagination - return all tasks
    const { data, error } = await query

    if (error) throw error

    const decrypted = data.map(task => ({
      ...task,
      title: decrypt(task.title),
      description: decrypt(task.description)
    }))

    res.json(decrypted)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (error) throw error

    res.json({
      ...data,
      title: decrypt(data.title),
      description: decrypt(data.description)
    })
  } catch (error) {
    res.status(404).json({ error: 'Task not found' })
  }
}

// Get subtasks for a parent task
export const getSubtasks = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('parent_task_id', id)
      .eq('user_id', req.user.id)
      .order('position', { ascending: true })

    if (error) throw error

    const decrypted = data.map(task => ({
      ...task,
      title: decrypt(task.title),
      description: decrypt(task.description)
    }))

    res.json(decrypted)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Create task
export const createTask = async (req, res) => {
  try {
    const {
      category_id,
      parent_task_id,
      title,
      description,
      priority,
      status,
      position,
      goal_time_minutes,
      due_date,
      recurrence_pattern
    } = req.body

    if (!category_id || !title) {
      return res.status(400).json({ error: 'category_id and title are required' })
    }

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        category_id,
        user_id: req.user.id,
        parent_task_id,
        title: encrypt(title),
        description: description ? encrypt(description) : null,
        priority,
        status,
        position,
        goal_time_minutes,
        due_date,
        recurrence_pattern: recurrence_pattern || 'none'
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      ...data,
      title: decrypt(data.title),
      description: decrypt(data.description)
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      description,
      priority,
      status,
      position,
      goal_time_minutes,
      actual_time_minutes,
      started_at,
      completed_at,
      due_date,
      recurrence_pattern
    } = req.body

    // Get the current task to compare actual_time_minutes and check recurrence
    const { data: currentTask, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('actual_time_minutes, recurrence_pattern, recurring_series_id, category_id, user_id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (fetchError) throw fetchError

    const updateData = {}
    if (title !== undefined) updateData.title = encrypt(title)
    if (description !== undefined) updateData.description = description ? encrypt(description) : null
    if (priority !== undefined) updateData.priority = priority
    if (status !== undefined) updateData.status = status
    if (position !== undefined) updateData.position = position
    if (goal_time_minutes !== undefined) updateData.goal_time_minutes = goal_time_minutes
    if (actual_time_minutes !== undefined) updateData.actual_time_minutes = actual_time_minutes
    if (started_at !== undefined) updateData.started_at = started_at
    if (completed_at !== undefined) updateData.completed_at = completed_at
    if (due_date !== undefined) updateData.due_date = due_date
    if (recurrence_pattern !== undefined) updateData.recurrence_pattern = recurrence_pattern

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (error) throw error

    // Auto-create break time if actual_time_minutes increased
    if (actual_time_minutes !== undefined && actual_time_minutes > 0) {
      await calculateAndCreateBreakTime(
        req.user.id,
        id,
        actual_time_minutes,
        currentTask.actual_time_minutes || 0
      )
    }

    // Roll up subtask time to parent whenever actual_time_minutes increases
    if (actual_time_minutes !== undefined && actual_time_minutes > (currentTask.actual_time_minutes || 0)) {
      const { data: fullTask } = await supabaseAdmin
        .from('tasks')
        .select('parent_task_id')
        .eq('id', id)
        .single()

      if (fullTask?.parent_task_id) {
        const addedTime = actual_time_minutes - (currentTask.actual_time_minutes || 0)

        const { data: parentTask } = await supabaseAdmin
          .from('tasks')
          .select('actual_time_minutes')
          .eq('id', fullTask.parent_task_id)
          .single()

        if (parentTask) {
          const newParentTime = (parentTask.actual_time_minutes || 0) + addedTime

          await supabaseAdmin
            .from('tasks')
            .update({ actual_time_minutes: newParentTime })
            .eq('id', fullTask.parent_task_id)
            .eq('user_id', req.user.id)

          await calculateAndCreateBreakTime(
            req.user.id,
            fullTask.parent_task_id,
            newParentTime,
            parentTask.actual_time_minutes || 0
          )
        }
      }
    }

    // ─── Recurring Task Logic ──────────────────────────
    let nextOccurrence = null
    const effectiveRecurrence = recurrence_pattern !== undefined ? recurrence_pattern : currentTask.recurrence_pattern

    if (status === 'completed' && effectiveRecurrence && effectiveRecurrence !== 'none') {
      // Calculate next due date
      const nextDueDate = calculateNextDueDate(
        data.due_date || completed_at || new Date().toISOString(),
        effectiveRecurrence
      )

      // ─── Guard: check if the category already has a task for today ──
      const now = new Date()
      const todayStart = new Date(now)
      todayStart.setUTCHours(0, 0, 0, 0)
      const todayEnd = new Date(now)
      todayEnd.setUTCHours(23, 59, 59, 999)

      const { data: existingToday } = await supabaseAdmin
        .from('tasks')
        .select('id')
        .eq('category_id', data.category_id)
        .eq('user_id', data.user_id)
        .neq('status', 'cancelled')
        .gte('due_date', todayStart.toISOString())
        .lte('due_date', todayEnd.toISOString())
        .limit(1)

      // Only skip if there's already a task for today that is NOT the task being completed
      const hasOtherTaskToday = existingToday && existingToday.length > 0 &&
        existingToday.some(t => t.id !== data.id)

      if (hasOtherTaskToday) {
        // Category already has another task for today — skip next occurrence creation
      } else {
        // Determine the series ID: use original's recurring_series_id if set, otherwise use this task's ID
        const seriesId = currentTask.recurring_series_id || data.id

        // Get the next position value (max position in category + 1)
        const { data: maxPosTask } = await supabaseAdmin
          .from('tasks')
          .select('position')
          .eq('category_id', currentTask.category_id)
          .eq('user_id', currentTask.user_id)
          .order('position', { ascending: false })
          .limit(1)
          .single()

        const nextPosition = (maxPosTask?.position ?? -1) + 1

        // Format the next due date for the title suffix
        const nextDate = new Date(nextDueDate)
        const dateSuffix = nextDate.toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
        })

        // Decrypt the original title, append the date, and re-encrypt
        const originalTitle = decrypt(data.title)
        const nextTitle = `${originalTitle} - ${dateSuffix}`

        // Create the next occurrence
        const { data: newTask, error: createError } = await supabaseAdmin
          .from('tasks')
          .insert({
            category_id: data.category_id,
            user_id: data.user_id,
            parent_task_id: null,  // Recurring tasks don't recurse subtasks
            title: encrypt(nextTitle),  // Encrypted with date appended
            description: data.description,  // Already encrypted
            priority: data.priority,
            status: 'pending',
            position: nextPosition,
            goal_time_minutes: data.goal_time_minutes,
            actual_time_minutes: null,
            started_at: null,
            completed_at: null,
            due_date: nextDueDate,
            recurrence_pattern: effectiveRecurrence,
            recurring_series_id: seriesId
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating next recurrence:', createError)
          // Don't fail the whole request — the completion itself succeeded
        } else {
          nextOccurrence = {
            ...newTask,
            title: decrypt(newTask.title),
            description: decrypt(newTask.description)
          }
        }
      }
    }
    // ─── End Recurring Task Logic ──────────────────────

    const response = {
      ...data,
      title: decrypt(data.title),
      description: decrypt(data.description)
    }

    if (nextOccurrence) {
      response.next_occurrence = nextOccurrence
    }

    res.json(response)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params

    // First, delete all subtasks of this task
    const { error: subtaskError } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('parent_task_id', id)
      .eq('user_id', req.user.id)

    if (subtaskError) throw subtaskError

    // Then delete the parent task
    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) throw error

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
