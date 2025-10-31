import React, { useEffect, useRef } from 'react'
import { Animated, Text, Pressable } from 'react-native'
import { GhostButton, DestructiveButton } from 'components/ui'
import { Settings, LogOut } from 'lucide-react-native'

export default function SettingsPanel({ visible, onClose, onLogout }) {
  const opacityAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
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
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible, opacityAnim, scaleAnim])

  if (!visible) return null

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 48,
        right: 16,
        zIndex: 100,
        width: 220,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        padding: 16,
        elevation: 8,
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }}
      className="dark:bg-background-dark"
    >
      <Text className="text-lg font-bold mb-4">Account</Text>
      <GhostButton icon={<Settings size={16} color="#9A3412" />} onPress={onClose} size={3}>
        Settings
      </GhostButton>
      <DestructiveButton icon={<LogOut size={16} color="#9A3412" />} onPress={onLogout} size={3}>
        Log Out
      </DestructiveButton>
      <Pressable className="mt-4 p-2 rounded bg-gray-200 dark:bg-gray-700" onPress={onClose}>
        <Text className="text-center">Close</Text>
      </Pressable>
    </Animated.View>
  )
}
