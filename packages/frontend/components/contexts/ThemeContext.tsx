import { useColorScheme as useNativeWindColorScheme } from 'nativewind'
import { Appearance, Platform, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const THEME_KEY = '@theme_preference'

export type ThemePreference = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  isDark: boolean
  themePreference: ThemePreference
  setThemePreference: (pref: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): 'light' | 'dark' {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
}

function readPersistedPreference(): ThemePreference {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const v = localStorage.getItem(THEME_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  }
  return 'system'
}

function persistPreference(pref: ThemePreference) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    localStorage.setItem(THEME_KEY, pref)
  } else {
    AsyncStorage.setItem(THEME_KEY, pref).catch(() => {})
  }
}

function applyWebClass(theme: 'light' | 'dark') {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme()
  const initialPref = readPersistedPreference()
  const [preference, setPreferenceState] = useState<ThemePreference>(initialPref)
  const [systemTick, setSystemTick] = useState(0)

  const systemTheme: 'light' | 'dark' = getSystemTheme()
  const effective = preference === 'system' ? systemTheme : preference

  const preferenceRef = useRef(preference)
  useEffect(() => {
    preferenceRef.current = preference
  }, [preference])

  // Load AsyncStorage on native
  useEffect(() => {
    if (Platform.OS === 'web') return
    AsyncStorage.getItem(THEME_KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'system') setPreferenceState(v)
      })
      .catch(() => {})
  }, [])

  // Listen for system theme changes on native
  useEffect(() => {
    if (Platform.OS === 'web') return

    const sub = Appearance.addChangeListener(() => {
      if (preferenceRef.current !== 'system') return
      setSystemTick((t) => t + 1)
    })

    return () => sub.remove()
  }, [])

  // Apply theme
  useEffect(() => {
    if (Platform.OS === 'web') {
      setColorScheme(effective)
      applyWebClass(effective)
    } else {
      setColorScheme(effective)
    }
  }, [effective, setColorScheme])

  const setThemePreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref)
    persistPreference(pref)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ isDark: colorScheme === 'dark', themePreference: preference, setThemePreference }),
    [colorScheme, preference, setThemePreference]
  )

  return (
    <ThemeContext.Provider value={value}>
      {Platform.OS === 'web' ? (
        children
      ) : (
        <View className={effective === 'dark' ? 'flex-1 dark' : 'flex-1'} style={{ flex: 1 }}>
          {children}
        </View>
      )}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}

export const useThemeContext = useTheme
