import { Platform } from 'react-native'

const WEB_FALLBACK = 'https://app.chinmayajanata.org/api'
const NATIVE_FALLBACK = 'https://app.chinmayajanata.org/api'

// Expo public env var
const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim()

export const API_BASE_URL =
  envBaseUrl && envBaseUrl.length > 0
    ? envBaseUrl
    : Platform.OS === 'web'
      ? WEB_FALLBACK
      : NATIVE_FALLBACK

export const API_TIMEOUTS = {
  auth: 10_000,
  logout: 5_000,
  standard: 15_000,
} as const

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/authenticate',
    register: '/auth/register',
    verify: '/auth/verify',
    logout: '/auth/deauthenticate',
    deleteAccount: '/auth/delete-account',
  },
  users: {
    exists: '/userExistence',
    profile: '/user/profile',
  },
} as const

export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
}

export const buildApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
