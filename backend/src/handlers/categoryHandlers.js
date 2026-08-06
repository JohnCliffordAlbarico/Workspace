import { supabaseAdmin } from '../config/supabase.js'
import { encrypt, decrypt } from '../utils/crypto.js'

// GET /api/categories - Only active categories
export const getCategories = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('focus_categories')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('status', 'active')
    .order('position', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })

  const decrypted = data.map(cat => ({
    ...cat,
    name: decrypt(cat.name)
  }))

  res.json(decrypted)
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

  const decrypted = data.map(cat => ({
    ...cat,
    name: decrypt(cat.name)
  }))

  res.json(decrypted)
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
  res.json({
    ...data,
    name: decrypt(data.name)
  })
}

// GET /api/categories/stats - Batch stats for all categories
export const getAllCategoryStats = async (req, res) => {
  // Get all active categories
  const { data: categories, error: catError } = await supabaseAdmin
    .from('focus_categories')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('status', 'active')

  if (catError) return res.status(500).json({ error: catError.message })
  if (!categories?.length) return res.json({})

  // Get all tasks for these categories in one query
  const categoryIds = categories.map(c => c.id)
  const { data: tasks, error: taskError } = await supabaseAdmin
    .from('tasks')
    .select('id, parent_task_id, category_id, status, actual_time_minutes, goal_time_minutes, completed_at')
    .in('category_id', categoryIds)
    .eq('user_id', req.user.id)

  if (taskError) return res.status(500).json({ error: taskError.message })

  // Build parent task ID set once
  const parentTaskIds = new Set(
    tasks.filter(t => t.parent_task_id).map(t => t.parent_task_id)
  )

  // Today boundaries
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString()

  // Compute stats per category
  const statsMap = {}
  categories.forEach(cat => {
    const catTasks = tasks.filter(t => t.category_id === cat.id)
    const leafTasks = catTasks.filter(t => !parentTaskIds.has(t.id))
    const lifetimeActualMinutes = leafTasks.reduce((sum, t) => sum + (t.actual_time_minutes || 0), 0)
    const totalGoalMinutes = catTasks.reduce((sum, t) => sum + (t.goal_time_minutes || 0), 0)
    const completedTasks = catTasks.filter(t => t.status === 'completed').length

    const todayLeafTasks = leafTasks.filter(t => t.completed_at && t.completed_at >= startOfDay)
    const dailyActualMinutes = todayLeafTasks.reduce((sum, t) => sum + (t.actual_time_minutes || 0), 0)

    statsMap[cat.id] = {
      daily_allocation: cat.daily_allocation_minutes,
      actual_minutes: dailyActualMinutes,
      lifetime_actual_minutes: lifetimeActualMinutes,
      goal_minutes: totalGoalMinutes,
      percentage: cat.daily_allocation_minutes > 0
        ? Math.min(100, Math.round((dailyActualMinutes / cat.daily_allocation_minutes) * 100))
        : 0,
      total_tasks: catTasks.length,
      completed_tasks: completedTasks
    }
  })

  res.json(statsMap)
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

  // Get ALL task stats for this category (lifetime)
  const { data: tasks, error: taskError } = await supabaseAdmin
    .from('tasks')
    .select('id, parent_task_id, status, actual_time_minutes, goal_time_minutes')
    .eq('category_id', req.params.id)
    .eq('user_id', req.user.id)

  if (taskError) return res.status(500).json({ error: taskError.message })

  // Get IDs of tasks that ARE parents (have subtasks)
  const taskIds = tasks.map(t => t.id)
  const { data: parentIds } = await supabaseAdmin
    .from('tasks')
    .select('parent_task_id')
    .in('parent_task_id', taskIds)
    .eq('user_id', req.user.id)

  const parentTaskIds = new Set(parentIds?.map(p => p.parent_task_id) || [])

  // Only count leaf tasks (no subtasks) to avoid double-counting
  const leafTasks = tasks.filter(t => !parentTaskIds.has(t.id))
  const lifetimeActualMinutes = leafTasks.reduce((sum, t) => sum + (t.actual_time_minutes || 0), 0)
  const totalGoalMinutes = tasks.reduce((sum, t) => sum + (t.goal_time_minutes || 0), 0)
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const totalTasks = tasks.length

  // Get today's start (midnight local time)
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const startOfDayISO = startOfDay.toISOString()

  // Get leaf tasks completed today for daily actual minutes
  const { data: todayTasks, error: todayError } = await supabaseAdmin
    .from('tasks')
    .select('id, parent_task_id, actual_time_minutes')
    .eq('category_id', req.params.id)
    .eq('user_id', req.user.id)
    .gte('completed_at', startOfDayISO)

  if (todayError) return res.status(500).json({ error: todayError.message })

  // Filter today's leaf tasks too
  const todayLeafTasks = todayTasks.filter(t => !parentTaskIds.has(t.id))
  const dailyActualMinutes = todayLeafTasks.reduce((sum, t) => sum + (t.actual_time_minutes || 0), 0)

  res.json({
    category: {
      ...category,
      name: decrypt(category.name)
    },
    stats: {
      daily_allocation: category.daily_allocation_minutes,
      actual_minutes: dailyActualMinutes,
      lifetime_actual_minutes: lifetimeActualMinutes,
      goal_minutes: totalGoalMinutes,
      percentage: category.daily_allocation_minutes > 0 
        ? Math.min(100, Math.round((dailyActualMinutes / category.daily_allocation_minutes) * 100))
        : 0,
      total_tasks: totalTasks,
      completed_tasks: completedTasks
    }
  })
}

