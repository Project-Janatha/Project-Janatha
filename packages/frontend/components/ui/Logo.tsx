import React from 'react'
import { View, Image, type ViewStyle } from 'react-native'

const logoIcon = require('../../assets/images/logo.png')
const logoWithText = require('../../assets/images/logo_with_text.png')

interface LogoProps {
  showText?: boolean
  size?: number
  color?: string
  style?: ViewStyle
}

const LOGO_WITH_TEXT_ASPECT_RATIO = 3.65

export default function Logo({
  showText = true,
  size = 32,
  color,
  style,
}: LogoProps) {
  if (showText) {
    return (
      <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
        <Image
          source={logoWithText}
          style={{
            height: size,
            width: size * LOGO_WITH_TEXT_ASPECT_RATIO,
          }}
          resizeMode="contain"
          {...(color ? { tintColor: color } : {})}
        />
      </View>
    )
  }

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <Image
        source={logoIcon}
        style={{ width: size, height: size }}
        resizeMode="contain"
        {...(color ? { tintColor: color } : {})}
      />
    </View>
  )
}
