import { supabaseAdmin } from '../config/supabase.js'

// Get all break time entries for current user
export const getBreakTimes = async (req, res) => {
  try {
    const { status } = req.query

    let query = supabaseAdmin
      .from('break_time')
      .select('*')
      .eq('user_id', req.user.id)

    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error

    res.json(data || [])
  } catch (error) {
    console.error('Get break times error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Get total available break time minutes
export const getAvailableBreakMinutes = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('break_time')
      .select('remaining_minutes')
      .eq('user_id', req.user.id)
      .eq('status', 'available')

    if (error) throw error

    const totalMinutes = data.reduce((sum, entry) => sum + entry.remaining_minutes, 0)

    res.json({ total_minutes: totalMinutes, entries: data.length })
  } catch (error) {
    console.error('Get available break minutes error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Create break time entry (called when task time is logged)
export const createBreakTime = async (req, res) => {
  try {
    const { task_id, earned_minutes } = req.body

    if (!task_id || !earned_minutes) {
      return res.status(400).json({ error: 'task_id and earned_minutes are required' })
    }

    const { data, error } = await supabaseAdmin
      .from('break_time')
      .insert({
        user_id: req.user.id,
        task_id,
        earned_minutes,
        remaining_minutes: earned_minutes,
        status: 'available'
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    console.error('Create break time error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Activate break time (start using accumulated break minutes)
export const activateBreakTime = async (req, res) => {
  try {
    const { minutes_to_use } = req.body

    if (!minutes_to_use || minutes_to_use <= 0) {
      return res.status(400).json({ error: 'minutes_to_use must be greater than 0' })
    }

    // Get available break time entries
    const { data: availableBreaks, error: fetchError } = await supabaseAdmin
      .from('break_time')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'available')
      .gt('remaining_minutes', 0)
      .order('created_at', { ascending: true })

    if (fetchError) throw fetchError

    const totalAvailable = availableBreaks.reduce((sum, entry) => sum + entry.remaining_minutes, 0)

    if (totalAvailable < minutes_to_use) {
      return res.status(400).json({ 
        error: 'Insufficient break time available',
        available: totalAvailable,
        requested: minutes_to_use
      })
    }

    let remainingToUse = minutes_to_use
    const updatedEntries = []

    // Use break time from oldest entries first
    for (const breakEntry of availableBreaks) {
      if (remainingToUse <= 0) break

      const minutesToDeduct = Math.min(remainingToUse, breakEntry.remaining_minutes)
      const newRemaining = breakEntry.remaining_minutes - minutesToDeduct
      const newStatus = newRemaining === 0 ? 'used' : 'available'

      const { data, error } = await supabaseAdmin
        .from('break_time')
        .update({
          remaining_minutes: newRemaining,
          status: newStatus,
          activated_at: new Date().toISOString(),
          ...(newStatus === 'used' && { completed_at: new Date().toISOString() })
        })
        .eq('id', breakEntry.id)
        .select()
        .single()

      if (error) throw error

      updatedEntries.push(data)
      remainingToUse -= minutesToDeduct
    }

    res.json({
      message: 'Break time activated',
      minutes_used: minutes_to_use,
      entries_updated: updatedEntries
    })
  } catch (error) {
    console.error('Activate break time error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Complete active break (mark as used)
export const completeBreakTime = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('break_time')
      .update({
        status: 'used',
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Complete break time error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Delete break time entry
export const deleteBreakTime = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('break_time')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) throw error

    res.status(204).send()
  } catch (error) {
    console.error('Delete break time error:', error)
    res.status(500).json({ error: error.message })
  }
}
