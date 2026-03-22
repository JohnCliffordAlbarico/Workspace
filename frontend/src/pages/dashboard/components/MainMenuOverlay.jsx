import { useEffect, useState } from 'react'
import SettingsModal from '../modal/SettingsModal'

const MainMenuOverlay = ({ isOpen, onClose, onSelectView, currentView }) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const menuItems = [
    { 
      id: 'dashboard', 
      icon: '🏠', 
      label: 'Dashboard', 
      description: 'Manage your tasks with kanban board',
      disabled: false 
    },
    { 
      id: 'calendar', 
      icon: '📅', 
      label: 'Calendar', 
      description: 'View tasks by date and timeline',
      disabled: false 
    },
    { 
      id: 'analytics', 
      icon: '📊', 
      label: 'Analytics', 
      description: 'Track your productivity and insights',
      disabled: false 
    },
    { 
      id: 'settings', 
      icon: '⚙️', 
      label: 'Settings', 
      description: 'Customize your workspace preferences',
      disabled: false 
    }
  ]

  const handleSelect = (viewId) => {
    const item = menuItems.find(item => item.id === viewId)
    if (!item?.disabled) {
      if (viewId === 'settings') {
        setShowSettingsModal(true)
      } else {
        onSelectView(viewId)
        onClose()
      }
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div 
        className="max-w-4xl w-full mx-8 p-8 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #2d1418 0%, #1a0d0d 100%)',
          border: '2px solid rgba(200, 80, 80, 0.4)',
          boxShadow: '0 20px 60px rgba(200, 80, 80, 0.3)',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <h2 
          className="text-3xl font-bold mb-8 text-center"
          style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
        >
          Main Menu
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              disabled={item.disabled}
              className="p-6 rounded-xl transition-all duration-300 text-left"
              style={{
                background: currentView === item.id
                  ? 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)'
                  : 'rgba(45, 20, 25, 0.6)',
                border: currentView === item.id
                  ? '2px solid rgba(200, 80, 80, 0.6)'
                  : '1px solid rgba(200, 80, 80, 0.2)',
                opacity: item.disabled ? 0.5 : 1,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                transform: currentView === item.id ? 'scale(1.02)' : 'scale(1)'
              }}
              onMouseOver={(e) => {
                if (!item.disabled) {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(200, 80, 80, 0.5)'
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = currentView === item.id ? 'scale(1.02)' : 'scale(1)'
                e.currentTarget.style.boxShadow = ''
              }}
            >
              <div className="text-5xl mb-3">{item.icon}</div>
              <h3 
                className="text-xl font-bold mb-2"
                style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
              >
                {item.label}
                {item.disabled && (
                  <span className="text-sm ml-2" style={{ color: '#a89080' }}>
                    (Coming Soon)
                  </span>
                )}
              </h3>
              <p className="text-sm" style={{ color: '#a89080' }}>
                {item.description}
              </p>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full py-3 rounded-lg text-center transition-all duration-300"
          style={{
            background: 'rgba(200, 80, 80, 0.2)',
            border: '1px solid rgba(200, 80, 80, 0.3)',
            color: '#f5e6d3'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(200, 80, 80, 0.3)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(200, 80, 80, 0.2)'
          }}
        >
          Close Menu (ESC)
        </button>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  )
}

export default MainMenuOverlay
