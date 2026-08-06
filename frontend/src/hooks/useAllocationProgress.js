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

  // Auto-refresh when day rolls over (single timeout to midnight instead of polling)
  useEffect(() => {
    const scheduleMidnightRefresh = () => {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      const msUntilMidnight = midnight - now

      return setTimeout(() => {
        fetchStats()
        timerId = scheduleMidnightRefresh()
      }, msUntilMidnight + 1000)
    }

    let timerId = scheduleMidnightRefresh()
    return () => clearTimeout(timerId)
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
