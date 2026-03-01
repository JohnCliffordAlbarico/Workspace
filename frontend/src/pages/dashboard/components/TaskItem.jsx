import { useState } from 'react'
import { useTaskActions } from '../hooks/useTaskActions'
import { useTaskTimer } from '../hooks/useTaskTimer'

const TaskItem = ({ task, color, setTasks, onTaskClick, allTasks }) => {
  const [showDelete, setShowDelete] = useState(false)
  const { toggleTask, startTask, completeTask, cancelTask, loading } = useTaskActions(setTasks)
  const duration = useTaskTimer(task.started_at)

  const handleToggle = async (e) => {
    e.stopPropagation() // Prevent opening modal when clicking checkbox
    await toggleTask(task.id, task.status, true)
  }

  const handleStart = async (e) => {
    e.stopPropagation()
    
    // Check if another task is already in progress
    const inProgressTask = allTasks.find(t => t.status === 'in_progress' && t.id !== task.id)
    if (inProgressTask) {
      alert(`Cannot start this task. "${inProgressTask.title}" is already in progress. Please complete or cancel it first.`)
      return
    }

    await startTask(task.id)
  }

  const handleComplete = async (e) => {
    e.stopPropagation()
    await completeTask(task.id)
  }

  const handleCancel = async (e) => {
    e.stopPropagation()
    await cancelTask(task.id)
  }

  const handleCardClick = () => {
    onTaskClick(task)
  }

  const isCompleted = task.status === 'completed'
  const isInProgress = task.status === 'in_progress'
  const isPending = task.status === 'pending'

  return (
    <div
      className="rounded-xl p-4 transition-all duration-300 cursor-pointer"
      style={{
        background: `${color}26`,
        border: `1px solid ${color}66`,
        animation: 'slideIn 0.3s ease-out forwards'
      }}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      onClick={handleCardClick}
    >
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* In Progress Badge */}
      {isInProgress && (
        <div className="mb-2 flex items-center justify-between">
          <div 
            className="px-3 py-1 rounded-lg text-xs font-semibold inline-block"
            style={{
              background: 'linear-gradient(135deg, #7bed9f 0%, #2ed573 100%)',
              color: '#1a0a0a',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          >
            🔄 In Progress
          </div>
          {duration && (
            <span 
              className="text-xs font-mono font-semibold"
              style={{ color: '#7bed9f' }}
            >
              ⏱️ {duration}
            </span>
          )}
        </div>
      )}

      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          disabled={loading}
          className="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 mt-0.5"
          style={{
            borderColor: color,
            background: isCompleted ? color : 'transparent',
            color: isCompleted ? '#1a0a0a' : 'transparent'
          }}
        >
          {isCompleted ? '✓' : ''}
        </button>

        <div className="flex-1">
          <span
            className={`text-base leading-relaxed block ${isCompleted ? 'line-through opacity-50' : ''}`}
            style={{ color: '#f5e6d3' }}
          >
            {task.title}
          </span>

          {/* Action Buttons */}
          {isPending && (
            <button
              onClick={handleStart}
              disabled={loading}
              className="mt-2 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #7bed9f 0%, #2ed573 100%)',
                color: '#1a0a0a',
                border: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(126, 237, 159, 0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              ▶️ Start
            </button>
          )}

          {isInProgress && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleComplete}
                disabled={loading}
                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #7bed9f 0%, #2ed573 100%)',
                  color: '#1a0a0a',
                  border: 'none'
                }}
              >
                ✅ Complete
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300"
                style={{
                  background: 'rgba(255, 71, 87, 0.3)',
                  border: '1px solid rgba(255, 71, 87, 0.5)',
                  color: '#ff4757'
                }}
              >
                ❌ Cancel
              </button>
            </div>
          )}
        </div>

        <span 
          className="text-sm transition-opacity duration-200"
          style={{
            color: '#a89080',
            opacity: showDelete ? 1 : 0
          }}
        >
          👁️
        </span>
      </div>
    </div>
  )
}

export default TaskItem
