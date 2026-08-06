import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertTriangle } from 'lucide-react'
import api from '../config/api'

const CompleteCategoryModal = ({ isOpen, onClose, category, onComplete }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && category) {
      fetchStats()
    }
  }, [isOpen, category])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/categories/${category.id}/stats`)
      setStats(response.data)
    } catch (err) {
      setError('Failed to load category stats')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    try {
      setCompleting(true)
      setError(null)
      await api.patch(`/categories/${category.id}/complete`)
      onComplete(category.id)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete category')
    } finally {
      setCompleting(false)
    }
  }

  if (!isOpen || !category) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #2d1418 0%, #1a0d0d 100%)',
          border: '1px solid rgba(200, 80, 80, 0.3)'
        }}
      >
        {/* Header */}
        <div 
          className="p-6 text-center"
          style={{ borderBottom: '1px solid rgba(200, 80, 80, 0.2)' }}
        >
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)'
            }}
          >
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
          >
            Complete Category
          </h2>
          <p style={{ color: '#a89080' }}>
            Are you sure you want to complete "{category.name}"?
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8" style={{ color: '#a89080' }}>
              Loading stats...
            </div>
          ) : error ? (
            <div 
              className="p-4 rounded-lg mb-4 flex items-center gap-3"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
              <span style={{ color: '#ef4444' }}>{error}</span>
            </div>
          ) : stats ? (
            <div 
              className="rounded-xl p-4 mb-4"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(200, 80, 80, 0.2)'
              }}
            >
              <h3 
                className="text-sm uppercase tracking-widest mb-3"
                style={{ fontFamily: "'Cinzel', serif", color: '#c85050' }}
              >
                Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: '#a89080' }}>Total Tasks</span>
                  <span style={{ color: '#f5e6d3' }}>{stats.stats.total_tasks}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#a89080' }}>Completed Tasks</span>
                  <span style={{ color: '#f5e6d3' }}>{stats.stats.completed_tasks}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#a89080' }}>Time Invested</span>
                  <span style={{ color: '#f5e6d3' }}>
                    {Math.round(stats.stats.actual_minutes / 60 * 10) / 10} hours
                  </span>
                </div>
                <div 
                  className="pt-2 mt-2 flex justify-between"
                  style={{ borderTop: '1px solid rgba(200, 80, 80, 0.2)' }}
                >
                  <span style={{ color: '#a89080' }}>Completed On</span>
                  <span style={{ color: '#f5e6d3' }}>{formatDate(new Date())}</span>
                </div>
              </div>
            </div>
          ) : null}

          <p className="text-sm mb-6" style={{ color: '#a89080' }}>
            This category will be hidden from your dashboard but can be accessed in 
            Manage Categories → Completed.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                color: '#a89080',
                border: '1px solid rgba(200, 80, 80, 0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={completing || loading}
              className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                opacity: completing || loading ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                if (!completing && !loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)'
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <CheckCircle className="w-5 h-5" />
              {completing ? 'Completing...' : 'Complete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompleteCategoryModal
