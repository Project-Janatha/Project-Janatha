import { useState, useEffect, useCallback, useMemo } from 'react'
import { API_BASE_URL } from '../src/config/api'
import {
  fetchCenters,
  fetchCenter,
  fetchEvent,
  fetchEventsByCenter,
  fetchAllEvents,
  fetchEventUsers,
  attendEvent,
  unattendEvent,
  getUserEvents,
  centersToMapPoints,
  eventsToMapPoints,
  centersToDiscoverCenters,
  MapPoint,
  CenterData,
  EventData,
  EventDisplay,
  DiscoverCenter,
  DiscoverItem,
  DiscoverFilter,
  DISCOVER_SAMPLE_EVENTS,
  DISCOVER_SAMPLE_CENTERS,
  AttendeeInfo,
} from '../utils/api'

export type { DiscoverFilter }
export type { EventDisplay } from '../utils/api'

// ── Sample data (empty since we fetch from API) ────────────

const SAMPLE_CENTERS: MapPoint[] = []

const SAMPLE_EVENTS: MapPoint[] = []

const SAMPLE_EVENT_LIST: EventDisplay[] = []

const SAMPLE_ATTENDEES: { name: string; subtitle: string; image: string }[] = []

const SAMPLE_MESSAGES: { author: string; timestamp: string; text: string; image: string }[] = []

// ── Helper: transform API EventData into EventDisplay ──────────────────

function apiEventToDisplay(e: EventData, _username?: string): EventDisplay {
  const parseDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? null : d
  }
  const parsedDate = parseDate(e.date)
  const dateStr = parsedDate ? parsedDate.toISOString().split('T')[0] : ''
  const timeStr = parsedDate
    ? parsedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : ''

  const display: EventDisplay = {
    id: e.eventID,
    title: e.title || e.description || 'Event',
    date: dateStr,
    time: timeStr,
    location: e.address || 'TBD',
    address: e.address ?? undefined,
    latitude: e.latitude,
    longitude: e.longitude,
    attendees: e.peopleAttending || 0,
    attendeesList: (e as any).attendeesList,
    likes: 0,
    comments: 0,
    description: e.description || undefined,
    pointOfContact: e.pointOfContact ?? undefined,
    image: e.image ?? undefined,
    isRegistered: false, // Determined per-user at call site if needed
    centerId: e.centerID ?? undefined,
    createdBy: e.createdBy ?? undefined,
  }

  // If we have an image URL for the event, ensure it's absolute
  if (display.image && display.image.startsWith('/')) {
    display.image = `${API_BASE_URL}${display.image}`
  }

  return display
}

// ── Helper: fetch all events across centers in parallel ────────────────

async function fetchAllEventsFromCenters(centers: CenterData[]): Promise<EventData[]> {
  const results = await Promise.all(
    centers.map((c) => fetchEventsByCenter(c.centerID).catch(() => [] as EventData[]))
  )
  return results.flat()
}

// ── Hooks ──────────────────────────────────────────────────────────────

