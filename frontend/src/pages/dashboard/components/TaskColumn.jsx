import { useDroppable } from '@dnd-kit/core'
import { useMemo } from 'react'
import TaskItem from './TaskItem'

const TaskColumn = ({ title, color, tasks, setTasks, onTaskClick, allTasks, priority, isDragging, showCompletedCount = false }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: priority
  })

  const displayCount = showCompletedCount ? tasks.length : tasks.filter(t => t.status !== 'completed').length

  // Build task hierarchy: for each main task, find its subtasks
  const tasksWithSubtasks = useMemo(() => {
    return tasks.map(task => ({
      ...task,
      subtasks: allTasks.filter(t => t.parent_task_id === task.id)
    }))
  }, [tasks, allTasks])

  return (
    <section 
      ref={setNodeRef}
      className="rounded-2xl p-5 transition-all duration-300"
      style={{
        background: isOver ? 'rgba(45, 20, 25, 0.8)' : 'rgba(45, 20, 25, 0.6)',
        border: `1px solid ${color}40`,
        boxShadow: isOver ? `0 0 20px ${color}40` : 'none'
      }}
    >
      <div 
        className="flex items-center gap-2 mb-4 pb-3"
        style={{ borderBottom: `1px solid ${color}33` }}
      >
        <span className="w-3 h-3 rounded-full" style={{ background: color }} />
        <h2 
          className="text-lg font-semibold"
          style={{ fontFamily: "'Cinzel', serif", color }}
        >
          {title}
        </h2>
        <span 
          className="ml-auto px-2 py-1 rounded text-xs"
          style={{ background: `${color}33`, color }}
        >
          {displayCount}
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {tasksWithSubtasks.map((task) => (
          <TaskItem 
            key={task.id} 
            task={task} 
            subtasks={task.subtasks}
            color={color} 
            setTasks={setTasks}
            onTaskClick={onTaskClick}
            allTasks={allTasks}
          />
        ))}
      </div>
    </section>
  )
}

export default TaskColumn
