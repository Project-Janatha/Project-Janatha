import React, { useState } from 'react'
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { MapPin, Users, User, Share2, Clock, CheckCircle, Info, ChevronLeft } from 'lucide-react-native'
import Badge from '../ui/Badge'
import UnderlineTabBar from '../ui/UnderlineTabBar'
import { useDetailColors, type DetailColors } from '../../hooks/useDetailColors'

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Format date + time into "In X hours, 2/27 7:45 PM PST" or "3 days ago, 2/24 7:45 PM PST" */
function formatRelativeDateTime(dateStr: string, timeStr: string): string {
  // Parse the start time from the time string (e.g. "10:30 AM - 11:30 AM" → "10:30 AM")
  const startTime = timeStr.split(' - ')[0] || timeStr

  // Build a full Date object
  const match = startTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  let eventDate: Date
  if (match) {
    let hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    const ampm = match[3].toUpperCase()
    if (ampm === 'PM' && hours !== 12) hours += 12
    if (ampm === 'AM' && hours === 12) hours = 0
    eventDate = new Date(dateStr + 'T00:00:00')
    eventDate.setHours(hours, minutes, 0, 0)
  } else {
    eventDate = new Date(dateStr + 'T12:00:00')
  }

  const now = new Date()
  const diffMs = eventDate.getTime() - now.getTime()
  const absDiffMs = Math.abs(diffMs)
  const isFuture = diffMs > 0

  // Relative part
  let relative: string
  const minutes = Math.floor(absDiffMs / 60000)
  const hours = Math.floor(absDiffMs / 3600000)
  const days = Math.floor(absDiffMs / 86400000)

  if (minutes < 1) {
    relative = 'Now'
  } else if (minutes < 60) {
    relative = isFuture ? `In ${minutes}m` : `${minutes}m ago`
  } else if (hours < 24) {
    relative = isFuture ? `In ${hours}h` : `${hours}h ago`
  } else if (days < 7) {
    relative = isFuture ? `In ${days}d` : `${days}d ago`
  } else {
    relative = isFuture ? `In ${days}d` : `${days}d ago`
  }

  // Absolute part — "2/27 7:45 PM PST"
  const month = eventDate.getMonth() + 1
  const day = eventDate.getDate()
  const timeFormatted = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
  const absolute = `${month}/${day} ${timeFormatted}`

  if (relative === 'Now') return `Now · ${absolute}`
  return `${relative} · ${absolute}`
}

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
  colors,
}: {
  icon: React.ElementType
  color: string
  colors: DetailColors
}) {
  return (
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.iconBoxBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={18} color={color} />
    </View>
  )
}

/** Small overlapping avatar stack (max 3 shown) */
function AvatarStack({ attendees, colors }: { attendees: Attendee[]; colors: DetailColors }) {
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
            borderColor: colors.avatarBorder,
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
  title,
  isPast,
  isRegistered,
  onClose,
  colors,
}: {
  title: string
  isPast?: boolean
  isRegistered?: boolean
  onClose: () => void
  colors: DetailColors
}) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 12,
        borderBottomWidth: isRegistered ? 0 : 1,
        borderBottomColor: colors.border,
        gap: 10,
      }}
    >
      {/* Top row: back + share/close */}
      <View className="flex-row items-center" style={{ justifyContent: 'space-between' }}>
        <Pressable
          onPress={onClose}
          className="flex-row items-center"
          style={{ gap: 2, padding: 2 }}
          accessibilityLabel="Close panel"
        >
          <ChevronLeft size={20} color={colors.iconHeader} />
          <Text
            style={{
              fontFamily: 'Inter-Regular',
              fontSize: 14,
              color: colors.iconHeader,
            }}
          >
            Back
          </Text>
        </Pressable>

        {!isPast && (
          <Pressable
            onPress={() => {}}
            style={{ padding: 6 }}
            accessibilityLabel="Share event"
          >
            <Share2 size={18} color={colors.iconHeader} />
          </Pressable>
        )}
      </View>

      {/* Title row + badge */}
      <View className="flex-row items-start" style={{ gap: 10 }}>
        <Text
          style={{
            flex: 1,
            fontFamily: 'Inter-Bold',
            fontSize: 20,
            color: colors.text,
            lineHeight: 26,
          }}
        >
          {title}
        </Text>
        {isRegistered && (
          <View style={{ marginTop: 3 }}>
            <Badge label="Going" variant="going" />
          </View>
        )}
      </View>
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
// Meta rows section
// ---------------------------------------------------------------------------

