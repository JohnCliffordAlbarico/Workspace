import { useState, useEffect } from 'react'
import { useAddTask } from '../hooks/useAddTask'

const TaskModal = ({ isOpen, onClose, workspaceId, setTasks, tasks }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    days_until_due: '',
    goal_hours: '',
    goal_minutes: '',
    parent_task_id: ''
  })

  const { addTask, loading } = useAddTask(setTasks)

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        days_until_due: '',
        goal_hours: '',
        goal_minutes: '',
        parent_task_id: ''
      })
    }
  }, [isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('Task title is required')
      return
    }

    // Calculate due_date from days_until_due
    let due_date = null
    if (formData.days_until_due && parseInt(formData.days_until_due) > 0) {
      const daysToAdd = parseInt(formData.days_until_due)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + daysToAdd)
      due_date = dueDate.toISOString()
    }

    // Calculate goal_time_minutes from hours and minutes
    let goal_time_minutes = null
    const hours = parseInt(formData.goal_hours) || 0
    const minutes = parseInt(formData.goal_minutes) || 0
    if (hours > 0 || minutes > 0) {
      goal_time_minutes = (hours * 60) + minutes
    }

    const taskData = {
      workspace_id: workspaceId,
      title: formData.title,
      description: formData.description || null,
      priority: formData.priority,
      status: formData.status,
      due_date: due_date,
      goal_time_minutes: goal_time_minutes,
      parent_task_id: formData.parent_task_id || null
    }

    await addTask(taskData)
    onClose()
  }

  if (!isOpen) return null

  // Filter out completed tasks and subtasks for parent selection
  const availableParentTasks = tasks.filter(t => 
    t.status !== 'completed' && !t.parent_task_id
  )

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.95) 0%, rgba(26, 10, 10, 0.98) 100%)',
          border: '2px solid rgba(200, 80, 80, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-3xl font-bold"
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#f5e6d3',
              textShadow: '0 2px 10px rgba(200, 80, 80, 0.3)'
            }}
          >
            ✨ Create New Task
          </h2>
          <button
            onClick={onClose}
            className="text-2xl transition-all duration-200"
            style={{ color: '#c85050' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label 
              className="block mb-2 text-sm font-semibold"
              style={{ color: '#f5e6d3' }}
            >
              Task Title <span style={{ color: '#ff4757' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title..."
              required
              className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all duration-300"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(200, 80, 80, 0.3)',
                color: '#f5e6d3'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#c85050'
                e.target.style.boxShadow = '0 0 15px rgba(200, 80, 80, 0.3)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(200, 80, 80, 0.3)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label 
              className="block mb-2 text-sm font-semibold"
              style={{ color: '#f5e6d3' }}
            >
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add task details..."
              rows="4"
              className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all duration-300 resize-none"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(200, 80, 80, 0.3)',
                color: '#f5e6d3'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#c85050'
                e.target.style.boxShadow = '0 0 15px rgba(200, 80, 80, 0.3)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(200, 80, 80, 0.3)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Priority and Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                className="block mb-2 text-sm font-semibold"
                style={{ color: '#f5e6d3' }}
              >
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-base outline-none cursor-pointer"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(200, 80, 80, 0.3)',
                  color: '#f5e6d3'
                }}
              >
                <option value="critical">🔴 Critical</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟢 Medium</option>
                <option value="low">🔵 Low</option>
              </select>
            </div>

            <div>
              <label 
                className="block mb-2 text-sm font-semibold"
                style={{ color: '#f5e6d3' }}
              >
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-base outline-none cursor-pointer"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(200, 80, 80, 0.3)',
                  color: '#f5e6d3'
                }}
              >
                <option value="pending">⏳ Pending</option>
                <option value="in_progress">🔄 In Progress</option>
                <option value="completed">✅ Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>
          </div>

          {/* Days Until Due and Goal Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                className="block mb-2 text-sm font-semibold"
                style={{ color: '#f5e6d3' }}
              >
                Days Until Due
              </label>
              <input
                type="number"
                name="days_until_due"
                value={formData.days_until_due}
                onChange={handleChange}
                placeholder="e.g., 7 (for 7 days from now)"
                min="0"
                className="w-full px-4 py-3 rounded-xl text-base outline-none"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(200, 80, 80, 0.3)',
                  color: '#f5e6d3'
                }}
              />
            </div>

            <div>
              <label 
                className="block mb-2 text-sm font-semibold"
                style={{ color: '#f5e6d3' }}
              >
                Goal Time
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="goal_hours"
                  value={formData.goal_hours}
                  onChange={handleChange}
                  placeholder="Hours"
                  min="0"
                  className="flex-1 px-4 py-3 rounded-xl text-base outline-none"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(200, 80, 80, 0.3)',
                    color: '#f5e6d3'
                  }}
                />
                <span 
                  className="flex items-center px-2 text-sm"
                  style={{ color: '#a89080' }}
                >
                  h
                </span>
                <input
                  type="number"
                  name="goal_minutes"
                  value={formData.goal_minutes}
                  onChange={handleChange}
                  placeholder="Minutes"
                  min="0"
                  max="59"
                  className="flex-1 px-4 py-3 rounded-xl text-base outline-none"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(200, 80, 80, 0.3)',
                    color: '#f5e6d3'
                  }}
                />
                <span 
                  className="flex items-center px-2 text-sm"
                  style={{ color: '#a89080' }}
                >
                  m
                </span>
              </div>
            </div>
          </div>

          {/* Parent Task (Subtask) */}
          {availableParentTasks.length > 0 && (
            <div>
              <label 
                className="block mb-2 text-sm font-semibold"
                style={{ color: '#f5e6d3' }}
              >
                Make this a subtask of:
              </label>
              <select
                name="parent_task_id"
                value={formData.parent_task_id}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-base outline-none cursor-pointer"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(200, 80, 80, 0.3)',
                  color: '#f5e6d3'
                }}
              >
                <option value="">None (Main Task)</option>
                {availableParentTasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(200, 80, 80, 0.3)',
                color: '#f5e6d3'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.6)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.4)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
                color: '#f5e6d3',
                border: 'none'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(200, 80, 80, 0.4)'
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {loading ? 'Creating...' : '✨ Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal
