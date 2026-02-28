import { useState, useEffect } from 'react'
import api from '../../../config/api'

export const useTasks = (workspaceId) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks', {
          params: { workspaceId }
        })
        setTasks(response.data)
      } catch (err) {
        setError(err.message)
        console.error('Failed to fetch tasks:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [workspaceId])

  return { tasks, setTasks, loading, error }
}
