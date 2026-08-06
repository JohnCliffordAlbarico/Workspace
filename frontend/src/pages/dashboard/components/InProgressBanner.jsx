import { useState } from 'react'
import { useTaskActions } from '../hooks/useTaskActions'
import { useTaskTimer } from '../hooks/useTaskTimer'
import ConfirmationModal from '../modal/ConfirmationModal'
import WarningModal from '../modal/WarningModal'

const InProgressBanner = ({ task, setTasks, onTaskClick, allTasks, refreshStats }) => {
  const { completeTask, pauseTask, cancelTask, startTask, loading } = useTaskActions(setTasks)
  const duration = useTaskTimer(task?.started_at, task?.actual_time_minutes)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showPauseConfirm, setShowPauseConfirm] = useState(false)
  const [showResumeConfirm, setShowResumeConfirm] = useState(false)
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false)
  const [incompleteSubtasks, setIncompleteSubtasks] = useState([])

  if (!task) return null

  const isPaused = task.status === 'paused'
  const parentTask = task.parent_task_id ? allTasks?.find(t => t.id === task.parent_task_id) : null

  const handleComplete = () => {
    if (!task.parent_task_id && allTasks) {
      const subtasks = allTasks.filter(t => t.parent_task_id === task.id)
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

  const handlePause = () => {
    setShowPauseConfirm(true)
  }

  const handleConfirmPause = async () => {
    await pauseTask(task.id, task.started_at, task.actual_time_minutes)
    setShowPauseConfirm(false)
  }

  const handleResume = () => {
    setShowResumeConfirm(true)
  }

  const handleConfirmResume = async () => {
    await startTask(task.id)
    setShowResumeConfirm(false)
  }

  const handleCancel = () => {
    setShowCancelConfirm(true)
  }

  const handleConfirmCancel = async () => {
    await cancelTask(task.id)
    setShowCancelConfirm(false)
  }

  const handleClick = () => {
    onTaskClick(task)
  }

  // Format minutes into Xm or Xh Ym
  const formatMinutes = (mins) => {
    if (mins < 60) return `${mins}m`
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  // Calculate progress metrics
  const getProgressMetrics = () => {
    let elapsedMinutes = 0

    if (isPaused) {
      // For paused tasks, use accumulated actual_time_minutes
      elapsedMinutes = task.actual_time_minutes || 0
    } else {
      // For in_progress tasks, calculate live from started_at
      if (!task?.started_at) return null
      const start = new Date(task.started_at)
      const now = new Date()
      elapsedMinutes = Math.floor((now - start) / 60000)
    }

    if (!task.goal_time_minutes) {
      return {
        elapsed: elapsedMinutes,
        hasGoal: false
      }
    }

    const percentage = Math.min(100, (elapsedMinutes / task.goal_time_minutes) * 100)
    const remaining = task.goal_time_minutes - elapsedMinutes

    return {
      elapsed: elapsedMinutes,
      goal: task.goal_time_minutes,
      percentage: percentage.toFixed(0),
      remaining: remaining,
      isOvertime: remaining < 0,
      hasGoal: true
    }
  }
  
  const metrics = getProgressMetrics()

  return (
    <div 
      className="mb-6 rounded-2xl p-6 cursor-pointer transition-all duration-300"
      style={{
        background: 'linear-gradient(145deg, rgba(139, 41, 66, 0.2) 0%, rgba(200, 80, 80, 0.15) 100%)',
        border: '2px solid rgba(200, 80, 80, 0.4)',
        boxShadow: '0 4px 20px rgba(200, 80, 80, 0.2)'
      }}
      onClick={handleClick}
    >


      <div className="space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div 
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: isPaused
                  ? 'linear-gradient(135deg, #7bed9f 0%, #2ed573 100%)'
                  : 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
                color: '#f5e6d3',
                animation: isPaused ? 'none' : 'pulse 2s ease-in-out infinite'
              }}
            >
              {isPaused ? '⏸️ Paused' : '👻 Haunting...'}
            </div>

            <div className="flex-1">
              <h3 
                className="text-lg font-semibold mb-1"
                style={{ 
                  fontFamily: "'Cinzel', serif", 
                  color: '#f5e6d3' 
                }}
              >
                {task.title}
              </h3>
              {parentTask && (
                <p 
                  className="text-sm mb-1"
                  style={{ color: '#a89080' }}
                >
                  Subtask of {parentTask.title}
                </p>
              )}
              {isPaused ? (
                <p 
                  className="text-sm font-mono font-semibold"
                  style={{ color: '#7bed9f' }}
                >
                  ⏸️ {formatMinutes(task.actual_time_minutes || 0)} worked
                </p>
              ) : duration && (
                <p 
                  className="text-sm font-mono font-semibold"
                  style={{ color: '#d4a574' }}
                >
                  ⏱️ {duration}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
                color: '#f5e6d3',
                border: '1px solid rgba(200, 80, 80, 0.5)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(200, 80, 80, 0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              👻 Complete
            </button>
            {isPaused ? (
              <button
                onClick={handleResume}
                disabled={loading}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #7bed9f 0%, #2ed573 100%)',
                  color: '#1a0a0a',
                  border: 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(46, 213, 115, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                ▶️ Resume
              </button>
            ) : (
              <button
                onClick={handlePause}
                disabled={loading}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #7bed9f 0%, #2ed573 100%)',
                  color: '#1a0a0a',
                  border: 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(46, 213, 115, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                ⏸️ Pause
              </button>
            )}
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
              style={{
                background: 'rgba(200, 80, 80, 0.2)',
                border: '1px solid rgba(200, 80, 80, 0.5)',
                color: '#c85050'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(200, 80, 80, 0.3)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              ❌ Cancel
            </button>
          </div>
        </div>

        {/* Detailed Progress Section */}
        {metrics && (
          <div className="space-y-3">
            {/* Progress Bar (if goal time exists) */}
            {metrics.hasGoal && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: '#f5e6d3' }}>
                    Progress: {metrics.percentage}%
                  </span>
                  <span style={{ color: metrics.isOvertime ? '#ff4757' : '#d4a574' }}>
                    {metrics.isOvertime 
                      ? `⚠️ ${Math.abs(metrics.remaining)} min overtime`
                      : `✓ ${metrics.remaining} min remaining`
                    }
                  </span>
                </div>
                <div 
                  className="w-full h-3 rounded-full overflow-hidden"
                  style={{ background: 'rgba(0,0,0,0.3)' }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, metrics.percentage)}%`,
                      background: metrics.isOvertime
                        ? 'linear-gradient(90deg, #ff4757 0%, #ff6348 100%)'
                        : 'linear-gradient(90deg, #8b2942 0%, #c85050 50%, #d4a574 100%)'
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Time Details Grid */}
            <div className={`grid ${metrics.hasGoal ? 'grid-cols-3' : 'grid-cols-1'} gap-3 text-sm`}>
              <div 
                className="p-3 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.3)' }}
              >
                <div style={{ color: '#a89080', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  ELAPSED
                </div>
                <div 
                  className="font-mono font-bold"
                  style={{ color: '#d4a574' }}
                >
                  {isPaused ? formatMinutes(metrics.elapsed) : duration}
                </div>
              </div>
              
              {metrics.hasGoal && (
                <>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ background: 'rgba(0,0,0,0.3)' }}
                  >
                    <div style={{ color: '#a89080', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      GOAL TIME
                    </div>
                    <div 
                      className="font-mono font-bold"
                      style={{ color: '#f5e6d3' }}
                    >
                      {Math.floor(metrics.goal / 60)}h {metrics.goal % 60}m
                    </div>
                  </div>
                  
                  <div 
                    className="p-3 rounded-lg"
                    style={{ background: 'rgba(0,0,0,0.3)' }}
                  >
                    <div style={{ color: '#a89080', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      {metrics.isOvertime ? 'OVERTIME' : 'REMAINING'}
                    </div>
                    <div 
                      className="font-mono font-bold"
                      style={{ color: metrics.isOvertime ? '#ff4757' : '#d4a574' }}
                    >
                      {Math.floor(Math.abs(metrics.remaining) / 60)}h {Math.abs(metrics.remaining) % 60}m
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelConfirm(false)}
        title="❌ Send to the Void?"
        message={`Banish "${task?.title}"${parentTask ? ` (subtask of "${parentTask.title}")` : ''} to the spirit realm? Time worked will vanish like smoke~`}
        confirmText="Yes, Banish"
        cancelText="Not Yet"
      />

      {/* Complete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCompleteConfirm}
        onConfirm={handleConfirmComplete}
        onCancel={() => setShowCompleteConfirm(false)}
        title="👻 Rest in Peace?"
        message={`Lay "${task?.title}"${parentTask ? ` to rest? Time worked will join "${parentTask.title}"` : ' to rest?'} in the afterlife of completed tasks~`}
        confirmText="Yes, Rest"
        cancelText="Not Yet"
      />

      {/* Pause Confirmation Modal */}
      <ConfirmationModal
        isOpen={showPauseConfirm}
        onConfirm={handleConfirmPause}
        onCancel={() => setShowPauseConfirm(false)}
        title="⏸️ Put to Sleep?"
        message={`Suspend "${task?.title}"${parentTask ? ` (subtask of "${parentTask.title}")` : ''}? Time worked so far will be preserved in stasis~`}
        confirmText="Yes, Sleep"
        cancelText="Keep Haunting"
      />

      {/* Resume Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResumeConfirm}
        onConfirm={handleConfirmResume}
        onCancel={() => setShowResumeConfirm(false)}
        title="▶️ Awaken?"
        message={`Resurrect "${task?.title}"${parentTask ? ` (subtask of "${parentTask.title}")` : ''}? The spirit will return from where it left off. ${formatMinutes(task.actual_time_minutes || 0)} already consumed.`}
        confirmText="Yes, Awaken"
        cancelText="Let It Sleep"
      />

      {/* Incomplete Subtasks Warning Modal */}
      <WarningModal
        isOpen={showIncompleteWarning}
        onClose={() => setShowIncompleteWarning(false)}
        title="⚠️ Unfinished Business"
        message={`Complete all restless spirits before laying "${task?.title}" to rest~`}
        items={incompleteSubtasks.map(t => t.title)}
      />
    </div>
  )
}

export default InProgressBanner
