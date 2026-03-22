import { supabasePublic as supabase, supabaseAdmin } from '../config/supabase.js'

// Get all music preferences for current user
export const getMusicPreferences = async (req, res) => {
  try {
    const userId = req.user.id
    
    const { data, error } = await supabaseAdmin
      .from('user_music_preferences')
      .select('*')
      .eq('user_id', userId)
      .order('platform', { ascending: true })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    res.json(data || [])
  } catch (error) {
    console.error('Get music preferences error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Get active playlist for a specific platform
export const getActivePlatformPlaylist = async (req, res) => {
  try {
    const userId = req.user.id
    const { platform } = req.params
    
    const { data, error } = await supabaseAdmin
      .from('user_music_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('is_active', true)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
    
    res.json(data || null)
  } catch (error) {
    console.error('Get active platform playlist error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Create new music preference
export const createMusicPreference = async (req, res) => {
  try {
    const userId = req.user.id
    const { playlist_url, playlist_name, platform, is_active, volume, autoplay } = req.body
    
    if (!playlist_url || !playlist_name || !platform) {
      return res.status(400).json({ error: 'playlist_url, playlist_name, and platform are required' })
    }
    
    // If setting as active, deactivate other playlists for this platform
    if (is_active) {
      await supabaseAdmin
        .from('user_music_preferences')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('platform', platform)
    }
    
    const { data, error } = await supabaseAdmin
      .from('user_music_preferences')
      .insert({
        user_id: userId,
        playlist_url,
        playlist_name,
        platform,
        is_active: is_active || false,
        volume: volume || 50,
        autoplay: autoplay || false
      })
      .select()
      .single()
    
    if (error) throw error
    
    res.status(201).json(data)
  } catch (error) {
    console.error('Create music preference error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Update music preference
export const updateMusicPreference = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { playlist_url, playlist_name, platform, is_active, volume, autoplay } = req.body
    
    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('user_music_preferences')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (!existing) {
      return res.status(404).json({ error: 'Music preference not found' })
    }
    
    // If setting as active, deactivate other playlists for this platform
    if (is_active && !existing.is_active) {
      await supabaseAdmin
        .from('user_music_preferences')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('platform', existing.platform)
        .neq('id', id)
    }
    
    const updateData = {}
    if (playlist_url !== undefined) updateData.playlist_url = playlist_url
    if (playlist_name !== undefined) updateData.playlist_name = playlist_name
    if (platform !== undefined) updateData.platform = platform
    if (is_active !== undefined) updateData.is_active = is_active
    if (volume !== undefined) updateData.volume = volume
    if (autoplay !== undefined) updateData.autoplay = autoplay
    
    const { data, error } = await supabaseAdmin
      .from('user_music_preferences')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    
    res.json(data)
  } catch (error) {
    console.error('Update music preference error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Delete music preference
export const deleteMusicPreference = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    
    // Get the preference to delete cover image if exists
    const { data: preference } = await supabaseAdmin
      .from('user_music_preferences')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (!preference) {
      return res.status(404).json({ error: 'Music preference not found' })
    }
    
    // Delete cover image from storage if exists
    if (preference.cover_image) {
      try {
        const url = new URL(preference.cover_image)
        const pathParts = url.pathname.split('/')
        const filePath = pathParts.slice(pathParts.indexOf('images') + 1).join('/')
        
        if (filePath) {
          await supabaseAdmin.storage.from('images').remove([filePath])
        }
      } catch (err) {
        console.error('Error deleting cover image:', err)
      }
    }
    
    const { error } = await supabaseAdmin
      .from('user_music_preferences')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
    if (error) throw error
    
    res.json({ message: 'Music preference deleted successfully' })
  } catch (error) {
    console.error('Delete music preference error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Upload cover image for playlist
export const uploadPlaylistCover = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const file = req.file
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' })
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB' })
    }
    
    // Verify ownership
    const { data: preference } = await supabaseAdmin
      .from('user_music_preferences')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (!preference) {
      return res.status(404).json({ error: 'Music preference not found' })
    }
    
    // Delete old cover image if exists
    if (preference.cover_image) {
      try {
        const url = new URL(preference.cover_image)
        const pathParts = url.pathname.split('/')
        const filePath = pathParts.slice(pathParts.indexOf('images') + 1).join('/')
        
        if (filePath) {
          await supabaseAdmin.storage.from('images').remove([filePath])
        }
      } catch (err) {
        console.error('Error deleting old cover image:', err)
      }
    }
    
    const fileExt = file.originalname.split('.').pop()
    const fileName = `playlists/${userId}/cover-${Date.now()}.${fileExt}`
    
    // Upload to Supabase Storage using admin client
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })
    
    if (uploadError) throw uploadError
    
    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(fileName)
    
    // Update music preference with new cover image URL
    const { data: updatedPreference, error: updateError } = await supabaseAdmin
      .from('user_music_preferences')
      .update({ cover_image: publicUrl })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    res.json({ url: publicUrl, preference: updatedPreference })
  } catch (error) {
    console.error('Upload playlist cover error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Delete cover image for playlist
export const deletePlaylistCover = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    
    // Get the preference
    const { data: preference } = await supabaseAdmin
      .from('user_music_preferences')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (!preference) {
      return res.status(404).json({ error: 'Music preference not found' })
    }
    
    // Delete cover image from storage if exists
    if (preference.cover_image) {
      try {
        const url = new URL(preference.cover_image)
        const pathParts = url.pathname.split('/')
        const filePath = pathParts.slice(pathParts.indexOf('images') + 1).join('/')
        
        if (filePath) {
          await supabaseAdmin.storage.from('images').remove([filePath])
        }
      } catch (err) {
        console.error('Error deleting cover image from storage:', err)
      }
    }
    
    // Update preference to remove cover image URL
    const { data, error } = await supabaseAdmin
      .from('user_music_preferences')
      .update({ cover_image: null })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    
    res.json(data)
  } catch (error) {
    console.error('Delete playlist cover error:', error)
    res.status(500).json({ error: error.message })
  }
}
