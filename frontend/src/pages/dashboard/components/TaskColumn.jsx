import { useDroppable } from '@dnd-kit/core'
import { useMemo, useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import TaskItem from './TaskItem'

const TASKS_PER_PAGE = 10

const TaskColumn = ({ title, color, tasks, setTasks, onTaskClick, allTasks, status, isDragging, showCompletedCount = false }) => {
  const [visibleCount, setVisibleCount] = useState(TASKS_PER_PAGE)
  const { setNodeRef, isOver } = useDroppable({
    id: status
  })

  // Reset visible count when tasks change (e.g., category switch)
  useEffect(() => {
    setVisibleCount(TASKS_PER_PAGE)
  }, [tasks.length, status])

  const displayCount = showCompletedCount ? tasks.length : tasks.filter(t => t.status !== 'completed').length

  // Build task hierarchy: for each main task, find its subtasks
  const tasksWithSubtasks = useMemo(() => {
    return tasks.map(task => ({
      ...task,
      subtasks: allTasks.filter(t => t.parent_task_id === task.id)
    }))
  }, [tasks, allTasks])

  // Paginated tasks
  const visibleTasks = useMemo(() => {
    return tasksWithSubtasks.slice(0, visibleCount)
  }, [tasksWithSubtasks, visibleCount])

  const hasMore = tasksWithSubtasks.length > visibleCount
  const remainingCount = tasksWithSubtasks.length - visibleCount

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + TASKS_PER_PAGE)
  }

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
        {visibleTasks.map((task) => (
          <TaskItem 
            key={task.id} 
            task={task} 
            subtasks={task.subtasks}
            color={color} 
            setTasks={setTasks}
            onTaskClick={onTaskClick}
          />
        ))}

        {/* Load More Button */}
        {hasMore && (
          <button
            onClick={handleLoadMore}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: `1px solid ${color}40`,
              color: color
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <ChevronDown size={16} />
            Load More ({remainingCount} remaining)
          </button>
        )}
      </div>
    </section>
  )
}

export default TaskColumn
