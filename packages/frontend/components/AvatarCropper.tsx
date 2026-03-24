import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { Platform } from 'react-native'
import WebAvatarCropper, { WebAvatarCropperProps } from './AvatarCropper.web'
import NativeAvatarCropper from './AvatarCropper.native'

export interface AvatarCropperRef {
  open: () => void
}

interface AvatarCropperProps {
  onCropComplete: (blob: Blob) => void
}

export const AvatarCropper = forwardRef<AvatarCropperRef, AvatarCropperProps>(function AvatarCropper({ onCropComplete }, ref) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageUri, setImageUri] = useState('')
  const [showCropper, setShowCropper] = useState(false)

  useImperativeHandle(ref, () => ({
    open: () => fileInputRef.current?.click(),
  }))

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageUri(URL.createObjectURL(file))
      setShowCropper(true)
    }
  }

  const handleCropComplete = (blob: Blob) => {
    setShowCropper(false)
    onCropComplete(blob)
  }

  const handleCancel = () => {
    setShowCropper(false)
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      {Platform.OS === 'web' && (
        <WebAvatarCropper
          visible={showCropper}
          imageUri={imageUri}
          onCropComplete={handleCropComplete}
          onCancel={handleCancel}
        />
      )}
      {Platform.OS !== 'web' && (
        <NativeAvatarCropper
          visible={showCropper}
          imageUri={imageUri}
          onCropComplete={handleCropComplete}
          onCancel={handleCancel}
        />
      )}
    </>
  )
})
