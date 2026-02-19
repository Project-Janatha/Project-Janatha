/**
 * UserContext.tsx
 *
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * @author Abhiram Ramachandran
 * @date September 5, 2025
 * @description
 *
 * This file exports a UserContext and UserProvider for managing user authentication state.
 *
 * Dependencies:
 * - @rnmapbox/maps: For rendering maps and handling map-related functionalities.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from 'react'
import { getStoredToken, removeStoredToken } from '../utils/tokenStorage'
import { authService } from '../../src/auth/authService'
import { API_BASE_URL, API_TIMEOUTS } from '../../src/config/api'
import type { AuthStatus, User, UpdateProfileRequest } from '../../src/auth/types'

interface UserContextType {
  user: User | null
  loading: boolean
  authStatus: AuthStatus
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  signup: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  checkUserExists: (username: string) => Promise<boolean>
  setUser: (user: User | null) => void
  getToken: () => Promise<string | null>
  authenticatedFetch: (endpoint: string, options?: RequestInit) => Promise<Response>
  deleteAccount: () => Promise<{ success: boolean; message?: string }>
  updateProfile: (updates: UpdateProfileRequest) => Promise<{ success: boolean; message?: string }>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

const resolveEndpointUrl = (endpoint: string): string => {
  if (/^https?:\/\//i.test(endpoint)) return endpoint

  const normalizedBase = API_BASE_URL.replace(/\/+$/, '')
  if (endpoint.startsWith('/api/')) {
    return `${normalizedBase}${endpoint.replace(/^\/api/, '')}`
  }
  if (endpoint.startsWith('/')) {
    return `${normalizedBase}${endpoint}`
  }
  return `${normalizedBase}/${endpoint}`
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthStatus>('booting')
  const loading = authStatus === 'booting'

  const login = useCallback(async (username: string, password: string) => {
    const result = await authService.login(username, password)
    if (!result.success) {
      return { success: false, message: result.message }
    }

    setUser(result.user || null)
    setAuthStatus('authenticated')
    return { success: true }
  }, [])

  const signup = useCallback(async (username: string, password: string) => {
    const result = await authService.signup(username, password)
    if (!result.success || !result.user) {
      return { success: false, message: result.message || 'Signup failed. Please try again.' }
    }

    setUser(result.user)
    setAuthStatus('authenticated')
    return { success: true }
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    setAuthStatus('unauthenticated')
  }, [])

  const checkUserExists = useCallback(async (username: string) => {
    const result = await authService.checkUserExists(username)
    if (!result.success || typeof result.existence !== 'boolean') {
      throw new Error(result.message || 'Failed to check user existence')
    }
    return result.existence
  }, [])

  const authenticatedFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = await getStoredToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.standard)

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      }

      const response = await fetch(resolveEndpointUrl(endpoint), {
        ...options,
        headers,
        signal: controller.signal,
        credentials: 'include',
      })

      if (response.status === 401 || response.status === 403) {
        await removeStoredToken()
        setUser(null)
        setAuthStatus('unauthenticated')
        throw new Error('Session expired. Please login again.')
      }

      return response
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection.')
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }, [])

  const deleteAccount = useCallback(async () => {
    const result = await authService.deleteAccount()
    if (!result.success) {
      return { success: false, message: result.message || 'Failed to delete account' }
    }

    setUser(null)
    setAuthStatus('unauthenticated')
    return { success: true, message: result.message || 'Account deleted successfully' }
  }, [])

  const updateProfile = useCallback(async (updates: UpdateProfileRequest) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null))

    const result = await authService.updateProfile(updates)
    if (!result.success || !result.user) {
      return { success: false, message: result.message || 'Failed to update profile' }
    }

    setUser(result.user)
    return { success: true }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      try {
        const token = await getStoredToken()
        if (!isMounted) return

        if (!token) {
          setUser(null)
          setAuthStatus('unauthenticated')
          return
        }

        const session = await authService.bootstrapSession()
        if (!isMounted) return

        setUser(session.user)
        setAuthStatus(session.authStatus)
      } catch {
        if (!isMounted) return
        await removeStoredToken()
        setUser(null)
        setAuthStatus('unauthenticated')
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      authStatus,
      login,
      signup,
      logout,
      checkUserExists,
      setUser,
      getToken: getStoredToken,
      authenticatedFetch,
      deleteAccount,
      updateProfile,
    }),
    [
      user,
      loading,
      authStatus,
      login,
      signup,
      logout,
      checkUserExists,
      authenticatedFetch,
      deleteAccount,
      updateProfile,
    ]
  )

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
}

export default UserContext
