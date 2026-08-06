import { useState, useMemo, memo } from 'react'
import { useTaskActions } from '../hooks/useTaskActions'
import { useDraggable } from '@dnd-kit/core'
import ConfirmationModal from '../modal/ConfirmationModal'
import WarningModal from '../modal/WarningModal'
import QuickAddSubtask from './QuickAddSubtask'
import { Plus } from 'lucide-react'

const TaskItem = memo(({ task, subtasks = [], color, setTasks, onTaskClick }) => {
  const [showIcon, setShowIcon] = useState(false)
  const [showPauseConfirm, setShowPauseConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false)
  const [incompleteSubtasks, setIncompleteSubtasks] = useState([])
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [showQuickAddSubtask, setShowQuickAddSubtask] = useState(false)
  const [showAddSubtaskOption, setShowAddSubtaskOption] = useState(false)
  const { pauseTask, completeTask, loading } = useTaskActions(setTasks)
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      priority: task.priority
    },
    disabled: loading || task.status === 'in_progress'
  })

  const isInProgress = task.status === 'in_progress'
  const isCompleted = task.status === 'completed'
  const isPending = task.status === 'pending'
  const isPaused = task.status === 'paused'

  const hasSubtasks = subtasks.length > 0
  const completedSubtasks = subtasks.filter(t => t.status === 'completed').length

  // Memoize style object to prevent re-creation
  const style = useMemo(() => {
    if (transform) {
      return {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.3 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : 'auto',
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
        willChange: 'transform'
      }
    }
    return {
      cursor: loading || isInProgress ? 'not-allowed' : 'grab',
      transition: 'all 0.3s ease-out',
      opacity: isInProgress ? 0.7 : isPaused ? 0.85 : 1
    }
  }, [transform, isDragging, loading, isInProgress])

  // Calculate actual time spent for completed tasks - memoized
  const actualTime = useMemo(() => {
    if (!isCompleted || !task.started_at || !task.completed_at) return null
    
    const start = new Date(task.started_at)
    const end = new Date(task.completed_at)
    const minutes = Math.floor((end - start) / 60000)
    
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    return { hours, mins, total: minutes }
  }, [isCompleted, task.started_at, task.completed_at])

  const handlePause = async (e) => {
    e.stopPropagation()
    setShowPauseConfirm(true)
  }

  const handleConfirmPause = async () => {
    await pauseTask(task.id, task.started_at, task.actual_time_minutes)
    setShowPauseConfirm(false)
  }

  const handleComplete = async (e) => {
    e.stopPropagation()
    if (subtasks.length > 0) {
      const incomplete = subtasks.filter(t => t.status !== 'completed')
      if (incomplete.length > 0) {
        setIncompleteSubtasks(incomplete)
        setShowIncompleteWarning(true)
        return
      }
    }
    setShowCompleteConfirm(true)
  }

  const handleConfirmComplete = async () => {
    await completeTask(task.id)
    setShowCompleteConfirm(false)
  }

  const handleCardClick = () => {
    onTaskClick(task)
  }

  const handleSubtaskClick = (e, subtask) => {
    e.stopPropagation()
    onTaskClick(subtask)
  }
  
  const goalTime = task.goal_time_minutes

  return (
    <div className="mb-3">
      {/* Main Task Card */}
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="rounded-xl p-4 transition-all duration-300"
        style={{
          background: `${color}26`,
          border: `1px solid ${color}66`,
          animation: 'slideIn 0.3s ease-out forwards',
          ...style
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
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}</style>

        <div className="flex items-start gap-3">
          {/* In Progress indicator */}
          {isInProgress && (
            <div 
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #ffa502 0%, #ff6348 100%)',
                animation: 'pulse 2s ease-in-out infinite'
              }}
              title="Task in progress - cannot change priority"
            >
              ⏱️
            </div>
          )}

          {/* Paused indicator */}
          {isPaused && (
            <div 
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #7bed9f 0%, #2ed573 100%)'
              }}
              title="Task paused - click resume to continue"
            >
              ⏸️
            </div>
          )}
          
          {/* Complete Button for Pending Tasks */}
          {isPending && (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #7bed9f 0%, #2ed573 100%)',
                border: 'none',
                color: '#1a0a0a'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(46, 213, 115, 0.5)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              ✅
            </button>
          )}

          {/* Complete Button for Paused Tasks */}
          {isPaused && (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #7bed9f 0%, #2ed573 100%)',
                border: 'none',
                color: '#1a0a0a'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(46, 213, 115, 0.5)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              ✅
            </button>
          )}

          {/* Pause and Complete Buttons for In Progress Tasks */}
          {isInProgress && (
            <>
            <button
              onClick={handlePause}
              disabled={loading}
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #7bed9f 0%, #2ed573 100%)',
                border: 'none',
                color: '#1a0a0a'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(46, 213, 115, 0.5)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              ⏸️
            </button>
            <button
              onClick={handleComplete}
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
              ✅
            </button>
            </>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-base leading-relaxed ${isCompleted ? 'line-through opacity-50' : ''}`}
                style={{ color: '#f5e6d3' }}
              >
                {task.title}
              </span>
              <span 
                className="text-xs px-2 py-0.5 rounded-full cursor-pointer transition-all duration-200"
                style={{ 
                  background: showSubtasks ? `${color}50` : `${color}20`, 
                  color,
                  border: `1px solid ${showSubtasks ? `${color}70` : `${color}40`}`
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSubtasks(!showSubtasks)
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = `${color}40`
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = showSubtasks ? `${color}50` : `${color}20`
                }}
              >
                {hasSubtasks ? `${completedSubtasks}/${subtasks.length}` : '📁'}
              </span>
            </div>

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

      {/* Subtasks */}
      {showSubtasks && (
        <div 
          className="ml-6 mt-2 space-y-2"
          style={{ borderLeft: `2px solid ${color}40`, paddingLeft: '12px' }}
        >
          {subtasks.map(subtask => (
            <SubtaskItem 
              key={subtask.id}
              subtask={subtask}
              color={color}
              onTaskClick={handleSubtaskClick}
              setTasks={setTasks}
            />
          ))}
          
          {/* Toggle Add Subtask Button */}
          {!showQuickAddSubtask && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowAddSubtaskOption(!showAddSubtaskOption)
              }}
              className="w-full flex items-center justify-center gap-1 py-2 rounded-lg transition-all duration-200 text-xs"
              style={{
                background: `${color}10`,
                border: `1px dashed ${color}30`,
                color: `${color}aa`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = `${color}20`
                e.currentTarget.style.borderColor = `${color}50`
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = `${color}10`
                e.currentTarget.style.borderColor = `${color}30`
              }}
            >
              <Plus className="w-3 h-3" />
              {showAddSubtaskOption ? 'Cancel' : 'Add subtask'}
            </button>
          )}

          {/* Quick Add Subtask Button (shown when toggle is active) */}
          {showAddSubtaskOption && !showQuickAddSubtask && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowQuickAddSubtask(true)
                setShowAddSubtaskOption(false)
              }}
              className="w-full flex items-center justify-center gap-1 py-2 rounded-lg transition-all duration-200 text-xs"
              style={{
                background: `${color}20`,
                border: `1px solid ${color}40`,
                color: '#f5e6d3',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = `${color}30`
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = `${color}20`
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <Plus className="w-3 h-3" />
              Quick add subtask
            </button>
          )}

          {/* Quick Add Subtask Form */}
          {showQuickAddSubtask && (
            <QuickAddSubtask
              parentTaskId={task.id}
              categoryId={task.category_id}
              onSubtaskAdded={(newSubtask) => {
                setTasks(prev => [...prev, newSubtask])
                setShowQuickAddSubtask(false)
              }}
              onCancel={() => setShowQuickAddSubtask(false)}
              color={color}
            />
          )}
        </div>
      )}

      {/* Pause Confirmation Modal */}
      <ConfirmationModal
        isOpen={showPauseConfirm}
        onConfirm={handleConfirmPause}
        onCancel={() => setShowPauseConfirm(false)}
        title="⏸️ Pause Task?"
        message={`Pause "${task.title}"? Time worked so far will be saved. You can resume later.`}
        confirmText="Yes, Pause"
        cancelText="Keep Working"
      />

      {/* Complete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCompleteConfirm}
        onConfirm={handleConfirmComplete}
        onCancel={() => setShowCompleteConfirm(false)}
        title="✅ Complete Task?"
        message={`Mark "${task.title}" as completed?${task.parent_task_id ? ' Time worked will be added to the parent task.' : ''}`}
        confirmText="Yes, Complete"
        cancelText="Not Yet"
      />

      {/* Incomplete Subtasks Warning Modal */}
      <WarningModal
        isOpen={showIncompleteWarning}
        onClose={() => setShowIncompleteWarning(false)}
        title="⚠️ Incomplete Subtasks"
        message={`Complete all subtasks before marking the task as done.`}
        items={incompleteSubtasks.map(t => t.title)}
      />
    </div>
  )
})

// Subtask Item Component
const SubtaskItem = memo(({ subtask, color, onTaskClick, setTasks }) => {
  const { startTask, pauseTask, loading } = useTaskActions(setTasks)
  const isCompleted = subtask.status === 'completed'
  const isPending = subtask.status === 'pending'
  const isInProgress = subtask.status === 'in_progress'
  const isPaused = subtask.status === 'paused'

  const statusIcon = isCompleted ? '✅' : isInProgress ? '🔄' : isPaused ? '⏸️' : '⬜'

  const handleStart = async (e) => {
    e.stopPropagation()
    await startTask(subtask.id)
  }

  const handlePause = async (e) => {
    e.stopPropagation()
    await pauseTask(subtask.id, subtask.started_at, subtask.actual_time_minutes)
  }

  return (
    <div
      className="rounded-lg px-3 py-2 transition-all duration-200 cursor-pointer"
      style={{
        background: `${color}15`,
        border: `1px solid ${color}30`,
        opacity: isCompleted ? 0.6 : 1
      }}
      onClick={(e) => onTaskClick(e, subtask)}
      onMouseOver={(e) => {
        e.currentTarget.style.background = `${color}25`
        e.currentTarget.style.borderColor = `${color}50`
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = `${color}15`
        e.currentTarget.style.borderColor = `${color}30`
      }}
    >
      <div className="flex items-center gap-2">
        {/* Start Button for Pending Subtasks */}
        {isPending && (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #ffa502 0%, #ff6348 100%)',
              border: 'none',
              color: '#1a0a0a',
              fontSize: '0.65rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)'
              e.currentTarget.style.boxShadow = '0 3px 10px rgba(255, 165, 2, 0.5)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            ▶️
          </button>
        )}

        {/* Pause Button for In Progress Subtasks */}
        {isInProgress && (
          <button
            onClick={handlePause}
            disabled={loading}
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #7bed9f 0%, #2ed573 100%)',
              border: 'none',
              color: '#1a0a0a',
              fontSize: '0.65rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)'
              e.currentTarget.style.boxShadow = '0 3px 10px rgba(46, 213, 115, 0.5)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            ⏸️
          </button>
        )}

        {/* Resume Button for Paused Subtasks */}
        {isPaused && (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #7bed9f 0%, #2ed573 100%)',
              border: 'none',
              color: '#1a0a0a',
              fontSize: '0.65rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)'
              e.currentTarget.style.boxShadow = '0 3px 10px rgba(46, 213, 115, 0.5)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            ▶️
          </button>
        )}

        {/* Status Icon (when no action button) */}
        {!isPending && !isInProgress && !isPaused && (
          <span className="text-sm flex-shrink-0">{statusIcon}</span>
        )}

        <span 
          className={`text-sm ${isCompleted ? 'line-through opacity-60' : ''}`}
          style={{ color: '#f5e6d3' }}
        >
          {subtask.title}
        </span>
      </div>
    </div>
  )
})

TaskItem.displayName = 'TaskItem'
SubtaskItem.displayName = 'SubtaskItem'

export default TaskItem
