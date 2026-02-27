// This is the web desktop layout
import React from 'react'
import { View, Text, useWindowDimensions, ScrollView } from 'react-native'
import { ThumbsUp, MessageCircle, MapPin } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { useUser } from '../../components/contexts'
import { SecondaryButton, Card } from '../../components/ui'
import Map from '../../components/Map'
import { useRouter } from 'expo-router'
import { useMapPoints, useEventList, useWeekCalendar } from '../../hooks/useApiData'
import { MapPoint } from '../../utils/api'

// Import mobile component for responsive fallback
import MobileHome from './index'

export default function HomeScreenWeb() {
  const { width } = useWindowDimensions()
  const isMobile = width < 768

  // If mobile width, use mobile layout
  if (isMobile) {
    return <MobileHome />
  }

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

  const handleEventPress = (event: (typeof events)[0]) => {
    router.push(`/events/${event.id}`)
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
                <SecondaryButton onPress={() => router.push('/explore')}>
                  See All
                </SecondaryButton>
              </View>

              <View className="gap-4">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    pressable
                    onPress={() => handleEventPress(event)}
                    padding="md"
                    hoverBorderColor="primary"
                  >
                    <View className="gap-3">
                      <Text className="font-inter text-sm text-primary font-bold uppercase tracking-wide">
                        {event.time}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <MapPin size={16} color="#a1a1aa" />
                        <Text className="text-content dark:text-content-dark font-inter text-sm">
                          {event.location}
                        </Text>
                      </View>
                      <Text className="text-content dark:text-content-dark font-inter text-xl font-bold leading-tight mt-1">
                        {event.title}
                      </Text>
                      <Text className="text-content dark:text-content-dark text-base font-medium mt-2">
                        {event.attendees} people attending
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-8 pt-4">
                      <View className="flex-row items-center gap-2">
                        <ThumbsUp size={18} color="#a1a1aa" />
                        <Text className="text-content dark:text-content-dark font-inter text-sm font-medium">
                          {event.likes}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <MessageCircle size={18} color="#a1a1aa" />
                        <Text className="text-content dark:text-content-dark font-inter text-sm font-medium">
                          {event.comments}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  )
}
