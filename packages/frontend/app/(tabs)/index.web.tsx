// Discover tab — web desktop layout
import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  lazy,
  Suspense,
  use,
} from 'react'
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { MapPin, Search, Building2, Users, ChevronUp, Plus } from 'lucide-react-native'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useThemeContext, useUser } from '../../components/contexts'
import { FilterChip, Badge, UnderlineTabBar, Avatar } from '../../components/ui'
const Map = lazy(() => import('../../components/Map'))
import MapPopover from '../../components/MapPopover'
import {
  useDiscoverData,
  useEventDetail,
  useCenterDetail,
  type DiscoverFilter,
} from '../../hooks/useApiData'
import EventDetailPanel from '../../components/web/EventDetailPanel'
import EventFormPanel from '../../components/web/EventFormPanel'
import CenterDetailPanel from '../../components/web/CenterDetailPanel'
import { useDetailColors } from '../../hooks/useDetailColors'
import type { MapPoint, EventDisplay, DiscoverCenter, AttendeeInfo } from '../../utils/api'
import { WeekCalendar } from '../../components'

const ADMIN_NAME = 'brahman'
const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost'

const FILTERS: { label: DiscoverFilter }[] = [
  { label: 'All' },
  { label: 'Going' },
  { label: 'Centers' },
]

function formatDatePill(dateStr: string): { month: string; day: string } {
  const d = new Date(dateStr + 'T00:00:00')
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = String(d.getDate())
  return { month, day }
}

function isToday(dateStr: string): boolean {
  const today = new Date()
  return dateStr === today.toISOString().split('T')[0]
}

// ── Placeholder avatar dots for attendee count ──────────

const AVATAR_COLORS = ['#E8862A', '#78716C', '#A8A29E', '#D6D3D1']

function AttendeeAvatars({ count, attendees }: { count: number; attendees?: AttendeeInfo[] }) {
  if (count <= 0) return null
  const shown = Math.min(count, 4)
  if (__DEV__) console.log('[AttendeeAvatars web] count:', count, 'attendees:', attendees)
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={{ flexDirection: 'row' }}>
        {attendees && attendees.length > 0
          ? attendees.slice(0, shown).map((attendee, i) => (
              <Avatar
                key={i}
                image={attendee.image}
                initials={attendee.initials}
                name={attendee.name}
                size={18}
                style={{
                  marginLeft: i === 0 ? 0 : -6,
                  borderWidth: 1.5,
                  borderColor: 'white',
                }}
              />
            ))
          : Array.from({ length: shown }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  marginLeft: i === 0 ? 0 : -6,
                  borderWidth: 1.5,
                  borderColor: 'white',
                }}
              />
            ))}
      </View>
      <Text className="text-stone-400 dark:text-stone-500 font-inter text-xs">{count} going</Text>
    </View>
  )
}

// ─── Event Item (Desktop) ───────────────────────────────

