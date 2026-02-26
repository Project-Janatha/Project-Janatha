import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { Card } from '../components/ui'
import { useUser, useThemeContext } from '../components/contexts'
import { validateEmail, validatePassword } from '../utils'

type AuthStep = 'initial' | 'login' | 'signup'

export default function AuthScreenNative() {
  const router = useRouter()
  const { isDark } = useThemeContext()
  const { checkUserExists, login, signup, loading } = useUser()

  const [authStep, setAuthStep] = useState<AuthStep>('initial')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const isButtonDisabled = loading ||
    (authStep === 'initial' && !username) ||
    (authStep !== 'initial' && !password) ||
    (authStep === 'signup' && !confirmPassword)

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
    } catch {
      setAuthStep('login')
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
      if (!result.success) {
        setErrors({ form: result.message || 'Username or password is incorrect.' })
      }
    } catch {
      setErrors({ form: 'Failed to connect to server. Please try again.' })
    }
  }, [username, password, login])

  const handleSignup = useCallback(async () => {
    setErrors({})
    if (!username) {
      setErrors({ username: 'Please enter a username.' })
      return
    }
    if (!password) {
      setErrors({ password: 'Please enter your password.' })
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
    } catch {
      setErrors({ form: 'Failed to connect to server. Please try again.' })
    }
  }, [username, password, confirmPassword, signup, router])

  const handleSubmit = useCallback(() => {
    if (authStep === 'login') {
      handleLogin()
    } else if (authStep === 'signup') {
      handleSignup()
    } else {
      handleContinue()
    }
  }, [authStep, handleLogin, handleSignup, handleContinue])

  const handleBack = useCallback(() => {
    setAuthStep('initial')
    setPassword('')
    setConfirmPassword('')
    setErrors({})
  }, [])

  const textColor = isDark ? '#fff' : '#000'
  const inputBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, paddingTop: 80 }}>
          <Card size="lg" padding="none" style={{ width: '100%', maxWidth: 380, padding: 24 }}>
            {authStep !== 'initial' && (
              <Pressable
                onPress={handleBack}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}
              >
                <ArrowLeft size={20} color={textColor} />
                <Text style={{ marginLeft: 8, color: textColor }}>Back</Text>
              </Pressable>
            )}

            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <Image
                source={isDark 
                  ? require('../assets/images/chinmaya_logo_dark.svg')
                  : require('../assets/images/chinmaya_logo_light.svg')
                }
                style={{ width: 80, height: 80, marginBottom: 16 }}
              />
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '600',
                color: textColor 
              }}>
                {authStep === 'login' ? 'Welcome Back' : authStep === 'signup' ? 'Create Account' : 'Get Started'}
              </Text>
              <Text style={{ 
                fontSize: 14, 
                marginTop: 8, 
                opacity: 0.7,
                color: textColor 
              }}>
                {authStep === 'login' ? 'Sign in to continue' : authStep === 'signup' ? 'Create your account' : 'Sign in or create an account'}
              </Text>
            </View>

            <View style={{ marginBottom: 16 }}>
              {authStep === 'initial' ? (
                <>
                  <Text style={{ fontSize: 14, marginBottom: 8, color: textColor }}>Email</Text>
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={{
                      backgroundColor: inputBg,
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      marginBottom: 16,
                      color: textColor,
                    }}
                  />
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 14, marginBottom: 8, color: textColor }}>Email</Text>
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={authStep === 'initial'}
                    style={{
                      backgroundColor: inputBg,
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      marginBottom: 16,
                      color: textColor,
                      opacity: authStep === 'initial' ? 1 : 0.6,
                    }}
                  />

                  <Text style={{ fontSize: 14, marginBottom: 8, color: textColor }}>Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    style={{
                      backgroundColor: inputBg,
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      marginBottom: 16,
                      color: textColor,
                    }}
                  />

                  {authStep === 'signup' && (
                    <>
                      <Text style={{ fontSize: 14, marginBottom: 8, color: textColor }}>Confirm Password</Text>
                      <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm your password"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry
                        style={{
                          backgroundColor: inputBg,
                          borderRadius: 8,
                          padding: 12,
                          fontSize: 16,
                          color: textColor,
                        }}
                      />
                    </>
                  )}
                </>
              )}
            </View>

            {errors.username && (
              <Text style={{ color: 'red', fontSize: 12, marginBottom: 8 }}>{errors.username}</Text>
            )}
            {errors.password && (
              <Text style={{ color: 'red', fontSize: 12, marginBottom: 8 }}>{errors.password}</Text>
            )}
            {errors.confirmPassword && (
              <Text style={{ color: 'red', fontSize: 12, marginBottom: 8 }}>{errors.confirmPassword}</Text>
            )}
            {errors.form && (
              <Text style={{ color: 'red', fontSize: 12, marginBottom: 8 }}>{errors.form}</Text>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={isButtonDisabled}
              style={{
                backgroundColor: isButtonDisabled ? '#ea580c50' : '#ea580c',
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 12,
                alignItems: 'center',
                marginTop: 16,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                  {authStep === 'login' ? 'Log In' : authStep === 'signup' ? 'Sign Up' : 'Continue'}
                </Text>
              )}
            </Pressable>

            {authStep === 'login' && (
              <Pressable style={{ alignItems: 'center', marginTop: 16 }}>
                <Text style={{ color: '#ea580c', fontSize: 14 }}>Forgot password?</Text>
              </Pressable>
            )}

            <Text style={{ 
              textAlign: 'center', 
              marginTop: 32, 
              fontSize: 12, 
              opacity: 0.5,
              color: textColor 
            }}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
