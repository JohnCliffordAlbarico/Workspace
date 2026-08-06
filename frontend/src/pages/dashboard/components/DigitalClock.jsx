import { useState, useEffect, memo } from 'react'
import { Clock } from 'lucide-react'

const DigitalClock = memo(() => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTimeUntilMidnight = () => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const diff = midnight - now

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m till reset`
    }
    return `${minutes}m till reset`
  }

  return (
    <div 
      className="flex flex-col items-end"
      style={{
        fontFamily: "'Cinzel', serif"
      }}
    >
      <div className="flex items-center gap-1.5">
        <Clock size={14} style={{ color: '#c85050' }} />
        <div 
          className="text-lg font-semibold tabular-nums"
          style={{
            color: '#f5e6d3',
            letterSpacing: '0.02em'
          }}
        >
          {formatTime(time)}
        </div>
      </div>
      <div 
        className="text-xs"
        style={{ 
          color: '#a89080'
        }}
      >
        {formatDate(time)}
      </div>
      <div 
        className="text-xs mt-0.5 tabular-nums"
        style={{ 
          color: '#d4a574'
        }}
      >
        ⏱ {getTimeUntilMidnight()}
      </div>
    </div>
  )
})

export default memo(DigitalClock)
