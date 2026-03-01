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

  return (
    <div 
      className="mb-6 rounded-2xl p-6 cursor-pointer transition-all duration-300"
      style={{
        background: 'linear-gradient(145deg, rgba(46, 213, 115, 0.15) 0%, rgba(126, 237, 159, 0.1) 100%)',
        border: '2px solid rgba(126, 237, 159, 0.4)',
        boxShadow: '0 4px 20px rgba(126, 237, 159, 0.2)'
      }}
      onClick={handleClick}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div 
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, #7bed9f 0%, #2ed573 100%)',
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
                style={{ color: '#7bed9f' }}
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
              background: 'linear-gradient(135deg, #7bed9f 0%, #2ed573 100%)',
              color: '#1a0a0a',
              border: 'none'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(126, 237, 159, 0.4)'
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
    </div>
  )
}

export default InProgressBanner
