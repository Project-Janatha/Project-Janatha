import { getStoredToken } from '../components/utils/tokenStorage'
import { API_BASE_URL } from '../src/config/api'

export const API_URL = API_BASE_URL

// ── Types (flat, matching backend API response) ───────────────────────

export interface CenterData {
  centerID: string
  name: string
  latitude: number
  longitude: number
  address: string | null
  website: string | null
  phone: string | null
  image: string | null
  acharya: string | null
  pointOfContact: string | null
  memberCount: number
  isVerified: boolean
  createdAt?: string
  updatedAt?: string
}

export interface EventData {
  eventID: string
  title: string
  description: string
  date: string
  latitude: number
  longitude: number
  address: string | null
  centerID: string | null
  tier: number
  peopleAttending: number
  pointOfContact: string | null
  image: string | null
  category: number | null
  createdBy: string | null
  createdAt?: string
  updatedAt?: string
}

export interface UserData {
  id: string
  username: string
  email: string | null
  firstName: string
  lastName: string
  dateOfBirth: string | null
  phoneNumber: string | null
  profileImage: string | null
  centerID: string | null
  points: number
  isVerified: boolean
  verificationLevel: number
  isActive: boolean
  profileComplete: boolean
  interests: string[] | null
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

// ── Discover-specific types ─────────────────────────────────────────────

export interface EventDisplay {
  id: string
  title: string
  date: string     // ISO date string e.g. "2025-03-15"
  time: string     // display string e.g. "10:30 AM - 11:30 AM"
  location: string
  address?: string
  latitude?: number
  longitude?: number
  attendees: number
  likes: number
  comments: number
  description?: string
  pointOfContact?: string
  image?: string
  isRegistered?: boolean
  centerName?: string
  centerId?: string
  createdBy?: string
}

export interface DiscoverCenter {
  id: string
  name: string
  address?: string
  latitude: number
  longitude: number
  memberCount?: number
  eventCount?: number
  isMember?: boolean
  distanceMi?: number
}

export type DiscoverItem =
  | { type: 'event'; data: EventDisplay }
  | { type: 'center'; data: DiscoverCenter }

export type DiscoverFilter = 'All' | 'Going' | 'Centers'

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

// ── Request deduplication cache for fetchCenters ───────────────────────

let _centersPromise: Promise<CenterData[]> | null = null
let _centersTimestamp = 0
const CENTERS_CACHE_TTL = 30_000 // 30 seconds

export async function fetchCenters(): Promise<CenterData[]> {
  const now = Date.now()

  // Return cached promise if still fresh
  if (_centersPromise && now - _centersTimestamp < CENTERS_CACHE_TTL) {
    return _centersPromise
  }

  _centersTimestamp = now
  _centersPromise = (async () => {
    try {
      const response = await apiFetch('/centers')
      if (!response.ok) {
        if (__DEV__) console.warn('[fetchCenters] Response not ok:', response.status)
        return []
      }
      const data = await response.json()
      if (__DEV__) console.log('[fetchCenters] Got', data.centers?.length || 0, 'centers')
      return data.centers || []
    } catch (err: any) {
      if (__DEV__) console.warn('[fetchCenters]', err?.message || err)
      _centersPromise = null // Clear on error so next call retries
      return []
    }
  })()

  return _centersPromise
}

/** Invalidate the centers cache (e.g. after adding a center) */
export function invalidateCentersCache(): void {
  _centersPromise = null
  _centersTimestamp = 0
}

// ── API methods ────────────────────────────────────────────────────────

export async function fetchCenter(centerID: string): Promise<CenterData | null> {
  try {
    const response = await apiFetch('/fetchCenter', {
      method: 'POST',
      body: JSON.stringify({ centerID }),
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.center || null
  } catch (err: any) {
    if (__DEV__) console.warn('[fetchCenter]', err?.message || err)
    return null
  }
}

export async function fetchEvent(eventID: string): Promise<EventData | null> {
  try {
    const response = await apiFetch('/fetchEvent', {
      method: 'POST',
      body: JSON.stringify({ id: eventID }),
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.event || null
  } catch (err: any) {
    if (__DEV__) console.warn('[fetchEvent]', err?.message || err)
    return null
  }
}

export async function fetchEventsByCenter(centerID: string): Promise<EventData[]> {
  try {
    const response = await apiFetch('/fetchEventsByCenter', {
      method: 'POST',
      body: JSON.stringify({ centerID }),
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.events || []
  } catch (err: any) {
    if (__DEV__) console.warn('[fetchEventsByCenter]', err?.message || err)
    return []
  }
}

export async function fetchAllEvents(): Promise<EventData[]> {
  try {
    if (__DEV__) console.log('[fetchAllEvents] Calling API...')
    const response = await apiFetch('/fetchAllEvents')
    if (!response.ok) {
      if (__DEV__) console.warn('[fetchAllEvents] Response not ok:', response.status)
      return []
    }
    const data = await response.json()
    if (__DEV__) console.log('[fetchAllEvents] Got events:', data.events?.length || 0)
    return data.events || []
  } catch (err: any) {
    if (__DEV__) console.warn('[fetchAllEvents]', err?.message || err)
    return []
  }
}

export async function fetchEventUsers(eventID: string): Promise<UserData[]> {
  try {
    const response = await apiFetch('/getEventUsers', {
      method: 'POST',
      body: JSON.stringify({ id: eventID }),
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.users || []
  } catch (err: any) {
    if (__DEV__) console.warn('[fetchEventUsers]', err?.message || err)
    return []
  }
}

export async function attendEvent(eventID: string): Promise<{ peopleAttending: number }> {
  const response = await authFetch('/attendEvent', {
    method: 'POST',
    body: JSON.stringify({ eventID }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Failed to attend event' }))
    throw new Error(err.message || 'Failed to attend event')
  }
  return response.json()
}

export async function unattendEvent(eventID: string): Promise<{ peopleAttending: number }> {
  const response = await authFetch('/unattendEvent', {
    method: 'POST',
    body: JSON.stringify({ eventID }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Failed to unattend event' }))
    throw new Error(err.message || 'Failed to unattend event')
  }
  return response.json()
}

export async function createEvent(data: {
  title: string
  description: string
  date: string
  latitude: number
  longitude: number
  address?: string
  centerID: string
  pointOfContact?: string
  image?: string
  category?: number
}): Promise<{ id: string; tier: number }> {
  const response = await authFetch('/addEvent', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Failed to create event' }))
    throw new Error(err.message || 'Failed to create event')
  }
  return response.json()
}

export async function updateEvent(eventJSON: Record<string, any>): Promise<any> {
  const response = await authFetch('/updateEvent', {
    method: 'POST',
    body: JSON.stringify({ eventJSON }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Failed to update event' }))
    throw new Error(err.message || 'Failed to update event')
  }
  return response.json()
}

export async function getUserEvents(username: string): Promise<EventData[]> {
  try {
    if (__DEV__) console.log('[getUserEvents] Calling for:', username)
    const response = await authFetch('/getUserEvents', {
      method: 'POST',
      body: JSON.stringify({ username }),
    })
    if (!response.ok) {
      if (__DEV__) console.warn('[getUserEvents] Response not ok:', response.status)
      return []
    }
    const data = await response.json()
    if (__DEV__) console.log('[getUserEvents] Got events:', data.events?.length || 0)
    return data.events || []
  } catch (err: any) {
    if (__DEV__) console.warn('[getUserEvents]', err?.message || err)
    return []
  }
}

// ── Data normalization (flat fields) ──────────────────────────────────

export function centersToMapPoints(centers: CenterData[]): MapPoint[] {
  return centers
    .filter((c) => c.latitude && c.longitude)
    .map((c) => ({
      id: c.centerID,
      type: 'center' as const,
      name: c.name || 'Unknown Center',
      latitude: c.latitude,
      longitude: c.longitude,
    }))
}

export function eventsToMapPoints(events: EventData[]): MapPoint[] {
  return events
    .filter((e) => e.latitude && e.longitude)
    .map((e) => ({
      id: e.eventID,
      type: 'event' as const,
      name: e.title || e.description || 'Event',
      latitude: e.latitude,
      longitude: e.longitude,
    }))
}

export function centersToDiscoverCenters(centers: CenterData[]): DiscoverCenter[] {
  return centers
    .filter((c) => c.latitude && c.longitude)
    .map((c) => ({
      id: c.centerID,
      name: c.name || 'Unknown Center',
      address: c.address ?? undefined,
      latitude: c.latitude,
      longitude: c.longitude,
      memberCount: c.memberCount,
    }))
}

// ── Discover sample data (fallback, dev only) ──────────────────────────

const today = new Date()
const todayStr = today.toISOString().split('T')[0]

const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const tomorrowStr = tomorrow.toISOString().split('T')[0]

const sunday = new Date(today)
sunday.setDate(today.getDate() + ((7 - today.getDay()) % 7 || 7))
const sundayStr = sunday.toISOString().split('T')[0]

export const DISCOVER_SAMPLE_EVENTS: EventDisplay[] = []

export const DISCOVER_SAMPLE_CENTERS: DiscoverCenter[] = []
