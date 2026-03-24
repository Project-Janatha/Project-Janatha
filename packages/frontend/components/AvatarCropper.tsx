import { Platform } from 'react-native'
import WebAvatarCropper from './AvatarCropper.web'
import NativeAvatarCropper from './AvatarCropper.native'

interface AvatarCropperProps {
  visible: boolean
  imageUri: string
  onCropComplete: (blob: Blob) => void
  onCancel: () => void
}

export function AvatarCropper(props: AvatarCropperProps) {
  if (Platform.OS === 'web') {
    return <WebAvatarCropper {...props} />
  }
  return <NativeAvatarCropper {...props} />
}