export function useMapPoints() {
  const [points, setPoints] = useState<MapPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setError(null)
        const centers = await fetchCenters()
        if (!mounted) return

        const centerPoints = centersToMapPoints(centers)

        if (centerPoints.length > 0) {
          const allEvents = await fetchAllEvents()
          if (!mounted) return

          const eventPoints = eventsToMapPoints(allEvents)
          setPoints([...centerPoints, ...eventPoints])
          setIsLive(true)
        }
      } catch (err: any) {
        if (mounted) {
          const message = err?.message || 'Failed to load map data'
          setError(message)
          if (__DEV__) console.warn('[useMapPoints]', message)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  return { points, loading, isLive, error }
}

export function useEventList() {
  const [events, setEvents] = useState<EventDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setError(null)
        const centers = await fetchCenters()
        if (!mounted) return

        const allApiEvents = await fetchAllEvents()
        if (!mounted) return

        const allEvents = allApiEvents.map((e) => apiEventToDisplay(e))

        if (allEvents.length > 0) {
          // Sort: registered first, then by date
          allEvents.sort((a, b) => {
            if (a.isRegistered !== b.isRegistered) return a.isRegistered ? -1 : 1
            return a.date.localeCompare(b.date)
          })
          setEvents(allEvents)
          setIsLive(true)
        }
      } catch (err: any) {
        if (mounted) {
          const message = err?.message || 'Failed to load events'
          setError(message)
          if (__DEV__) console.warn('[useEventList]', message)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  return { events, loading, isLive, error }
}

export function useEventDetail(eventId: string, username?: string, userId?: string) {
  const [event, setEvent] = useState<EventDisplay | null>(null)
  const [attendees, setAttendees] = useState<
    { name: string; subtitle: string; image?: string; initials: string }[]
  >([])
  const [messages, setMessages] = useState<
    { author: string; timestamp: string; text: string; image: string }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isCreator, setIsCreator] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setError(null)
        const apiEvent = await fetchEvent(eventId)
        if (!mounted) return

        if (apiEvent) {
          // Check if user is the creator
          const userIsCreator = !!(userId && apiEvent.createdBy === userId)

          const display = apiEventToDisplay(apiEvent)
          setEvent(display)
          setIsCreator(userIsCreator)
          setIsLive(true)

          // Fetch attendees and check if current user is registered
          const users = await fetchEventUsers(eventId)
          if (mounted) {
            setAttendees(
              users.map((u) => ({
                name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username,
                subtitle: '',
                image: u.profileImage ?? undefined,
                initials: u.firstName
                  ? `${u.firstName[0]}${u.lastName?.[0] || ''}`.toUpperCase()
                  : u.username.slice(0, 2).toUpperCase(),
              }))
            )
            // Check if current user is in attendees list
            const userIsRegistered = userId ? users.some((u) => u.id === userId) : false
            setIsRegistered(userIsRegistered)
            setEvent((prev) => (prev ? { ...prev, isRegistered: userIsRegistered } : null))
          }
        }
      } catch (err: any) {
        if (mounted) {
          const message = err?.message || 'Failed to load event details'
          setError(message)
          if (__DEV__) console.warn('[useEventDetail]', message)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [eventId, userId])

  const toggleRegistration = useCallback(
    async (_username: string) => {
      if (!event) return
      setIsToggling(true)

      try {
        // Check current registration status directly from API
        const users = await fetchEventUsers(eventId)
        const currentUserInAttendees = users.some((u) => u.id === userId)

        if (currentUserInAttendees) {
          // Already registered - unattend
          await unattendEvent(eventId)
          setIsRegistered(false)
          // Re-fetch attendees after unregistering
          const updatedUsers = await fetchEventUsers(eventId)
          const newAttendeesList = updatedUsers.map((u) => ({
            name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username,
            image: u.profileImage || undefined,
            initials: u.firstName
              ? `${u.firstName[0]}${u.lastName?.[0] || ''}`.toUpperCase()
              : u.username.slice(0, 2).toUpperCase(),
          }))
          setEvent((prev) =>
            prev
              ? {
                  ...prev,
                  isRegistered: false,
                  attendees: updatedUsers.length,
                  attendeesList: newAttendeesList.slice(0, 4),
                }
              : null
          )
          // Also update attendees state
          setAttendees(
            updatedUsers.map((u) => ({
              name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username,
              subtitle: '',
              image: u.profileImage ?? undefined,
              initials: u.firstName
                ? `${u.firstName[0]}${u.lastName?.[0] || ''}`.toUpperCase()
                : u.username.slice(0, 2).toUpperCase(),
            }))
          )
        } else {
          // Not registered - attend
          await attendEvent(eventId)
          setIsRegistered(true)
          // Re-fetch attendees after registering
          const updatedUsers = await fetchEventUsers(eventId)
          const newAttendeesList = updatedUsers.map((u) => ({
            name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username,
            image: u.profileImage || undefined,
            initials: u.firstName
              ? `${u.firstName[0]}${u.lastName?.[0] || ''}`.toUpperCase()
              : u.username.slice(0, 2).toUpperCase(),
          }))
          setEvent((prev) =>
            prev
              ? {
                  ...prev,
                  isRegistered: true,
                  attendees: updatedUsers.length,
                  attendeesList: newAttendeesList.slice(0, 4),
                }
              : null
          )
          // Also update attendees state
          setAttendees(
            updatedUsers.map((u) => ({
              name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username,
              subtitle: '',
              image: u.profileImage ?? undefined,
              initials: u.firstName
                ? `${u.firstName[0]}${u.lastName?.[0] || ''}`.toUpperCase()
                : u.username.slice(0, 2).toUpperCase(),
            }))
          )
        }
      } catch (error: any) {
        // If error says already registered, update UI
        if (error?.message?.includes('Already registered')) {
          setIsRegistered(true)
          setEvent((prev) => (prev ? { ...prev, isRegistered: true } : null))
        }
        throw error
      } finally {
        setIsToggling(false)
      }
    },
    [event, eventId, userId]
  )

  return {
    event,
    attendees,
    messages,
    loading,
    isLive,
    toggleRegistration,
    isToggling,
    isCreator,
    error,
  }
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

const SAMPLE_CENTER_DETAILS: Record<string, CenterDisplay> = {}

const SAMPLE_CENTER_EVENTS: EventDisplay[] = []

export function useCenterDetail(centerId: string) {
  const [center, setCenter] = useState<CenterDisplay | null>(null)
  const [events, setEvents] = useState<EventDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setError(null)
        const [apiCenter, apiEvents] = await Promise.all([
          fetchCenter(centerId),
          fetchEventsByCenter(centerId),
        ])
        if (!mounted) return

        if (apiCenter) {
          setCenter({
            id: centerId,
            name: apiCenter.name || 'Unknown Center',
            image: apiCenter.image || '',
            address: apiCenter.address || '',
            website: apiCenter.website || '',
            phone: apiCenter.phone || '',
            upcomingEvents: apiEvents.length,
            pointOfContact: apiCenter.pointOfContact || '',
            acharya: apiCenter.acharya || '',
          })
          setIsLive(true)
        }

        if (apiEvents.length > 0) {
          setEvents(apiEvents.map((e) => apiEventToDisplay(e)))
        }
      } catch (err: any) {
        if (mounted) {
          const message = err?.message || 'Failed to load center details'
          setError(message)
          if (__DEV__) console.warn('[useCenterDetail]', message)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [centerId])

  return { center, events, loading, isLive, error }
}

// ── My Events hook ──────────────────────────────────────────────────

export function useMyEvents(username: string | undefined) {
  const [events, setEvents] = useState<EventDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!username) {
      setLoading(false)
      return
    }
    setLoading(true)

    try {
      setError(null)
      const apiEvents = await getUserEvents(username)

      if (apiEvents.length > 0) {
        setEvents(
          apiEvents.map((e) => ({
            ...apiEventToDisplay(e, username),
            isRegistered: true,
          }))
        )
        setIsLive(true)
      }
    } catch (err: any) {
      const message = err?.message || 'Failed to load your events'
      setError(message)
      if (__DEV__) console.warn('[useMyEvents]', message)
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    load()
  }, [load])

  return { events, loading, isLive, error, refetch: load }
}

