import React, { useState } from 'react'
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator, Linking } from 'react-native'
import { MapPin, Users, User, Clock, CheckCircle, ChevronLeft, Pencil, ExternalLink } from 'lucide-react-native'
import Badge from '../ui/Badge'
import UnderlineTabBar from '../ui/UnderlineTabBar'
import Avatar from '../ui/Avatar'
import PrimaryButton from '../ui/buttons/PrimaryButton'
import DestructiveButton from '../ui/buttons/DestructiveButton'
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
  image?: string
  initials?: string
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
    externalUrl?: string | null
    signupUrl?: string | null
  }
  attendees: Attendee[]
  isPast?: boolean
  isAdmin?: boolean
  onClose: () => void
  onToggleRegistration: () => void
  isToggling: boolean
  onEdit?: (eventId: string) => void
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
        <Avatar
          key={i}
          image={a.image}
          initials={a.initials}
          name={a.name}
          size={24}
          style={{
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
  isAdmin,
  eventId,
  onClose,
  onEdit,
  colors,
}: {
  title: string
  isPast?: boolean
  isRegistered?: boolean
  isAdmin?: boolean
  eventId?: string
  onClose: () => void
  onEdit?: (eventId: string) => void
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
      {/* Top row: back + actions */}
      <View className="flex-row items-center" style={{ justifyContent: 'space-between' }}>
        <Pressable
          onPress={onClose}
          className="flex-row items-center"
          style={{ gap: 4, padding: 8, minHeight: 44, minWidth: 44 }}
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

        <View className="flex-row items-center" style={{ gap: 4 }}>
          {eventId && onEdit && (
            <Pressable
              onPress={() => onEdit(eventId)}
              style={{ padding: 8, minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}
              accessibilityLabel="Edit event"
            >
              <Pencil size={18} color={colors.iconHeader} />
            </Pressable>
          )}
        </View>
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
  const attendLabel = `${event.attendees} on Janata`

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

      {/* Official page link */}
      {event.externalUrl && (
        <Pressable
          onPress={() => Linking.openURL(event.externalUrl!)}
          className="flex-row items-center"
          style={{ gap: 12, minHeight: 44 }}
        >
          <MetaIcon icon={ExternalLink} color={iconColor} colors={colors} />
          <Text
            style={{
              fontFamily: 'Inter-Medium',
              fontSize: 14,
              color: '#E8862A',
              flex: 1,
            }}
            numberOfLines={1}
          >
            Visit official page · {hostnameOf(event.externalUrl)}
          </Text>
        </Pressable>
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
        {attendees.length} {attendees.length === 1 ? 'person' : 'people'} on Janata
      </Text>

      {attendees.length === 0 ? (
        <View style={{ alignItems: 'center', paddingTop: 32, gap: 8 }}>
          <Users size={32} color={colors.textMuted} />
          <Text
            style={{
              fontFamily: 'Inter-Regular',
              fontSize: 14,
              color: colors.textSecondary,
            }}
          >
            No attendees yet
          </Text>
        </View>
      ) : (
        <View style={{ gap: 4 }}>
          {attendees.map((a, i) => (
            <View
              key={i}
              className="flex-row items-center"
              style={{ paddingVertical: 12, gap: 12 }}
            >
              <Avatar
                image={a.image}
                initials={a.initials}
                name={a.name}
                size={42}
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
      )}
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
      {/* Attended banner (past + user was registered) */}
      {isPast && event.isRegistered && (
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
  colors,
}: {
  event: EventDetailPanelProps['event']
  attendees: Attendee[]
  colors: DetailColors
}) {
  const [activeTab, setActiveTab] = useState('Details')

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingTop: 8 }}>
        <UnderlineTabBar
          tabs={['Details', 'People']}
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

      </ScrollView>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Action bar (sticky bottom)
// ---------------------------------------------------------------------------

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'official site'
  }
}

function ActionBar({
  isRegistered,
  isPast,
  onToggleRegistration,
  isToggling,
  signupUrl,
  colors,
}: {
  isRegistered?: boolean
  isPast?: boolean
  onToggleRegistration: () => void
  isToggling: boolean
  signupUrl?: string | null
  colors: DetailColors
}) {
  if (isPast) return null

  // External signup wins over native RSVP. We're a referrer, not the registrar.
  if (signupUrl) {
    return (
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          padding: 16,
          backgroundColor: colors.panelBg,
        }}
      >
        <PrimaryButton onPress={() => Linking.openURL(signupUrl)}>
          Sign up at {hostnameOf(signupUrl)}
        </PrimaryButton>
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 12,
            color: colors.textMuted,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          Registration handled on the official site
        </Text>
      </View>
    )
  }

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
        <DestructiveButton
          onPress={onToggleRegistration}
          disabled={isToggling}
          loading={isToggling}
        >
          Cancel Registration
        </DestructiveButton>
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
      <PrimaryButton
        onPress={onToggleRegistration}
        disabled={isToggling}
        loading={isToggling}
      >
        Attend Event
      </PrimaryButton>
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
  isPast,
  isAdmin,
  onClose,
  onToggleRegistration,
  isToggling,
  onEdit,
}: EventDetailPanelProps) {
  const colors = useDetailColors()
  const isRegistered = event.isRegistered && !isPast

  return (
    <View
      style={{
        maxWidth: 440,
        width: '100%',
        height: '100%',
        backgroundColor: colors.panelBg,
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <HeaderBar title={event.title} isPast={isPast} isRegistered={isRegistered} isAdmin={isAdmin} eventId={event.id} onClose={onClose} onEdit={onEdit} colors={colors} />

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
        signupUrl={event.signupUrl}
        colors={colors}
      />
    </View>
  )
}
