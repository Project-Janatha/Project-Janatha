// theme.tsx
import { useColorScheme } from 'nativewind'
import { useCallback, useContext, useEffect, useMemo, useRef, useState, createContext } from 'react'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: ResolvedTheme
  preference: ThemePreference
  setPreference: (pref: ThemePreference) => void
  isDark: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = '@theme'
const isWeb = Platform.OS === 'web'

// ─── Storage helpers ──────────────────────────────────────────────────────────

function storageRead(): ThemePreference {
  if (isWeb && typeof window !== 'undefined') {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  }
  return 'system'
}

function storageWrite(pref: ThemePreference): void {
  if (isWeb && typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, pref)
  } else {
    AsyncStorage.setItem(STORAGE_KEY, pref).catch(() => {})
  }
}

// ─── Web DOM helper ───────────────────────────────────────────────────────────

function applyToDOM(theme: ResolvedTheme): void {
  if (!isWeb || typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme()
  const [preference, setPreferenceState] = useState<ThemePreference>(storageRead)
  const preferenceRef = useRef(preference)

  useEffect(() => {
    preferenceRef.current = preference
  }, [preference])

  // ── On native: hydrate from AsyncStorage (web is sync via localStorage) ───
  useEffect(() => {
    if (isWeb) return
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'system') setPreferenceState(v)
      })
      .catch(() => {})
  }, [])

  // ── Apply to DOM on web ────────────────────────────────────────────────────
  useEffect(() => {
    if (isWeb && colorScheme) {
      applyToDOM(colorScheme)
    }
  }, [colorScheme])

  // ── Sync preference → NativeWind (including 'system' to follow OS) ───────
  useEffect(() => {
    setColorScheme(preference)
  }, [preference, setColorScheme])

  // ── Public setter: update state + persist ─────────────────────────────────
  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref)
    storageWrite(pref)
  }, [])

  // NativeWind's colorScheme is already the resolved OS-followed value when preference is 'system'
  const theme: ResolvedTheme = colorScheme ?? 'light'
  const isDark = theme === 'dark'

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, preference, setPreference, isDark }),
    [theme, preference, setPreference]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}