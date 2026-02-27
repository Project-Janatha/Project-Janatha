import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useUser } from '../components/contexts'
import { validateEmail, validatePassword } from '../utils'
import PasswordStrength from '../components/PasswordStrength'
import { ImageCarousel } from '../components/auth/ImageCarousel'
import DevPanel from '../components/DevPanel'
import swamiChinmayanandaJpg from '../assets/images/landing/Swami Chinmayananda.jpg'
import swamiChinmayanandaAlt from '../assets/images/landing/Swami Chinmayananda (1).jpg'
import swamiChinmayanandaOption2 from '../assets/images/landing/Swami Chinmayananda Option 2.jpeg'
import Logo from '../components/ui/Logo'

// Inject CSS for placeholder and hover styles (web only)
if (typeof document !== 'undefined') {
  const id = 'auth-web-styles'
  if (!document.getElementById(id)) {
    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      .auth-input::placeholder { color: #9CA3AF; }
      .auth-input:disabled { opacity: 0.6; cursor: not-allowed; }
      .auth-submit:hover:not(:disabled) { background-color: #B91C1C !important; }
    `
    document.head.appendChild(style)
  }
}

type AuthStep = 'initial' | 'login' | 'signup'

const AUTH_CAROUSEL_IMAGES = [
  swamiChinmayanandaJpg,
  swamiChinmayanandaAlt,
  swamiChinmayanandaOption2,
]

export default function AuthScreen() {
  const router = useRouter()
  const { checkUserExists, login, signup, loading } = useUser()

  const [authStep, setAuthStep] = useState<AuthStep>('initial')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showDevPanel, setShowDevPanel] = useState(false)

  // Focus state for input styling
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // --- Auth Handlers (same logic as auth.tsx) ---

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
      if (e) {
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

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    setErrors((prev) => ({ ...prev, username: '' }))
  }, [])

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setErrors((prev) => ({ ...prev, password: '' }))
  }, [])

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
    setErrors((prev) => ({ ...prev, confirmPassword: '' }))
  }, [])

  const isButtonDisabled =
    loading ||
    (authStep === 'initial' && !username) ||
    (authStep !== 'initial' && !password) ||
    (authStep === 'signup' && !confirmPassword)

  const errorMessages = Object.values(errors).filter(Boolean)

  // --- Input style helpers ---

  const baseInputStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    border: '1px solid #D6D3D1',
    borderRadius: 8,
    padding: '0 16px',
    fontSize: 16,
    fontFamily: 'Inter, sans-serif',
    color: '#1C1917',
    backgroundColor: '#FAFAF7',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const focusInputStyle: React.CSSProperties = {
    borderColor: '#C2410C',
    boxShadow: '0 0 0 3px rgba(194,65,12,0.1)',
    backgroundColor: '#FFFFFF',
  }

  const getInputStyle = (focused: boolean): React.CSSProperties => ({
    ...baseInputStyle,
    ...(focused ? focusInputStyle : {}),
  })

  // --- Heading and subtitle per step ---

  const heading =
    authStep === 'login' ? 'Welcome back.' : authStep === 'signup' ? 'Join the community.' : 'Welcome.'

  const subtitle =
    authStep === 'login'
      ? 'Enter your password to continue'
      : authStep === 'signup'
      ? 'Create your account to get started'
      : 'Enter your email to get started'

  const buttonText = loading
    ? 'Please wait...'
    : authStep === 'login'
    ? 'Sign In'
    : authStep === 'signup'
    ? 'Create Account'
    : 'Continue'
  const isNarrowWeb = viewportWidth < 1024

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isNarrowWeb ? 'column' : 'row',
        minHeight: '100vh',
        backgroundColor: '#FAFAF7',
      }}
    >
      {/* Left: Image Carousel */}
      {!isNarrowWeb && (
        <div style={{ width: '50%', position: 'relative' }}>
          <ImageCarousel images={AUTH_CAROUSEL_IMAGES} />
        </div>
      )}

      {/* Right: Form */}
      <div
        style={{
          width: isNarrowWeb ? '100%' : '50%',
          backgroundColor: '#FAFAF7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          padding: isNarrowWeb ? '32px 20px' : 0,
        }}
      >
        <div style={{ maxWidth: 400, width: '100%', padding: isNarrowWeb ? 0 : '0 48px' }}>
          {/* Back button (login/signup steps) */}
          {authStep !== 'initial' && (
            <button
              onClick={handleBack}
              style={{
                color: '#78716C',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0,
                marginBottom: 24,
              }}
            >
              &larr; Back
            </button>
          )}

          {/* Janata logo */}
          <div style={{ marginBottom: 48 }}>
            <Logo size={32} />
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: '"Inclusive Sans", sans-serif',
              fontSize: isNarrowWeb ? 32 : 36,
              fontWeight: '400',
              color: '#1C1917',
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            {heading}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 16,
              color: '#78716C',
              marginBottom: 32,
              marginTop: 0,
            }}
          >
            {subtitle}
          </p>

          {/* Error alert box */}
          {errorMessages.length > 0 && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 16,
              }}
            >
              {errorMessages.map((msg, idx) => (
                <p
                  key={idx}
                  style={{
                    color: '#EF4444',
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                    margin: 0,
                  }}
                >
                  {msg}
                </p>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email input */}
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={username}
              onChange={handleUsernameChange}
              disabled={authStep !== 'initial'}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              style={getInputStyle(emailFocused)}
            />

            {/* Password input (login) */}
            {authStep === 'login' && (
              <input
                className="auth-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="current-password"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                style={getInputStyle(passwordFocused)}
              />
            )}

            {/* Password + PasswordStrength + Confirm (signup) */}
            {authStep === 'signup' && (
              <>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  style={getInputStyle(passwordFocused)}
                />

                <PasswordStrength password={password} show={password.length > 0} />

                <input
                  className="auth-input"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  autoComplete="new-password"
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  style={getInputStyle(confirmPasswordFocused)}
                />
              </>
            )}

            {/* Submit button */}
            <button
              className="auth-submit"
              type="submit"
              disabled={isButtonDisabled}
              style={{
                width: '100%',
                height: 48,
                backgroundColor: '#C2410C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500',
                cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
                marginTop: 8,
                opacity: isButtonDisabled ? 0.4 : 1,
              }}
            >
              {buttonText}
            </button>
          </form>

          {/* Toggle links */}
          {authStep === 'initial' && (
            <p
              style={{
                fontSize: 14,
                color: '#78716C',
                textAlign: 'center',
                marginTop: 16,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Don't have an account?{' '}
              <span
                onClick={() => {
                  if (!username) {
                    setErrors({ username: 'Please enter your email first.' })
                    return
                  }
                  if (!validateEmail(username)) {
                    setErrors({ username: 'You must enter a valid email address.' })
                    return
                  }
                  setAuthStep('signup')
                }}
                style={{ color: '#C2410C', cursor: 'pointer' }}
              >
                Create one
              </span>
            </p>
          )}

          {authStep === 'login' && (
            <p
              style={{
                fontSize: 14,
                color: '#78716C',
                textAlign: 'center',
                marginTop: 16,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <span style={{ color: '#C2410C', cursor: 'pointer' }}>Forgot password?</span>
            </p>
          )}

          {/* Footer text */}
          <p
            style={{
              fontSize: 13,
              color: '#A8A29E',
              textAlign: 'center',
              marginTop: 32,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>

          {/* Developer Mode button */}
          <button
            onClick={() => setShowDevPanel(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: '#F5F5F4',
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              marginTop: 24,
              width: '100%',
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
              color: '#57534E',
            }}
          >
            <span style={{ fontFamily: 'monospace', fontSize: 16 }}>&lt;/&gt;</span>
            Developer Mode
          </button>

          {/* DevPanel */}
          {showDevPanel && (
            <DevPanel visible={showDevPanel} onClose={() => setShowDevPanel(false)} />
          )}
        </div>
      </div>
    </div>
  )
}
