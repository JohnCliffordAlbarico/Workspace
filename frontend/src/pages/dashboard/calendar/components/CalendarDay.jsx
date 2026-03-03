import { format } from 'date-fns'

const CalendarDay = ({ 
  date, 
  isCurrentMonth, 
  isToday, 
  hasTasks, 
  tasksCount,
  onClick 
}) => {
  const dayNumber = format(date, 'd')

  return (
    <div
      onClick={onClick}
      className="min-h-[100px] p-3 transition-all duration-300"
      style={{
        background: isToday
          ? 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)'
          : hasTasks
          ? 'rgba(45, 20, 25, 0.8)'
          : 'rgba(45, 20, 25, 0.6)',
        opacity: isCurrentMonth ? 1 : 0.4,
        cursor: hasTasks ? 'pointer' : 'default',
        border: isToday ? '2px solid #c85050' : 'none',
        boxShadow: isToday ? '0 0 25px rgba(200, 80, 80, 0.5)' : 'none',
        animation: isToday ? 'pulseGlow 3s ease-in-out infinite' : 'none'
      }}
      onMouseOver={(e) => {
        if (hasTasks) {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(200, 80, 80, 0.5)'
          e.currentTarget.style.zIndex = '10'
        }
      }}
      onMouseOut={(e) => {
        if (hasTasks) {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = isToday ? '0 0 25px rgba(200, 80, 80, 0.5)' : 'none'
          e.currentTarget.style.zIndex = '1'
        }
      }}
    >
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 25px rgba(200, 80, 80, 0.5); }
          50% { box-shadow: 0 0 40px rgba(200, 80, 80, 0.8); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Day Number */}
      <div 
        className="text-lg font-bold mb-2"
        style={{
          fontFamily: "'Cinzel', serif",
          color: isToday ? '#fff' : '#f5e6d3'
        }}
      >
        {dayNumber}
      </div>

      {/* Task Indicators */}
      {hasTasks && (
        <div 
          className="space-y-1"
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          {tasksCount.completed.length > 0 && (
            <div 
              className="text-xs flex items-center gap-1 font-semibold"
              style={{ color: '#7bed9f' }}
            >
              <span>✓</span>
              <span>{tasksCount.completed.length}</span>
            </div>
          )}
          {tasksCount.due.length > 0 && (
            <div 
              className="text-xs flex items-center gap-1 font-semibold"
              style={{ color: '#ff4757' }}
            >
              <span>📅</span>
              <span>{tasksCount.due.length}</span>
            </div>
          )}
          {tasksCount.created.length > 0 && (
            <div 
              className="text-xs flex items-center gap-1 font-semibold"
              style={{ color: '#70a1ff' }}
            >
              <span>🎯</span>
              <span>{tasksCount.created.length}</span>
            </div>
          )}
        </div>
      )}

      {/* Today Badge */}
      {isToday && (
        <div 
          className="mt-2 text-xs font-bold"
          style={{ 
            color: '#fff',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
          }}
        >
          TODAY
        </div>
      )}
    </div>
  )
}

export default CalendarDay
