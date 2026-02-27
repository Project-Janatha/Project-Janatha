import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useThemeContext } from '../contexts'

export interface UnderlineTabBarProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function UnderlineTabBar({ tabs, activeTab, onTabChange }: UnderlineTabBarProps) {
  const { isDark } = useThemeContext()
  const borderColor = isDark ? '#404040' : '#E7E5E4'
  const inactiveColor = isDark ? '#6B7280' : '#A8A29E'

  return (
    <View
      className="flex-row"
      style={{ borderBottomWidth: 1, borderBottomColor: borderColor }}
    >
      {tabs.map((tab) => {
        const isActive = tab === activeTab
        return (
          <Pressable
            key={tab}
            onPress={() => onTabChange(tab)}
            className="flex-1 items-center pb-3 pt-1"
            style={isActive ? { borderBottomWidth: 2, borderBottomColor: '#E8862A', marginBottom: -1 } : { marginBottom: -1 }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Inter-Medium',
                color: isActive ? '#E8862A' : inactiveColor,
              }}
            >
              {tab}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
