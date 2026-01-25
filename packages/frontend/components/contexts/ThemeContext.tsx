import { useColorScheme as useNativeWindColorScheme } from 'nativewind'
import { useColorScheme as useSystemColorScheme, Platform } from 'react-native'
import { useEffect, useState, useMemo, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const THEME_PREFERENCE_KEY = '@theme_preference'

// Safe storage wrapper
const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          return localStorage.getItem(key)
        }
        return null
      }
      return await AsyncStorage.getItem(key)
    } catch (error) {
      return null
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, value)
        }
      } else {
        await AsyncStorage.setItem(key, value)
      }
    } catch (error) {
      // Silently fail
    }
  },
}

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
        const saved = await safeStorage.getItem(THEME_PREFERENCE_KEY)
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
          if (Platform.OS === 'web' && typeof document !== 'undefined') {
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
  const systemScheme = useSystemColorScheme() // MUST be called at top level, not inside callback
  const [themePreference, setThemePreferenceState] = useState<'light' | 'dark' | 'system'>('system')

  // Load saved preference
  useEffect(() => {
    let isMounted = true
    const loadPreference = async () => {
      try {
        const saved = await safeStorage.getItem(THEME_PREFERENCE_KEY)
        if (isMounted && (saved === 'light' || saved === 'dark' || saved === 'system')) {
          setThemePreferenceState(saved as 'light' | 'dark' | 'system')
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
        await safeStorage.setItem(THEME_PREFERENCE_KEY, mode)
        setThemePreferenceState(mode)

        // Apply theme immediately
        let themeToApply: 'light' | 'dark'
        if (mode === 'system') {
          // Use system preference (from hook called at top level)
          themeToApply = (systemScheme as 'light' | 'dark') || 'light'
        } else {
          themeToApply = mode
        }

        setColorScheme(themeToApply)

        // For web, update class
        if (Platform.OS === 'web' && typeof document !== 'undefined') {
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
    [setColorScheme, systemScheme]
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
