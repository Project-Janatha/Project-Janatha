import React from 'react'
import { View, Text, Pressable, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import Logo from '../ui/Logo'

interface FooterLink {
  label: string
  url?: string
}

interface FooterColumn {
  title: string
  links: FooterLink[]
}

const COLUMNS: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', url: 'https://chinmaya-janata.org/#features' },
      { label: 'Centers', url: 'https://chinmaya-janata.org/#centers' },
      { label: 'Events', url: 'https://chinmaya-janata.org/#events' },
      { label: 'Mobile App', url: 'https://chinmaya-janata.org/#download' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'About Us', url: 'https://chinmaya-janata.org/#about' },
      { label: 'CHYKs', url: 'https://chinmaya-janata.org/#chyk' },
      { label: 'Chinmaya Mission', url: 'https://chinmaya.org' },
      { label: 'Contact', url: 'https://chinmaya-janata.org/#contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms of Service', url: '/terms' },
      { label: 'Cookie Policy', url: '/cookies' },
    ],
  },
]

export function Footer() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024

  const handlePrivacy = () => router.push('/privacy')
  const handleTerms = () => router.push('/terms')
  const handleCookies = () => router.push('/cookies')

  return (
    <View style={{ backgroundColor: '#FAFAF7' }}>
      {/* Main footer */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: '#E7E5E4',
          paddingHorizontal: isMobile ? 20 : isTablet ? 40 : 80,
          paddingTop: 60,
          paddingBottom: 48,
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          gap: isMobile ? 32 : undefined,
        }}
      >
        {/* Left: Logo + tagline */}
        <View style={{ maxWidth: 280 }}>
          <Logo size={32} style={{ marginBottom: 12 }} />
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: '400',
              fontSize: 14,
              lineHeight: 22,
              color: '#78716C',
            }}
          >
            Connecting Chinmaya Mission communities worldwide through technology.
          </Text>
        </View>

        {/* Right: Columns */}
        <View
          style={{
            flexDirection: 'row',
            gap: isMobile ? 32 : isTablet ? 48 : 80,
            flexWrap: isMobile ? 'wrap' : undefined,
          }}
        >
          {COLUMNS.map((column) => (
            <View key={column.title}>
              <Text
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '600',
                  fontSize: 13,
                  color: '#1C1917',
                  marginBottom: 16,
                }}
              >
                {column.title}
              </Text>
              <View style={{ gap: 10 }}>
                <Pressable onPress={handlePrivacy}>
                  <Text style={{ fontFamily: 'Inter, sans-serif', fontWeight: '400', fontSize: 14, color: '#78716C' }}>Privacy Policy</Text>
                </Pressable>
                <Pressable onPress={handleTerms}>
                  <Text style={{ fontFamily: 'Inter, sans-serif', fontWeight: '400', fontSize: 14, color: '#78716C' }}>Terms of Service</Text>
                </Pressable>
                <Pressable onPress={handleCookies}>
                  <Text style={{ fontFamily: 'Inter, sans-serif', fontWeight: '400', fontSize: 14, color: '#78716C' }}>Cookie Policy</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Copyright */}
      <View
        style={{
          paddingHorizontal: isMobile ? 20 : isTablet ? 40 : 80,
          paddingBottom: 40,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: '400',
            fontSize: 13,
            color: '#A8A29E',
          }}
        >
          © 2025 Janata. Built with love by CHYKs.
        </Text>
      </View>
    </View>
  )
}
