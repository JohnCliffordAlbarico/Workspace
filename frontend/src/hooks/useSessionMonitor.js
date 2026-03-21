import { useEffect, useRef, useCallback } from 'react'
import { isTokenExpired } from '../utils/tokenUtils'

/**
 * Hook to monitor session validity and trigger expiration events
 * @param {number} checkInterval - How often to check token (in milliseconds)
 */
export const useSessionMonitor = (checkInterval = 60000) => { // Default: check every 60 seconds
  const intervalRef = useRef(null)
  const hasTriggeredRef = useRef(false)

  const checkSession = useCallback(() => {
    const token = localStorage.getItem('token')
    
    // If no token, don't trigger (user might be on login page)
    if (!token) {
      return
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      // Only trigger once to avoid multiple modals
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true
        
        // Dispatch session expired event
        const event = new CustomEvent('sessionExpired')
        window.dispatchEvent(event)
        
        // Clear the interval since session is expired
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [])

  useEffect(() => {
    // Check immediately on mount
    checkSession()

    // Set up periodic checking
    intervalRef.current = setInterval(checkSession, checkInterval)

    // Also check on user activity (mouse move, click, keypress)
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart']
    
    const handleActivity = () => {
      checkSession()
    }

    // Throttle activity checks to avoid too many checks
    let activityTimeout = null
    const throttledActivityCheck = () => {
      if (!activityTimeout) {
        activityTimeout = setTimeout(() => {
          handleActivity()
          activityTimeout = null
        }, 5000) // Check at most once every 5 seconds on activity
      }
    }

    activityEvents.forEach(event => {
      window.addEventListener(event, throttledActivityCheck, { passive: true })
    })

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (activityTimeout) {
        clearTimeout(activityTimeout)
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, throttledActivityCheck)
      })
    }
  }, [checkSession, checkInterval])

  // Reset the trigger flag when component unmounts or token changes
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && !isTokenExpired(token)) {
      hasTriggeredRef.current = false
    }
  }, [])
}
