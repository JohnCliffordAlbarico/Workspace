import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import api from '../../../config/api'

const SettingsModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setError('')
      setSuccess('')
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number'
    }
    return null
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password')
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)

    try {
      await api.post('/api/users/change-password', {
        currentPassword,
        newPassword
      })

      setSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 10000
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-2xl p-8"
        style={{
          background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.95) 0%, rgba(26, 10, 10, 0.98) 100%)',
          border: '2px solid rgba(200, 80, 80, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-3xl font-bold"
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#f5e6d3',
              textShadow: '0 2px 10px rgba(200, 80, 80, 0.3)'
            }}
          >
            ⚙️ Settings
          </h2>
          <button
            onClick={onClose}
            className="text-2xl transition-all duration-200"
            style={{ color: '#c85050' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="mb-4 p-3 rounded-lg"
            style={{
              background: 'rgba(255, 71, 87, 0.2)',
              border: '1px solid rgba(255, 71, 87, 0.5)',
              color: '#ff4757'
            }}
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div 
            className="mb-4 p-3 rounded-lg"
            style={{
              background: 'rgba(255, 165, 2, 0.2)',
              border: '1px solid rgba(255, 165, 2, 0.5)',
              color: '#ffa502'
            }}
          >
            ✓ {success}
          </div>
        )}

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label 
              className="block mb-2 text-sm font-semibold"
              style={{ color: '#f5e6d3' }}
            >
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl text-base outline-none"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(200, 80, 80, 0.3)',
                  color: '#f5e6d3'
                }}
                placeholder="Enter current password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg"
                style={{ color: '#a89080' }}
              >
                {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div>
            <label 
              className="block mb-2 text-sm font-semibold"
              style={{ color: '#f5e6d3' }}
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl text-base outline-none"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(200, 80, 80, 0.3)',
                  color: '#f5e6d3'
                }}
                placeholder="Enter new password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg"
                style={{ color: '#a89080' }}
              >
                {showNewPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div>
            <label 
              className="block mb-2 text-sm font-semibold"
              style={{ color: '#f5e6d3' }}
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl text-base outline-none"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(200, 80, 80, 0.3)',
                  color: '#f5e6d3'
                }}
                placeholder="Confirm new password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg"
                style={{ color: '#a89080' }}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div 
            className="p-3 rounded-lg text-xs"
            style={{
              background: 'rgba(200, 80, 80, 0.1)',
              border: '1px solid rgba(200, 80, 80, 0.2)',
              color: '#a89080'
            }}
          >
            <p className="font-semibold mb-1" style={{ color: '#f5e6d3' }}>Password Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>At least 8 characters long</li>
              <li>Contains uppercase and lowercase letters</li>
              <li>Contains at least one number</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl font-semibold"
              style={{
                background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
                color: '#f5e6d3',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '🔄 Changing...' : '🔒 Change Password'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(200, 80, 80, 0.3)',
                color: '#f5e6d3',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default SettingsModal
