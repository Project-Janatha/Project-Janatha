import { Platform } from 'react-native'
import { getStoredToken } from '../components/utils/tokenStorage'

// Use local backend in development, production otherwise
const getApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'http://localhost:8008'
    }
    // Android emulator uses 10.0.2.2, iOS simulator uses localhost
    return Platform.OS === 'android' ? 'http://10.0.2.2:8008' : 'http://localhost:8008'
  }
  return 'https://app.chinmayajanata.org'
}

export const API_URL = getApiUrl()

// ── Types ──────────────────────────────────────────────────────────────

export interface CenterData {
  centerID: string
  centerObject?: {
    centerName?: string
    location?: { latitude: number; longitude: number }
    memberCount?: number
    isVerified?: boolean
  }
  // Flattened fields for convenience
  name?: string
  latitude?: number
  longitude?: number
}

export interface EventData {
  eventID: string
  centerID?: string
  eventObject?: {
    id?: string
    location?: { latitude: number; longitude: number }
    date?: string
    center?: any
    endorsers?: string[]
    tier?: number
    peopleAttending?: number
    usersAttending?: string[]
    description?: string
    title?: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface MapPoint {
  id: string
  type: 'center' | 'event'
  name: string
  latitude: number
  longitude: number
}

// ── Fetch helpers ──────────────────────────────────────────────────────

async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

async function authFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await getStoredToken()
  return apiFetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

// ── API methods ────────────────────────────────────────────────────────

export async function fetchCenters(): Promise<CenterData[]> {
  try {
    const response = await apiFetch('/api/centers')
    if (!response.ok) return []
    const data = await response.json()
    return data.centers || []
  } catch {
    return []
  }
}

export async function fetchCenter(centerID: string): Promise<CenterData | null> {
  try {
    const response = await apiFetch('/api/fetchCenter', {
      method: 'POST',
      body: JSON.stringify({ centerID }),
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.center || null
  } catch {
    return null
  }
}

export async function fetchEvent(eventID: string): Promise<EventData | null> {
  try {
    const response = await apiFetch('/api/fetchEvent', {
      method: 'POST',
      body: JSON.stringify({ id: eventID }),
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.event || null
  } catch {
    return null
  }
}

export async function fetchEventsByCenter(centerID: string): Promise<EventData[]> {
  try {
    const response = await apiFetch('/api/fetchEventsByCenter', {
      method: 'POST',
      body: JSON.stringify({ centerID }),
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.events || []
  } catch {
    return []
  }
}

export async function fetchEventUsers(eventID: string): Promise<any[]> {
  try {
    const response = await apiFetch('/api/getEventUsers', {
      method: 'POST',
      body: JSON.stringify({ id: eventID }),
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.users || []
  } catch {
    return []
  }
}

// ── Data normalization ─────────────────────────────────────────────────

export function centersToMapPoints(centers: CenterData[]): MapPoint[] {
  return centers
    .filter((c) => {
      const loc = c.centerObject?.location
      return loc?.latitude && loc?.longitude
    })
    .map((c) => ({
      id: c.centerID,
      type: 'center' as const,
      name: c.centerObject?.centerName || 'Unknown Center',
      latitude: c.centerObject!.location!.latitude,
      longitude: c.centerObject!.location!.longitude,
    }))
}

export function eventsToMapPoints(events: EventData[]): MapPoint[] {
  return events
    .filter((e) => {
      const loc = e.eventObject?.location
      return loc?.latitude && loc?.longitude
    })
    .map((e) => ({
      id: e.eventID,
      type: 'event' as const,
      name: e.eventObject?.title || e.eventObject?.description || 'Event',
      latitude: e.eventObject!.location!.latitude,
      longitude: e.eventObject!.location!.longitude,
    }))
}
