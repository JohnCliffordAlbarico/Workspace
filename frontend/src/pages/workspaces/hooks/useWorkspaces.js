import { useState, useEffect } from 'react'
import api from '../../../config/api'

export const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWorkspaces = async () => {
    try {
      setLoading(true)
      const response = await api.get('/workspaces')
      setWorkspaces(response.data || [])
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch workspaces:', err)
    } finally {
      setLoading(false)
    }
  }

  const createWorkspace = async (name) => {
    const response = await api.post('/workspaces', { name })
    setWorkspaces(prev => [response.data, ...prev])
    return response.data
  }

  const deleteWorkspace = async (id) => {
    await api.delete(`/workspaces/${id}`)
    setWorkspaces(prev => prev.filter(w => w.id !== id))
  }

  const updateWorkspace = async (id, name) => {
    const response = await api.put(`/workspaces/${id}`, { name })
    setWorkspaces(prev => prev.map(w => w.id === id ? response.data : w))
    // Update selected workspace in localStorage if it's the one being edited
    const saved = localStorage.getItem('selectedWorkspace')
    if (saved) {
      const selected = JSON.parse(saved)
      if (selected.id === id) {
        localStorage.setItem('selectedWorkspace', JSON.stringify(response.data))
      }
    }
    return response.data
  }

  const selectWorkspace = (workspace) => {
    localStorage.setItem('selectedWorkspace', JSON.stringify(workspace))
  }

  const getSelectedWorkspace = () => {
    try {
      const saved = localStorage.getItem('selectedWorkspace')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  return {
    workspaces,
    loading,
    error,
    fetchWorkspaces,
    createWorkspace,
    deleteWorkspace,
    updateWorkspace,
    selectWorkspace,
    getSelectedWorkspace
  }
}
