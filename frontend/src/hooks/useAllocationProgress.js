import { useState, useEffect, useCallback } from 'react'
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
      const statsPromises = categories.map(category =>
        api.get(`/categories/${category.id}/stats`)
      )
      
      const responses = await Promise.all(statsPromises)
      
      const statsMap = {}
      responses.forEach((response, index) => {
        statsMap[categories[index].id] = response.data.stats
      })
      
      setStats(statsMap)
    } catch (err) {
      console.error('Failed to fetch allocation stats:', err)
    } finally {
      setLoading(false)
    }
  }, [categories])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const getCategoryProgress = useCallback((categoryId) => {
    return stats[categoryId] || {
      daily_allocation: 0,
      actual_minutes: 0,
      percentage: 0
    }
  }, [stats])

  const totalAllocated = categories?.reduce((sum, cat) => sum + (cat.daily_allocation_minutes || 0), 0) || 0
  const totalActual = Object.values(stats).reduce((sum, s) => sum + (s.actual_minutes || 0), 0)
  const totalPercentage = totalAllocated > 0 ? Math.min(100, Math.round((totalActual / totalAllocated) * 100)) : 0

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
