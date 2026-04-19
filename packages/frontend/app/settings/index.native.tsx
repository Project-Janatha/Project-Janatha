import React from 'react'
import { View, Text, Pressable, ScrollView, SafeAreaView } from 'react-native'
import { useRouter, Link } from 'expo-router'
import { User, Settings, LogOut, Shield, ChevronRight } from 'lucide-react-native'
import { useUser, useThemeContext } from '../../components/contexts'
import { Avatar } from '../../components/ui'
import ThemeSelector from '../../components/ThemeSelector.native'
import { isSuperAdmin } from '../../utils/admin'

export default function SettingsIndex() {
  const router = useRouter()
  const { user, logout } = useUser()
  const { isDark } = useThemeContext()

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.username || 'User'

  const profileImage = user?.profileImage
  const textColor = isDark ? '#fff' : '#000'
  const borderColor = isDark ? '#262626' : '#E5E7EB'

  const handleLogout = async () => {
    await logout()
    router.replace('/auth')
  }

  const MenuItem = ({ href, children, showArrow = true, onPress, color = textColor }: { href?: string, children: React.ReactNode, showArrow?: boolean, onPress?: () => void, color?: string }) => {
    const content = (
      <Pressable
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        }}
        onPress={onPress}
      >
        {children}
        {showArrow && <ChevronRight size={20} color={color} style={{ opacity: 0.5 }} />}
      </Pressable>
    )

    if (href) {
      return <Link href={href as any} asChild>{content}</Link>
    }
    return content
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#171717' : '#fff' }}>
      <ScrollView>
        <View style={{ padding: 16 }}>
          {/* Profile Section */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <Avatar
              image={profileImage || undefined}
              name={displayName}
              size={60}
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: textColor }}>
                {displayName}
              </Text>
              {user?.username && (
                <Text style={{ fontSize: 14, color: isDark ? '#a1a1aa' : '#71717a' }}>
                  @{user.username}
                </Text>
              )}
            </View>
          </View>

          {/* Profile */}
          <MenuItem href="/settings">
            <User size={20} color={textColor} style={{ marginRight: 12 }} />
            <Text style={{ flex: 1, fontSize: 16, color: textColor }}>Profile</Text>
          </MenuItem>

          {/* Settings */}
          <MenuItem href="/settings/settings">
            <Settings size={20} color={textColor} style={{ marginRight: 12 }} />
            <Text style={{ flex: 1, fontSize: 16, color: textColor }}>Settings</Text>
          </MenuItem>

          {/* Admin - only show for super admins */}
          {isSuperAdmin(user) && (
            <MenuItem href="/admin" color="#E8862A">
              <Shield size={20} color="#E8862A" style={{ marginRight: 12 }} />
              <Text style={{ flex: 1, fontSize: 16, color: '#E8862A' }}>Admin Dashboard</Text>
            </MenuItem>
          )}

          {/* Appearance */}
          <View style={{ marginTop: 24, marginBottom: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#a1a1aa' : '#71717a', textTransform: 'uppercase' }}>
              Appearance
            </Text>
          </View>
          <View
            style={{
              backgroundColor: isDark ? '#262626' : '#f3f4f6',
              borderRadius: 12,
              padding: 12,
            }}
          >
            <ThemeSelector />
          </View>

          {/* Log Out */}
          <MenuItem showArrow={false} onPress={handleLogout}>
            <LogOut size={20} color="#ef4444" style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 16, color: '#ef4444' }}>Log Out</Text>
          </MenuItem>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}