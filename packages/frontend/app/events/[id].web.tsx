import { useEffect, useState, useRef } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, Share2, MapPin, Users, User, Clock, CheckCircle } from 'lucide-react-native'
import { useUser } from '../../components/contexts'
import { useEventDetail } from '../../hooks/useApiData'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import UnderlineTabBar from '../../components/ui/UnderlineTabBar'
import PrimaryButton from '../../components/ui/buttons/PrimaryButton'
import DestructiveButton from '../../components/ui/buttons/DestructiveButton'
import { useDetailColors } from '../../hooks/useDetailColors'

export default function EventDetailWeb() {
  const { id: rawId } = useLocalSearchParams()
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isMobile = width < 768

  const initiallyMobile = useRef(isMobile)

  useEffect(() => {
    if (!initiallyMobile.current && id) {
      router.replace(`/?detail=event&id=${id}`)
    } else if (!id) {
      router.replace('/')
    }
  }, [id, router])

  // On desktop, show loading while redirecting
  if (!isMobile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E8862A" />
      </View>
    )
  }

  // On mobile web, render full-screen event detail
  return <MobileEventDetail eventId={id || ''} />
}

function MobileEventDetail({ eventId }: { eventId: string }) {
  const router = useRouter()
  const { user } = useUser()
  const { event, loading, toggleRegistration, isToggling, attendees } = useEventDetail(eventId, user?.username, user?.id)
  const colors = useDetailColors()
  const [activeTab, setActiveTab] = useState('Details')

  const isPast = event?.date ? new Date(event.date + 'T23:59:59') < new Date() : false

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.panelBg }}>
        <ActivityIndicator size="large" color="#E8862A" />
      </View>
    )
  }

  if (!event) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.panelBg }}>
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Event not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#E8862A', fontSize: 16 }}>Go back</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.panelBg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={20} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Back</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            if (typeof navigator !== 'undefined' && navigator.share) {
              navigator.share({ title: event.title, text: `Check out ${event.title} on Chinmaya Janata!` }).catch(() => {})
            } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href)
            }
          }}
          style={{ padding: 8 }}
        >
          <Share2 size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Title + Badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text, flex: 1 }}>{event.title}</Text>
        {event.isRegistered && <Badge label="Going" variant="going" />}
      </View>

      {/* Tabs */}
      <UnderlineTabBar
        tabs={['Details', 'People']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
        {activeTab === 'Details' ? (
          <>
            {/* Date & Time */}
            {event.date && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Clock size={18} color={colors.textSecondary} />
                <Text style={{ color: colors.text, fontSize: 15 }}>
                  {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                  {event.time ? ` · ${event.time}` : ''}
                </Text>
              </View>
            )}

            {/* Location */}
            {event.address && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MapPin size={18} color="#E8862A" />
                <Text style={{ color: colors.text, fontSize: 15 }}>{event.address}</Text>
              </View>
            )}

            {/* Attendees count */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Users size={18} color={colors.textSecondary} />
              <Text style={{ color: colors.text, fontSize: 15 }}>
                {event.attendees} {event.attendees === 1 ? 'person' : 'people'} attending
              </Text>
            </View>

            {/* Contact */}
            {event.pointOfContact && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <User size={18} color={colors.textSecondary} />
                <Text style={{ color: colors.text, fontSize: 15 }}>Contact: {event.pointOfContact}</Text>
              </View>
            )}

            {/* Description */}
            {event.description && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>ABOUT</Text>
                <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{event.description}</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              {attendees.length} {attendees.length === 1 ? 'person' : 'people'} attending
            </Text>
            {attendees.map((a) => (
              <View key={a.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
                <Avatar name={a.name} size={40} image={a.image} />
                <Text style={{ color: colors.text, fontSize: 16, flex: 1 }}>
                  {a.name}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Action button */}
      {!isPast && (
        <View style={{ padding: 16 }}>
          {event.isRegistered ? (
            <DestructiveButton
              onPress={() => user?.username && toggleRegistration(user.username)}
              disabled={isToggling}
              loading={isToggling}
            >
              Cancel Registration
            </DestructiveButton>
          ) : (
            <PrimaryButton
              onPress={() => user?.username && toggleRegistration(user.username)}
              disabled={isToggling}
              loading={isToggling}
            >
              Register
            </PrimaryButton>
          )}
        </View>
      )}
    </View>
  )
}