function EventItem({ event, onPress }: { event: EventDisplay; onPress: () => void }) {
  const { month, day } = event.date ? formatDatePill(event.date) : { month: '', day: '' }

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row gap-4 p-4 rounded-2xl active:opacity-80 border border-transparent hover:border-stone-200 dark:hover:border-neutral-700 ${
        event.isRegistered
          ? 'bg-orange-50/80 dark:bg-orange-950/20'
          : 'bg-white dark:bg-neutral-900'
      }`}
      style={{ minHeight: 72 }}
    >
      {/* Date pill */}
      <View className="w-[52px] h-[60px] rounded-xl items-center justify-center bg-stone-100 dark:bg-neutral-800">
        <Text className="text-[10px] font-inter-semibold" style={{ color: '#E8862A' }}>
          {month}
        </Text>
        <Text className="text-lg font-inter-bold text-content dark:text-content-dark">{day}</Text>
      </View>

      {/* Content */}
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text
            className="text-content dark:text-content-dark font-inter-semibold text-base leading-tight flex-1"
            numberOfLines={2}
          >
            {event.title}
          </Text>
          {event.isRegistered && <Badge label="Going" variant="going" />}
        </View>
        <Text className="text-stone-500 dark:text-stone-400 font-inter text-sm">
          {event.date && isToday(event.date) ? 'Today' : month + ' ' + day}
          {event.time ? ' · ' + event.time : ''}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <MapPin size={12} color="#E8862A" />
          <Text
            className="text-stone-500 dark:text-stone-400 font-inter text-sm flex-1"
            numberOfLines={1}
          >
            {event.location}
          </Text>
        </View>
        <View style={{ marginTop: 4 }}>
          <AttendeeAvatars count={event.attendees} attendees={event.attendeesList} />
        </View>
      </View>
    </Pressable>
  )
}

// ─── Center Item (Desktop) ──────────────────────────────

function CenterItem({ center, onPress }: { center: DiscoverCenter; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row gap-4 p-4 rounded-2xl active:opacity-80 border border-transparent hover:border-stone-200 dark:hover:border-neutral-700 ${
        center.isMember ? 'bg-orange-50/80 dark:bg-orange-950/20' : 'bg-white dark:bg-neutral-900'
      }`}
      style={{ minHeight: 72 }}
    >
      {/* Icon pill */}
      <View className="w-[52px] h-[60px] rounded-xl bg-orange-100 dark:bg-orange-900/30 items-center justify-center">
        <Building2 size={22} color="#9A3412" />
      </View>

      {/* Content */}
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text
            className="text-content dark:text-content-dark font-inter-semibold text-base leading-tight flex-1"
            numberOfLines={1}
          >
            {center.name}
          </Text>
          {center.isMember && <Badge label="Member" variant="member" />}
        </View>
        <Text className="text-stone-500 dark:text-stone-400 font-inter text-sm">
          Center{center.distanceMi != null ? ` · ${center.distanceMi} mi` : ''}
        </Text>
        {center.eventCount != null && center.eventCount > 0 && (
          <Text className="text-primary font-inter text-xs">
            {center.eventCount} events this week
          </Text>
        )}
      </View>
    </Pressable>
  )
}

// ─── Detail Panel Wrapper (for side panel) ──────────────

function DetailPanelWrapper({
  selectedItem,
  onClose,
  onEventPress,
  onEditEvent,
  onStatusChange,
}: {
  selectedItem: { type: 'event' | 'center'; id: string }
  onClose: () => void
  onEventPress: (id: string) => void
  onEditEvent?: (id: string) => void
  onStatusChange?: (id: string, registered: boolean, count: number) => void
}) {
  if (selectedItem.type === 'event') {
    return (
      <EventPanelInner
        eventId={selectedItem.id}
        onClose={onClose}
        onEdit={onEditEvent}
        onStatusChange={onStatusChange}
      />
    )
  }
  return (
    <CenterPanelInner centerId={selectedItem.id} onClose={onClose} onEventPress={onEventPress} />
  )
}

