import { useState, useEffect, useCallback } from 'react'
import api from '../config/api'

export const useBreakTime = (refresh = 0) => {
  const [breakTimes, setBreakTimes] = useState([])
  const [availableMinutes, setAvailableMinutes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBreakTimes = useCallback(async () => {
    try {
      setLoading(true)
      
      const [breaksRes, availableRes] = await Promise.all([
        api.get('/breaktime'),
        api.get('/breaktime/available')
      ])

      setBreakTimes(breaksRes.data)
      setAvailableMinutes(availableRes.data.total_minutes)
      setError(null)
    } catch (err) {
      console.error('Error fetching break times:', err)
      setError(err.response?.data?.error || 'Failed to fetch break times')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBreakTimes()
  }, [fetchBreakTimes, refresh])

  const activateBreak = async (minutesToUse) => {
    try {
      const response = await api.post('/breaktime/activate', { minutes_to_use: minutesToUse })
      
      await fetchBreakTimes()
      return response.data
    } catch (err) {
      console.error('Error activating break:', err)
      throw err
    }
  }

  return {
    breakTimes,
    availableMinutes,
    loading,
    error,
    activateBreak,
    refresh: fetchBreakTimes
  }
}
