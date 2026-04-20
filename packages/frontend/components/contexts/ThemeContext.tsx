import { useColorScheme as useNativeWindColorScheme } from 'nativewind'
import { useColorScheme as useSystemColorScheme, Platform } from 'react-native'
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const THEME_KEY = '@theme_preference'

type ThemePreference = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  isDark: boolean
  themePreference: ThemePreference
  setThemePreference: (mode: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialEffectiveTheme(): 'light' | 'dark' {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

function applyWebTheme(theme: 'light' | 'dark') {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
  const root = document.getElementById('root')
  if (root) root.classList.toggle('dark', theme === 'dark')
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setColorScheme } = useNativeWindColorScheme()
  const systemColorScheme = useSystemColorScheme()
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system')
  const [isLoaded, setIsLoaded] = useState(false)
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(getInitialEffectiveTheme)

  const systemTheme = systemColorScheme === 'dark' ? 'dark' : 'light'

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      let saved: ThemePreference | null = null

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const v = localStorage.getItem(THEME_KEY)
        if (v === 'light' || v === 'dark' || v === 'system') saved = v
      } else {
        const v = await AsyncStorage.getItem(THEME_KEY).catch(() => null)
        if (v === 'light' || v === 'dark' || v === 'system') saved = v
      }

      if (cancelled) return

      const pref = saved ?? 'system'
      setThemePreferenceState(pref)
      setIsLoaded(true)
    }

    init()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    const effective = themePreference === 'system' ? systemTheme : themePreference
    setEffectiveTheme(effective)
    setColorScheme(effective)
    applyWebTheme(effective)
  }, [themePreference, systemTheme, isLoaded, setColorScheme])

  const setThemePreference = useCallback(
    (mode: ThemePreference) => {
      setThemePreferenceState(mode)

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.setItem(THEME_KEY, mode)
      } else {
        AsyncStorage.setItem(THEME_KEY, mode).catch(() => {})
      }
    },
    []
  )

  const value = useMemo(
    () => ({
      isDark: effectiveTheme === 'dark',
      themePreference,
      setThemePreference,
    }),
    [effectiveTheme, themePreference, setThemePreference]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}
