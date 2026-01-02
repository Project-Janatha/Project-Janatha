import { useColorScheme as useNativeWindColorScheme } from 'nativewind'
import { useColorScheme as useSystemColorScheme, Platform } from 'react-native'
import { useEffect, useState, useMemo, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const THEME_PREFERENCE_KEY = '@theme_preference'

// Provider that initializes theme from system
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useSystemColorScheme()
  const { setColorScheme } = useNativeWindColorScheme()
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system')
  const [initialized, setInitialized] = useState(false)

  // Load saved preference on mount
  useEffect(() => {
    let isMounted = true
    const loadPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_PREFERENCE_KEY)
        if (isMounted && (saved === 'light' || saved === 'dark' || saved === 'system')) {
          setThemePreference(saved)
        }
        if (isMounted) {
          setInitialized(true)
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error)
        if (isMounted) {
          setInitialized(true)
        }
      }
    }
    loadPreference()
    return () => {
      isMounted = false
    }
  }, [])

  // Memoize theme application logic
  const applyTheme = useCallback(
    (themePreference: 'light' | 'dark' | 'system', systemScheme: 'light' | 'dark' | null) => {
      const themeToApply = themePreference === 'system' ? systemScheme : themePreference

      if (themeToApply) {
        setColorScheme(themeToApply as 'light' | 'dark')

        // For web, set class immediately
        if (Platform.OS === 'web') {
          if (themeToApply === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      }
    },
    [setColorScheme]
  )

  // Apply theme based on preference
  useEffect(() => {
    if (!initialized) return
    applyTheme(themePreference, systemScheme ?? null)
  }, [themePreference, systemScheme, initialized, applyTheme])

  return <>{children}</>
}

// Re-export NativeWind's hook with additional theme preference methods
export const useThemeContext = () => {
  const systemScheme = useSystemColorScheme()
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativeWindColorScheme()
  const [themePreference, setThemePreferenceState] = useState<'light' | 'dark' | 'system'>('system')

  // Load preference
  useEffect(() => {
    let isMounted = true
    const loadPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_PREFERENCE_KEY)
        if (isMounted && (saved === 'light' || saved === 'dark' || saved === 'system')) {
          setThemePreferenceState(saved)
        }
      } catch (error) {
        // Failed to load theme preference
      }
    }
    loadPreference()
    return () => {
      isMounted = false
    }
  }, [])

  const setThemePreference = useCallback(
    async (mode: 'light' | 'dark' | 'system') => {
      try {
        await AsyncStorage.setItem(THEME_PREFERENCE_KEY, mode)
        setThemePreferenceState(mode)

        // Apply theme immediately
        const themeToApply = mode === 'system' ? systemScheme : mode
        setColorScheme(themeToApply as 'light' | 'dark')
      } catch (error) {
        // Failed to save theme preference
      }
    },
    [systemScheme, setColorScheme]
  )

  return useMemo(
    () => ({
      theme: colorScheme || systemScheme || 'light',
      isDark: (colorScheme || systemScheme) === 'dark',
      toggleTheme: toggleColorScheme,
      setTheme: setColorScheme,
      themePreference,
      setThemePreference,
    }),
    [
      colorScheme,
      systemScheme,
      toggleColorScheme,
      setColorScheme,
      themePreference,
      setThemePreference,
    ]
  )
}
