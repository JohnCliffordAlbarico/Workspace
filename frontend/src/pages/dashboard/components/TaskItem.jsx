import { useState } from 'react'
import { useTaskActions } from '../hooks/useTaskActions'

const TaskItem = ({ task, color, setTasks, onTaskClick, allTasks }) => {
  const [showIcon, setShowIcon] = useState(false)
  const { startTask, loading } = useTaskActions(setTasks)

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

  const handleCardClick = () => {
    onTaskClick(task)
  }

  const isCompleted = task.status === 'completed'
  const isPending = task.status === 'pending'

  // Calculate actual time spent for completed tasks
  const getActualTime = () => {
    if (!isCompleted || !task.started_at || !task.completed_at) return null
    
    const start = new Date(task.started_at)
    const end = new Date(task.completed_at)
    const minutes = Math.floor((end - start) / 60000)
    
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    return { hours, mins, total: minutes }
  }
  
  const actualTime = getActualTime()
  const goalTime = task.goal_time_minutes

  return (
    <div
      className="rounded-xl p-4 transition-all duration-300 cursor-pointer"
      style={{
        background: `${color}26`,
        border: `1px solid ${color}66`,
        animation: 'slideIn 0.3s ease-out forwards'
      }}
      onMouseEnter={() => setShowIcon(true)}
      onMouseLeave={() => setShowIcon(false)}
      onClick={handleCardClick}
    >
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="flex items-start gap-3">
        {/* Start Button for Pending Tasks */}
        {isPending && (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #ffa502 0%, #ff6348 100%)',
              border: 'none',
              color: '#1a0a0a'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 165, 2, 0.5)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            ▶️
          </button>
        )}

        <div className="flex-1">
          <span
            className={`text-base leading-relaxed ${isCompleted ? 'line-through opacity-50' : ''}`}
            style={{ color: '#f5e6d3' }}
          >
            {task.title}
          </span>

          {/* Time information for completed tasks */}
          {isCompleted && actualTime && (
            <div className="flex gap-3 text-xs mt-2">
              <span 
                className="font-mono"
                style={{ color: '#ffa502' }}
              >
                ⏱️ {actualTime.hours}h {actualTime.mins}m
              </span>
              {goalTime && (
                <span 
                  className="font-mono"
                  style={{ 
                    color: actualTime.total <= goalTime ? '#ffa502' : '#ff4757' 
                  }}
                >
                  {actualTime.total <= goalTime ? '✓' : '⚠️'} 
                  Goal: {Math.floor(goalTime / 60)}h {goalTime % 60}m
                </span>
              )}
            </div>
          )}
        </div>

        <span 
          className="text-sm transition-opacity duration-200"
          style={{
            color: '#a89080',
            opacity: showIcon ? 1 : 0
          }}
        >
          👁️
        </span>
      </div>
    </div>
  )
}

export default TaskItem
