import { useColorScheme as useNativeWindColorScheme } from 'nativewind'
import { useColorScheme as useSystemColorScheme, Platform } from 'react-native'
import { useEffect, useState, useMemo, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const THEME_PREFERENCE_KEY = '@theme_preference'

// Read initial preference synchronously on web, null on native (loaded async)
function getInitialPreference(): 'light' | 'dark' | 'system' | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const saved = localStorage.getItem(THEME_PREFERENCE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  }
  return null
}

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

/** Apply dark/light class and colorScheme style on web */
function applyWebTheme(theme: 'light' | 'dark') {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
  }
}

// Provider that initializes theme from storage/system
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useSystemColorScheme()
  const { setColorScheme } = useNativeWindColorScheme()

  // Load saved preference on mount and apply once
  useEffect(() => {
    let isMounted = true
    const loadPreference = async () => {
      try {
        const saved = await safeStorage.getItem(THEME_PREFERENCE_KEY)
        if (!isMounted) return

        let themeToApply: 'light' | 'dark'
        if (saved === 'light' || saved === 'dark') {
          themeToApply = saved
        } else {
          themeToApply = (systemScheme as 'light' | 'dark') || 'light'
        }

        setColorScheme(themeToApply)
        // Apply after NativeWind processes the change
        requestAnimationFrame(() => applyWebTheme(themeToApply))
      } catch (error) {
        // ignore
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
  const systemScheme = useSystemColorScheme() // MUST be called at top level
  const initialPref = getInitialPreference()
  const [themePreference, setThemePreferenceState] = useState<'light' | 'dark' | 'system'>(
    initialPref ?? 'system'
  )
  const [loaded, setLoaded] = useState(initialPref !== null)

  // Load saved preference (async — needed for native, instant on web)
  useEffect(() => {
    if (loaded) return // Already loaded synchronously on web
    let isMounted = true
    const loadPreference = async () => {
      try {
        const saved = await safeStorage.getItem(THEME_PREFERENCE_KEY)
        if (isMounted && (saved === 'light' || saved === 'dark' || saved === 'system')) {
          setThemePreferenceState(saved as 'light' | 'dark' | 'system')
        }
      } catch (error) {
        // Failed to load theme preference
      } finally {
        if (isMounted) setLoaded(true)
      }
    }
    loadPreference()
    return () => {
      isMounted = false
    }
  }, [loaded])

  // React to system appearance changes when in 'system' mode
  // Only fires after preference is loaded to avoid overriding saved dark/light
  useEffect(() => {
    if (!loaded) return
    if (themePreference === 'system' && systemScheme) {
      const theme = (systemScheme as 'light' | 'dark') || 'light'
      setColorScheme(theme)
      requestAnimationFrame(() => applyWebTheme(theme))
    }
  }, [loaded, themePreference, systemScheme, setColorScheme])

  const setThemePreference = useCallback(
    async (mode: 'light' | 'dark' | 'system') => {
      try {
        await safeStorage.setItem(THEME_PREFERENCE_KEY, mode)
        setThemePreferenceState(mode)

        let themeToApply: 'light' | 'dark'
        if (mode === 'system') {
          themeToApply = (systemScheme as 'light' | 'dark') || 'light'
        } else {
          themeToApply = mode
        }

        setColorScheme(themeToApply)
        // Ensure class is applied after NativeWind side-effects
        requestAnimationFrame(() => applyWebTheme(themeToApply))
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
