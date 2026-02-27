import React, { useState } from 'react'
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { MapPin, Users, User, Share2, X, Clock, CheckCircle, Info } from 'lucide-react-native'
import Badge from '../ui/Badge'
import UnderlineTabBar from '../ui/UnderlineTabBar'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Attendee = {
  name: string
  subtitle: string
  image: string
}

type Message = {
  author: string
  timestamp: string
  text: string
  image: string
}

type EventDetailPanelProps = {
  event: {
    id: string
    title: string
    date: string
    time: string
    location: string
    address?: string
    attendees: number
    description?: string
    pointOfContact?: string
    image?: string
    isRegistered?: boolean
  }
  attendees: Attendee[]
  messages: Message[]
  isPast?: boolean
  onClose: () => void
  onToggleRegistration: () => void
  isToggling: boolean
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** 32px icon box used in meta rows */
function MetaIcon({
  icon: Icon,
  color,
}: {
  icon: React.ElementType
  color: string
}) {
  return (
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F5F5F4',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={18} color={color} />
    </View>
  )
}

/** Small overlapping avatar stack (max 3 shown) */
function AvatarStack({ attendees }: { attendees: Attendee[] }) {
  const shown = attendees.slice(0, 3)
  return (
    <View className="flex-row" style={{ marginLeft: 4 }}>
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

// ---------------------------------------------------------------------------
// Header bar
// ---------------------------------------------------------------------------

function HeaderBar({
  isPast,
  onClose,
}: {
  isPast?: boolean
  onClose: () => void
}) {
  return (
    <View
      className="flex-row items-center"
      style={{
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E7E5E4',
      }}
    >
      <Text
        style={{
          flex: 1,
          fontFamily: 'Inter-Medium',
          fontSize: 11,
          color: '#A8A29E',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        Event Details
      </Text>

      {!isPast && (
        <Pressable
          onPress={() => {}}
          style={{ padding: 4, marginRight: 8 }}
          accessibilityLabel="Share event"
        >
          <Share2 size={18} color="#78716C" />
        </Pressable>
      )}

      <Pressable
        onPress={onClose}
        style={{ padding: 4 }}
        accessibilityLabel="Close panel"
      >
        <X size={18} color="#78716C" />
      </Pressable>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Hero image (default + past states)
// ---------------------------------------------------------------------------

function HeroImage({
  uri,
  isPast,
  isRegistered,
}: {
  uri?: string
  isPast?: boolean
  isRegistered?: boolean
}) {
  if (!uri) return null
  return (
    <View style={{ width: '100%', height: 200, position: 'relative' }}>
      <Image
        source={{ uri }}
        style={{
          width: '100%',
          height: 200,
          opacity: isPast ? 0.75 : 1,
        }}
        resizeMode="cover"
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
      {/* Status badge */}
      <View style={{ position: 'absolute', bottom: 16, left: 16 }}>
        <Badge
          label={isPast ? 'Past Event' : 'Upcoming'}
          variant={isPast ? 'past' : 'upcoming'}
        />
      </View>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Compact summary row (registered state)
// ---------------------------------------------------------------------------

function CompactSummary({
  event,
}: {
  event: EventDetailPanelProps['event']
}) {
  return (
    <View
      className="flex-row items-center"
      style={{
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E7E5E4',
      }}
    >
      {event.image && (
        <Image
          source={{ uri: event.image }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 8,
            marginRight: 12,
          }}
          resizeMode="cover"
        />
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 16,
            color: '#1C1917',
          }}
          numberOfLines={1}
        >
          {event.title}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 12,
            color: '#78716C',
          }}
        >
          {event.date} {event.time}
        </Text>
      </View>
      <View style={{ marginLeft: 8 }}>
        <Badge label="Going" variant="going" />
      </View>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Meta rows section
// ---------------------------------------------------------------------------

function MetaSection({
  event,
  attendees,
  isPast,
}: {
  event: EventDetailPanelProps['event']
  attendees: Attendee[]
  isPast?: boolean
}) {
  const iconColor = isPast ? '#A8A29E' : '#E8862A'
  const attendLabel = isPast
    ? `${event.attendees} attended`
    : `${event.attendees} attending`

  return (
    <View style={{ gap: 16 }}>
      {/* Location row */}
      <View className="flex-row" style={{ gap: 12, alignItems: 'flex-start' }}>
        <MetaIcon icon={MapPin} color={iconColor} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              fontFamily: 'Inter-Medium',
              fontSize: 14,
              color: '#1C1917',
            }}
          >
            {event.location}
          </Text>
          {event.address && (
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 13,
                color: '#78716C',
              }}
            >
              {event.address}
            </Text>
          )}
        </View>
      </View>

      {/* Attendees row */}
      <View className="flex-row items-center" style={{ gap: 12 }}>
        <MetaIcon icon={Users} color={iconColor} />
        <Text
          style={{
            fontFamily: 'Inter-Medium',
            fontSize: 14,
            color: '#1C1917',
          }}
        >
          {attendLabel}
        </Text>
        <AvatarStack attendees={attendees} />
      </View>

      {/* Point of contact row */}
      {event.pointOfContact && (
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <MetaIcon icon={User} color={iconColor} />
          <Text
            style={{
              fontFamily: 'Inter-Medium',
              fontSize: 14,
              color: '#1C1917',
            }}
          >
            Contact: {event.pointOfContact}
          </Text>
        </View>
      )}
    </View>
  )
}

// ---------------------------------------------------------------------------
// About section
// ---------------------------------------------------------------------------

function AboutSection({ description }: { description?: string }) {
  if (!description) return null
  return (
    <View style={{ gap: 12 }}>
      <Text
        style={{
          fontFamily: 'Inter-Medium',
          fontSize: 11,
          color: '#A8A29E',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        About
      </Text>
      <Text
        style={{
          fontFamily: 'Inter-Regular',
          fontSize: 14,
          color: '#78716C',
          lineHeight: 20,
        }}
      >
        {description}
      </Text>
    </View>
  )
}

// ---------------------------------------------------------------------------
// "You attended" banner (past state)
// ---------------------------------------------------------------------------

function AttendedBanner({ count }: { count: number }) {
  return (
    <View
      style={{
        backgroundColor: '#ECFDF5',
        borderRadius: 8,
        padding: 12,
        paddingHorizontal: 16,
        gap: 4,
      }}
    >
      <View className="flex-row items-center" style={{ gap: 8 }}>
        <CheckCircle size={18} color="#059669" />
        <Text
          style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 14,
            color: '#059669',
          }}
        >
          You attended this event
        </Text>
      </View>
      {count > 1 && (
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 12,
            color: '#059669',
            marginLeft: 26,
          }}
        >
          Along with {count - 1} others
        </Text>
      )}
    </View>
  )
}

// ---------------------------------------------------------------------------
// People tab content
// ---------------------------------------------------------------------------

function PeopleTab({ attendees }: { attendees: Attendee[] }) {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
      <Text
        style={{
          fontFamily: 'Inter-Medium',
          fontSize: 13,
          color: '#78716C',
          marginBottom: 12,
        }}
      >
        {attendees.length} people attending
      </Text>

      <View style={{ gap: 4 }}>
        {attendees.map((a, i) => (
          <View
            key={i}
            className="flex-row items-center"
            style={{ paddingVertical: 12, gap: 12 }}
          >
            <Image
              source={{ uri: a.image }}
              style={{ width: 42, height: 42, borderRadius: 21 }}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  color: '#1C1917',
                }}
              >
                {a.name}
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 12,
                  color: '#78716C',
                }}
              >
                {a.subtitle}
              </Text>
            </View>
            {i === 0 && (
              <Badge label="HOST" variant="host" />
            )}
          </View>
        ))}
      </View>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Messages tab content
