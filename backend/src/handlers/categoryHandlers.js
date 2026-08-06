import { supabaseAdmin } from '../config/supabase.js'

// GET /api/categories - Only active categories
export const getCategories = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('focus_categories')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('status', 'active')
    .order('position', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

// GET /api/categories/completed - Completed categories (archived)
export const getCompletedCategories = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('focus_categories')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

// GET /api/categories/:id
export const getCategoryById = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('focus_categories')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single()

  if (error) return res.status(404).json({ error: 'Category not found' })
  res.json(data)
}

// GET /api/categories/:id/stats
export const getCategoryStats = async (req, res) => {
  const { data: category, error: catError } = await supabaseAdmin
    .from('focus_categories')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single()

  if (catError) return res.status(404).json({ error: 'Category not found' })

  // Get task stats for this category
  const { data: tasks, error: taskError } = await supabaseAdmin
    .from('tasks')
    .select('id, status, actual_time_minutes, goal_time_minutes')
    .eq('category_id', req.params.id)
    .eq('user_id', req.user.id)

  if (taskError) return res.status(500).json({ error: taskError.message })

  const totalActualMinutes = tasks.reduce((sum, t) => sum + (t.actual_time_minutes || 0), 0)
  const totalGoalMinutes = tasks.reduce((sum, t) => sum + (t.goal_time_minutes || 0), 0)
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const totalTasks = tasks.length

  res.json({
    category,
    stats: {
      daily_allocation: category.daily_allocation_minutes,
      actual_minutes: totalActualMinutes,
      goal_minutes: totalGoalMinutes,
      percentage: category.daily_allocation_minutes > 0 
        ? Math.min(100, Math.round((totalActualMinutes / category.daily_allocation_minutes) * 100))
        : 0,
      total_tasks: totalTasks,
      completed_tasks: completedTasks
    }
  })
}

// POST /api/categories
export const createCategory = async (req, res) => {
  const { name, color, daily_allocation_minutes } = req.body

  // Check for duplicate name (active categories only)
  const { data: existingByName } = await supabaseAdmin
    .from('focus_categories')
    .select('id')
    .eq('user_id', req.user.id)
    .eq('status', 'active')
    .ilike('name', name.trim())
    .limit(1)

  if (existingByName?.length) {
    return res.status(409).json({ error: 'A category with this name already exists' })
  }

  // Get max position
  const { data: existing } = await supabaseAdmin
    .from('focus_categories')
    .select('position')
    .eq('user_id', req.user.id)
    .eq('status', 'active')
    .order('position', { ascending: false })
    .limit(1)

  const newPosition = existing?.length ? (existing[0].position ?? 0) + 1 : 0

  const { data, error } = await supabaseAdmin
    .from('focus_categories')
    .insert({
      user_id: req.user.id,
      name: name.trim(),
      color: color || '#6366f1',
      daily_allocation_minutes: daily_allocation_minutes || 60,
      position: newPosition,
      status: 'active'
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
}

// PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  const { name, color, daily_allocation_minutes, position } = req.body

  // Check for duplicate name if renaming (active categories only)
  if (name !== undefined) {
    const { data: existingByName } = await supabaseAdmin
      .from('focus_categories')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .ilike('name', name.trim())
      .neq('id', req.params.id)
      .limit(1)

    if (existingByName?.length) {
      return res.status(409).json({ error: 'A category with this name already exists' })
    }
  }

  const updateData = {}
  if (name !== undefined) updateData.name = name.trim()
  if (color !== undefined) updateData.color = color
  if (daily_allocation_minutes !== undefined) updateData.daily_allocation_minutes = daily_allocation_minutes
  if (position !== undefined) updateData.position = position

  const { data, error } = await supabaseAdmin
    .from('focus_categories')
    .update(updateData)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

// DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  // Check if category has tasks
  const { data: tasks } = await supabaseAdmin
    .from('tasks')
    .select('id')
    .eq('category_id', req.params.id)
    .limit(1)

  if (tasks?.length) {
    return res.status(400).json({ 
      error: 'Cannot delete category with tasks. Move or delete tasks first.' 
    })
  }

  const { error } = await supabaseAdmin
    .from('focus_categories')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)

  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
}

// PATCH /api/categories/:id/complete
export const completeCategory = async (req, res) => {
  // Get category with task stats
  const { data: category, error: catError } = await supabaseAdmin
    .from('focus_categories')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .eq('status', 'active')
    .single()

  if (catError) return res.status(404).json({ error: 'Active category not found' })

  // Check if category has incomplete tasks
  const { data: incompleteTasks } = await supabaseAdmin
    .from('tasks')
    .select('id')
    .eq('category_id', req.params.id)
    .eq('user_id', req.user.id)
    .not('status', 'eq', 'completed')
    .not('status', 'eq', 'cancelled')
    .limit(1)

  if (incompleteTasks?.length) {
    return res.status(400).json({ 
      error: 'Category has incomplete tasks. Complete or cancel them first.',
      incomplete_count: incompleteTasks.length
    })
  }

  // Mark category as completed
  const { data, error } = await supabaseAdmin
    .from('focus_categories')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

// PATCH /api/categories/:id/reopen
export const reopenCategory = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('focus_categories')
    .update({
      status: 'active',
      completed_at: null
    })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .eq('status', 'completed')
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}
