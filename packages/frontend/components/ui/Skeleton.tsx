import { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet, type ViewStyle } from 'react-native'
import { useTheme } from '../contexts'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

function SkeletonBox({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const { isDark } = useTheme()
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: isDark ? '#2e2e2e' : '#d6d3d1',
          opacity,
        },
        style,
      ]}
    />
  )
}

export function EventCardSkeleton() {
  const { isDark } = useTheme()
  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.cardBody}>
        <SkeletonBox width="60%" height={14} />
        <SkeletonBox width="40%" height={12} style={{ marginTop: 8 }} />
        <SkeletonBox width="80%" height={12} style={{ marginTop: 8 }} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <SkeletonBox width={28} height={28} borderRadius={14} />
          <SkeletonBox width={28} height={28} borderRadius={14} />
          <SkeletonBox width={28} height={28} borderRadius={14} />
        </View>
      </View>
    </View>
  )
}

export function CenterCardSkeleton() {
  const { isDark } = useTheme()
  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.cardBody}>
        <SkeletonBox width="50%" height={14} />
        <SkeletonBox width="70%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  )
}

export function DiscoverListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={{ gap: 8, paddingTop: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i}>{i % 3 === 2 ? <CenterCardSkeleton /> : <EventCardSkeleton />}</View>
      ))}
    </View>
  )
}

export function DetailSkeleton() {
  return (
    <View style={{ padding: 20, gap: 16 }}>
      <SkeletonBox width="100%" height={200} borderRadius={12} />
      <SkeletonBox width="70%" height={20} />
      <SkeletonBox width="40%" height={14} />
      <SkeletonBox width="90%" height={14} />
      <SkeletonBox width="85%" height={14} />
      <SkeletonBox width="60%" height={14} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fafaf9',
    borderRadius: 12,
    padding: 16,
  },
  cardDark: {
    backgroundColor: '#1c1c1e',
  },
  cardBody: {
    gap: 0,
  },
})