// ── Discover hooks ──────────────────────────────────────────────────

export function useCenterList() {
  const [centers, setCenters] = useState<DiscoverCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setError(null)
        const apiCenters = await fetchCenters()
        if (!mounted) return

        const discoverCenters = centersToDiscoverCenters(apiCenters)
        if (discoverCenters.length > 0) {
          setCenters(discoverCenters)
          setIsLive(true)
        }
      } catch (err: any) {
        if (mounted) {
          const message = err?.message || 'Failed to load centers'
          setError(message)
          if (__DEV__) console.warn('[useCenterList]', message)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  return { centers, loading, isLive, error }
}

export function useDiscoverData(filter: DiscoverFilter, searchQuery: string, userId?: string) {
  const [allEvents, setAllEvents] = useState<EventDisplay[]>([])
  const [allCenters, setAllCenters] = useState<DiscoverCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    // Note: We don't set loading(true) here to avoid jarring UI flickers on focus
    try {
      const apiCenters = await fetchCenters()
      const discoverCenters = centersToDiscoverCenters(apiCenters)
      if (discoverCenters.length > 0) {
        setAllCenters(discoverCenters)
      }

      const allApiEvents = await fetchAllEvents()

      const eventsWithAttendees = await Promise.all(
        allApiEvents.map(async (e) => {
          const users = await fetchEventUsers(e.eventID)
          const attendeesList = users.map((u) => ({
            name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username,
            image: u.profileImage || undefined,
            initials: u.firstName
              ? `${u.firstName[0]}${u.lastName?.[0] || ''}`.toUpperCase()
              : u.username.slice(0, 2).toUpperCase(),
          }))
          const userIsRegistered = userId ? users.some((u) => u.id === userId) : false
          return {
            ...e,
            attendeesList: attendeesList.slice(0, 4),
            isRegistered: userIsRegistered,
            peopleAttending: users.length,
          }
        })
      )

      const fetchedEvents = eventsWithAttendees.map((e) => {
        const display = apiEventToDisplay(e)
        display.attendeesList = e.attendeesList
        display.isRegistered = e.isRegistered
        display.attendees = e.peopleAttending
        return display
      })
      if (fetchedEvents.length > 0) {
        setAllEvents(fetchedEvents)
        setIsLive(true)
      }
    } catch (err: any) {
      const message = err?.message || 'Failed to refresh discover data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const items = useMemo<DiscoverItem[]>(() => {
    const query = searchQuery.toLowerCase().trim()

    let result: DiscoverItem[] = []

    if (filter === 'Centers') {
      result = allCenters.map((c) => ({ type: 'center' as const, data: c }))
    } else if (filter === 'Going') {
      const goingEvents = allEvents
        .filter((e) => e.isRegistered)
        .sort((a, b) => b.date.localeCompare(a.date))
      const memberCenters = allCenters.filter((c) => c.isMember)
      result = [
        ...goingEvents.map((e) => ({ type: 'event' as const, data: e })),
        ...memberCenters.map((c) => ({ type: 'center' as const, data: c })),
      ]
    } else {
      // All: registered events first, then others, then centers
      // Within each group, sort by date descending (upcoming first)
      const sortByDate = (a: EventDisplay, b: EventDisplay) =>
        b.date.localeCompare(a.date)
      const registered = allEvents.filter((e) => e.isRegistered).sort(sortByDate)
      const unregistered = allEvents.filter((e) => !e.isRegistered).sort(sortByDate)

      result = [
        ...registered.map((e) => ({ type: 'event' as const, data: e })),
        ...unregistered.map((e) => ({ type: 'event' as const, data: e })),
        ...allCenters.map((c) => ({ type: 'center' as const, data: c })),
      ]
    }

    // Apply search query
    if (query) {
      result = result.filter((item) => {
        if (item.type === 'event') {
          return (
            item.data.title.toLowerCase().includes(query) ||
            item.data.location.toLowerCase().includes(query)
          )
        }
        return (
          item.data.name.toLowerCase().includes(query) ||
          (item.data.address?.toLowerCase().includes(query) ?? false)
        )
      })
    }

    return result
  }, [allEvents, allCenters, filter, searchQuery])

  // Map points from current data
  const filteredPoints = useMemo<MapPoint[]>(() => {
    const centerPoints: MapPoint[] = allCenters.map((c) => ({
      id: c.id,
      type: 'center' as const,
      name: c.name,
      latitude: c.latitude,
      longitude: c.longitude,
    }))
    const eventPoints: MapPoint[] = allEvents
      .filter((e) => e.latitude != null && e.longitude != null)
      .map((e) => ({
        id: e.id,
        type: 'event' as const,
        name: e.title,
        latitude: e.latitude!,
        longitude: e.longitude!,
      }))

    const allPoints = [...centerPoints, ...eventPoints]

    if (filter === 'Centers') {
      return allPoints.filter((p) => p.type === 'center')
    }
    return allPoints
  }, [allCenters, allEvents, filter])

  const updateEventStatus = useCallback(
    (
      eventId: string,
      isRegistered: boolean,
      attendeesCount: number,
      attendeesList: AttendeeInfo[]
    ) => {
      setAllEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, isRegistered, attendees: attendeesCount, attendeesList } : e
        )
      )
    },
    []
  )

  return {
    items,
    filteredPoints,
    loading,
    isLive,
    error,
    allEvents,
    allCenters,
    refresh,
    updateEventStatus,
  }
}

export { SAMPLE_ATTENDEES, SAMPLE_MESSAGES }
