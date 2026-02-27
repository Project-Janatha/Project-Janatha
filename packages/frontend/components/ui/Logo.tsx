import React from 'react'
import { View, Text, Image, type ViewStyle } from 'react-native'

const logoImage = require('../../assets/images/logo.png')

interface LogoProps {
  showText?: boolean
  size?: number
  color?: string
  style?: ViewStyle
}

export default function Logo({
  showText = true,
  size = 32,
  color = '#E8862A',
  style,
}: LogoProps) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: size * 0.3 }, style]}>
      <Image
        source={logoImage}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      {showText && (
        <Text
          style={{
            fontFamily: '"Inclusive Sans", sans-serif',
            fontWeight: '400',
            fontSize: size * 0.56,
            color,
          }}
        >
          Janata
        </Text>
      )}
    </View>
  )
}
