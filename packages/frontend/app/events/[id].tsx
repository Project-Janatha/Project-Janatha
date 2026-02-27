import React, { useState } from 'react'
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, Share2, MapPin, Users, User, CheckCircle, Info } from 'lucide-react-native'
import { useEventDetail } from '../../hooks/useApiData'
import { useUser } from '../../components/contexts'
import { Badge, UnderlineTabBar } from '../../components/ui'

// ── Helpers ──────────────────────────────────────────────────────────────

/** Format an ISO date string like "Saturday, March 15" */
function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00') // noon to avoid timezone issues
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function EventDetailPage() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('Details')
  const { event, attendees, messages, loading, toggleRegistration, isToggling } = useEventDetail(
    id as string
  )

  const handleToggleRegistration = async () => {
    if (!user?.username) return
    try {
      await toggleRegistration(user.username)
    } catch {
      Alert.alert('Error', 'Failed to update registration. Please try again.')
    }
  }

  // ── Loading state ────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#E8862A" />
        </View>
      </SafeAreaView>
    )
  }

  // ── Not-found state ──────────────────────────────────────────────────

  if (!event) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 22, fontFamily: 'Inter-SemiBold', color: '#1C1917', marginBottom: 16 }}>
            Event not found
          </Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#E8862A' }}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  // ── Derived state ────────────────────────────────────────────────────

  const isPast = event.date ? new Date(event.date + 'T23:59:59') < new Date() : false
  const isRegistered = !!event.isRegistered
  const iconColor = isPast ? '#A8A29E' : '#E8862A'

  // ── Shared header ────────────────────────────────────────────────────

  const renderHeader = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
      <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <ChevronLeft size={22} color="#1C1917" />
        <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#1C1917' }}>Back</Text>
      </Pressable>
      <Pressable onPress={() => {}} hitSlop={8}>
        <Share2 size={22} color="#1C1917" />
      </Pressable>
    </View>
  )

  // ── Meta row component ───────────────────────────────────────────────

  const MetaRow = ({
    icon,
    primary,
    secondary,
    right,
  }: {
    icon: React.ReactNode
    primary: string
    secondary?: string
    right?: React.ReactNode
  }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: '#F5F5F4',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontFamily: 'Inter-Medium', color: '#1C1917' }}>{primary}</Text>
        {secondary ? (
          <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: '#78716C' }}>{secondary}</Text>
        ) : null}
      </View>
      {right}
    </View>
  )

  // ── Avatar stack (3 overlapping circles) ─────────────────────────────

  const AvatarStack = () => {
    const shown = attendees.slice(0, 3)
    return (
      <View style={{ flexDirection: 'row' }}>
        {shown.map((a, i) => (
          <Image
            key={i}
            source={{ uri: a.image }}
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: '#FFFFFF',
              marginLeft: i === 0 ? 0 : -8,
            }}
          />
        ))}
      </View>
    )
  }

  // ────────────────────────────────────────────────────────────────────
  // DEFAULT (UNREGISTERED) + PAST STATE
  // ────────────────────────────────────────────────────────────────────

  if (!isRegistered) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {renderHeader()}

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: isPast ? 40 : 120 }}>
          {/* Hero image */}
          <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
            {event.image ? (
              <View style={{ borderRadius: 16, overflow: 'hidden', height: 220 }}>
                <Image
                  source={{ uri: event.image }}
                  style={{ width: '100%', height: 220, opacity: isPast ? 0.75 : 1 }}
                />
                {isPast && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.15)',
                    }}
                  />
                )}
                {/* Badge overlay */}
                <View style={{ position: 'absolute', bottom: 16, left: 16 }}>
                  <Badge label={isPast ? 'Past Event' : 'Upcoming'} variant={isPast ? 'past' : 'upcoming'} />
                </View>
              </View>
            ) : (
              <View
                style={{
                  borderRadius: 16,
                  height: 220,
                  backgroundColor: '#F5F5F4',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View style={{ position: 'absolute', bottom: 16, left: 16 }}>
                  <Badge label={isPast ? 'Past Event' : 'Upcoming'} variant={isPast ? 'past' : 'upcoming'} />
                </View>
              </View>
            )}
          </View>

          {/* Title */}
          <View style={{ paddingHorizontal: 16, marginBottom: 4 }}>
            <Text style={{ fontSize: 26, fontFamily: 'Inter-Bold', color: '#1C1917' }}>
              {event.title}
            </Text>
          </View>

          {/* Date / time */}
          <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: '#78716C' }}>
              {formatDate(event.date)}
              {event.time ? ` · ${event.time}` : ''}
            </Text>
          </View>

          {/* Attended banner (past only) */}
          {isPast && (
            <View
              style={{
                marginHorizontal: 16,
                marginBottom: 20,
                backgroundColor: '#ECFDF5',
                borderRadius: 10,
                paddingVertical: 14,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <CheckCircle size={20} color="#059669" />
              <View>
                <Text style={{ fontSize: 15, fontFamily: 'Inter-SemiBold', color: '#059669' }}>
                  You attended this event
                </Text>
                {event.attendees > 1 && (
                  <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: '#059669' }}>
                    Along with {event.attendees - 1} others
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Meta rows */}
          <View style={{ gap: 16 }}>
            {/* Location */}
            <MetaRow
              icon={<MapPin size={20} color={iconColor} />}
              primary={event.location}
              secondary={event.address}
            />

            {/* Attendees */}
            <MetaRow
              icon={<Users size={20} color={iconColor} />}
              primary={`${event.attendees} ${isPast ? 'attended' : 'attending'}`}
              right={<AvatarStack />}
            />

            {/* Point of contact */}
            {event.pointOfContact && (
              <MetaRow
                icon={<User size={20} color={iconColor} />}
                primary={`Contact: ${event.pointOfContact}`}
              />
            )}
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: '#E7E5E4', marginHorizontal: 16, marginTop: 24, marginBottom: 16 }} />

          {/* About */}
          <View style={{ paddingHorizontal: 16 }}>
            <Text
              style={{
                fontSize: 11,
                fontFamily: 'Inter-Medium',
                color: '#A8A29E',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              About
            </Text>
            <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: '#78716C', lineHeight: 20 }}>
              {event.description || 'No description provided.'}
            </Text>
          </View>
        </ScrollView>

        {/* Sticky CTA — only for non-past events */}
        {!isPast && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 28,
            }}
          >
            <Pressable
              onPress={handleToggleRegistration}
              disabled={isToggling}
              style={{
                height: 52,
                borderRadius: 12,
                backgroundColor: '#E8862A',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {isToggling ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{ fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#FFFFFF' }}>
                  Attend Event
                </Text>
              )}
            </Pressable>
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'Inter-Regular',
                color: '#A8A29E',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              Free · No registration required
            </Text>
          </View>
        )}
      </SafeAreaView>
    )
  }

  // ────────────────────────────────────────────────────────────────────
  // REGISTERED STATE (with tabs)
  // ────────────────────────────────────────────────────────────────────

  const renderDetailsTab = () => (
    <View style={{ gap: 16, paddingTop: 16 }}>
      {/* Hero image */}
      <View style={{ paddingHorizontal: 16 }}>
        {event.image ? (
          <View style={{ borderRadius: 16, overflow: 'hidden', height: 220 }}>
            <Image source={{ uri: event.image }} style={{ width: '100%', height: 220 }} />
            <View style={{ position: 'absolute', bottom: 16, left: 16 }}>
              <Badge label="Upcoming" variant="upcoming" />
            </View>
          </View>
        ) : (
          <View
            style={{
              borderRadius: 16,
              height: 220,
              backgroundColor: '#F5F5F4',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View style={{ position: 'absolute', bottom: 16, left: 16 }}>
              <Badge label="Upcoming" variant="upcoming" />
            </View>
          </View>
        )}
      </View>

      {/* Date / time */}
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: '#78716C' }}>
          {formatDate(event.date)}
          {event.time ? ` · ${event.time}` : ''}
        </Text>
      </View>

      {/* Meta rows */}
      <MetaRow
        icon={<MapPin size={20} color="#E8862A" />}
        primary={event.location}
        secondary={event.address}
      />
      <MetaRow
        icon={<Users size={20} color="#E8862A" />}
        primary={`${event.attendees} attending`}
        right={<AvatarStack />}
      />
      {event.pointOfContact && (
        <MetaRow
          icon={<User size={20} color="#E8862A" />}
          primary={`Contact: ${event.pointOfContact}`}
        />
      )}

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: '#E7E5E4', marginHorizontal: 16 }} />

      {/* About */}
      <View style={{ paddingHorizontal: 16 }}>
        <Text
          style={{
            fontSize: 11,
            fontFamily: 'Inter-Medium',
            color: '#A8A29E',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 8,
          }}
        >
          About
        </Text>
        <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: '#78716C', lineHeight: 20 }}>
          {event.description || 'No description provided.'}
        </Text>
      </View>
    </View>
  )

  const renderPeopleTab = () => (
    <View style={{ paddingTop: 16, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 13, fontFamily: 'Inter-Medium', color: '#78716C', marginBottom: 12 }}>
        {event.attendees} people attending
      </Text>

      {attendees.length > 0 ? (
        attendees.map((attendee, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              gap: 12,
            }}
          >
            <Image
              source={{ uri: attendee.image }}
              style={{ width: 42, height: 42, borderRadius: 21 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontFamily: 'Inter-Medium', color: '#1C1917' }}>
                {attendee.name}
              </Text>
              {attendee.subtitle ? (
                <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: '#78716C' }}>
                  {attendee.subtitle}
                </Text>
              ) : null}
            </View>
            {index === 0 && <Badge label="HOST" variant="host" />}
          </View>
        ))
      ) : (
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <Users size={48} color="#A8A29E" />
          <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: '#78716C', marginTop: 12 }}>
            No attendees yet
          </Text>
        </View>
      )}
    </View>
  )

  const renderMessagesTab = () => (
    <View style={{ paddingTop: 16, paddingHorizontal: 16, gap: 20 }}>
      {/* Info banner */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Info size={16} color="#E8862A" />
        <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: '#E8862A' }}>
          Only the host can post messages
        </Text>
      </View>

      {messages.length > 0 ? (
        messages.map((message, index) => (
          <View key={index} style={{ gap: 6 }}>
            {/* Author line */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image
                source={{ uri: message.image }}
                style={{ width: 30, height: 30, borderRadius: 15 }}
              />
              <Text style={{ fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#1C1917' }}>
                {message.author}
              </Text>
              <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: '#A8A29E' }}>
                {message.timestamp}
              </Text>
            </View>

            {/* Message bubble */}
            <View
              style={{
                backgroundColor: '#F5F5F4',
                borderTopLeftRadius: 4,
                borderTopRightRadius: 16,
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                padding: 12,
                marginLeft: 38,
              }}
            >
              <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: '#1C1917', lineHeight: 20 }}>
                {message.text}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <Info size={48} color="#A8A29E" />
          <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: '#78716C', marginTop: 12 }}>
            No messages yet
          </Text>
        </View>
      )}
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {renderHeader()}

      {/* Compact summary */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingBottom: 12,
          gap: 12,
        }}
      >
        {event.image ? (
          <Image
            source={{ uri: event.image }}
            style={{ width: 48, height: 48, borderRadius: 8 }}
          />
        ) : (
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: '#F5F5F4',
            }}
          />
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1C1917' }} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: '#78716C' }}>
            {formatDate(event.date)}
            {event.time ? ` · ${event.time}` : ''}
          </Text>
        </View>
        <Badge label="Going" variant="going" />
      </View>

      {/* Tab bar */}
      <UnderlineTabBar
        tabs={['Details', 'People', 'Messages']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        {activeTab === 'Details' && renderDetailsTab()}
        {activeTab === 'People' && renderPeopleTab()}
        {activeTab === 'Messages' && renderMessagesTab()}
      </ScrollView>

      {/* Cancel registration CTA */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 28,
        }}
      >
        <Pressable
          onPress={handleToggleRegistration}
          disabled={isToggling}
          style={{
            height: 52,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E7E5E4',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {isToggling ? (
            <ActivityIndicator size="small" color="#1C1917" />
          ) : (
            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#1C1917' }}>
              Cancel Registration
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
