import { useState } from 'react'
import api from '../../../config/api'

export const useTaskActions = (setTasks) => {
  const [loading, setLoading] = useState(false)

  const toggleTask = async (taskId, currentStatus) => {
    setLoading(true)
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus })
      
      setTasks(prev => 
        prev.map(task => task.id === taskId ? response.data : task)
      )
    } catch (error) {
      console.error('Failed to toggle task:', error)
      alert('Failed to update task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (taskId) => {
    setLoading(true)
    try {
      await api.delete(`/tasks/${taskId}`)
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Failed to delete task:', error)
      alert('Failed to delete task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return { toggleTask, deleteTask, loading }
}
