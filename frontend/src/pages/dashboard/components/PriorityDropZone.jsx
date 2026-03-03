import { useDroppable } from '@dnd-kit/core'
import TaskItem from './TaskItem'

const priorityConfig = {
  critical: {
    label: '🔥 CRITICAL',
    bg: '#ff4757',
    border: '#ff6b7a',
    text: '#fff5f5'
  },
  high: {
    label: '⚡ HIGH',
    bg: '#ffa502',
    border: '#ffb733',
    text: '#1a0a0a'
  },
  medium: {
    label: '📌 MEDIUM',
    bg: '#a89080',
    border: '#c0a898',
    text: '#f5e6d3'
  },
  low: {
    label: '💤 LOW',
    bg: '#6b2828',
    border: '#8b3a3a',
    text: '#f5e6d3'
  }
}

const PriorityDropZone = ({ priority, tasks, setTasks, onTaskClick, allTasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: priority
  })

  const config = priorityConfig[priority]
  const priorityTasks = tasks.filter(task => task.priority === priority)

  return (
    <div
      ref={setNodeRef}
      className="rounded-xl p-4 transition-all duration-300"
      style={{
        background: isOver ? `${config.bg}40` : `${config.bg}20`,
        border: `2px ${isOver ? 'solid' : 'dashed'} ${config.border}`,
        minHeight: '120px',
        boxShadow: isOver ? `0 0 20px ${config.bg}60` : 'none'
      }}
      role="region"
      aria-label={`${priority} priority tasks`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 
          className="text-lg font-semibold"
          style={{ color: config.text }}
        >
          {config.label}
        </h3>
        <span 
          className="text-sm font-mono px-2 py-1 rounded"
          style={{ 
            background: `${config.bg}40`,
            color: config.text 
          }}
        >
          {priorityTasks.length}
        </span>
      </div>

      <div className="space-y-2">
        {priorityTasks.length === 0 ? (
          <div 
            className="text-center py-8 opacity-50 transition-opacity duration-300"
            style={{ 
              color: config.text,
              opacity: isOver ? 0.8 : 0.5
            }}
          >
            {isOver ? '✨ Drop here' : 'Drop tasks here'}
          </div>
        ) : (
          priorityTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              color={config.bg}
              setTasks={setTasks}
              onTaskClick={onTaskClick}
              allTasks={allTasks}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default PriorityDropZone
