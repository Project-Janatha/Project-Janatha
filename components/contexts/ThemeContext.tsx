import React, { createContext, useContext, useState, useEffect } from 'react'
import { useColorScheme as useDeviceColorScheme } from 'react-native'
import { useColorScheme } from 'nativewind'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  toggleTheme: () => {},
  isDark: false,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme()
  const { setColorScheme } = useColorScheme()
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  // Calculate actual dark mode state
  const isDark = theme === 'system' ? deviceColorScheme === 'dark' : theme === 'dark'

  // Load saved theme on mount
  useEffect(() => {
    AsyncStorage.getItem('theme').then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setTheme(saved as Theme)
      }
      setMounted(true)
    })
  }, [])

  // Save theme when it changes (but don't save 'system')
  useEffect(() => {
    if (mounted && theme !== 'system') {
      AsyncStorage.setItem('theme', theme)
    }
  }, [theme, mounted])

  // Sync with NativeWind - this is the critical part
  useEffect(() => {
    const colorScheme = isDark ? 'dark' : 'light'
    console.log('🎨 Setting NativeWind color scheme to:', colorScheme)
    setColorScheme(colorScheme)
  }, [isDark, setColorScheme])

  const toggleTheme = () => {
    const newTheme =
      theme === 'dark' || (theme === 'system' && deviceColorScheme === 'dark') ? 'light' : 'dark'

    console.log('🔄 Toggling theme from', theme, 'to', newTheme)
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>{children}</ThemeContext.Provider>
  )
}

export const useThemeContext = () => useContext(ThemeContext)
