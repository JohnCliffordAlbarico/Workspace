import { useState, useEffect } from 'react'
import { useTaskActions } from '../hooks/useTaskActions'
import api from '../../../config/api'

const TaskDetailModal = ({ isOpen, onClose, task, setTasks, allTasks }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [showSubtaskForm, setShowSubtaskForm] = useState(false)
  const [subtaskTitle, setSubtaskTitle] = useState('')
  const [subtasks, setSubtasks] = useState([])
  const [loadingSubtasks, setLoadingSubtasks] = useState(false)
  const { toggleTask, deleteTask, loading } = useTaskActions(setTasks)

  const [editData, setEditData] = useState({
    title: '',
    description: '',
    priority: '',
    status: '',
    due_date: '',
    goal_time_minutes: ''
  })

  useEffect(() => {
    if (task) {
      setEditData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        goal_time_minutes: task.goal_time_minutes || ''
      })
      loadSubtasks()
    }
  }, [task])

  const loadSubtasks = async () => {
    if (!task?.id) return
    setLoadingSubtasks(true)
    try {
      const response = await api.get(`/tasks/${task.id}/subtasks`)
      setSubtasks(response.data)
    } catch (error) {
      console.error('Failed to load subtasks:', error)
    } finally {
      setLoadingSubtasks(false)
    }
  }

  const handleSave = async () => {
    try {
      const updateData = {
        title: editData.title,
        description: editData.description || null,
        priority: editData.priority,
        status: editData.status,
        due_date: editData.due_date || null,
        goal_time_minutes: editData.goal_time_minutes ? parseInt(editData.goal_time_minutes) : null
      }

      const response = await api.put(`/tasks/${task.id}`, updateData)
      setTasks(prev => prev.map(t => t.id === task.id ? response.data : t))
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update task:', error)
      alert('Failed to update task. Please try again.')
    }
  }

  const handleAddSubtask = async () => {
    if (!subtaskTitle.trim()) return

    try {
      const response = await api.post('/tasks', {
        workspace_id: task.workspace_id,
        parent_task_id: task.id,
        title: subtaskTitle,
        priority: task.priority,
        status: 'pending'
      })

      setSubtasks(prev => [...prev, response.data])
      setSubtaskTitle('')
      setShowSubtaskForm(false)
    } catch (error) {
      console.error('Failed to add subtask:', error)
      alert('Failed to add subtask. Please try again.')
    }
  }

  const handleToggleSubtask = async (subtaskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
      const updateData = { status: newStatus }
      
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      const response = await api.put(`/tasks/${subtaskId}`, updateData)
      setSubtasks(prev => prev.map(st => st.id === subtaskId ? response.data : st))
    } catch (error) {
      console.error('Failed to toggle subtask:', error)
    }
  }

  const handleDeleteSubtask = async (subtaskId) => {
    if (!window.confirm('Delete this subtask?')) return

    try {
      await api.delete(`/tasks/${subtaskId}`)
      setSubtasks(prev => prev.filter(st => st.id !== subtaskId))
    } catch (error) {
      console.error('Failed to delete subtask:', error)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${task.title}" and all its subtasks?`)) return
    await deleteTask(task.id)
    onClose()
  }

  const handleToggleComplete = async () => {
    await toggleTask(task.id, task.status, true)
    onClose()
  }

  if (!isOpen || !task) return null

  const priorityColors = {
    critical: '#ff4757',
    high: '#ffa502',
    medium: '#7bed9f',
    low: '#70a1ff'
  }

  const completedSubtasks = subtasks.filter(st => st.status === 'completed').length
  const totalSubtasks = subtasks.length

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
        className="w-full max-w-3xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.95) 0%, rgba(26, 10, 10, 0.98) 100%)',
          border: '2px solid rgba(200, 80, 80, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full text-3xl font-bold px-3 py-2 rounded-lg outline-none"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(200, 80, 80, 0.3)',
                  color: '#f5e6d3'
                }}
              />
            ) : (
              <h2 
                className="text-3xl font-bold"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: '#f5e6d3',
                  textShadow: '0 2px 10px rgba(200, 80, 80, 0.3)'
                }}
              >
                {task.title}
              </h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-2xl ml-4 transition-all duration-200"
            style={{ color: '#c85050' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
          >
            ✕
          </button>
        </div>

        {/* Task Details */}
        <div className="space-y-6">
          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-semibold" style={{ color: '#f5e6d3' }}>
                Priority
              </label>
              {isEditing ? (
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg outline-none"
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
              ) : (
                <span
                  className="inline-block px-4 py-2 rounded-lg"
                  style={{
                    background: `${priorityColors[task.priority]}33`,
                    color: priorityColors[task.priority],
                    border: `1px solid ${priorityColors[task.priority]}66`
                  }}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold" style={{ color: '#f5e6d3' }}>
                Status
              </label>
              {isEditing ? (
                <select
                  value={editData.status}
                  onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg outline-none"
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
              ) : (
                <span style={{ color: '#a89080' }}>
                  {task.status === 'pending' && '⏳ Pending'}
                  {task.status === 'in_progress' && '🔄 In Progress'}
                  {task.status === 'completed' && '✅ Completed'}
                  {task.status === 'cancelled' && '❌ Cancelled'}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#f5e6d3' }}>
              Description
            </label>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows="4"
                className="w-full px-4 py-3 rounded-lg outline-none resize-none"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(200, 80, 80, 0.3)',
                  color: '#f5e6d3'
                }}
              />
            ) : (
              <p style={{ color: '#a89080' }}>
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Due Date and Goal Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-semibold" style={{ color: '#f5e6d3' }}>
                Due Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.due_date}
                  onChange={(e) => setEditData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(200, 80, 80, 0.3)',
                    color: '#f5e6d3',
                    colorScheme: 'dark'
                  }}
                />
              ) : (
                <span style={{ color: '#a89080' }}>
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
                </span>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold" style={{ color: '#f5e6d3' }}>
                Goal Time
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editData.goal_time_minutes}
                  onChange={(e) => setEditData(prev => ({ ...prev, goal_time_minutes: e.target.value }))}
                  placeholder="Minutes"
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(200, 80, 80, 0.3)',
                    color: '#f5e6d3'
                  }}
                />
              ) : (
                <span style={{ color: '#a89080' }}>
                  {task.goal_time_minutes ? `${task.goal_time_minutes} minutes` : 'Not set'}
                </span>
              )}
            </div>
          </div>

          {/* Subtasks Section */}
          <div 
            className="rounded-xl p-5"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(200, 80, 80, 0.2)'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 
                className="text-xl font-bold"
                style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
              >
                Subtasks {totalSubtasks > 0 && `(${completedSubtasks}/${totalSubtasks})`}
              </h3>
              <button
                onClick={() => setShowSubtaskForm(!showSubtaskForm)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
                  color: '#f5e6d3'
                }}
              >
                + Add Subtask
              </button>
            </div>

            {/* Add Subtask Form */}
            {showSubtaskForm && (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={subtaskTitle}
                  onChange={(e) => setSubtaskTitle(e.target.value)}
                  placeholder="Subtask title..."
                  className="flex-1 px-4 py-2 rounded-lg outline-none"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(200, 80, 80, 0.3)',
                    color: '#f5e6d3'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                />
                <button
                  onClick={handleAddSubtask}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    background: '#7bed9f',
                    color: '#1a0a0a'
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowSubtaskForm(false)
                    setSubtaskTitle('')
                  }}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 71, 87, 0.3)',
                    color: '#ff4757'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Subtasks List */}
            {loadingSubtasks ? (
              <p style={{ color: '#a89080' }}>Loading subtasks...</p>
            ) : subtasks.length === 0 ? (
              <p style={{ color: '#a89080' }}>No subtasks yet</p>
            ) : (
              <div className="space-y-2">
                {subtasks.map(subtask => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(200, 80, 80, 0.15)'
                    }}
                  >
                    <button
                      onClick={() => handleToggleSubtask(subtask.id, subtask.status)}
                      className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                      style={{
                        borderColor: priorityColors[subtask.priority],
                        background: subtask.status === 'completed' ? priorityColors[subtask.priority] : 'transparent',
                        color: subtask.status === 'completed' ? '#1a0a0a' : 'transparent'
                      }}
                    >
                      {subtask.status === 'completed' ? '✓' : ''}
                    </button>
                    <span
                      className={`flex-1 ${subtask.status === 'completed' ? 'line-through opacity-50' : ''}`}
                      style={{ color: '#f5e6d3' }}
                    >
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="text-sm"
                      style={{ color: '#ff4757' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
                    color: '#f5e6d3'
                  }}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(200, 80, 80, 0.3)',
                    color: '#f5e6d3'
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold"
                  style={{
                    background: 'rgba(200, 80, 80, 0.2)',
                    border: '1px solid rgba(200, 80, 80, 0.3)',
                    color: '#c85050'
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={handleToggleComplete}
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold"
                  style={{
                    background: task.status === 'completed' 
                      ? 'rgba(255, 193, 7, 0.2)' 
                      : 'rgba(126, 237, 159, 0.2)',
                    border: task.status === 'completed'
                      ? '1px solid rgba(255, 193, 7, 0.3)'
                      : '1px solid rgba(126, 237, 159, 0.3)',
                    color: task.status === 'completed' ? '#ffc107' : '#7bed9f'
                  }}
                >
                  {task.status === 'completed' ? '↩️ Reopen' : '✅ Complete'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl font-semibold"
                  style={{
                    background: 'rgba(255, 71, 87, 0.2)',
                    border: '1px solid rgba(255, 71, 87, 0.3)',
                    color: '#ff4757'
                  }}
                >
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailModal
