import React, { useState, useContext, useEffect } from 'react'
import {
  View,
  Text,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Pressable,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Code, Moon, Sun } from 'lucide-react-native'
import { PrimaryButton, IconButton, AuthInput } from 'components/ui'
import { UserContext, useThemeContext } from 'components/contexts'

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null
  return <Text className="text-red-500 text-xs mt-1 ml-1">{message}</Text>
}

type AuthStep = 'initial' | 'login' | 'signup'

export default function AuthScreen() {
  console.log('🟢 AuthScreen component executing')

  const router = useRouter()
  const { theme, toggleTheme, isDark } = useThemeContext()
  const { checkUserExists, login, signup, setUser, loading } = useContext(UserContext)

  const [authStep, setAuthStep] = useState<AuthStep>('initial')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const isWeb = Platform.OS === 'web'

  useEffect(() => {
    console.log('=== AuthScreen Render ===')
    console.log('theme:', theme)
    console.log('isDark:', isDark)
  }, [theme, isDark])

  const handleContinue = async () => {
    console.log('🔴 === handleContinue called ===')
    console.log('🔴 Username:', username)
    setErrors({})
    if (!username) {
      console.log('🔴 No username provided')
      setErrors({ username: 'Please enter a username.' })
      return
    }
    try {
      console.log('🔴 About to call checkUserExists')
      const exists = await checkUserExists(username)
      console.log('🔴 checkUserExists returned:', exists)
      if (exists) {
        setAuthStep('login')
      } else {
        setAuthStep('signup')
      }
    } catch (e: any) {
      console.error('🔴 Error in handleContinue:', e)
      setErrors({ form: e.message || 'Failed to connect to server.' })
    }
  }

  const handleLogin = async () => {
    setErrors({})
    if (!username) {
      setErrors({ username: 'Please enter a username.' })
      return
    }
    if (!password) {
      setErrors({ password: 'Please enter your password.' })
      return
    }
    try {
      await login(username, password)
      router.replace('/(tabs)')
    } catch (e: any) {
      setErrors({ form: e.message || 'Username or password is incorrect.' })
    }
  }

  const handleSignup = async () => {
    setErrors({})
    if (!username) {
      setErrors({ username: 'Please enter a username.' })
      return
    }
    if (!password) {
      setErrors({ password: 'Please enter a password.' })
      return
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' })
      return
    }
    try {
      await signup(username, password)
      router.replace('/onboarding/step1')
    } catch (e: any) {
      setErrors({ form: e.message || 'Failed to sign up. Please try again.' })
    }
  }

  const handleSubmit = (e?: any) => {
    console.log('🔴 handleSubmit called')
    if (Platform.OS === 'web' && e) {
      e.preventDefault?.()
      e.stopPropagation?.()
    }

    if (authStep === 'login') {
      handleLogin()
    } else if (authStep === 'signup') {
      handleSignup()
    } else {
      handleContinue()
    }
  }

  const handleDevMode = () => {
    const devUser = {
      username: 'dev_user',
      id: 'dev_id',
      center: -1,
      points: 999,
      isVerified: true,
      verificationLevel: 99,
      exists: true,
      isActive: true,
      events: [],
    }
    setUser(devUser)
    router.push('/(tabs)')
  }

  const isButtonDisabled =
    loading ||
    (authStep === 'initial' && !username) ||
    (authStep !== 'initial' && !password) ||
    (authStep === 'signup' && !confirmPassword)

  const logoSize = isWeb ? 80 : 60

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 bg-background dark:bg-background-dark"
      >
        <View className={`flex-1 justify-between items-center w-full ${isWeb ? 'p-6' : 'p-2'}`}>
          {/* Top Section */}
          <View
            className={`items-center ${isWeb ? 'pt-8' : 'pt-6'} gap-4 w-full flex-1 justify-center`}
          >
            {isDark ? (
              <Image
                source={require('assets/images/chinmaya_logo_dark.svg')}
                style={{ width: logoSize, height: logoSize }}
              />
            ) : (
              <Image
                source={require('assets/images/chinmaya_logo_light.svg')}
                style={{ width: logoSize, height: logoSize }}
              />
            )}

            <Text className="text-2xl font-inter text-content dark:text-content-dark text-center">
              Log In or Sign Up
            </Text>
          </View>

          {/* Form Section */}
          {/* Make sure this is NOT wrapped in a <form> tag */}
          <View
            className={`w-full items-center flex-1 justify-center ${isWeb ? 'pb-8' : 'pb-6'} px-4`}
          >
            <View
              className={`w-full gap-3 ${
                isWeb ? 'max-w-[400px] p-6' : 'max-w-[320px] min-w-[280px] p-3'
              }`}
            >
              <FieldError message={errors.form} />

              <AuthInput placeholder="Email" onChangeText={setUsername} value={username} />
              <FieldError message={errors.username} />

              {authStep === 'login' && (
                <View className="gap-2 w-full">
                  <AuthInput
                    placeholder="Password"
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry
                    autoComplete="password"
                  />
                  <FieldError message={errors.password} />
                </View>
              )}

              {authStep === 'signup' && (
                <View className="gap-2 w-full">
                  <AuthInput
                    placeholder="Password"
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry
                    autoComplete="password-new"
                  />
                  <FieldError message={errors.password} />
                  <AuthInput
                    placeholder="Confirm password"
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    secureTextEntry
                    autoComplete="password-new"
                  />
                  <FieldError message={errors.confirmPassword} />
                </View>
              )}

              <PrimaryButton onPress={handleSubmit} disabled={isButtonDisabled}>
                {loading
                  ? 'Please wait...'
                  : authStep === 'login'
                  ? 'Log In'
                  : authStep === 'signup'
                  ? 'Sign Up'
                  : 'Continue'}
              </PrimaryButton>

              <Pressable
                onPress={handleDevMode}
                className="flex-row items-center bg-slate-600/50 text-content dark:text-content-dark px-3 py-2 rounded-full justify-center mt-4 self-center"
              >
                <Code size={16} />
                <Text className="ml-2 text-content dark:text-content-dark">Dev Mode</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
