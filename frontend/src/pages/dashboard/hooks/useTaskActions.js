import { useState } from 'react'
import api from '../../../config/api'

export const useTaskActions = (setTasks) => {
  const [loading, setLoading] = useState(false)

  const toggleTask = async (taskId, currentStatus, skipConfirmation = false) => {
    setLoading(true)
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
      const updateData = { status: newStatus }
      
      // Set completed_at timestamp when marking as completed
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }
      
      const response = await api.put(`/tasks/${taskId}`, updateData)
      
      setTasks(prev => 
        prev.map(task => task.id === taskId ? response.data : task)
      )
      return true
    } catch (error) {
      console.error('Failed to toggle task:', error)
      alert('Failed to update task. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const startTask = async (taskId) => {
    setLoading(true)
    try {
      const updateData = {
        status: 'in_progress',
        started_at: new Date().toISOString()
      }
      
      const response = await api.put(`/tasks/${taskId}`, updateData)
      
      setTasks(prev => 
        prev.map(task => task.id === taskId ? response.data : task)
      )
      return true
    } catch (error) {
      console.error('Failed to start task:', error)
      alert('Failed to start task. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (taskId) => {
    setLoading(true)
    try {
      const updateData = {
        status: 'completed',
        completed_at: new Date().toISOString()
      }
      
      const response = await api.put(`/tasks/${taskId}`, updateData)
      
      setTasks(prev => 
        prev.map(task => task.id === taskId ? response.data : task)
      )
      return true
    } catch (error) {
      console.error('Failed to complete task:', error)
      alert('Failed to complete task. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const pauseTask = async (taskId, startedAt, previousActualMinutes = 0) => {
    setLoading(true)
    try {
      let sessionMinutes = 0
      if (startedAt) {
        const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000)
        sessionMinutes = Math.max(0, elapsed)
      }

      const totalMinutes = (previousActualMinutes || 0) + sessionMinutes

      const updateData = {
        status: 'paused',
        actual_time_minutes: totalMinutes > 0 ? totalMinutes : undefined,
        started_at: null
      }
      
      const response = await api.put(`/tasks/${taskId}`, updateData)
      
      setTasks(prev => 
        prev.map(task => task.id === taskId ? response.data : task)
      )
      return true
    } catch (error) {
      console.error('Failed to pause task:', error)
      alert('Failed to pause task. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const cancelTask = async (taskId) => {
    setLoading(true)
    try {
      const updateData = {
        status: 'cancelled'
      }
      
      const response = await api.put(`/tasks/${taskId}`, updateData)
      
      setTasks(prev => 
        prev.map(task => task.id === taskId ? response.data : task)
      )
      return true
    } catch (error) {
      console.error('Failed to cancel task:', error)
      alert('Failed to cancel task. Please try again.')
      return false
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

  return { toggleTask, startTask, completeTask, pauseTask, cancelTask, deleteTask, loading }
}
