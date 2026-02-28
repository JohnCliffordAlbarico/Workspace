import { useState } from 'react'
import { useTaskActions } from '../hooks/useTaskActions'

const TaskItem = ({ task, color, setTasks, onTaskClick }) => {
  const [showDelete, setShowDelete] = useState(false)
  const { toggleTask, loading } = useTaskActions(setTasks)

  const handleToggle = async (e) => {
    e.stopPropagation() // Prevent opening modal when clicking checkbox
    await toggleTask(task.id, task.status, true)
  }

  const handleCardClick = () => {
    onTaskClick(task)
  }

  const isCompleted = task.status === 'completed'

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
      `}</style>

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

        <span
          className={`flex-1 text-base leading-relaxed ${isCompleted ? 'line-through opacity-50' : ''}`}
          style={{ color: '#f5e6d3' }}
        >
          {task.title}
        </span>

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
