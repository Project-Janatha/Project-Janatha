// Discover tab — mobile / native layout
import React, { useState, Suspense, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  Animated,
  PanResponder,
  StyleSheet,
} from 'react-native'
import {
  MapPin,
  Search,
  CheckCircle2,
  Building2,
} from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { useThemeContext } from '../../components/contexts'
import { FilterChip, Badge } from '../../components/ui'
import { useDiscoverData, type DiscoverFilter } from '../../hooks/useApiData'
import type { EventDisplay, DiscoverCenter } from '../../utils/api'
import WeekCalendar from '../../components/WeekCalendar'

// Lazy load Map to avoid loading heavy web dependencies on mobile web
const Map = React.lazy(() => import('../../components/Map'))

const FILTERS: { label: DiscoverFilter }[] = [
  { label: 'All' },
  { label: 'Going' },
  { label: 'Centers' },
]

/**
 * Format a date string into a short display like "FEB 26"
 */
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

// ─── Event Item ─────────────────────────────────────────

function EventItem({ event, onPress }: { event: EventDisplay; onPress: () => void }) {
  const { month, day } = event.date ? formatDatePill(event.date) : { month: '', day: '' }
  const todayLabel = event.date ? isToday(event.date) : false

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row gap-3 p-3 rounded-2xl active:opacity-70 ${
        event.isRegistered
          ? 'bg-orange-50 dark:bg-orange-950/20'
          : 'bg-white dark:bg-neutral-900'
      }`}
    >
      {/* Date pill */}
      <View className="relative">
        <View className="w-12 h-14 rounded-xl items-center justify-center bg-gray-100 dark:bg-neutral-800">
          <Text className="text-[10px] font-inter-semibold text-gray-500 dark:text-gray-400">
            {month}
          </Text>
          <Text className="text-base font-inter-bold text-content dark:text-content-dark">
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
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-content dark:text-content-dark font-inter-semibold text-base leading-tight flex-1" numberOfLines={2}>
            {event.title}
          </Text>
          {event.isRegistered && <Badge label="Going" variant="going" />}
        </View>
        <Text className="text-gray-500 dark:text-gray-400 font-inter text-sm">
          {todayLabel ? 'Today' : month + ' ' + day}
          {event.time ? ' · ' + event.time : ''}
        </Text>
        <View className="flex-row items-center gap-1 mt-0.5">
          <MapPin size={12} color="#9CA3AF" />
          <Text className="text-gray-500 dark:text-gray-400 font-inter text-xs" numberOfLines={1}>
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

// ─── Center Item ────────────────────────────────────────

function CenterItem({ center, onPress }: { center: DiscoverCenter; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row gap-3 p-3 rounded-2xl active:opacity-70 ${
        center.isMember
          ? 'bg-orange-50 dark:bg-orange-950/20'
          : 'bg-white dark:bg-neutral-900'
      }`}
    >
      {/* Icon pill */}
      <View className="w-12 h-14 rounded-xl bg-orange-100 dark:bg-orange-900/30 items-center justify-center">
        <Building2 size={20} color="#9A3412" />
      </View>

      {/* Content */}
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-content dark:text-content-dark font-inter-semibold text-base leading-tight flex-1" numberOfLines={1}>
            {center.name}
          </Text>
          {center.isMember && <Badge label="Member" variant="member" />}
        </View>
        <Text className="text-gray-500 dark:text-gray-400 font-inter text-sm">
          Center{center.distanceMi != null ? ` · ${center.distanceMi} mi` : ''}
        </Text>
        {center.eventCount != null && center.eventCount > 0 && (
          <Text className="text-primary font-inter text-xs mt-0.5">
            {center.eventCount} events this week
          </Text>
        )}
      </View>
    </Pressable>
  )
}

// ─── Discover Screen ────────────────────────────────────

