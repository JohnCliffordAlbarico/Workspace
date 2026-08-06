import { useState, useEffect, useCallback } from 'react'
import api from '../config/api'

export const useFocusCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const createCategory = async (categoryData) => {
    try {
      setError(null)
      const response = await api.post('/categories', categoryData)
      setCategories(prev => [...prev, response.data])
      return response.data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create category')
      throw err
    }
  }

  const updateCategory = async (id, categoryData) => {
    try {
      setError(null)
      const response = await api.put(`/categories/${id}`, categoryData)
      setCategories(prev => prev.map(cat => cat.id === id ? response.data : cat))
      return response.data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update category')
      throw err
    }
  }

  const deleteCategory = async (id) => {
    try {
      setError(null)
      await api.delete(`/categories/${id}`)
      setCategories(prev => prev.filter(cat => cat.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete category')
      throw err
    }
  }

  const completeCategory = async (id) => {
    try {
      setError(null)
      const response = await api.patch(`/categories/${id}/complete`)
      setCategories(prev => prev.filter(cat => cat.id !== id))
      return response.data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete category')
      throw err
    }
  }

  const reopenCategory = async (id) => {
    try {
      setError(null)
      const response = await api.patch(`/categories/${id}/reopen`)
      setCategories(prev => [...prev, response.data])
      return response.data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reopen category')
      throw err
    }
  }

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    completeCategory,
    reopenCategory,
    refreshCategories: fetchCategories
  }
}
