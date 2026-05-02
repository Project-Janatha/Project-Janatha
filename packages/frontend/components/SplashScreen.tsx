import React, { useEffect, useRef } from 'react'
import { StyleSheet, View, Image, Text } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { useTheme } from './contexts'

const LOGO_SIZE = 100
const SCALE_FACTOR = 2.5

// Tune these to taste
const ENTRANCE_DURATION = 500
const HOLD_DURATION = 900
const EXIT_DURATION = 600

const splashLogo = require('../assets/images/splash.png')

interface SplashScreenProps {
  visible: boolean
  onDismiss: () => void
}

export default function SplashScreen({ visible, onDismiss }: SplashScreenProps) {
  const { isDark } = useTheme()
  const dismissed = useRef(false)
  const animationStarted = useRef(false)

  const bgOpacity = useSharedValue(0)
  const logoScale = useSharedValue(0.3)
  const logoOpacity = useSharedValue(0)
  const glowOpacity = useSharedValue(0)
  const glowScale = useSharedValue(0.6)
  const textOpacity = useSharedValue(0)
  const textTranslateY = useSharedValue(12)
  const progressWidth = useSharedValue(0)

  useEffect(() => {
    if (!visible || animationStarted.current) return
    animationStarted.current = true
    dismissed.current = false

    // Reset all values
    bgOpacity.value = 0
    logoScale.value = 0.3
    logoOpacity.value = 0
    glowOpacity.value = 0
    glowScale.value = 0.6
    textOpacity.value = 0
    textTranslateY.value = 12
    progressWidth.value = 0

    // ── Phase 1: Entrance ────────────────────────────────
    bgOpacity.value = withTiming(1, { duration: 300 })

    logoScale.value = withTiming(1, {
      duration: ENTRANCE_DURATION,
      easing: Easing.out(Easing.back(1.3)),
    })
    logoOpacity.value = withTiming(1, {
      duration: ENTRANCE_DURATION,
      easing: Easing.out(Easing.cubic),
    })

    // Glow blooms in just after logo
    glowOpacity.value = withDelay(150, withTiming(1, { duration: 400 }))
    glowScale.value = withDelay(
      150,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      })
    )

    // Text slides up
    textOpacity.value = withDelay(280, withTiming(1, { duration: 380 }))
    textTranslateY.value = withDelay(
      280,
      withTiming(0, {
        duration: 380,
        easing: Easing.out(Easing.cubic),
      })
    )

    // Progress bar fills across hold + a bit of exit
    progressWidth.value = withDelay(
      350,
      withTiming(100, {
        duration: HOLD_DURATION + EXIT_DURATION * 0.4,
        easing: Easing.inOut(Easing.cubic),
      })
    )

    // ── Phase 2 → 3: Hold, then Exit ────────────────────
    const exitStart = ENTRANCE_DURATION + HOLD_DURATION

    logoScale.value = withDelay(
      exitStart,
      withTiming(SCALE_FACTOR, {
        duration: EXIT_DURATION,
        easing: Easing.in(Easing.cubic),
      })
    )
    logoOpacity.value = withDelay(
      exitStart,
      withTiming(0, {
        duration: EXIT_DURATION,
        easing: Easing.in(Easing.cubic),
      })
    )
    glowOpacity.value = withDelay(exitStart, withTiming(0, { duration: EXIT_DURATION * 0.5 }))
    textOpacity.value = withDelay(exitStart, withTiming(0, { duration: EXIT_DURATION * 0.4 }))
    bgOpacity.value = withDelay(
      exitStart + EXIT_DURATION * 0.5,
      withTiming(0, {
        duration: EXIT_DURATION * 0.5,
      })
    )

    const timeout = setTimeout(() => {
      if (!dismissed.current) {
        dismissed.current = true
        onDismiss()
      }
    }, exitStart + EXIT_DURATION)

    return () => clearTimeout(timeout)
  }, [visible])

  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }))
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }))
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }))
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }))
  const progressStyle = useAnimatedStyle(() => ({ width: `${progressWidth.value}%` }))

  if (!visible) return null

  const bg = isDark ? '#0f0f0f' : '#ffffff'
  const glowColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'
  const nameColor = isDark ? '#ffffff' : '#111111'
  const taglineColor = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.32)'
  const trackColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
  const fillColor = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.18)'

  return (
    <Animated.View style={[styles.container, { backgroundColor: bg }, bgStyle]}>
      {/* Logo + glow */}
      <View style={styles.logoWrapper}>
        <Animated.View style={[styles.glow, { backgroundColor: glowColor }, glowStyle]} />
        <Animated.View style={logoStyle}>
          <Image source={splashLogo} style={styles.logo} resizeMode="contain" />
        </Animated.View>
      </View>

      {/* Brand copy */}
      <Animated.View style={[styles.textWrapper, textStyle]}>
        <Text style={[styles.appName, { color: nameColor }]}>YourApp</Text>
        <Text style={[styles.tagline, { color: taglineColor }]}>Your tagline here</Text>
      </Animated.View>

      {/* Thin progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[styles.progressFill, { backgroundColor: fillColor }, progressStyle]}
        />
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: LOGO_SIZE * 2.2,
    height: LOGO_SIZE * 2.2,
    borderRadius: LOGO_SIZE * 1.1,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  textWrapper: {
    alignItems: 'center',
    marginTop: 28,
  },
  appName: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  tagline: {
    fontSize: 13,
    marginTop: 5,
    letterSpacing: 0.25,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 52,
    left: 48,
    right: 48,
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
})
