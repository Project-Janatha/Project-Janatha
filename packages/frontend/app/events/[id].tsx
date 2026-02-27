import React, { useState } from 'react'
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, Share2, MapPin, Users, User, Clock, CheckCircle, Info } from 'lucide-react-native'
import { useEventDetail } from '../../hooks/useApiData'
import { useUser } from '../../components/contexts'
import { Badge, UnderlineTabBar } from '../../components/ui'
import { useDetailColors, type DetailColors } from '../../hooks/useDetailColors'

// ── Helpers ──────────────────────────────────────────────────────────────

/** Format date + time into "In X hours · 2/27 7:45 PM PST" */
function formatRelativeDateTime(dateStr: string, timeStr: string): string {
  const startTime = timeStr.split(' - ')[0] || timeStr

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

  let relative: string
  const mins = Math.floor(absDiffMs / 60000)
  const hrs = Math.floor(absDiffMs / 3600000)
  const days = Math.floor(absDiffMs / 86400000)

  if (mins < 1) {
    relative = 'Now'
  } else if (mins < 60) {
    relative = isFuture ? `In ${mins}m` : `${mins}m ago`
  } else if (hrs < 24) {
    relative = isFuture ? `In ${hrs}h` : `${hrs}h ago`
  } else {
    relative = isFuture ? `In ${days}d` : `${days}d ago`
  }

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

// ── Sub-components ───────────────────────────────────────────────────────

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
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.iconBoxBg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Icon size={18} color={color} />
    </View>
  )
}

function AvatarStack({ attendees, colors }: { attendees: { image: string }[]; colors: DetailColors }) {
  const shown = attendees.slice(0, 3)
  return (
    <View style={{ flexDirection: 'row', marginLeft: 4 }}>
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

// ── Header ───────────────────────────────────────────────────────────────

function HeaderBar({
  title,
  isPast,
  isRegistered,
  onBack,
  colors,
}: {
  title: string
  isPast?: boolean
  isRegistered?: boolean
  onBack: () => void
  colors: DetailColors
}) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomWidth: isRegistered ? 0 : 1,
        borderBottomColor: colors.border,
        gap: 10,
      }}
    >
      {/* Top row: back + share */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable
          onPress={onBack}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 2, padding: 2 }}
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
          <Pressable onPress={() => {}} style={{ padding: 6 }}>
            <Share2 size={18} color={colors.iconHeader} />
          </Pressable>
        )}
      </View>

      {/* Title row + badge */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
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

// ── Meta section ─────────────────────────────────────────────────────────

function MetaSection({
  event,
  attendees,
  isPast,
  colors,
}: {
  event: { location: string; address?: string; attendees: number; pointOfContact?: string }
  attendees: { image: string }[]
  isPast?: boolean
  colors: DetailColors
}) {
  const iconColor = isPast ? colors.textMuted : '#E8862A'
  const attendLabel = isPast
    ? `${event.attendees} attended`
    : `${event.attendees} attending`

  return (
    <View style={{ gap: 16 }}>
      {/* Location */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <MetaIcon icon={MapPin} color={iconColor} colors={colors} />
        <View style={{ flex: 1, gap: 2, justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: colors.text }}>
            {event.location}
          </Text>
          {event.address ? (
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: colors.textSecondary }}>
              {event.address}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Attendees */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <MetaIcon icon={Users} color={iconColor} colors={colors} />
        <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: colors.text }}>
          {attendLabel}
        </Text>
        <AvatarStack attendees={attendees} colors={colors} />
      </View>

      {/* Point of contact */}
      {event.pointOfContact ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <MetaIcon icon={User} color={iconColor} colors={colors} />
          <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: colors.text }}>
            Contact: {event.pointOfContact}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

// ── About section ────────────────────────────────────────────────────────

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
      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
        {description}
      </Text>
    </View>
  )
}

// ── Attended banner ──────────────────────────────────────────────────────

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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <CheckCircle size={18} color="#059669" />
        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#059669' }}>
          You attended this event
        </Text>
      </View>
      {count > 1 && (
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#059669', marginLeft: 26 }}>
          Along with {count - 1} others
        </Text>
      )}
    </View>
  )
}

// ── Action bar ───────────────────────────────────────────────────────────

function ActionBar({
  isRegistered,
  isPast,
  onToggle,
  isToggling,
  colors,
}: {
  isRegistered?: boolean
  isPast?: boolean
  onToggle: () => void
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
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 28,
          backgroundColor: colors.panelBg,
        }}
      >
        <Pressable
          onPress={onToggle}
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
            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 15, color: '#EF4444' }}>
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
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 28,
        backgroundColor: colors.panelBg,
      }}
    >
      <Pressable
        onPress={onToggle}
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
          <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#FFFFFF' }}>
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

// ── Main component ───────────────────────────────────────────────────────

