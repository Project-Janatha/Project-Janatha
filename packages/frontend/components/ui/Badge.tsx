import React from 'react'
import { View, Text } from 'react-native'
import { Check } from 'lucide-react-native'
import { useThemeContext } from '../contexts'

type BadgeVariant = 'going' | 'member' | 'upcoming' | 'past' | 'host'

type BadgeVariant = 'going' | 'member' | 'upcoming' | 'past' | 'host'

type BadgeProps = {
  label: string
  variant: BadgeVariant
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  going:    { bg: '#ECFDF5', text: '#059669' },
  member:   { bg: '#ECFDF5', text: '#059669' },
  upcoming: { bg: '#E8862A', text: '#FFFFFF' },
  past:     { bg: 'rgba(120,113,108,0.85)', text: '#FFFFFF' },
  host:     { bg: '#FFF7ED', text: '#E8862A' },
}

export default function Badge({ label, variant }: BadgeProps) {
  const style = VARIANT_STYLES[variant]
  return (
    <View style={{ backgroundColor: style.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
      <Text
        style={{
          fontSize: 11,
          fontFamily: 'Inter-SemiBold',
          color: style.text,
          lineHeight: 14,
        }}
      >
        {label}
      </Text>
    </View>
  )
}
