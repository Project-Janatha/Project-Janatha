import { TextInput } from 'react-native'
import { useState } from 'react'

export default function AuthInput({ secureTextEntry, onChangeText, ...props }) {
  const [hasText, setHasText] = useState(false)

  const handleChangeText = (text) => {
    setHasText(text.length > 0)
    onChangeText?.(text)
  }

  return (
    <TextInput
      className={`w-full font-inter rounded-lg px-4 py-3 min-h-[48px] bg-muted/50 dark:bg-muted-dark/10 focus:border-primary focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-400 ${
        hasText ? 'text-content dark:text-content-dark' : ''
      }`}
      placeholderTextColor="#9ca3af"
      secureTextEntry={secureTextEntry}
      onChangeText={handleChangeText}
      style={{
        fontSize: 16,
        fontFamily: secureTextEntry && hasText ? 'Verdana' : 'Inter-Regular',
        letterSpacing: secureTextEntry ? 0.125 : 0,
      }}
      {...props}
    />
  )
}
