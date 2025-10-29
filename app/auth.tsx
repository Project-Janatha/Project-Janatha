import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  Image,
  Platform,
  useColorScheme,
  ScrollView,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Code } from 'lucide-react-native'
import { PrimaryButton, AuthInput } from 'components/ui'
import { UserContext } from 'components/contexts'

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null
  return <Text className="text-red-500 text-xs mt-1 ml-1">{message}</Text>
}

type AuthStep = 'initial' | 'login' | 'signup'

export default function AuthScreen() {
  console.log('=== AUTH SCREEN RENDERING ===')
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { checkUserExists, login, signup, setUser, loading } = useContext(UserContext)
  const isWeb = Platform.OS === 'web'

  const [authStep, setAuthStep] = useState<AuthStep>('initial')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

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

  const handleSubmit = () => {
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-background">
        <View className={`flex-1 justify-between items-center w-full ${isWeb ? 'p-6' : 'p-2'}`}>
          {/* Top Section */}
          <View
            className={`items-center ${isWeb ? 'pt-8' : 'pt-6'} gap-4 w-full flex-1 justify-center`}
          >
            <Image
              source={
                isDark
                  ? require('../assets/images/chinmaya_logo_dark.svg')
                  : require('../assets/images/chinmaya_logo_light.svg')
              }
              style={{ width: isWeb ? 80 : 60, height: isWeb ? 80 : 60 }}
            />
            <Text className="text-2xl font-normal text-foreground text-center">
              Log In or Sign Up
            </Text>
          </View>

          {/* Form Section */}
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
                  />
                  <FieldError message={errors.password} />
                  <AuthInput
                    placeholder="Confirm password"
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    secureTextEntry
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
            </View>

            {/* Dev Mode Button - only show on web */}
            {isWeb && (
              <Pressable
                onPress={handleDevMode}
                className="flex-row items-center gap-2 mt-4 px-4 py-2 bg-secondary rounded-lg active:opacity-80"
              >
                <Code size={18} color="currentColor" className="text-foreground" />
                <Text className="text-foreground">Dev Mode</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
