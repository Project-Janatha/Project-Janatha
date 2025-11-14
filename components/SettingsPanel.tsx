import React, { useEffect, useRef } from 'react'
import { Animated, Text, Pressable, View, Image } from 'react-native'
import { UserContext, useThemeContext } from './contexts'
import { Settings, LogOut, Sun, Moon, User, Monitor } from 'lucide-react-native'
import { router } from 'expo-router'

function SettingsPanel({ visible, onClose, onLogout }) {
  const opacityAnim = useRef(new Animated.Value(0)).current
  const translateYAnim = useRef(new Animated.Value(-20)).current
  const { user } = React.useContext(UserContext)
  const { isDark, themePreference, setThemePreference } = useThemeContext()
  const previousTheme = useRef(isDark)

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -20,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  // Stop animations when theme changes
  useEffect(() => {
    if (previousTheme.current !== isDark) {
      opacityAnim.stopAnimation()
      translateYAnim.stopAnimation()

      // Set to final values to prevent flickering
      opacityAnim.setValue(1)
      translateYAnim.setValue(0)

      previousTheme.current = isDark
    }
  }, [isDark])

  if (!visible) return null

  const displayName =
    user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Pranav Vaish'

  const profileImage = user?.profileImage || 'https://via.placeholder.com/150'

  return (
    <>
      {/* Backdrop */}
      <Pressable
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99,
        }}
        onPress={onClose}
      />

      {/* Settings Panel */}
      <Animated.View
        style={{
          position: 'fixed',
          top: 56,
          right: 16,
          zIndex: 100,
          width: 240,
          backgroundColor: isDark ? '#171717' : '#fff',
          borderColor: isDark ? '#262626' : '#E5E7EB',
          borderWidth: 1,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          padding: 16,
          elevation: 8,
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }],
        }}
      >
        {/* Profile Info */}
        <View className="flex-row items-center mb-3">
          <Image source={{ uri: profileImage }} className="w-8 h-8 rounded-full mr-3 bg-gray-300" />
          <View className="flex-col flex-1">
            <Text className="text-lg font-inter-semibold text-content dark:text-content-dark -mb-0.5">
              {displayName}
            </Text>
            <Text
              className="text-sm font-inter text-contentStrong dark:text-contentStrong-dark"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user?.username}
            </Text>
          </View>
        </View>

        {/* Separator Line */}
        <View className="h-[1px] bg-gray-200 dark:bg-neutral-800 mb-3" />

        {/* Profile Button */}
        <Pressable
          className="flex-row items-center mb-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
          onPress={() => {
            onClose()
            router.push('/profile')
          }}
        >
          <User size={16} color={isDark ? '#fff' : '#374151'} className="mr-3" />
          <Text className="text-content dark:text-content-dark font-inter">Profile</Text>
        </Pressable>
        <Pressable
          className="flex-row items-center mb-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
          onPress={() => {
            onClose()
            router.push('/profile')
          }}
        >
          <Settings size={16} color={isDark ? '#fff' : '#374151'} className="mr-3" />
          <Text className="text-content dark:text-content-dark font-inter">Settings</Text>
        </Pressable>

        {/* Separator Line */}
        <View className="h-[1px] bg-gray-200 dark:bg-neutral-800 mb-2" />

        {/* Appearance Slider */}
        <View className="mb-3">
          <Text className="text-sm font-inter-medium text-content dark:text-content-dark mb-2">
            Appearance
          </Text>
          <View className="flex-row bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
            <Pressable
              onPress={() => setThemePreference('light')}
              className={`flex-1 flex-row items-center justify-center gap-1 py-2 rounded-md ${
                themePreference === 'light' ? 'bg-white dark:bg-neutral-700' : ''
              }`}
            >
              <Sun
                size={14}
                color={themePreference === 'light' ? '#9A3412' : isDark ? '#9CA3AF' : '#6B7280'}
              />
              <Text
                className={`text-xs font-inter ${
                  themePreference === 'light'
                    ? 'text-primary font-inter-semibold'
                    : 'text-contentStrong dark:text-contentStrong-dark'
                }`}
              >
                Light
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setThemePreference('dark')}
              className={`flex-1 flex-row items-center justify-center gap-1 py-2 rounded-md ${
                themePreference === 'dark' ? 'bg-white dark:bg-neutral-700' : ''
              }`}
            >
              <Moon
                size={14}
                color={themePreference === 'dark' ? '#9A3412' : isDark ? '#9CA3AF' : '#6B7280'}
              />
              <Text
                className={`text-xs font-inter ${
                  themePreference === 'dark'
                    ? 'text-primary font-inter-semibold'
                    : 'text-contentStrong dark:text-contentStrong-dark'
                }`}
              >
                Dark
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setThemePreference('system')}
              className={`flex-1 flex-row items-center justify-center gap-1 py-2 rounded-md ${
                themePreference === 'system' ? 'bg-white dark:bg-neutral-700' : ''
              }`}
            >
              <Monitor
                size={14}
                color={themePreference === 'system' ? '#9A3412' : isDark ? '#9CA3AF' : '#6B7280'}
              />
              <Text
                className={`text-xs font-inter ${
                  themePreference === 'system'
                    ? 'text-primary font-inter-semibold'
                    : 'text-contentStrong dark:text-contentStrong-dark'
                }`}
              >
                Auto
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Separator Line */}
        <View className="h-[1px] bg-gray-200 dark:bg-neutral-800 mb-2" />

        {/* Log Out Button */}
        <Pressable
          onPress={onLogout}
          className="flex-row items-center p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut size={16} color={isDark ? '#ef4444' : '#dc2626'} className="mr-3" />
          <Text className="text-red-600 dark:text-red-400 font-inter">Log Out</Text>
        </Pressable>
      </Animated.View>
    </>
  )
}

export default React.memo(SettingsPanel)