// ---------------------------------------------------------------------------

function MessagesTab({ messages }: { messages: Message[] }) {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 16, gap: 20 }}>
      {/* Notice banner */}
      <View className="flex-row items-center" style={{ gap: 8 }}>
        <Info size={16} color="#E8862A" />
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 13,
            color: '#E8862A',
          }}
        >
          Only the host can post messages
        </Text>
      </View>

      {/* Message list */}
      {messages.map((m, i) => (
        <View key={i} style={{ gap: 8 }}>
          {/* Author row */}
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <Image
              source={{ uri: m.image }}
              style={{ width: 30, height: 30, borderRadius: 15 }}
            />
            <Text
              style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 14,
                color: '#1C1917',
                flex: 1,
              }}
            >
              {m.author}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 12,
                color: '#A8A29E',
              }}
            >
              {m.timestamp}
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
              paddingVertical: 12,
              paddingHorizontal: 14,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 14,
                color: '#1C1917',
                lineHeight: 20,
              }}
            >
              {m.text}
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Default content (unregistered / past)
// ---------------------------------------------------------------------------

function DefaultContent({
  event,
  attendees,
  isPast,
}: {
  event: EventDetailPanelProps['event']
  attendees: Attendee[]
  isPast?: boolean
}) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Title & date */}
      <Text
        style={{
          fontFamily: 'Inter-SemiBold',
          fontSize: 22,
          color: '#1C1917',
        }}
      >
        {event.title}
      </Text>
      <Text
        style={{
          fontFamily: 'Inter-Regular',
          fontSize: 13,
          color: '#78716C',
          marginTop: 4,
        }}
      >
        {event.date} {event.time}
      </Text>

      {/* Attended banner (past state) */}
      {isPast && (
        <View style={{ marginTop: 20 }}>
          <AttendedBanner count={event.attendees} />
        </View>
      )}

      {/* Meta rows */}
      <View style={{ marginTop: 20 }}>
        <MetaSection event={event} attendees={attendees} isPast={isPast} />
      </View>

      {/* Divider */}
      {event.description && (
        <View
          style={{
            height: 1,
            backgroundColor: '#E7E5E4',
            marginVertical: 20,
          }}
        />
      )}

      {/* About */}
      <AboutSection description={event.description} />
    </ScrollView>
  )
}

