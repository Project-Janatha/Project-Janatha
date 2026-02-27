import React, { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, Pressable, Platform, useWindowDimensions, ScrollView } from 'react-native'

const TAB_DURATION = 5000 // 5 seconds per tab

// Inject CSS keyframes for progress bar animation (web only)
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const id = 'apppreview-keyframes'
  if (!document.getElementById(id)) {
    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      @keyframes progressFill {
        0% { width: 0%; }
        100% { width: 100%; }
      }
      @keyframes fadeSlideIn {
        0% { opacity: 0; transform: translateY(12px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes popIn {
        0% { opacity: 0; transform: scale(0.85) translateY(8px); }
        60% { transform: scale(1.02) translateY(-2px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(194,65,12,0.3); }
        50% { box-shadow: 0 0 0 8px rgba(194,65,12,0); }
      }
    `
    document.head.appendChild(style)
  }
}

interface FeatureTab {
  number: string
  title: string
  heading: string
  description: string
}

const FEATURES: FeatureTab[] = [
  {
    number: '01',
    title: 'Discover Centers',
    heading: 'Find your nearest Chinmaya Mission center',
    description:
      'Explore an interactive map of centers worldwide. View detailed profiles with upcoming events, member counts, and directions — all in one place.',
  },
  {
    number: '02',
    title: 'Attend Events',
    heading: 'Never miss a study group or celebration',
    description:
      'Browse upcoming events across all your centers. Register with one tap, get reminders, and see who else is attending before you arrive.',
  },
  {
    number: '03',
    title: 'Build Community',
    heading: 'Grow together with fellow seekers',
    description:
      'Connect with CHYKs in your area, join seva projects, and track your community\'s growth. See real-time activity and find your people wherever you go.',
  },
]

function TabPill({
  feature,
  isActive,
  onPress,
  cycleKey,
}: {
  feature: FeatureTab
  isActive: boolean
  onPress: () => void
  cycleKey: number
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
        borderRadius: 100,
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Progress bar underline */}
      {isActive && (
        <div
          key={`prog-${cycleKey}`}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 3,
            backgroundColor: '#C2410C',
            borderRadius: 2,
            animation: `progressFill ${TAB_DURATION}ms linear forwards`,
          }}
        />
      )}
      <Text
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: '600',
          fontSize: 11,
          color: isActive ? '#C2410C' : '#A8A29E',
          letterSpacing: 0.5,
        }}
      >
        {feature.number}
      </Text>
      <Text
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: isActive ? '500' : '400',
          fontSize: 14,
          color: isActive ? '#1C1917' : '#78716C',
        }}
      >
        {feature.title}
      </Text>
    </Pressable>
  )
}

// ------- Per-tab Visuals -------

function Popover({
  label,
  top,
  left,
  right,
  delay,
  accent,
}: {
  label: string
  top?: number
  left?: number
  right?: number
  delay?: number
  accent?: boolean
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        right,
        animation: `popIn 0.4s ease-out ${delay || 0}ms both`,
        zIndex: 10,
      }}
    >
      <View
        style={{
          backgroundColor: accent ? '#C2410C' : '#FFFFFF',
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500',
            fontSize: 12,
            color: accent ? '#FFFFFF' : '#1C1917',
          }}
        >
          {label}
        </Text>
      </View>
    </div>
  )
}

function DiscoverVisual({ isMobile }: { isMobile: boolean }) {
  return (
    <div key="discover" style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
      <View
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          gap: 24,
          alignItems: isMobile ? 'stretch' : 'flex-end',
          justifyContent: 'center',
          marginTop: isMobile ? 24 : 48,
          position: 'relative',
        }}
      >
        {/* Map mockup */}
        <View
          style={{
            width: isMobile ? '100%' : 480,
            height: isMobile ? 220 : 340,
            borderRadius: 16,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Map background */}
          <View style={{ flex: 1, backgroundColor: '#F3F1EE' }}>
            {/* Grid lines to suggest a map */}
            {(isMobile ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5]).map((i) => (
              <View
                key={`h-${i}`}
                style={{
                  position: 'absolute',
                  top: i * (isMobile ? 50 : 60) + 20,
                  left: 0,
                  right: 0,
                  height: 1,
                  backgroundColor: '#E7E5E4',
                  opacity: 0.6,
                }}
              />
            ))}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <View
                key={`v-${i}`}
                style={{
                  position: 'absolute',
                  left: i * 72 + 30,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  backgroundColor: '#E7E5E4',
                  opacity: 0.6,
                }}
              />
            ))}

            {/* Map pins */}
            <div style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}>
              <View
                style={{
                  position: 'absolute',
                  top: isMobile ? 60 : 100,
                  left: isMobile ? '35%' : 160,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: '#C2410C',
                  borderWidth: 3,
                  borderColor: '#FFFFFF',
                }}
              />
            </div>
            <View
              style={{
                position: 'absolute',
                top: isMobile ? 110 : 180,
                left: isMobile ? '60%' : 280,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#C2410C',
                opacity: 0.6,
                borderWidth: 2,
                borderColor: '#FFFFFF',
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: isMobile ? 50 : 80,
                left: isMobile ? '75%' : 350,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#C2410C',
                opacity: 0.6,
                borderWidth: 2,
                borderColor: '#FFFFFF',
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: isMobile ? 140 : 220,
                left: isMobile ? '25%' : 120,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#C2410C',
                opacity: 0.4,
                borderWidth: 2,
                borderColor: '#FFFFFF',
              }}
            />
          </View>

          {/* Search bar overlay */}
          <View
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              right: 16,
              height: 40,
              borderRadius: 10,
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: '#A8A29E',
              }}
            />
            <Text
              style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A8A29E' }}
            >
              Search centers near you...
            </Text>
          </View>
        </View>

        {/* Side panel — center detail card */}
        <View
          style={{
            width: isMobile ? '100%' : 220,
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          <View style={{ height: isMobile ? 48 : 80, backgroundColor: '#FFF7ED' }} />
          <View style={{ padding: isMobile ? 12 : 16, gap: 8 }}>
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                fontSize: 14,
                color: '#1C1917',
              }}
            >
              CM San Jose
            </Text>
            <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#78716C' }}>
              San Jose, CA
            </Text>
            <View style={{ height: 1, backgroundColor: '#F5F5F4', marginVertical: 4 }} />
            <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#78716C' }}>
              5 upcoming events
            </Text>
            <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#78716C' }}>
              342 members
            </Text>
          </View>
        </View>

        {!isMobile && (
          <>
            <Popover label="Nearest to you" top={60} left={40} delay={200} accent />
            <Popover label="342 active members" top={20} right={-10} delay={500} />
          </>
        )}
      </View>
    </div>
  )
}

function EventsVisual({ isMobile }: { isMobile: boolean }) {
  const events = [
    { title: 'Bhagavad Gita Study', time: 'Today · 10:30 AM', attendees: 14, color: '#FFF7ED' },
    { title: 'Youth Retreat', time: 'Sat, Apr 2 · 9:00 AM', attendees: 48, color: '#EFF6FF' },
    { title: 'Devi Group', time: 'Mon, Mar 18 · 7:30 PM', attendees: 22, color: '#F5F3FF' },
  ]

  return (
    <div key="events" style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
      <View
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          gap: 24,
          justifyContent: 'center',
          marginTop: isMobile ? 24 : 48,
          position: 'relative',
        }}
      >
        {/* Event list */}
        <View
          style={{
            width: isMobile ? '100%' : 380,
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F5F5F4',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                fontSize: 15,
                color: '#1C1917',
              }}
            >
              Upcoming Events
            </Text>
            <View
              style={{
                backgroundColor: '#FFF7ED',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 100,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '600',
                  fontSize: 11,
                  color: '#C2410C',
                }}
              >
                3 this week
              </Text>
            </View>
          </View>

          {/* Event items */}
          {events.map((evt, i) => (
            <div
              key={evt.title}
              style={{ animation: `fadeSlideIn 0.3s ease-out ${200 + i * 150}ms both` }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderBottomWidth: i < events.length - 1 ? 1 : 0,
                  borderBottomColor: '#F5F5F4',
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    backgroundColor: evt.color,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: '500',
                      fontSize: 14,
                      color: '#1C1917',
                      marginBottom: 2,
                    }}
                  >
                    {evt.title}
                  </Text>
                  <Text
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#78716C' }}
                  >
                    {evt.time}
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#A8A29E' }}
                >
                  {evt.attendees} going
                </Text>
              </View>
            </div>
          ))}
        </View>

        {/* Event detail card */}
        <View
          style={{
            width: isMobile ? '100%' : 300,
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          <View style={{ height: isMobile ? 60 : 100, backgroundColor: '#FFF7ED' }} />
          <View style={{ padding: isMobile ? 16 : 20, gap: 10 }}>
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                fontSize: isMobile ? 14 : 16,
                color: '#1C1917',
              }}
            >
              Bhagavad Gita Study
            </Text>
            <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#78716C' }}>
              Chapter 12 — The Yoga of Devotion
            </Text>
            <View style={{ height: 1, backgroundColor: '#F5F5F4', marginVertical: 2 }} />
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#22C55E',
                }}
              />
              <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#78716C' }}>
                14 people attending
              </Text>
            </View>
            {/* Register button */}
            <View
              style={{
                backgroundColor: '#C2410C',
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '500',
                  fontSize: 13,
                  color: '#FFFFFF',
                }}
              >
                Register — Free
              </Text>
            </View>
          </View>
        </View>

        {!isMobile && (
          <>
            <Popover label="One-tap registration" top={200} right={20} delay={300} accent />
            <Popover label="Chapter-by-chapter" top={60} right={20} delay={600} />
          </>
        )}
      </View>
    </div>
  )
}

function CommunityVisual({ isMobile }: { isMobile: boolean }) {
  const members = [
    { name: 'Arjun K.', role: 'CHYK Leader', color: '#C2410C' },
    { name: 'Priya S.', role: 'Study Group', color: '#7C3AED' },
    { name: 'Rohan M.', role: 'Seva Volunteer', color: '#0891B2' },
    { name: 'Ananya R.', role: 'New Member', color: '#059669' },
  ]

  return (
    <div key="community" style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
      <View
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          gap: 24,
          justifyContent: 'center',
          marginTop: isMobile ? 24 : 48,
          position: 'relative',
        }}
      >
        {/* Activity feed */}
        <View
          style={{
            width: isMobile ? '100%' : 360,
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            padding: 20,
            gap: 16,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              fontSize: 15,
              color: '#1C1917',
            }}
          >
            Community Activity
          </Text>

          {members.map((m, i) => (
            <div
              key={m.name}
              style={{ animation: `fadeSlideIn 0.3s ease-out ${200 + i * 150}ms both` }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: m.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: '600',
                      fontSize: 14,
                      color: '#FFFFFF',
                    }}
                  >
                    {m.name[0]}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: '500',
                      fontSize: 13,
                      color: '#1C1917',
                    }}
                  >
                    {m.name}
                  </Text>
                  <Text
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#78716C' }}
                  >
                    {m.role}
                  </Text>
                </View>
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: '#22C55E',
                  }}
                />
              </View>
            </div>
          ))}
        </View>

        {/* Stats summary */}
        <View style={{ width: isMobile ? '100%' : 240, gap: isMobile ? 12 : 16, flexDirection: isMobile ? 'row' : 'column', flexWrap: isMobile ? 'wrap' : undefined }}>
          {[
            { value: '1,240', label: 'Active members', sub: 'across 12 centers' },
            { value: '86', label: 'Events this month', sub: '+12% from last month' },
            { value: '34', label: 'Study groups', sub: 'currently running' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{ animation: `popIn 0.4s ease-out ${300 + i * 200}ms both`, flex: isMobile ? '1 1 45%' : undefined }}
            >
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  padding: isMobile ? 14 : 18,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                }}
              >
                <Text
                  style={{
                    fontFamily: '"Inclusive Sans", sans-serif',
                    fontWeight: '400',
                    fontSize: isMobile ? 22 : 28,
                    color: '#C2410C',
                    marginBottom: 2,
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600',
                    fontSize: isMobile ? 12 : 13,
                    color: '#1C1917',
                    marginBottom: 2,
                  }}
                >
                  {stat.label}
                </Text>
                {!isMobile && (
                <Text
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#78716C' }}
                >
                  {stat.sub}
                </Text>
                )}
              </View>
            </div>
          ))}
        </View>

        {!isMobile && (
          <>
            <Popover label="Real-time activity" top={-10} left={40} delay={400} accent />
            <Popover label="+12% growth" top={100} right={-10} delay={700} />
          </>
        )}
      </View>
    </div>
  )
}

export function AppPreview() {
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024

  const [activeIndex, setActiveIndex] = useState(0)
  const [cycleKey, setCycleKey] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goToTab = useCallback(
    (index: number) => {
      setActiveIndex(index)
      setCycleKey((k) => k + 1)
    },
    []
  )

  // Auto-cycle tabs
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      goToTab((activeIndex + 1) % FEATURES.length)
    }, TAB_DURATION)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [activeIndex, cycleKey, goToTab])

  const handleTabPress = (index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    goToTab(index)
  }

  const activeFeature = FEATURES[activeIndex]

  const sectionPadding = isMobile ? 20 : isTablet ? 40 : 80

  const renderVisual = () => {
    switch (activeIndex) {
      case 0:
        return <DiscoverVisual isMobile={isMobile} />
      case 1:
        return <EventsVisual isMobile={isMobile} />
      case 2:
        return <CommunityVisual isMobile={isMobile} />
      default:
        return null
    }
  }

  const tabPills = FEATURES.map((feature, index) => (
    <TabPill
      key={feature.number}
      feature={feature}
      isActive={index === activeIndex}
      onPress={() => handleTabPress(index)}
      cycleKey={cycleKey}
    />
  ))

  return (
    <View
      style={{
        backgroundColor: '#F4DED7',
        paddingHorizontal: sectionPadding,
        paddingVertical: sectionPadding,
      }}
    >
      {/* Section label */}
      <Text
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: '600',
          fontSize: 12,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: '#C2410C',
          marginBottom: 20,
        }}
      >
        THE PLATFORM
      </Text>

      {/* Tab pills */}
      {isMobile ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 32 }}
          contentContainerStyle={{ flexDirection: 'row', gap: 10 }}
        >
          {tabPills}
        </ScrollView>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 32 }}>
          {tabPills}
        </View>
      )}

      {/* Dynamic heading + description */}
      <div key={`text-${cycleKey}`} style={{ animation: 'fadeSlideIn 0.35s ease-out', display: 'flex', flexDirection: 'column' }}>
        <Text
          style={{
            fontFamily: '"Inclusive Sans", sans-serif',
            fontWeight: '400',
            fontSize: isMobile ? 28 : isTablet ? 32 : 40,
            lineHeight: isMobile ? 36 : isTablet ? 40 : 48,
            color: '#1C1917',
            marginBottom: 16,
            maxWidth: 640,
          }}
        >
          {activeFeature.heading}
        </Text>

        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: '400',
            fontSize: isMobile ? 15 : 18,
            lineHeight: isMobile ? 24 : 28,
            color: '#57534E',
            marginBottom: 8,
            maxWidth: 600,
          }}
        >
          {activeFeature.description}
        </Text>
      </div>

      {/* Visual for active tab */}
      <View style={{ position: 'relative', minHeight: isMobile ? 'auto' : 420 }}>
        {renderVisual()}
      </View>
    </View>
  )
}
