import React from 'react'
import { View, Text, Pressable, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import Logo from '../ui/Logo'

const NAV_LINKS = ['Features', 'Community', 'About'] as const

export function NavBar() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024

  const paddingHorizontal = isMobile ? 20 : isTablet ? 40 : 80

  return (
    <View
      style={{
        position: 'sticky' as any,
        top: 0,
        zIndex: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal,
        paddingVertical: 24,
        backgroundColor: '#FAFAF7',
        boxShadow: '0 2px 32px 5px rgba(0,0,0,0.06)',
      }}
    >
      {/* Left: Logo + Name */}
      <Pressable onPress={() => router.push('/landing')}>
        <Logo size={32} />
      </Pressable>

      {/* Right: Links (hidden on mobile) + CTA */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32 }}>
        {!isMobile &&
          NAV_LINKS.map((link) => (
            <Pressable key={link}>
              <Text
                style={{
                  fontFamily: '"Inclusive Sans", sans-serif',
                  fontWeight: '400',
                  fontSize: 15,
                  color: '#78716C',
                }}
              >
                {link}
              </Text>
            </Pressable>
          ))}
        <Pressable
          onPress={() => router.push('/auth')}
          style={{
            backgroundColor: '#1C1917',
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: 100,
          }}
        >
          <Text
            style={{
              fontFamily: '"Inclusive Sans", sans-serif',
              fontWeight: '400',
              fontSize: 15,
              color: '#FFFFFF',
            }}
          >
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
