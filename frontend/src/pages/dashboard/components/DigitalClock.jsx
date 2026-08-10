import { useState, useEffect, memo } from 'react'
import { Clock } from 'lucide-react'

const DigitalClock = memo(() => {
  const [time, setTime] = useState(new Date())
  const [prevSeconds, setPrevSeconds] = useState(null)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setTime(now)
      setPulse(true)
      setTimeout(() => setPulse(false), 300)
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
      return { text: `${hours}h ${minutes}m left`, hours, minutes }
    }
    return { text: `${minutes}m left`, hours: 0, minutes }
  }

  const getCountdownProgress = () => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const totalDay = midnight - startOfDay
    const remaining = midnight - now
    return ((totalDay - remaining) / totalDay) * 100
  }

  const countdown = getTimeUntilMidnight()
  const progress = getCountdownProgress()
  const seconds = time.getSeconds()

  return (
    <div
      className="relative group cursor-default"
      style={{ fontFamily: "'Cinzel', serif" }}
    >
      {/* Animated gradient border */}
      <div
        className="absolute -inset-[1px] rounded-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, #c85050, #d4a574, #c85050, #8b3a3a)',
          backgroundSize: '300% 300%',
          animation: 'shimmer 4s ease-in-out infinite',
          borderRadius: '12px'
        }}
      />

      {/* Glass card body */}
      <div
        className="relative rounded-xl px-4 py-3 group-hover:shadow-[0_0_20px_rgba(200,80,80,0.3)] transition-shadow duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(45, 15, 15, 0.85), rgba(60, 20, 20, 0.75))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(200, 80, 80, 0.15)',
          minWidth: '200px'
        }}
      >
        {/* Top row: clock icon + time */}
        <div className="flex items-center gap-2">
          <Clock
            size={13}
            style={{ color: '#c85050', opacity: 0.8 }}
          />
          <div
            className="text-base font-semibold tabular-nums tracking-wide"
            style={{ color: '#f5e6d3' }}
          >
            {formatTime(time)}
          </div>
        </div>

        {/* Divider */}
        <div
          className="my-2"
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(200, 80, 80, 0.4), rgba(212, 165, 116, 0.3), transparent)'
          }}
        />

        {/* Bottom row: date + countdown */}
        <div className="flex items-center justify-between gap-3">
          <span
            className="text-[10px]"
            style={{ color: '#a89080' }}
          >
            {formatDate(time)}
          </span>
          <span
            className="text-[10px] tabular-nums font-medium"
            style={{ color: '#d4a574' }}
          >
            ⏱ {countdown.text}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="mt-2 rounded-full overflow-hidden"
          style={{
            height: '3px',
            background: 'rgba(200, 80, 80, 0.15)'
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #c85050, #d4a574)',
              boxShadow: '0 0 6px rgba(200, 80, 80, 0.5)'
            }}
          />
        </div>

        {/* Diary reminder - shows when 2 hours or less until midnight */}
        {countdown.hours <= 2 && (
          <div
            className="mt-2 text-center animate-pulse"
            style={{
              fontSize: '9px',
              color: '#d4a574',
              letterSpacing: '0.5px'
            }}
          >
            ✍️ Write your diary entry now!
          </div>
        )}
      </div>

      {/* Keyframes injected once */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
})

export default memo(DigitalClock)
