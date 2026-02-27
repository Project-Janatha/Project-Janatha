import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Pressable,
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Code, ArrowLeft } from 'lucide-react-native'
import { AuthInput, Logo } from '../components/ui'
import { useUser, useThemeContext } from '../components/contexts'
import { validateEmail, validatePassword } from '../utils'
import { PasswordStrength } from '../components'
import DevPanel from '../components/DevPanel'

type AuthStep = 'initial' | 'login' | 'signup'

export default function AuthScreen() {
  const router = useRouter()
  const { isDark } = useThemeContext()
  const { checkUserExists, login, signup, loading } = useUser()

  const [authStep, setAuthStep] = useState<AuthStep>('initial')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [showDevPanel, setShowDevPanel] = useState(false)

  const handleContinue = useCallback(async () => {
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
  }, [username, checkUserExists])

  const handleLogin = useCallback(async () => {
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
      const result = await login(username, password)
      if (result.success) {
        router.replace('/(tabs)')
      } else {
        setErrors({ form: result.message || 'Username or password is incorrect.' })
      }
    } catch (e: any) {
      setErrors({ form: 'Failed to connect to server. Please try again.' })
    }
  }, [username, password, login, router])

  const handleSignup = useCallback(async () => {
    setErrors({})
    if (!username) {
      setErrors({ username: 'Please enter a username.' })
      return
    }
    if (!password) {
      setErrors({ password: 'Please enter a password.' })
      return
    }
    if (!validatePassword(password).isValid) {
      setErrors({ password: 'Password does not meet complexity requirements.' })
      return
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' })
      return
    }
    try {
      const result = await signup(username, password)
      if (result.success) {
        router.replace('/onboarding')
      } else {
        setErrors({ form: result.message || 'Failed to sign up. Please try again.' })
      }
    } catch (e: any) {
      setErrors({ form: 'Failed to connect to server. Please try again.' })
    }
  }, [username, password, confirmPassword, signup, router])

  const handleSubmit = useCallback(
    (e?: any) => {
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
    },
    [authStep, handleLogin, handleSignup, handleContinue]
  )

  const handleBack = useCallback(() => {
    setAuthStep('initial')
    setPassword('')
    setConfirmPassword('')
    setErrors({})
  }, [])

  const isButtonDisabled =
    loading ||
    (authStep === 'initial' && !username) ||
    (authStep !== 'initial' && !password) ||
    (authStep === 'signup' && !confirmPassword)

  // Collect error messages to display
  const errorMessages = Object.values(errors).filter(Boolean)

  // Memoize input handlers to prevent recreation
  const handleUsernameChange = useCallback((text: string) => {
    setUsername(text)
    setErrors((prev) => ({ ...prev, username: '' }))
  }, [])

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text)
    setErrors((prev) => ({ ...prev, password: '' }))
  }, [])

  const handleConfirmPasswordChange = useCallback((text: string) => {
    setConfirmPassword(text)
    setErrors((prev) => ({ ...prev, confirmPassword: '' }))
  }, [])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 bg-[#FAFAF7] dark:bg-background-dark"
        keyboardShouldPersistTaps="handled"
      >
        {/* Main content */}
        <View
          className="flex-1 justify-center items-center w-full px-6"
          style={{
            paddingTop: 60,
            paddingBottom: 48,
          }}
        >
          {/* Container */}
          <View
            className="w-full"
            style={{ maxWidth: 400 }}
          >
            {/* Back Button */}
            {authStep !== 'initial' && (
              <TouchableOpacity
                onPress={handleBack}
                activeOpacity={0.7}
                className="flex-row items-center gap-2 mb-6 rounded-xl px-3 py-2 self-start"
                style={{ alignSelf: 'flex-start' }}
              >
                <ArrowLeft
                  size={20}
                  className={isDark ? 'text-white' : 'text-content'}
                />
                <Text className="font-inter font-medium text-content dark:text-content-dark">
                  Back
                </Text>
              </TouchableOpacity>
            )}

            {/* Janata Wordmark */}
            <Logo size={32} style={{ marginBottom: 40 }} />

            {/* Heading & Subtitle */}
            <View className="mb-8">
              <Text
                style={{ fontFamily: '"Inclusive Sans"', fontSize: 36, fontWeight: '400' }}
                className="text-content dark:text-content-dark"
              >
                {authStep === 'login'
                  ? 'Welcome back.'
                  : authStep === 'signup'
                  ? 'Join the community.'
                  : 'Welcome.'}
              </Text>

              <Text
                className="text-base font-inter mt-2"
                style={{ color: '#78716C' }}
              >
                {authStep === 'login'
                  ? 'Enter your password to continue'
                  : authStep === 'signup'
                  ? 'Create your account to get started'
                  : 'Enter your email to get started'}
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
                  secureTextEntry={false}
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
                    style={{}}
                  />
                </View>
              )}

              {authStep === 'signup' && (
                <>
                  <View>
                    <PasswordStrength password={password} show={password.length > 0} />
                    <AuthInput
                      placeholder="Password"
                      onChangeText={handlePasswordChange}
                      value={password}
                      secureTextEntry
                      autoComplete="password-new"
                      style={{}}
                    />
                  </View>
                  <View>
                    <AuthInput
                      placeholder="Confirm password"
                      onChangeText={handleConfirmPasswordChange}
                      value={confirmPassword}
                      secureTextEntry
                      autoComplete="password-new"
                      style={{}}
                    />
                  </View>
                </>
              )}

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit}
                disabled={isButtonDisabled}
                className={`items-center justify-center mt-2 rounded-lg ${
                  isButtonDisabled
                    ? 'bg-primary/40 dark:bg-primary/30'
                    : 'bg-primary active:bg-primary-press'
                } px-8`}
                style={{ height: 48 }}
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
                onPress={() => setShowDevPanel(true)}
                className="flex-row items-center justify-center bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-xl active:opacity-70"
              >
                <Code size={18} className={isDark ? 'text-white' : 'text-black'} />
                <Text className="ml-2 text-content dark:text-content-dark font-inter font-semibold">
                  Developer Mode
                </Text>
              </Pressable>
            </View>

            {/* Show DevPanel when Developer Mode is clicked */}
            {showDevPanel && (
              <DevPanel visible={showDevPanel} onClose={() => setShowDevPanel(false)} />
            )}

            {/* Footer Text */}
            <Text className="text-content dark:text-content-dark opacity-50 text-sm font-inter mt-8 text-center px-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
