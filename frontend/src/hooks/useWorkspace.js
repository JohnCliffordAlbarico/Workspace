import { useState, useEffect } from 'react'
import api from '../config/api'

export const useWorkspace = () => {
  const [workspace, setWorkspace] = useState(() => {
    // Try to load from localStorage first
    try {
      const saved = localStorage.getItem('selectedWorkspace')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializeWorkspace = async () => {
      // If we already have a workspace from localStorage, use it
      if (workspace) {
        setLoading(false)
        return
      }

      try {
        // Fetch existing workspaces
        const response = await api.get('/workspaces')
        
        if (response.data && response.data.length > 0) {
          // Use the first workspace (or most recent)
          const ws = response.data[0]
          setWorkspace(ws)
          localStorage.setItem('selectedWorkspace', JSON.stringify(ws))
        } else {
          // Create a default workspace if none exists
          const createResponse = await api.post('/workspaces', {
            name: 'My Workspace'
          })
          setWorkspace(createResponse.data)
          localStorage.setItem('selectedWorkspace', JSON.stringify(createResponse.data))
        }
      } catch (err) {
        setError(err.message)
        console.error('Failed to initialize workspace:', err)
      } finally {
        setLoading(false)
      }
    }

    initializeWorkspace()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const switchWorkspace = (newWorkspace) => {
    setWorkspace(newWorkspace)
    localStorage.setItem('selectedWorkspace', JSON.stringify(newWorkspace))
  }

  return { workspace, loading, error, switchWorkspace }
}