function MetaSection({
  event,
  attendees,
  isPast,
  colors,
}: {
  event: EventDetailPanelProps['event']
  attendees: Attendee[]
  isPast?: boolean
  colors: DetailColors
}) {
  const iconColor = isPast ? colors.textMuted : '#E8862A'
  const attendLabel = isPast
    ? `${event.attendees} attended`
    : `${event.attendees} attending`

  return (
    <View style={{ gap: 16 }}>
      {/* Location row */}
      <View className="flex-row" style={{ gap: 12, alignItems: 'flex-start' }}>
        <MetaIcon icon={MapPin} color={iconColor} colors={colors} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              fontFamily: 'Inter-Medium',
              fontSize: 14,
              color: colors.text,
            }}
          >
            {event.location}
          </Text>
          {event.address && (
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 13,
                color: colors.textSecondary,
              }}
            >
              {event.address}
            </Text>
          )}
        </View>
      </View>

      {/* Attendees row */}
      <View className="flex-row items-center" style={{ gap: 12 }}>
        <MetaIcon icon={Users} color={iconColor} colors={colors} />
        <Text
          style={{
            fontFamily: 'Inter-Medium',
            fontSize: 14,
            color: colors.text,
          }}
        >
          {attendLabel}
        </Text>
        <AvatarStack attendees={attendees} colors={colors} />
      </View>

      {/* Point of contact row */}
      {event.pointOfContact && (
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <MetaIcon icon={User} color={iconColor} colors={colors} />
          <Text
            style={{
              fontFamily: 'Inter-Medium',
              fontSize: 14,
              color: colors.text,
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

function AboutSection({ description, colors }: { description?: string; colors: DetailColors }) {
  if (!description) return null
  return (
    <View style={{ gap: 12 }}>
      <Text
        style={{
          fontFamily: 'Inter-Medium',
          fontSize: 11,
          color: colors.textMuted,
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
          color: colors.textSecondary,
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

function AttendedBanner({ count, colors }: { count: number; colors: DetailColors }) {
  return (
    <View
      style={{
        backgroundColor: colors.attendedBg,
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

function PeopleTab({ attendees, colors }: { attendees: Attendee[]; colors: DetailColors }) {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
      <Text
        style={{
          fontFamily: 'Inter-Medium',
          fontSize: 13,
          color: colors.textSecondary,
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
                  color: colors.text,
                }}
              >
                {a.name}
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 12,
                  color: colors.textSecondary,
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

function MessagesTab({ messages, colors }: { messages: Message[]; colors: DetailColors }) {
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
                color: colors.text,
                flex: 1,
              }}
            >
              {m.author}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 12,
                color: colors.textMuted,
              }}
            >
              {m.timestamp}
            </Text>
          </View>

          {/* Message bubble */}
          <View
            style={{
              backgroundColor: colors.cardBg,
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
                color: colors.text,
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
  colors,
}: {
  event: EventDetailPanelProps['event']
  attendees: Attendee[]
  isPast?: boolean
  colors: DetailColors
}) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, gap: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Attended banner (past state) */}
      {isPast && (
        <AttendedBanner count={event.attendees} colors={colors} />
      )}

      {/* Date & time */}
      <View className="flex-row items-center" style={{ gap: 12 }}>
        <MetaIcon icon={Clock} color={isPast ? colors.textMuted : '#E8862A'} colors={colors} />
        <Text
          style={{
            fontFamily: 'Inter-Medium',
            fontSize: 14,
            color: colors.text,
          }}
        >
          {formatRelativeDateTime(event.date, event.time)}
        </Text>
      </View>

      {/* Meta rows */}
      <MetaSection event={event} attendees={attendees} isPast={isPast} colors={colors} />

      {/* About */}
      {event.description && (
        <AboutSection description={event.description} colors={colors} />
      )}
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
  colors,
}: {
  event: EventDetailPanelProps['event']
  attendees: Attendee[]
  messages: Message[]
  colors: DetailColors
}) {
  const [activeTab, setActiveTab] = useState('Details')

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingTop: 8 }}>
        <UnderlineTabBar
          tabs={['Details', 'People', 'Messages']}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </View>

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
            {/* Date & time */}
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <MetaIcon icon={Clock} color="#E8862A" colors={colors} />
              <Text
                style={{
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  color: colors.text,
                }}
              >
                {formatRelativeDateTime(event.date, event.time)}
              </Text>
            </View>

            <MetaSection event={event} attendees={attendees} colors={colors} />
            {event.description && (
              <AboutSection description={event.description} colors={colors} />
            )}
          </View>
        )}

        {activeTab === 'People' && <PeopleTab attendees={attendees} colors={colors} />}

        {activeTab === 'Messages' && (
          <MessagesTab messages={messages} colors={colors} />
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
  colors,
}: {
  isRegistered?: boolean
  isPast?: boolean
  onToggleRegistration: () => void
  isToggling: boolean
  colors: DetailColors
}) {
  if (isPast) return null

  if (isRegistered) {
    return (
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          padding: 16,
          backgroundColor: colors.panelBg,
        }}
      >
        <Pressable
          onPress={onToggleRegistration}
          disabled={isToggling}
          style={{
            height: 48,
            borderRadius: 10,
            backgroundColor: 'rgba(239,68,68,0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isToggling ? 0.6 : 1,
          }}
        >
          {isToggling ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Text
              style={{
                fontFamily: 'Inter-Medium',
                fontSize: 15,
                color: '#EF4444',
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
        borderTopColor: colors.border,
        padding: 16,
        backgroundColor: colors.panelBg,
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
          color: colors.textMuted,
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
  const colors = useDetailColors()
  const isRegistered = event.isRegistered && !isPast

  return (
    <View
      style={{
        width: 440,
        height: '100%',
        backgroundColor: colors.panelBg,
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <HeaderBar title={event.title} isPast={isPast} isRegistered={isRegistered} onClose={onClose} colors={colors} />

      {/* Hero image (non-registered only) */}
      {!isRegistered && (
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
          colors={colors}
        />
      ) : (
        <DefaultContent
          event={event}
          attendees={attendees}
          isPast={isPast}
          colors={colors}
        />
      )}

      {/* Sticky action bar */}
      <ActionBar
        isRegistered={isRegistered}
        isPast={isPast}
        onToggleRegistration={onToggleRegistration}
        isToggling={isToggling}
        colors={colors}
      />
    </View>
  )
}
