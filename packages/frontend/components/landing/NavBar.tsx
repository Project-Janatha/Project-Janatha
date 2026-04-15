import React, { useState } from 'react'
import { View, Text, Pressable, useWindowDimensions, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import Logo from '../ui/Logo'

// Inject hamburger animation CSS (web only)
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const id = 'navbar-mobile-keyframes'
  if (!document.getElementById(id)) {
    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      @keyframes navSlideDown {
        0% { opacity: 0; transform: translateY(-8px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    `
    document.head.appendChild(style)
  }
}

const NAV_LINKS: string[] = []

export function NavBar() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024
  const [menuOpen, setMenuOpen] = useState(false)

  const paddingHorizontal = isMobile ? 20 : isTablet ? 40 : 80

  return (
    <View
      style={{
        position: 'sticky' as any,
        top: 0,
        zIndex: 50,
        backgroundColor: '#FAFAF7',
        boxShadow: '0 2px 32px 5px rgba(0,0,0,0.06)',
      }}
    >
      {/* Main bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal,
          paddingVertical: 14,
        }}
      >
        {/* Left: Logo + Name */}
        <Pressable onPress={() => router.push('/landing')}>
          <Logo size={32} />
        </Pressable>

        {/* Right: Links (hidden on mobile) + CTA */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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

          {/* Log In */}
          <Pressable
            onPress={() => router.push('/auth?mode=login')}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 100,
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#D6D3D1',
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: '400',
                fontSize: 16,
                lineHeight: 16,
                color: '#1C1917',
                textAlign: 'center',
              }}
            >
              Log In
            </Text>
          </Pressable>

          {/* Sign Up */}
          <Pressable
            onPress={() => router.push('/auth?mode=signup')}
            className="bg-primary active:bg-primary-press"
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 100,
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: '400',
                fontSize: 16,
                lineHeight: 16,
                color: '#FFFFFF',
                textAlign: 'center',
              }}
            >
              Sign Up
            </Text>
          </Pressable>

        </View>
      </View>
    </View>
  )
}
