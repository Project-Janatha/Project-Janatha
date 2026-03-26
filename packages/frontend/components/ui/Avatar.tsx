import React from 'react'
import { View, Text, Image } from 'react-native'

interface AvatarProps {
  image?: string
  initials?: string
  name?: string
  size?: number
  style?: object
}

export default function Avatar({ image, initials, name, size = 40, style }: AvatarProps) {
  const getInitials = () => {
    if (initials) return initials
    if (name) {
      const parts = name.split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return name.slice(0, 2).toUpperCase()
    }
    return '?'
  }

  const fontSize = size * 0.4

  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style,
        ]}
      />
    )
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#E8862A',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text
        style={{
          color: 'white',
          fontSize,
          fontWeight: '600',
        }}
      >
        {getInitials()}
      </Text>
    </View>
  )
}
