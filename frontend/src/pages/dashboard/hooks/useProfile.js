import { useState, useEffect } from 'react'
import api from '../../../config/api'

export const useProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile')
      setProfile(response.data)
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.data))
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data) => {
    try {
      const response = await api.put('/users/profile', data)
      setProfile(response.data)
      localStorage.setItem('user', JSON.stringify(response.data))
      return response.data
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  const uploadImage = async (file) => {
    try {
      setUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('image', file)

      const response = await api.post('/users/profile/image', formData, {
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

      setProfile(response.data.user)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      return response.data
    } catch (error) {
      console.error('Failed to upload image:', error)
      throw error
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const deleteImage = async () => {
    try {
      const response = await api.delete('/users/profile/image')
      setProfile(response.data)
      localStorage.setItem('user', JSON.stringify(response.data))
      return response.data
    } catch (error) {
      console.error('Failed to delete image:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    profile,
    loading,
    uploading,
    uploadProgress,
    updateProfile,
    uploadImage,
    deleteImage,
    refreshProfile: fetchProfile
  }
}
