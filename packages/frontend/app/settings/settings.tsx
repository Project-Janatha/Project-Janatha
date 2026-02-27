import React, { useState } from 'react'
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Switch,
  Linking,
  Modal,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Bell, Eye, Shield, Info, ExternalLink, AlertTriangle } from 'lucide-react-native'
import { useUser, useThemeContext } from '../../components/contexts'
import { useRouter } from 'expo-router'
import { DestructiveButton } from '../../components/ui'
import ThemeSelector from '../../components/ThemeSelector'

export default function Settings() {
  const { isDark } = useThemeContext()
  const { deleteAccount } = useUser()
  const router = useRouter()
  const [pushNotifications, setPushNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [eventReminders, setEventReminders] = useState(true)

  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const iconColor = isDark ? '#a1a1aa' : '#71717a'
  const textColor = isDark ? '#F5F5F5' : '#1C1917'
  const mutedTextColor = isDark ? '#A8A29E' : '#78716C'
  const cardBg = isDark ? '#171717' : '#FFFFFF'
  const switchTrackColor = { false: isDark ? '#3f3f46' : '#d4d4d8', true: '#f97316' }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteAccount()
      if (result.success) {
        setShowDeleteModal(false)
        router.replace('/auth')
      } else {
        Alert.alert('Error', result.message || 'Failed to delete account')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#171717' : '#FAFAF7' }}>
      <View style={{ maxWidth: 900, width: '100%', alignSelf: 'center', padding: Platform.OS === 'web' ? 40 : 20, paddingHorizontal: Platform.OS === 'web' ? 60 : 20 }}>
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

        {/* Danger Zone */}
        <View className="mb-8">
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              padding: 20, paddingHorizontal: 24, borderRadius: 14, borderWidth: 1, borderColor: '#FECACA',
            }}
          >
            <View style={{ gap: 3, flex: 1, marginRight: 16 }}>
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#DC2626' }}>Danger Zone</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: mutedTextColor }}>Permanently delete your account and all data</Text>
            </View>
            <DestructiveButton onPress={() => setShowDeleteModal(true)}>
              Delete Account
            </DestructiveButton>
          </View>
        </View>
      </View>

      {/* Delete confirmation modal */}
      <Modal transparent visible={showDeleteModal} animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: cardBg, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: '#FECACA' }}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? 'rgba(220,38,38,0.15)' : '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <AlertTriangle size={32} color="#DC2626" />
              </View>
              <Text style={{ fontFamily: 'Inter-Bold', fontSize: 22, color: textColor, marginBottom: 8 }}>Delete Account?</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 15, color: mutedTextColor, textAlign: 'center', lineHeight: 22 }}>
                This action cannot be undone. All your data will be permanently deleted.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: isDark ? '#262626' : '#F3F0ED', alignItems: 'center' }}
              >
                <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: textColor }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleDeleteAccount}
                disabled={isDeleting}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#DC2626', alignItems: 'center' }}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#FFFFFF' }}>Delete Forever</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}
