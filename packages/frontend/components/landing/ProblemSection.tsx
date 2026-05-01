import React from 'react'
import { View, Text, Image, useWindowDimensions } from 'react-native'

interface PersonaCardProps {
  role: string
  name: string
  situation: string
  quote: string
  portrait: any
  accent: string
  isMobile: boolean
}

function PersonaCard({
  role,
  name,
  situation,
  quote,
  portrait,
  accent,
  isMobile,
}: PersonaCardProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: isMobile ? 24 : 32,
        boxShadow: '0 2px 24px rgba(0,0,0,0.05)',
        borderWidth: 1,
        borderColor: '#F5F0EB',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#F5F0EB',
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: '#FFFFFF',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          <Image source={portrait} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        </View>
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: accent,
          }}
        >
          {role}
        </Text>
      </View>

      <Text
        style={{
          fontFamily: '"Inclusive Sans", sans-serif',
          fontWeight: '400',
          fontSize: isMobile ? 26 : 32,
          lineHeight: isMobile ? 32 : 40,
          color: '#1C1917',
          marginBottom: 16,
        }}
      >
        Meet {name}.
      </Text>

      <Text
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: '400',
          fontSize: isMobile ? 15 : 16,
          lineHeight: isMobile ? 24 : 26,
          color: '#57534E',
          marginBottom: 20,
        }}
      >
        {situation}
      </Text>

      <View
        style={{
          borderLeftWidth: 3,
          borderLeftColor: accent,
          paddingLeft: 14,
          paddingVertical: 4,
        }}
      >
        <Text
          style={{
            fontFamily: '"Inclusive Sans", sans-serif',
            fontWeight: '400',
            fontStyle: 'italic',
            fontSize: isMobile ? 16 : 17,
            lineHeight: isMobile ? 24 : 26,
            color: '#1C1917',
          }}
        >
          “{quote}”
        </Text>
      </View>
    </View>
  )
}

export function ProblemSection() {
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024

  return (
    <View
      style={{
        paddingHorizontal: isMobile ? 20 : isTablet ? 40 : 80,
        paddingVertical: isMobile ? 60 : isTablet ? 80 : 100,
        backgroundColor: '#FAFAF7',
      }}
    >
      {/* Header */}
      <View style={{ maxWidth: 760, marginBottom: isMobile ? 40 : 56 }}>
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
          THE PROBLEM
        </Text>

        <Text
          style={{
            fontFamily: '"Inclusive Sans", sans-serif',
            fontWeight: '400',
            fontSize: isMobile ? 32 : isTablet ? 40 : 48,
            lineHeight: isMobile ? 40 : isTablet ? 48 : 56,
            color: '#1C1917',
            marginBottom: 20,
          }}
        >
          50+ centers. But CHYKs can't find each other.
        </Text>

        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: '400',
            fontSize: isMobile ? 16 : 18,
            lineHeight: isMobile ? 26 : 30,
            color: '#57534E',
          }}
        >
          Events happen every week across the Mission. They're scattered across WhatsApp, email,
          flyers, and word of mouth. Members miss out. Coordinators burn out. The community pays
          the price either way.
        </Text>
      </View>

      {/* Two persona cards */}
      <View
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 16 : 24,
        }}
      >
        <PersonaCard
          role="For Members"
          name="Kish"
          situation="Discovered Chinmaya Mission in college in Dallas, then moved back to San Jose. Had no idea how to plug back in. Took weeks just to learn there was a CHYK WhatsApp group."
          quote="I didn't know which event to show up to first, or whether I'd even be welcome."
          portrait={require('../../assets/images/landing/kish-portrait.png')}
          accent="#C2410C"
          isMobile={isMobile}
        />
        <PersonaCard
          role="For Coordinators"
          name="Guha"
          situation="Runs CHYK Dallas. Every event means making a flyer, posting to WhatsApp, creating a Google Form, checking it manually, copying the same message across five group chats. He rarely tracks who actually showed up."
          quote="I don't have the tools I need for community and event management."
          portrait={require('../../assets/images/landing/guha-portrait.png')}
          accent="#9A3412"
          isMobile={isMobile}
        />
      </View>
    </View>
  )
}
