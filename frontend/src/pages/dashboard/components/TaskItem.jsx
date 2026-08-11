import { useState, useMemo, memo } from 'react'
import { useTaskActions } from '../hooks/useTaskActions'
import { useDraggable } from '@dnd-kit/core'
import ConfirmationModal from '../modal/ConfirmationModal'
import WarningModal from '../modal/WarningModal'
import QuickAddSubtask from './QuickAddSubtask'
import { Plus, Play, Pause, Ghost, MoreHorizontal, SkipForward } from 'lucide-react'

const TaskItem = memo(({ task, subtasks = [], color, setTasks, onTaskClick, refreshStats }) => {
  const [showPauseConfirm, setShowPauseConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false)
  const [incompleteSubtasks, setIncompleteSubtasks] = useState([])
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [showQuickAddSubtask, setShowQuickAddSubtask] = useState(false)
  const [showAddSubtaskOption, setShowAddSubtaskOption] = useState(false)
  const { startTask, pauseTask, completeTask, skipTask, loading } = useTaskActions(setTasks)
  
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
  const isSkipped = task.status === 'skipped'

  const hasSubtasks = subtasks.length > 0
  const completedSubtasks = subtasks.filter(t => t.status === 'completed').length

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
      opacity: isCompleted ? 0.7 : 1
    }
  }, [transform, isDragging, loading, isInProgress, isCompleted])

  const actualTime = useMemo(() => {
    // For tasks with subtasks, always accumulate from subtasks (the actual work)
    if (hasSubtasks) {
      const totalMinutes = subtasks.reduce((sum, st) => {
        if (st.actual_time_minutes > 0) return sum + st.actual_time_minutes
        if (st.started_at && st.completed_at) {
          return sum + Math.floor((new Date(st.completed_at) - new Date(st.started_at)) / 60000)
        }
        return sum
      }, 0)
      return totalMinutes > 0 ? { hours: Math.floor(totalMinutes / 60), mins: totalMinutes % 60, total: totalMinutes } : null
    }

    // For tasks without subtasks, use own time
    if (!isCompleted) return null

    const minutes = task.actual_time_minutes > 0
      ? task.actual_time_minutes
      : (task.started_at && task.completed_at
        ? Math.floor((new Date(task.completed_at) - new Date(task.started_at)) / 60000)
        : null)
    
    if (!minutes || minutes <= 0) return null
    
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    return { hours, mins, total: minutes }
  }, [isCompleted, hasSubtasks, subtasks, task.actual_time_minutes, task.started_at, task.completed_at])

  const handleStart = async (e) => {
    e.stopPropagation()
    await startTask(task.id)
  }

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
    await completeTask(task.id, task.started_at, task.actual_time_minutes)
    if (refreshStats) refreshStats()
    setShowCompleteConfirm(false)
  }

  const handleSkip = async (e) => {
    e.stopPropagation()
    setShowSkipConfirm(true)
  }

  const handleConfirmSkip = async () => {
    await skipTask(task.id)
    setShowSkipConfirm(false)
  }

  const handleCardClick = () => {
    if (isCompleted) return
    onTaskClick(task)
  }

  const handleSubtaskClick = (e, subtask) => {
    e.stopPropagation()
    if (isCompleted) return
    onTaskClick(subtask)
  }
  
  const formatMinutes = (mins) => {
    if (!mins) return '0m'
    if (mins < 60) return `${mins}m`
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  return (
    <div className="mb-3">
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="task-card rounded-2xl p-4 backdrop-blur-sm"
        style={{
          background: 'rgba(30, 12, 15, 0.7)',
          border: '1px solid rgba(200, 80, 80, 0.15)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
          borderLeft: `3px solid ${color}`,
          cursor: isCompleted ? 'default' : 'grab',
          opacity: isCompleted ? 0.6 : 1,
          ...style
        }}
        onClick={handleCardClick}
      >


        {/* Header: Title + Status Icon */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isInProgress && (
              <div 
                className="flex-shrink-0 w-2 h-2 rounded-full"
                style={{
                  background: '#c85050',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              />
            )}
            <span
              className={`text-base font-semibold truncate ${isCompleted ? 'line-through opacity-60' : ''}`}
              style={{ color: '#f5e6d3', fontFamily: "'Cinzel', serif" }}
            >
              {task.title}
            </span>
            {task.recurrence_pattern && task.recurrence_pattern !== 'none' && (
              <span
                className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  background: 'rgba(112, 161, 255, 0.15)',
                  border: '1px solid rgba(112, 161, 255, 0.3)',
                  color: '#70a1ff',
                  fontSize: '10px',
                  lineHeight: '1.2'
                }}
                title={`Repeats ${task.recurrence_pattern}`}
              >
                🔄
              </span>
            )}
          </div>
          
          {/* Status indicator / Play button */}
          {isPending && !hasSubtasks && (
            <button
              onClick={handleStart}
              disabled={loading}
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 btn-lift"
              style={{
                background: 'linear-gradient(135deg, #7bed9f 0%, #2ed573 100%)',
                color: '#1a0a0a'
              }}
            >
              <Play size={14} fill="currentColor" />
            </button>
          )}
          {isPending && hasSubtasks && (
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(168, 144, 128, 0.2)', color: '#a89080' }}>
              📋 Has subtasks
            </span>
          )}
          {isInProgress && (
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(200, 80, 80, 0.2)', color: '#c85050' }}>
              👻 Haunting
            </span>
          )}
          {isPaused && (
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(123, 237, 159, 0.2)', color: '#7bed9f' }}>
              ⏸️ Sleeping
            </span>
          )}
          {isCompleted && (
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(123, 237, 159, 0.15)', color: '#7bed9f' }}>
              👻 Resting
            </span>
          )}
          {isSkipped && (
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(112, 161, 255, 0.15)', color: '#70a1ff' }}>
              ⏭️ Skipped
            </span>
          )}
        </div>

        {/* Actual Time (completed tasks or parent tasks with subtask time) */}
        {actualTime && (
          <div className="flex items-center gap-1 mb-3 text-xs">
            <span style={{ color: '#a89080' }}>⏱️ {isCompleted ? 'Worked:' : 'Accumulated:'}</span>
            <span style={{ color: '#d4a574' }}>{formatMinutes(actualTime.total)}</span>
          </div>
        )}

        {/* Subtask count */}
        {hasSubtasks && (
          <div className="mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowSubtasks(!showSubtasks)
              }}
              className="text-xs px-2 py-1 rounded-full transition-all duration-200"
              style={{ 
                background: showSubtasks ? `${color}30` : `${color}15`, 
                color,
                border: `1px solid ${showSubtasks ? `${color}50` : `${color}30`}`
              }}
            >
              📁 {completedSubtasks}/{subtasks.length} subtasks
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isPending && !hasSubtasks && (
            <>
              <button
                onClick={handleStart}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold btn-lift"
                style={{
                  background: 'linear-gradient(135deg, rgba(123, 237, 159, 0.2) 0%, rgba(46, 213, 115, 0.15) 100%)',
                  border: '1px solid rgba(123, 237, 159, 0.3)',
                  color: '#7bed9f'
                }}
              >
                <Play size={12} fill="currentColor" /> Start
              </button>
              <button
                onClick={handleSkip}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold btn-lift"
                style={{
                  background: 'linear-gradient(135deg, rgba(112, 161, 255, 0.2) 0%, rgba(100, 150, 255, 0.15) 100%)',
                  border: '1px solid rgba(112, 161, 255, 0.3)',
                  color: '#70a1ff'
                }}
              >
                <SkipForward size={12} /> Skip
              </button>
            </>
          )}
          
          {isPending && hasSubtasks && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSubtasks(!showSubtasks)
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold btn-lift"
                style={{
                  background: showSubtasks ? 'rgba(168, 144, 128, 0.25)' : 'rgba(168, 144, 128, 0.15)',
                  border: `1px solid ${showSubtasks ? 'rgba(168, 144, 128, 0.5)' : 'rgba(168, 144, 128, 0.3)'}`,
                  color: '#a89080'
                }}
              >
                {showSubtasks ? '📋 Hide Subtasks' : '📋 View Subtasks'}
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold btn-lift"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 41, 66, 0.3) 0%, rgba(200, 80, 80, 0.25) 100%)',
                  border: '1px solid rgba(200, 80, 80, 0.4)',
                  color: '#c85050'
                }}
              >
                <Ghost size={12} /> Done
              </button>
            </>
          )}
          
          {isInProgress && (
            <>
              <button
                onClick={handlePause}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold btn-lift"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 165, 2, 0.2) 0%, rgba(255, 99, 72, 0.15) 100%)',
                  border: '1px solid rgba(255, 165, 2, 0.3)',
                  color: '#ffa502'
                }}
              >
                <Pause size={12} /> Pause
              </button>
              <button
                onClick={handleSkip}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold btn-lift"
                style={{
                  background: 'linear-gradient(135deg, rgba(112, 161, 255, 0.2) 0%, rgba(100, 150, 255, 0.15) 100%)',
                  border: '1px solid rgba(112, 161, 255, 0.3)',
                  color: '#70a1ff'
                }}
              >
                <SkipForward size={12} /> Skip
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold btn-lift"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 41, 66, 0.3) 0%, rgba(200, 80, 80, 0.25) 100%)',
                  border: '1px solid rgba(200, 80, 80, 0.4)',
                  color: '#c85050'
                }}
              >
                <Ghost size={12} /> Done
              </button>
            </>
          )}

          {isPaused && (
            <>
              <button
                onClick={handleStart}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold btn-lift"
                style={{
                  background: 'linear-gradient(135deg, rgba(123, 237, 159, 0.2) 0%, rgba(46, 213, 115, 0.15) 100%)',
                  border: '1px solid rgba(123, 237, 159, 0.3)',
                  color: '#7bed9f'
                }}
              >
                <Play size={12} fill="currentColor" /> Resume
              </button>
              <button
                onClick={handleSkip}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold btn-lift"
                style={{
                  background: 'linear-gradient(135deg, rgba(112, 161, 255, 0.2) 0%, rgba(100, 150, 255, 0.15) 100%)',
                  border: '1px solid rgba(112, 161, 255, 0.3)',
                  color: '#70a1ff'
                }}
              >
                <SkipForward size={12} /> Skip
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold btn-lift"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 41, 66, 0.3) 0%, rgba(200, 80, 80, 0.25) 100%)',
                  border: '1px solid rgba(200, 80, 80, 0.4)',
                  color: '#c85050'
                }}
              >
                <Ghost size={12} /> Done
              </button>
            </>
          )}

          {isCompleted && (
            <div className="flex-1 text-center text-xs py-2 rounded-lg" style={{ background: 'rgba(123, 237, 159, 0.1)', color: '#7bed9f' }}>
              👻 Resting in peace
            </div>
          )}

          {isSkipped && (
            <div className="flex-1 text-center text-xs py-2 rounded-lg" style={{ background: 'rgba(112, 161, 255, 0.1)', color: '#70a1ff' }}>
              ⏭️ Skipped for today
            </div>
          )}
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
          
          {!showQuickAddSubtask && !isCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowAddSubtaskOption(!showAddSubtaskOption)
              }}
              className="w-full flex items-center justify-center gap-1 py-2 rounded-lg btn-lift text-xs"
              style={{
                background: `${color}10`,
                border: `1px dashed ${color}30`,
                color: `${color}aa`,
              }}
            >
              <Plus className="w-3 h-3" />
              {showAddSubtaskOption ? 'Cancel' : 'Add subtask'}
            </button>
          )}

          {showAddSubtaskOption && !showQuickAddSubtask && !isCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowQuickAddSubtask(true)
                setShowAddSubtaskOption(false)
              }}
              className="w-full flex items-center justify-center gap-1 py-2 rounded-lg btn-lift text-xs"
              style={{
                background: `${color}20`,
                border: `1px solid ${color}40`,
                color: '#f5e6d3',
              }}
            >
              <Plus className="w-3 h-3" />
              Quick add subtask
            </button>
          )}

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

      {/* Add Subtask Button (when no subtasks exist) */}
      {!hasSubtasks && !isCompleted && !showSubtasks && (
        <div className="mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowSubtasks(true)
              setShowQuickAddSubtask(true)
            }}
            className="w-full flex items-center justify-center gap-1 py-2 rounded-lg btn-lift text-xs"
            style={{
              background: `${color}10`,
              border: `1px dashed ${color}30`,
              color: `${color}aa`,
            }}
          >
            <Plus className="w-3 h-3" />
            Add subtask
          </button>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showPauseConfirm}
        onConfirm={handleConfirmPause}
        onCancel={() => setShowPauseConfirm(false)}
        title="⏸️ Put to Sleep?"
        message={`Suspend "${task.title}"? Time worked will be preserved in stasis~`}
        confirmText="Yes, Sleep"
        cancelText="Keep Haunting"
      />

      <ConfirmationModal
        isOpen={showCompleteConfirm}
        onConfirm={handleConfirmComplete}
        onCancel={() => setShowCompleteConfirm(false)}
        title="👻 Rest in Peace?"
        message={`Lay "${task.title}"${task.parent_task_id ? ' to rest? Time worked will join the parent spirit' : ' to rest in the afterlife of completed tasks'}?`}
        confirmText="Yes, Rest"
        cancelText="Not Yet"
      />

      <ConfirmationModal
        isOpen={showSkipConfirm}
        onConfirm={handleConfirmSkip}
        onCancel={() => setShowSkipConfirm(false)}
        title="⏭️ Skip Task?"
        message={`Skip "${task.title}" for today? You can come back to it later~`}
        confirmText="Yes, Skip"
        cancelText="Keep It"
      />

      <WarningModal
        isOpen={showIncompleteWarning}
        onClose={() => setShowIncompleteWarning(false)}
        title="⚠️ Unfinished Business"
        message={`Complete all restless spirits before laying this task to rest~`}
        items={incompleteSubtasks.map(t => t.title)}
      />
    </div>
  )
})

