import { useState, useEffect, useCallback, useMemo } from 'react'
import api from '../config/api'

export const useAllocationProgress = (categories) => {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)

  const fetchStats = useCallback(async () => {
    if (!categories?.length) {
      setStats({})
      return
    }

    try {
      setLoading(true)
      const response = await api.get('/categories/stats')
      setStats(response.data)
    } catch (err) {
      console.error('Failed to fetch allocation stats:', err)
    } finally {
      setLoading(false)
    }
  }, [categories])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Auto-refresh when day rolls over — resilient against background tabs
  useEffect(() => {
    // Track the "day key" we last fetched for (cheap string comparison, no API call unless day changed)
    let lastDayKey = new Date().toDateString()

    const checkDayChange = () => {
      const currentDayKey = new Date().toDateString()
      if (currentDayKey !== lastDayKey) {
        lastDayKey = currentDayKey
        fetchStats()
      }
    }

    // Poll every 30 seconds — lightweight local comparison, only calls API on day change
    const intervalId = setInterval(checkDayChange, 30_000)

    // Refresh when user returns to the tab (catches missed midnight)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkDayChange()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Bonus: precise midnight timeout for instant refresh
    const scheduleMidnight = () => {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      return setTimeout(() => {
        checkDayChange()
        midnightTimer = scheduleMidnight()
      }, midnight - now + 1000)
    }
    let midnightTimer = scheduleMidnight()

    return () => {
      clearInterval(intervalId)
      clearTimeout(midnightTimer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [fetchStats])

  const getCategoryProgress = useCallback((categoryId) => {
    return stats[categoryId] || {
      daily_allocation: 0,
      actual_minutes: 0,
      lifetime_actual_minutes: 0,
      percentage: 0
    }
  }, [stats])

  const totalAllocated = useMemo(() =>
    categories?.reduce((sum, cat) => sum + (cat.daily_allocation_minutes || 0), 0) || 0,
    [categories]
  )

  const totalActual = useMemo(() =>
    Object.values(stats).reduce((sum, s) => sum + (s.actual_minutes || 0), 0),
    [stats]
  )

  const totalPercentage = useMemo(() =>
    totalAllocated > 0 ? Math.min(100, Math.round((totalActual / totalAllocated) * 100)) : 0,
    [totalAllocated, totalActual]
  )

  return {
    stats,
    loading,
    getCategoryProgress,
    totalAllocated,
    totalActual,
    totalPercentage,
    refreshStats: fetchStats
  }
}
