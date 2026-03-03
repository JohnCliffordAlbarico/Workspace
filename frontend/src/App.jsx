import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/login'
import Signup from './pages/signup'
import Dashboard from './pages/dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import SessionExpiredModal from './components/SessionExpiredModal'

function App() {
  const [showSessionExpired, setShowSessionExpired] = useState(false)

  useEffect(() => {
    // Listen for session expired events
    const handleSessionExpired = () => {
      setShowSessionExpired(true)
    }

    window.addEventListener('sessionExpired', handleSessionExpired)
    return () => window.removeEventListener('sessionExpired', handleSessionExpired)
  }, [])

  return (
    <>
      <Router>
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
      </Router>

      <SessionExpiredModal
        isOpen={showSessionExpired}
        onClose={() => setShowSessionExpired(false)}
      />
    </>
  )
}

export default App
