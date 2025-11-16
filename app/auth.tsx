import React, { useState, useContext, useEffect, useRef } from 'react'
import {
  View,
  Text,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Pressable,
  Image,
  Animated,
  Easing,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Code, Moon, Sun, ArrowLeft, Monitor } from 'lucide-react-native'
import { PrimaryButton, IconButton, AuthInput } from 'components/ui'
import { UserContext, useThemeContext } from 'components/contexts'

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null
  return <Text className="text-red-500 text-sm mt-1 ml-1 font-medium">{message}</Text>
}

type AuthStep = 'initial' | 'login' | 'signup'

export default function AuthScreen() {
  console.log('🟢 AuthScreen component executing')

  const router = useRouter()
  const { theme, toggleTheme, themePreference, setThemePreference, isDark } = useThemeContext()
  const { checkUserExists, login, signup, setUser, loading } = useContext(UserContext)

  const [authStep, setAuthStep] = useState<AuthStep>('initial')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const isWeb = Platform.OS === 'web'

  const themeOptions = ['light', 'dark', 'system']
  const optionWidth = 70
  const indicatorPadding = 8 // Extra padding on the right side
  const [selectedIndex, setSelectedIndex] = useState(themeOptions.indexOf(themePreference))
  const slideAnim = useRef(new Animated.Value(selectedIndex * optionWidth)).current

  useEffect(() => {
    const idx = themeOptions.indexOf(themePreference)
    setSelectedIndex(idx)
    Animated.timing(slideAnim, {
      toValue: idx * optionWidth,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start()
  }, [themePreference])

  // useEffect(() => {
  //   console.log('=== AuthScreen Render ===')
  //   console.log('theme:', theme)
  //   console.log('isDark:', isDark)
  // }, [theme, isDark])

  const handleContinue = async () => {
    setErrors({})
    if (!username) {
      setErrors({ username: 'Please enter a username.' })
      return
    }
    try {
      const exists = await checkUserExists(username)
      if (exists) {
        setAuthStep('login')
      } else {
        setAuthStep('signup')
      }
    } catch (e: any) {
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

  const handleBack = () => {
    setAuthStep('initial')
    setPassword('')
    setConfirmPassword('')
    setErrors({})
  }

  const isButtonDisabled =
    loading ||
    (authStep === 'initial' && !username) ||
    (authStep !== 'initial' && !password) ||
    (authStep === 'signup' && !confirmPassword)

  const logoSize = isWeb ? 100 : 80

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 bg-background dark:bg-background-dark"
        keyboardShouldPersistTaps="handled"
      >
        {/* Theme Toggle - Top Center, with sliding animation */}
        <View className="absolute top-6 left-0 right-0 z-10 flex items-center">
          <View className="relative flex-row bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
            {/* Sliding indicator */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 4,
                left: 4,
                width: optionWidth - 8 + indicatorPadding,
                height: 32,
                borderRadius: 6,
                backgroundColor: isDark ? '#3f3f46' : '#e5e7eb', // zinc-700 : gray-200
                transform: [{ translateX: slideAnim }],
              }}
            />

            {/* Theme options */}
            {themeOptions.map((option, idx) => (
              <Pressable
                key={option}
                onPress={() => setThemePreference(option)}
                className="flex-row items-center justify-center gap-1 py-2 px-3 rounded-md z-10"
                style={{ width: optionWidth }}
              >
                {option === 'light' && (
                  <Sun
                    size={14}
                    color={themePreference === option ? '#f97316' : isDark ? '#fff' : '#000'}
                  />
                )}
                {option === 'dark' && (
                  <Moon
                    size={14}
                    color={themePreference === option ? '#f97316' : isDark ? '#fff' : '#000'}
                  />
                )}
                {option === 'system' && (
                  <Monitor
                    size={14}
                    color={themePreference === option ? '#f97316' : isDark ? '#fff' : '#000'}
                  />
                )}
                <Text
                  className={`text-xs font-inter ${
                    themePreference === option
                      ? 'text-primary font-inter-semibold'
                      : 'text-gray-700 dark:text-white'
                  }`}
                >
                  {option === 'system' ? 'Auto' : option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Main content ... */}
        <View className="flex-1 justify-center items-center w-full px-6 py-12">
          {/* Card Container */}
          <View
            className={`w-full ${
              isWeb ? 'max-w-[480px]' : 'max-w-[380px]'
            } bg-card dark:bg-card-dark rounded-3xl shadow-2xl p-8 ${isWeb ? 'py-12' : 'py-10'}`}
          >
            {/* Back Button */}
            {authStep !== 'initial' && (
              <Pressable
                onPress={handleBack}
                className="flex-row items-center gap-2 mb-6 active:opacity-70"
              >
                <ArrowLeft size={20} color={isDark ? '#fff' : '#000'} />
                <Text className="text-content dark:text-content-dark font-inter font-medium">
                  Back
                </Text>
              </Pressable>
            )}

            {/* Logo & Title */}
            <View className="items-center mb-8">
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

              <Text className="text-3xl font-inter font-bold text-content dark:text-content-dark text-center mt-6">
                {authStep === 'login'
                  ? 'Welcome Back'
                  : authStep === 'signup'
                  ? 'Create Account'
                  : 'Get Started'}
              </Text>

              <Text className="text-base font-inter text-content dark:text-content-dark opacity-70 text-center mt-2">
                {authStep === 'login'
                  ? 'Enter your password to continue'
                  : authStep === 'signup'
                  ? 'Set up your new account'
                  : 'Enter your email to continue'}
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4">
              {errors.form && (
                <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <FieldError message={errors.form} />
                </View>
              )}

              <View>
                <AuthInput
                  placeholder="Email"
                  onChangeText={setUsername}
                  value={username}
                  editable={authStep === 'initial'}
                />
                <FieldError message={errors.username} />
              </View>

              {authStep === 'login' && (
                <View>
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
                <>
                  <View>
                    <AuthInput
                      placeholder="Password"
                      onChangeText={setPassword}
                      value={password}
                      secureTextEntry
                      autoComplete="password-new"
                    />
                    <FieldError message={errors.password} />
                  </View>
                  <View>
                    <AuthInput
                      placeholder="Confirm password"
                      onChangeText={setConfirmPassword}
                      value={confirmPassword}
                      secureTextEntry
                      autoComplete="password-new"
                      placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                    />
                    <FieldError message={errors.confirmPassword} />
                  </View>
                </>
              )}

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit}
                disabled={isButtonDisabled}
                className={`items-center justify-center mt-2 rounded-2xl ${
                  isButtonDisabled
                    ? 'bg-primary/40 dark:bg-primary/30'
                    : 'bg-primary active:bg-primary-press hover:scale-105 hovershadow-md transition-transform duration-150'
                } py-4 px-8`}
              >
                <Text className="text-white font-inter font-bold text-md">
                  {loading
                    ? 'Please wait...'
                    : authStep === 'login'
                    ? 'Log In'
                    : authStep === 'signup'
                    ? 'Sign Up'
                    : 'Continue'}
                </Text>
              </Pressable>

              {/* Forgot Password (only on login) */}
              {authStep === 'login' && (
                <Pressable className="items-center mt-2">
                  <Text className="text-primary font-inter font-medium">Forgot password?</Text>
                </Pressable>
              )}
            </View>

            {/* Dev Mode Button */}
            <View className="mt-8 pt-6 border-t border-borderColor dark:border-borderColor-dark">
              <Pressable
                onPress={handleDevMode}
                className="flex-row items-center justify-center bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-xl active:opacity-70"
              >
                <Code size={18} color={isDark ? '#fff' : '#000'} />
                <Text className="ml-2 text-content dark:text-content-dark font-inter font-semibold">
                  Developer Mode
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Footer Text */}
          <Text className="text-content dark:text-content-dark opacity-50 text-sm font-inter mt-8 text-center px-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
