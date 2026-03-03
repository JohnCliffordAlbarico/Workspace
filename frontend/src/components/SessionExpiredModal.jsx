import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const SessionExpiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      // Prevent closing with ESC - user must click button
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
        }
      }
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Close modal
    onClose()
    
    // Redirect to login
    navigate('/', { replace: true })
  }

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>

      <div 
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          background: 'linear-gradient(145deg, #2d1418 0%, #1a0d0d 100%)',
          border: '2px solid rgba(255, 71, 87, 0.5)',
          boxShadow: '0 20px 60px rgba(255, 71, 87, 0.4)',
          animation: 'slideDown 0.3s ease-out'
        }}
      >
        {/* Warning Icon */}
        <div 
          className="text-center mb-6"
          style={{
            animation: 'pulse 2s ease-in-out infinite'
          }}
        >
          <div 
            className="text-6xl mb-4"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255, 71, 87, 0.6))'
            }}
          >
            ⚠️
          </div>
        </div>

        {/* Title */}
        <h2 
          className="text-2xl font-bold text-center mb-4"
          style={{
            fontFamily: "'Cinzel', serif",
            color: '#ff4757',
            textShadow: '0 2px 10px rgba(255, 71, 87, 0.5)'
          }}
        >
          Session Expired
        </h2>

        {/* Message */}
        <p 
          className="text-center mb-6 leading-relaxed"
          style={{
            color: '#f5e6d3',
            fontSize: '1rem'
          }}
        >
          Your session has expired due to inactivity. For your security, you need to log in again to continue.
        </p>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl text-base font-semibold transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #ff4757 0%, #ff6348 100%)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 15px rgba(255, 71, 87, 0.4)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 71, 87, 0.6)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 71, 87, 0.4)'
          }}
        >
          OK, Log Me Out
        </button>

        {/* Info Text */}
        <p 
          className="text-center mt-4 text-xs"
          style={{
            color: '#a89080'
          }}
        >
          You'll be redirected to the login page
        </p>
      </div>
    </div>,
    document.body
  )
}

export default SessionExpiredModal
