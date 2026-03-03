import { useState } from 'react'
import api from '../../../config/api'

export const usePriorityDrag = (setTasks) => {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setIsDragging(false)

    if (!over) return

    const taskId = active.id
    const newPriority = over.id
    const oldPriority = active.data.current.priority

    // Don't update if dropped in same zone
    if (oldPriority === newPriority) return

    // Optimistic update
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, priority: newPriority }
          : task
      )
    )

    // Persist to backend
    try {
      await api.put(`/api/tasks/${taskId}`, { priority: newPriority })
      setError(null)
    } catch (error) {
      console.error('Failed to update task priority:', error)
      
      // Show error message
      setError('Failed to update task priority. Please try again.')
      setTimeout(() => setError(null), 3000)
      
      // Revert on error
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, priority: oldPriority }
            : task
        )
      )
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
    setError(null)
  }

  const handleDragCancel = () => {
    setIsDragging(false)
  }

  return {
    handleDragEnd,
    handleDragStart,
    handleDragCancel,
    isDragging,
    error
  }
}
