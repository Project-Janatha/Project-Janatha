import React from 'react'
import { View, Text, Image, ScrollView, Pressable, Linking } from 'react-native'
import { MapPin, Globe, Phone, User, Share2, X } from 'lucide-react-native'
import type { CenterDisplay } from '../../hooks/useApiData'
import type { EventDisplay } from '../../utils/api'

// ── Props ────────────────────────────────────────────────────────────────

type CenterDetailPanelProps = {
  center: CenterDisplay
  events: EventDisplay[]
  onClose: () => void
  onEventPress: (eventId: string) => void
}

// ── Date helper ──────────────────────────────────────────────────────────

function formatDateCallout(dateStr: string): { month: string; day: string } {
  const d = new Date(dateStr + 'T00:00:00')
  const month = d
    .toLocaleDateString('en-US', { month: 'short' })
    .toUpperCase()
  const day = String(d.getDate())
  return { month, day }
}

// ── Component ────────────────────────────────────────────────────────────

export default function CenterDetailPanel({
  center,
  events,
  onClose,
  onEventPress,
}: CenterDetailPanelProps) {
  const handleShare = async () => {
    if (center.website) {
      try {
        await Linking.openURL(center.website)
      } catch {
        // silently ignore
      }
    }
  }

  const handleAddressPress = () => {
    const query = encodeURIComponent(center.address)
    Linking.openURL(`https://maps.google.com/?q=${query}`)
  }

  const handleWebsitePress = () => {
    const url = center.website.startsWith('http')
      ? center.website
      : `https://${center.website}`
    Linking.openURL(url)
  }

  const handlePhonePress = () => {
    Linking.openURL(`tel:${center.phone}`)
  }

  // Strip protocol for display
  const displayWebsite = center.website
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')

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
      {/* ── Header bar ──────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#E7E5E4',
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter-Medium',
            fontSize: 11,
            color: '#A8A29E',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          Center Details
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={handleShare}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#F5F5F4',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Share2 size={16} color="#78716C" />
          </Pressable>

          <Pressable
            onPress={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#F5F5F4',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} color="#78716C" />
          </Pressable>
        </View>
      </View>

      {/* ── Scrollable content ──────────────────────────────────── */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <Image
          source={{ uri: center.image }}
          style={{ width: '100%', height: 200 }}
          resizeMode="cover"
        />

        {/* Content area */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 }}>
          {/* Title */}
          <Text
            style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 22,
              color: '#1C1917',
              lineHeight: 28,
            }}
          >
            {center.name}
          </Text>

          {/* Subtitle — "Established" or point of contact as subtitle */}
          {center.pointOfContact ? (
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 13,
                color: '#78716C',
                marginTop: 4,
              }}
            >
              Point of Contact: {center.pointOfContact}
            </Text>
          ) : null}

          {/* ── Meta rows ────────────────────────────────────────── */}
          <View style={{ marginTop: 20, gap: 16 }}>
            {/* Address */}
            {center.address ? (
              <Pressable
                onPress={handleAddressPress}
                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: '#F5F5F4',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={16} color="#E8862A" />
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text
                    style={{
                      fontFamily: 'Inter-Medium',
                      fontSize: 14,
                      color: '#1C1917',
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
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: '#F5F5F4',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Globe size={16} color="#E8862A" />
                </View>
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
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: '#F5F5F4',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Phone size={16} color="#E8862A" />
                </View>
                <Text
                  style={{
                    fontFamily: 'Inter-Medium',
                    fontSize: 14,
                    color: '#1C1917',
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
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: '#F5F5F4',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <User size={16} color="#E8862A" />
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text
                    style={{
                      fontFamily: 'Inter-Medium',
                      fontSize: 14,
                      color: '#1C1917',
                      lineHeight: 20,
                    }}
                  >
                    {center.acharya}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter-Regular',
                      fontSize: 13,
                      color: '#78716C',
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

          {/* ── Upcoming Events Section ──────────────────────────── */}
          {events.length > 0 && (
            <View style={{ marginTop: 24 }}>
              {/* Divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: '#E7E5E4',
                }}
              />

              {/* Section label */}
              <Text
                style={{
                  fontFamily: 'Inter-Medium',
                  fontSize: 11,
                  color: '#A8A29E',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  marginTop: 20,
                  marginBottom: 12,
                }}
              >
                Upcoming Events
              </Text>

              {/* Event cards */}
              <View style={{ gap: 8 }}>
                {events.map((event) => {
                  const { month, day } = formatDateCallout(event.date)
                  return (
                    <Pressable
                      key={event.id}
                      onPress={() => onEventPress(event.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#F5F5F4',
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
                            color: '#1C1917',
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
                          backgroundColor: '#D6D3D1',
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
                            color: '#1C1917',
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
                            color: '#78716C',
                            lineHeight: 16,
                            marginTop: 2,
                          }}
                        >
                          {event.time} {event.attendees > 0 ? `\u00B7 ${event.attendees} attending` : ''}
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
