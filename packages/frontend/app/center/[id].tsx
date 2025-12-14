import React, { useState } from 'react'
import { View, Text, ScrollView, Image, Pressable, Linking } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'
import {
  MapPin,
  Globe,
  Phone,
  Calendar,
  User,
  ChevronRight,
  ChevronLeft,
  ThumbsUp,
  MessageCircle,
} from 'lucide-react-native'
import { TabSegment, IconButton, SecondaryButton, PrimaryButton } from 'components/ui'

// Hardcoded center data
const centerData = {
  '1': {
    id: '1',
    name: 'Chinmaya Mission San Jose',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=250&fit=crop',
    address: '10160 Clayton Rd, San Jose, CA 95127',
    website: 'https://www.cmsj.org/',
    phone: '+1 408 254 8392',
    upcomingEvents: 24,
    pointOfContact: 'Ramesh Ji',
    acharya: 'Acharya Brahmachari Soham Ji',
  },
  '2': {
    id: '2',
    name: 'Chinmaya Mission West',
    image: 'https://images.unsplash.com/photo-1464822759844-d150baec93d5?w=400&h=250&fit=crop',
    address: '560 Bridgeway, Sausalito, CA 94965',
    website: 'https://www.chinmayamissionwest.org/',
    phone: '+1 415 332 2182',
    upcomingEvents: 18,
    pointOfContact: 'Priya Ji',
    acharya: 'Acharya Swami Ishwarananda',
  },
  '3': {
    id: '3',
    name: 'Chinmaya Mission San Francisco',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
    address: '631 Irving St, San Francisco, CA 94122',
    website: 'https://www.chinmayasf.org/',
    phone: '+1 415 661 8499',
    upcomingEvents: 15,
    pointOfContact: 'Anjali Ji',
    acharya: 'Acharya Swami Tejomayananda',
  },
}

// Sample events data for the calendar
const sampleEvents = [
  {
    id: 1,
    date: 26,
    time: 'TODAY • 10:30 AM - 11:30 AM',
    location: 'Young Museum',
    title: 'Bhagavad Gita Study Circle - Chapter 12',
    attendees: 14,
    likes: 0,
    comments: 0,
    color: 'red' as const,
  },
  {
    id: 2,
    date: 29,
    time: 'SUN, 8 PM - 11:49 PM',
    location: 'Meditation Hall',
    title: 'Hanuman Chalisa Chanting Marathon',
    attendees: 14,
    likes: 0,
    comments: 0,
    color: 'blue' as const,
  },
  {
    id: 3,
    date: 31,
    time: 'TUE, 7 PM - 8:30 PM',
    location: 'Main Hall',
    title: 'Yoga and Meditation Session',
    attendees: 8,
    likes: 2,
    comments: 1,
    color: 'green' as const,
  },
]

export default function CenterDetailPage() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Details')

  const center = centerData[id as string]

  if (!center) {
    return (
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-2xl font-semibold text-foreground mb-4">Center not found</Text>
        <Pressable onPress={() => router.back()} className="bg-primary rounded-xl px-6 py-3">
          <Text className="text-primary-foreground font-semibold">Go Back</Text>
        </Pressable>
      </View>
    )
  }

  // Calendar component
  const CalendarView = () => {
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    const dates = [
      [null, null, null, null, 1, 2, 3],
      [4, 5, 6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15, 16, 17],
      [18, 19, 20, 21, 22, 23, 24],
      [25, 26, 27, 28, 29, 30, 31],
    ]

    const getEventForDate = (date: number) => {
      return sampleEvents.find((event) => event.date === date)
    }

    const getDateColor = (date: number) => {
      const event = getEventForDate(date)
      if (!event) return ''
      return event.color === 'red'
        ? 'bg-red-100'
        : event.color === 'blue'
        ? 'bg-blue-100'
        : 'bg-green-100'
    }

    const getDotColor = (color: 'red' | 'blue' | 'green') => {
      return color === 'red' ? 'bg-red-500' : color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
    }

    return (
      <View className="gap-4">
        {/* Calendar Header */}
        <View className="flex-row justify-between items-center px-2">
          <IconButton
            onPress={() => {
              Toast.show({
                type: 'info',
                text1: 'Previous Month',
                text2: 'July 2025',
              })
            }}
          >
            <ChevronLeft size={16} />
          </IconButton>
          <Text className="text-lg font-semibold text-foreground">August 2025</Text>
          <IconButton
            onPress={() => {
              Toast.show({
                type: 'info',
                text1: 'Next Month',
                text2: 'September 2025',
              })
            }}
          >
            <ChevronRight size={16} />
          </IconButton>
        </View>

        {/* Days of week header */}
        <View className="flex-row justify-between px-2">
          {daysOfWeek.map((day, index) => (
            <View key={index} className="w-10 items-center">
              <Text className="text-sm text-muted-foreground font-medium">{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View className="gap-1">
          {dates.map((week, weekIndex) => (
            <View key={weekIndex} className="flex-row justify-between px-2">
              {week.map((date, dayIndex) => (
                <View key={dayIndex} className="w-10 items-center">
                  {date && (
                    <Pressable
                      onPress={() => {
                        const event = getEventForDate(date)
                        if (event) {
                          Toast.show({
                            type: 'info',
                            text1: `${event.title}`,
                            text2: event.time,
                          })
                        }
                      }}
                      className={`w-9 h-9 rounded-lg justify-center items-center relative ${
                        date === 26 ? 'bg-foreground' : getDateColor(date)
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          date === 26
                            ? 'font-semibold text-background'
                            : 'font-normal text-foreground'
                        }`}
                      >
                        {date}
                      </Text>
                      {getEventForDate(date) && date !== 26 && (
                        <View
                          className={`absolute bottom-0.5 w-1 h-1 rounded-full ${getDotColor(
                            getEventForDate(date)!.color
                          )}`}
                        />
                      )}
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Events List */}
        <View className="gap-3 mt-2">
          {sampleEvents
            .filter((event) => event.date === 26)
            .map((event) => (
              <EventCard key={event.id} event={event} opacity={1} />
            ))}

          {sampleEvents
            .filter((event) => event.date !== 26)
            .map((event) => (
              <EventCard key={event.id} event={event} opacity={0.8} />
            ))}
        </View>
      </View>
    )
  }

  const EventCard = ({ event, opacity }: { event: (typeof sampleEvents)[0]; opacity: number }) => {
    return (
      <Pressable
        onPress={() => {
          router.push(`/events/${event.id}`)
          Toast.show({
            type: 'success',
            text1: 'Event Selected',
            text2: event.title,
          })
        }}
        style={{ opacity }}
        className="bg-card rounded-2xl shadow-sm overflow-hidden active:scale-[0.98]"
      >
        <View className="p-4 gap-2">
          <Text className="text-sm text-primary font-medium">{event.time}</Text>
          <Text className="text-sm text-muted-foreground">{event.location}</Text>
          <Text className="text-base font-semibold text-foreground leading-tight">
            {event.title}
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">{event.attendees} people</Text>
        </View>
      </Pressable>
    )
  }
}
