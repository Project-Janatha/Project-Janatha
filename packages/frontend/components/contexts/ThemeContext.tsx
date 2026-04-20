import { useColorScheme as useNativeWindColorScheme } from 'nativewind'
import { useColorScheme as useSystemColorScheme, Appearance, Platform } from 'react-native'
import { useEffect, useState, useMemo, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const THEME_PREFERENCE_KEY = '@theme_preference'

function getInitialPreference(): 'light' | 'dark' | 'system' | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const saved = localStorage.getItem(THEME_PREFERENCE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  }
  return null
}

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return localStorage.getItem(key)
      }
      return await AsyncStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.setItem(key, value)
      } else {
        await AsyncStorage.setItem(key, value)
      }
    } catch {
      // silently fail
    }
  },
}

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

function getWebSystemColorScheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

function subscribeToWebSystemColorScheme(callback: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (e: MediaQueryListEvent) => callback(e.matches ? 'dark' : 'light')
  mediaQuery.addEventListener('change', handler)
  return () => mediaQuery.removeEventListener('change', handler)
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { setColorScheme } = useNativeWindColorScheme()

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      const saved = await safeStorage.getItem(THEME_PREFERENCE_KEY)
      if (cancelled) return
      if (saved === 'light' || saved === 'dark') {
        if (Platform.OS !== 'web') Appearance.setColorScheme(saved)
        setColorScheme(saved)
        requestAnimationFrame(() => applyWebTheme(saved))
      } else {
        // 'system' or no preference — follow system
        if (Platform.OS !== 'web') Appearance.setColorScheme(null as any)
        // On web, just apply the current system theme
        if (Platform.OS === 'web') {
          const sys = getWebSystemColorScheme()
          setColorScheme(sys)
          requestAnimationFrame(() => applyWebTheme(sys))
        } else {
          setColorScheme('system' as any)
        }
      }
    }
    init()
    return () => { cancelled = true }
  }, [setColorScheme])

  return <>{children}</>
}

export const useThemeContext = () => {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativeWindColorScheme()
  const systemScheme = useSystemColorScheme()
  const initialPref = getInitialPreference()
  const [themePreference, setThemePreferenceState] = useState<'light' | 'dark' | 'system'>(
    initialPref ?? 'system'
  )
  const [loaded, setLoaded] = useState(initialPref !== null)

  // Load saved preference async (native only — web is instant)
  useEffect(() => {
    if (loaded) return
    let cancelled = false
    const load = async () => {
      const saved = await safeStorage.getItem(THEME_PREFERENCE_KEY)
      if (cancelled) return
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setThemePreferenceState(saved)
      }
      setLoaded(true)
    }
    load()
    return () => { cancelled = true }
  }, [loaded])

  // React to system changes when preference is 'system'
  useEffect(() => {
    if (!loaded || themePreference !== 'system') return

    if (Platform.OS === 'web') {
      const unsubscribe = subscribeToWebSystemColorScheme((theme) => {
        setColorScheme(theme)
        requestAnimationFrame(() => applyWebTheme(theme))
      })
      return unsubscribe
    }
    // On native, tell nativewind to follow the system automatically
    setColorScheme('system' as any)
  }, [loaded, themePreference, setColorScheme])

  const setThemePreference = useCallback(
    async (mode: 'light' | 'dark' | 'system') => {
      setThemePreferenceState(mode)
      await safeStorage.setItem(THEME_PREFERENCE_KEY, mode)

      if (mode === 'system') {
        if (Platform.OS !== 'web') Appearance.setColorScheme(null as any)
        if (Platform.OS === 'web') {
          const sys = getWebSystemColorScheme()
          setColorScheme(sys)
          requestAnimationFrame(() => applyWebTheme(sys))
        } else {
          setColorScheme('system' as any)
        }
      } else {
        if (Platform.OS !== 'web') Appearance.setColorScheme(mode)
        setColorScheme(mode)
        requestAnimationFrame(() => applyWebTheme(mode))
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
