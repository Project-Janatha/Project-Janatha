import React from 'react'
import { View, Text, Pressable, Image, Linking, useWindowDimensions } from 'react-native'

const WEB_APP_URL = 'https://chinmayajanata.org'
const MOCKUP_HERO = require('../../assets/images/landing/mockup-macbook-iphone.webp')

const AppleIcon = ({ size = 22 }: { size?: number }) => (
  <svg
    width={size}
    height={Math.round(size * (26 / 22))}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ flexShrink: 0 }}
  >
    <path d="M17.05 12.04c-.03-2.83 2.31-4.18 2.41-4.25-1.31-1.92-3.36-2.18-4.09-2.21-1.74-.18-3.4 1.02-4.29 1.02-.89 0-2.25-1-3.7-.97-1.9.03-3.66 1.1-4.64 2.8-1.98 3.43-.51 8.51 1.42 11.3.94 1.36 2.07 2.89 3.51 2.84 1.41-.06 1.95-.91 3.65-.91 1.71 0 2.19.91 3.69.88 1.52-.03 2.49-1.39 3.42-2.76 1.07-1.58 1.52-3.11 1.55-3.19-.03-.01-2.97-1.14-3-4.55ZM14.4 4.18c.78-.94 1.31-2.25 1.16-3.55-1.12.05-2.48.74-3.29 1.68-.72.83-1.36 2.16-1.19 3.44 1.25.1 2.53-.63 3.32-1.57Z" />
  </svg>
)

const PlayIcon = ({ size = 22 }: { size?: number }) => (
  <svg
    width={size}
    height={Math.round(size * (24 / 22))}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ flexShrink: 0 }}
  >
    <path d="M3 2.5v19l8-9.5L3 2.5Zm9.5 9.5L4.7 3l11 6.4-3.2 2.6Zm0 0 3.2 2.6-11 6.4 7.8-9Zm1 .8 3.4-2.7 3.6 2.1c1 .6 1 2 0 2.6l-3.6 2.1-3.4-2.7L13.5 13Z" />
  </svg>
)

interface BadgeProps {
  Icon: React.ComponentType<{ size?: number }>
  kicker: string
  label: string
  dim?: boolean
}

function StoreBadge({ Icon, kicker, label, dim }: BadgeProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.30)',
        opacity: dim ? 0.55 : 1,
      }}
    >
      <Text style={{ color: '#FFFFFF' }}>
        <Icon size={22} />
      </Text>
      <View>
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            color: '#FFFFFF',
            opacity: 0.7,
            letterSpacing: 0.4,
          }}
        >
          {kicker}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            fontWeight: '700',
            color: '#FFFFFF',
            marginTop: -1,
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  )
}

export function GetAppSection() {
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024
  // Stack the section below 1024 — the side-by-side composition needs desktop width
  const isStacked = isMobile || isTablet

  const horizontalPadding = isMobile ? 20 : isTablet ? 40 : 80
  const headingSize = isMobile ? 48 : isTablet ? 60 : 84
  const verticalPadding = isMobile ? 80 : 120

  return (
    <View
      nativeID="app"
      style={{
        backgroundColor: '#1C1917',
        paddingVertical: verticalPadding,
        paddingHorizontal: horizontalPadding,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          maxWidth: 1280,
          marginHorizontal: 'auto',
          width: '100%',
          flexDirection: isStacked ? 'column' : 'row',
          alignItems: 'center',
          gap: isStacked ? 48 : 64,
        }}
      >
        {/* Copy column */}
        <View style={{ flex: isStacked ? undefined : 1.1, width: isStacked ? '100%' : undefined }}>
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              fontSize: 12,
              letterSpacing: 1.7,
              textTransform: 'uppercase',
              color: '#FDBA74',
              marginBottom: 16,
            }}
          >
            Available now
          </Text>

          <Text
            style={{
              fontFamily: '"Inclusive Sans", sans-serif',
              fontWeight: '400',
              fontSize: headingSize,
              lineHeight: headingSize,
              letterSpacing: -0.025 * headingSize,
              color: '#FFFFFF',
              marginBottom: 22,
            }}
          >
            Open Janata in your browser.{'\n'}
            <Text style={{ color: 'rgba(245,245,244,0.45)' }}>iOS coming soon.</Text>
          </Text>

          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 18,
              lineHeight: 27,
              color: 'rgba(245,245,244,0.72)',
              marginBottom: 32,
              maxWidth: 440,
            }}
          >
            The web app is live in beta — works on any phone or laptop, no install required.
            Native iOS arrives in two months. Android shortly after.
          </Text>

          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Pressable
              onPress={() => Linking.openURL(WEB_APP_URL)}
              style={{
                backgroundColor: '#EA580C',
                paddingHorizontal: 24,
                paddingVertical: 16,
                borderRadius: 9999,
                boxShadow: '0 8px 30px rgba(234,88,12,0.35)',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '600',
                  fontSize: 15,
                  color: '#FFFFFF',
                }}
              >
                Open chinmayajanata.org →
              </Text>
            </Pressable>

            <StoreBadge
              Icon={AppleIcon}
              kicker="Coming in ~2 months"
              label="iOS · App Store"
            />
            <StoreBadge
              Icon={PlayIcon}
              kicker="Later in 2026"
              label="Android · Play Store"
              dim
            />
          </View>
        </View>

        {/* Mockup — MacBook + iPhone composition. Hidden on small mobile, full-width on tablet, side-by-side on desktop */}
        {!isMobile && (
          <View
            style={{
              flex: isStacked ? undefined : 1,
              width: isStacked ? '100%' : undefined,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={MOCKUP_HERO}
              resizeMode="contain"
              accessibilityLabel="Janata running on MacBook and iPhone"
              style={{
                width: '100%',
                aspectRatio: 600 / 360,
                maxHeight: 520,
              }}
            />
          </View>
        )}
      </View>
    </View>
  )
}