export default function EventDetailPage() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('Details')
  const { event, attendees, messages, loading, toggleRegistration, isToggling } = useEventDetail(
    id as string
  )
  const colors = useDetailColors()

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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.panelBg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#E8862A" />
        </View>
      </SafeAreaView>
    )
  }

  // ── Not-found state ──────────────────────────────────────────────────

  if (!event) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.panelBg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 22, fontFamily: 'Inter-SemiBold', color: colors.text, marginBottom: 16 }}>
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
  const isRegistered = !!event.isRegistered && !isPast

  // ── Registered state (with tabs) ─────────────────────────────────────

  if (isRegistered) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.panelBg }}>
        <HeaderBar
          title={event.title}
          isPast={false}
          isRegistered
          onBack={() => router.back()}
          colors={colors}
        />

        <View style={{ paddingTop: 8 }}>
          <UnderlineTabBar
            tabs={['Details', 'People', 'Messages']}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'Details' && (
            <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, gap: 20 }}>
              {/* Date & time */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MetaIcon icon={Clock} color="#E8862A" colors={colors} />
                <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: colors.text }}>
                  {formatRelativeDateTime(event.date, event.time)}
                </Text>
              </View>

              <MetaSection event={event} attendees={attendees} colors={colors} />
              <AboutSection description={event.description} colors={colors} />
            </View>
          )}

          {activeTab === 'People' && (
            <View style={{ paddingTop: 16, paddingHorizontal: 20 }}>
              <Text style={{ fontFamily: 'Inter-Medium', fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
                {event.attendees} people attending
              </Text>
              {attendees.length > 0 ? (
                attendees.map((attendee, index) => (
                  <View
                    key={index}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 }}
                  >
                    <Image
                      source={{ uri: attendee.image }}
                      style={{ width: 42, height: 42, borderRadius: 21 }}
                    />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: colors.text }}>
                        {attendee.name}
                      </Text>
                      {attendee.subtitle ? (
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: colors.textSecondary }}>
                          {attendee.subtitle}
                        </Text>
                      ) : null}
                    </View>
                    {index === 0 && <Badge label="HOST" variant="host" />}
                  </View>
                ))
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Users size={48} color={colors.textMuted} />
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: colors.textSecondary, marginTop: 12 }}>
                    No attendees yet
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'Messages' && (
            <View style={{ paddingTop: 16, paddingHorizontal: 20, gap: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Info size={16} color="#E8862A" />
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#E8862A' }}>
                  Only the host can post messages
                </Text>
              </View>
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <View key={index} style={{ gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Image
                        source={{ uri: message.image }}
                        style={{ width: 30, height: 30, borderRadius: 15 }}
                      />
                      <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: colors.text, flex: 1 }}>
                        {message.author}
                      </Text>
                      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: colors.textMuted }}>
                        {message.timestamp}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: colors.cardBg,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 16,
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
                        padding: 12,
                        marginLeft: 38,
                      }}
                    >
                      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: colors.text, lineHeight: 20 }}>
                        {message.text}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Info size={48} color={colors.textMuted} />
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: colors.textSecondary, marginTop: 12 }}>
                    No messages yet
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <ActionBar
          isRegistered
          onToggle={handleToggleRegistration}
          isToggling={isToggling}
          colors={colors}
        />
      </SafeAreaView>
    )
  }

  // ── Default / past state ─────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.panelBg }}>
      <HeaderBar
        title={event.title}
        isPast={isPast}
        onBack={() => router.back()}
        colors={colors}
      />

      {/* Hero image — edge-to-edge */}
      {event.image ? (
        <View style={{ width: '100%', height: 200, position: 'relative' }}>
          <Image
            source={{ uri: event.image }}
            style={{ width: '100%', height: 200, opacity: isPast ? 0.75 : 1 }}
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
          <View style={{ position: 'absolute', bottom: 16, left: 16 }}>
            <Badge label={isPast ? 'Past Event' : 'Upcoming'} variant={isPast ? 'past' : 'upcoming'} />
          </View>
        </View>
      ) : null}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: isPast ? 40 : 100, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Attended banner (past only) */}
        {isPast && <AttendedBanner count={event.attendees} colors={colors} />}

        {/* Date & time */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <MetaIcon icon={Clock} color={isPast ? colors.textMuted : '#E8862A'} colors={colors} />
          <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: colors.text }}>
            {formatRelativeDateTime(event.date, event.time)}
          </Text>
        </View>

        {/* Meta rows */}
        <MetaSection event={event} attendees={attendees} isPast={isPast} colors={colors} />

        {/* About */}
        <AboutSection description={event.description} colors={colors} />
      </ScrollView>

      <ActionBar
        isPast={isPast}
        onToggle={handleToggleRegistration}
        isToggling={isToggling}
        colors={colors}
      />
    </SafeAreaView>
  )
}
