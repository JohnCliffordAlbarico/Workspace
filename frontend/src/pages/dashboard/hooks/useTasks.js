import { useState, useEffect } from 'react'
import api from '../../../config/api'

export const useTasks = (workspaceId, options = {}) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  const { status, page, limit, refresh } = options

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false)
      return
    }

    const fetchTasks = async () => {
      try {
        const params = { workspaceId }
        if (status) params.status = status
        if (page) params.page = page
        if (limit) params.limit = limit

        const response = await api.get('/tasks', { params })
        
        // Handle both paginated and non-paginated responses
        if (response.data.data) {
          setTasks(response.data.data)
          setPagination(response.data.pagination)
        } else {
          setTasks(response.data)
          setPagination(null)
        }
      } catch (err) {
        setError(err.message)
        console.error('Failed to fetch tasks:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [workspaceId, status, page, limit, refresh])

  return { tasks, setTasks, loading, error, pagination }
}
