// app/settings/_layout.tsx
import React from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, usePathname, Slot } from 'expo-router'
import { User, Bell, Lock, Settings as SettingsIcon, Heart, X } from 'lucide-react-native'
import { UserContext } from 'components/contexts'

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile', icon: User, path: '/settings' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings/settings' },
] // default tab is profile

export default function SettingsLayout() {
  const router = useRouter()
  const pathname = usePathname()

  const handleTabPress = (path: string) => {
    router.push(path as any)
  }

  const handleClose = () => {
    router.back()
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <View className="flex-1 flex-row">
        {/* Sidebar */}
        <View className="w-64 border-r border-muted/20 dark:border-muted-dark/20 bg-muted/5 dark:bg-muted-dark/5">
          {/* Header */}
          <View className="p-6 border-b border-muted/20 dark:border-muted-dark/20">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-2xl font-inter font-bold text-content dark:text-content-dark">
                Settings
              </Text>
              <Pressable
                onPress={handleClose}
                className="w-8 h-8 rounded-full bg-muted/50 dark:bg-muted-dark/20 items-center justify-center hover:scale-110 active:scale-95 transition-transform"
              >
                <X size={18} className="text-content/60 dark:text-content-dark/60" />
              </Pressable>
            </View>
          </View>

          {/* Navigation Tabs */}
          <ScrollView className="flex-1 p-3">
            {SETTINGS_TABS.map((tab) => {
              const isActive = pathname === tab.path
              const Icon = tab.icon

              return (
                <Pressable
                  key={tab.id}
                  onPress={() => handleTabPress(tab.path)}
                  className={`flex-row items-center gap-3 px-4 py-3 rounded-xl mb-1 ${
                    isActive
                      ? 'bg-primary shadow-sm'
                      : 'bg-transparent hover:bg-muted/30 dark:hover:bg-muted-dark/20'
                  } active:scale-98 transition-all duration-150`}
                >
                  <Icon
                    size={20}
                    className={
                      isActive ? 'text-white' : 'text-content/60 dark:text-content-dark/60'
                    }
                  />
                  <Text
                    className={`font-inter font-medium text-base ${
                      isActive ? 'text-white' : 'text-content dark:text-content-dark'
                    }`}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
        </View>

        {/* Content Area */}
        <View className="flex-1">
          <Slot />
        </View>
      </View>
    </SafeAreaView>
  )
}
