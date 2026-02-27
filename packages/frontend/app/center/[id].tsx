import React from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  Linking,
  ActivityIndicator,
  Share,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, Share2, MapPin, Globe, Phone, User } from 'lucide-react-native'
import { useCenterDetail } from '../../hooks/useApiData'
import { Badge } from '../../components/ui'
import type { EventDisplay } from '../../utils/api'
import { useDetailColors, type DetailColors } from '../../hooks/useDetailColors'

// ── Helpers ─────────────────────────────────────────────────────────────

function formatDateCallout(dateStr: string): { month: string; day: string } {
  const d = new Date(dateStr + 'T00:00:00')
  const month = d
    .toLocaleDateString('en-US', { month: 'short' })
    .toUpperCase()
  const day = String(d.getDate())
  return { month, day }
}

// ── Sub-components ──────────────────────────────────────────────────────

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
        flexShrink: 0,
      }}
    >
      <Icon size={16} color={color} />
    </View>
  )
}

// ── Header ──────────────────────────────────────────────────────────────

function HeaderBar({
  title,
  onBack,
  onShare,
  colors,
}: {
  title: string
  onBack: () => void
  onShare: () => void
  colors: DetailColors
}) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
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

        <Pressable onPress={onShare} style={{ padding: 6 }}>
          <Share2 size={18} color={colors.iconHeader} />
        </Pressable>
      </View>

      {/* Title row */}
      <Text
        style={{
          fontFamily: 'Inter-Bold',
          fontSize: 20,
          color: colors.text,
          lineHeight: 26,
        }}
      >
        {title}
      </Text>
    </View>
  )
}

// ── Main page component ─────────────────────────────────────────────────

export default function CenterDetailPage() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { center, events, loading } = useCenterDetail(id as string)
  const colors = useDetailColors()

  const handleEventPress = (event: EventDisplay) => {
    router.push(`/events/${event.id}`)
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: center
          ? `Check out ${center.name}!`
          : 'Check out this center!',
      })
    } catch {
      // Share cancelled or failed
    }
  }

  const handleAddressPress = () => {
    if (!center?.address) return
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(center.address)}`)
  }

  const handleWebsitePress = () => {
    if (!center?.website) return
    const url = center.website.startsWith('http')
      ? center.website
      : `https://${center.website}`
    Linking.openURL(url)
  }

  const handlePhonePress = () => {
    if (!center?.phone) return
    Linking.openURL(`tel:${center.phone}`)
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.panelBg }} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#E8862A" />
        </View>
      </SafeAreaView>
    )
  }

  if (!center) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.panelBg }} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 22, fontFamily: 'Inter-SemiBold', color: colors.text, marginBottom: 16 }}>
            Center not found
          </Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#E8862A' }}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  // Strip protocol for website display
  const displayWebsite = center.website
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.panelBg }} edges={['top']}>
      <HeaderBar
        title={center.name}
        onBack={() => router.back()}
        onShare={handleShare}
        colors={colors}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image — edge-to-edge */}
        {center.image ? (
          <Image
            source={{ uri: center.image }}
            style={{ width: '100%', height: 200 }}
            resizeMode="cover"
          />
        ) : null}

        {/* Content area */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 }}>
          {/* Point of contact subtitle */}
          {center.pointOfContact ? (
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 13,
                color: colors.textSecondary,
                marginBottom: 16,
              }}
            >
              Point of Contact: {center.pointOfContact}
            </Text>
          ) : null}

          {/* Meta rows */}
          <View style={{ gap: 16 }}>
            {/* Address */}
            {center.address ? (
              <Pressable
                onPress={handleAddressPress}
                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}
              >
                <MetaIcon icon={MapPin} color="#E8862A" colors={colors} />
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text
                    style={{
                      fontFamily: 'Inter-Medium',
                      fontSize: 14,
                      color: colors.text,
                      lineHeight: 20,
                    }}
                  >
                    {center.address}
                  </Text>
                </View>
              </Pressable>
            ) : null}

            {/* Website */}
            {center.website ? (
              <Pressable
                onPress={handleWebsitePress}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <MetaIcon icon={Globe} color="#E8862A" colors={colors} />
                <Text
                  style={{
                    fontFamily: 'Inter-Medium',
                    fontSize: 14,
                    color: '#E8862A',
                    lineHeight: 20,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {displayWebsite}
                </Text>
              </Pressable>
            ) : null}

            {/* Phone */}
            {center.phone ? (
              <Pressable
                onPress={handlePhonePress}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <MetaIcon icon={Phone} color="#E8862A" colors={colors} />
                <Text
                  style={{
                    fontFamily: 'Inter-Medium',
                    fontSize: 14,
                    color: colors.text,
                    lineHeight: 20,
                    flex: 1,
                  }}
                >
                  {center.phone}
                </Text>
              </Pressable>
            ) : null}

            {/* Acharya */}
            {center.acharya ? (
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <MetaIcon icon={User} color="#E8862A" colors={colors} />
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text
                    style={{
                      fontFamily: 'Inter-Medium',
                      fontSize: 14,
                      color: colors.text,
                      lineHeight: 20,
                    }}
                  >
                    {center.acharya}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter-Regular',
                      fontSize: 13,
                      color: colors.textSecondary,
                      lineHeight: 18,
                      marginTop: 2,
                    }}
                  >
                    Resident Acharya
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Upcoming Events */}
          {events.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text
                style={{
                  fontFamily: 'Inter-Medium',
                  fontSize: 11,
                  color: colors.textMuted,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                Upcoming Events
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
                      {/* Date callout */}
                      <View
                        style={{
                          width: 52,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 11,
                            color: '#E8862A',
                            textTransform: 'uppercase',
                            lineHeight: 14,
                          }}
                        >
                          {month}
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 22,
                            color: colors.text,
                            lineHeight: 28,
                          }}
                        >
                          {day}
                        </Text>
                      </View>

                      {/* Vertical divider */}
                      <View
                        style={{
                          width: 1,
                          backgroundColor: colors.border,
                          alignSelf: 'stretch',
                          marginHorizontal: 12,
                        }}
                      />

                      {/* Event info */}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 14,
                            color: colors.text,
                            lineHeight: 20,
                          }}
                          numberOfLines={2}
                        >
                          {event.title}
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 12,
                            color: colors.textSecondary,
                            lineHeight: 16,
                            marginTop: 2,
                          }}
                        >
                          {event.time}{event.attendees > 0 ? ` \u00B7 ${event.attendees} attending` : ''}
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
    </SafeAreaView>
  )
}
