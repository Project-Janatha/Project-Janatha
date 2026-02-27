// This is the web desktop layout
import React from 'react'
import { View, Text, useWindowDimensions, ScrollView, Pressable } from 'react-native'
import { MapPin, ChevronRight } from 'lucide-react-native'
import { useUser } from '../../components/contexts'
import { SecondaryButton, Card } from '../../components/ui'
import Map from '../../components/Map'
import { MapPreview } from '../../components'
import { useRouter } from 'expo-router'
import { useMapPoints, useEventList, useWeekCalendar } from '../../hooks/useApiData'
import { MapPoint } from '../../utils/api'
import { EventCard } from '../../components/EventCard'

export default function HomeScreenWeb() {
  const { width } = useWindowDimensions()
  const { user } = useUser()
  const router = useRouter()
  const { points: mapPoints } = useMapPoints()
  const { events } = useEventList()
  const { weekDays, weekDates, today } = useWeekCalendar()
  const isMobile = width < 768

  const handlePointPress = (point: MapPoint) => {
    if (point.type === 'center') {
      router.push(`/center/${point.id}`)
    } else if (point.type === 'event') {
      router.push(`/events/${point.id}`)
    }
  }

  const handleEventPress = (event: { id: string }) => {
    router.push(`/events/${event.id}`)
  }

  // Narrow viewport: single-column layout (inline, no circular import)
  if (isMobile) {
    return (
      <ScrollView className="flex-1 bg-background dark:bg-background-dark">
        <View className="flex-1 gap-4 px-4 pt-4 pb-8">
          {/* Map Preview */}
          <Card className="mb-4">
            <View className="h-[200px] rounded-t-2xl overflow-hidden">
              <MapPreview onPress={() => router.push('/explore')} pointCount={mapPoints.length} />
            </View>
            <Pressable
              className="flex-row justify-between items-center p-4 active:opacity-70"
              onPress={() => router.push('/explore')}
            >
              <View className="flex-row items-center gap-2">
                <MapPin size={20} color="#0ea5e9" />
                <Text className="text-content dark:text-content-dark font-inter">
                  Find centers and events near you
                </Text>
              </View>
              <ChevronRight size={20} color="#a1a1aa" />
            </Pressable>
          </Card>

          {/* Your Week Section */}
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-content dark:text-content-dark font-inter text-xl font-semibold">
                Your week
              </Text>
              <SecondaryButton onPress={() => router.push('/explore')}>
                See All
              </SecondaryButton>
            </View>

            <View className="flex-row justify-between px-2">
              {weekDays.map((day, index) => (
                <View key={index} className="items-center gap-2 min-w-[40px]">
                  <Text className="text-contentStrong dark:text-contentStrong-dark font-inter text-sm font-medium">
                    {day}
                  </Text>
                  <View
                    className={`w-9 h-9 rounded-full justify-center items-center ${
                      weekDates[index] === today ? 'bg-primary' : ''
                    }`}
                  >
                    <Text
                      className={`font-inter text-base ${
                        weekDates[index] === today
                          ? 'font-semibold text-content-dark'
                          : 'font-normal text-foreground dark:text-content-dark'
                      }`}
                    >
                      {weekDates[index]}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Events List */}
          <View className="gap-3 mt-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onPress={handleEventPress} variant="compact" />
            ))}
          </View>
        </View>
      </ScrollView>
    )
  }

  // Desktop layout: Two-column layout with map container and scrollable content panel
  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <View className="flex-row h-full px-12 py-8 gap-8">
        {/* Left Side - Map Container (40%) */}
        <Card size="lg" overflowHidden className="flex-[4]">
          <Map points={mapPoints} onPointPress={handlePointPress} />
        </Card>
        {/* Right Side - Scrollable Content Panel (60%) */}
        <View className="flex-[6]">
          <ScrollView
            className="flex-1 px-2"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Calendar Week View */}
            <View className="mb-6">
              <Card padding="md">
                <View className="flex-row justify-between">
                  {weekDays.map((day, index) => (
                    <View key={index} className="items-center gap-3">
                      <Text className="text-contentStrong dark:text-contentStrong-dark font-inter text-sm font-semibold">
                        {day}
                      </Text>
                      <View
                        className={`w-12 h-12 rounded-full justify-center items-center ${
                          weekDates[index] === today
                            ? 'bg-primary'
                            : 'bg-background dark:bg-background-dark'
                        }`}
                      >
                        <Text
                          className={`font-inter text-base ${
                            weekDates[index] === today
                              ? 'font-bold text-white'
                              : 'font-medium text-content dark:text-content-dark'
                          }`}
                        >
                          {weekDates[index]}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            </View>

            {/* Events List */}
            <View>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-content dark:text-content-dark font-inter text-2xl font-bold">
                  Upcoming Events
                </Text>
                <SecondaryButton onPress={() => router.push('/events')}>
                  See All
                </SecondaryButton>
              </View>

              <View className="gap-4">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} onPress={handleEventPress} variant="full" />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  )
}
