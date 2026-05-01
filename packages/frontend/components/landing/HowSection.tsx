import React from 'react'
import { View, Text, Image, useWindowDimensions } from 'react-native'

const MOCKUP_DISCOVER = require('../../assets/images/landing/mockup-iphone-discover.webp')
const MOCKUP_CONNECT = require('../../assets/images/landing/mockup-iphone-hand.webp')
const MOCKUP_SERVE = require('../../assets/images/landing/mockup-macbook.webp')

interface PillarProps {
  number: string
  title: string
  body: string
  mockup: any
  mockupAlt: string
  highlight?: boolean
  isMobile: boolean
}

function Pillar({ number, title, body, mockup, mockupAlt, highlight, isMobile }: PillarProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: highlight ? '#1C1917' : '#FFFFFF',
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: highlight ? '#1C1917' : '#E7E5E4',
        boxShadow: highlight
          ? '0 12px 40px rgba(28,25,23,0.18)'
          : '0 4px 30px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          background: highlight
            ? 'linear-gradient(180deg, #292524 0%, #1C1917 100%)'
            : 'linear-gradient(180deg, #F4DED7 0%, #FAFAF7 100%)',
          height: isMobile ? 280 : 340,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Image
          source={mockup}
          resizeMode="contain"
          accessibilityLabel={mockupAlt}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
          }}
        />
      </div>
      <View style={{ paddingHorizontal: isMobile ? 24 : 32, paddingTop: 28, paddingBottom: 36 }}>
        <Text
          style={{
            fontFamily: '"Inclusive Sans", sans-serif',
            fontWeight: '700',
            fontSize: 14,
            color: highlight ? '#FDBA74' : '#9A3412',
            letterSpacing: 1.96,
            marginBottom: 10,
          }}
        >
          {number}
        </Text>
        <Text
          style={{
            fontFamily: '"Inclusive Sans", sans-serif',
            fontWeight: '700',
            fontSize: 28,
            lineHeight: 31,
            letterSpacing: -0.42,
            color: highlight ? '#FFFFFF' : '#1C1917',
            marginBottom: 10,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 15,
            lineHeight: 22,
            color: highlight ? 'rgba(245,245,244,0.78)' : '#57534E',
          }}
        >
          {body}
        </Text>
      </View>
    </View>
  )
}

export function HowSection() {
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024

  const horizontalPadding = isMobile ? 20 : isTablet ? 40 : 80
  const headingSize = isMobile ? 44 : isTablet ? 60 : 76

  return (
    <View
      nativeID="how"
      style={{
        backgroundColor: '#FAFAF7',
        paddingVertical: isMobile ? 64 : 96,
      }}
    >
      <View style={{ maxWidth: 1280, marginHorizontal: 'auto', width: '100%', paddingHorizontal: horizontalPadding }}>
        {/* Header */}
        <View style={{ marginBottom: isMobile ? 40 : 56, alignItems: 'center' }}>
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
            How it works
          </Text>

          <Text
            style={{
              fontFamily: '"Inclusive Sans", sans-serif',
              fontWeight: '400',
              fontSize: headingSize,
              lineHeight: Math.round(headingSize * 1.05),
              letterSpacing: -0.025 * headingSize,
              color: '#1C1917',
              textAlign: 'center',
              margin: 0,
            }}
          >
            Discover. Connect.{' '}
            <Text style={{ color: '#9A3412', fontStyle: 'italic' }}>Serve.</Text>
          </Text>
        </View>

        {/* Three pillars */}
        <View
          style={{
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 16 : 22,
          }}
        >
          <Pillar
            number="01"
            title="Discover"
            body="Open the map. See every CM center and event nearby."
            mockup={MOCKUP_DISCOVER}
            mockupAlt="Janata iOS app showing the discover map"
            isMobile={isMobile}
          />
          <Pillar
            number="02"
            title="Connect"
            body="See who's going. Meet CHYKs at other centers before you show up."
            mockup={MOCKUP_CONNECT}
            mockupAlt="Hand holding iPhone with Janata events list"
            highlight
            isMobile={isMobile}
          />
          <Pillar
            number="03"
            title="Serve"
            body="Coordinators: post events, track RSVPs, share a link. One place."
            mockup={MOCKUP_SERVE}
            mockupAlt="MacBook displaying Janata coordinator dashboard"
            isMobile={isMobile}
          />
        </View>
      </View>
    </View>
  )
}
