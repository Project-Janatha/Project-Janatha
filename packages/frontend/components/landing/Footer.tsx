import React from 'react'
import { View, Text, Pressable, Image, Linking, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import Logo from '../ui/Logo'

const CONTACT_EMAIL = 'projectjanatha@gmail.com'
const WEB_APP_URL = 'https://chinmayajanata.org'
const QR_URL =
  'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https%3A%2F%2Fchinmayajanata.org&color=1C1917&bgcolor=FFFFFF&qzone=1'

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.54,
        textTransform: 'uppercase',
        color: 'rgba(245,245,244,0.5)',
        marginBottom: 18,
      }}
    >
      {children}
    </Text>
  )
}

function ColumnLink({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ marginBottom: 12 }}>
      <Text
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: '500',
          color: '#FFFFFF',
        }}
      >
        {children}
      </Text>
    </Pressable>
  )
}

export function Footer() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024
  // Stack the footer below 1024 — the 4-col row needs real desktop width to look right
  const isStacked = isMobile || isTablet

  const horizontalPadding = isMobile ? 20 : isTablet ? 40 : 80

  const openMail = (subject: string) => {
    const body = encodeURIComponent('Hari Om,\n\n')
    Linking.openURL(
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`,
    )
  }

  return (
    <View
      style={{
        backgroundColor: '#1C1917',
        paddingTop: 80,
        paddingBottom: 28,
      }}
    >
      <View
        style={{
          maxWidth: 1280,
          marginHorizontal: 'auto',
          width: '100%',
          paddingHorizontal: horizontalPadding,
        }}
      >
        {/* Top row: 4 columns on desktop, stacked below */}
        <View
          style={{
            flexDirection: isStacked ? 'column' : 'row',
            gap: isStacked ? 40 : 40,
            marginBottom: 56,
            alignItems: 'flex-start',
          }}
        >
          {/* Brand */}
          <View
            style={{
              flex: isStacked ? undefined : 1.5,
              width: isStacked ? '100%' : undefined,
              maxWidth: isStacked ? undefined : 320,
            }}
          >
            <Logo size={28} color="#FFFFFF" style={{ marginBottom: 18 }} />
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                lineHeight: 22,
                color: 'rgba(245,245,244,0.55)',
              }}
            >
              In seva of Chinmaya Mission. Built by CHYKs, for CHYKs.
            </Text>
          </View>

          {/* Get in touch */}
          <View style={{ flex: isStacked ? undefined : 1.2, width: isStacked ? '100%' : undefined }}>
            <ColumnHeading>Get in touch</ColumnHeading>
            <ColumnLink onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
              {CONTACT_EMAIL}
            </ColumnLink>
            <ColumnLink onPress={() => Linking.openURL(WEB_APP_URL)}>
              chinmayajanata.org
            </ColumnLink>
          </View>

          {/* Help us grow */}
          <View style={{ flex: isStacked ? undefined : 1.3, width: isStacked ? '100%' : undefined }}>
            <ColumnHeading>Help us grow</ColumnHeading>
            <ColumnLink onPress={() => openMail('Coordinator — getting set up on Janata')}>
              Coordinators — post your event
            </ColumnLink>
            <ColumnLink onPress={() => openMail('Joining the Janata team')}>
              Volunteers — join the team
            </ColumnLink>
            <ColumnLink onPress={() => openMail('Acharya introduction — Janata')}>
              Acharyas — introduce us
            </ColumnLink>
          </View>

          {/* QR — needs enough width for label so text doesn't word-break */}
          <View
            style={{
              flex: isStacked ? undefined : 1.6,
              width: isStacked ? '100%' : undefined,
              minWidth: isStacked ? undefined : 280,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <View
              style={{
                backgroundColor: '#FFFFFF',
                padding: 8,
                borderRadius: 12,
              }}
            >
              <Image
                source={{ uri: QR_URL }}
                accessibilityLabel="QR code linking to chinmayajanata.org"
                style={{ width: 92, height: 92 }}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: '#FDBA74',
                  marginBottom: 6,
                }}
              >
                Scan to open
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  lineHeight: 18,
                  color: 'rgba(245,245,244,0.75)',
                }}
              >
                chinmayajanata.org{'\n'}web app, live now
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom bar */}
        <View
          style={{
            paddingTop: 24,
            borderTopWidth: 1,
            borderTopColor: 'rgba(245,245,244,0.10)',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            gap: isMobile ? 12 : undefined,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: 'rgba(245,245,244,0.45)',
            }}
          >
            © 2026 Project Janata · Built with love by CHYKs
          </Text>
          <View style={{ flexDirection: 'row', gap: 18 }}>
            <Pressable onPress={() => router.push('/privacy')}>
              <Text
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  color: 'rgba(245,245,244,0.55)',
                }}
              >
                Privacy
              </Text>
            </Pressable>
            <Pressable onPress={() => router.push('/terms')}>
              <Text
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  color: 'rgba(245,245,244,0.55)',
                }}
              >
                Terms
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )
}
