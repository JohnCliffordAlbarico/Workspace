import { LogIn, Mail, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLogin } from './hooks/useLogin'

const Login = () => {
  const { email, setEmail, password, setPassword, error, loading, handleLogin } = useLogin()

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2d0f0f 0%, #4a1a1a 25%, #6b2828 50%, #8b3a3a 75%, #a85050 100%)',
        fontFamily: "'Crimson Text', serif"
      }}
    >
      {/* Floating Butterflies Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute animate-float" 
          style={{ 
            top: '15%', 
            left: '10%', 
            fontSize: '28px', 
            opacity: 0.5,
            animation: 'float 4s ease-in-out infinite'
          }}
        >
          🦋
        </div>
        <div 
          className="absolute animate-float" 
          style={{ 
            top: '25%', 
            right: '15%', 
            fontSize: '24px', 
            opacity: 0.4,
            animation: 'float 5s ease-in-out infinite',
            animationDelay: '-1s'
          }}
        >
          🦋
        </div>
        <div 
          className="absolute animate-float" 
          style={{ 
            top: '60%', 
            left: '85%', 
            fontSize: '22px', 
            opacity: 0.45,
            animation: 'float 4.5s ease-in-out infinite',
            animationDelay: '-1.5s'
          }}
        >
          🦋
        </div>
        <div 
          className="absolute animate-float" 
          style={{ 
            top: '70%', 
            right: '75%', 
            fontSize: '26px', 
            opacity: 0.35,
            animation: 'float 5.5s ease-in-out infinite',
            animationDelay: '-2s'
          }}
        >
          🦋
        </div>
        <div 
          className="absolute animate-float" 
          style={{ 
            top: '80%', 
            left: '20%', 
            fontSize: '20px', 
            opacity: 0.4,
            animation: 'float 4s ease-in-out infinite',
            animationDelay: '-2.5s'
          }}
        >
          🦋
        </div>
        <div 
          className="absolute animate-float" 
          style={{ 
            top: '40%', 
            left: '50%', 
            fontSize: '24px', 
            opacity: 0.3,
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '-3s'
          }}
        >
          🦋
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes ghostFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
          50% { transform: translateY(-8px) scale(1.05); opacity: 0.9; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 25px rgba(200, 80, 80, 0.4); }
          50% { box-shadow: 0 0 45px rgba(200, 80, 80, 0.7); }
        }
      `}</style>

      <div className="w-full max-w-md z-10">
        {/* Logo/Header with Ghost Icon */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{
              background: 'linear-gradient(135deg, #c85050 0%, #ff6b6b 100%)',
              boxShadow: '0 4px 20px rgba(200, 80, 80, 0.5)',
              animation: 'pulseGlow 4s ease-in-out infinite'
            }}
          >
            <span 
              className="text-4xl"
              style={{ animation: 'ghostFloat 3s ease-in-out infinite' }}
            >
              👻
            </span>
          </div>
          <h1 
            className="text-4xl font-bold mb-2"
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#fff5f0',
              textShadow: '0 2px 15px rgba(200, 80, 80, 0.5)'
            }}
          >
            Yuuko's Workspace
          </h1>
          <p style={{ color: '#ffd4d4' }}>
            Where productivity meets elegance
          </p>
        </div>

        {/* Login Form */}
        <div 
          className="rounded-2xl p-8"
          style={{
            background: 'linear-gradient(145deg, rgba(255, 245, 240, 0.95) 0%, rgba(255, 235, 235, 0.98) 100%)',
            border: '2px solid rgba(200, 80, 80, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-2"
                style={{ color: '#8b2942' }}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5" style={{ color: '#c85050' }} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-12 pr-4 py-3 rounded-xl text-base outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '2px solid rgba(200, 80, 80, 0.3)',
                    color: '#2d0f0f'
                  }}
                  placeholder="yuuko@workspace.com"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#c85050'
                    e.target.style.boxShadow = '0 0 15px rgba(200, 80, 80, 0.3)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(200, 80, 80, 0.3)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium mb-2"
                style={{ color: '#8b2942' }}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5" style={{ color: '#c85050' }} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-12 pr-4 py-3 rounded-xl text-base outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '2px solid rgba(200, 80, 80, 0.3)',
                    color: '#2d0f0f'
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#c85050'
                    e.target.style.boxShadow = '0 0 15px rgba(200, 80, 80, 0.3)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(200, 80, 80, 0.3)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="px-4 py-3 rounded-lg text-sm"
                style={{
                  background: 'rgba(255, 71, 87, 0.2)',
                  border: '1px solid rgba(255, 71, 87, 0.5)',
                  color: '#d32f2f'
                }}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #c85050 0%, #ff6b6b 100%)',
                color: '#ffffff',
                border: 'none',
                fontFamily: "'Cinzel', serif"
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(200, 80, 80, 0.5)'
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entering...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Enter Workspace
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm">
            <a 
              href="#" 
              className="font-medium transition-colors duration-200"
              style={{ color: '#c85050' }}
              onMouseOver={(e) => e.target.style.color = '#8b2942'}
              onMouseOut={(e) => e.target.style.color = '#c85050'}
            >
              Forgot password?
            </a>
          </div>
          <div className="mt-4 text-center text-sm" style={{ color: '#8b2942' }}>
            New to Yuuko's Workspace?{' '}
            <Link 
              to="/signup"
              className="font-medium transition-colors duration-200"
              style={{ color: '#c85050' }}
              onMouseOver={(e) => e.target.style.color = '#8b2942'}
              onMouseOut={(e) => e.target.style.color = '#c85050'}
            >
              Join us
            </Link>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mt-6 text-center">
          <p 
            className="text-sm italic"
            style={{ color: '#ffd4d4' }}
          >
            "Organize your tasks, elevate your productivity"
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
