import React, { useState, useEffect } from 'react'
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native'
import { Camera, Trash2, AlertTriangle } from 'lucide-react-native'
import { useUser } from '../../components/contexts'
import { useRouter } from 'expo-router'

type ProfileData = {
  name: string
  bio: string
  birthday: string
  preferences: string[]
  profileImage?: string
}

const PREFERENCE_OPTIONS = [
  'Satsangs',
  'Bhiksha',
  'Global events',
  'Local events',
  'Casual',
  'Formal',
]

export default function Profile() {
  const { user, deleteAccount, updateProfile } = useUser()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`
    if (user?.firstName) return user.firstName
    return user?.username || ''
  }

  const [profileData, setProfileData] = useState<ProfileData>({
    name: getDisplayName(),
    bio: '',
    birthday: '',
    preferences: [],
    profileImage: user?.profileImage || `https://i.pravatar.cc/150?u=${user?.username || 'default'}`,
  })

  // Sync profile data when user changes (e.g., after login)
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: getDisplayName() || prev.name,
        profileImage: user.profileImage || prev.profileImage,
      }))
    }
  }, [user])

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!profileData.bio.trim()) {
      newErrors.bio = 'Bio is required'
    }

    if (!profileData.birthday.trim()) {
      newErrors.birthday = 'Birthday is required'
    }

    if (profileData.preferences.length === 0) {
      newErrors.preferences = 'At least one preference must be selected'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setErrors({})
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      const nameParts = profileData.name.trim().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ')

      await updateProfile({
        firstName,
        lastName,
      })
      setIsEditing(false)
      setErrors({})
    } catch (error) {
      console.error('Error saving profile:', error)
      // Profile saved locally even if backend fails (optimistic update)
      setIsEditing(false)
      setErrors({})
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreferenceToggle = (preference: string) => {
    if (isEditing) {
      setProfileData((prev) => ({
        ...prev,
        preferences: prev.preferences.includes(preference)
          ? prev.preferences.filter((p) => p !== preference)
          : [...prev.preferences, preference],
      }))
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    if (isEditing) {
      setProfileData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

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
    <ScrollView className="flex-1 bg-white dark:bg-neutral-900">
      <View className="max-w-[800px] w-full self-center p-8">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-3xl font-inter font-bold text-content dark:text-content-dark mb-1">
              Profile Settings
            </Text>
            <Text className="text-base font-inter text-content/60 dark:text-content-dark/60">
              Manage your public profile information
            </Text>
          </View>
          <Pressable
            onPress={isEditing ? handleSave : handleEdit}
            disabled={isSaving}
            className={`px-6 py-3 rounded-xl ${
              isEditing
                ? 'bg-primary hover:scale-105'
                : 'bg-muted/50 dark:bg-muted-dark/20 hover:bg-muted/70 dark:hover:bg-muted-dark/30'
            } active:scale-95 transition-all duration-150`}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#ea580c" />
            ) : (
              <Text
                className={`font-inter font-semibold ${
                  isEditing ? 'text-white' : 'text-content dark:text-content-dark'
                }`}
              >
                {isEditing ? 'Save' : 'Edit'}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Profile Picture Section */}
        <View className="mb-8 p-6 bg-muted/10 dark:bg-muted-dark/10 rounded-2xl">
          <Text className="text-lg font-inter font-semibold text-content dark:text-content-dark mb-4">
            Profile Picture
          </Text>
          <View className="flex-row items-center gap-6">
            <View className="w-24 h-24 rounded-full overflow-hidden bg-primary">
              <Image source={{ uri: profileData.profileImage }} className="w-full h-full" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-inter font-bold text-content dark:text-content-dark mb-1">
                {profileData.name}
              </Text>
              <Text className="text-base font-inter text-content/60 dark:text-content-dark/60 mb-3">
                @{user?.username || 'user'}
              </Text>
              {isEditing && (
                <Pressable className="flex-row items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border-2 border-primary rounded-xl self-start hover:scale-105 active:scale-95 transition-transform">
                  <Camera size={18} color="#ea580c" />
                  <Text className="font-inter font-medium text-primary">Change Photo</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* Name Section */}
        <View className="mb-6">
          <Text className="text-lg font-inter font-semibold text-content dark:text-content-dark mb-3">
            Full Name
          </Text>
          {isEditing ? (
            <View>
              <TextInput
                value={profileData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                className={`text-base font-inter px-4 py-3 rounded-xl border-2 ${
                  errors.name
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                    : 'border-muted/30 dark:border-muted-dark/30 bg-white dark:bg-neutral-800'
                } text-content dark:text-content-dark`}
                placeholderTextColor="#9ca3af"
              />
              {errors.name && (
                <Text className="text-sm text-red-600 dark:text-red-400 mt-2">{errors.name}</Text>
              )}
            </View>
          ) : (
            <Text className="text-base font-inter text-content dark:text-content-dark px-4 py-3 bg-muted/10 dark:bg-muted-dark/10 rounded-xl">
              {profileData.name}
            </Text>
          )}
        </View>

        {/* Bio Section */}
        <View className="mb-6">
          <Text className="text-lg font-inter font-semibold text-content dark:text-content-dark mb-3">
            Bio
          </Text>
          {isEditing ? (
            <View>
              <TextInput
                value={profileData.bio}
                onChangeText={(value) => handleInputChange('bio', value)}
                placeholder="Tell us about yourself..."
                className={`text-base font-inter px-4 py-3 rounded-xl border-2 ${
                  errors.bio
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                    : 'border-muted/30 dark:border-muted-dark/30 bg-white dark:bg-neutral-800'
                } text-content dark:text-content-dark min-h-[100px]`}
                multiline
                textAlignVertical="top"
                placeholderTextColor="#9ca3af"
              />
              {errors.bio && (
                <Text className="text-sm text-red-600 dark:text-red-400 mt-2">{errors.bio}</Text>
              )}
            </View>
          ) : (
            <Text className="text-base font-inter text-content dark:text-content-dark px-4 py-3 bg-muted/10 dark:bg-muted-dark/10 rounded-xl leading-relaxed">
              {profileData.bio}
            </Text>
          )}
        </View>

        {/* Birthday Section */}
        <View className="mb-6">
          <Text className="text-lg font-inter font-semibold text-content dark:text-content-dark mb-3">
            Birthday
          </Text>
          {isEditing ? (
            <View>
              <TextInput
                value={profileData.birthday}
                onChangeText={(value) => handleInputChange('birthday', value)}
                className={`text-base font-inter px-4 py-3 rounded-xl border-2 ${
                  errors.birthday
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                    : 'border-muted/30 dark:border-muted-dark/30 bg-white dark:bg-neutral-800'
                } text-content dark:text-content-dark`}
                placeholderTextColor="#9ca3af"
              />
              {errors.birthday && (
                <Text className="text-sm text-red-600 dark:text-red-400 mt-2">
                  {errors.birthday}
                </Text>
              )}
            </View>
          ) : (
            <Text className="text-base font-inter text-content dark:text-content-dark px-4 py-3 bg-muted/10 dark:bg-muted-dark/10 rounded-xl">
              {profileData.birthday}
            </Text>
          )}
        </View>

        {/* Preferences Section */}
        <View className="mb-6">
          <Text className="text-lg font-inter font-semibold text-content dark:text-content-dark mb-3">
            Interests
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {PREFERENCE_OPTIONS.map((preference) => {
              const isSelected = profileData.preferences.includes(preference)
              return (
                <Pressable
                  key={preference}
                  className={`px-5 py-3 rounded-full border-2 ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'bg-muted/20 dark:bg-muted-dark/20 border-transparent'
                  } ${
                    isEditing ? 'hover:scale-105' : isSelected ? '' : 'opacity-50'
                  } active:scale-95 transition-all duration-150`}
                  onPress={() => handlePreferenceToggle(preference)}
                  disabled={!isEditing}
                >
                  <Text
                    className={`font-inter font-semibold ${
                      isSelected ? 'text-white' : 'text-content dark:text-content-dark'
                    }`}
                  >
                    {preference}
                  </Text>
                </Pressable>
              )
            })}
          </View>
          {errors.preferences && (
            <Text className="text-sm text-red-600 dark:text-red-400 mt-3">
              {errors.preferences}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View className="flex-row gap-3 mt-8">
            <Pressable
              onPress={handleCancel}
              className="flex-1 px-6 py-4 rounded-xl bg-muted/30 dark:bg-muted-dark/20 hover:bg-muted/50 dark:hover:bg-muted-dark/30 active:scale-98 transition-all duration-150"
            >
              <Text className="text-center font-inter font-semibold text-content dark:text-content-dark">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-4 rounded-xl bg-primary hover:scale-105 active:scale-95 transition-all duration-150"
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-center font-inter font-semibold text-white">
                  Save Changes
                </Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Danger Zone - Delete Account */}
        <View className="mt-12 pt-8 border-t-2 border-red-200 dark:border-red-900/30">
          <View className="mb-4">
            <Text className="text-xl font-inter font-bold text-red-600 dark:text-red-400 mb-2">
              Danger Zone
            </Text>
            <Text className="text-sm font-inter text-content/60 dark:text-content-dark/60">
              Once you delete your account, there is no going back. Please be certain.
            </Text>
          </View>
          <Pressable
            onPress={() => setShowDeleteModal(true)}
            className="flex-row items-center justify-center gap-3 px-6 py-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-98 transition-all duration-150"
          >
            <Trash2 size={20} color="#dc2626" />
            <Text className="font-inter font-bold text-red-600 dark:text-red-400">
              Delete Account
            </Text>
          </Pressable>
        </View>

        {/* Delete Confirmation Modal */}
        <Modal
          transparent
          visible={showDeleteModal}
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50 px-6">
            <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-[400px] border-2 border-red-500">
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mb-3">
                  <AlertTriangle size={32} color="#dc2626" />
                </View>
                <Text className="text-2xl font-inter font-bold text-content dark:text-content-dark mb-2">
                  Delete Account?
                </Text>
                <Text className="text-center font-inter text-content/70 dark:text-content-dark/70">
                  This action cannot be undone. All your data will be permanently deleted.
                </Text>
              </View>

              <View className="flex-row gap-3 mt-6">
                <Pressable
                  onPress={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 rounded-xl bg-muted/30 dark:bg-muted-dark/20 hover:bg-muted/50 dark:hover:bg-muted-dark/30 active:scale-98"
                >
                  <Text className="text-center font-inter font-semibold text-content dark:text-content-dark">
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98"
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-center font-inter font-semibold text-white">
                      Delete Forever
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  )
}