// ---------------------------------------------------------------------------
// Registered content (with tabs)
// ---------------------------------------------------------------------------

function RegisteredContent({
  event,
  attendees,
  messages,
}: {
  event: EventDetailPanelProps['event']
  attendees: Attendee[]
  messages: Message[]
}) {
  const [activeTab, setActiveTab] = useState('Details')

  return (
    <View style={{ flex: 1 }}>
      <UnderlineTabBar
        tabs={['Details', 'People', 'Messages']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'Details' && (
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 20,
              paddingBottom: 24,
              gap: 20,
            }}
          >
            <MetaSection event={event} attendees={attendees} />
            {event.description && (
              <>
                <View
                  style={{ height: 1, backgroundColor: '#E7E5E4' }}
                />
                <AboutSection description={event.description} />
              </>
            )}
          </View>
        )}

        {activeTab === 'People' && <PeopleTab attendees={attendees} />}

        {activeTab === 'Messages' && (
          <MessagesTab messages={messages} />
        )}
      </ScrollView>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Action bar (sticky bottom)
// ---------------------------------------------------------------------------

function ActionBar({
  isRegistered,
  isPast,
  onToggleRegistration,
  isToggling,
}: {
  isRegistered?: boolean
  isPast?: boolean
  onToggleRegistration: () => void
  isToggling: boolean
}) {
  if (isPast) return null

  if (isRegistered) {
    return (
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: '#E7E5E4',
          padding: 16,
          backgroundColor: '#FFFFFF',
        }}
      >
        <Pressable
          onPress={onToggleRegistration}
          disabled={isToggling}
          style={{
            height: 48,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#E7E5E4',
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isToggling ? 0.6 : 1,
          }}
        >
          {isToggling ? (
            <ActivityIndicator size="small" color="#1C1917" />
          ) : (
            <Text
              style={{
                fontFamily: 'Inter-Medium',
                fontSize: 15,
                color: '#1C1917',
              }}
            >
              Cancel Registration
            </Text>
          )}
        </Pressable>
      </View>
    )
  }

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: '#E7E5E4',
        padding: 16,
        backgroundColor: '#FFFFFF',
      }}
    >
      <Pressable
        onPress={onToggleRegistration}
        disabled={isToggling}
        style={{
          height: 48,
          borderRadius: 10,
          backgroundColor: '#E8862A',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isToggling ? 0.6 : 1,
        }}
      >
        {isToggling ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text
            style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 15,
              color: '#FFFFFF',
            }}
          >
            Attend Event
          </Text>
        )}
      </Pressable>
      <Text
        style={{
          fontFamily: 'Inter-Regular',
          fontSize: 12,
          color: '#A8A29E',
          textAlign: 'center',
          marginTop: 8,
        }}
      >
        Free · No registration required
      </Text>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EventDetailPanel({
  event,
  attendees,
  messages,
  isPast,
  onClose,
  onToggleRegistration,
  isToggling,
}: EventDetailPanelProps) {
  const isRegistered = event.isRegistered && !isPast

  return (
    <View
      style={{
        width: 440,
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderLeftWidth: 1,
        borderLeftColor: '#E7E5E4',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <HeaderBar isPast={isPast} onClose={onClose} />

      {/* Hero / compact summary */}
      {isRegistered ? (
        <CompactSummary event={event} />
      ) : (
        <HeroImage
          uri={event.image}
          isPast={isPast}
          isRegistered={isRegistered}
        />
      )}

      {/* Body */}
      {isRegistered ? (
        <RegisteredContent
          event={event}
          attendees={attendees}
          messages={messages}
        />
      ) : (
        <DefaultContent
          event={event}
          attendees={attendees}
          isPast={isPast}
        />
      )}

      {/* Sticky action bar */}
      <ActionBar
        isRegistered={isRegistered}
        isPast={isPast}
        onToggleRegistration={onToggleRegistration}
        isToggling={isToggling}
      />
    </View>
  )
}
