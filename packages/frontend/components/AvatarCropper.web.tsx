import React, { useState, useRef, useEffect } from 'react'
import { View, Text, Pressable, Modal, Image, StyleSheet } from 'react-native'

const CROP_SIZE = 200
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

  useEffect(() => {
    if (!visible || !imageUri) return

    const img = new window.Image()
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height })
      imageRef.current = img
      const fitScale = CROP_SIZE / Math.max(img.width, img.height)
      setScale(Math.min(fitScale * 2, 1))
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

      const maxX = Math.max(0, (scaledW - CROP_SIZE) / 2)
      const maxY = Math.max(0, (scaledH - CROP_SIZE) / 2)

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
    const fitScale = CROP_SIZE / Math.max(imageSize.width, imageSize.height)
    setScale(Math.min(fitScale * 2, 1))
    setPosition({ x: 0, y: 0 })
    setRotation(0)
  }

  const handleSave = () => {
    if (!imageRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = CROP_SIZE
    canvas.height = CROP_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.translate(CROP_SIZE / 2, CROP_SIZE / 2)
    ctx.rotate((rotation * Math.PI) / 180)

    ctx.beginPath()
    ctx.arc(0, 0, CROP_SIZE / 2, 0, Math.PI * 2)
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
      -CROP_SIZE / 2,
      -CROP_SIZE / 2,
      CROP_SIZE,
      CROP_SIZE
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
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    container: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, width: 340 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { color: '#fff', fontSize: 17, fontWeight: '600' as const },
    btnText: { color: '#999', fontSize: 16 },
    saveBtn: { color: '#ea580c', fontWeight: '600' as const },
    cropArea: { width: CROP_SIZE, height: CROP_SIZE, alignSelf: 'center', overflow: 'hidden', borderRadius: CROP_SIZE / 2, backgroundColor: '#333', position: 'relative' },
    imageWrapper: { position: 'absolute' as const, transformOrigin: 'center' as const },
    mask: { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, borderRadius: CROP_SIZE / 2, borderWidth: 2, borderColor: '#fff' },
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
            // @ts-ignore - onMouseDown is valid in React Native Web
            onMouseDown={handleMouseDown}
            // @ts-ignore - onWheel is valid in React Native Web
            onWheel={handleWheel}
          >
            <View
              style={[
                styles.imageWrapper as any,
                {
                  width: effectiveW * scale,
                  height: effectiveH * scale,
                  transform: [
                    { translateX: position.x + CROP_SIZE / 2 },
                    { translateY: position.y + CROP_SIZE / 2 },
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
