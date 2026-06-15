import { supabaseAdmin } from '../config/supabase.js'

// Get all diary entries for current user
export const getDiaryEntries = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('diary_entries')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(data || [])
  } catch (error) {
    console.error('Get diary entries error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Get single diary entry
export const getDiaryEntry = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('diary_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    // PGRST116 = no rows returned
    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Diary entry not found' })
    }
    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Get diary entry error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Create a new diary entry
export const createDiaryEntry = async (req, res) => {
  try {
    const { title, content } = req.body

    if (!title) {
      return res.status(400).json({ error: 'title is required' })
    }

    const { data, error } = await supabaseAdmin
      .from('diary_entries')
      .insert({
        user_id: req.user.id,
        title,
        content: content || null
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    console.error('Create diary entry error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Update a diary entry
export const updateDiaryEntry = async (req, res) => {
  try {
    const { id } = req.params
    const { title, content } = req.body

    // Verify ownership
    const { error: findError } = await supabaseAdmin
      .from('diary_entries')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (findError && findError.code === 'PGRST116') {
      return res.status(404).json({ error: 'Diary entry not found' })
    }
    if (findError) throw findError

    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content

    const { data, error } = await supabaseAdmin
      .from('diary_entries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Update diary entry error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Delete a diary entry
export const deleteDiaryEntry = async (req, res) => {
  try {
    const { id } = req.params

    // Get entry to clean up cover image if exists
    const { data: entry, error: findError } = await supabaseAdmin
      .from('diary_entries')
      .select('cover_image')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (findError && findError.code === 'PGRST116') {
      return res.status(404).json({ error: 'Diary entry not found' })
    }
    if (findError) throw findError

    // Delete cover image from storage if exists
    if (entry.cover_image) {
      try {
        const url = new URL(entry.cover_image)
        const pathParts = url.pathname.split('/')
        const filePath = pathParts.slice(pathParts.indexOf('images') + 1).join('/')
        if (filePath) {
          await supabaseAdmin.storage.from('images').remove([filePath])
        }
      } catch (err) {
        console.error('Error deleting diary cover image:', err)
      }
    }

    const { error } = await supabaseAdmin
      .from('diary_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) throw error

    res.status(204).send()
  } catch (error) {
    console.error('Delete diary entry error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Upload cover image for a diary entry
export const uploadDiaryCover = async (req, res) => {
  try {
    const { id } = req.params
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' })
    }

    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB' })
    }

    // Verify ownership
    const { data: entry, error: findError } = await supabaseAdmin
      .from('diary_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (findError && findError.code === 'PGRST116') {
      return res.status(404).json({ error: 'Diary entry not found' })
    }
    if (findError) throw findError

    // Delete old cover image if exists
    if (entry.cover_image) {
      try {
        const url = new URL(entry.cover_image)
        const pathParts = url.pathname.split('/')
        const filePath = pathParts.slice(pathParts.indexOf('images') + 1).join('/')
        if (filePath) {
          await supabaseAdmin.storage.from('images').remove([filePath])
        }
      } catch (err) {
        console.error('Error deleting old diary cover:', err)
      }
    }

    const fileExt = file.originalname.split('.').pop()
    const fileName = `diary/${req.user.id}/cover-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(fileName)

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('diary_entries')
      .update({ cover_image: publicUrl })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (updateError) throw updateError

    res.json({ url: publicUrl, entry: updated })
  } catch (error) {
    console.error('Upload diary cover error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Delete cover image for a diary entry
export const deleteDiaryCover = async (req, res) => {
  try {
    const { id } = req.params

    const { data: entry, error: findError } = await supabaseAdmin
      .from('diary_entries')
      .select('cover_image')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (findError && findError.code === 'PGRST116') {
      return res.status(404).json({ error: 'Diary entry not found' })
    }
    if (findError) throw findError

    if (entry.cover_image) {
      try {
        const url = new URL(entry.cover_image)
        const pathParts = url.pathname.split('/')
        const filePath = pathParts.slice(pathParts.indexOf('images') + 1).join('/')
        if (filePath) {
          await supabaseAdmin.storage.from('images').remove([filePath])
        }
      } catch (err) {
        console.error('Error deleting diary cover from storage:', err)
      }
    }

    const { data, error } = await supabaseAdmin
      .from('diary_entries')
      .update({ cover_image: null })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Delete diary cover error:', error)
    res.status(500).json({ error: error.message })
  }
}
