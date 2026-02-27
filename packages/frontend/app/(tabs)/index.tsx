// This is the mobile/native layout
import React, { Suspense } from 'react'
import { View, Text, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native'
import { MapPin, ChevronRight } from 'lucide-react-native'
import { useUser } from '../../components/contexts'
import { SecondaryButton, Card } from '../../components/ui'
import { MapPreview } from '../../components'
import { useRouter } from 'expo-router'
import { useMapPoints, useEventList, useWeekCalendar } from '../../hooks/useApiData'
import { MapPoint } from '../../utils/api'
import { EventCard } from '../../components/EventCard'

// Lazy load Map to avoid loading heavy web dependencies on mobile web
const Map = React.lazy(() => import('../../components/Map'))

export default function HomeScreen() {
  const { user } = useUser()
  const router = useRouter()
  const { points: mapPoints } = useMapPoints()
  const { events } = useEventList()
  const { weekDays, weekDates, today } = useWeekCalendar()

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

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="flex-1 gap-4 px-4 pt-4 pb-8">
        {/* Interactive Map Section */}
        <Card className="mb-4">
          <View className="h-[200px] rounded-t-2xl overflow-hidden">
            {Platform.OS === 'web' ? (
              <MapPreview onPress={() => router.push('/explore')} pointCount={mapPoints.length} />
            ) : (
              <Suspense
                fallback={
                  <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-neutral-800">
                    <ActivityIndicator size="large" color="#0ea5e9" />
                  </View>
                }
              >
                <Map points={mapPoints} onPointPress={handlePointPress} />
              </Suspense>
            )}
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
            <SecondaryButton onPress={() => router.push('/events')}>
              See All
            </SecondaryButton>
          </View>

          {/* Calendar Week View */}
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
