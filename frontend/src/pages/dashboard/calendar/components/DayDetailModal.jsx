import { createPortal } from 'react-dom'
import { format } from 'date-fns'
import { useEffect } from 'react'

const DayDetailModal = ({ isOpen, onClose, date, tasks }) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen || !date) return null

  // Filter tasks for this specific date
  const dateStr = date.toISOString().split('T')[0]
  
  const allTasksForDate = tasks.filter(t => {
    // Check if task is related to this date in any way
    const completedMatch = t.completed_at && new Date(t.completed_at).toISOString().split('T')[0] === dateStr
    const dueMatch = t.due_date && new Date(t.due_date).toISOString().split('T')[0] === dateStr
    const createdMatch = t.created_at && new Date(t.created_at).toISOString().split('T')[0] === dateStr
    const startedMatch = t.started_at && new Date(t.started_at).toISOString().split('T')[0] === dateStr
    
    return completedMatch || dueMatch || createdMatch || startedMatch
  })

  // Group tasks by priority
  const tasksByPriority = {
    critical: allTasksForDate.filter(t => t.priority === 'critical'),
    high: allTasksForDate.filter(t => t.priority === 'high'),
    medium: allTasksForDate.filter(t => t.priority === 'medium'),
    low: allTasksForDate.filter(t => t.priority === 'low')
  }

  // Priority configuration
  const priorityConfig = {
    critical: { label: 'Critical Priority', emoji: '🔴', color: '#ff4757' },
    high: { label: 'High Priority', emoji: '🟠', color: '#ffa502' },
    medium: { label: 'Medium Priority', emoji: '🟢', color: '#7bed9f' },
    low: { label: 'Low Priority', emoji: '🔵', color: '#70a1ff' }
  }

  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#ff4757'
      case 'high': return '#ffa502'
      case 'medium': return '#7bed9f'
      case 'low': return '#70a1ff'
      default: return '#a89080'
    }
  }

  // Get task status badge
  const getTaskStatusBadge = (task) => {
    const badges = []
    
    if (task.completed_at && new Date(task.completed_at).toISOString().split('T')[0] === dateStr) {
      badges.push({ label: 'Completed', color: '#7bed9f', icon: '✓' })
    }
    if (task.due_date && new Date(task.due_date).toISOString().split('T')[0] === dateStr) {
      badges.push({ label: 'Due', color: '#ff4757', icon: '📅' })
    }
    if (task.started_at && new Date(task.started_at).toISOString().split('T')[0] === dateStr) {
      badges.push({ label: 'Started', color: '#ffa502', icon: '⏱️' })
    }
    if (task.created_at && new Date(task.created_at).toISOString().split('T')[0] === dateStr) {
      badges.push({ label: 'Created', color: '#70a1ff', icon: '🎯' })
    }
    
    return badges
  }

  // Format time duration
  const formatDuration = (minutes) => {
    if (!minutes) return 'No time set'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Calculate actual time spent
  const getActualTime = (task) => {
    if (!task.started_at || !task.completed_at) return null
    const start = new Date(task.started_at)
    const end = new Date(task.completed_at)
    const minutes = Math.floor((end - start) / 60000)
    return minutes
  }

  // Calculate summary stats
  const completedTasks = allTasksForDate.filter(t => t.status === 'completed')
  const totalCompleted = completedTasks.length
  const totalTime = completedTasks.reduce((sum, task) => {
    const actualTime = getActualTime(task)
    return sum + (actualTime || 0)
  }, 0)
  const onTimeCount = completedTasks.filter(task => {
    const actualTime = getActualTime(task)
    return actualTime && task.goal_time_minutes && actualTime <= task.goal_time_minutes
  }).length
  const overTimeCount = completedTasks.filter(task => {
    const actualTime = getActualTime(task)
    return actualTime && task.goal_time_minutes && actualTime > task.goal_time_minutes
  }).length

  const TaskCard = ({ task }) => {
    const statusBadges = getTaskStatusBadge(task)
    const isCompleted = task.status === 'completed'
    
    return (
      <div
        className="p-4 rounded-lg mb-3 transition-all duration-300"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: `1px solid ${getPriorityColor(task.priority)}40`
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
          e.currentTarget.style.transform = 'translateX(4px)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
          e.currentTarget.style.transform = 'translateX(0)'
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h4 
              className="font-semibold mb-2"
              style={{ color: '#f5e6d3' }}
            >
              {task.title}
            </h4>
            
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-2">
              {statusBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded font-semibold"
                  style={{
                    background: `${badge.color}20`,
                    border: `1px solid ${badge.color}40`,
                    color: badge.color
                  }}
                >
                  {badge.icon} {badge.label}
                </span>
              ))}
            </div>

            {task.description && (
              <p 
                className="text-sm mb-2"
                style={{ color: '#a89080' }}
              >
                {task.description}
              </p>
            )}
            
            {/* Time tracking for completed tasks */}
            {isCompleted && (
              <div className="flex gap-4 text-xs mt-2">
                {(() => {
                  const actualTime = getActualTime(task)
                  if (actualTime) {
                    return (
                      <>
                        <span style={{ color: '#ffa502' }}>
                          ⏱️ {formatDuration(actualTime)}
                        </span>
                        {task.goal_time_minutes && (
                          <span 
                            style={{ 
                              color: actualTime <= task.goal_time_minutes ? '#7bed9f' : '#ff4757' 
                            }}
                          >
                            {actualTime <= task.goal_time_minutes ? '✓' : '⚠️'} 
                            Goal: {formatDuration(task.goal_time_minutes)}
                          </span>
                        )}
                      </>
                    )
                  }
                  return null
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.95) 0%, rgba(26, 10, 10, 0.98) 100%)',
          border: '2px solid rgba(200, 80, 80, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-3xl font-bold"
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#f5e6d3',
              textShadow: '0 2px 10px rgba(200, 80, 80, 0.3)'
            }}
          >
            📅 {format(date, 'MMMM d, yyyy')}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl transition-all duration-200"
            style={{ color: '#c85050' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
          >
            ✕
          </button>
        </div>

        {/* Priority Sections */}
        {Object.entries(priorityConfig).map(([priority, config]) => {
          const priorityTasks = tasksByPriority[priority]
          if (priorityTasks.length === 0) return null

          return (
            <div key={priority} className="mb-6">
              <h3 
                className="text-xl font-bold mb-4 flex items-center gap-2"
                style={{ 
                  fontFamily: "'Cinzel', serif",
                  color: config.color
                }}
              >
                <span>{config.emoji}</span>
                <span>{config.label} ({priorityTasks.length})</span>
              </h3>
              {priorityTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )
        })}

        {/* Summary Section */}
        {totalCompleted > 0 && (
          <div 
            className="p-5 rounded-xl mt-6"
            style={{
              background: 'rgba(45, 20, 25, 0.6)',
              border: '1px solid rgba(200, 80, 80, 0.2)'
            }}
          >
            <h3 
              className="text-lg font-bold mb-3"
              style={{ 
                fontFamily: "'Cinzel', serif",
                color: '#d4a574' 
              }}
            >
              📊 Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span style={{ color: '#a89080' }}>Total time spent:</span>
                <div 
                  className="text-xl font-bold mt-1"
                  style={{ color: '#ffa502' }}
                >
                  {formatDuration(totalTime)}
                </div>
              </div>
              <div>
                <span style={{ color: '#a89080' }}>Tasks completed:</span>
                <div 
                  className="text-xl font-bold mt-1"
                  style={{ color: '#7bed9f' }}
                >
                  {totalCompleted}
                </div>
              </div>
              {(onTimeCount > 0 || overTimeCount > 0) && (
                <>
                  <div>
                    <span style={{ color: '#a89080' }}>On time:</span>
                    <div 
                      className="text-xl font-bold mt-1"
                      style={{ color: '#7bed9f' }}
                    >
                      {onTimeCount}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#a89080' }}>Over time:</span>
                    <div 
                      className="text-xl font-bold mt-1"
                      style={{ color: '#ff4757' }}
                    >
                      {overTimeCount}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {allTasksForDate.length === 0 && (
          <div 
            className="text-center py-12"
            style={{ color: '#a89080' }}
          >
            <div className="text-6xl mb-4">👻</div>
            <p className="text-lg">No tasks for this date</p>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-lg text-center transition-all duration-300"
          style={{
            background: 'rgba(200, 80, 80, 0.2)',
            border: '1px solid rgba(200, 80, 80, 0.3)',
            color: '#f5e6d3'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(200, 80, 80, 0.3)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(200, 80, 80, 0.2)'
          }}
        >
          Close (ESC)
        </button>
      </div>
    </div>,
    document.body
  )
}

export default DayDetailModal
