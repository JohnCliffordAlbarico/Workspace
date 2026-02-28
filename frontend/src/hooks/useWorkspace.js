import { useState, useEffect } from 'react'
import api from '../config/api'

export const useWorkspace = () => {
  const [workspace, setWorkspace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        // Fetch existing workspaces
        const response = await api.get('/workspaces')
        
        if (response.data && response.data.length > 0) {
          // Use the first workspace (or most recent)
          setWorkspace(response.data[0])
        } else {
          // Create a default workspace if none exists
          const createResponse = await api.post('/workspaces', {
            name: 'My Workspace'
          })
          setWorkspace(createResponse.data)
        }
      } catch (err) {
        setError(err.message)
        console.error('Failed to initialize workspace:', err)
      } finally {
        setLoading(false)
      }
    }

    initializeWorkspace()
  }, [])

  return { workspace, loading, error }
}
