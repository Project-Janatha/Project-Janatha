import { useColorScheme as useNativeWindColorScheme } from 'nativewind'
import { useColorScheme as useSystemColorScheme } from 'react-native'
import { useEffect } from 'react'

// Provider that initializes theme from system
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useSystemColorScheme()
  const { colorScheme, setColorScheme } = useNativeWindColorScheme()

  // Initialize NativeWind theme from system on app start
  useEffect(() => {
    console.log('🟣 ThemeProvider initialized - systemScheme:', systemScheme, 'colorScheme:', colorScheme)
    if (!colorScheme && systemScheme) {
      console.log('🟣 Setting initial theme to:', systemScheme)
      setColorScheme(systemScheme as 'light' | 'dark')
    }
  }, [systemScheme])

  return <>{children}</>
}

// Re-export NativeWind's hook with a custom name to match your existing code
export const useThemeContext = () => {
  const systemScheme = useSystemColorScheme()
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativeWindColorScheme()
  
  return {
    theme: colorScheme || systemScheme || 'light',
    isDark: (colorScheme || systemScheme) === 'dark',
    toggleTheme: toggleColorScheme,
    setTheme: setColorScheme,
  }
}
