import { useState, useEffect, useCallback } from 'react'
import {
  fetchCenters,
  fetchCenter,
  fetchEvent,
  fetchEventsByCenter,
  fetchEventUsers,
  updateEvent,
  getUserEvents,
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
  const [isToggling, setIsToggling] = useState(false)
  const [usersAttending, setUsersAttending] = useState<string[]>([])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        // Try to fetch from backend
        const apiEvent = await fetchEvent(eventId)
        if (!mounted) return

        if (apiEvent?.eventObject) {
          const obj = apiEvent.eventObject
          const attending = obj.usersAttending || []
          setUsersAttending(attending)
          setEvent({
            id: eventId,
            title: obj.title || obj.description || 'Event',
            time: obj.date ? new Date(obj.date).toLocaleString() : '',
            location: obj.center?.centerName || 'TBD',
            address: '',
            attendees: obj.peopleAttending || attending.length,
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

  const toggleRegistration = useCallback(async (username: string) => {
    if (!event) return
    setIsToggling(true)

    try {
      const isCurrentlyRegistered = usersAttending.includes(username)
      const newAttending = isCurrentlyRegistered
        ? usersAttending.filter((u) => u !== username)
        : [...usersAttending, username]

      await updateEvent({
        id: eventId,
        eventObject: { usersAttending: newAttending },
      })

      setUsersAttending(newAttending)
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              isRegistered: !isCurrentlyRegistered,
              attendees: newAttending.length,
            }
          : null
      )
    } catch (error) {
      throw error
    } finally {
      setIsToggling(false)
    }
  }, [event, eventId, usersAttending])

  return { event, attendees, messages, loading, isLive, toggleRegistration, isToggling }
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

// ── Center detail data ──────────────────────────────────────────────────

export interface CenterDisplay {
  id: string
  name: string
  image: string
  address: string
  website: string
  phone: string
  upcomingEvents: number
  pointOfContact: string
  acharya: string
}

const SAMPLE_CENTER_DETAILS: Record<string, CenterDisplay> = {
  '1': {
    id: '1',
    name: 'Chinmaya Mission San Jose',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=250&fit=crop',
    address: '10160 Clayton Rd, San Jose, CA 95127',
    website: 'https://www.cmsj.org/',
    phone: '+1 408 254 8392',
    upcomingEvents: 24,
    pointOfContact: 'Ramesh Ji',
    acharya: 'Acharya Brahmachari Soham Ji',
  },
  '2': {
    id: '2',
    name: 'Chinmaya Mission West',
    image: 'https://images.unsplash.com/photo-1464822759844-d150baec93d5?w=400&h=250&fit=crop',
    address: '560 Bridgeway, Sausalito, CA 94965',
    website: 'https://www.chinmayamissionwest.org/',
    phone: '+1 415 332 2182',
    upcomingEvents: 18,
    pointOfContact: 'Priya Ji',
    acharya: 'Acharya Swami Ishwarananda',
  },
  '3': {
    id: '3',
    name: 'Chinmaya Mission San Francisco',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
    address: '631 Irving St, San Francisco, CA 94122',
    website: 'https://www.chinmayasf.org/',
    phone: '+1 415 661 8499',
    upcomingEvents: 15,
    pointOfContact: 'Anjali Ji',
    acharya: 'Acharya Swami Tejomayananda',
  },
}

const SAMPLE_CENTER_EVENTS: EventDisplay[] = [
  {
    id: '1',
    title: 'Bhagavad Gita Study Circle - Chapter 12',
    time: 'TODAY \u2022 10:30 AM - 11:30 AM',
    location: 'Young Museum',
    attendees: 14,
    likes: 0,
    comments: 0,
  },
  {
    id: '2',
    title: 'Hanuman Chalisa Chanting Marathon',
    time: 'SUN, 8 PM - 11:49 PM',
    location: 'Meditation Hall',
    attendees: 14,
    likes: 0,
    comments: 0,
  },
  {
    id: '3',
    title: 'Yoga and Meditation Session',
    time: 'TUE, 7 PM - 8:30 PM',
    location: 'Main Hall',
    attendees: 8,
    likes: 2,
    comments: 1,
  },
]

export function useCenterDetail(centerId: string) {
  const [center, setCenter] = useState<CenterDisplay | null>(null)
  const [events, setEvents] = useState<EventDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const [apiCenter, apiEvents] = await Promise.all([
          fetchCenter(centerId),
          fetchEventsByCenter(centerId),
        ])
        if (!mounted) return

        if (apiCenter?.centerObject) {
          const obj = apiCenter.centerObject
          setCenter({
            id: centerId,
            name: obj.centerName || 'Unknown Center',
            image: SAMPLE_CENTER_DETAILS[centerId]?.image || '',
            address: SAMPLE_CENTER_DETAILS[centerId]?.address || '',
            website: SAMPLE_CENTER_DETAILS[centerId]?.website || '',
            phone: SAMPLE_CENTER_DETAILS[centerId]?.phone || '',
            upcomingEvents: apiEvents.length,
            pointOfContact: SAMPLE_CENTER_DETAILS[centerId]?.pointOfContact || '',
            acharya: SAMPLE_CENTER_DETAILS[centerId]?.acharya || '',
          })
          setIsLive(true)
        } else {
          setCenter(SAMPLE_CENTER_DETAILS[centerId] || null)
        }

        if (apiEvents.length > 0) {
          setEvents(apiEvents.map((e) => ({
            id: e.eventID,
            title: e.eventObject?.title || e.eventObject?.description || 'Event',
            time: e.eventObject?.date ? new Date(e.eventObject.date).toLocaleString() : '',
            location: e.eventObject?.center?.centerName || 'TBD',
            attendees: e.eventObject?.peopleAttending || 0,
            likes: 0,
            comments: 0,
          })))
        } else {
          setEvents(SAMPLE_CENTER_EVENTS)
        }
      } catch {
        if (mounted) {
          setCenter(SAMPLE_CENTER_DETAILS[centerId] || null)
          setEvents(SAMPLE_CENTER_EVENTS)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [centerId])

  return { center, events, loading, isLive }
}

// ── My Events hook ──────────────────────────────────────────────────

export function useMyEvents(username: string | undefined) {
  const [events, setEvents] = useState<EventDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  const load = useCallback(async () => {
    if (!username) {
      setLoading(false)
      return
    }
    setLoading(true)

    try {
      const apiEvents = await getUserEvents(username)

      if (apiEvents.length > 0) {
        setEvents(apiEvents.map((e) => ({
          id: e.eventID,
          title: e.eventObject?.title || e.eventObject?.description || 'Event',
          time: e.eventObject?.date ? new Date(e.eventObject.date).toLocaleString() : '',
          location: e.eventObject?.center?.centerName || 'TBD',
          attendees: e.eventObject?.peopleAttending || 0,
          likes: 0,
          comments: 0,
          description: e.eventObject?.description,
          isRegistered: true,
        })))
        setIsLive(true)
      } else {
        // Fallback to sample registered events
        setEvents(SAMPLE_EVENT_LIST.filter((e) => e.isRegistered))
      }
    } catch {
      setEvents(SAMPLE_EVENT_LIST.filter((e) => e.isRegistered))
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => { load() }, [load])

  return { events, loading, isLive, refetch: load }
}

export { SAMPLE_ATTENDEES, SAMPLE_MESSAGES, SAMPLE_EVENT_LIST, SAMPLE_CENTERS, SAMPLE_EVENTS }
