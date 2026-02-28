import { supabaseAdmin } from '../config/supabase.js'

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update user profile
export const updateUser = async (req, res) => {
  try {
    const { email, profile_img } = req.body

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ email, profile_img })
      .eq('id', req.user.id)
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get user by public_id
export const getUserByPublicId = async (req, res) => {
  try {
    const { publicId } = req.params

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('public_id', publicId)
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    res.status(404).json({ error: 'User not found' })
  }
}
