// This is the web desktop layout
import React, { useContext, useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native'
import { MapPin, ChevronRight, ThumbsUp, MessageCircle } from 'lucide-react-native'
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

  const userName = user?.username || 'Pranav'

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

  // Desktop layout with sidebar
  return (
    <View className="flex-1 flex-row bg-background dark:bg-background-dark">
      {/* Main Content - 70% */}
      <ScrollView className="flex-[7] px-8 pt-6">
        <View className="max-w-4xl">
          {/* Interactive Map Section */}
          <View className="bg-card rounded-2xl shadow-sm mb-6 overflow-hidden">
            <View className="h-[300px] rounded-t-2xl overflow-hidden">
              <Map points={mapPoints} onPointPress={handlePointPress} />
            </View>

            <Pressable
              className="flex-row justify-between items-center p-5 active:opacity-70"
              onPress={() => {
                router.push('/explore')
                Toast.show({
                  type: 'info',
                  text1: 'Explore',
                  text2: 'Finding centers and events near you',
                })
              }}
            >
              <View className="flex-row items-center gap-2">
                <MapPin size={20} color="#0ea5e9" />
                <Text className="text-content dark:text-content-dark font-inter text-base">
                  Find centers and events near you
                </Text>
              </View>
              <ChevronRight size={20} color="#a1a1aa" />
            </Pressable>
          </View>

          {/* Events List */}
          <View className="gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-content dark:text-content-dark font-inter text-2xl font-semibold">
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

            {events.map((event) => (
              <Pressable
                key={event.id}
                onPress={() => handleEventPress(event)}
                className="bg-card rounded-2xl shadow-sm overflow-hidden active:scale-[0.99] transition-transform"
              >
                <View className="p-5 gap-3">
                  <Text className="font-inter text-sm text-primary font-medium">{event.time}</Text>
                  <Text className="text-content dark:text-content-dark font-inter text-sm">
                    {event.location}
                  </Text>
                  <Text className="text-content dark:text-content-dark font-inter text-xl font-semibold leading-tight">
                    {event.title}
                  </Text>
                  <Text className="text-content dark:text-content-dark text-sm mt-1">
                    {event.attendees} people attending
                  </Text>
                </View>

                <View className="px-5 pb-5 flex-row justify-end gap-6">
                  <View className="flex-row items-center gap-2">
                    <ThumbsUp size={18} color="#a1a1aa" />
                    <Text className="text-content dark:text-content-dark font-inter text-sm">
                      {event.likes}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MessageCircle size={18} color="#a1a1aa" />
                    <Text className="text-content dark:text-content-dark font-inter text-sm">
                      {event.comments}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sidebar - 30% */}
      <View className="flex-[3] border-l border-gray-200 dark:border-neutral-800 p-6">
        <View className="gap-4">
          <Text className="text-content dark:text-content-dark font-inter text-xl font-semibold">
            Your Week
          </Text>

          {/* Calendar Week View */}
          <View className="bg-card rounded-xl p-4 shadow-sm">
            <View className="flex-row justify-between">
              {weekDays.map((day, index) => (
                <View key={index} className="items-center gap-3">
                  <Text className="text-contentStrong dark:text-contentStrong-dark font-inter text-sm font-medium">
                    {day}
                  </Text>
                  <View
                    className={`w-10 h-10 rounded-full justify-center items-center ${
                      weekDates[index] === today ? 'bg-primary' : 'bg-gray-100 dark:bg-neutral-800'
                    }`}
                  >
                    <Text
                      className={`font-inter text-base ${
                        weekDates[index] === today
                          ? 'font-semibold text-white'
                          : 'font-normal text-content dark:text-content-dark'
                      }`}
                    >
                      {weekDates[index]}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Stats */}
          <View className="bg-card rounded-xl p-4 shadow-sm gap-3">
            <Text className="text-content dark:text-content-dark font-inter text-lg font-semibold">
              Quick Stats
            </Text>
            <View className="gap-2">
              <Text className="text-content dark:text-content-dark font-inter text-sm">
                📅 2 events this week
              </Text>
              <Text className="text-content dark:text-content-dark font-inter text-sm">
                🏛️ 3 centers nearby
              </Text>
              <Text className="text-content dark:text-content-dark font-inter text-sm">
                👥 28 total attendees
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