export default function DiscoverScreen() {
  const router = useRouter()
  const { isDark } = useThemeContext()
  const [activeFilter, setActiveFilter] = useState<DiscoverFilter>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { items, filteredPoints, loading, allEvents } = useDiscoverData(activeFilter, searchQuery)

  // ── Sheet snap points ──────────────────────────────────
  // Three positions (as translateY values from the expanded state):
  //   expanded  = 0            → sheet covers almost everything
  //   mid       = ~55% down    → roughly half the screen, showing map + sheet header/list
  //   collapsed = near bottom  → just the drag handle + filter chips peeking up

  const EXPANDED_TOP = 60 // px from top of container when fully expanded

  const [containerHeight, setContainerHeight] = useState(0)
  const sheetHeight = containerHeight - EXPANDED_TOP // total sheet height

  const SNAP_EXPANDED = 0
  const SNAP_MID = Math.max(0, sheetHeight * 0.45)       // sheet top sits ~halfway
  const SNAP_COLLAPSED = Math.max(0, sheetHeight - 80)    // only ~80px visible (handle + chip row)

  const snapsRef = useRef({ expanded: SNAP_EXPANDED, mid: SNAP_MID, collapsed: SNAP_COLLAPSED })
  snapsRef.current = { expanded: SNAP_EXPANDED, mid: SNAP_MID, collapsed: SNAP_COLLAPSED }

  const sheetY = useRef(new Animated.Value(0)).current
  const offsetRef = useRef(0)
  const initializedRef = useRef(false)

  // Track expansion state for scroll behavior
  const [isSheetExpanded, setIsSheetExpanded] = useState(false)

  // Set initial sheet position to mid once we know the container height
  React.useEffect(() => {
    if (containerHeight > 0 && !initializedRef.current) {
      const mid = Math.max(0, (containerHeight - EXPANDED_TOP) * 0.45)
      sheetY.setValue(mid)
      offsetRef.current = mid
      initializedRef.current = true
    }
  }, [containerHeight, sheetY])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 8,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gs) => {
        const max = snapsRef.current.collapsed
        const next = Math.max(0, Math.min(max, offsetRef.current + gs.dy))
        sheetY.setValue(next)
      },
      onPanResponderRelease: (_, gs) => {
        const { expanded, mid, collapsed } = snapsRef.current
        const current = Math.max(0, Math.min(collapsed, offsetRef.current + gs.dy))

        // Find nearest snap, biased by velocity
        let snapTo: number
        if (gs.vy > 1) {
          // Fast swipe down — jump one stop down from current
          snapTo = offsetRef.current <= expanded + 10 ? mid : collapsed
        } else if (gs.vy < -1) {
          // Fast swipe up — jump one stop up from current
          snapTo = offsetRef.current >= collapsed - 10 ? mid : expanded
        } else {
          // Position-based: snap to nearest
          const dExp = Math.abs(current - expanded)
          const dMid = Math.abs(current - mid)
          const dCol = Math.abs(current - collapsed)
          const minD = Math.min(dExp, dMid, dCol)
          snapTo = minD === dExp ? expanded : minD === dMid ? mid : collapsed
        }

        offsetRef.current = snapTo
        setIsSheetExpanded(snapTo === expanded)
        Animated.spring(sheetY, {
          toValue: snapTo,
          useNativeDriver: false,
          damping: 28,
          stiffness: 220,
          mass: 0.8,
        }).start()
      },
    })
  ).current

  // ── Data ──────────────────────────────────────────────
  const eventDates = React.useMemo(
    () => new Set(allEvents.filter((e) => e.date).map((e) => e.date)),
    [allEvents]
  )

  const displayItems = React.useMemo(() => {
    if (!selectedDate) return items
    return items.filter(
      (item) => item.type === 'event' && (item.data as EventDisplay).date === selectedDate
    )
  }, [items, selectedDate])

  const handleFilterPress = (f: DiscoverFilter) => {
    setActiveFilter(f)
    setSelectedDate(null)
  }

  const handlePointPress = (point: { id: string; type: 'center' | 'event' }) => {
    if (point.type === 'center') {
      router.push(`/center/${point.id}`)
    } else {
      router.push(`/events/${point.id}`)
    }
  }

  return (
    <View
      style={styles.container}
      onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
    >
      {/* Map — full bleed behind the sheet */}
      <View style={StyleSheet.absoluteFill}>
        <Suspense
          fallback={
            <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-neutral-800">
              <ActivityIndicator size="large" color="#9A3412" />
            </View>
          }
        >
          <Map points={filteredPoints} onPointPress={handlePointPress} />
        </Suspense>
      </View>

      {/* Bottom Sheet — hidden until we measure the container */}
      {containerHeight > 0 && (
      <Animated.View
        style={[
          styles.sheet,
          { top: EXPANDED_TOP, transform: [{ translateY: sheetY }] },
        ]}
      >
        <View
          style={[
            styles.sheetInner,
            {
              backgroundColor: isDark ? '#171717' : '#fff',
              borderTopColor: isDark ? '#262626' : '#E5E7EB',
            },
          ]}
        >
          {/* ─── Draggable Header Zone ─── */}
          <View {...panResponder.panHandlers}>
            {/* Drag Handle */}
            <View style={styles.handleRow}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: isDark ? '#525252' : '#D1D5DB' },
                ]}
              />
            </View>

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
              style={{ flexGrow: 0, marginBottom: 8 }}
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

            {/* Search Input */}
            <View
              className="flex-row items-center mx-4 mt-1 mb-2 px-3 rounded-xl"
              style={{
                minHeight: 44,
                backgroundColor: isDark ? '#262626' : '#F3F4F6',
              }}
            >
              <Search size={16} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-2 text-sm font-inter"
                style={{ color: isDark ? '#E5E7EB' : '#1F2937', paddingVertical: 10 }}
                placeholder="Search events and centers..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Week Calendar */}
            {activeFilter !== 'Centers' && !searchQuery.trim() && (
              <WeekCalendar
                eventDates={eventDates}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            )}
          </View>

          {/* Loading indicator */}
          {loading && (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#9A3412" />
            </View>
          )}

          {/* Unified List */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 2 }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={isSheetExpanded}
          >
            {!loading && displayItems.length === 0 && (
              <View className="py-12 items-center">
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
        </View>
      </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // top is set dynamically via style prop
  },
  sheetInner: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    overflow: 'hidden',
    // Shadow for visibility over the map
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 16,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
})
