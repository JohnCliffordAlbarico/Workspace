import { useState, useEffect, useCallback } from 'react'
import api from '../config/api'

export const useCompletedCategories = () => {
  const [completedCategories, setCompletedCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCompletedCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/categories/completed')
      setCompletedCategories(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch completed categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompletedCategories()
  }, [fetchCompletedCategories])

  const reopenCategory = async (id) => {
    try {
      setError(null)
      await api.patch(`/categories/${id}/reopen`)
      setCompletedCategories(prev => prev.filter(cat => cat.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reopen category')
      throw err
    }
  }

  return {
    completedCategories,
    loading,
    error,
    reopenCategory,
    refreshCompletedCategories: fetchCompletedCategories
  }
}
