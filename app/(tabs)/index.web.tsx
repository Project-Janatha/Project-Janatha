// This is the web desktop layout
import React, { useContext } from 'react'
import { View, Text, Pressable, useWindowDimensions, ScrollView } from 'react-native'
import { ThumbsUp, MessageCircle, MapPin, ChevronRight } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { UserContext } from 'components/contexts'
import { SecondaryButton } from 'components/ui'
import { Map } from 'components'
import { useRouter } from 'expo-router'

// Import mobile component for responsive fallback
import MobileHome from './index'

type MapPoint = {
  id: string
  type: 'center' | 'event'
  name: string
  latitude: number
  longitude: number
}

export default function HomeScreenWeb() {
  const { width } = useWindowDimensions()
  const isMobile = width < 768

  // If mobile width, use mobile layout
  if (isMobile) {
    return <MobileHome />
  }

  const { user } = useContext(UserContext)
  const router = useRouter()

  const mapPoints: MapPoint[] = [
    {
      id: '1',
      type: 'center',
      name: 'Chinmaya Mission San Jose',
      latitude: 37.2431,
      longitude: -121.7831,
    },
    {
      id: '2',
      type: 'center',
      name: 'Chinmaya Mission West',
      latitude: 37.8599,
      longitude: -122.4856,
    },
    {
      id: '3',
      type: 'center',
      name: 'Chinmaya Mission San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    {
      id: '4',
      type: 'event',
      name: 'Bhagavad Gita Study Circle',
      latitude: 37.2631,
      longitude: -121.8031,
    },
    {
      id: '5',
      type: 'event',
      name: 'Hanuman Chalisa Chanting',
      latitude: 37.8699,
      longitude: -122.4756,
    },
    {
      id: '6',
      type: 'event',
      name: 'Yoga and Meditation Session',
      latitude: 37.7849,
      longitude: -122.4094,
    },
  ]

  const handlePointPress = (point: MapPoint) => {
    if (point.type === 'center') {
      router.push(`/center/${point.id}`)
      Toast.show({
        type: 'info',
        text1: point.name,
        text2: 'Viewing center details',
      })
    } else if (point.type === 'event') {
      router.push(`/events/${point.id}`)
      Toast.show({
        type: 'info',
        text1: point.name,
        text2: 'Viewing event details',
      })
    }
  }

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const weekDates = [18, 19, 20, 21, 22, 23, 24]
  const today = 19

  const events = [
    {
      id: 1,
      time: 'TODAY • 10:30 AM - 11:30 AM',
      location: 'Young Museum',
      title: 'Bhagavad Gita Study Circle - Chapter 12',
      attendees: 14,
      likes: 0,
      comments: 0,
    },
    {
      id: 2,
      time: 'SUN, 8 PM - 11:49 PM',
      location: 'Meditation Hall',
      title: 'Hanuman Chalisa Chanting Marathon',
      attendees: 14,
      likes: 0,
      comments: 0,
    },
  ]

  const handleEventPress = (event: (typeof events)[0]) => {
    router.push(`/events/${event.id}`)
    Toast.show({
      type: 'success',
      text1: 'Event Selected',
      text2: event.title,
    })
  }

  // Desktop layout: Cleaner structure with proper spacing
  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <View className="flex-row h-full px-12 py-8 gap-8">
        {/* Left Side - Map Preview (40%) */}
        <View className="flex-[4] bg-card rounded-3xl shadow-md">
          <Pressable
            className="flex-1 rounded-2xl overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-transform"
            onPress={() => {
              router.push('/explore')
              Toast.show({
                type: 'info',
                text1: 'Explore',
                text2: 'Finding centers and events near you',
              })
            }}
          >
            <Map points={mapPoints} onPointPress={handlePointPress} />
          </Pressable>
        </View>
        {/* Right Side - Scrollable Calendar & Events (60%) */}
        <View className="flex-[6]">
          <ScrollView
            className="flex-1 px-2"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Your Week Section */}
            <View className="mb-6">
              <Text className="text-content dark:text-content-dark font-inter text-2xl font-bold mb-4">
                Your Week
              </Text>

              {/* Calendar Week View */}
              <View className="bg-card rounded-2xl p-6 shadow-md">
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
              </View>
            </View>

            {/* Quick Stats */}
            <View className="bg-card rounded-2xl p-6 shadow-md mb-6">
              <Text className="text-content dark:text-content-dark font-inter text-xl font-bold mb-4">
                Quick Stats
              </Text>
              <View className="gap-3">
                <Text className="text-content dark:text-content-dark font-inter text-base">
                  📅 2 events this week
                </Text>
                <Text className="text-content dark:text-content-dark font-inter text-base">
                  🏛️ 3 centers nearby
                </Text>
                <Text className="text-content dark:text-content-dark font-inter text-base">
                  👥 28 total attendees
                </Text>
              </View>
            </View>

            {/* Events List */}
            <View>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-content dark:text-content-dark font-inter text-2xl font-bold">
                  Upcoming Events
                </Text>
                <SecondaryButton
                  onPress={() => {
                    router.push('/events' as any)
                    Toast.show({
                      type: 'info',
                      text1: 'All Events',
                      text2: 'Viewing all upcoming events',
                    })
                  }}
                >
                  See All
                </SecondaryButton>
              </View>

              <View className="gap-4">
                {events.map((event) => (
                  <Pressable
                    key={event.id}
                    onPress={() => handleEventPress(event)}
                    className="bg-card rounded-2xl hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    <View className="p-6 gap-3">
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

                    <View className="px-6 pb-5 flex-row items-center gap-8 pt-4">
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
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  )
}
