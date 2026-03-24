import React, { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, Pressable, Modal, Image, StyleSheet } from 'react-native'

export interface WebAvatarCropperProps {
  visible: boolean
  imageUri: string
  onCropComplete: (blob: Blob) => void
  onCancel: () => void
}

export default function WebAvatarCropper({ visible, imageUri, onCropComplete, onCancel }: WebAvatarCropperProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [loaded, setLoaded] = useState(false)

  const imageRef = useRef<HTMLImageElement | null>(null)

  // Crop box state
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })
  const [cropSize, setCropSize] = useState(200)
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'move' | 'resize' | null>(null)
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

    // Start with a reasonable crop size (80% of smaller dimension)
    const initialSize = Math.min(width, height) * 0.75
    setCropSize(initialSize)
    setCropPosition({
      x: (width - initialSize) / 2,
      y: (height - initialSize) / 2
    })
  }, [loaded, imageSize])

  // Handle mouse down on crop box (for moving)
  const handleCropMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragMode('move')
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

    if (dragMode === 'move') {
      const newX = dragStart.cropX + dx
      const newY = dragStart.cropY + dy

      setCropPosition({
        x: Math.max(0, Math.min(newX, containerSize.width - cropSize)),
        y: Math.max(0, Math.min(newY, containerSize.height - cropSize))
      })
    } else if (dragMode === 'resize') {
      // Resize based on drag distance
      const delta = Math.max(dx, dy)
      const newSize = Math.max(80, Math.min(dragStart.cropSize + delta, Math.min(containerSize.width, containerSize.height)))

      // Keep centered while resizing
      const newX = dragStart.cropX + (dragStart.cropSize - newSize) / 2
      const newY = dragStart.cropY + (dragStart.cropSize - newSize) / 2

      setCropSize(newSize)
      setCropPosition({
        x: Math.max(0, Math.min(newX, containerSize.width - newSize)),
        y: Math.max(0, Math.min(newY, containerSize.height - newSize))
      })
    }
  }, [isDragging, dragMode, dragStart, cropSize, containerSize])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragMode(null)
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
      backgroundColor: 'rgba(0,0,0,0.85)', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 20,
    },
    container: { 
      backgroundColor: '#262626', 
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
    cropWrapper: { 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
    },
    cropArea: {
      position: 'relative',
      overflow: 'hidden',
    },
    overlayTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    overlayBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    overlayLeft: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    overlayRight: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
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
      width: 24,
      height: 24,
      backgroundColor: '#F97316',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#fff',
      cursor: 'nwse-resize',
    },
    controls: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center', 
      marginTop: 20,
      gap: 24,
    },
    controlBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: '#374151',
      borderRadius: 8,
    },
    controlBtnText: { color: '#fff', fontSize: 14 },
    hint: { 
      color: '#9CA3AF', 
      fontSize: 13, 
      textAlign: 'center',
      marginTop: 16,
    },
  })

  if (!visible) return null

  // Calculate overlay dimensions
  const topHeight = cropPosition.y
  const bottomHeight = containerSize.height - cropPosition.y - cropSize
  const leftWidth = cropPosition.x
  const rightWidth = containerSize.width - cropPosition.x - cropSize

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay as any}>
        <View style={styles.container as any}>
          <View style={styles.header as any}>
            <Pressable onPress={onCancel}>
              <Text style={styles.btnText as any}>Cancel</Text>
            </Pressable>
            <Text style={styles.title as any}>Crop Photo</Text>
            <Pressable onPress={handleSave}>
              <Text style={[styles.btnText as any, styles.saveBtn as any]}>Done</Text>
            </Pressable>
          </View>

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

              {/* Dark overlays around crop area */}
              {topHeight > 0 && (
                <View style={[styles.overlayTop as any, { height: topHeight }]} />
              )}
              {bottomHeight > 0 && (
                <View style={[styles.overlayBottom as any, { height: bottomHeight, top: cropPosition.y + cropSize }]} />
              )}
              {leftWidth > 0 && (
                <View style={[styles.overlayLeft as any, { width: leftWidth, top: cropPosition.y, height: cropSize }]} />
              )}
              {rightWidth > 0 && (
                <View style={[styles.overlayRight as any, { width: rightWidth, left: cropPosition.x + cropSize, top: cropPosition.y, height: cropSize }]} />
              )}

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

                {/* Resize handles */}
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
          </View>

          <View style={styles.controls as any}>
            <Pressable 
              style={styles.controlBtn as any}
              onPress={() => {
                const newSize = Math.max(80, cropSize - 30)
                const centerX = cropPosition.x + cropSize / 2
                const centerY = cropPosition.y + cropSize / 2
                setCropSize(newSize)
                setCropPosition({
                  x: Math.max(0, Math.min(centerX - newSize / 2, containerSize.width - newSize)),
                  y: Math.max(0, Math.min(centerY - newSize / 2, containerSize.height - newSize))
                })
              }}
            >
              <Text style={styles.controlBtnText as any}>− Smaller</Text>
            </Pressable>
            
            <Pressable 
              style={styles.controlBtn as any}
              onPress={() => {
                const newSize = Math.min(cropSize + 30, Math.min(containerSize.width, containerSize.height))
                const centerX = cropPosition.x + cropSize / 2
                const centerY = cropPosition.y + cropSize / 2
                setCropSize(newSize)
                setCropPosition({
                  x: Math.max(0, Math.min(centerX - newSize / 2, containerSize.width - newSize)),
                  y: Math.max(0, Math.min(centerY - newSize / 2, containerSize.height - newSize))
                })
              }}
            >
              <Text style={styles.controlBtnText as any}>+ Larger</Text>
            </Pressable>
          </View>

          <Text style={styles.hint as any}>
            Drag the orange handles to resize • Drag inside to move
          </Text>
        </View>
      </View>
    </Modal>
  )
}
