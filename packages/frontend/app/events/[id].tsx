import React, { useState } from 'react'
import { View, Text, ScrollView, Image, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { TabSegment, SecondaryButton, PrimaryButton } from '../../components/ui'
import {
  MapPin,
  Clock,
  Users,
  Info,
  MessageCircle,
} from 'lucide-react-native'
import { useEventDetail } from '../../hooks/useApiData'

export default function EventDetailPage() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Details')
  const { event, attendees, messages, loading } = useEventDetail(id as string)
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null)

  // Initialize registration state from event data once loaded
  if (isRegistered === null && event) {
    setIsRegistered(event.isRegistered ?? false)
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background dark:bg-background-dark">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-4 text-content dark:text-content-dark">Loading event...</Text>
      </View>
    )
  }

  if (!event) {
    return (
      <View className="flex-1 justify-center items-center px-4 bg-background dark:bg-background-dark">
        <Text className="text-2xl font-semibold mb-4 text-content dark:text-content-dark">
          Event not found
        </Text>
        <SecondaryButton onPress={() => router.back()} className="mt-4">
          Go Back
        </SecondaryButton>
      </View>
    )
  }

  const handleToggleRegistration = () => {
    setIsRegistered((prev) => !prev)
    // TODO: Call backend to register/unregister when endpoint is ready
    // authenticatedFetch('/api/updateEvent', { method: 'POST', body: ... })
  }

  const renderDetailsTab = () => (
    <View className="gap-4">
      {/* Event Image */}
      <View className="rounded-xl overflow-hidden shadow">
        <Image
          source={{ uri: event.image || 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=250&fit=crop' }}
          style={{ width: '100%', height: 200 }}
        />
      </View>

      {/* Event Information */}
      <View className="gap-3">
        {/* Time */}
        <View className="flex-row items-center gap-2">
          <Clock size={20} color="#f97316" />
          <Text className="text-base font-medium text-content dark:text-content-dark">
            {event.time}
          </Text>
        </View>

        {/* Location */}
        <View className="flex-row items-center gap-2">
          <MapPin size={20} color="#f97316" />
          <View className="flex-1">
            <Text className="text-base font-medium text-content dark:text-content-dark">
              {event.location}
            </Text>
            {event.address && (
              <Text className="text-sm text-contentStrong dark:text-contentStrong-dark">
                {event.address}
              </Text>
            )}
          </View>
        </View>

        {/* Attendees */}
        <View className="flex-row items-center gap-2">
          <Users size={20} color="#f97316" />
          <Text className="text-base font-medium text-content dark:text-content-dark">
            {event.attendees} People Going
          </Text>
        </View>

        {/* Point of Contact */}
        {event.pointOfContact && (
          <View className="flex-row items-center gap-2">
            <Info size={20} color="#f97316" />
            <View className="flex-1">
              <Text className="text-sm text-contentStrong dark:text-contentStrong-dark">
                Point of Contact:
              </Text>
              <Text className="text-base font-medium text-content dark:text-content-dark">
                {event.pointOfContact}
              </Text>
            </View>
          </View>
        )}

        {/* Description */}
        {event.description && (
          <View className="gap-1 mt-2">
            <Text className="text-lg font-semibold text-content dark:text-content-dark">
              About this event
            </Text>
            <Text className="text-base text-contentStrong dark:text-contentStrong-dark leading-tight">
              {event.description}
            </Text>
          </View>
        )}
      </View>

      {/* Registration Status and Action Button */}
      {isRegistered ? (
        <View className="gap-2 mt-4">
          <Text className="text-base text-green-600 dark:text-green-400 font-medium">
            You are registered for this event!
          </Text>
          <SecondaryButton onPress={handleToggleRegistration} className="mt-2">
            Cancel Registration
          </SecondaryButton>
        </View>
      ) : (
        <PrimaryButton onPress={handleToggleRegistration} className="mt-4">
          Attend Event
        </PrimaryButton>
      )}
    </View>
  )

  const renderPeopleTab = () => (
    <View className="gap-3">
      {attendees.length > 0 ? (
        attendees.map((attendee, index) => (
          <View
            key={index}
            className="bg-muted/20 dark:bg-muted-dark/20 rounded-xl shadow p-4 flex-row items-center gap-3 mb-2"
          >
            {attendee.image && (
              <Image
                source={{ uri: attendee.image }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
                className="mr-3"
              />
            )}
            <View className="flex-1">
              <Text className="text-base font-medium text-content dark:text-content-dark">
                {attendee.name}
              </Text>
              {attendee.subtitle ? (
                <Text className="text-sm text-contentStrong dark:text-contentStrong-dark">
                  {attendee.subtitle}
                </Text>
              ) : null}
            </View>
          </View>
        ))
      ) : (
        <View className="items-center py-8">
          <Users size={48} color="#888" />
          <Text className="text-base text-contentStrong dark:text-contentStrong-dark mt-3">
            No attendees yet
          </Text>
        </View>
      )}
    </View>
  )

  const renderMessagesTab = () => (
    <View className="gap-3">
      {messages.length > 0 ? (
        <>
          <View className="bg-muted/20 dark:bg-muted-dark/20 rounded-xl shadow p-4 mb-2">
            <Text className="text-sm text-contentStrong dark:text-contentStrong-dark text-center">
              Only the host can post messages
            </Text>
          </View>
          {messages.map((message, index) => (
            <View
              key={index}
              className="bg-muted/20 dark:bg-muted-dark/20 rounded-xl shadow p-4 flex-row gap-3 mb-2"
            >
              {message.image && (
                <Image
                  source={{ uri: message.image }}
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                  className="mr-3"
                />
              )}
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-base font-medium text-content dark:text-content-dark">
                    {message.author}
                  </Text>
                  <Text className="text-sm text-contentStrong dark:text-contentStrong-dark">
                    {message.timestamp}
                  </Text>
                </View>
                <Text className="text-base text-content dark:text-content-dark leading-tight">
                  {message.text}
                </Text>
              </View>
            </View>
          ))}
        </>
      ) : (
        <View className="items-center py-8">
          <MessageCircle size={48} color="#888" />
          <Text className="text-base text-contentStrong dark:text-contentStrong-dark mt-3">
            No messages yet
          </Text>
        </View>
      )}
    </View>
  )

  // Always show tabs (not gated behind registration)
  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="flex-1">
        {/* Event Title */}
        <View className="px-4 py-3 bg-background dark:bg-background-dark border-b border-borderColor dark:border-borderColor-dark">
          <Text className="text-2xl font-bold text-center text-content dark:text-content-dark">
            {event.title}
          </Text>
        </View>

        {/* Tab Navigation - Always visible */}
        <View className="bg-background dark:bg-background-dark px-4 py-2">
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

        <View className="px-4 gap-4 pb-8">
          {activeTab === 'Details' && renderDetailsTab()}
          {activeTab === 'People' && renderPeopleTab()}
          {activeTab === 'Messages' && renderMessagesTab()}
        </View>
      </View>
    </ScrollView>
  )
}
