import React, { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, Pressable, Modal, Image, StyleSheet } from 'react-native'

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
  onReplacePhoto 
}: WebAvatarCropperProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [loaded, setLoaded] = useState(false)

  const imageRef = useRef<HTMLImageElement | null>(null)
  
  const displayImageUri = originalImageUri || imageUri

  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })
  const [cropSize, setCropSize] = useState(200)
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'move' | 'resize' | null>(null)
  const [dragCorner, setDragCorner] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0, cropSize: 0 })
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (!visible || !displayImageUri) return

    const img = new window.Image()
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height })
      imageRef.current = img
      setLoaded(true)
    }
    img.src = displayImageUri

    return () => {
      img.onload = null
    }
  }, [visible, displayImageUri])

  useEffect(() => {
    if (!loaded || !imageSize.width) return

    const maxWidth = Math.min(window.innerWidth * 0.85, 400)
    const maxHeight = window.innerHeight * 0.45
    const aspectRatio = imageSize.width / imageSize.height

    let width = maxWidth
    let height = width / aspectRatio

    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }

    setContainerSize({ width, height })

    const initialSize = Math.min(width, height) * 0.7
    setCropSize(initialSize)
    setCropPosition({
      x: (width - initialSize) / 2,
      y: (height - initialSize) / 2
    })
  }, [loaded, imageSize])

  const rotate = (direction: 'left' | 'right') => {
    setRotation(prev => (prev + (direction === 'right' ? 90 : -90) + 360) % 360)
  }

  const handleCropMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragMode('move')
    setDragCorner(null)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      cropX: cropPosition.x,
      cropY: cropPosition.y,
      cropSize: cropSize
    })
  }

  const handleResizeMouseDown = (e: React.MouseEvent, corner: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragMode('resize')
    setDragCorner(corner)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      cropX: cropPosition.x,
      cropY: cropPosition.y,
      cropSize: cropSize
    })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return

    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    const minSize = 60

    if (dragMode === 'move') {
      const newX = dragStart.cropX + dx
      const newY = dragStart.cropY + dy

      setCropPosition({
        x: Math.max(0, Math.min(newX, containerSize.width - cropSize)),
        y: Math.max(0, Math.min(newY, containerSize.height - cropSize))
      })
    } else if (dragMode === 'resize' && dragCorner) {
      let newSize = dragStart.cropSize
      let newX = dragStart.cropX
      let newY = dragStart.cropY

      switch (dragCorner) {
        case 'topLeft':
          newSize = dragStart.cropSize - Math.max(dx, dy)
          newX = dragStart.cropX + (dragStart.cropSize - newSize)
          newY = dragStart.cropY + (dragStart.cropSize - newSize)
          break
        case 'topRight':
          newSize = dragStart.cropSize + dx
          newY = dragStart.cropY - dy
          break
        case 'bottomLeft':
          newSize = dragStart.cropSize - dx
          newX = dragStart.cropX + (dragStart.cropSize - newSize)
          break
        case 'bottomRight':
          newSize = dragStart.cropSize + Math.max(dx, dy)
          break
      }

      newSize = Math.max(minSize, Math.min(newSize, Math.min(containerSize.width, containerSize.height)))
      newX = Math.max(0, Math.min(newX, containerSize.width - newSize))
      newY = Math.max(0, Math.min(newY, containerSize.height - newSize))

      setCropSize(newSize)
      setCropPosition({ x: newX, y: newY })
    }
  }, [isDragging, dragMode, dragStart, cropSize, containerSize, dragCorner])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragMode(null)
    setDragCorner(null)
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

  const handleSave = () => {
    if (!imageRef.current) return

    const outputSize = 200
    const canvas = document.createElement('canvas')
    canvas.width = outputSize
    canvas.height = outputSize
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isRotated = rotation % 180 !== 0
    
    // Calculate the visible portion after rotation
    const srcWidth = isRotated ? imageSize.height : imageSize.width
    const srcHeight = isRotated ? imageSize.width : imageSize.height
    const scale = containerSize.width / srcWidth

    // Map crop position to source coordinates
    const srcCropX = cropPosition.x / scale
    const srcCropY = cropPosition.y / scale
    const srcCropSize = cropSize / scale

    ctx.save()
    
    // Move to center and rotate
    ctx.translate(outputSize / 2, outputSize / 2)
    ctx.rotate((rotation * Math.PI) / 180)

    // Create circular clip
    ctx.beginPath()
    ctx.arc(0, 0, outputSize / 2, 0, Math.PI * 2)
    ctx.clip()

    // Draw the image portion
    ctx.drawImage(
      imageRef.current,
      srcCropX, srcCropY, srcCropSize, srcCropSize,
      -outputSize / 2, -outputSize / 2, outputSize, outputSize
    )

    ctx.restore()

    canvas.toBlob(
      (blob) => {
        if (blob) onCropComplete(blob)
      },
      'image/jpeg',
      0.9
    )
  }

  const styles = StyleSheet.create({
    overlay: { 
      flex: 1, 
      backgroundColor: 'rgba(0,0,0,0.9)', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 20,
    },
    container: { 
      backgroundColor: '#1a1a1a', 
      borderRadius: 16, 
      padding: 20,
      maxWidth: 480,
      width: '100%',
    },
    header: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 16,
    },
    title: { color: '#fff', fontSize: 18, fontWeight: '600' as const },
    btnText: { color: '#9CA3AF', fontSize: 16 },
    saveBtn: { color: '#F97316', fontWeight: '600' as const },
    replaceBtn: { color: '#60A5FA', fontSize: 14 },
    cropArea: {
      position: 'relative',
      overflow: 'hidden',
    },
    cropBox: {
      position: 'absolute',
      borderWidth: 2,
      borderColor: '#fff',
    },
    gridLine: {
      position: 'absolute',
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    handle: {
      position: 'absolute',
      width: 24,
      height: 24,
      backgroundColor: '#F97316',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#fff',
    },
    controls: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      marginTop: 20,
    },
    rotateBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#374151',
      justifyContent: 'center',
      alignItems: 'center',
    },
    rotateIcon: { color: '#fff', fontSize: 22 },
  })

  if (!visible) return null

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay as any}>
        <View style={styles.container as any}>
          <View style={styles.header as any}>
            <Pressable onPress={onCancel}>
              <Text style={styles.btnText as any}>✕</Text>
            </Pressable>
            <Text style={styles.title as any}>Crop</Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              {onReplacePhoto && (
                <Pressable onPress={onReplacePhoto}>
                  <Text style={styles.replaceBtn as any}>Upload Image</Text>
                </Pressable>
              )}
              <Pressable onPress={handleSave}>
                <Text style={[styles.btnText as any, styles.saveBtn as any]}>✓</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.controls as any}>
            <Pressable style={styles.rotateBtn as any} onPress={() => rotate('left')}>
              <Text style={styles.rotateIcon as any}>↺</Text>
            </Pressable>
            
            <View
              style={[
                styles.cropArea as any,
                { 
                  width: containerSize.width, 
                  height: containerSize.height,
                }
              ]}
            >
              {/* Image with rotation */}
              <Image
                source={{ uri: displayImageUri }}
                style={{ 
                  width: containerSize.width, 
                  height: containerSize.height,
                  transform: [{ rotate: `${rotation}deg` }],
                }}
              />

              {/* SVG Circular Mask */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
                viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
              >
                <defs>
                  <mask id="cropMask">
                    <rect width="100%" height="100%" fill="white" />
                    <circle
                      cx={cropPosition.x + cropSize / 2}
                      cy={cropPosition.y + cropSize / 2}
                      r={cropSize / 2}
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="rgba(0,0,0,0.65)"
                  mask="url(#cropMask)"
                />
              </svg>

              {/* Crop circle */}
              <View
                style={[
                  styles.cropBox as any,
                  {
                    left: cropPosition.x,
                    top: cropPosition.y,
                    width: cropSize,
                    height: cropSize,
                    borderRadius: cropSize / 2,
                  }
                ]}
                // @ts-ignore
                onMouseDown={handleCropMouseDown}
              >
                <View style={[styles.gridLine as any, { left: '33.33%', top: 0, bottom: 0, width: 1 }]} />
                <View style={[styles.gridLine as any, { left: '66.66%', top: 0, bottom: 0, width: 1 }]} />
                <View style={[styles.gridLine as any, { top: '33.33%', left: 0, right: 0, height: 1 }]} />
                <View style={[styles.gridLine as any, { top: '66.66%', left: 0, right: 0, height: 1 }]} />

                <View 
                  style={[styles.handle as any, { left: -12, top: -12 }]}
                  // @ts-ignore
                  onMouseDown={(e: any) => handleResizeMouseDown(e, 'topLeft')}
                />
                <View 
                  style={[styles.handle as any, { right: -12, top: -12 }]}
                  // @ts-ignore
                  onMouseDown={(e: any) => handleResizeMouseDown(e, 'topRight')}
                />
                <View 
                  style={[styles.handle as any, { left: -12, bottom: -12 }]}
                  // @ts-ignore
                  onMouseDown={(e: any) => handleResizeMouseDown(e, 'bottomLeft')}
                />
                <View 
                  style={[styles.handle as any, { right: -12, bottom: -12 }]}
                  // @ts-ignore
                  onMouseDown={(e: any) => handleResizeMouseDown(e, 'bottomRight')}
                />
              </View>
            </View>

            <Pressable style={styles.rotateBtn as any} onPress={() => rotate('right')}>
              <Text style={styles.rotateIcon as any}>↻</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
