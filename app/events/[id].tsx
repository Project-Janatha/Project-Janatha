import React, { useState } from 'react'
import { View, Text, ScrollView, Image, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { TabSegment, SecondaryButton, PrimaryButton } from 'components/ui'
import {
  ArrowLeft,
  Share,
  MapPin,
  Clock,
  Users,
  Info,
  MessageCircle,
  Calendar,
} from 'lucide-react-native'

// Hardcoded event data
const eventData = {
  '1': {
    id: '1',
    title: 'Bhagavad Gita Study Circle - Chapter 12',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=250&fit=crop',
    time: 'Today · 10:30 AM - 11:30 AM',
    location: 'Chinmaya Mission San Jose',
    address: '10160 Clayton Rd, San Jose, CA 95127',
    attendees: 14,
    pointOfContact: 'Ramesh Ji',
    description:
      'Join us for an in-depth study of Chapter 12 of the Bhagavad Gita, focusing on Bhakti Yoga and the path of devotion. This session will explore the qualities of a true devotee and practical ways to cultivate devotion in daily life.',
    isRegistered: true,
    attendeesList: [
      {
        id: 1,
        name: 'Theresa Hebert',
        role: 'Design manager @Setproduct',
        avatar:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 2,
        name: 'Jessica Chlen',
        role: 'Chief Design Officer',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 3,
        name: 'Diana Shelton',
        role: 'Senior UX designer',
        avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 4,
        name: 'Annie Huy Long',
        role: 'Digital designer & Motion expert',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 5,
        name: 'Morgan Melendez',
        role: 'Just a good girl',
        avatar:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
      },
    ],
    messages: [
      {
        id: 1,
        sender: 'Jessica Chlen',
        time: '3:30PM · 19 August 2025',
        message: 'Thank you everyone who could attend!',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 2,
        sender: 'Jessica Chlen',
        time: '9:20AM · 18 August 2025',
        message: 'We will be meeting on the 14th floor.',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      },
    ],
  },
  '2': {
    id: '2',
    title: 'Hanuman Chalisa Chanting Marathon',
    image: 'https://images.unsplash.com/photo-1464822759844-d150baec93d5?w=400&h=250&fit=crop',
    time: 'SUN, 8 PM - 11:49 PM',
    location: 'Meditation Hall',
    address: '10160 Clayton Rd, San Jose, CA 95127',
    attendees: 14,
    pointOfContact: 'Priya Ji',
    description:
      'Join us for a powerful chanting session of the Hanuman Chalisa. This marathon will help purify the mind and strengthen devotion to Lord Hanuman.',
    isRegistered: false,
    attendeesList: [],
    messages: [],
  },
  '3': {
    id: '3',
    title: 'Yoga and Meditation Session',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
    time: 'TUE, 7 PM - 8:30 PM',
    location: 'Main Hall',
    address: '10160 Clayton Rd, San Jose, CA 95127',
    attendees: 8,
    pointOfContact: 'Anjali Ji',
    description:
      'A peaceful session combining gentle yoga postures with guided meditation to help you find inner peace and balance.',
    isRegistered: false,
    attendeesList: [],
    messages: [],
  },
}

export default function EventDetailPage() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Details')

  const event = eventData[id as string]

  if (!event) {
    return (
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-2xl font-semibold mb-4">Event not found</Text>
        <SecondaryButton onPress={() => router.back()} className="mt-4">
          Go Back
        </SecondaryButton>
      </View>
    )
  }

  const renderDetailsTab = () => (
    <View className="gap-4">
      {/* Event Image */}
      <View className="rounded-xl overflow-hidden shadow">
        <Image source={{ uri: event.image }} style={{ width: '100%', height: 200 }} className="" />
      </View>

      {/* Event Information */}
      <View className="gap-3">
        {/* Time */}
        <View className="flex-row items-center gap-2">
          <Clock size={20} color="#FF9800" />
          <Text className="text-base font-medium text-foreground">{event.time}</Text>
        </View>

        {/* Location */}
        <View className="flex-row items-center gap-2">
          <MapPin size={20} color="#FF9800" />
          <View className="flex-1">
            <Text className="text-base font-medium text-foreground">{event.location}</Text>
            <Text className="text-sm text-muted-foreground">{event.address}</Text>
          </View>
        </View>

        {/* Attendees */}
        <View className="flex-row items-center gap-2">
          <Users size={20} color="#FF9800" />
          <Text className="text-base font-medium text-foreground">
            {event.attendees} People Going
          </Text>
        </View>

        {/* Point of Contact */}
        <View className="flex-row items-center gap-2">
          <Info size={20} color="#FF9800" />
          <View className="flex-1">
            <Text className="text-sm text-muted-foreground">Point of Contact:</Text>
            <Text className="text-base font-medium text-foreground">{event.pointOfContact}</Text>
          </View>
        </View>

        {/* Description */}
        <View className="gap-1 mt-2">
          <Text className="text-lg font-semibold">About this event</Text>
          <Text className="text-base text-muted-foreground leading-tight">{event.description}</Text>
        </View>
      </View>

      {/* Registration Status and Action Button */}
      {event.isRegistered ? (
        <View className="gap-2 mt-4">
          <Text className="text-base text-green-600 font-medium">
            You are registered for this event!
          </Text>
          <SecondaryButton className="mt-2">Cancel Registration</SecondaryButton>
        </View>
      ) : (
        <PrimaryButton className="mt-4">Attend Event</PrimaryButton>
      )}
    </View>
  )

  const renderPeopleTab = () => (
    <View className="gap-3">
      {event.attendeesList.length > 0 ? (
        event.attendeesList.map((attendee) => (
          <View
            key={attendee.id}
            className="bg-card rounded-xl shadow p-4 flex-row items-center gap-3 mb-2"
          >
            <Image
              source={{ uri: attendee.avatar }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              className="mr-3"
            />
            <View className="flex-1">
              <Text className="text-base font-medium">{attendee.name}</Text>
              <Text className="text-sm text-muted-foreground">{attendee.role}</Text>
            </View>
          </View>
        ))
      ) : (
        <View className="items-center py-8">
          <Users size={48} color="#888" />
          <Text className="text-base text-muted-foreground mt-3">No attendees yet</Text>
        </View>
      )}
    </View>
  )

  const renderMessagesTab = () => (
    <View className="gap-3">
      {event.messages.length > 0 ? (
        <>
          <View className="bg-gray-100 rounded-xl shadow p-4 mb-2">
            <Text className="text-sm text-muted-foreground text-center">
              Only the host can post messages
            </Text>
          </View>
          {event.messages.map((message) => (
            <View key={message.id} className="bg-card rounded-xl shadow p-4 flex-row gap-3 mb-2">
              <Image
                source={{ uri: message.avatar }}
                style={{ width: 36, height: 36, borderRadius: 18 }}
                className="mr-3"
              />
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-base font-medium">{message.sender}</Text>
                  <Text className="text-sm text-muted-foreground">{message.time}</Text>
                </View>
                <Text className="text-base text-foreground leading-tight">{message.message}</Text>
              </View>
            </View>
          ))}
        </>
      ) : (
        <View className="items-center py-8">
          <MessageCircle size={48} color="#888" />
          <Text className="text-base text-muted-foreground mt-3">No messages yet</Text>
        </View>
      )}
    </View>
  )

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Event Title */}
        <View className="px-4 py-3 bg-background border-b border-borderColor">
          <Text className="text-2xl font-bold text-center">{event.title}</Text>
        </View>

        {/* Tab Navigation - Only show if registered */}
        {event.isRegistered && (
          <View className="bg-background px-4 py-2">
            <TabSegment
              options={[
                { value: 'Details', label: 'Details' },
                { value: 'People', label: 'People' },
                { value: 'Messages', label: 'Messages' },
              ]}
              value={activeTab}
              onValueChange={setActiveTab}
              variant="subtle"
            />
          </View>
        )}

        <View className="px-4 gap-4 pb-8">
          {!event.isRegistered ? (
            renderDetailsTab()
          ) : (
            <>
              {activeTab === 'Details' && renderDetailsTab()}
              {/* You can refactor renderPeopleTab and renderMessagesTab similarly */}
            </>
          )}
        </View>
      </View>
    </ScrollView>
  )
}
