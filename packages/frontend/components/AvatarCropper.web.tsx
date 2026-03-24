import React, { useState, useRef, useEffect } from 'react'
import { View, Text, Pressable, Modal, Image, StyleSheet } from 'react-native'

const MIN_SCALE = 0.5
const MAX_SCALE = 3

export interface WebAvatarCropperProps {
  visible: boolean
  imageUri: string
  onCropComplete: (blob: Blob) => void
  onCancel: () => void
}

export default function WebAvatarCropper({ visible, imageUri, onCropComplete, onCancel }: WebAvatarCropperProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const imageRef = useRef<HTMLImageElement | null>(null)
  const dragStart = useRef({ x: 0, y: 0 })
  const containerSize = 280

  useEffect(() => {
    if (!visible || !imageUri) return

    const img = new window.Image()
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height })
      imageRef.current = img
      
      const minDimension = Math.min(img.width, img.height)
      const fitScale = containerSize / minDimension
      setScale(Math.min(fitScale * 1.5, 1))
      setPosition({ x: 0, y: 0 })
      setRotation(0)
      setLoaded(true)
    }
    img.src = imageUri

    return () => {
      img.onload = null
    }
  }, [visible, imageUri])

  useEffect(() => {
    if (!isDragging || !loaded) return

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.current.x
      const newY = e.clientY - dragStart.current.y

      const effectiveW = rotation % 180 === 0 ? imageSize.width : imageSize.height
      const effectiveH = rotation % 180 === 0 ? imageSize.height : imageSize.width
      const scaledW = effectiveW * scale
      const scaledH = effectiveH * scale

      const maxX = Math.max(0, (scaledW - containerSize) / 2)
      const maxY = Math.max(0, (scaledH - containerSize) / 2)

      setPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY)),
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, scale, rotation, imageSize, loaded])

  const handleMouseDown = (e: any) => {
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
  }

  const handleWheel = (e: any) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale((s) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s + delta)))
  }

  const handleRotate = (dir: 'left' | 'right') => {
    setRotation((r) => (r + (dir === 'right' ? 90 : -90) + 360) % 360)
  }

  const handleReset = () => {
    const minDimension = Math.min(imageSize.width, imageSize.height)
    const fitScale = containerSize / minDimension
    setScale(Math.min(fitScale * 1.5, 1))
    setPosition({ x: 0, y: 0 })
    setRotation(0)
  }

  const handleSave = () => {
    if (!imageRef.current) return

    const cropSize = 200
    const canvas = document.createElement('canvas')
    canvas.width = cropSize
    canvas.height = cropSize
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.translate(cropSize / 2, cropSize / 2)
    ctx.rotate((rotation * Math.PI) / 180)

    ctx.beginPath()
    ctx.arc(0, 0, cropSize / 2, 0, Math.PI * 2)
    ctx.clip()

    const effectiveW = rotation % 180 === 0 ? imageSize.width : imageSize.height
    const effectiveH = rotation % 180 === 0 ? imageSize.height : imageSize.width
    const scaledW = effectiveW * scale
    const scaledH = effectiveH * scale

    ctx.drawImage(
      imageRef.current,
      -scaledW / 2 - position.x / scale,
      -scaledH / 2 - position.y / scale,
      scaledW / scale,
      scaledH / scale,
      -cropSize / 2,
      -cropSize / 2,
      cropSize,
      cropSize
    )

    canvas.toBlob(
      (blob) => {
        if (blob) onCropComplete(blob)
      },
      'image/jpeg',
      0.9
    )
  }

  const effectiveW = rotation % 180 === 0 ? imageSize.width : imageSize.height
  const effectiveH = rotation % 180 === 0 ? imageSize.height : imageSize.width
  const sliderPercent = ((scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * 100

  const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    container: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, width: 340 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { color: '#fff', fontSize: 17, fontWeight: '600' as const },
    btnText: { color: '#999', fontSize: 16 },
    saveBtn: { color: '#ea580c', fontWeight: '600' as const },
    cropArea: { 
      width: containerSize, 
      height: containerSize, 
      alignSelf: 'center', 
      overflow: 'hidden', 
      borderRadius: containerSize / 2, 
      backgroundColor: '#333',
      position: 'relative',
    },
    imageWrapper: { position: 'absolute' as const, left: containerSize / 2, top: containerSize / 2 },
    mask: { 
      position: 'absolute' as const, 
      top: 0, left: 0, right: 0, bottom: 0, 
      borderRadius: containerSize / 2, 
      borderWidth: 3, 
      borderColor: '#fff',
    },
    controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, gap: 12 },
    rotateBtns: { flexDirection: 'row', gap: 8 },
    rotateBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
    rotateIcon: { color: '#fff', fontSize: 20 },
    sliderContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    sliderLabel: { color: '#999', fontSize: 13 },
    sliderTrack: { flex: 1, height: 4, backgroundColor: '#444', borderRadius: 2, overflow: 'hidden' },
    sliderFill: { height: '100%', backgroundColor: '#ea580c' },
    resetBtn: { paddingHorizontal: 12, paddingVertical: 8 },
    resetText: { color: '#999', fontSize: 14 },
  })

  if (!visible) return null

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay as any}>
        <View style={styles.container as any}>
          <View style={styles.header as any}>
            <Pressable onPress={onCancel}>
              <Text style={styles.btnText as any}>Cancel</Text>
            </Pressable>
            <Text style={styles.title as any}>Edit Avatar</Text>
            <Pressable onPress={handleSave}>
              <Text style={[styles.btnText as any, styles.saveBtn as any]}>Save</Text>
            </Pressable>
          </View>

          <View
            style={styles.cropArea as any}
            // @ts-ignore
            onMouseDown={handleMouseDown}
            // @ts-ignore
            onWheel={handleWheel}
          >
            <View
              style={[
                styles.imageWrapper as any,
                {
                  width: effectiveW * scale,
                  height: effectiveH * scale,
                  marginLeft: -(effectiveW * scale) / 2,
                  marginTop: -(effectiveH * scale) / 2,
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate: `${rotation}deg` },
                  ],
                },
              ]}
            >
              <Image
                source={{ uri: imageUri }}
                style={{ width: effectiveW, height: effectiveH }}
              />
            </View>

            <View style={styles.mask as any} pointerEvents="none" />
          </View>

          <View style={styles.controls as any}>
            <View style={styles.rotateBtns as any}>
              <Pressable
                onPress={() => handleRotate('left')}
                style={styles.rotateBtn as any}
              >
                <Text style={styles.rotateIcon as any}>↺</Text>
              </Pressable>
              <Pressable
                onPress={() => handleRotate('right')}
                style={styles.rotateBtn as any}
              >
                <Text style={styles.rotateIcon as any}>↻</Text>
              </Pressable>
            </View>

            <View style={styles.sliderContainer as any}>
              <Text style={styles.sliderLabel as any}>Zoom</Text>
              <View style={styles.sliderTrack as any}>
                <View style={[styles.sliderFill as any, { width: `${sliderPercent}%` }]} />
              </View>
            </View>

            <Pressable onPress={handleReset} style={styles.resetBtn as any}>
              <Text style={styles.resetText as any}>Reset</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