// Subtask Item Component
const SubtaskItem = memo(({ subtask, color, onTaskClick, setTasks }) => {
  const { startTask, pauseTask, completeTask, loading } = useTaskActions(setTasks)
  const isCompleted = subtask.status === 'completed'
  const isPending = subtask.status === 'pending'
  const isInProgress = subtask.status === 'in_progress'
  const isPaused = subtask.status === 'paused'

  const subtaskTime = useMemo(() => {
    if (!isCompleted) return null
    const minutes = subtask.actual_time_minutes > 0
      ? subtask.actual_time_minutes
      : (subtask.started_at && subtask.completed_at
        ? Math.floor((new Date(subtask.completed_at) - new Date(subtask.started_at)) / 60000)
        : null)
    if (!minutes || minutes <= 0) return null
    return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  }, [isCompleted, subtask.actual_time_minutes, subtask.started_at, subtask.completed_at])

  const handleStart = async (e) => {
    e.stopPropagation()
    await startTask(subtask.id)
  }

  const handlePause = async (e) => {
    e.stopPropagation()
    await pauseTask(subtask.id, subtask.started_at, subtask.actual_time_minutes)
  }

  const handleComplete = async (e) => {
    e.stopPropagation()
    await completeTask(subtask.id, subtask.started_at, subtask.actual_time_minutes)
  }

  return (
    <div
      className="subtask-item rounded-xl px-3 py-2.5 cursor-pointer backdrop-blur-sm"
      style={{
        background: 'rgba(30, 12, 15, 0.5)',
        border: '1px solid rgba(200, 80, 80, 0.1)',
        borderLeft: `2px solid ${color}80`,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        opacity: isCompleted ? 0.6 : 1
      }}
      onClick={(e) => onTaskClick(e, subtask)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isInProgress && (
            <div 
              className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
              style={{ background: '#c85050', animation: 'pulse 2s ease-in-out infinite' }}
            />
          )}
          <span 
            className={`text-sm truncate ${isCompleted ? 'line-through opacity-60' : ''}`}
            style={{ color: '#f5e6d3' }}
          >
            {subtask.title}
          </span>
          {isCompleted && subtaskTime && (
            <span className="text-xs flex-shrink-0" style={{ color: '#d4a574' }}>
              ⏱️ {subtaskTime}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          {isPending && (
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-6 h-6 rounded-full flex items-center justify-center btn-lift"
              style={{
                background: 'rgba(123, 237, 159, 0.2)',
                border: '1px solid rgba(123, 237, 159, 0.3)',
                color: '#7bed9f'
              }}
            >
              <Play size={10} fill="currentColor" />
            </button>
          )}
          {isInProgress && (
            <button
              onClick={handlePause}
              disabled={loading}
              className="w-6 h-6 rounded-full flex items-center justify-center btn-lift"
              style={{
                background: 'rgba(255, 165, 2, 0.2)',
                border: '1px solid rgba(255, 165, 2, 0.3)',
                color: '#ffa502'
              }}
            >
              <Pause size={10} />
            </button>
          )}
          {isPaused && (
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-6 h-6 rounded-full flex items-center justify-center btn-lift"
              style={{
                background: 'rgba(123, 237, 159, 0.2)',
                border: '1px solid rgba(123, 237, 159, 0.3)',
                color: '#7bed9f'
              }}
            >
              <Play size={10} fill="currentColor" />
            </button>
          )}
          {(isPending || isPaused || isInProgress) && (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-6 h-6 rounded-full flex items-center justify-center btn-lift"
              style={{
                background: 'rgba(200, 80, 80, 0.2)',
                border: '1px solid rgba(200, 80, 80, 0.3)',
                color: '#c85050'
              }}
            >
              <Ghost size={10} />
            </button>
          )}
          {isCompleted && (
            <span className="text-xs" style={{ color: '#7bed9f' }}>👻</span>
          )}
        </div>
      </div>
    </div>
  )
})

TaskItem.displayName = 'TaskItem'
SubtaskItem.displayName = 'SubtaskItem'

export default TaskItem
