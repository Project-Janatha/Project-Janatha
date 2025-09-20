import React, { useState, useContext } from 'react';
import { 
  ScrollView, 
  YStack, 
  XStack, 
  Button, 
  Avatar, 
  H1, 
  H2, 
  H3, 
  Paragraph, 
  Input, 
  TextArea,
  Card,
  useTheme
} from 'tamagui';
import { 
  X, 
  Camera, 
  Settings,
} from '@tamagui/lucide-icons';
import { UserContext } from 'components';
import { useRouter } from 'expo-router';

type User = {
  username: string;
  center: number;
  points: number;
  isVerified: boolean;
  verificationLevel: number;
  exists: boolean;
  isActive: boolean;
  id: string;
  events: any[];
};

type ProfileData = {
  name: string;
  bio: string;
  birthday: string;
  preferences: string[];
  profileImage?: string;
};

const PREFERENCE_OPTIONS = [
  'Satsangs',
  'Bhiksha', 
  'Global events',
  'Local events',
  'Casual',
  'Formal'
];

export default function ProfilePage() {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<ProfileData>>({});
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.username || 'Pranav Vaish',
    bio: 'I am a CHYK from San Jose.',
    birthday: 'October 1, 2000',
    preferences: ['Global events', 'Casual'],
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileData> = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!profileData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    }
    
    if (!profileData.birthday.trim()) {
      newErrors.birthday = 'Birthday is required';
    }
    
    if (profileData.preferences.length === 0) {
      newErrors.preferences = 'At least one preference must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setErrors({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    try {
      // TODO: Implement save functionality with backend
      // await saveProfile(profileData);
      console.log('Saving profile:', profileData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      console.error('Error saving profile:', error);
      // TODO: Show error toast
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceToggle = (preference: string) => {
    if (isEditing) {
      setProfileData(prev => ({
        ...prev,
        preferences: prev.preferences.includes(preference)
          ? prev.preferences.filter(p => p !== preference)
          : [...prev.preferences, preference]
      }));
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    if (isEditing) {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <ScrollView flex={1} bg="$background">
      <YStack flex={1} px="$4" pt="$4" pb="$8">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" mb="$4">
          <Button 
            size="$3" 
            variant="outlined" 
            icon={<X size={20} />}
            onPress={() => router.back()}
          >
            Close
          </Button>
          <H1 fontSize="$6" fontWeight="600">
            Profile
          </H1>
          <Button 
            size="$3" 
            variant="outlined" 
            onPress={isEditing ? handleSave : handleEdit}
          >
            {isEditing ? 'Done' : 'Edit'}
          </Button>
        </XStack>

        {/* Profile Header */}
        <XStack alignItems="center" gap="$4" mb="$6">
          <Avatar size="$6" circular>
            <Avatar.Image src={profileData.profileImage} />
            <Avatar.Fallback bg="$primary" />
          </Avatar>
          <YStack flex={1}>
            {isEditing ? (
              <YStack flex={1}>
                <Input
                  value={profileData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  fontSize="$5"
                  fontWeight="600"
                  borderWidth={1}
                  borderColor={errors.name ? "$red8" : "$borderColor"}
                  bg="$background"
                  mb="$1"
                />
                {errors.name && (
                  <Paragraph fontSize="$2" color="$red10" mb="$2">
                    {errors.name}
                  </Paragraph>
                )}
              </YStack>
            ) : (
              <H2 fontSize="$5" fontWeight="600" mb="$1">
                {profileData.name}
              </H2>
            )}
            <Paragraph fontSize="$3" color="$gray10" fontWeight="500">
              CHYK
            </Paragraph>
            {isEditing && (
              <Button 
                size="$2" 
                variant="outlined" 
                icon={<Camera size={16} />}
                mt="$2"
                alignSelf="flex-start"
              >
                Replace Photo
              </Button>
            )}
          </YStack>
        </XStack>

        {/* Bio Section */}
        <YStack gap="$3" mb="$6">
          <H3 fontSize="$4" fontWeight="600" color="$color">
            Bio
          </H3>
          {isEditing ? (
            <YStack>
              <TextArea
                value={profileData.bio}
                onChangeText={(value) => handleInputChange('bio', value)}
                placeholder="Tell us about yourself..."
                borderWidth={1}
                borderColor={errors.bio ? "$red8" : "$borderColor"}
                bg="$background"
                minHeight={80}
                textAlignVertical="top"
              />
              {errors.bio && (
                <Paragraph fontSize="$2" color="$red10" mt="$2">
                  {errors.bio}
                </Paragraph>
              )}
            </YStack>
          ) : (
            <Paragraph fontSize="$4" color="$color" lineHeight="$1">
              {profileData.bio}
            </Paragraph>
          )}
        </YStack>

        {/* Birthday Section */}
        <YStack gap="$3" mb="$6">
          <H3 fontSize="$4" fontWeight="600" color="$color">
            Birthday
          </H3>
          {isEditing ? (
            <YStack>
              <Input
                value={profileData.birthday}
                onChangeText={(value) => handleInputChange('birthday', value)}
                borderWidth={1}
                borderColor={errors.birthday ? "$red8" : "$borderColor"}
                bg="$background"
              />
              {errors.birthday && (
                <Paragraph fontSize="$2" color="$red10" mt="$2">
                  {errors.birthday}
                </Paragraph>
              )}
            </YStack>
          ) : (
            <Paragraph fontSize="$4" color="$color">
              {profileData.birthday}
            </Paragraph>
          )}
        </YStack>

        {/* Preferences Section */}
        <YStack gap="$3" mb="$6">
          <H3 fontSize="$4" fontWeight="600" color="$color">
            Preferences
          </H3>
          <XStack flexWrap="wrap" gap="$2">
            {PREFERENCE_OPTIONS.map((preference) => {
              const isSelected = profileData.preferences.includes(preference);
              return (
                <Button
                  key={preference}
                  size="$3"
                  variant="outlined"
                  onPress={() => handlePreferenceToggle(preference)}
                  bg={isSelected ? "$primary" : "transparent"}
                  borderColor={isSelected ? "$primary" : "$borderColor"}
                  color={isSelected ? "white" : "$color"}
                  opacity={isEditing ? 1 : (isSelected ? 1 : 0.6)}
                  pressStyle={{
                    scale: isEditing ? 0.95 : 1,
                    opacity: isEditing ? 0.8 : 1
                  }}
                  disabled={!isEditing}
                >
                  {preference}
                </Button>
              );
            })}
          </XStack>
          {errors.preferences && (
            <Paragraph fontSize="$2" color="$red10">
              {errors.preferences}
            </Paragraph>
          )}
        </YStack>

        {/* Action Buttons */}
        {isEditing && (
          <XStack gap="$3" mt="$4">
            <Button 
              flex={1} 
              size="$4" 
              variant="outlined"
              onPress={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              flex={1} 
              size="$4" 
              bg="$primary"
              color={"white"}
              hoverStyle={{
                backgroundColor: "$primaryPress",
                color: "$white"
              }}
              onPress={handleSave}
              disabled={isSaving}
              opacity={isSaving ? 0.7 : 1}
            >
              {isSaving ? 'Saving...' : 'Save profile'}
            </Button>
          </XStack>
        )}

        {/* Settings Button (when not editing) */}
        {!isEditing && (
          <Card elevate size="$4" mt="$4">
            <Card.Header p="$4">
              <XStack alignItems="center" gap="$3">
                <Settings size={20} color="$primary" />
                <Paragraph fontSize="$4" fontWeight="500" flex={1}>
                  Account Settings
                </Paragraph>
                <Button size="$2" variant="outlined">
                  Manage
                </Button>
              </XStack>
            </Card.Header>
          </Card>
        )}
      </YStack>
    </ScrollView>
  );
}
