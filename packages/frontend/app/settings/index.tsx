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
import { UserContext } from '../../components/contexts'

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
  const { user } = useContext(UserContext)
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
      console.log('Saving profile:', profileData)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsEditing(false)
      setErrors({})
    } catch (error) {
      console.error('Error saving profile:', error)
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
                CHYK • San Jose
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
      </View>
    </ScrollView>
  )
}
