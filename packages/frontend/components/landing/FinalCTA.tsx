import React from 'react'
import { View, Text, Pressable, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'

export function FinalCTA() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024

  return (
    <View
      style={{
        paddingHorizontal: isMobile ? 20 : isTablet ? 40 : 80,
        paddingVertical: 40,
        backgroundColor: '#FAFAF7',
      }}
    >
      <View
        style={{
          backgroundColor: '#F5F0EB',
          borderRadius: 24,
          paddingHorizontal: isMobile ? 24 : isTablet ? 40 : 80,
          paddingVertical: isMobile ? 40 : isTablet ? 60 : 80,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: '"Inclusive Sans", sans-serif',
            fontWeight: '400',
            fontSize: isMobile ? 28 : isTablet ? 32 : 40,
            lineHeight: isMobile ? 36 : 48,
            color: '#1C1917',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          Ready to find your community?
        </Text>

        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: '400',
            fontSize: isMobile ? 16 : 18,
            lineHeight: isMobile ? 24 : 28,
            color: '#78716C',
            textAlign: 'center',
            marginBottom: 32,
            maxWidth: 480,
          }}
        >
          Join thousands of CHYKs who are already using Janata to stay connected with their
          Chinmaya Mission community.
        </Text>

        <Pressable
          onPress={() => router.push('/auth')}
          style={{
            backgroundColor: '#C2410C',
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 100,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              fontSize: 16,
              color: '#FFFFFF',
            }}
          >
            Get Started Free →
          </Text>
        </Pressable>

        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: '400',
            fontSize: 14,
            color: '#A8A29E',
          }}
        >
          Available on iOS, Android, and Web
        </Text>
      </View>
    </View>
  )
}
