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
  Platform,
} from 'react-native'
import { Camera, AlertTriangle } from 'lucide-react-native'
import { useUser, useThemeContext } from '../../components/contexts'
import { useRouter } from 'expo-router'
import { DestructiveButton } from '../../components/ui'

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
  const { isDark } = useThemeContext()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const isWeb = Platform.OS === 'web'

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
    if (!profileData.name.trim()) newErrors.name = 'Name is required'
    if (!profileData.bio.trim()) newErrors.bio = 'Bio is required'
    if (!profileData.birthday.trim()) newErrors.birthday = 'Birthday is required'
    if (profileData.preferences.length === 0) newErrors.preferences = 'At least one preference must be selected'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEdit = () => setIsEditing(true)
  const handleCancel = () => { setErrors({}); setIsEditing(false) }

  const handleSave = async () => {
    if (!validateForm()) return
    setIsSaving(true)
    try {
      const nameParts = profileData.name.trim().split(' ')
      await updateProfile({ firstName: nameParts[0], lastName: nameParts.slice(1).join(' ') })
      setIsEditing(false)
      setErrors({})
    } catch (error) {
      console.error('Error saving profile:', error)
      setIsEditing(false)
      setErrors({})
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreferenceToggle = (preference: string) => {
    if (!isEditing) return
    setProfileData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter((p) => p !== preference)
        : [...prev.preferences, preference],
    }))
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    if (!isEditing) return
    setProfileData((prev) => ({ ...prev, [field]: value }))
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

  const labelColor = isDark ? '#78716C' : '#A8A29E'
  const textColor = isDark ? '#F5F5F5' : '#1C1917'
  const mutedTextColor = isDark ? '#A8A29E' : '#78716C'
  const borderColor = isDark ? '#262626' : '#E5E7EB'
  const cardBg = isDark ? '#171717' : '#FFFFFF'
  const chipBg = isDark ? '#262626' : '#F3F0ED'

  // ─── Shared: Interest chips ───
  const InterestChips = () => (
    <View>
      <Text
        style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: labelColor, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}
      >
        Interests
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {PREFERENCE_OPTIONS.map((pref) => {
          const selected = profileData.preferences.includes(pref)
          return (
            <Pressable
              key={pref}
              onPress={() => handlePreferenceToggle(pref)}
              disabled={!isEditing}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 8,
                borderRadius: 100,
                backgroundColor: selected ? '#C2410C' : chipBg,
                opacity: !isEditing && !selected ? 0.5 : 1,
              }}
            >
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: selected ? '#FFFFFF' : mutedTextColor }}>
                {pref}
              </Text>
            </Pressable>
          )
        })}
      </View>
      {errors.preferences && (
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#DC2626', marginTop: 8 }}>{errors.preferences}</Text>
      )}
    </View>
  )

  // ─── Shared: Delete confirmation modal ───
  const DeleteModal = () => (
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
  )

  // ─── Field label ───
  const FieldLabel = ({ children }: { children: string }) => (
    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: labelColor, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
      {children}
    </Text>
  )

  // ─── Read-only field value (mobile) ───
  const FieldValue = ({ value, multiline }: { value: string; multiline?: boolean }) => (
    <Text style={{ fontFamily: multiline ? 'Inter-Regular' : 'Inter-Medium', fontSize: multiline ? 15 : 16, color: multiline ? mutedTextColor : textColor, lineHeight: multiline ? 22 : 24 }}>
      {value || '—'}
    </Text>
  )

  // ─── Editable field ───
  const EditableField = ({ field, value, error, multiline }: { field: keyof ProfileData; value: string; error?: string; multiline?: boolean }) => (
    <View>
      {isEditing ? (
        <>
          <TextInput
            value={value}
            onChangeText={(v) => handleInputChange(field, v)}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
            placeholderTextColor="#9ca3af"
            style={{
              fontFamily: 'Inter-Regular',
              fontSize: 15,
              color: textColor,
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: error ? '#DC2626' : borderColor,
              backgroundColor: cardBg,
              minHeight: multiline ? 100 : undefined,
            }}
          />
          {error && <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#DC2626', marginTop: 6 }}>{error}</Text>}
        </>
      ) : (
        <FieldValue value={value} multiline={multiline} />
      )}
    </View>
  )

  // ═══════════════════════════════════════════
  //  MOBILE LAYOUT
  // ═══════════════════════════════════════════
  if (!isWeb) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#171717' : '#FAFAF7' }}>
        {/* Hero: centered avatar + name */}
        <View style={{ alignItems: 'center', paddingTop: 28, paddingBottom: 24, paddingHorizontal: 20 }}>
          <View style={{ position: 'relative', marginBottom: 14 }}>
            <Image
              source={{ uri: profileData.profileImage }}
              style={{ width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: cardBg, backgroundColor: '#D6D3D1' }}
            />
            {isEditing && (
              <Pressable
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: '#C2410C', alignItems: 'center', justifyContent: 'center',
                  borderWidth: 2, borderColor: isDark ? '#171717' : '#FAFAF7',
                }}
              >
                <Camera size={13} color="#fff" />
              </Pressable>
            )}
          </View>
          <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 24, color: textColor, letterSpacing: -0.5, marginBottom: 3 }}>
            {profileData.name || '—'}
          </Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: mutedTextColor }}>
            @{user?.username || 'user'}
          </Text>
        </View>

        {/* Info fields */}
        <View style={{ paddingHorizontal: 20, gap: 20 }}>
          <View>
            <FieldLabel>Full Name</FieldLabel>
            <EditableField field="name" value={profileData.name} error={errors.name} />
          </View>
          <View>
            <FieldLabel>Bio</FieldLabel>
            <EditableField field="bio" value={profileData.bio} error={errors.bio} multiline />
          </View>
          <View>
            <FieldLabel>Birthday</FieldLabel>
            <EditableField field="birthday" value={profileData.birthday} error={errors.birthday} />
          </View>

          <InterestChips />

          {/* Save/Cancel when editing */}
          {isEditing && (
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <Pressable
                onPress={handleCancel}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: isDark ? '#262626' : '#F3F0ED', alignItems: 'center' }}
              >
                <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: textColor }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#C2410C', alignItems: 'center' }}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#FFFFFF' }}>Save Changes</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>

        {/* Delete Account */}
        <View style={{ paddingHorizontal: 20, paddingTop: 32, paddingBottom: 40, marginTop: 'auto' }}>
          <DestructiveButton onPress={() => setShowDeleteModal(true)}>
            Delete Account
          </DestructiveButton>
        </View>

        <DeleteModal />
      </ScrollView>
    )
  }

  // ═══════════════════════════════════════════
  //  WEB LAYOUT
  // ═══════════════════════════════════════════
  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#171717' : '#FAFAF7' }}>
      <View style={{ maxWidth: 900, width: '100%', alignSelf: 'center', padding: 40, paddingHorizontal: 60, gap: 36 }}>
        {/* Header row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: 4 }}>
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 28, color: textColor, letterSpacing: -0.5 }}>
              Profile
            </Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 15, color: mutedTextColor }}>
              Manage your public profile information
            </Text>
          </View>
          <Pressable
            onPress={isEditing ? handleSave : handleEdit}
            disabled={isSaving}
            style={{
              paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10,
              backgroundColor: isEditing ? '#C2410C' : '#1C1917',
            }}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#FFFFFF' }}>
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Profile card */}
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 28, padding: 28,
            backgroundColor: cardBg, borderRadius: 20, borderWidth: 1, borderColor,
          }}
        >
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: profileData.profileImage }}
              style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#D6D3D1' }}
            />
            {isEditing && (
              <Pressable
                style={{
                  position: 'absolute', bottom: 2, right: 2,
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: '#C2410C', alignItems: 'center', justifyContent: 'center',
                  borderWidth: 2, borderColor: cardBg,
                }}
              >
                <Camera size={13} color="#fff" />
              </Pressable>
            )}
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 24, color: textColor, letterSpacing: -0.3 }}>
              {profileData.name || '—'}
            </Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: mutedTextColor }}>
              @{user?.username || 'user'}
            </Text>
          </View>
        </View>

        {/* Two-column: Name + Birthday */}
        <View style={{ flexDirection: 'row', gap: 28 }}>
          <View style={{ flex: 1, gap: 8 }}>
            <FieldLabel>Full Name</FieldLabel>
            {isEditing ? (
              <EditableField field="name" value={profileData.name} error={errors.name} />
            ) : (
              <View style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor }}>
                <Text style={{ fontFamily: 'Inter-Medium', fontSize: 15, color: textColor }}>{profileData.name || '—'}</Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1, gap: 8 }}>
            <FieldLabel>Birthday</FieldLabel>
            {isEditing ? (
              <EditableField field="birthday" value={profileData.birthday} error={errors.birthday} />
            ) : (
              <View style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor }}>
                <Text style={{ fontFamily: 'Inter-Medium', fontSize: 15, color: textColor }}>{profileData.birthday || '—'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bio */}
        <View style={{ gap: 8 }}>
          <FieldLabel>Bio</FieldLabel>
          {isEditing ? (
            <EditableField field="bio" value={profileData.bio} error={errors.bio} multiline />
          ) : (
            <View style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor, minHeight: 80 }}>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 15, color: mutedTextColor, lineHeight: 24 }}>{profileData.bio || '—'}</Text>
            </View>
          )}
        </View>

        <InterestChips />

        {/* Cancel button when editing */}
        {isEditing && (
          <Pressable
            onPress={handleCancel}
            style={{ alignSelf: 'flex-start', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10, backgroundColor: isDark ? '#262626' : '#F3F0ED' }}
          >
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: textColor }}>Cancel</Text>
          </Pressable>
        )}

        {/* Danger Zone */}
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            padding: 20, paddingHorizontal: 24, borderRadius: 14, borderWidth: 1, borderColor: '#FECACA', marginTop: 12,
          }}
        >
          <View style={{ gap: 3 }}>
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#DC2626' }}>Danger Zone</Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: labelColor }}>Permanently delete your account and all data</Text>
          </View>
          <DestructiveButton onPress={() => setShowDeleteModal(true)}>
            Delete Account
          </DestructiveButton>
        </View>
      </View>

      <DeleteModal />
    </ScrollView>
  )
}
