import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { useUser, useThemeContext } from '../components/contexts'
import { router } from 'expo-router'
import AdminSidebar, { type AdminTab } from '../components/admin/AdminSidebar'
import CentersTab from '../components/admin/CentersTab'
import EventsTab from '../components/admin/EventsTab'
import UsersTab from '../components/admin/UsersTab'

export default function AdminPage() {
  const { user, loading } = useUser()
  const { isDark } = useThemeContext()
  const [activeTab, setActiveTab] = useState<AdminTab>('Centers')

  const isSuperAdmin = !!user && (user.verificationLevel ?? 0) >= 107
  if (!loading && !isSuperAdmin) {
    router.replace('/(tabs)')
    return null
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#0d0d0d' : '#FAFAF9' }}>
        <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: isDark ? '#666' : '#999' }}>Loading...</Text>
      </View>
    )
  }

  const pageBg = isDark ? '#0d0d0d' : '#FAFAF9'

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: pageBg }}>
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'Centers' && <CentersTab />}
      {activeTab === 'Events' && <EventsTab />}
      {activeTab === 'Users' && <UsersTab />}
    </View>
  )
}
