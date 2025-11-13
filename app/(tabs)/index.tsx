import React, { useContext } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { MapPin, ChevronRight, ThumbsUp, MessageCircle } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { UserContext } from 'components/contexts'
import { SecondaryButton } from 'components/ui'
import { Map } from 'components'
import { useRouter } from 'expo-router'

type MapPoint = {
  id: string
  type: 'center' | 'event'
  name: string
  latitude: number
  longitude: number
}

/**
 * HomeScreen Component
 * @return {JSX.Element} A HomeScreen component that displays the main dashboard with events and calendar.
 */
export default function HomeScreen() {
  const { user } = useContext(UserContext)
  const router = useRouter()
  console.log('User in HomeScreen:', user)

  const userName = user?.username || 'Pranav'

  // Map points data - centers and events with proper coordinates
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

  // Calendar data - showing current week
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const weekDates = [18, 19, 20, 21, 22, 23, 24]
  const today = 19

  // Event data
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

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark px-4 pt-4">
      <View className="flex-1 gap-4 px-4 pt-4 pb-8">
        {/* Interactive Map Section */}
        <View className="bg-card rounded-2xl shadow-sm mb-4 overflow-hidden">
          <View className="h-[200px] rounded-t-2xl overflow-hidden">
            <Map points={mapPoints} onPointPress={handlePointPress} />
          </View>

          <Pressable
            className="flex-row justify-between items-center p-4 active:opacity-70"
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
              <Text className="text-content dark:text-content-dark font-inter">
                Find centers and events near you
              </Text>
            </View>
            <ChevronRight size={20} color="#a1a1aa" />
          </Pressable>
        </View>

        {/* Your Week Section */}
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-content dark:text-content-dark font-intertext-xl font-semibold text-foreground">
              Your week
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

          {/* Calendar Week View */}
          <View className="flex-row justify-between px-2">
            {weekDays.map((day, index) => (
              <View key={index} className="items-center gap-2 min-w-[40px]">
                <Text className="text-contentStrong dark:text-contentStrong-dark font-inter text-sm text-muted-foreground font-medium">
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
            <Pressable
              key={event.id}
              onPress={() => handleEventPress(event)}
              className="bg-card rounded-2xl shadow-sm overflow-hidden active:scale-[0.98]"
            >
              <View className="p-4 gap-2">
                <Text className="font-inter text-sm text-primary font-medium">{event.time}</Text>
                <Text className="text-content dark:text-content-dark font-inter text-sm text-muted-foreground">
                  {event.location}
                </Text>
                <Text className="text-content dark:text-content-dark font-inter text-lg font-semibold text-foreground leading-tight">
                  {event.title}
                </Text>
                <Text className="text-content dark:text-content-dark text-sm text-muted-foreground mt-1">
                  {event.attendees} people
                </Text>
              </View>

              <View className="px-4 pb-4 flex-row justify-end gap-4">
                <View className="flex-row items-center gap-1">
                  <ThumbsUp size={16} color="#a1a1aa" className="text-muted-foreground" />
                  <Text className="text-content dark:text-content-dark font-inter text-sm text-muted-foreground">
                    {event.likes}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <MessageCircle size={16} color="#a1a1aa" className="text-muted-foreground" />
                  <Text className="text-content dark:text-content-dark font-inter text-sm text-muted-foreground">
                    {event.comments}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Demo Toast Button (remove in production) */}
        <Pressable
          onPress={() => {
            Toast.show({
              type: 'success',
              text1: 'Welcome back, ' + userName + '!',
              text2: 'You have 2 upcoming events this week',
            })
          }}
          className="bg-primary rounded-xl p-4 items-center mt-4"
        >
          <Text className="text-primary-foreground font-semibold">Show Welcome Toast</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}
