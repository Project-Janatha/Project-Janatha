import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { X, User, Settings, LogOut, Sun, Moon, Monitor } from 'lucide-react-native'
import { useUser, useThemeContext } from './contexts'

export default function SettingsModal({ visible, onClose, onLogout }) {
  const router = useRouter()
  const { user } = useUser()
  const { themePreference, setThemePreference, isDark } = useThemeContext()
  
  const themeOptions = ['light', 'dark', 'system']
  const textColor = isDark ? '#fff' : '#000'
  const bgColor = isDark ? '#171717' : '#fff'
  const borderColor = isDark ? '#262626' : '#E5E7EB'

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : 'User'
  const profileImage = user?.profileImage || 'https://via.placeholder.com/150'

  const handleNavigate = useCallback((path: string) => {
    onClose()
    router.push(path)
  }, [onClose, router])

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: textColor }}>
            Settings
          </Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
            <X size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {/* Profile Section */}
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Image 
                source={{ uri: profileImage }} 
                style={{ width: 60, height: 60, borderRadius: 30, marginRight: 12 }} 
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: textColor }}>
                  {displayName}
                </Text>
                <Text style={{ fontSize: 14, opacity: 0.7, color: textColor }}>
                  {user?.username || 'No username'}
                </Text>
              </View>
            </View>

            {/* Menu Items */}
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: borderColor,
              }}
              onPress={() => handleNavigate('/settings')}
            >
              <User size={20} color={textColor} style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: textColor }}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: borderColor,
              }}
              onPress={() => handleNavigate('/settings/settings')}
            >
              <Settings size={20} color={textColor} style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: textColor }}>App Settings</Text>
            </TouchableOpacity>

            {/* Appearance Section */}
            <View style={{ marginTop: 24, marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: textColor, marginBottom: 12 }}>
                Appearance
              </Text>
              <View style={{ 
                flexDirection: 'row', 
                backgroundColor: isDark ? '#262626' : '#f3f4f6', 
                borderRadius: 8,
                padding: 4,
              }}>
                {themeOptions.map((option) => {
                  const isSelected = themePreference === option
                  return (
                    <TouchableOpacity
                      key={option}
                      onPress={() => setThemePreference(option as 'light' | 'dark' | 'system')}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 10,
                        borderRadius: 6,
                        backgroundColor: isSelected ? (isDark ? '#3f3f46' : '#fff') : 'transparent',
                      }}
                    >
                      {option === 'light' && (
                        <Sun 
                          size={16} 
                          color={isSelected ? '#ea580c' : textColor} 
                        />
                      )}
                      {option === 'dark' && (
                        <Moon 
                          size={16} 
                          color={isSelected ? '#ea580c' : textColor} 
                        />
                      )}
                      {option === 'system' && (
                        <Monitor 
                          size={16} 
                          color={isSelected ? '#ea580c' : textColor} 
                        />
                      )}
                      <Text 
                        style={{ 
                          marginLeft: 6, 
                          fontSize: 14,
                          fontWeight: isSelected ? '600' : '400',
                          color: isSelected ? '#ea580c' : textColor,
                        }}
                      >
                        {option === 'system' ? 'Auto' : option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            {/* Log Out */}
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                paddingVertical: 12,
                marginTop: 24,
              }}
              onPress={onLogout}
            >
              <LogOut size={20} color="#ef4444" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#ef4444' }}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}
