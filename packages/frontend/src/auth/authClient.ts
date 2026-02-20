import { API_BASE_URL, API_TIMEOUTS } from '../config/api'
import type {
  AsyncResult,
  AuthError,
  AuthSuccessResponse,
  CheckUserExistsResponse,
  GenericSuccessResponse,
  LoginRequest,
  SignupRequest,
  UpdateProfileRequest,
  User,
} from './types'

const withTimeout = async (input: RequestInfo | URL, init: RequestInit, timeoutMs: number) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

const toError = (message: string, status?: number, code?: string): AuthError => ({
  message,
  status,
  code,
})

const normalizeUsername = (username: string) => username.trim().toLowerCase()

const buildUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

const safeJson = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

export const authClient = {
  async login(payload: LoginRequest): AsyncResult<AuthSuccessResponse> {
    try {
      const normalizedPayload = {
        ...payload,
        username: normalizeUsername(payload.username),
      }
      const response = await withTimeout(
        buildUrl('/auth/authenticate'),
        {
          method: 'POST',
          body: JSON.stringify(normalizedPayload),
        },
        API_TIMEOUTS.auth
      )

      const data = await safeJson<AuthSuccessResponse & { message?: string }>(response)

      if (!response.ok || !data?.user) {
        return {
          success: false,
          error: toError(data?.message || 'Invalid credentials', response.status),
        }
      }

      return { success: true, data }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return { success: false, error: toError('Request timeout. Please check your connection.') }
      }
      return { success: false, error: toError('Network error. Please try again.') }
    }
  },

  async signup(payload: SignupRequest): AsyncResult<GenericSuccessResponse> {
    try {
      const normalizedPayload = {
        ...payload,
        username: normalizeUsername(payload.username),
      }
      const response = await withTimeout(
        buildUrl('/auth/register'),
        {
          method: 'POST',
          body: JSON.stringify(normalizedPayload),
        },
        API_TIMEOUTS.auth
      )

      const data = await safeJson<GenericSuccessResponse>(response)

      if (!response.ok) {
        return {
          success: false,
          error: toError(data?.message || 'Signup failed. Please try again.', response.status),
        }
      }

      return { success: true, data: { success: true, message: data?.message } }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return { success: false, error: toError('Request timeout. Please check your connection.') }
      }
      return { success: false, error: toError('Network error. Please try again.') }
    }
  },

  async verify(token: string): AsyncResult<{ user: User }> {
    try {
      const response = await withTimeout(
        buildUrl('/auth/verify'),
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        },
        API_TIMEOUTS.auth
      )

      const data = await safeJson<{ user: User; message?: string }>(response)

      if (!response.ok || !data?.user) {
        return {
          success: false,
          error: toError(data?.message || 'Session invalid', response.status),
        }
      }

      return { success: true, data: { user: data.user } }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return { success: false, error: toError('Request timeout. Please check your connection.') }
      }
      return { success: false, error: toError('Network error. Please try again.') }
    }
  },

  async logout(token?: string): AsyncResult<GenericSuccessResponse> {
    try {
      const response = await withTimeout(
        buildUrl('/auth/deauthenticate'),
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
        API_TIMEOUTS.logout
      )

      const data = await safeJson<GenericSuccessResponse>(response)

      if (!response.ok) {
        return {
          success: false,
          error: toError(data?.message || 'Logout failed', response.status),
        }
      }

      return { success: true, data: { success: true, message: data?.message } }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return { success: false, error: toError('Request timeout. Please check your connection.') }
      }
      return { success: false, error: toError('Network error. Please try again.') }
    }
  },

  async checkUserExists(username: string): AsyncResult<CheckUserExistsResponse> {
    try {
      const normalizedUsername = normalizeUsername(username)
      const response = await withTimeout(
        buildUrl('/userExistence'),
        {
          method: 'POST',
          body: JSON.stringify({ username: normalizedUsername, email: normalizedUsername }),
        },
        API_TIMEOUTS.standard
      )

      const data = await safeJson<CheckUserExistsResponse & { message?: string }>(response)

      if (!response.ok || typeof data?.existence !== 'boolean') {
        return {
          success: false,
          error: toError(data?.message || 'Failed to check user existence', response.status),
        }
      }

      return { success: true, data: { existence: data.existence } }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return { success: false, error: toError('Request timeout. Please check your connection.') }
      }
      return { success: false, error: toError('Network error. Please try again.') }
    }
  },

  async updateProfile(token: string, updates: UpdateProfileRequest): AsyncResult<{ user: User }> {
    try {
      const response = await withTimeout(
        buildUrl('/users/profile'),
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(updates),
        },
        API_TIMEOUTS.standard
      )

      const data = await safeJson<User | { user: User; message?: string }>(response)

      if (!response.ok) {
        const message = (data as any)?.message || 'Failed to update profile'
        return { success: false, error: toError(message, response.status) }
      }

      // Supports either { user } or direct user response
      const user = (data as any)?.user ? (data as any).user : (data as User)
      return { success: true, data: { user } }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return { success: false, error: toError('Request timeout. Please check your connection.') }
      }
      return { success: false, error: toError('Network error. Please try again.') }
    }
  },

  async deleteAccount(token: string): AsyncResult<GenericSuccessResponse> {
    try {
      const response = await withTimeout(
        buildUrl('/auth/delete-account'),
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
        API_TIMEOUTS.standard
      )

      const data = await safeJson<GenericSuccessResponse>(response)

      if (!response.ok) {
        return {
          success: false,
          error: toError(data?.message || 'Failed to delete account', response.status),
        }
      }

      return { success: true, data: { success: true, message: data?.message } }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return { success: false, error: toError('Request timeout. Please check your connection.') }
      }
      return { success: false, error: toError('Network error. Please try again.') }
    }
  },
}
