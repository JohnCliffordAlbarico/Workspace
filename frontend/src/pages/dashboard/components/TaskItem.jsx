import { useState } from 'react'

const TaskItem = ({ task, color, setTasks, onTaskClick }) => {
  const [showIcon, setShowIcon] = useState(false)

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
