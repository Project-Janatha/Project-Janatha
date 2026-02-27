import React from 'react'
import { View, Text, Pressable } from 'react-native'

export interface UnderlineTabBarProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function UnderlineTabBar({ tabs, activeTab, onTabChange }: UnderlineTabBarProps) {
  return (
    <View
      className="flex-row"
      style={{ borderBottomWidth: 1, borderBottomColor: '#E7E5E4' }}
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
                color: isActive ? '#E8862A' : '#A8A29E',
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
