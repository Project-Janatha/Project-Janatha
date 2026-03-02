import React from 'react'
import { View, Text, Pressable, ScrollView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, usePathname, Slot, Stack } from 'expo-router'
import { User, Settings as SettingsIcon, ChevronLeft } from 'lucide-react-native'
import { useThemeContext } from '../../components/contexts'
import Logo from '../../components/ui/Logo'

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile', icon: User, path: '/settings' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings/settings' },
]

export default function SettingsLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const { isDark } = useThemeContext()

  const handleTabPress = (path: string) => {
    router.push(path as any)
  }

  const handleClose = () => {
    router.back()
  }

  // Custom header for web
  const HeaderTitle = () => {
    if (Platform.OS !== 'web') {
      return null
    }

    return (
      <View className="flex-row items-center">
        <Pressable onPress={() => router.push('/')}>
          <Logo size={28} />
        </Pressable>
      </View>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: isDark ? '#171717' : '#fff',
          },
          headerTintColor: isDark ? '#fff' : '#000',
          headerTitle: Platform.OS === 'web' ? () => <HeaderTitle /> : 'Settings',
          headerLeft:
            Platform.OS !== 'web'
              ? () => (
                  <Pressable onPress={handleClose} className="ml-2 flex-row items-center">
                    <ChevronLeft size={24} color={isDark ? '#fff' : '#000'} />
                    <Text className="text-base font-inter text-content dark:text-content-dark">Back</Text>
                  </Pressable>
                )
              : undefined,
        }}
      />
      <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900" edges={['bottom']}>
        <View className="flex-1 flex-row">
          {/* Sidebar - web only */}
          {Platform.OS === 'web' && (
            <View className="w-64 border-r border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
              <View className="p-6 border-b border-muted/20 dark:border-muted-dark/20">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-2xl font-inter font-bold text-content dark:text-content-dark">
                    Settings
                  </Text>
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
                          : 'bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <Icon
                        size={20}
                        className={
                          isActive ? 'text-white' : 'text-stone-500 dark:text-stone-400'
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
          )}
          {/* Content Area */}
          <View className="flex-1">
            <Slot />
          </View>
        </View>
      </SafeAreaView>
    </>
  )
}
