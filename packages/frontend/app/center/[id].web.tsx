import { useEffect, useRef } from 'react'
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Linking, useWindowDimensions } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, Share2, MapPin, Globe, Phone, User } from 'lucide-react-native'
import { useCenterDetail } from '../../hooks/useApiData'
import { useDetailColors } from '../../hooks/useDetailColors'
import type { EventDisplay } from '../../utils/api'

export default function CenterDetailWeb() {
  const { id: rawId } = useLocalSearchParams()
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isMobile = width < 768

  const initiallyMobile = useRef(isMobile)

  useEffect(() => {
    if (!initiallyMobile.current && id) {
      router.replace(`/?detail=center&id=${id}`)
    } else if (!id) {
      router.replace('/')
    }
  }, [id, router])

  if (!isMobile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E8862A" />
      </View>
    )
  }

  return <MobileCenterDetail centerId={id || ''} />
}

function formatDateCallout(dateStr: string): { month: string; day: string } {
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return { month: '', day: '' }
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = String(d.getDate())
  return { month, day }
}

function MobileCenterDetail({ centerId }: { centerId: string }) {
  const router = useRouter()
  const { center, events, loading } = useCenterDetail(centerId)
  const colors = useDetailColors()

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: center?.name || 'Center', text: `Check out ${center?.name} on Chinmaya Janata!` }).catch(() => {})
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleAddressPress = () => {
    if (!center?.address) return
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(center.address)}`)
  }

  const handleWebsitePress = () => {
    if (!center?.website) return
    const url = center.website.startsWith('http') ? center.website : `https://${center.website}`
    Linking.openURL(url)
  }

  const handlePhonePress = () => {
    if (!center?.phone) return
    Linking.openURL(`tel:${center.phone}`)
  }

  const handleEventPress = (event: EventDisplay) => {
    router.push(`/events/${event.id}`)
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.panelBg }}>
        <ActivityIndicator size="large" color="#E8862A" />
      </View>
    )
  }

  if (!center) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.panelBg }}>
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Center not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#E8862A', fontSize: 16 }}>Go back</Text>
        </Pressable>
      </View>
    )
  }

  const displayWebsite = (center.website ?? '').replace(/^https?:\/\//, '').replace(/\/$/, '')

  return (
    <View style={{ flex: 1, backgroundColor: colors.panelBg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ChevronLeft size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Back</Text>
          </Pressable>
          <Pressable onPress={handleShare} style={{ padding: 8 }}>
            <Share2 size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text }}>{center.name}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero image */}
        {center.image ? (
          <Image source={{ uri: center.image }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
        ) : null}

        <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 16 }}>
          {/* Point of contact */}
          {center.pointOfContact ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              Point of Contact: {center.pointOfContact}
            </Text>
          ) : null}

          {/* Address */}
          {center.address ? (
            <Pressable onPress={handleAddressPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MapPin size={18} color="#E8862A" />
              <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{center.address}</Text>
            </Pressable>
          ) : null}

          {/* Website */}
          {center.website ? (
            <Pressable onPress={handleWebsitePress} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Globe size={18} color="#E8862A" />
              <Text style={{ color: '#E8862A', fontSize: 15, flex: 1 }} numberOfLines={1}>{displayWebsite}</Text>
            </Pressable>
          ) : null}

          {/* Phone */}
          {center.phone ? (
            <Pressable onPress={handlePhonePress} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Phone size={18} color="#E8862A" />
              <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{center.phone}</Text>
            </Pressable>
          ) : null}

          {/* Acharya */}
          {center.acharya ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <User size={18} color="#E8862A" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 15 }}>{center.acharya}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Resident Acharya</Text>
              </View>
            </View>
          ) : null}

          {/* Upcoming Events */}
          {events.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 12, letterSpacing: 0.5 }}>
                UPCOMING EVENTS
              </Text>
              <View style={{ gap: 8 }}>
                {events.map((event) => {
                  const { month, day } = formatDateCallout(event.date)
                  return (
                    <Pressable
                      key={event.id}
                      onPress={() => handleEventPress(event)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.cardBg,
                        borderRadius: 8,
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                      }}
                    >
                      <View style={{ width: 52, alignItems: 'center' }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#E8862A', textTransform: 'uppercase' }}>{month}</Text>
                        <Text style={{ fontSize: 22, fontWeight: '600', color: colors.text }}>{day}</Text>
                      </View>
                      <View style={{ width: 1, backgroundColor: colors.border, alignSelf: 'stretch', marginHorizontal: 12 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} numberOfLines={2}>{event.title}</Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                          {event.time}{event.attendees > 0 ? ` · ${event.attendees} attending` : ''}
                        </Text>
                      </View>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
