import { useState, useEffect, useCallback } from 'react'
import api from '../config/api'

export const useDiary = () => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/diary')
      setEntries(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching diary entries:', err)
      setError(err.response?.data?.error || 'Failed to load diary entries.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // All mutation helpers let errors propagate so the UI can catch and display them

  const createEntry = async ({ title, content }) => {
    const { data } = await api.post('/diary', { title, content })
    setEntries(prev => [data, ...prev])
    return data
  }

  const updateEntry = async (id, { title, content }) => {
    const { data } = await api.put(`/diary/${id}`, { title, content })
    setEntries(prev => prev.map(e => (e.id === id ? data : e)))
    return data
  }

  const deleteEntry = async (id) => {
    await api.delete(`/diary/${id}`)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const uploadCover = async (id, file) => {
    const formData = new FormData()
    formData.append('image', file)
    const { data } = await api.post(`/diary/${id}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    // data = { url, entry }
    setEntries(prev => prev.map(e => (e.id === id ? data.entry : e)))
    return data
  }

  const deleteCover = async (id) => {
    const { data } = await api.delete(`/diary/${id}/cover`)
    // data = updated entry
    setEntries(prev => prev.map(e => (e.id === id ? data : e)))
    return data
  }

  return {
    entries,
    loading,
    error,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    uploadCover,
    deleteCover
  }
}
