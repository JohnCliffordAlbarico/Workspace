import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'

const MaintenancePlaceholder = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div 
      className="flex-1 flex items-center justify-center p-8"
      style={{
        fontFamily: "'Crimson Text', serif"
      }}
    >
      <div 
        className="max-w-lg w-full rounded-3xl p-10 text-center"
        style={{
          background: 'linear-gradient(145deg, rgba(45, 15, 20, 0.9) 0%, rgba(26, 10, 10, 0.95) 100%)',
          border: '1px solid rgba(200, 80, 80, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Icon */}
        <div 
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
            boxShadow: '0 8px 30px rgba(200, 80, 80, 0.4)'
          }}
        >
          <span className="text-4xl">🔧</span>
        </div>

        {/* Title */}
        <h1 
          className="text-3xl font-bold mb-4"
          style={{
            fontFamily: "'Cinzel', serif",
            color: '#f5e6d3',
            textShadow: '0 2px 10px rgba(200, 80, 80, 0.3)'
          }}
        >
          Maintenance Mode
        </h1>

        {/* Description */}
        <p 
          className="text-lg mb-8"
          style={{ color: '#a89080' }}
        >
          The workspace system is being upgraded to
          <br />
          <span style={{ color: '#f5e6d3', fontWeight: '600' }}>Focus Categories</span>. Coming soon!
        </p>

        {/* What's Changing */}
        <div 
          className="rounded-xl p-6 mb-8 text-left"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(200, 80, 80, 0.2)'
          }}
        >
          <h3 
            className="text-sm uppercase tracking-widest mb-4"
            style={{ fontFamily: "'Cinzel', serif", color: '#c85050' }}
          >
            What's Changing
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <span 
                className="w-2 h-2 rounded-full"
                style={{ background: '#c85050' }}
              />
              <span style={{ color: '#a89080' }}>
                <span style={{ color: '#f5e6d3' }}>Workspaces</span> → <span style={{ color: '#f5e6d3' }}>Focus Categories</span>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span 
                className="w-2 h-2 rounded-full"
                style={{ background: '#c85050' }}
              />
              <span style={{ color: '#a89080' }}>
                <span style={{ color: '#f5e6d3' }}>Daily time allocation tracking</span>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span 
                className="w-2 h-2 rounded-full"
                style={{ background: '#c85050' }}
              />
              <span style={{ color: '#a89080' }}>
                <span style={{ color: '#f5e6d3' }}>Category-based task organization</span>
              </span>
            </li>
          </ul>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-8 py-3 rounded-xl text-base font-semibold transition-all duration-300 inline-flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
            color: '#f5e6d3',
            border: 'none'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(200, 80, 80, 0.4)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default MaintenancePlaceholder
