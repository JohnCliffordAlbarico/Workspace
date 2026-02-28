import { supabasePublic, supabaseAdmin } from '../config/supabase.js'

// Login with Supabase Auth
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Sign in with Supabase
    const { data, error } = await supabasePublic.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(401).json({ error: error.message })
    }

    // Get user profile from users table
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
    }

    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: userProfile?.role || 'user',
        profile_img: userProfile?.profile_img,
        public_id: userProfile?.public_id
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Register new user
export const register = async (req, res) => {
  try {
    const { email, password } = req.body

    console.log('Register attempt:', { email, passwordLength: password?.length })

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Sign up with Supabase
    const { data, error } = await supabasePublic.auth.signUp({
      email,
      password
    })

    if (error) {
      console.error('Supabase signup error:', error)
      return res.status(400).json({ error: error.message })
    }

    if (!data.user) {
      return res.status(400).json({ error: 'User creation failed' })
    }

    // Create user profile in users table
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        role: 'user'
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail the registration if profile creation fails
    }

    console.log('Registration successful:', data.user.email)

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: data.user.id,
        email: data.user.email
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Logout
export const logout = async (req, res) => {
  try {
    const { error } = await supabasePublic.auth.signOut()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ message: 'Logout successful' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get current session
export const getSession = async (req, res) => {
  try {
    res.json({ user: req.user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
