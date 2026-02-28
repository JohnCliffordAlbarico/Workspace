import { supabaseAdmin } from '../config/supabase.js'

// Get all workspaces for current user
export const getWorkspaces = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('workspaces')
      .select('*')
      .eq('owner_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get workspace by ID
export const getWorkspaceById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .eq('owner_id', req.user.id)
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    res.status(404).json({ error: 'Workspace not found' })
  }
}

// Create workspace
export const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Workspace name is required' })
    }

    const { data, error } = await supabaseAdmin
      .from('workspaces')
      .insert({
        name,
        owner_id: req.user.id
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update workspace
export const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body

    const { data, error } = await supabaseAdmin
      .from('workspaces')
      .update({ name })
      .eq('id', id)
      .eq('owner_id', req.user.id)
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Delete workspace
export const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('workspaces')
      .delete()
      .eq('id', id)
      .eq('owner_id', req.user.id)

    if (error) throw error

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
