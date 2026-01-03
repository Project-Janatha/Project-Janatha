/**
 * tokenStorage.web.ts
 *
 * Web-specific implementation using localStorage with Cookie fallback
 * This avoids importing AsyncStorage entirely on web
 */

const TOKEN_KEY = '@auth_token'

// Helper to set cookie
const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === 'undefined') return
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/'
}

// Helper to get cookie
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

// Helper to erase cookie
const eraseCookie = (name: string) => {
  if (typeof document === 'undefined') return
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

export const setStoredToken = async (token: string): Promise<void> => {
  try {
    if (typeof window !== 'undefined') {
      // Try localStorage first
      try {
        localStorage.setItem(TOKEN_KEY, token)
      } catch (e) {
        // Ignore localStorage errors
      }
      // Also set cookie as backup for ITP
      setCookie(TOKEN_KEY, token, 7)
    }
  } catch (error) {
    console.error('Error storing token:', error)
  }
}

export const getStoredToken = async (): Promise<string | null> => {
  try {
    if (typeof window !== 'undefined') {
      // Try localStorage
      try {
        const localToken = localStorage.getItem(TOKEN_KEY)
        if (localToken) return localToken
      } catch (e) {
        // Ignore localStorage errors
      }

      // Fallback to cookie
      return getCookie(TOKEN_KEY)
    }
    return null
  } catch (error) {
    console.error('Error retrieving token:', error)
    return null
  }
}

export const removeStoredToken = async (): Promise<void> => {
  try {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(TOKEN_KEY)
      } catch (e) {}
      eraseCookie(TOKEN_KEY)
    }
  } catch (error) {
    console.error('Error removing token:', error)
  }
}

export const hasStoredToken = async (): Promise<boolean> => {
  const token = await getStoredToken()
  return !!token
}
