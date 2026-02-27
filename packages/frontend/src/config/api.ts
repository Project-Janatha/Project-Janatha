import { Platform } from 'react-native'

const DEFAULT_FALLBACK = 'https://app.chinmayajanata.org/api'

const webOrigin =
  typeof window !== 'undefined' && window.location?.origin ? window.location.origin : ''
const WEB_FALLBACK = webOrigin ? `${webOrigin}/api` : DEFAULT_FALLBACK
const NATIVE_FALLBACK = DEFAULT_FALLBACK

// Expo public env var
const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim()

export const API_BASE_URL =
  envBaseUrl && envBaseUrl.length > 0
    ? envBaseUrl
    : Platform.OS === 'web'
      ? WEB_FALLBACK
      : NATIVE_FALLBACK

export const API_TIMEOUTS = {
  auth: 60_000,
  logout: 30_000,
  standard: 60_000,
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
    profile: '/auth/update-profile',
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
