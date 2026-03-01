import { useState, useEffect } from 'react'

export const useTaskTimer = (startedAt) => {
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

      const hours = Math.floor(diff / 3600)
      const minutes = Math.floor((diff % 3600) / 60)
      const seconds = diff % 60

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
  }, [startedAt])

  return duration
}
