import React from 'react'
import { View, Text } from 'react-native'

type BadgeProps = {
  label: string
  variant: 'going' | 'member'
}

export default function Badge({ label, variant }: BadgeProps) {
  return (
    <View className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30">
      <Text
        className="text-[10px] font-inter-semibold text-green-600 dark:text-green-400"
        style={{ lineHeight: 14 }}
      >
        {label}
      </Text>
    </View>
  )
}
