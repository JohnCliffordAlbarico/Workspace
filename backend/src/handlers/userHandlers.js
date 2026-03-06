import { supabasePublic as supabase, supabaseAdmin } from '../config/supabase.js'

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    
    res.json(data)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const { display_name, profile_img } = req.body
    
    const updateData = {}
    if (display_name !== undefined) updateData.display_name = display_name
    if (profile_img !== undefined) updateData.profile_img = profile_img
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    
    res.json(data)
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id
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
    
    // Get current profile to delete old image
    const { data: currentUser } = await supabase
      .from('users')
      .select('profile_img')
      .eq('id', userId)
      .single()
    
    // Delete old image if exists
    if (currentUser?.profile_img) {
      try {
        const url = new URL(currentUser.profile_img)
        const pathParts = url.pathname.split('/')
        const filePath = pathParts.slice(pathParts.indexOf('images') + 1).join('/')
        
        if (filePath) {
          await supabaseAdmin.storage.from('images').remove([filePath])
        }
      } catch (err) {
        console.error('Error deleting old image:', err)
      }
    }
    
    const fileExt = file.originalname.split('.').pop()
    const fileName = `profiles/${userId}/avatar-${Date.now()}.${fileExt}`
    
    // Upload to Supabase Storage using admin client (bypasses RLS)
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
    
    // Update user profile with new image URL
    const { data: userData, error: updateError } = await supabase
      .from('users')
      .update({ profile_img: publicUrl })
      .eq('id', userId)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    res.json({ url: publicUrl, user: userData })
  } catch (error) {
    console.error('Upload image error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Delete profile image
export const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get current profile image
    const { data: user } = await supabase
      .from('users')
      .select('profile_img')
      .eq('id', userId)
      .single()
    
    if (user?.profile_img) {
      try {
        const url = new URL(user.profile_img)
        const pathParts = url.pathname.split('/')
        const filePath = pathParts.slice(pathParts.indexOf('images') + 1).join('/')
        
        if (filePath) {
          await supabaseAdmin.storage.from('images').remove([filePath])
        }
      } catch (err) {
        console.error('Error deleting image from storage:', err)
      }
    }
    
    // Update user profile to remove image URL
    const { data, error } = await supabase
      .from('users')
      .update({ profile_img: null })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    
    res.json(data)
  } catch (error) {
    console.error('Delete image error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id
    const { currentPassword, newPassword } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }
    
    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' })
    }
    
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter' })
    }
    
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one lowercase letter' })
    }
    
    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one number' })
    }
    
    // Get user email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()
    
    if (userError) throw userError
    
    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })
    
    if (signInError) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }
    
    // Update password using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )
    
    if (updateError) throw updateError
    
    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: error.message })
  }
}
