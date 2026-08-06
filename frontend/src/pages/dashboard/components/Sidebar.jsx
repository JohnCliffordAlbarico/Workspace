import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import ProfileModal from '../modal/ProfileModal'
import AllocationProgress from '../../../components/AllocationProgress'

const Sidebar = ({ categories, getCategoryProgress, totalAllocated, totalActual, totalPercentage, view, setView, onMenuClick, isMenuOpen }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <aside 
      className="w-80 flex-shrink-0 p-6 flex flex-col z-10 overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, rgba(45, 15, 20, 0.6) 0%, rgba(26, 10, 10, 0.7) 100%)',
        borderRight: '1px solid rgba(200, 80, 80, 0.2)'
      }}
    >
      <style>{`
        @keyframes ghostFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
          50% { transform: translateY(-8px) scale(1.05); opacity: 0.9; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 25px rgba(200, 80, 80, 0.4); }
          50% { box-shadow: 0 0 45px rgba(200, 80, 80, 0.7); }
        }
      `}</style>

      {/* Menu Icon Button */}
      <button
        onClick={onMenuClick}
        className="mb-4 p-3 rounded-xl transition-all duration-300"
        style={{
          background: isMenuOpen 
            ? 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)' 
            : 'rgba(45, 20, 25, 0.6)',
          border: '1px solid rgba(200, 80, 80, 0.3)',
        }}
        onMouseOver={(e) => {
          if (!isMenuOpen) {
            e.currentTarget.style.background = 'rgba(45, 20, 25, 0.8)'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(200, 80, 80, 0.3)'
          }
        }}
        onMouseOut={(e) => {
          if (!isMenuOpen) {
            e.currentTarget.style.background = 'rgba(45, 20, 25, 0.6)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = ''
          }
        }}
      >
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6" style={{ color: '#f5e6d3' }} />
          <span 
            className="text-base font-semibold"
            style={{ color: '#f5e6d3', fontFamily: "'Cinzel', serif" }}
          >
            Menu
          </span>
        </div>
      </button>

      {/* Profile Card */}
      <div 
        className="rounded-2xl p-6 mb-6 cursor-pointer transition-all duration-300"
        style={{
          background: 'linear-gradient(145deg, #2d1418 0%, #1a0d0d 100%)',
          border: '1px solid rgba(200, 80, 80, 0.3)',
          animation: 'pulseGlow 4s ease-in-out infinite'
        }}
        onClick={() => setShowProfileModal(true)}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(200, 80, 80, 0.6)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = ''
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl overflow-hidden"
            style={{
              background: user?.profile_img 
                ? 'transparent' 
                : 'linear-gradient(135deg, #c85050 0%, #ff6b6b 100%)',
              boxShadow: '0 4px 15px rgba(200, 80, 80, 0.4)',
              border: '3px solid rgba(200, 80, 80, 0.6)'
            }}
          >
            {user?.profile_img ? (
              <img 
                src={user.profile_img} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span style={{ animation: 'ghostFloat 3s ease-in-out infinite' }}>👻</span>
            )}
          </div>
          <div className="flex-1">
            <h2 
              className="text-xl font-bold"
              style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
            >
              {user?.display_name || user?.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-sm" style={{ color: '#c85050' }}>
              {user?.role === 'admin' ? 'Administrator' : 'Focus Manager'}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleLogout()
            }}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-red-900/30"
            title="Logout"
          >
            <LogOut className="w-5 h-5" style={{ color: '#c85050' }} />
          </button>
        </div>
        <div className="pt-4" style={{ borderTop: '1px solid rgba(200, 80, 80, 0.2)' }}>
          <p className="text-sm italic text-center" style={{ color: '#d4a574' }}>
            "Focus on what matters, track your progress"
          </p>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false)
          const userData = localStorage.getItem('user')
          if (userData) {
            setUser(JSON.parse(userData))
          }
        }}
      />

      {/* View Toggle */}
      <div 
        className="rounded-xl p-4 mb-6"
        style={{
          background: 'rgba(45, 20, 25, 0.6)',
          border: '1px solid rgba(200, 80, 80, 0.15)'
        }}
      >
        <div className="flex gap-2">
          <button
            onClick={() => setView('active')}
            className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300"
            style={{
              background: view === 'active' 
                ? 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)' 
                : 'rgba(0,0,0,0.3)',
              color: view === 'active' ? '#f5e6d3' : '#a89080',
              border: view === 'active' 
                ? '1px solid rgba(200, 80, 80, 0.5)' 
                : '1px solid rgba(200, 80, 80, 0.2)'
            }}
          >
            ⚡ Active
          </button>
          <button
            onClick={() => setView('completed')}
            className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300"
            style={{
              background: view === 'completed' 
                ? 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)' 
                : 'rgba(0,0,0,0.3)',
              color: view === 'completed' ? '#f5e6d3' : '#a89080',
              border: view === 'completed' 
                ? '1px solid rgba(200, 80, 80, 0.5)' 
                : '1px solid rgba(200, 80, 80, 0.2)'
            }}
          >
            👻 Completed
          </button>
        </div>
      </div>

      {/* Today's Progress */}
      <div 
        className="rounded-xl p-5 mb-6"
        style={{
          background: 'rgba(45, 20, 25, 0.6)',
          border: '1px solid rgba(200, 80, 80, 0.15)'
        }}
      >
        <h3 
          className="text-sm uppercase tracking-widest mb-4"
          style={{ fontFamily: "'Cinzel', serif", color: '#c85050' }}
        >
          Today's Progress
        </h3>
        
        {categories.length === 0 ? (
          <p className="text-sm" style={{ color: '#a89080' }}>
            No categories yet
          </p>
        ) : (
          <div className="space-y-4">
            {categories.map(category => {
              const progress = getCategoryProgress(category.id)
              return (
                <div key={category.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ background: category.color }}
                    />
                    <span className="text-sm font-semibold" style={{ color: '#f5e6d3' }}>
                      {category.name}
                    </span>
                  </div>
                  <AllocationProgress 
                    actualMinutes={progress.actual_minutes}
                    dailyAllocation={progress.daily_allocation}
                  />
                </div>
              )
            })}
            
            {/* Total Progress */}
            <div 
              className="pt-4 mt-4"
              style={{ borderTop: '1px solid rgba(200, 80, 80, 0.2)' }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold" style={{ color: '#f5e6d3' }}>
                  Total
                </span>
                <span className="text-sm" style={{ color: '#a89080' }}>
                  {totalActual}/{totalAllocated} min
                </span>
              </div>
              <div 
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.4)' }}
              >
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalPercentage}%`,
                    background: 'linear-gradient(90deg, #8b2942 0%, #c85050 50%, #d4a574 100%)'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

    </aside>
  )
}

export default Sidebar