function EventPanelInner({
  eventId,
  onClose,
  onEdit,
  onStatusChange,
}: {
  eventId: string
  onClose: () => void
  onEdit?: (id: string) => void
  onStatusChange?: (
    id: string,
    registered: boolean,
    count: number,
    attendeesList: AttendeeInfo[]
  ) => void
}) {
  const { user } = useUser()
  const { event, attendees, messages, loading, toggleRegistration, isToggling } = useEventDetail(
    eventId,
    user?.username,
    user?.id
  )
  const colors = useDetailColors()
  const isAdmin = user?.username === ADMIN_NAME
  const canEdit = isAdmin || isLocal

  // Propogate registration status change back to discover list
  const prevRegisteredRef = useRef<boolean | undefined>(undefined)
  useEffect(() => {
    if (!event) return
    if (prevRegisteredRef.current === undefined) {
      prevRegisteredRef.current = event.isRegistered
      return
    }
    if (event.isRegistered !== prevRegisteredRef.current) {
      onStatusChange?.(
        event.id,
        event.isRegistered || false,
        event.attendees || 0,
        event.attendeesList || []
      )
      prevRegisteredRef.current = event.isRegistered
    }
  }, [event?.isRegistered, event?.attendees, attendees, onStatusChange])

  const handleToggleRegistration = async () => {
    if (!user?.username) return
    try {
      await toggleRegistration(user.username)
    } catch (err: any) {
      if (__DEV__) console.warn('[EventPanel] toggleRegistration failed:', err?.message || err)
    }
  }

  if (loading || !event) {
    return (
      <View
        style={{
          width: 440,
          height: '100%',
          backgroundColor: colors.panelBg,
          borderLeftWidth: 1,
          borderLeftColor: colors.border,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#E8862A" />
      </View>
    )
  }

  const isPast = event.date ? new Date(event.date + 'T23:59:59') < new Date() : false

  return (
    <EventDetailPanel
      event={event}
      attendees={attendees}
      messages={messages}
      isPast={isPast}
      isAdmin={isAdmin}
      onClose={onClose}
      onToggleRegistration={handleToggleRegistration}
      isToggling={isToggling}
      onEdit={canEdit ? onEdit : undefined}
    />
  )
}

function CenterPanelInner({
  centerId,
  onClose,
  onEventPress,
}: {
  centerId: string
  onClose: () => void
  onEventPress: (id: string) => void
}) {
  const { center, events, loading } = useCenterDetail(centerId)
  const colors = useDetailColors()

  if (loading || !center) {
    return (
      <View
        style={{
          width: 440,
          height: '100%',
          backgroundColor: colors.panelBg,
          borderLeftWidth: 1,
          borderLeftColor: colors.border,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#E8862A" />
      </View>
    )
  }

  return (
    <CenterDetailPanel
      center={center}
      events={events}
      onClose={onClose}
      onEventPress={onEventPress}
    />
  )
}

// ─── Mobile Discover (map + CSS bottom sheet) ──────────

type SheetSnap = 'collapsed' | 'mid' | 'expanded'

function MobileDiscoverFallback() {
  const router = useRouter()
  const { isDark } = useThemeContext()
  const [activeFilter, setActiveFilter] = useState<DiscoverFilter>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { user } = useUser()
  const { items, filteredPoints, loading, allEvents, refresh } = useDiscoverData(
    activeFilter,
    searchQuery,
    user?.id
  )

  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [refresh])
  )

  // Bottom sheet state
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>('mid')
  const [sheetTranslateY, setSheetTranslateY] = useState<number | null>(null)
  const dragStartY = useRef(0)
  const dragStartTranslate = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sheet snap positions (percentage from top of container)
  const getSnapPositions = useCallback(() => {
    const h = containerRef.current?.clientHeight || window.innerHeight
    return {
      expanded: 56, // 56px from top (below status bar area)
      mid: h * 0.55, // 55% down
      collapsed: h - 80, // 80px from bottom (just the handle + peek)
    }
  }, [])

  const getSnapY = useCallback(
    (snap: SheetSnap) => {
      const positions = getSnapPositions()
      return positions[snap]
    },
    [getSnapPositions]
  )

  const currentTranslateY = sheetTranslateY ?? getSnapY(sheetSnap)

  // Touch handlers for bottom sheet drag
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      dragStartY.current = e.touches[0].clientY
      dragStartTranslate.current = currentTranslateY
    },
    [currentTranslateY]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const dy = e.touches[0].clientY - dragStartY.current
      const positions = getSnapPositions()
      const next = Math.max(
        positions.expanded,
        Math.min(positions.collapsed, dragStartTranslate.current + dy)
      )
      setSheetTranslateY(next)
    },
    [getSnapPositions]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (sheetTranslateY === null) return
      const positions = getSnapPositions()
      const velocity = e.changedTouches[0].clientY - dragStartY.current > 0 ? 1 : -1

      // Snap to nearest position, biased by velocity
      let snapTo: SheetSnap
      const distToExpanded = Math.abs(sheetTranslateY - positions.expanded)
      const distToMid = Math.abs(sheetTranslateY - positions.mid)
      const distToCollapsed = Math.abs(sheetTranslateY - positions.collapsed)

      if (velocity > 0 && Math.abs(e.changedTouches[0].clientY - dragStartY.current) > 40) {
        // Swiped down fast
        snapTo = sheetSnap === 'expanded' ? 'mid' : 'collapsed'
      } else if (velocity < 0 && Math.abs(e.changedTouches[0].clientY - dragStartY.current) > 40) {
        // Swiped up fast
        snapTo = sheetSnap === 'collapsed' ? 'mid' : 'expanded'
      } else {
        // Position-based snap
        const minDist = Math.min(distToExpanded, distToMid, distToCollapsed)
        snapTo =
          minDist === distToExpanded ? 'expanded' : minDist === distToMid ? 'mid' : 'collapsed'
      }

      setSheetSnap(snapTo)
      setSheetTranslateY(null)
    },
    [sheetTranslateY, sheetSnap, getSnapPositions]
  )

  const handlePointPress = useCallback(
    (point: MapPoint) => {
      if (point.type === 'center') {
        router.push(`/center/${point.id}`)
      } else {
        router.push(`/events/${point.id}`)
      }
    },
    [router]
  )

  const handleFilterPress = useCallback((f: DiscoverFilter) => {
    setActiveFilter(f)
    setSelectedDate(null)
  }, [])

  const eventDates = useMemo(
    () => new Set(allEvents.filter((e) => e.date).map((e) => e.date)),
    [allEvents]
  )

  const displayItems = useMemo(() => {
    if (!selectedDate) return items
    return items.filter(
      (item) => item.type === 'event' && (item.data as EventDisplay).date === selectedDate
    )
  }, [items, selectedDate])

  const isExpanded = sheetSnap === 'expanded' && sheetTranslateY === null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Map — full bleed behind the sheet */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Suspense
          fallback={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#E8862A" />
            </View>
          }
        >
          <Map points={filteredPoints} onPointPress={handlePointPress} />
        </Suspense>
      </View>

      {/* Bottom Sheet */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          top: currentTranslateY,
          transition: sheetTranslateY !== null ? 'none' : 'top 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: isDark ? '#171717' : '#FFFFFF',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Drag Handle Zone */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              touchAction: 'none',
              cursor: 'grab',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            {/* Handle bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 10,
                paddingBottom: 8,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: isDark ? '#525252' : '#D1D5DB',
                }}
              />
            </div>

            {/* Search */}
            <View
              className="flex-row items-center mx-3 mb-2 px-3 rounded-xl"
              style={{
                minHeight: 44,
                backgroundColor: isDark ? '#262626' : '#F3F4F6',
              }}
            >
              <Search size={16} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-2 text-sm font-inter"
                style={{
                  color: isDark ? '#E5E7EB' : '#1F2937',
                  paddingVertical: 10,
                  fontSize: 16,
                }}
                placeholder="Search events and centers..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Filter tabs */}
            <View style={{ marginBottom: 4 }}>
              <UnderlineTabBar
                tabs={FILTERS.map((f) => f.label)}
                activeTab={selectedDate ? '' : activeFilter}
                onTabChange={(tab) => handleFilterPress(tab as DiscoverFilter)}
              />
            </View>

            {/* Week Calendar */}
            {activeFilter !== 'Centers' && !searchQuery.trim() && (
              <View style={{ paddingHorizontal: 12, paddingTop: 4 }}>
                <WeekCalendar
                  eventDates={eventDates}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </View>
            )}
          </div>

          {/* Loading indicator */}
          {loading && (
            <View className="py-3 items-center">
              <ActivityIndicator size="small" color="#9A3412" />
            </View>
          )}

          {/* Scrollable list */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 32, gap: 4 }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={isExpanded}
          >
            {!loading && displayItems.length === 0 && (
              <View className="py-12 items-center">
                <Text className="text-stone-400 dark:text-stone-500 font-inter text-sm">
                  {selectedDate ? 'No events on this day' : 'No results found'}
                </Text>
              </View>
            )}
            {displayItems.map((item) =>
              item.type === 'event' ? (
                <EventItem
                  key={`event-${item.data.id}`}
                  event={item.data as EventDisplay}
                  onPress={() => router.push(`/events/${item.data.id}`)}
                />
              ) : (
                <CenterItem
                  key={`center-${item.data.id}`}
                  center={item.data as DiscoverCenter}
                  onPress={() => router.push(`/center/${item.data.id}`)}
                />
              )
            )}
          </ScrollView>
        </div>
      </div>
    </div>
  )
}

