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
import { getStoredToken, setStoredToken, removeStoredToken } from '../utils/tokenStorage'
import { authClient } from '../../src/auth/authClient'
import { API_BASE_URL, API_TIMEOUTS } from '../../src/config/api'
import type { User, UpdateProfileRequest } from '../../src/auth/types'

interface UserContextType {
  user: User | null
  loading: boolean
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
  const [loading, setLoading] = useState(true)

  const login = useCallback(async (username: string, password: string) => {
    const result = await authClient.login({ username, password })
    if (!result.success) {
      return { success: false, message: result.error.message }
    }

    if (result.data.token) {
      await setStoredToken(result.data.token)
    }

    setUser(result.data.user)
    return { success: true }
  }, [])

  const signup = useCallback(
    async (username: string, password: string) => {
      const result = await authClient.signup({ username, password })
      if (!result.success) {
        return { success: false, message: result.error.message }
      }

      const loginResult = await login(username, password)
      if (!loginResult.success) {
        return {
          success: false,
          message:
            loginResult.message || 'Signup succeeded but login failed. Please try logging in.',
        }
      }

      return { success: true }
    },
    [login]
  )

  const logout = useCallback(async () => {
    try {
      const token = await getStoredToken()
      await authClient.logout(token || undefined)
    } finally {
      await removeStoredToken()
      setUser(null)
    }
  }, [])

  const checkUserExists = useCallback(async (username: string) => {
    const result = await authClient.checkUserExists(username)
    if (!result.success) {
      throw new Error(result.error.message)
    }
    return result.data.existence
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
    try {
      const token = await getStoredToken()
      if (!token) {
        return { success: false, message: 'No authentication token found' }
      }

      const result = await authClient.deleteAccount(token)
      if (!result.success) {
        return { success: false, message: result.error.message }
      }

      await removeStoredToken()
      setUser(null)
      return { success: true, message: result.data.message || 'Account deleted successfully' }
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error. Please try again.' }
    }
  }, [])

  const updateProfile = useCallback(async (updates: UpdateProfileRequest) => {
    try {
      setUser((prev) => (prev ? { ...prev, ...updates } : null))

      const token = await getStoredToken()
      if (!token) {
        return { success: false, message: 'No authentication token found' }
      }

      const result = await authClient.updateProfile(token, updates)
      if (!result.success) {
        return { success: false, message: result.error.message }
      }

      setUser(result.data.user)
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update profile' }
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      try {
        const token = await getStoredToken()
        if (!isMounted) return

        if (!token) {
          setUser(null)
          return
        }

        const result = await authClient.verify(token)
        if (!isMounted) return

        if (result.success) {
          setUser(result.data.user)
        } else {
          await removeStoredToken()
          setUser(null)
        }
      } catch {
        if (!isMounted) return
        await removeStoredToken()
        setUser(null)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
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
