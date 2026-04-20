import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Modal } from 'react-native'

export interface WebAvatarCropperProps {
  visible: boolean
  imageUri: string
  originalImageUri?: string
  onCropComplete: (blob: Blob) => void
  onCancel: () => void
  onReplacePhoto?: () => void
}

export default function WebAvatarCropper({
  visible,
  imageUri,
  originalImageUri,
  onCropComplete,
  onCancel,
  onReplacePhoto,
}: WebAvatarCropperProps) {
  const displayImageUri = originalImageUri || imageUri
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [loaded, setLoaded] = useState(false)

  // The visible crop circle size
  const cropSize = 280
  // The area the image can move within
  const imageAreaSize = 360

  useEffect(() => {
    if (!visible) {
      setScale(1)
      setOffset({ x: 0, y: 0 })
      setLoaded(false)
    }
  }, [visible])

  useEffect(() => {
    if (!visible || !displayImageUri) return
    const img = new window.Image()
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height })
      setLoaded(true)
    }
    img.src = displayImageUri
  }, [visible, displayImageUri])

  useEffect(() => {
    if (!loaded || !imageSize.width) return
    // Scale so the smaller dimension fills the crop area
    const minDim = Math.min(imageSize.width, imageSize.height)
    setScale(cropSize / minDim)
    setOffset({ x: 0, y: 0 })
  }, [loaded, imageSize])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    },
    [isDragging, dragStart]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const delta = e.deltaY > 0 ? -0.02 : 0.02
    setScale((prev) => Math.max(0.3, Math.min(5, prev + delta)))
  }, [])

  const handleSave = () => {
    const outputSize = 400
    const canvas = document.createElement('canvas')
    canvas.width = outputSize
    canvas.height = outputSize
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.onload = () => {
      const imgW = img.naturalWidth
      const imgH = img.naturalHeight
      const minDim = Math.min(imgW, imgH)

      // Displayed image dimensions
      const displayW = (imgW / minDim) * cropSize * scale
      const displayH = (imgH / minDim) * cropSize * scale

      // Image center is at (imageAreaSize/2 + offset.x, imageAreaSize/2 + offset.y)
      const imgCenterX = imageAreaSize / 2 + offset.x
      const imgCenterY = imageAreaSize / 2 + offset.y

      // Image top-left
      const imgLeft = imgCenterX - displayW / 2
      const imgTop = imgCenterY - displayH / 2

      // Crop area (centered in imageAreaSize)
      const cropLeft = (imageAreaSize - cropSize) / 2
      const cropTop = (imageAreaSize - cropSize) / 2

      // Intersection
      const srcX = Math.max(0, cropLeft - imgLeft)
      const srcY = Math.max(0, cropTop - imgTop)
      const srcW = Math.min(cropLeft + cropSize, imgLeft + displayW) - Math.max(cropLeft, imgLeft)
      const srcH = Math.min(cropTop + cropSize, imgTop + displayH) - Math.max(cropTop, imgTop)

      if (srcW <= 0 || srcH <= 0) return

      // Map to natural image
      const natScale = minDim / (cropSize * scale)
      const natX = srcX * natScale
      const natY = srcY * natScale
      const natW = srcW * natScale
      const natH = srcH * natScale

      ctx.save()
      ctx.beginPath()
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
      ctx.clip()

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, outputSize, outputSize)

      ctx.drawImage(img, natX, natY, natW, natH, 0, 0, outputSize, outputSize)
      ctx.restore()

      canvas.toBlob(
        (blob) => {
          if (blob) onCropComplete(blob)
        },
        'image/jpeg',
        0.9
      )
    }
    img.src = displayImageUri
  }

  if (!visible || !loaded) return null

  const minDim = Math.min(imageSize.width, imageSize.height)
  const displayW = (imageSize.width / minDim) * cropSize * scale
  const displayH = (imageSize.height / minDim) * cropSize * scale

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            zIndex: 10,
          }}
        >
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 16,
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Cancel
          </button>
          <span style={{ color: '#fff', fontSize: 17, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
            Adjust profile photo
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            {onReplacePhoto && (
              <button
                onClick={onReplacePhoto}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60A5FA',
                  fontSize: 15,
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Change
              </button>
            )}
            <button
              onClick={handleSave}
              style={{
                background: 'none',
                border: 'none',
                color: '#F97316',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Done
            </button>
          </div>
        </div>

        {/* Image area with dark background */}
        <div
          style={{
            position: 'relative',
            width: imageAreaSize,
            height: imageAreaSize,
            backgroundColor: '#111',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {/* Dark overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1,
            }}
          />

          {/* Crop circle - the visible area */}
          <div
            style={{
              position: 'absolute',
              left: (imageAreaSize - cropSize) / 2,
              top: (imageAreaSize - cropSize) / 2,
              width: cropSize,
              height: cropSize,
              borderRadius: '50%',
              overflow: 'hidden',
              zIndex: 2,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
          >
            {/* Image positioned relative to crop area */}
            <img
              src={displayImageUri}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                width: displayW,
                height: displayH,
                // Center the image in the crop area, then apply offset
                left: (cropSize - displayW) / 2 + offset.x,
                top: (cropSize - displayH) / 2 + offset.y,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Circle border */}
          <div
            style={{
              position: 'absolute',
              left: (imageAreaSize - cropSize) / 2,
              top: (imageAreaSize - cropSize) / 2,
              width: cropSize,
              height: cropSize,
              borderRadius: '50%',
              border: '2px solid #fff',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />
        </div>

        {/* Hint */}
        <div
          style={{
            marginTop: 20,
            color: '#9ca3af',
            fontSize: 14,
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Drag to reposition · Scroll to zoom
        </div>
      </div>
    </Modal>
  )
}
