import React from 'react'
import { View, Text, Pressable, useWindowDimensions } from 'react-native'

interface FooterColumn {
  title: string
  links: string[]
}

const COLUMNS: FooterColumn[] = [
  {
    title: 'Product',
    links: ['Features', 'Centers', 'Events', 'Mobile App'],
  },
  {
    title: 'Community',
    links: ['About Us', 'CHYKs', 'Chinmaya Mission', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
  },
]

export function Footer() {
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: '#1C1917',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontFamily: '"Inclusive Sans", sans-serif',
                }}
              >
                J
              </Text>
            </View>
            <Text
              style={{
                fontFamily: '"Inclusive Sans", sans-serif',
                fontWeight: '600',
                fontSize: 18,
                color: '#1C1917',
              }}
            >
              Janata
            </Text>
          </View>
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
                {column.links.map((link) => (
                  <Pressable key={link}>
                    <Text
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: '400',
                        fontSize: 14,
                        color: '#78716C',
                      }}
                    >
                      {link}
                    </Text>
                  </Pressable>
                ))}
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
