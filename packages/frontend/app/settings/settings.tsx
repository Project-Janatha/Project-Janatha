import React, { useState } from 'react'
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Switch,
  Linking,
} from 'react-native'
import { Bell, Eye, Shield, Info, ExternalLink, ChevronRight } from 'lucide-react-native'
import { useThemeContext } from '../../components/contexts'
import ThemeSelector from '../../components/ThemeSelector'

export default function Settings() {
  const { isDark } = useThemeContext()
  const [pushNotifications, setPushNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [eventReminders, setEventReminders] = useState(true)

  const iconColor = isDark ? '#a1a1aa' : '#71717a'
  const switchTrackColor = { false: isDark ? '#3f3f46' : '#d4d4d8', true: '#f97316' }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-neutral-900">
      <View className="max-w-[800px] w-full self-center p-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-inter font-bold text-content dark:text-content-dark mb-1">
            Settings
          </Text>
          <Text className="text-base font-inter text-content/60 dark:text-content-dark/60">
            Manage your app preferences
          </Text>
        </View>

        {/* Appearance Section */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-4">
            <Eye size={20} color={iconColor} />
            <Text className="text-lg font-inter font-semibold text-content dark:text-content-dark">
              Appearance
            </Text>
          </View>
          <View className="bg-muted/10 dark:bg-muted-dark/10 rounded-2xl p-5">
            <Text className="text-sm font-inter text-content/60 dark:text-content-dark/60 mb-3">
              Choose your preferred theme
            </Text>
            <ThemeSelector />
          </View>
        </View>

        {/* Notifications Section */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-4">
            <Bell size={20} color={iconColor} />
            <Text className="text-lg font-inter font-semibold text-content dark:text-content-dark">
              Notifications
            </Text>
          </View>
          <View className="bg-muted/10 dark:bg-muted-dark/10 rounded-2xl overflow-hidden">
            {/* Push Notifications */}
            <View className="flex-row items-center justify-between p-5 border-b border-muted/20 dark:border-muted-dark/20">
              <View className="flex-1 mr-4">
                <Text className="text-base font-inter font-medium text-content dark:text-content-dark">
                  Push Notifications
                </Text>
                <Text className="text-sm font-inter text-content/60 dark:text-content-dark/60 mt-0.5">
                  Get notified about events and updates
                </Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={switchTrackColor}
                thumbColor="#fff"
              />
            </View>

            {/* Email Notifications */}
            <View className="flex-row items-center justify-between p-5 border-b border-muted/20 dark:border-muted-dark/20">
              <View className="flex-1 mr-4">
                <Text className="text-base font-inter font-medium text-content dark:text-content-dark">
                  Email Notifications
                </Text>
                <Text className="text-sm font-inter text-content/60 dark:text-content-dark/60 mt-0.5">
                  Receive weekly event digests via email
                </Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={switchTrackColor}
                thumbColor="#fff"
              />
            </View>

            {/* Event Reminders */}
            <View className="flex-row items-center justify-between p-5">
              <View className="flex-1 mr-4">
                <Text className="text-base font-inter font-medium text-content dark:text-content-dark">
                  Event Reminders
                </Text>
                <Text className="text-sm font-inter text-content/60 dark:text-content-dark/60 mt-0.5">
                  Get reminded before events you're attending
                </Text>
              </View>
              <Switch
                value={eventReminders}
                onValueChange={setEventReminders}
                trackColor={switchTrackColor}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Privacy Section */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-4">
            <Shield size={20} color={iconColor} />
            <Text className="text-lg font-inter font-semibold text-content dark:text-content-dark">
              Privacy
            </Text>
          </View>
          <View className="bg-muted/10 dark:bg-muted-dark/10 rounded-2xl overflow-hidden">
            <Pressable
              className="flex-row items-center justify-between p-5 border-b border-muted/20 dark:border-muted-dark/20 active:opacity-70"
              onPress={() => Linking.openURL('https://chinmayajanata.org/privacy')}
            >
              <Text className="text-base font-inter font-medium text-content dark:text-content-dark">
                Privacy Policy
              </Text>
              <ExternalLink size={18} color={iconColor} />
            </Pressable>
            <Pressable
              className="flex-row items-center justify-between p-5 active:opacity-70"
              onPress={() => Linking.openURL('https://chinmayajanata.org/terms')}
            >
              <Text className="text-base font-inter font-medium text-content dark:text-content-dark">
                Terms of Service
              </Text>
              <ExternalLink size={18} color={iconColor} />
            </Pressable>
          </View>
        </View>

        {/* About Section */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-4">
            <Info size={20} color={iconColor} />
            <Text className="text-lg font-inter font-semibold text-content dark:text-content-dark">
              About
            </Text>
          </View>
          <View className="bg-muted/10 dark:bg-muted-dark/10 rounded-2xl overflow-hidden">
            <View className="flex-row items-center justify-between p-5 border-b border-muted/20 dark:border-muted-dark/20">
              <Text className="text-base font-inter font-medium text-content dark:text-content-dark">
                Version
              </Text>
              <Text className="text-sm font-inter text-content/60 dark:text-content-dark/60">
                1.0.0
              </Text>
            </View>
            <View className="flex-row items-center justify-between p-5">
              <Text className="text-base font-inter font-medium text-content dark:text-content-dark">
                Chinmaya Janata
              </Text>
              <Text className="text-sm font-inter text-content/60 dark:text-content-dark/60">
                Chinmaya Mission
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
