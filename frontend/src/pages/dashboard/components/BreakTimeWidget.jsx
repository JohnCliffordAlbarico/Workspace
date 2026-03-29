import { useState, useEffect } from 'react'
import { Coffee, Play, Clock, Timer } from 'lucide-react'
import { useBreakTime } from '../../../hooks/useBreakTime'

const BreakTimeWidget = () => {
  const { availableMinutes, loading, activateBreak, refresh } = useBreakTime()
  const [isActivating, setIsActivating] = useState(false)
  const [customMinutes, setCustomMinutes] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [activeBreakMinutes, setActiveBreakMinutes] = useState(null)
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0)

  // Timer for active break
  useEffect(() => {
    if (activeBreakMinutes === null) return

    setBreakTimeRemaining(activeBreakMinutes * 60) // Convert to seconds

    const interval = setInterval(() => {
      setBreakTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setActiveBreakMinutes(null)
          alert('Break time finished! Back to work 💪')
          refresh() // Refresh break time data
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activeBreakMinutes, refresh])

  const handleActivateBreak = async (minutes) => {
    if (minutes <= 0 || minutes > availableMinutes) return
    
    setIsActivating(true)
    try {
      await activateBreak(minutes)
      setShowCustomInput(false)
      setCustomMinutes('')
      setActiveBreakMinutes(minutes)
      await refresh() // Refresh to show updated minutes
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to activate break time')
    } finally {
      setIsActivating(false)
    }
  }

  const handleStopBreak = () => {
    setActiveBreakMinutes(null)
    setBreakTimeRemaining(0)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const quickBreakOptions = [5, 10, 15, 20]

  if (loading) return null

  // Active break view
  if (activeBreakMinutes !== null) {
    return (
      <div 
        className="mb-4 rounded-xl p-4 transition-all duration-300"
        style={{
          background: 'linear-gradient(145deg, rgba(20, 60, 35, 0.9) 0%, rgba(15, 45, 25, 0.95) 100%)',
          border: '2px solid rgba(80, 200, 120, 0.6)',
          boxShadow: '0 0 20px rgba(80, 200, 120, 0.3)',
          animation: 'pulse 2s ease-in-out infinite'
        }}
      >
        <style>{`
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 20px rgba(80, 200, 120, 0.3); }
            50% { box-shadow: 0 0 30px rgba(80, 200, 120, 0.5); }
          }
        `}</style>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Timer className="w-6 h-6" style={{ color: '#50c878' }} />
            <h3 
              className="text-base font-bold uppercase tracking-wide"
              style={{ fontFamily: "'Cinzel', serif", color: '#50c878' }}
            >
              Break Active
            </h3>
          </div>
          
          <div 
            className="text-4xl font-bold mb-3"
            style={{ color: '#50c878', fontFamily: "'Cinzel', serif" }}
          >
            {formatTime(breakTimeRemaining)}
          </div>
          
          <p className="text-xs mb-3" style={{ color: '#a89080' }}>
            Enjoy your break! 🎉
          </p>
          
          <button
            onClick={handleStopBreak}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              background: 'rgba(200, 80, 80, 0.3)',
              color: '#c85050',
              border: '1px solid rgba(200, 80, 80, 0.5)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(200, 80, 80, 0.5)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(200, 80, 80, 0.3)'
            }}
          >
            End Break Early
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="mb-4 rounded-xl p-3 transition-all duration-300"
      style={{
        background: 'linear-gradient(145deg, rgba(20, 45, 30, 0.7) 0%, rgba(15, 30, 20, 0.8) 100%)',
        border: '1px solid rgba(80, 200, 120, 0.4)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <Coffee className="w-5 h-5" style={{ color: '#50c878' }} />
        <h3 
          className="text-sm font-bold uppercase tracking-wide"
          style={{ fontFamily: "'Cinzel', serif", color: '#50c878' }}
        >
          Free Time
        </h3>
      </div>

      {/* Centered Minutes Display */}
      <div className="flex items-center justify-center gap-1 mb-3">
        <Clock className="w-4 h-4" style={{ color: '#50c878' }} />
        <span 
          className="text-xl font-bold"
          style={{ color: '#50c878', fontFamily: "'Cinzel', serif" }}
        >
          {availableMinutes}
        </span>
        <span className="text-xs" style={{ color: '#a89080' }}>min</span>
      </div>

      {/* Quick Break Buttons - Horizontal */}
      {availableMinutes > 0 && !showCustomInput && (
        <div className="flex gap-2">
          {quickBreakOptions.map(minutes => (
            minutes <= availableMinutes && (
              <button
                key={minutes}
                onClick={() => handleActivateBreak(minutes)}
                disabled={isActivating}
                className="flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #2d8659 0%, #50c878 100%)',
                  color: '#f5e6d3',
                  border: '1px solid rgba(80, 200, 120, 0.5)',
                  opacity: isActivating ? 0.5 : 1
                }}
                onMouseOver={(e) => {
                  if (!isActivating) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(80, 200, 120, 0.4)'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                <Play className="w-3 h-3 inline mr-1" />
                {minutes}m
              </button>
            )
          ))}
          
          <button
            onClick={() => setShowCustomInput(true)}
            className="px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
            style={{
              background: 'rgba(80, 200, 120, 0.1)',
              color: '#50c878',
              border: '1px solid rgba(80, 200, 120, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(80, 200, 120, 0.2)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(80, 200, 120, 0.1)'
            }}
          >
            +
          </button>
        </div>
      )}

      {/* Custom Minutes Input */}
      {showCustomInput && (
        <div className="flex gap-2">
          <input
            type="number"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            placeholder="Min"
            min="1"
            max={availableMinutes}
            className="flex-1 px-2 py-1.5 rounded-lg text-xs"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(80, 200, 120, 0.3)',
              color: '#f5e6d3'
            }}
          />
          <button
            onClick={() => handleActivateBreak(parseInt(customMinutes))}
            disabled={isActivating || !customMinutes || parseInt(customMinutes) > availableMinutes}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              background: 'linear-gradient(135deg, #2d8659 0%, #50c878 100%)',
              color: '#f5e6d3',
              border: '1px solid rgba(80, 200, 120, 0.5)',
              opacity: (isActivating || !customMinutes || parseInt(customMinutes) > availableMinutes) ? 0.5 : 1
            }}
          >
            Go
          </button>
          <button
            onClick={() => {
              setShowCustomInput(false)
              setCustomMinutes('')
            }}
            className="px-2 py-1.5 rounded-lg text-xs"
            style={{
              background: 'rgba(200, 80, 80, 0.2)',
              color: '#c85050',
              border: '1px solid rgba(200, 80, 80, 0.3)'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* No Break Time Available */}
      {availableMinutes === 0 && (
        <div 
          className="text-center text-xs"
          style={{
            color: '#a89080'
          }}
        >
          Complete tasks to earn break time! (25min = 5min break)
        </div>
      )}
    </div>
  )
}

export default BreakTimeWidget
