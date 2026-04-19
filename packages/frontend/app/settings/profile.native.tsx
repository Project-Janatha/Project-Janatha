import React from 'react'
import { View, Text, Pressable, ScrollView, SafeAreaView, StatusBar } from 'react-native'
import { useRouter, Link } from 'expo-router'
import { User, Shield, ChevronRight, X, Info } from 'lucide-react-native'
import { useUser, useThemeContext } from '../../components/contexts'
import { Avatar } from '../../components/ui'
import { isSuperAdmin } from '../../utils/admin'
import ThemeSelector from '../../components/ThemeSelector'
import { usePostHog } from 'posthog-react-native'

export default function ProfileNative() {
  const router = useRouter()
  const { user, logout } = useUser()
  const { isDark, themePreference } = useThemeContext()
  const posthog = usePostHog()
  
  const textColor = isDark ? '#fff' : '#000'
  const bgColor = isDark ? '#000' : '#fff'
  const borderColor = isDark ? '#262626' : '#E5E7EB'
  const mutedColor = isDark ? '#a1a1aa' : '#71717a'

  const handleLogout = async () => {
    posthog?.capture('nav_logout')
    await logout()
    router.replace('/auth')
  }

  const MenuRow = ({ href, onPress, children, showArrow = true }: { 
    href?: string
    onPress?: () => void
    children: React.ReactNode
    showArrow?: boolean
  }) => {
    const content = (
      <Pressable
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 16,
          backgroundColor: bgColor,
        }}
        onPress={onPress}
      >
        {children}
        {showArrow && (
          <ChevronRight size={20} color={mutedColor} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        )}
      </Pressable>
    )

    if (href) {
      return <Link href={href as any} asChild>{content}</Link>
    }
    return content
  }

  const Section = ({ title, children }: { title?: string; children: React.ReactNode }) => (
    <View style={{ marginBottom: 24 }}>
      {title && (
        <Text style={{
          fontSize: 13,
          fontWeight: '600',
          color: mutedColor,
          textTransform: 'uppercase',
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}>
          {title}
        </Text>
      )}
      <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor }}>
        {children}
      </View>
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor,
      }}>
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <X size={24} color={textColor} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '600', color: textColor }}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 8 }}>
        {/* Profile Header */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar
              image={user?.profileImage || undefined}
              name={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'User'}
              size={60}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: textColor }}>
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'User'}
              </Text>
              {user?.username && (
                <Text style={{ fontSize: 14, color: mutedColor }}>@{user.username}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Account Section */}
        <Section title="Account">
          <MenuRow href="/settings/profile">
            <User size={20} color={textColor} style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 16, color: textColor }}>Edit Profile</Text>
          </MenuRow>
          {isSuperAdmin(user) && (
            <MenuRow href="/admin">
              <Shield size={20} color="#E8862A" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#E8862A' }}>Admin Dashboard</Text>
            </MenuRow>
          )}
        </Section>

        {/* Appearance Section */}
        <Section title="Appearance">
          <View style={{ paddingVertical: 14, paddingHorizontal: 16, backgroundColor: bgColor }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, color: textColor, flex: 1 }}>Theme</Text>
              <Text style={{ fontSize: 14, color: mutedColor, textTransform: 'capitalize' }}>
                {themePreference === 'system' ? 'Auto' : themePreference}
              </Text>
            </View>
            <ThemeSelector />
          </View>
        </Section>

        {/* About Section */}
        <Section title="About">
          <MenuRow onPress={() => {
            posthog?.capture('privacy_policy_viewed')
            router.push('/privacy')
          }}>
            <Info size={20} color={textColor} style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 16, color: textColor }}>Privacy Policy</Text>
          </MenuRow>
          <MenuRow onPress={() => {
            posthog?.capture('terms_viewed')
            router.push('/terms')
          }}>
            <Info size={20} color={textColor} style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 16, color: textColor }}>Terms of Service</Text>
          </MenuRow>
          <MenuRow onPress={() => {
            posthog?.capture('cookie_policy_viewed')
            router.push('/cookies')
          }}>
            <Info size={20} color={textColor} style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 16, color: textColor }}>Cookie Policy</Text>
          </MenuRow>
          <MenuRow>
            <Text style={{ fontSize: 16, color: textColor }}>Version</Text>
            <Text style={{ fontSize: 16, color: mutedColor, marginLeft: 'auto' }}>1.0.0</Text>
          </MenuRow>
          <MenuRow showArrow={false}>
            <Text style={{ fontSize: 16, color: textColor }}>Chinmaya Janata</Text>
            <Text style={{ fontSize: 16, color: mutedColor, marginLeft: 'auto' }}>Chinmaya Mission</Text>
          </MenuRow>
        </Section>

        {/* Log Out */}
        <Section>
          <MenuRow onPress={handleLogout}>
            <Text style={{ fontSize: 16, color: '#ef4444', fontWeight: '600' }}>Log Out</Text>
          </MenuRow>
        </Section>

        {/* Spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}
