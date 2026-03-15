import { Platform } from 'react-native'
import { getStoredToken } from '../components/utils/tokenStorage'

// Use local backend in development, production otherwise.
// All endpoint paths passed to apiFetch() are relative (e.g. '/centers'),
// and API_URL already includes the '/api' base path.
const getApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'http://localhost:8787/api'
    }
    // Android emulator uses 10.0.2.2, iOS simulator uses localhost
    return Platform.OS === 'android' ? 'http://10.0.2.2:8787/api' : 'http://localhost:8787/api'
  }
  // In production web, use relative /api (same CF Pages domain)
  // In production native, use full URL
  if (Platform.OS === 'web') {
    return '/api'
  }
  return 'https://chinmaya-janata.pages.dev/api'
}

export const API_URL = getApiUrl()

// ── Types (flat, matching backend API response) ───────────────────────

export interface CenterData {
  centerID: string
  name: string
  latitude: number
  longitude: number
  address: string | null
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
      if (!response.ok) return []
      const data = await response.json()
      return data.centers || []
    } catch {
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
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
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

export async function updateEvent(eventJSON: Record<string, any>): Promise<any> {
  try {
    const response = await authFetch('/updateEvent', {
      method: 'POST',
      body: JSON.stringify({ eventJSON }),
    })
    if (!response.ok) throw new Error('Failed to update event')
    return await response.json()
  } catch (error) {
    throw error
  }
}

export async function getUserEvents(username: string): Promise<EventData[]> {
  try {
    const response = await authFetch('/getUserEvents', {
      method: 'POST',
      body: JSON.stringify({ username }),
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.events || []
  } catch {
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

export const DISCOVER_SAMPLE_EVENTS: EventDisplay[] = __DEV__
  ? [
      {
        id: 'evt-1',
        title: 'Bhagavad Gita Study Circle - Chapter 12',
        date: todayStr,
        time: '10:30 AM - 11:30 AM',
        location: 'Chinmaya Mission San Jose',
        address: '10160 Clayton Rd, San Jose, CA 95127',
        latitude: 37.2631,
        longitude: -121.8031,
        attendees: 14,
        likes: 0,
        comments: 0,
        description: 'Join us for an in-depth study of Chapter 12 of the Bhagavad Gita.',
        pointOfContact: 'Ramesh Ji',
        isRegistered: true,
        centerId: '1',
      },
      {
        id: 'evt-2',
        title: 'Hanuman Chalisa Chanting Marathon',
        date: sundayStr,
        time: '8:00 PM - 11:00 PM',
        location: 'Chinmaya Mission West',
        address: '299 Juanita Way, Sausalito, CA 94965',
        latitude: 37.8699,
        longitude: -122.4756,
        attendees: 28,
        likes: 0,
        comments: 0,
        description: 'Join us for a powerful chanting session of the Hanuman Chalisa.',
        pointOfContact: 'Priya Devi',
        isRegistered: false,
        centerId: '2',
      },
      {
        id: 'evt-3',
        title: 'Yoga and Meditation Session',
        date: tomorrowStr,
        time: '7:00 AM - 8:30 AM',
        location: 'Chinmaya Mission San Francisco',
        address: '1 Sansome St, San Francisco, CA 94104',
        latitude: 37.7849,
        longitude: -122.4094,
        attendees: 9,
        likes: 0,
        comments: 0,
        description: 'Weekly yoga and meditation practice.',
        pointOfContact: 'Anil Kumar',
        isRegistered: true,
        centerId: '3',
      },
      {
        id: 'evt-4',
        title: 'Vedanta for Beginners',
        date: sundayStr,
        time: '9:00 AM - 10:30 AM',
        location: 'Chinmaya Mission San Jose',
        latitude: 37.2531,
        longitude: -121.7931,
        attendees: 12,
        likes: 0,
        comments: 0,
        isRegistered: false,
        centerId: '1',
      },
    ]
  : []

export const DISCOVER_SAMPLE_CENTERS: DiscoverCenter[] = __DEV__
  ? [
      {
        id: '1',
        name: 'Chinmaya Mission San Jose',
        address: '2485 Calle San Lorenzo, San Jose, CA 95125',
        latitude: 37.2431,
        longitude: -121.7831,
        memberCount: 320,
        eventCount: 5,
        isMember: true,
        distanceMi: 2.4,
      },
      {
        id: '2',
        name: 'Chinmaya Mission West',
        address: '625 Hillcrest Road, San Pablo, CA 94806',
        latitude: 37.8599,
        longitude: -122.4856,
        memberCount: 180,
        eventCount: 3,
        isMember: false,
        distanceMi: 18.7,
      },
      {
        id: '3',
        name: 'Chinmaya Mission San Francisco',
        address: '1 Hallidie Plaza, San Francisco, CA 94102',
        latitude: 37.7749,
        longitude: -122.4194,
        memberCount: 95,
        eventCount: 2,
        isMember: false,
        distanceMi: 12.1,
      },
    ]
  : []
