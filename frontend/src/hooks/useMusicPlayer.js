import { useState, useEffect } from 'react'
import api from '../config/api'

export const useMusicPlayer = () => {
  const [preferences, setPreferences] = useState([])
  const [activeSpotify, setActiveSpotify] = useState(null)
  const [activeYoutube, setActiveYoutube] = useState(null)
  const [currentPlatform, setCurrentPlatform] = useState('spotify') // 'spotify' or 'youtube'
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/music')
      const prefs = response.data
      setPreferences(prefs)
      
      // Set active playlists
      const spotify = prefs.find(p => p.platform === 'spotify' && p.is_active)
      const youtube = prefs.find(p => p.platform === 'youtube' && p.is_active)
      
      setActiveSpotify(spotify || null)
      setActiveYoutube(youtube || null)
      
      // Load last used platform from localStorage
      const lastPlatform = localStorage.getItem('musicPlatform')
      if (lastPlatform && (lastPlatform === 'spotify' || lastPlatform === 'youtube')) {
        setCurrentPlatform(lastPlatform)
      }
    } catch (error) {
      console.error('Failed to fetch music preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPreference = async (data) => {
    try {
      const response = await api.post('/music', data)
      await fetchPreferences()
      return response.data
    } catch (error) {
      console.error('Failed to create music preference:', error)
      throw error
    }
  }

  const updatePreference = async (id, data) => {
    try {
      const response = await api.put(`/music/${id}`, data)
      await fetchPreferences()
      return response.data
    } catch (error) {
      console.error('Failed to update music preference:', error)
      throw error
    }
  }

  const deletePreference = async (id) => {
    try {
      await api.delete(`/music/${id}`)
      await fetchPreferences()
    } catch (error) {
      console.error('Failed to delete music preference:', error)
      throw error
    }
  }

  const uploadCover = async (id, file) => {
    try {
      setUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('image', file)

      const response = await api.post(`/music/${id}/cover`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setUploadProgress(progress)
        }
      })

      await fetchPreferences()
      return response.data
    } catch (error) {
      console.error('Failed to upload cover:', error)
      throw error
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const deleteCover = async (id) => {
    try {
      await api.delete(`/music/${id}/cover`)
      await fetchPreferences()
    } catch (error) {
      console.error('Failed to delete cover:', error)
      throw error
    }
  }

  const switchPlatform = (platform) => {
    setCurrentPlatform(platform)
    localStorage.setItem('musicPlatform', platform)
  }

  const setActivePlaylist = async (id, platform) => {
    try {
      await updatePreference(id, { is_active: true })
      if (platform === 'spotify') {
        setActiveSpotify(preferences.find(p => p.id === id))
      } else {
        setActiveYoutube(preferences.find(p => p.id === id))
      }
    } catch (error) {
      console.error('Failed to set active playlist:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchPreferences()
  }, [])

  const getCurrentPlaylist = () => {
    return currentPlatform === 'spotify' ? activeSpotify : activeYoutube
  }

  const getPlaylistsByPlatform = (platform) => {
    return preferences.filter(p => p.platform === platform)
  }

  return {
    preferences,
    activeSpotify,
    activeYoutube,
    currentPlatform,
    currentPlaylist: getCurrentPlaylist(),
    loading,
    uploading,
    uploadProgress,
    createPreference,
    updatePreference,
    deletePreference,
    uploadCover,
    deleteCover,
    switchPlatform,
    setActivePlaylist,
    getPlaylistsByPlatform,
    refreshPreferences: fetchPreferences
  }
}
