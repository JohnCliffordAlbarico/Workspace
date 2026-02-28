import { useState } from 'react'
import api from '../../../config/api'

export const useAddTask = (setTasks) => {
  const [loading, setLoading] = useState(false)

  const addTask = async (taskData) => {
    setLoading(true)
    try {
      const response = await api.post('/tasks', taskData)
      setTasks(prev => [...prev, response.data])
    } catch (error) {
      console.error('Failed to add task:', error)
      alert('Failed to add task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return { addTask, loading }
}