// ─── Desktop Discover Screen ────────────────────────────

export default function DiscoverScreenWeb() {
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024
  const panelWidth = isTablet ? 340 : 420

  const router = useRouter()
  const { isDark } = useThemeContext()
  const { user } = useUser()
  const isAdmin = user?.username === ADMIN_NAME
  const canCreate = isAdmin || isLocal
  const [activeFilter, setActiveFilter] = useState<DiscoverFilter>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<{ type: 'event' | 'center'; id: string } | null>(
    null
  )
  // Event form panel: null = hidden, { id?: string } = open (id present = edit, absent = create)
  const [formPanel, setFormPanel] = useState<{ id?: string } | null>(null)
  const { items, filteredPoints, loading, allEvents, allCenters, refresh, updateEventStatus } =
    useDiscoverData(activeFilter, searchQuery, user?.id)

  // Refetch data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (__DEV__) console.log('[DiscoverScreenWeb] focused, refreshing...')
      refresh()
    }, [refresh])
  )

  const params = useLocalSearchParams<{ detail?: string; id?: string; action?: string }>()

  // Clear query string without navigation
  const clearParams = useCallback(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  // Support direct URL navigation (e.g. ?detail=event&id=123)
  useEffect(() => {
    if (params.detail && params.id) {
      setSelectedItem({ type: params.detail as 'event' | 'center', id: params.id })
    }
  }, [params.detail, params.id])

  // Listen for create event from header nav button
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = () => {
      setSelectedItem(null)
      setFormPanel({})
    }
    window.addEventListener('open-event-form', handler)
    return () => window.removeEventListener('open-event-form', handler)
  }, [])

  // Fixed 440px width for both list and detail panels — no shift on selection
  const rightPanelWidth = 440

  const eventDates = useMemo(
    () => new Set(allEvents.filter((e) => e.date).map((e) => e.date)),
    [allEvents]
  )

  const displayItems = useMemo(() => {
    if (!selectedDate) return items
    return items.filter(
      (item) => item.type === 'event' && (item.data as EventDisplay).date === selectedDate
    )
  }, [items, selectedDate])

  const handleFilterPress = useCallback((f: DiscoverFilter) => {
    setActiveFilter(f)
    setSelectedDate(null)
  }, [])

  // Map popover state
  const mapPanelRef = useRef<View>(null)
  const [hoverPopover, setHoverPopover] = useState<{
    point: MapPoint
    x: number
    y: number
  } | null>(null)
  const [clickPopover, setClickPopover] = useState<{
    point: MapPoint
    x: number
    y: number
  } | null>(null)

  const viewportToContainer = useCallback((vx: number, vy: number) => {
    const el = mapPanelRef.current as any as HTMLElement | null
    if (el?.getBoundingClientRect) {
      const r = el.getBoundingClientRect()
      return { x: vx - r.left, y: vy - r.top }
    }
    return { x: vx, y: vy }
  }, [])

  const handlePointHover = useCallback(
    (point: MapPoint | null, x?: number, y?: number) => {
      if (point && x != null && y != null) {
        const pos = viewportToContainer(x, y)
        setHoverPopover({ point, x: pos.x, y: pos.y })
      } else {
        setHoverPopover(null)
      }
    },
    [viewportToContainer]
  )

  const handlePointClick = useCallback(
    (point: MapPoint, x?: number, y?: number) => {
      setHoverPopover(null)
      if (x != null && y != null) {
        const pos = viewportToContainer(x, y)
        setClickPopover({ point, x: pos.x, y: pos.y })
      }
    },
    [viewportToContainer]
  )

  const handlePopoverView = useCallback(() => {
    if (!clickPopover) return
    const { point } = clickPopover
    setSelectedItem({ type: point.type === 'center' ? 'center' : 'event', id: point.id })
    setClickPopover(null)
  }, [clickPopover])

  // Look up details for popover from hook data (not sample constants)
  const clickEventDetail = useMemo(() => {
    if (!clickPopover || clickPopover.point.type !== 'event') return undefined
    return allEvents.find((e) => e.id === clickPopover.point.id)
  }, [clickPopover, allEvents])

  const clickCenterDetail = useMemo(() => {
    if (!clickPopover || clickPopover.point.type !== 'center') return undefined
    return allCenters.find((c) => c.id === clickPopover.point.id)
  }, [clickPopover, allCenters])

  const handlePointPress = useCallback((point: MapPoint) => {
    setSelectedItem({ type: point.type === 'center' ? 'center' : 'event', id: point.id })
  }, [])

  const handleMapMove = useCallback(() => {
    setClickPopover(null)
    setHoverPopover(null)
  }, [])

  if (isMobile) {
    return <MobileDiscoverFallback />
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <View className="flex-row flex-1">
        {/* Map Panel */}
        <View ref={mapPanelRef} className="flex-1 relative">
          <Suspense
            fallback={
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#E8862A" />
              </View>
            }
          >
            <Map
              points={filteredPoints}
              onPointPress={handlePointPress}
              onPointHover={handlePointHover}
              onPointClick={handlePointClick}
              onMapMove={handleMapMove}
            />
          </Suspense>

          {/* Hover popover */}
          {hoverPopover && !clickPopover && (
            <MapPopover
              point={hoverPopover.point}
              mode="hover"
              x={hoverPopover.x}
              y={hoverPopover.y}
            />
          )}

          {/* Click popover */}
          {clickPopover && (
            <MapPopover
              point={clickPopover.point}
              mode="click"
              eventDetail={clickEventDetail}
              centerDetail={clickCenterDetail}
              x={clickPopover.x}
              y={clickPopover.y}
              onViewPress={handlePopoverView}
              onClose={() => setClickPopover(null)}
            />
          )}
        </View>

        {/* Right Panel — form, detail view, or list */}
        {formPanel ? (
          <EventFormPanel
            eventId={formPanel.id}
            onClose={() => {
              const editId = formPanel.id
              setFormPanel(null)
              if (editId) {
                setSelectedItem({ type: 'event', id: editId })
              } else {
                clearParams()
              }
            }}
          />
        ) : selectedItem ? (
          <DetailPanelWrapper
            selectedItem={selectedItem}
            onClose={() => {
              setSelectedItem(null)
              clearParams()
            }}
            onEventPress={(id) => setSelectedItem({ type: 'event', id })}
            onEditEvent={(id) => {
              setSelectedItem(null)
              setFormPanel({ id })
            }}
            onStatusChange={updateEventStatus}
          />
        ) : (
          <View
            style={{ width: rightPanelWidth }}
            className="border-l border-stone-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
          >
            {/* Panel Header */}
            <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 0 }}>
              {/* Search + Create */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  className="flex-row items-center px-3 rounded-xl bg-stone-100 dark:bg-neutral-800"
                  style={{ minHeight: 40, flex: 1 }}
                >
                  <Search size={16} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-2 text-sm font-inter text-content dark:text-content-dark outline-none"
                    placeholder="Search events and centers..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={{ paddingVertical: 8 }}
                  />
                </View>
                {canCreate && (
                  <Pressable
                    onPress={() => {
                      setSelectedItem(null)
                      setFormPanel({})
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: '#E8862A',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    accessibilityLabel="Create event"
                  >
                    <Plus size={20} color="#FFFFFF" />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Filter tabs */}
            <View style={{ paddingTop: 8, marginBottom: 12 }}>
              <UnderlineTabBar
                tabs={FILTERS.map((f) => f.label)}
                activeTab={selectedDate ? '' : activeFilter}
                onTabChange={(tab) => handleFilterPress(tab as DiscoverFilter)}
              />
            </View>

            {/* Week Calendar — hidden when Centers filter or searching */}
            {activeFilter !== 'Centers' && !searchQuery.trim() && (
              <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
                <WeekCalendar
                  eventDates={eventDates}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </View>
            )}

            {/* Loading indicator */}
            {loading && (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#9A3412" />
              </View>
            )}

            {/* List */}
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 4 }}
              showsVerticalScrollIndicator={false}
            >
              {!loading && displayItems.length === 0 && (
                <View className="py-16 items-center">
                  <Text className="text-stone-400 dark:text-stone-500 font-inter text-sm">
                    {selectedDate ? 'No events on this day' : 'No results found'}
                  </Text>
                </View>
              )}
              {displayItems.map((item) =>
                item.type === 'event' ? (
                  <EventItem
                    key={`event-${item.data.id}`}
                    event={item.data as EventDisplay}
                    onPress={() => setSelectedItem({ type: 'event', id: item.data.id })}
                  />
                ) : (
                  <CenterItem
                    key={`center-${item.data.id}`}
                    center={item.data as DiscoverCenter}
                    onPress={() => setSelectedItem({ type: 'center', id: item.data.id })}
                  />
                )
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  )
}
