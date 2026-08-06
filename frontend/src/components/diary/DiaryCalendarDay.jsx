import { format } from 'date-fns'

const DiaryCalendarDay = ({
  date,
  isCurrentMonth,
  isToday,
  hasEntries,
  entriesCount,
  onClick
}) => {
  const dayNumber = format(date, 'd')

  return (
    <div
      onClick={onClick}
      className="min-h-[90px] p-2 transition-all duration-300"
      style={{
        background: isToday
          ? 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)'
          : hasEntries
          ? 'rgba(45, 20, 25, 0.8)'
          : 'rgba(45, 20, 25, 0.6)',
        opacity: isCurrentMonth ? 1 : 0.4,
        cursor: hasEntries ? 'pointer' : 'default',
        border: isToday ? '2px solid #c85050' : 'none',
        boxShadow: isToday ? '0 0 25px rgba(200, 80, 80, 0.5)' : 'none',
        animation: isToday ? 'pulseGlow 3s ease-in-out infinite' : 'none'
      }}
      onMouseOver={(e) => {
        if (hasEntries) {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(200, 80, 80, 0.5)'
          e.currentTarget.style.zIndex = '10'
        }
      }}
      onMouseOut={(e) => {
        if (hasEntries) {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = isToday ? '0 0 25px rgba(200, 80, 80, 0.5)' : 'none'
          e.currentTarget.style.zIndex = '1'
        }
      }}
    >
      {/* Day Number */}
      <div
        className="text-lg font-bold mb-1"
        style={{
          fontFamily: "'Cinzel', serif",
          color: isToday ? '#fff' : '#f5e6d3'
        }}
      >
        {dayNumber}
      </div>

      {/* Entry Indicators */}
      {hasEntries && (
        <div
          className="flex items-center gap-1"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <span style={{ fontSize: '12px' }}>📖</span>
          <span
            className="text-xs font-semibold"
            style={{ color: '#d4a574' }}
          >
            {entriesCount}
          </span>
        </div>
      )}

      {/* Today Badge */}
      {isToday && (
        <div
          className="mt-1 text-xs font-bold"
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

export default DiaryCalendarDay
