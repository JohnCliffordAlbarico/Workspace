/**
 * Decode JWT token without verification (client-side only)
 * Note: This doesn't verify the signature, just reads the payload
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - true if expired, false if valid
 */
export const isTokenExpired = (token) => {
  if (!token) return true

  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true

  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Date.now() / 1000
  
  // Add 5 second buffer to account for clock skew
  return decoded.exp < (currentTime + 5)
}

/**
 * Get time until token expires in milliseconds
 * @param {string} token - JWT token
 * @returns {number} - milliseconds until expiration, or 0 if expired
 */
export const getTokenExpirationTime = (token) => {
  if (!token) return 0

  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return 0

  const currentTime = Date.now() / 1000
  const timeUntilExpiry = decoded.exp - currentTime

  return timeUntilExpiry > 0 ? timeUntilExpiry * 1000 : 0
}

/**
 * Check if token will expire soon (within specified minutes)
 * @param {string} token - JWT token
 * @param {number} minutes - minutes threshold (default: 5)
 * @returns {boolean} - true if expiring soon
 */
export const isTokenExpiringSoon = (token, minutes = 5) => {
  const timeUntilExpiry = getTokenExpirationTime(token)
  const threshold = minutes * 60 * 1000 // convert to milliseconds
  
  return timeUntilExpiry > 0 && timeUntilExpiry < threshold
}
