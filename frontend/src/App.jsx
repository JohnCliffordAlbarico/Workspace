import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import SessionExpiredModal from './components/SessionExpiredModal'
import { useSessionMonitor } from './hooks/useSessionMonitor'

const Login = lazy(() => import('./pages/login'))
const Signup = lazy(() => import('./pages/signup'))
const Dashboard = lazy(() => import('./pages/dashboard'))

const PageLoader = () => (
  <div
    className="h-screen w-full flex items-center justify-center"
    style={{
      background: 'linear-gradient(135deg, #2d0f0f 0%, #4a1a1a 25%, #6b2828 50%, #8b3a3a 75%, #a85050 100%)',
      fontFamily: "'Crimson Text', serif"
    }}
  >
    <div style={{ color: '#f5e6d3', fontSize: '1.5rem' }}>Loading...</div>
  </div>
)

function App() {
  const [showSessionExpired, setShowSessionExpired] = useState(false)

  useSessionMonitor(30000)

  useEffect(() => {
    const handleSessionExpired = () => {
      setShowSessionExpired(true)
    }

    window.addEventListener('sessionExpired', handleSessionExpired)
    return () => window.removeEventListener('sessionExpired', handleSessionExpired)
  }, [])

  return (
    <>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>

      <SessionExpiredModal
        isOpen={showSessionExpired}
        onClose={() => setShowSessionExpired(false)}
      />
    </>
  )
}

export default App
