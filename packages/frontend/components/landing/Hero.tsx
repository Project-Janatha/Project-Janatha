import React, { useEffect, useRef } from 'react'
import { View, Text, Pressable, Platform, useWindowDimensions, ScrollView, Image } from 'react-native'
import { useRouter } from 'expo-router'

// Inject CSS keyframes for the infinite scroll animation (web only)
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const id = 'hero-scroll-keyframes'
  if (!document.getElementById(id)) {
    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      @keyframes heroScroll {
        0% { transform: translateY(0); }
        100% { transform: translateY(-50%); }
      }
      @keyframes heroScrollHorizontal {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `
    document.head.appendChild(style)
  }
}

interface CardData {
  type: 'event' | 'center' | 'map' | 'stat'
  title: string
  subtitle: string
  color: string
  icon?: string
  stat?: string
  image?: any
}

const CARDS: CardData[] = [
  {
    type: 'event',
    title: 'Geeta Chanting',
    subtitle: 'Mar 15 · 6:00 PM',
    color: '#FED7AA',
    image: require('../../assets/images/landing/Swami Chinmayananda.jpg'),
  },
  { type: 'center', title: 'CM San Jose', subtitle: 'San Jose, CA', color: '#F5F0EB', icon: 'S' },
  { type: 'event', title: 'Youth Retreat', subtitle: 'Apr 2 · 9:00 AM', color: '#BFDBFE' },
  { type: 'map', title: '12 Centers', subtitle: 'Within 50 miles', color: '#E8E4DF' },
  { type: 'stat', title: '1,240 Members', subtitle: 'Active this month', color: '#F0FDF4', stat: '1,240' },
  { type: 'event', title: 'Vedanta Course', subtitle: 'Mar 22 · 7:00 PM', color: '#D9F99D' },
  { type: 'center', title: 'CM Houston', subtitle: 'Houston, TX', color: '#F5F0EB', icon: 'H' },
  { type: 'event', title: 'Bala Vihar', subtitle: 'Every Sunday · 10 AM', color: '#FBCFE8' },
  { type: 'stat', title: '86 Events', subtitle: 'This month', color: '#EFF6FF', stat: '86' },
  { type: 'center', title: 'CM Chicago', subtitle: 'Chicago, IL', color: '#F5F0EB', icon: 'C' },
  { type: 'event', title: 'Devi Group', subtitle: 'Mar 18 · 7:30 PM', color: '#FDE68A' },
  { type: 'event', title: 'Meditation', subtitle: 'Daily · 6:00 AM', color: '#E9D5FF' },
]

function ScrollCard({ card }: { card: CardData }) {
  if (card.type === 'event') {
    return (
      <View
        style={{
          width: 220,
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          padding: 14,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        {card.image ? (
          <Image
            source={card.image}
            resizeMode="cover"
            style={{
              width: '100%',
              height: 48,
              borderRadius: 8,
              marginBottom: 10,
            }}
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: 48,
              borderRadius: 8,
              backgroundColor: card.color,
              marginBottom: 10,
            }}
          />
        )}
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fontSize: 13,
            color: '#1C1917',
            marginBottom: 3,
          }}
        >
          {card.title}
        </Text>
        <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#78716C' }}>
          {card.subtitle}
        </Text>
      </View>
    )
  }

  if (card.type === 'center') {
    return (
      <View
        style={{
          width: 220,
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: card.color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: '700',
              fontSize: 16,
              color: '#C2410C',
            }}
          >
            {card.icon}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              fontSize: 13,
              color: '#1C1917',
              marginBottom: 2,
            }}
          >
            {card.title}
          </Text>
          <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#78716C' }}>
            {card.subtitle}
          </Text>
        </View>
      </View>
    )
  }

  if (card.type === 'map') {
    return (
      <View
        style={{
          width: 220,
          height: 100,
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: card.color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Map pin dots */}
          <View style={{ flexDirection: 'row', gap: 20, marginBottom: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#C2410C' }} />
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#C2410C', opacity: 0.6 }} />
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#C2410C' }} />
          </View>
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              fontSize: 12,
              color: '#57534E',
            }}
          >
            {card.title}
          </Text>
          <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#78716C' }}>
            {card.subtitle}
          </Text>
        </View>
      </View>
    )
  }

  // stat card
  return (
    <View
      style={{
        width: 220,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <Text
        style={{
          fontFamily: '"Inclusive Sans", sans-serif',
          fontWeight: '400',
          fontSize: 28,
          color: '#C2410C',
          marginBottom: 2,
        }}
      >
        {card.stat}
      </Text>
      <Text
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: '600',
          fontSize: 13,
          color: '#1C1917',
          marginBottom: 2,
        }}
      >
        {card.title.replace(card.stat + ' ', '')}
      </Text>
      <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#78716C' }}>
        {card.subtitle}
      </Text>
    </View>
  )
}

function InfiniteScrollColumn({
  cards,
  speed,
  offset,
}: {
  cards: CardData[]
  speed: number
  offset: number
}) {
  // Duplicate cards for seamless loop
  const doubled = [...cards, ...cards]
  const totalHeight = cards.length * (130 + 14) // approx card height + gap

  return (
    <View style={{ overflow: 'hidden', height: 900, marginTop: offset, paddingHorizontal: 14 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          animation: `heroScroll ${speed}s linear infinite`,
        }}
      >
        {doubled.map((card, i) => (
          <ScrollCard key={`${card.title}-${i}`} card={card} />
        ))}
      </div>
    </View>
  )
}

function AvatarStack() {
  const colors = ['#C2410C', '#78716C', '#1C1917', '#A8A29E']
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {colors.map((bg, i) => (
        <View
          key={i}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: bg,
            borderWidth: 2,
            borderColor: '#FAFAF7',
            marginLeft: i > 0 ? -8 : 0,
          }}
        />
      ))}
    </View>
  )
}

function HorizontalScrollRow() {
  const doubled = [...CARDS, ...CARDS]

  return (
    <View style={{ overflow: 'hidden', marginTop: 32, marginHorizontal: -20, position: 'relative', paddingVertical: 14 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 14,
          animation: `heroScrollHorizontal 25s linear infinite`,
        }}
      >
        {doubled.map((card, i) => (
          <View key={`${card.title}-h-${i}`} style={{ flexShrink: 0 }}>
            <ScrollCard card={card} />
          </View>
        ))}
      </div>
    </View>
  )
}

export function Hero() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024

  // Split cards into two columns
  const col1Cards = CARDS.filter((_, i) => i % 2 === 0)
  const col2Cards = CARDS.filter((_, i) => i % 2 === 1)

  return (
    <View
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: isMobile ? 60 : 100,
        paddingBottom: isMobile ? 40 : 80,
        paddingLeft: isMobile ? 20 : isTablet ? 40 : 80,
        paddingRight: isMobile ? 20 : 0,
        minHeight: isMobile ? undefined : 656,
        backgroundColor: '#FAFAF7',
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      {/* Left column */}
      <View style={{ flex: isMobile ? undefined : 1, maxWidth: isMobile ? undefined : 560, zIndex: 1 }}>
        <Text
          style={{
            fontFamily: '"Inclusive Sans", sans-serif',
            fontWeight: '400',
            fontSize: isMobile ? 42 : isTablet ? 56 : 72,
            lineHeight: isMobile ? 48 : isTablet ? 64 : 80,
            letterSpacing: -0.02 * (isMobile ? 42 : isTablet ? 56 : 72),
            color: '#1C1917',
            marginBottom: 24,
          }}
        >
          {'Find your center.\nGrow together.'}
        </Text>

        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: '400',
            fontSize: isMobile ? 16 : 20,
            lineHeight: isMobile ? 26 : 32,
            color: '#78716C',
            marginBottom: 40,
            maxWidth: 480,
          }}
        >
          Discover Chinmaya Mission centers, connect with your local community, and grow through
          events, study groups, and seva opportunities.
        </Text>

        {/* CTAs */}
        <View
          style={{
            flexDirection: isMobile ? 'column' : 'row',
            gap: 16,
            marginBottom: 48,
          }}
        >
          <Pressable
            onPress={() => router.push('/auth')}
            style={{
              backgroundColor: '#C2410C',
              paddingHorizontal: 28,
              paddingVertical: 14,
              borderRadius: 100,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              ...(isMobile ? { width: '100%' } : {}),
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
              Join the Community →
            </Text>
          </Pressable>

          <Pressable
            style={{
              borderWidth: 1,
              borderColor: '#D6D3D1',
              paddingHorizontal: 28,
              paddingVertical: 14,
              borderRadius: 100,
              alignItems: 'center',
              justifyContent: 'center',
              ...(isMobile ? { width: '100%' } : {}),
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500',
                fontSize: 16,
                color: '#1C1917',
              }}
            >
              Explore platform
            </Text>
          </Pressable>
        </View>

        {/* Avatar stack + tagline */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <AvatarStack />
          <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#78716C' }}>
            A project built by CHYKs, for CHYKs.{' '}
            <Text style={{ color: '#C2410C', fontWeight: '500' }}>Learn more</Text>
          </Text>
        </View>

        {/* Horizontal scrolling card row on mobile */}
        {isMobile && <HorizontalScrollRow />}
      </View>

      {/* Infinite scrolling card columns -- rotated (hidden on mobile) */}
      {!isMobile && (
        <View
          style={{
            flex: 1,
            position: 'relative',
            minHeight: 560,
            overflow: 'hidden',
            paddingHorizontal: 14,
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: -100,
              right: isTablet ? -54 : -34,
              width: isTablet ? 440 : 520,
              height: 1000,
              transform: 'rotate(-4deg)',
              flexDirection: 'row',
              gap: 14,
            }}
          >
            <InfiniteScrollColumn cards={col1Cards} speed={30} offset={0} />
            <InfiniteScrollColumn cards={col2Cards} speed={25} offset={-60} />
          </View>
          {/* Fade edges */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 120,
              zIndex: 2,
              pointerEvents: 'none',
              background: 'linear-gradient(180deg, #FAFAF7 20%, rgba(250, 250, 247, 0))',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 140,
              zIndex: 2,
              pointerEvents: 'none',
              background: 'linear-gradient(0deg, #FAFAF7 15%, rgba(250, 250, 247, 0))',
            }}
          />
        </View>
      )}
    </View>
  )
}
