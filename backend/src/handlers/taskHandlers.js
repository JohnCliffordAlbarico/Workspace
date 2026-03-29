import { supabaseAdmin } from '../config/supabase.js'

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

// Get all tasks for a workspace
export const getTasks = async (req, res) => {
  try {
    const { workspaceId, status, page, limit } = req.query

    let query = supabaseAdmin
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId)
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

      return res.json({
        data,
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

    res.json(data)
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

    res.json(data)
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

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Create task
export const createTask = async (req, res) => {
  try {
    const {
      workspace_id,
      parent_task_id,
      title,
      description,
      priority,
      status,
      position,
      goal_time_minutes,
      due_date
    } = req.body

    if (!workspace_id || !title) {
      return res.status(400).json({ error: 'workspace_id and title are required' })
    }

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        workspace_id,
        user_id: req.user.id,
        parent_task_id,
        title,
        description,
        priority,
        status,
        position,
        goal_time_minutes,
        due_date
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
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
      due_date
    } = req.body

    // Get the current task to compare actual_time_minutes
    const { data: currentTask, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('actual_time_minutes')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (fetchError) throw fetchError

    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (priority !== undefined) updateData.priority = priority
    if (status !== undefined) updateData.status = status
    if (position !== undefined) updateData.position = position
    if (goal_time_minutes !== undefined) updateData.goal_time_minutes = goal_time_minutes
    if (actual_time_minutes !== undefined) updateData.actual_time_minutes = actual_time_minutes
    if (started_at !== undefined) updateData.started_at = started_at
    if (completed_at !== undefined) updateData.completed_at = completed_at
    if (due_date !== undefined) updateData.due_date = due_date

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

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params

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
