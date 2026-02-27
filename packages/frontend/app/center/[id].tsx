import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Image, Pressable, Linking, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  MapPin,
  Globe,
  Phone,
  Calendar,
  User,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native'
import { TabSegment, IconButton, SecondaryButton, PrimaryButton, Card } from '../../components/ui'
import { useCenterDetail, EventDisplay } from '../../hooks/useApiData'

// ── Calendar helpers ──────────────────────────────────────────────────

function getMonthGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weeks: (number | null)[][] = []
  let week: (number | null)[] = new Array(firstDay).fill(null)

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return weeks
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const EVENT_COLORS = ['bg-red-100', 'bg-blue-100', 'bg-green-100', 'bg-amber-100']
const EVENT_DOT_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-amber-500']

// ── CalendarView component ────────────────────────────────────────────

function CalendarView({
  events,
  onEventPress,
}: {
  events: EventDisplay[]
  onEventPress: (event: EventDisplay) => void
}) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const todayDate = now.getDate()
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()
  const weeks = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth])

  // Map event index to date for color coding (simple heuristic)
  const eventDateMap = useMemo(() => {
    const map: Record<number, number> = {}
    events.forEach((evt, i) => {
      // Try to parse a date from the event time string
      const dateMatch = evt.time.match(/(\d{1,2})/)
      if (dateMatch) {
        map[parseInt(dateMatch[1], 10)] = i
      }
    })
    return map
  }, [events])

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1)
      setViewMonth(11)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1)
      setViewMonth(0)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <View className="gap-4">
      {/* Calendar Header */}
      <View className="flex-row justify-between items-center px-2">
        <IconButton onPress={goToPrevMonth}>
          <ChevronLeft size={16} />
        </IconButton>
        <Text className="text-lg font-semibold text-content dark:text-content-dark">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <IconButton onPress={goToNextMonth}>
          <ChevronRight size={16} />
        </IconButton>
      </View>

      {/* Days of week header */}
      <View className="flex-row justify-between px-2">
        {daysOfWeek.map((day, index) => (
          <View key={index} className="w-10 items-center">
            <Text className="text-sm text-contentStrong dark:text-contentStrong-dark font-medium">
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View className="gap-1">
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="flex-row justify-between px-2">
            {week.map((date, dayIndex) => {
              const eventIdx = date !== null ? eventDateMap[date] : undefined
              const hasEvent = eventIdx !== undefined
              const isToday = isCurrentMonth && date === todayDate

              return (
                <View key={dayIndex} className="w-10 items-center">
                  {date !== null && (
                    <Pressable
                      onPress={() => {
                        if (hasEvent) onEventPress(events[eventIdx!])
                      }}
                      className={`w-9 h-9 rounded-lg justify-center items-center relative ${
                        isToday
                          ? 'bg-primary'
                          : hasEvent
                          ? EVENT_COLORS[eventIdx! % EVENT_COLORS.length]
                          : ''
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          isToday
                            ? 'font-semibold text-white'
                            : 'font-normal text-content dark:text-content-dark'
                        }`}
                      >
                        {date}
                      </Text>
                      {hasEvent && !isToday && (
                        <View
                          className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                            EVENT_DOT_COLORS[eventIdx! % EVENT_DOT_COLORS.length]
                          }`}
                        />
                      )}
                    </Pressable>
                  )}
                </View>
              )
            })}
          </View>
        ))}
      </View>

      {/* Events List */}
      <View className="gap-3 mt-2">
        {events.map((event) => (
          <CenterEventCard key={event.id} event={event} onPress={() => onEventPress(event)} />
        ))}
      </View>
    </View>
  )
}

// ── CenterEventCard component ─────────────────────────────────────────

function CenterEventCard({
  event,
  onPress,
}: {
  event: EventDisplay
  onPress: () => void
}) {
  return (
    <Card pressable onPress={onPress} padding="sm" overflowHidden>
      <View className="gap-2">
        <Text className="text-sm text-primary font-medium">{event.time}</Text>
        <Text className="text-sm text-contentStrong dark:text-contentStrong-dark">
          {event.location}
        </Text>
        <Text className="text-base font-semibold text-content dark:text-content-dark leading-tight">
          {event.title}
        </Text>
        <Text className="text-sm text-contentStrong dark:text-contentStrong-dark mt-1">
          {event.attendees} people
        </Text>
      </View>
    </Card>
  )
}

// ── Main page component ───────────────────────────────────────────────

export default function CenterDetailPage() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Details')
  const { center, events, loading } = useCenterDetail(id as string)

  const handleEventPress = (event: EventDisplay) => {
    router.push(`/events/${event.id}`)
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background dark:bg-background-dark">
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    )
  }

  if (!center) {
    return (
      <View className="flex-1 justify-center items-center px-4 bg-background dark:bg-background-dark">
        <Text className="text-2xl font-semibold text-content dark:text-content-dark mb-4">
          Center not found
        </Text>
        <Pressable onPress={() => router.back()} className="bg-primary rounded-xl px-6 py-3">
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    )
  }

  const renderDetailsTab = () => (
    <View className="gap-4">
      {/* Center Image */}
      <View className="rounded-xl overflow-hidden shadow">
        <Image source={{ uri: center.image }} style={{ width: '100%', height: 200 }} />
      </View>

      {/* Center Information */}
      <View className="gap-3">
        {/* Address */}
        <Pressable
          className="flex-row items-center gap-2"
          onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(center.address)}`)}
        >
          <MapPin size={20} color="#f97316" />
          <Text className="text-base font-medium text-content dark:text-content-dark flex-1">
            {center.address}
          </Text>
        </Pressable>

        {/* Website */}
        <Pressable
          className="flex-row items-center gap-2"
          onPress={() => Linking.openURL(center.website)}
        >
          <Globe size={20} color="#f97316" />
          <Text className="text-base font-medium text-primary">{center.website}</Text>
        </Pressable>

        {/* Phone */}
        <Pressable
          className="flex-row items-center gap-2"
          onPress={() => Linking.openURL(`tel:${center.phone}`)}
        >
          <Phone size={20} color="#f97316" />
          <Text className="text-base font-medium text-content dark:text-content-dark">
            {center.phone}
          </Text>
        </Pressable>

        {/* Upcoming Events */}
        <View className="flex-row items-center gap-2">
          <Calendar size={20} color="#f97316" />
          <Text className="text-base font-medium text-content dark:text-content-dark">
            {center.upcomingEvents} upcoming events
          </Text>
        </View>

        {/* Point of Contact */}
        <View className="flex-row items-center gap-2">
          <User size={20} color="#f97316" />
          <View className="flex-1">
            <Text className="text-sm text-contentStrong dark:text-contentStrong-dark">
              Point of Contact:
            </Text>
            <Text className="text-base font-medium text-content dark:text-content-dark">
              {center.pointOfContact}
            </Text>
          </View>
        </View>

        {/* Acharya */}
        {center.acharya && (
          <View className="gap-1 mt-2">
            <Text className="text-lg font-semibold text-content dark:text-content-dark">
              Acharya
            </Text>
            <Text className="text-base text-contentStrong dark:text-contentStrong-dark">
              {center.acharya}
            </Text>
          </View>
        )}
      </View>
    </View>
  )

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="flex-1">
        {/* Center Name */}
        <View className="px-4 py-3 bg-background dark:bg-background-dark border-b border-borderColor dark:border-borderColor-dark">
          <Text className="text-2xl font-bold text-center text-content dark:text-content-dark">
            {center.name}
          </Text>
        </View>

        {/* Tab Navigation */}
        <View className="bg-background dark:bg-background-dark px-4 py-2">
          <TabSegment
            options={[
              { value: 'Details', label: 'Details' },
              { value: 'Events', label: 'Events' },
            ]}
            value={activeTab}
            onValueChange={setActiveTab}
            variant="subtle"
          />
        </View>

        <View className="px-4 gap-4 pb-8">
          {activeTab === 'Details' && renderDetailsTab()}
          {activeTab === 'Events' && (
            <CalendarView events={events} onEventPress={handleEventPress} />
          )}
        </View>
      </View>
    </ScrollView>
  )
}
