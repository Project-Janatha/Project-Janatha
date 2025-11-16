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
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Code, Moon, Sun, ArrowLeft, Monitor } from 'lucide-react-native'
import { PrimaryButton, IconButton, AuthInput } from 'components/ui'
import { UserContext, useThemeContext } from 'components/contexts'
import { validateEmail, validatePassword } from 'frontend/utilities'

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null
  return <Text className="text-red-500 text-sm mt-1 ml-1 font-inter">{message}</Text>
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

  const [backHover, setBackHover] = useState(false)

  const isWeb = Platform.OS === 'web'

  // Theme selector logic (copied from SettingsPanel)
  const themeOptions = ['light', 'dark', 'system']
  const optionWidth = 70
  const indicatorPadding = 8
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

  const handleContinue = async () => {
    setErrors({})
    if (!username) {
      setErrors({ username: 'Please enter a username.' })
      return
    }
    if (!validateEmail(username)) {
      setErrors({ username: 'You must enter a valid email address.' })
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
      setErrors({ form: 'Username or password is incorrect.' })
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
    setBackHover(false)
  }

  const isButtonDisabled =
    loading ||
    (authStep === 'initial' && !username) ||
    (authStep !== 'initial' && !password) ||
    (authStep === 'signup' && !confirmPassword)

  const logoSize = isWeb ? 100 : 80

  // Collect error messages to display
  const errorMessages = Object.values(errors).filter(Boolean)

  // Email input
  const handleUsernameChange = (text: string) => {
    setUsername(text)
    setErrors((prev) => ({ ...prev, username: '' }))
  }

  // Password input
  const handlePasswordChange = (text: string) => {
    setPassword(text)
    setErrors((prev) => ({ ...prev, password: '' }))
  }

  // Confirm password input
  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text)
    setErrors((prev) => ({ ...prev, confirmPassword: '' }))
  }

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
        {/* Theme Toggle - Fixed at top center */}
        <View
          className="fixed left-1/2 -translate-x-1/2 top-6 z-10 w-[226px]"
          style={{
            position: 'fixed',
            left: '50%',
            transform: [{ translateX: -113 }], // half of 226px
            top: 24,
            zIndex: 10,
            width: 226,
          }}
        >
          <View
            className="relative flex-row bg-gray-100 dark:bg-neutral-800 rounded-lg p-1"
            style={{ width: optionWidth * themeOptions.length + indicatorPadding }}
          >
            {/* Sliding indicator */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 4,
                left: 4,
                width: optionWidth - 8 + indicatorPadding,
                height: 32,
                borderRadius: 6,
                backgroundColor: isDark ? '#3f3f46' : '#e5e7eb',
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

        {/* Main content - card expands downward, always below the fixed controls */}
        <View
          className="flex-1 justify-center items-center w-full px-6"
          style={{
            marginTop: 80, // ensures card starts below the fixed controls
            paddingBottom: 48,
          }}
        >
          {/* Card Container */}
          <View
            className={`w-full ${
              isWeb ? 'max-w-[380px]' : 'max-w-[380px]'
            } bg-card dark:bg-card-dark rounded-3xl shadow-md p-8 ${isWeb ? 'py-12' : 'py-10'}`}
          >
            {/* Back Button */}
            {authStep !== 'initial' && (
              <TouchableOpacity
                onPress={handleBack}
                activeOpacity={0.7}
                {...(isWeb && {
                  onMouseEnter: () => setBackHover(true),
                  onMouseLeave: () => setBackHover(false),
                })}
                className={`flex-row items-center gap-2 mb-6 rounded-xl px-3 py-2 transition-colors duration-150 self-start ${
                  backHover ? 'bg-gray-100 dark:bg-neutral-800' : ''
                }`}
                style={{ alignSelf: 'flex-start' }}
              >
                <ArrowLeft
                  size={20}
                  className={backHover ? 'text-primary' : isDark ? 'text-white' : 'text-content'}
                />
                <Text
                  className={`font-inter font-medium ${
                    backHover ? 'text-primary' : 'text-content dark:text-content-dark'
                  }`}
                >
                  Back
                </Text>
              </TouchableOpacity>
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
            {errorMessages.length > 0 && (
              <View className="w-full font-inter bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 mb-4">
                {errorMessages.map((msg, idx) => (
                  <Text key={idx} className="text-red-500 text-sm font-inter">
                    {msg}
                  </Text>
                ))}
              </View>
            )}

            <View className="gap-4">
              <View>
                <AuthInput
                  placeholder="Email"
                  onChangeText={handleUsernameChange}
                  value={username}
                  editable={authStep === 'initial'}
                />
              </View>

              {authStep === 'login' && (
                <View>
                  <AuthInput
                    placeholder="Password"
                    onChangeText={handlePasswordChange}
                    value={password}
                    secureTextEntry
                    autoComplete="password"
                  />
                </View>
              )}

              {authStep === 'signup' && (
                <>
                  <View>
                    <AuthInput
                      placeholder="Password"
                      onChangeText={handlePasswordChange}
                      value={password}
                      secureTextEntry
                      autoComplete="password-new"
                    />
                  </View>
                  <View>
                    <AuthInput
                      placeholder="Confirm password"
                      onChangeText={handleConfirmPasswordChange}
                      value={confirmPassword}
                      secureTextEntry
                      autoComplete="password-new"
                    />
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
                <Code size={18} className={isDark ? 'text-white' : 'text-black'} />
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
