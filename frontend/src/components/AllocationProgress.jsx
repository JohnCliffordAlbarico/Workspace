import { memo } from 'react'

const AllocationProgress = memo(({ actualMinutes, dailyAllocation, compact = false }) => {
  const percentage = dailyAllocation > 0 
    ? Math.min(100, Math.round((actualMinutes / dailyAllocation) * 100))
    : 0

  const getProgressColor = () => {
    if (percentage >= 100) return '#ef4444' // Red - overtime
    if (percentage >= 80) return '#f97316' // Orange - almost there
    if (percentage >= 50) return '#eab308' // Yellow - progressing
    return '#22c55e' // Green - on track
  }

  if (compact) {
    return (
      <div className="w-full">
        <div 
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              background: getProgressColor()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs" style={{ color: '#a89080' }}>
          ⏱ {actualMinutes}/{dailyAllocation} min
        </span>
        <span className="text-xs font-semibold" style={{ color: getProgressColor() }}>
          {percentage}%
        </span>
      </div>
      <div 
        className="h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.3)' }}
      >
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: getProgressColor()
          }}
        />
      </div>
    </div>
  )
})

export default memo(AllocationProgress)
