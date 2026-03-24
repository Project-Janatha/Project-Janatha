import React, { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, Pressable, Modal, Image, StyleSheet } from 'react-native'

export interface WebAvatarCropperProps {
  visible: boolean
  imageUri: string
  onCropComplete: (blob: Blob) => void
  onCancel: () => void
  onReplacePhoto?: () => void
}

export default function WebAvatarCropper({ visible, imageUri, onCropComplete, onCancel, onReplacePhoto }: WebAvatarCropperProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [loaded, setLoaded] = useState(false)
  const [rotation, setRotation] = useState(0)

  const imageRef = useRef<HTMLImageElement | null>(null)

  // Crop box state
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })
  const [cropSize, setCropSize] = useState(200)
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'move' | 'resize' | null>(null)
  const [dragCorner, setDragCorner] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0, cropSize: 0 })

  // Handle image load
  useEffect(() => {
    if (!visible || !imageUri) return

    const img = new window.Image()
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height })
      imageRef.current = img
      setLoaded(true)
    }
    img.src = imageUri

    return () => {
      img.onload = null
    }
  }, [visible, imageUri])

  // Calculate container size and initialize crop
  useEffect(() => {
    if (!loaded || !imageSize.width) return

    const maxWidth = Math.min(window.innerWidth * 0.85, 480)
    const maxHeight = window.innerHeight * 0.5
    const aspectRatio = imageSize.width / imageSize.height

    let width = maxWidth
    let height = width / aspectRatio

    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }

    setContainerSize({ width, height })

    // Start with a reasonable crop size (75% of smaller dimension)
    const initialSize = Math.min(width, height) * 0.75
    setCropSize(initialSize)
    setCropPosition({
      x: (width - initialSize) / 2,
      y: (height - initialSize) / 2
    })
  }, [loaded, imageSize])

  // Handle rotation
  const rotate = (direction: 'left' | 'right') => {
    const newRotation = (rotation + (direction === 'right' ? 90 : -90) + 360) % 360
    setRotation(newRotation)
    
    // Swap dimensions after rotation
    const newWidth = rotation % 180 === 0 ? containerSize.width : containerSize.height
    const newHeight = rotation % 180 === 0 ? containerSize.height : containerSize.width
    
    // Recalculate container with swapped aspect ratio
    const maxWidth = Math.min(window.innerWidth * 0.85, 480)
    const maxHeight = window.innerHeight * 0.5
    const newAspectRatio = newWidth / newHeight
    
    let newCW = maxWidth
    let newCH = newCW / newAspectRatio
    
    if (newCH > maxHeight) {
      newCH = maxHeight
      newCW = newCH * newAspectRatio
    }
    
    setContainerSize({ width: newCW, height: newCH })
    
    // Keep crop centered
    const newSize = Math.min(newCW, newCH) * 0.75
    setCropSize(newSize)
    setCropPosition({
      x: (newCW - newSize) / 2,
      y: (newCH - newSize) / 2
    })
  }

  // Handle mouse down on crop box (for moving)
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

  // Handle mouse down on resize handle
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
    const minSize = 80

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
          newSize = dragStart.cropSize - dx
          newX = dragStart.cropX + dx
          newY = dragStart.cropY + dy
          break
        case 'topRight':
          newSize = dragStart.cropSize + dx
          newY = dragStart.cropY + dy
          break
        case 'bottomLeft':
          newSize = dragStart.cropSize - dx
          newX = dragStart.cropX + dx
          break
        case 'bottomRight':
          newSize = dragStart.cropSize + dx
          break
      }

      newSize = Math.max(minSize, Math.min(newSize, Math.min(containerSize.width, containerSize.height)))

      // Constrain position
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

  // Save cropped image
  const handleSave = () => {
    if (!imageRef.current) return

    const outputSize = 200
    const canvas = document.createElement('canvas')
    canvas.width = outputSize
    canvas.height = outputSize
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scaleX = imageSize.width / containerSize.width
    const scaleY = imageSize.height / containerSize.height

    const srcX = cropPosition.x * scaleX
    const srcY = cropPosition.y * scaleY
    const srcW = cropSize * scaleX
    const srcH = cropSize * scaleY

    // Draw circular crop
    ctx.beginPath()
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
    ctx.clip()

    ctx.drawImage(
      imageRef.current,
      srcX, srcY, srcW, srcH,
      0, 0, outputSize, outputSize
    )

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
      maxWidth: 540,
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
    cropWrapper: { 
      alignItems: 'center', 
      justifyContent: 'center',
    },
    cropArea: {
      position: 'relative',
      overflow: 'hidden',
    },
    cropBox: {
      position: 'absolute',
      borderWidth: 2,
      borderColor: '#fff',
      cursor: 'move',
    },
    gridLine: {
      position: 'absolute',
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    handle: {
      position: 'absolute',
      width: 28,
      height: 28,
      backgroundColor: '#F97316',
      borderRadius: 14,
      borderWidth: 3,
      borderColor: '#fff',
    },
    controls: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      marginTop: 20,
    },
    rotateBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#374151',
      justifyContent: 'center',
      alignItems: 'center',
    },
    rotateIcon: { color: '#fff', fontSize: 24 },
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
                  <Text style={styles.replaceBtn as any}>↻</Text>
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
            
            <View style={styles.cropWrapper as any}>
              <View
                style={[
                  styles.cropArea as any,
                  { width: containerSize.width, height: containerSize.height }
                ]}
              >
                {/* Image */}
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: containerSize.width, height: containerSize.height }}
                />

                {/* Circular mask overlay using border */}
                <View
                  style={{
                    position: 'absolute',
                    top: cropPosition.y - 1000,
                    left: cropPosition.x - 1000,
                    width: cropSize + 2000,
                    height: cropSize + 2000,
                    borderRadius: (cropSize + 2000) / 2,
                    borderWidth: 1000 + Math.max(containerSize.height, containerSize.width),
                    borderColor: 'rgba(0,0,0,0.7)',
                    backgroundColor: 'transparent',
                  }}
                  pointerEvents="none"
                />

                {/* Crop circle with grid */}
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
                  {/* Grid lines */}
                  <View style={[styles.gridLine as any, { left: '33.33%', top: 0, bottom: 0, width: 1 }]} />
                  <View style={[styles.gridLine as any, { left: '66.66%', top: 0, bottom: 0, width: 1 }]} />
                  <View style={[styles.gridLine as any, { top: '33.33%', left: 0, right: 0, height: 1 }]} />
                  <View style={[styles.gridLine as any, { top: '66.66%', left: 0, right: 0, height: 1 }]} />

                  {/* Resize handles - each moves from its corner */}
                  <View 
                    style={[styles.handle as any, { left: -14, top: -14 }]}
                    // @ts-ignore
                    onMouseDown={(e: any) => handleResizeMouseDown(e, 'topLeft')}
                  />
                  <View 
                    style={[styles.handle as any, { right: -14, top: -14 }]}
                    // @ts-ignore
                    onMouseDown={(e: any) => handleResizeMouseDown(e, 'topRight')}
                  />
                  <View 
                    style={[styles.handle as any, { left: -14, bottom: -14 }]}
                    // @ts-ignore
                    onMouseDown={(e: any) => handleResizeMouseDown(e, 'bottomLeft')}
                  />
                  <View 
                    style={[styles.handle as any, { right: -14, bottom: -14 }]}
                    // @ts-ignore
                    onMouseDown={(e: any) => handleResizeMouseDown(e, 'bottomRight')}
                  />
                </View>
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
