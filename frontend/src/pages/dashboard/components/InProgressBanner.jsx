import { useTaskActions } from '../hooks/useTaskActions'
import { useTaskTimer } from '../hooks/useTaskTimer'

const InProgressBanner = ({ task, setTasks, onTaskClick }) => {
  const { completeTask, cancelTask, loading } = useTaskActions(setTasks)
  const duration = useTaskTimer(task?.started_at)

  if (!task) return null

  const handleComplete = async () => {
    await completeTask(task.id)
  }

  const handleCancel = async () => {
    await cancelTask(task.id)
  }

  const handleClick = () => {
    onTaskClick(task)
  }

  // Calculate progress metrics
  const getProgressMetrics = () => {
    if (!task?.started_at) return null
    
    const start = new Date(task.started_at)
    const now = new Date()
    const elapsedMinutes = Math.floor((now - start) / 60000)
    
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
        background: 'linear-gradient(145deg, rgba(255, 99, 72, 0.15) 0%, rgba(255, 165, 2, 0.1) 100%)',
        border: '2px solid rgba(255, 165, 2, 0.4)',
        boxShadow: '0 4px 20px rgba(255, 165, 2, 0.2)'
      }}
      onClick={handleClick}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      <div className="space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div 
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, #ffa502 0%, #ff6348 100%)',
                color: '#1a0a0a',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            >
              🔄 In Progress
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
              {duration && (
                <p 
                  className="text-sm font-mono font-semibold"
                  style={{ color: '#ffa502' }}
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
                background: 'linear-gradient(135deg, #ffa502 0%, #ff6348 100%)',
                color: '#1a0a0a',
                border: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 165, 2, 0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              ✅ Complete
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
              style={{
                background: 'rgba(255, 71, 87, 0.2)',
                border: '1px solid rgba(255, 71, 87, 0.5)',
                color: '#ff4757'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 71, 87, 0.3)'
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
                  <span style={{ color: metrics.isOvertime ? '#ff4757' : '#ffa502' }}>
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
                        : 'linear-gradient(90deg, #ffa502 0%, #ff6348 100%)'
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
                  style={{ color: '#ffa502' }}
                >
                  {duration}
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
                      style={{ color: metrics.isOvertime ? '#ff4757' : '#ffa502' }}
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
    </div>
  )
}

export default InProgressBanner
