import { useState, useEffect, useCallback } from 'react'
import {
  fetchCenters,
  fetchEvent,
  fetchEventsByCenter,
  fetchEventUsers,
  centersToMapPoints,
  eventsToMapPoints,
  MapPoint,
  CenterData,
  EventData,
} from '../utils/api'

// ── Sample data (fallback when API returns empty) ──────────────────────

const SAMPLE_CENTERS: MapPoint[] = [
  { id: '1', type: 'center', name: 'Chinmaya Mission San Jose', latitude: 37.2431, longitude: -121.7831 },
  { id: '2', type: 'center', name: 'Chinmaya Mission West', latitude: 37.8599, longitude: -122.4856 },
  { id: '3', type: 'center', name: 'Chinmaya Mission San Francisco', latitude: 37.7749, longitude: -122.4194 },
]

const SAMPLE_EVENTS: MapPoint[] = [
  { id: 'evt-1', type: 'event', name: 'Bhagavad Gita Study Circle', latitude: 37.2631, longitude: -121.8031 },
  { id: 'evt-2', type: 'event', name: 'Hanuman Chalisa Chanting', latitude: 37.8699, longitude: -122.4756 },
  { id: 'evt-3', type: 'event', name: 'Yoga and Meditation Session', latitude: 37.7849, longitude: -122.4094 },
]

export interface EventDisplay {
  id: string
  title: string
  time: string
  location: string
  address?: string
  attendees: number
  likes: number
  comments: number
  description?: string
  pointOfContact?: string
  image?: string
  isRegistered?: boolean
  centerName?: string
}

const SAMPLE_EVENT_LIST: EventDisplay[] = [
  {
    id: '1',
    title: 'Bhagavad Gita Study Circle - Chapter 12',
    time: 'TODAY \u2022 10:30 AM - 11:30 AM',
    location: 'Chinmaya Mission San Jose',
    address: '10160 Clayton Rd, San Jose, CA 95127',
    attendees: 14,
    likes: 0,
    comments: 0,
    description: 'Join us for an in-depth study of Chapter 12 of the Bhagavad Gita, focusing on Bhakti Yoga and the path of devotion.',
    pointOfContact: 'Ramesh Ji',
    isRegistered: true,
  },
  {
    id: '2',
    title: 'Hanuman Chalisa Chanting Marathon',
    time: 'SUN, 8 PM - 11:49 PM',
    location: 'Chinmaya Mission West',
    address: '299 Juanita Way, Sausalito, CA 94965',
    attendees: 14,
    likes: 0,
    comments: 0,
    description: 'Join us for a powerful chanting session of the Hanuman Chalisa.',
    pointOfContact: 'Priya Devi',
    isRegistered: false,
  },
  {
    id: '3',
    title: 'Yoga and Meditation Session',
    time: 'SAT, 9 AM - 10:30 AM',
    location: 'Chinmaya Mission San Francisco',
    address: '1 Sansome St, San Francisco, CA 94104',
    attendees: 8,
    likes: 0,
    comments: 0,
    description: 'Weekly yoga and meditation practice for beginners and advanced practitioners.',
    pointOfContact: 'Anil Kumar',
    isRegistered: false,
  },
]

const SAMPLE_ATTENDEES = [
  { name: 'Theresa Hebert', subtitle: 'Design manager @Setproduct', image: 'https://i.pravatar.cc/100?img=1' },
  { name: 'Jessica Chlen', subtitle: 'Chief Design Officer', image: 'https://i.pravatar.cc/100?img=5' },
  { name: 'Diana Shelton', subtitle: 'Senior UX designer', image: 'https://i.pravatar.cc/100?img=9' },
  { name: 'Annie Huy Long', subtitle: 'Digital designer & Motion expert', image: 'https://i.pravatar.cc/100?img=16' },
  { name: 'Morgan Melendez', subtitle: 'Community Organizer', image: 'https://i.pravatar.cc/100?img=20' },
]

const SAMPLE_MESSAGES = [
  { author: 'Jessica Chlen', timestamp: '3:30PM \u00b7 19 August 2025', text: 'Thank you everyone who could attend!', image: 'https://i.pravatar.cc/100?img=5' },
  { author: 'Jessica Chlen', timestamp: '9:20AM \u00b7 18 August 2025', text: 'We will be meeting on the 14th floor.', image: 'https://i.pravatar.cc/100?img=5' },
]

// ── Hooks ──────────────────────────────────────────────────────────────

export function useMapPoints() {
  const [points, setPoints] = useState<MapPoint[]>([...SAMPLE_CENTERS, ...SAMPLE_EVENTS])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const centers = await fetchCenters()
        if (!mounted) return

        const centerPoints = centersToMapPoints(centers)

        if (centerPoints.length > 0) {
          // Real data available - use it
          setPoints([...centerPoints])
          setIsLive(true)
        }
        // else: keep sample data
      } catch {
        // Keep sample data on error
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return { points, loading, isLive }
}

export function useEventList() {
  const [events, setEvents] = useState<EventDisplay[]>(SAMPLE_EVENT_LIST)
  const [loading, setLoading] = useState(false)
  const [isLive, setIsLive] = useState(false)

  // Events will be populated from real API once backend has data
  // For now, returns sample events

  return { events, loading, isLive }
}

export function useEventDetail(eventId: string) {
  const [event, setEvent] = useState<EventDisplay | null>(null)
  const [attendees, setAttendees] = useState(SAMPLE_ATTENDEES)
  const [messages, setMessages] = useState(SAMPLE_MESSAGES)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        // Try to fetch from backend
        const apiEvent = await fetchEvent(eventId)
        if (!mounted) return

        if (apiEvent?.eventObject) {
          const obj = apiEvent.eventObject
          setEvent({
            id: eventId,
            title: obj.title || obj.description || 'Event',
            time: obj.date ? new Date(obj.date).toLocaleString() : '',
            location: obj.center?.centerName || 'TBD',
            address: '',
            attendees: obj.peopleAttending || 0,
            likes: 0,
            comments: 0,
            description: obj.description,
            isRegistered: false,
          })
          setIsLive(true)

          // Fetch real attendees
          const users = await fetchEventUsers(eventId)
          if (users.length > 0 && mounted) {
            setAttendees(users.map((u: any) => ({
              name: u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.username,
              subtitle: '',
              image: u.profileImage || `https://i.pravatar.cc/100?u=${u.username}`,
            })))
          }
        } else {
          // Use sample data
          const sample = SAMPLE_EVENT_LIST.find((e) => e.id === eventId) || SAMPLE_EVENT_LIST[0]
          setEvent(sample)
        }
      } catch {
        // Fallback to sample
        const sample = SAMPLE_EVENT_LIST.find((e) => e.id === eventId) || SAMPLE_EVENT_LIST[0]
        if (mounted) setEvent(sample)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [eventId])

  return { event, attendees, messages, loading, isLive }
}

export function useWeekCalendar() {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - dayOfWeek)

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d.getDate()
  })
  const today = now.getDate()

  return { weekDays, weekDates, today }
}

export { SAMPLE_ATTENDEES, SAMPLE_MESSAGES, SAMPLE_EVENT_LIST, SAMPLE_CENTERS, SAMPLE_EVENTS }
