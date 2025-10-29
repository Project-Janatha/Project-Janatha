import React, { useState, useContext } from 'react'
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native'
import { X, Camera, Settings } from 'lucide-react-native'
import { SecondaryButton, PrimaryButton } from 'components/ui'
import { UserContext } from 'components/contexts'
import { useRouter } from 'expo-router'

type User = {
  username: string
  center: number
  points: number
  isVerified: boolean
  verificationLevel: number
  exists: boolean
  isActive: boolean
  id: string
  events: any[]
}

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

export default function ProfilePage() {
  const { user } = useContext(UserContext)
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.username || 'Pranav Vaish',
    bio: 'I am a CHYK from San Jose.',
    birthday: 'October 1, 2000',
    preferences: ['Global events', 'Casual'],
    profileImage:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  })

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
      // TODO: Implement save functionality with backend
      console.log('Saving profile:', profileData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsEditing(false)
      setErrors({})
    } catch (error) {
      console.error('Error saving profile:', error)
      // TODO: Show error toast
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

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4 pb-8">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
            className="border border-primary rounded-full p-2 bg-white"
            onPress={() => router.back()}
          >
            <X size={20} color="#FF9800" />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold">Profile</Text>
          <TouchableOpacity
            className="border border-primary rounded-full px-4 py-2 bg-white"
            onPress={isEditing ? handleSave : handleEdit}
          >
            <Text className="text-primary font-semibold">{isEditing ? 'Done' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View className="flex-row items-center gap-4 mb-6">
          <View className="w-16 h-16 rounded-full overflow-hidden bg-primary justify-center items-center">
            <Image source={{ uri: profileData.profileImage }} className="w-full h-full" />
          </View>
          <View className="flex-1">
            {isEditing ? (
              <View>
                <TextInput
                  value={profileData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  className={`text-lg font-semibold border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } bg-background mb-1 px-2 py-1 rounded`}
                />
                {errors.name && <Text className="text-xs text-red-600 mb-2">{errors.name}</Text>}
              </View>
            ) : (
              <Text className="text-lg font-semibold mb-1">{profileData.name}</Text>
            )}
            <Text className="text-sm text-gray-500 font-medium">CHYK</Text>
            {isEditing && (
              <TouchableOpacity className="border border-primary rounded-full px-3 py-1 mt-2 flex-row items-center self-start">
                <Camera size={16} color="#FF9800" />
                <Text className="ml-2 text-primary">Replace Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bio Section */}
        <View className="gap-3 mb-6">
          <Text className="text-base font-semibold text-primary">Bio</Text>
          {isEditing ? (
            <View>
              <TextInput
                value={profileData.bio}
                onChangeText={(value) => handleInputChange('bio', value)}
                placeholder="Tell us about yourself..."
                className={`border ${
                  errors.bio ? 'border-red-500' : 'border-gray-300'
                } bg-background min-h-[80px] px-2 py-1 rounded`}
                multiline
                textAlignVertical="top"
              />
              {errors.bio && <Text className="text-xs text-red-600 mt-2">{errors.bio}</Text>}
            </View>
          ) : (
            <Text className="text-base text-primary leading-5">{profileData.bio}</Text>
          )}
        </View>

        {/* Birthday Section */}
        <View className="gap-3 mb-6">
          <Text className="text-base font-semibold text-primary">Birthday</Text>
          {isEditing ? (
            <View>
              <TextInput
                value={profileData.birthday}
                onChangeText={(value) => handleInputChange('birthday', value)}
                className={`border ${
                  errors.birthday ? 'border-red-500' : 'border-gray-300'
                } bg-background px-2 py-1 rounded`}
              />
              {errors.birthday && (
                <Text className="text-xs text-red-600 mt-2">{errors.birthday}</Text>
              )}
            </View>
          ) : (
            <Text className="text-base text-primary">{profileData.birthday}</Text>
          )}
        </View>

        {/* Preferences Section */}
        <View className="gap-3 mb-6">
          <Text className="text-base font-semibold text-primary">Preferences</Text>
          <View className="flex-row flex-wrap gap-2">
            {PREFERENCE_OPTIONS.map((preference) => {
              const isSelected = profileData.preferences.includes(preference)
              return (
                <TouchableOpacity
                  key={preference}
                  className={`border rounded-full px-4 py-2 ${
                    isSelected ? 'bg-primary border-primary' : 'bg-transparent border-gray-300'
                  } ${isEditing ? '' : isSelected ? '' : 'opacity-60'}`}
                  onPress={() => handlePreferenceToggle(preference)}
                  disabled={!isEditing}
                >
                  <Text className={`${isSelected ? 'text-white' : 'text-primary'} font-medium`}>
                    {preference}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
          {errors.preferences && <Text className="text-xs text-red-600">{errors.preferences}</Text>}
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View className="flex-row gap-3 mt-4">
            <SecondaryButton style={{ flex: 1 }} onPress={handleCancel}>
              Cancel
            </SecondaryButton>
            <PrimaryButton style={{ flex: 1 }} onPress={handleSave} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color="#FF9800" /> : 'Save profile'}
            </PrimaryButton>
          </View>
        )}

        {/* Settings Button (when not editing) */}
        {!isEditing && (
          <View className="bg-white rounded-xl shadow-md mt-4">
            <View className="flex-row items-center gap-3 p-4">
              <Settings size={20} color="#FF9800" />
              <Text className="text-base font-medium flex-1">Account Settings</Text>
              <SecondaryButton>Manage</SecondaryButton>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