// POST /api/categories
export const createCategory = async (req, res) => {
  const { name, color, daily_allocation_minutes } = req.body

  // Check for duplicate name (active categories only) - must compare decrypted names
  const { data: existingCategories } = await supabaseAdmin
    .from('focus_categories')
    .select('id, name')
    .eq('user_id', req.user.id)
    .eq('status', 'active')

  const duplicateExists = existingCategories?.some(
    cat => decrypt(cat.name).toLowerCase() === name.trim().toLowerCase()
  )

  if (duplicateExists) {
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
      name: encrypt(name.trim()),
      color: color || '#6366f1',
      daily_allocation_minutes: daily_allocation_minutes || 60,
      position: newPosition,
      status: 'active'
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json({
    ...data,
    name: decrypt(data.name)
  })
}

// PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  const { name, color, daily_allocation_minutes, position } = req.body

  // Check for duplicate name if renaming (active categories only) - must compare decrypted names
  if (name !== undefined) {
    const { data: existingCategories } = await supabaseAdmin
      .from('focus_categories')
      .select('id, name')
      .eq('user_id', req.user.id)
      .eq('status', 'active')

    const duplicateExists = existingCategories?.some(
      cat => cat.id !== req.params.id &&
        decrypt(cat.name).toLowerCase() === name.trim().toLowerCase()
    )

    if (duplicateExists) {
      return res.status(409).json({ error: 'A category with this name already exists' })
    }
  }

  // Fetch current category to compare allocation
  const { data: currentCategory } = await supabaseAdmin
    .from('focus_categories')
    .select('daily_allocation_minutes')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single()

  const updateData = {}
  if (name !== undefined) updateData.name = encrypt(name.trim())
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

  // Log allocation change if it changed
  if (daily_allocation_minutes !== undefined && currentCategory && daily_allocation_minutes !== currentCategory.daily_allocation_minutes) {
    await supabaseAdmin
      .from('allocation_history')
      .insert({
        user_id: req.user.id,
        category_id: req.params.id,
        old_allocation: currentCategory.daily_allocation_minutes,
        new_allocation: daily_allocation_minutes
      })
  }

  res.json({
    ...data,
    name: decrypt(data.name)
  })
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
  res.json({
    ...data,
    name: decrypt(data.name)
  })
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
  res.json({
    ...data,
    name: decrypt(data.name)
  })
}

// GET /api/categories/:id/allocation-history
export const getAllocationHistory = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('allocation_history')
    .select('*')
    .eq('category_id', req.params.id)
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}
