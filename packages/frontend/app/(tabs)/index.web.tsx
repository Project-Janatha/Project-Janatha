// Discover tab — web desktop layout
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { View, Text, Pressable, useWindowDimensions, ScrollView, TextInput, ActivityIndicator } from 'react-native'
import {
  MapPin,
  Search,
  Building2,
  CheckCircle2,
} from 'lucide-react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useThemeContext, useUser } from '../../components/contexts'
import { FilterChip, Badge } from '../../components/ui'
import Map from '../../components/Map'
import MapPopover from '../../components/MapPopover'
import { useDiscoverData, useEventDetail, useCenterDetail, type DiscoverFilter } from '../../hooks/useApiData'
import type { MapPoint, EventDisplay, DiscoverCenter } from '../../utils/api'
import WeekCalendar from '../../components/WeekCalendar'
import EventDetailPanel from '../../components/web/EventDetailPanel'
import CenterDetailPanel from '../../components/web/CenterDetailPanel'

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

// ─── Event Item (Desktop) ───────────────────────────────

function EventItem({ event, onPress }: { event: EventDisplay; onPress: () => void }) {
  const { month, day } = event.date ? formatDatePill(event.date) : { month: '', day: '' }

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row gap-4 p-4 rounded-2xl active:opacity-80 border border-transparent hover:border-gray-200 dark:hover:border-neutral-700 ${
        event.isRegistered
          ? 'bg-orange-50/80 dark:bg-orange-950/20'
          : 'bg-white dark:bg-neutral-900'
      }`}
    >
      {/* Date pill */}
      <View className="relative">
        <View className="w-[52px] h-[60px] rounded-xl items-center justify-center bg-gray-100 dark:bg-neutral-800">
          <Text className="text-[10px] font-inter-semibold text-gray-500 dark:text-gray-400">
            {month}
          </Text>
          <Text className="text-lg font-inter-bold text-content dark:text-content-dark">
            {day}
          </Text>
        </View>
        {event.isRegistered && (
          <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 items-center justify-center border-2 border-white dark:border-neutral-900">
            <CheckCircle2 size={10} color="#fff" />
          </View>
        )}
      </View>

      {/* Content */}
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-content dark:text-content-dark font-inter-semibold text-base leading-tight flex-1" numberOfLines={2}>
            {event.title}
          </Text>
          {event.isRegistered && <Badge label="Going" variant="going" />}
        </View>
        <Text className="text-gray-500 dark:text-gray-400 font-inter text-sm">
          {event.date && isToday(event.date) ? 'Today' : month + ' ' + day}
          {event.time ? ' · ' + event.time : ''}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <MapPin size={12} color="#9CA3AF" />
          <Text className="text-gray-500 dark:text-gray-400 font-inter text-sm" numberOfLines={1}>
            {event.location}
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 font-inter text-xs ml-2">
            {event.attendees} going
          </Text>
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
      className={`flex-row gap-4 p-4 rounded-2xl active:opacity-80 border border-transparent hover:border-gray-200 dark:hover:border-neutral-700 ${
        center.isMember
          ? 'bg-orange-50/80 dark:bg-orange-950/20'
          : 'bg-white dark:bg-neutral-900'
      }`}
    >
      {/* Icon pill */}
      <View className="w-[52px] h-[60px] rounded-xl bg-orange-100 dark:bg-orange-900/30 items-center justify-center">
        <Building2 size={22} color="#9A3412" />
      </View>

      {/* Content */}
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-content dark:text-content-dark font-inter-semibold text-base leading-tight flex-1" numberOfLines={1}>
            {center.name}
          </Text>
          {center.isMember && <Badge label="Member" variant="member" />}
        </View>
        <Text className="text-gray-500 dark:text-gray-400 font-inter text-sm">
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
}: {
  selectedItem: { type: 'event' | 'center'; id: string }
  onClose: () => void
  onEventPress: (id: string) => void
}) {
  if (selectedItem.type === 'event') {
    return <EventPanelInner eventId={selectedItem.id} onClose={onClose} />
  }
  return <CenterPanelInner centerId={selectedItem.id} onClose={onClose} onEventPress={onEventPress} />
}

function EventPanelInner({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const { user } = useUser()
  const { event, attendees, messages, loading, toggleRegistration, isToggling } = useEventDetail(eventId)

  const handleToggleRegistration = async () => {
    if (!user?.username) return
    try {
      await toggleRegistration(user.username)
    } catch {
      // silently handle
    }
  }

  if (loading || !event) {
    return (
      <View style={{ width: 440, height: '100%', backgroundColor: '#FFFFFF', borderLeftWidth: 1, borderLeftColor: '#E7E5E4', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E8862A" />
      </View>
    )
  }

  // Determine if past (compare event date to today)
  const isPast = event.date ? new Date(event.date + 'T23:59:59') < new Date() : false

  return (
    <EventDetailPanel
      event={event}
      attendees={attendees}
      messages={messages}
      isPast={isPast}
      onClose={onClose}
      onToggleRegistration={handleToggleRegistration}
      isToggling={isToggling}
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

  if (loading || !center) {
    return (
      <View style={{ width: 440, height: '100%', backgroundColor: '#FFFFFF', borderLeftWidth: 1, borderLeftColor: '#E7E5E4', justifyContent: 'center', alignItems: 'center' }}>
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

// ─── Mobile Discover (inline for responsive fallback) ───

function MobileDiscoverFallback() {
  // On narrow web viewports, render a simplified mobile-like layout
  // The real mobile app uses index.tsx; this is just for narrow browser windows
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<DiscoverFilter>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const { items, loading } = useDiscoverData(activeFilter, searchQuery)

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* Filter + Search */}
      <View className="px-4 pt-4 pb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ flexGrow: 0 }}>
          {FILTERS.map((f) => (
            <FilterChip key={f.label} label={f.label} active={activeFilter === f.label} onPress={() => setActiveFilter(f.label)} />
          ))}
        </ScrollView>
        <View className="flex-row items-center mt-3 px-3 rounded-xl bg-gray-100 dark:bg-neutral-800" style={{ minHeight: 40 }}>
          <Search size={16} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-sm font-inter text-content dark:text-content-dark outline-none"
            placeholder="Search..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ paddingVertical: 8 }}
          />
        </View>
      </View>

      {loading && (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#9A3412" />
        </View>
      )}

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 4 }}>
        {!loading && items.length === 0 && (
          <View className="py-16 items-center">
            <Text className="text-gray-400 font-inter text-sm">No results found</Text>
          </View>
        )}
        {items.map((item) =>
          item.type === 'event' ? (
            <EventItem key={`event-${item.data.id}`} event={item.data as EventDisplay} onPress={() => router.push(`/events/${item.data.id}`)} />
          ) : (
            <CenterItem key={`center-${item.data.id}`} center={item.data as DiscoverCenter} onPress={() => router.push(`/center/${item.data.id}`)} />
          )
        )}
      </ScrollView>
    </View>
  )
}

// ─── Desktop Discover Screen ────────────────────────────

export default function DiscoverScreenWeb() {
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024
  const panelWidth = isTablet ? 340 : 420

  const params = useLocalSearchParams<{ detail?: string; id?: string }>()
  const { isDark } = useThemeContext()
  const [activeFilter, setActiveFilter] = useState<DiscoverFilter>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<{ type: 'event' | 'center'; id: string } | null>(null)
  const { items, filteredPoints, loading, allEvents, allCenters } = useDiscoverData(activeFilter, searchQuery)

  // Support direct URL navigation (e.g. ?detail=event&id=123)
  useEffect(() => {
    if (params.detail && params.id) {
      setSelectedItem({ type: params.detail as 'event' | 'center', id: params.id })
    }
  }, [params.detail, params.id])

  const rightPanelWidth = selectedItem ? 440 : panelWidth

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

  const handlePointHover = useCallback((point: MapPoint | null, x?: number, y?: number) => {
    if (point && x != null && y != null) {
      setHoverPopover({ point, x, y })
    } else {
      setHoverPopover(null)
    }
  }, [])

  const handlePointClick = useCallback((point: MapPoint, x?: number, y?: number) => {
    setHoverPopover(null)
    if (x != null && y != null) {
      setClickPopover({ point, x, y })
    }
  }, [])

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

  const handlePointPress = useCallback(
    (point: MapPoint) => {
      setSelectedItem({ type: point.type === 'center' ? 'center' : 'event', id: point.id })
    },
    []
  )

  if (isMobile) {
    return <MobileDiscoverFallback />
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <View className="flex-row flex-1">
        {/* Map Panel */}
        <View className="flex-1 relative">
          <Map
            points={filteredPoints}
            onPointPress={handlePointPress}
            onPointHover={handlePointHover}
            onPointClick={handlePointClick}
          />

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

        {/* Right Panel — detail view or list */}
        {selectedItem ? (
          <DetailPanelWrapper
            selectedItem={selectedItem}
            onClose={() => setSelectedItem(null)}
            onEventPress={(id) => setSelectedItem({ type: 'event', id })}
          />
        ) : (
          <View style={{ width: rightPanelWidth }} className="border-l border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            {/* Panel Header */}
            <View style={{ paddingHorizontal: isTablet ? 16 : 20, paddingTop: 20, paddingBottom: 12 }}>
              <Text className="text-content dark:text-content-dark font-inter-bold text-xl mb-3">
                Discover
              </Text>

              {/* Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
                style={{ flexGrow: 0 }}
              >
                {FILTERS.map((f) => (
                  <FilterChip
                    key={f.label}
                    label={f.label}
                    active={activeFilter === f.label && !selectedDate}
                    onPress={() => handleFilterPress(f.label)}
                  />
                ))}
              </ScrollView>

              {/* Search */}
              <View className="flex-row items-center mt-3 px-3 rounded-xl bg-gray-100 dark:bg-neutral-800" style={{ minHeight: 40 }}>
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

              {/* Week Calendar — hidden when Centers filter or searching */}
              {activeFilter !== 'Centers' && !searchQuery.trim() && (
                <View className="mt-2">
                  <WeekCalendar
                    eventDates={eventDates}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                  />
                </View>
              )}
            </View>

            {/* Loading indicator */}
            {loading && (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#9A3412" />
              </View>
            )}

            {/* List */}
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingHorizontal: isTablet ? 12 : 16, paddingBottom: 24, gap: 4 }}
              showsVerticalScrollIndicator={false}
            >
              {!loading && displayItems.length === 0 && (
                <View className="py-16 items-center">
                  <Text className="text-gray-400 dark:text-gray-500 font-inter text-sm">
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
