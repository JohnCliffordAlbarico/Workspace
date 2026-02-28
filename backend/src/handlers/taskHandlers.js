import { supabaseAdmin } from '../config/supabase.js'

// Get all tasks for a workspace
export const getTasks = async (req, res) => {
  try {
    const { workspaceId } = req.query

    let query = supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', req.user.id)

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId)
    }

    const { data, error } = await query.order('position', { ascending: true })

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
