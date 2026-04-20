import React from 'react'
import { View, Text, Image } from 'react-native'

interface AvatarProps {
  image?: string
  initials?: string
  name?: string
  size?: number
  style?: object
  backgroundColor?: string
}

export default function Avatar({ image, initials, name, size = 40, style, backgroundColor }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false)

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
  const bgColor = backgroundColor || '#C2410C'

  if (image && !imageError) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: 'hidden',
          },
          style,
        ]}
      >
        <Image
          source={{ uri: image }}
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      </View>
    )
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
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