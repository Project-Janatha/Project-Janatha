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

const NAV_LINKS = ['Features', 'Community', 'About'] as const

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
          paddingVertical: 24,
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

          {/* Get Started button -- always visible */}
          <Pressable
            onPress={() => router.push('/auth')}
            style={{
              backgroundColor: '#1C1917',
              paddingHorizontal: isMobile ? 18 : 24,
              paddingVertical: 10,
              borderRadius: 100,
              minHeight: 44,
              justifyContent: 'center',
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

          {/* Hamburger button -- mobile only */}
          {isMobile && (
            <Pressable
              onPress={() => setMenuOpen(!menuOpen)}
              style={{
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
              }}
              accessibilityRole="button"
              accessibilityLabel={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <View style={{ width: 22, gap: menuOpen ? 0 : 5, alignItems: 'center' }}>
                <View
                  style={{
                    width: 22,
                    height: 2,
                    backgroundColor: '#1C1917',
                    borderRadius: 1,
                    ...(menuOpen
                      ? { transform: 'translateY(1px) rotate(45deg)' as any }
                      : {}),
                    transitionDuration: '200ms' as any,
                    transitionProperty: 'transform' as any,
                  }}
                />
                {!menuOpen && (
                  <View
                    style={{
                      width: 22,
                      height: 2,
                      backgroundColor: '#1C1917',
                      borderRadius: 1,
                    }}
                  />
                )}
                <View
                  style={{
                    width: 22,
                    height: 2,
                    backgroundColor: '#1C1917',
                    borderRadius: 1,
                    ...(menuOpen
                      ? { transform: 'translateY(-1px) rotate(-45deg)' as any }
                      : {}),
                    transitionDuration: '200ms' as any,
                    transitionProperty: 'transform' as any,
                  }}
                />
              </View>
            </Pressable>
          )}
        </View>
      </View>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{ animation: 'navSlideDown 0.2s ease-out' }}>
          <View
            style={{
              paddingHorizontal,
              paddingBottom: 24,
              gap: 4,
              borderTopWidth: 1,
              borderTopColor: '#E7E5E4',
            }}
          >
            {NAV_LINKS.map((link) => (
              <Pressable
                key={link}
                onPress={() => setMenuOpen(false)}
                style={{
                  paddingVertical: 14,
                  minHeight: 48,
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: '"Inclusive Sans", sans-serif',
                    fontWeight: '400',
                    fontSize: 16,
                    color: '#1C1917',
                  }}
                >
                  {link}
                </Text>
              </Pressable>
            ))}
          </View>
        </div>
      )}
    </View>
  )
}
