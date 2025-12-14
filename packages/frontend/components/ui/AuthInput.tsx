import { TextInput } from 'react-native'
import { useState } from 'react'

export default function AuthInput({ secureTextEntry, style, ...props }) {
  const [changed, setChanged] = useState(false)

  return (
    <TextInput
      className="w-full font-inter rounded-lg px-4 py-3 min-h-[48px] bg-muted/50 dark:bg-muted-dark/10 focus:border-primary focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-400"
      placeholderTextColor="#9ca3af"
      secureTextEntry={secureTextEntry}
      onChangeText={() => setChanged(true)}
      style={[
        {
          fontSize: 16, // Industry standard - prevents mobile zoom
          fontFamily: secureTextEntry && changed ? 'Verdana' : 'Inter', // Better dots
          letterSpacing: secureTextEntry ? 0.125 : 0, // Space out dots
        },
        style,
      ]}
      {...props}
    />
  )
}
