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
import type { EventDisplay } from '../../utils/api'

// ── Helpers ─────────────────────────────────────────────────────────────

function formatDateCallout(dateStr: string): { month: string; day: string } {
  const d = new Date(dateStr + 'T00:00:00')
  const month = d
    .toLocaleDateString('en-US', { month: 'short' })
    .toUpperCase()
  const day = String(d.getDate())
  return { month, day }
}

function formatTimeDisplay(time: string): string {
  // Extract just the start time portion, e.g. "10:30 AM" from "10:30 AM - 11:30 AM"
  const parts = time.split(' - ')
  return parts[0] || time
}

// ── Main page component ─────────────────────────────────────────────────

export default function CenterDetailPage() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { center, events, loading } = useCenterDetail(id as string)

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
      // Share cancelled or failed — no action needed
    }
  }

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        edges={['top']}
      >
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#ea580c" />
        </View>
      </SafeAreaView>
    )
  }

  if (!center) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        edges={['top']}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontFamily: 'Inter-SemiBold',
              color: '#1C1917',
              marginBottom: 16,
            }}
          >
            Center not found
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: '#ea580c',
              borderRadius: 12,
              paddingHorizontal: 24,
              paddingVertical: 12,
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontFamily: 'Inter-SemiBold',
                fontSize: 15,
              }}
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  // Parse address into street + city lines
  const commaIndex = center.address.indexOf(',')
  const addressLine1 =
    commaIndex >= 0 ? center.address.slice(0, commaIndex).trim() : center.address
  const addressLine2 =
    commaIndex >= 0 ? center.address.slice(commaIndex + 1).trim() : ''

  // Strip protocol for website display
  const displayWebsite = center.website
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      edges={['top']}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Custom Navigation Bar ─────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            hitSlop={8}
          >
            <ChevronLeft size={22} color="#1C1917" />
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'Inter-Medium',
                color: '#1C1917',
              }}
            >
              Back
            </Text>
          </Pressable>
          <Pressable onPress={handleShare} hitSlop={8}>
            <Share2 size={22} color="#1C1917" />
          </Pressable>
        </View>

        {/* ── Hero Image ────────────────────────────────────────────── */}
        {center.image ? (
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Image
              source={{ uri: center.image }}
              style={{
                width: '100%',
                height: 220,
                borderRadius: 16,
              }}
              resizeMode="cover"
            />
          </View>
        ) : null}

        {/* ── Title Section ─────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 26,
              fontFamily: 'Inter-Bold',
              color: '#1C1917',
              marginBottom: 4,
            }}
          >
            {center.name}
          </Text>
          {center.acharya ? (
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Inter-Regular',
                color: '#78716C',
              }}
            >
              Resident Acharya: {center.acharya}
            </Text>
          ) : null}
        </View>

        {/* ── Meta Rows ─────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, gap: 16 }}>
          {/* Address */}
          {center.address ? (
            <Pressable
              onPress={() =>
                Linking.openURL(
                  `https://maps.google.com/?q=${encodeURIComponent(center.address)}`
                )
              }
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: '#F5F5F4',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={20} color="#E8862A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: 'Inter-Medium',
                    color: '#1C1917',
                  }}
                >
                  {addressLine1}
                </Text>
                {addressLine2 ? (
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: 'Inter-Regular',
                      color: '#78716C',
                    }}
                  >
                    {addressLine2}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ) : null}

          {/* Website */}
          {center.website ? (
            <Pressable
              onPress={() => Linking.openURL(center.website)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: '#F5F5F4',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Globe size={20} color="#E8862A" />
              </View>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: 'Inter-Medium',
                  color: '#E8862A',
                  flex: 1,
                }}
              >
                {displayWebsite}
              </Text>
            </Pressable>
          ) : null}

          {/* Phone */}
          {center.phone ? (
            <Pressable
              onPress={() => Linking.openURL(`tel:${center.phone}`)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: '#F5F5F4',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Phone size={20} color="#E8862A" />
              </View>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: 'Inter-Medium',
                  color: '#1C1917',
                }}
              >
                {center.phone}
              </Text>
            </Pressable>
          ) : null}

          {/* Acharya / Point of Contact */}
          {center.acharya ? (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: '#F5F5F4',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={20} color="#E8862A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: 'Inter-Medium',
                    color: '#1C1917',
                  }}
                >
                  {center.acharya}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: 'Inter-Regular',
                    color: '#78716C',
                  }}
                >
                  Resident Acharya
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* ── Upcoming Events Section ───────────────────────────────── */}
        {events.length > 0 ? (
          <View style={{ marginTop: 24 }}>
            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: '#E7E5E4',
                marginHorizontal: 16,
                marginBottom: 16,
              }}
            />

            {/* Section header */}
            <Text
              style={{
                fontSize: 11,
                fontFamily: 'Inter-Medium',
                color: '#A8A29E',
                letterSpacing: 1,
                textTransform: 'uppercase',
                paddingHorizontal: 16,
                marginBottom: 12,
              }}
            >
              UPCOMING EVENTS
            </Text>

            {/* Event cards */}
            <View style={{ paddingHorizontal: 16, gap: 10 }}>
              {events.map((event) => {
                const { month, day } = formatDateCallout(event.date)
                const timeDisplay = formatTimeDisplay(event.time)

                return (
                  <Pressable
                    key={event.id}
                    onPress={() => handleEventPress(event)}
                    style={{
                      flexDirection: 'row',
                      backgroundColor: '#F5F5F4',
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Date callout */}
                    <View
                      style={{
                        width: 64,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 14,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: 'Inter-SemiBold',
                          color: '#E8862A',
                          letterSpacing: 0.5,
                        }}
                      >
                        {month}
                      </Text>
                      <Text
                        style={{
                          fontSize: 22,
                          fontFamily: 'Inter-SemiBold',
                          color: '#1C1917',
                        }}
                      >
                        {day}
                      </Text>
                    </View>

                    {/* Vertical divider */}
                    <View
                      style={{
                        width: 1,
                        backgroundColor: '#E7E5E4',
                        marginVertical: 10,
                      }}
                    />

                    {/* Event info */}
                    <View
                      style={{
                        flex: 1,
                        paddingHorizontal: 12,
                        paddingVertical: 14,
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: 'Inter-SemiBold',
                          color: '#1C1917',
                          marginBottom: 3,
                        }}
                        numberOfLines={1}
                      >
                        {event.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: 'Inter-Regular',
                          color: '#78716C',
                        }}
                        numberOfLines={1}
                      >
                        {timeDisplay}
                        {event.attendees > 0
                          ? ` · ${event.attendees} attending`
                          : ''}
                      </Text>
                    </View>
                  </Pressable>
                )
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}
