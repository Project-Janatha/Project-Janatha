import { authClient } from './authClient'
import type { AuthStatus, User, UpdateProfileRequest } from './types'
import {
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from '../../components/utils/tokenStorage'

export type SessionState =
  | { authStatus: 'booting'; user: null }
  | { authStatus: 'authenticated'; user: User }
  | { authStatus: 'unauthenticated'; user: null }

export const authService = {
  async bootstrapSession(): Promise<SessionState> {
    try {
      const token = await getStoredToken()
      if (!token) {
        return { authStatus: 'unauthenticated', user: null }
      }

      const verifyResult = await authClient.verify(token)
      if (!verifyResult.success) {
        await removeStoredToken()
        return { authStatus: 'unauthenticated', user: null }
      }

      return { authStatus: 'authenticated', user: verifyResult.data.user }
    } catch {
      await removeStoredToken()
      return { authStatus: 'unauthenticated', user: null }
    }
  },

  async login(
    username: string,
    password: string
  ): Promise<{
    success: boolean
    message?: string
    user?: User
  }> {
    const result = await authClient.login({ username, password })
    if (!result.success) {
      return { success: false, message: result.error.message }
    }

    if (result.data.token) {
      await setStoredToken(result.data.token)
    }

    return { success: true, user: result.data.user }
  },

  async signup(
    username: string,
    password: string
  ): Promise<{
    success: boolean
    message?: string
    user?: User
  }> {
    const signupResult = await authClient.signup({ username, password })
    if (!signupResult.success) {
      return { success: false, message: signupResult.error.message }
    }

    return { success: true, message: signupResult.data?.message || 'Signup successful. Please log in.' }
  },

  async logout(): Promise<void> {
    try {
      const token = await getStoredToken()
      await authClient.logout(token || undefined)
    } finally {
      await removeStoredToken()
    }
  },

  async checkUserExists(
    username: string
  ): Promise<{ success: boolean; message?: string; existence?: boolean }> {
    const result = await authClient.checkUserExists(username)
    if (!result.success) {
      return { success: false, message: result.error.message }
    }

    return { success: true, existence: result.data.existence }
  },

  async updateProfile(updates: UpdateProfileRequest): Promise<{
    success: boolean
    message?: string
    user?: User
  }> {
    const token = await getStoredToken()
    if (!token) {
      return { success: false, message: 'No authentication token found' }
    }

    const result = await authClient.updateProfile(token, updates)
    if (!result.success) {
      return { success: false, message: result.error.message }
    }

    return { success: true, user: result.data.user }
  },

  async deleteAccount(): Promise<{ success: boolean; message?: string }> {
    const token = await getStoredToken()
    if (!token) {
      return { success: false, message: 'No authentication token found' }
    }

    const result = await authClient.deleteAccount(token)
    if (!result.success) {
      return { success: false, message: result.error.message }
    }

    await removeStoredToken()
    return { success: true, message: result.data.message }
  },

  toAuthStatus(isAuthenticated: boolean): AuthStatus {
    return isAuthenticated ? 'authenticated' : 'unauthenticated'
  },
}
