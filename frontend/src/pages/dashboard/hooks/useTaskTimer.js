import { useState, useEffect } from 'react'

export const useTaskTimer = (startedAt, accumulatedMinutes = 0) => {
  const [duration, setDuration] = useState('')

  useEffect(() => {
    if (!startedAt) {
      setDuration('')
      return
    }

    const updateDuration = () => {
      const start = new Date(startedAt)
      const now = new Date()
      const diff = Math.floor((now - start) / 1000) // seconds
      const totalSeconds = diff + (accumulatedMinutes || 0) * 60

      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      if (hours > 0) {
        setDuration(`${hours}h ${minutes}m ${seconds}s`)
      } else if (minutes > 0) {
        setDuration(`${minutes}m ${seconds}s`)
      } else {
        setDuration(`${seconds}s`)
      }
    }

    updateDuration()
    const interval = setInterval(updateDuration, 1000)

    return () => clearInterval(interval)
  }, [startedAt, accumulatedMinutes])

  return duration
}
