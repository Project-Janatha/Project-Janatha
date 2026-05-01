import React from 'react'
import { View, Text, Image, useWindowDimensions } from 'react-native'

const COMMUNITY_IMG = require('../../assets/images/landing/community-gathering.jpg')
const VEDANTA_IMG = require('../../assets/images/landing/vedanta-class.jpg')

const COORDINATOR_TOOLS = ['WhatsApp', 'Email', 'Forms', 'Instagram', 'Spreadsheets']

export function WhySection() {
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024

  const horizontalPadding = isMobile ? 20 : isTablet ? 40 : 80
  const headingSize = isMobile ? 36 : isTablet ? 48 : 60
  const headingLine = Math.round(headingSize * 1.05)
  const cardHeight = isMobile ? 220 : 280
  const subHeadingSize = isMobile ? 24 : 30

  return (
    <View
      nativeID="why"
      style={{
        backgroundColor: '#F4DED7',
        paddingVertical: isMobile ? 64 : 96,
      }}
    >
      <View style={{ maxWidth: 1280, marginHorizontal: 'auto', width: '100%', paddingHorizontal: horizontalPadding }}>
        {/* Header */}
        <View style={{ maxWidth: 760, marginBottom: isMobile ? 36 : 48 }}>
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              fontSize: 12,
              letterSpacing: 1.7,
              textTransform: 'uppercase',
              color: '#9A3412',
              marginBottom: 16,
            }}
          >
            Why Janata
          </Text>

          <Text
            style={{
              fontFamily: '"Inclusive Sans", sans-serif',
              fontWeight: '400',
              fontSize: headingSize,
              lineHeight: headingLine,
              letterSpacing: -0.02 * headingSize,
              color: '#1C1917',
              margin: 0,
            }}
          >
            50+ centers.{'\n'}
            <Text style={{ color: '#78716C' }}>And no one place to find them.</Text>
          </Text>
        </View>

        {/* Two cards */}
        <View
          style={{
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 16 : 24,
          }}
        >
          {/* Members card (light) */}
          <View
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 28,
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
              borderWidth: 1,
              borderColor: '#E7E5E4',
            }}
          >
            <View style={{ position: 'relative', height: cardHeight, overflow: 'hidden' }}>
              <Image
                source={COMMUNITY_IMG}
                resizeMode="cover"
                style={{ width: '100%', height: '100%' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.30) 100%)',
                  pointerEvents: 'none',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 9999,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '700',
                    fontSize: 11,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: '#9A3412',
                  }}
                >
                  For members
                </Text>
              </View>
            </View>

            <View style={{ paddingHorizontal: isMobile ? 24 : 36, paddingTop: 28, paddingBottom: 32 }}>
              <Text
                style={{
                  fontFamily: '"Inclusive Sans", sans-serif',
                  fontWeight: '700',
                  fontSize: subHeadingSize,
                  lineHeight: Math.round(subHeadingSize * 1.1),
                  letterSpacing: -0.015 * subHeadingSize,
                  color: '#1C1917',
                  marginBottom: 16,
                }}
              >
                Events exist.{'\n'}Nobody knows about them.
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 16,
                  lineHeight: 25,
                  color: '#57534E',
                }}
              >
                New to a city? The right WhatsApp group takes weeks to find — if you ever do.
              </Text>
            </View>
          </View>

          {/* Coordinators card (dark) */}
          <View
            style={{
              flex: 1,
              backgroundColor: '#1C1917',
              borderRadius: 28,
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
              borderWidth: 1,
              borderColor: '#1C1917',
            }}
          >
            <View style={{ position: 'relative', height: cardHeight, overflow: 'hidden' }}>
              <Image
                source={VEDANTA_IMG}
                resizeMode="cover"
                style={{ width: '100%', height: '100%' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(28,25,23,0) 30%, rgba(28,25,23,0.78) 100%)',
                  pointerEvents: 'none',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  backgroundColor: 'rgba(28,25,23,0.7)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 9999,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '700',
                    fontSize: 11,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: '#FDBA74',
                  }}
                >
                  For coordinators
                </Text>
              </View>
            </View>

            <View style={{ paddingHorizontal: isMobile ? 24 : 36, paddingTop: 28, paddingBottom: 32 }}>
              <Text
                style={{
                  fontFamily: '"Inclusive Sans", sans-serif',
                  fontWeight: '700',
                  fontSize: subHeadingSize,
                  lineHeight: Math.round(subHeadingSize * 1.1),
                  letterSpacing: -0.015 * subHeadingSize,
                  color: '#FFFFFF',
                  marginBottom: 16,
                }}
              >
                One event,{'\n'}five tools, every time.
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {COORDINATOR_TOOLS.map((tool) => (
                  <View
                    key={tool}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 9999,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.16)',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: '500',
                        fontSize: 13,
                        color: 'rgba(245,245,244,0.85)',
                      }}
                    >
                      {tool}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
