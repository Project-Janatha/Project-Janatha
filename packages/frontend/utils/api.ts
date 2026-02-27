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

export async function updateEvent(eventJSON: Record<string, any>): Promise<any> {
  try {
    const response = await authFetch('/api/updateEvent', {
      method: 'POST',
      body: JSON.stringify(eventJSON),
    })
    if (!response.ok) throw new Error('Failed to update event')
    return await response.json()
  } catch (error) {
    throw error
  }
}

export async function getUserEvents(username: string): Promise<EventData[]> {
  try {
    const response = await authFetch('/api/getUserEvents', {
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

export function centersToDiscoverCenters(centers: CenterData[]): DiscoverCenter[] {
  return centers
    .filter((c) => {
      const loc = c.centerObject?.location
      return loc?.latitude && loc?.longitude
    })
    .map((c) => ({
      id: c.centerID,
      name: c.centerObject?.centerName || 'Unknown Center',
      latitude: c.centerObject!.location!.latitude,
      longitude: c.centerObject!.location!.longitude,
      memberCount: c.centerObject?.memberCount,
    }))
}

// ── Discover sample data (fallback) ────────────────────────────────────

const today = new Date()
const todayStr = today.toISOString().split('T')[0]

const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const tomorrowStr = tomorrow.toISOString().split('T')[0]

const sunday = new Date(today)
sunday.setDate(today.getDate() + ((7 - today.getDay()) % 7 || 7))
const sundayStr = sunday.toISOString().split('T')[0]

export const DISCOVER_SAMPLE_EVENTS: EventDisplay[] = [
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

export const DISCOVER_SAMPLE_CENTERS: DiscoverCenter[] = [
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
