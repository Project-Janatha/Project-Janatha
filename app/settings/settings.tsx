// app/settings/profile.tsx
import React, { useState, useContext } from 'react'
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native'
import { Camera } from 'lucide-react-native'

export default function Settings() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-neutral-900">
      <View className="max-w-[800px] w-full self-center p-8">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-3xl font-inter font-bold text-content dark:text-content-dark mb-1">
              Settings
            </Text>
            <Text className="text-base font-inter text-content/60 dark:text-content-dark/60">
              Manage your app preferences
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
