import { useColorScheme as useNativeWindColorScheme } from 'nativewind'
import { useColorScheme as useSystemColorScheme, Platform } from 'react-native'
import { useEffect, useState, useMemo, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const THEME_PREFERENCE_KEY = '@theme_preference'

// Provider that initializes theme from system
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useSystemColorScheme()
  const { setColorScheme } = useNativeWindColorScheme()
  const [initialized, setInitialized] = useState(false)

  // Load saved preference on mount and apply once
  useEffect(() => {
    let isMounted = true
    const loadPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_PREFERENCE_KEY)
        if (isMounted) {
          let themeToApply: 'light' | 'dark'

          if (saved === 'light' || saved === 'dark') {
            themeToApply = saved
          } else {
            // Default to system or light
            themeToApply = (systemScheme as 'light' | 'dark') || 'light'
          }

          setColorScheme(themeToApply)

          // For web, set class immediately
          if (Platform.OS === 'web') {
            if (themeToApply === 'dark') {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          }

          setInitialized(true)
        }
      } catch (error) {
        if (isMounted) {
          setInitialized(true)
        }
      }
    }
    loadPreference()
    return () => {
      isMounted = false
    }
  }, []) // Only run once on mount

  return <>{children}</>
}

// Re-export NativeWind's hook with additional theme preference methods
export const useThemeContext = () => {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativeWindColorScheme()
  const [themePreference, setThemePreferenceState] = useState<'light' | 'dark' | 'system'>('system')

  // Load saved preference
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
        let themeToApply: 'light' | 'dark'
        if (mode === 'system') {
          // Use system preference
          const systemScheme = useSystemColorScheme()
          themeToApply = (systemScheme as 'light' | 'dark') || 'light'
        } else {
          themeToApply = mode
        }

        setColorScheme(themeToApply)

        // For web, update class
        if (Platform.OS === 'web') {
          if (themeToApply === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      } catch (error) {
        // Failed to save theme preference
      }
    },
    [setColorScheme]
  )

  return useMemo(
    () => ({
      theme: colorScheme || 'light',
      isDark: colorScheme === 'dark',
      toggleTheme: toggleColorScheme,
      setTheme: setColorScheme,
      themePreference,
      setThemePreference,
    }),
    [colorScheme, toggleColorScheme, setColorScheme, themePreference, setThemePreference]
  )
}
