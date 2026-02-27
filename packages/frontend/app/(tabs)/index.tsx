// Discover tab — mobile / native layout
import React, { useState, Suspense } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  TextInput,
  useWindowDimensions,
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
import { MapPreview } from '../../components'
import { useDiscoverData, type DiscoverFilter } from '../../hooks/useApiData'
import { useMapPoints } from '../../hooks/useApiData'
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
  const { height: windowHeight } = useWindowDimensions()
  const mapHeight = windowHeight < 700 ? 200 : 280
  const [activeFilter, setActiveFilter] = useState<DiscoverFilter>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { items, filteredPoints, loading, allEvents } = useDiscoverData(activeFilter, searchQuery)
  const { points: allPoints } = useMapPoints()

  // Dates that have events (for calendar dots)
  const eventDates = React.useMemo(
    () => new Set(allEvents.filter((e) => e.date).map((e) => e.date)),
    [allEvents]
  )

  // When a date is selected, filter to just that day's events
  const displayItems = React.useMemo(() => {
    if (!selectedDate) return items
    return items.filter(
      (item) => item.type === 'event' && (item.data as EventDisplay).date === selectedDate
    )
  }, [items, selectedDate])

  const handleFilterPress = (f: DiscoverFilter) => {
    setActiveFilter(f)
    setSelectedDate(null) // Clear date selection when chip is tapped
  }

  const handlePointPress = (point: { id: string; type: 'center' | 'event' }) => {
    if (point.type === 'center') {
      router.push(`/center/${point.id}`)
    } else {
      router.push(`/events/${point.id}`)
    }
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* Map Section */}
      <View style={{ height: mapHeight }}>
        {Platform.OS === 'web' ? (
          <MapPreview onPress={() => {}} pointCount={allPoints.length} />
        ) : (
          <Suspense
            fallback={
              <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-neutral-800">
                <ActivityIndicator size="large" color="#9A3412" />
              </View>
            }
          >
            <Map points={filteredPoints} onPointPress={handlePointPress} />
          </Suspense>
        )}
      </View>

      {/* Bottom Sheet Area */}
      <View className="flex-1 bg-white dark:bg-neutral-900 -mt-4 rounded-t-3xl border-t border-gray-100 dark:border-neutral-800">
        {/* Drag Handle */}
        <View className="items-center pt-2 pb-3">
          <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-neutral-600" />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          className="mb-2"
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

        {/* Search Input */}
        <View className="flex-row items-center mx-4 mt-1 mb-2 px-3 rounded-xl bg-gray-100 dark:bg-neutral-800" style={{ minHeight: 44 }}>
          <Search size={16} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-sm font-inter text-content dark:text-content-dark"
            placeholder="Search events and centers..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ paddingVertical: 10 }}
          />
        </View>

        {/* Week Calendar — hidden when Centers filter or searching */}
        {activeFilter !== 'Centers' && !searchQuery.trim() && (
          <WeekCalendar
            eventDates={eventDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}

        {/* Loading indicator */}
        {loading && (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#9A3412" />
          </View>
        )}

        {/* Unified List */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: Platform.OS === 'web' ? 24 : 40, gap: 2 }}
          showsVerticalScrollIndicator={false}
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
    </View>
  )
}
