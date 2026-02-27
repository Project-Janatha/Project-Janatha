import React from 'react'
import { View, Text, useWindowDimensions } from 'react-native'

export function ProblemSection() {
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024

  return (
    <View
      style={{
        flexDirection: isMobile ? 'column' : 'row',
        paddingHorizontal: isMobile ? 20 : isTablet ? 40 : 80,
        paddingVertical: isMobile ? 60 : isTablet ? 80 : 100,
        gap: isMobile ? 40 : isTablet ? 60 : 80,
        backgroundColor: '#FAFAF7',
        alignItems: 'center',
      }}
    >
      {/* Left: Placeholder image */}
      <View
        style={{
          width: isMobile ? '100%' : 383,
          height: isMobile ? 280 : 464,
          borderRadius: 20,
          backgroundColor: '#F5F0EB',
          flexShrink: 0,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Decorative content to represent community photo */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#E7E5E4',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#D6D3D1',
            }}
          />
        </View>
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#A8A29E',
            marginTop: 20,
          }}
        >
          Community together
        </Text>
      </View>

      {/* Right: Text content */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fontSize: 12,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: '#C2410C',
            marginBottom: 16,
          }}
        >
          THE CHALLENGE
        </Text>

        <Text
          style={{
            fontFamily: '"Inclusive Sans", sans-serif',
            fontWeight: '400',
            fontSize: isMobile ? 28 : 40,
            lineHeight: isMobile ? 36 : 48,
            color: '#1C1917',
            marginBottom: 32,
          }}
        >
          Staying connected shouldn't be this hard
        </Text>

        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: '400',
            fontSize: isMobile ? 15 : 17,
            lineHeight: isMobile ? 24 : 28,
            color: '#57534E',
            marginBottom: 20,
          }}
        >
          As CHYKs, we move cities for college and careers, often losing touch with our local
          Chinmaya Mission community. Finding a new center, learning about events, and meeting
          fellow members in a new city can feel overwhelming.
        </Text>

        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: '400',
            fontSize: isMobile ? 15 : 17,
            lineHeight: isMobile ? 24 : 28,
            color: '#57534E',
          }}
        >
          Janata bridges that gap — a single platform where every center, event, and community
          connection is just a tap away, no matter where life takes you.
        </Text>
      </View>
    </View>
  )
}
