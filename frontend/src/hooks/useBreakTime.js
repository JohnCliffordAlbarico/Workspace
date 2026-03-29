import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useBreakTime = (refresh = 0) => {
  const [breakTimes, setBreakTimes] = useState([])
  const [availableMinutes, setAvailableMinutes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBreakTimes = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const [breaksRes, availableRes] = await Promise.all([
        axios.get(`${API_URL}/api/breaktime`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/breaktime/available`, {
          headers: { Authorization: `Bearer ${token}` }
        })
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
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/api/breaktime/activate`,
        { minutes_to_use: minutesToUse },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
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
