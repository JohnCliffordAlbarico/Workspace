import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

const DigitalClock = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    // Cleanup interval on unmount
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

  return (
    <div 
      className="flex flex-col items-end"
      style={{
        fontFamily: "'Inter', sans-serif"
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
    </div>
  )
}

export default DigitalClock
