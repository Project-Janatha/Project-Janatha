import React, { useState, useEffect, useRef } from 'react'

interface ImageCarouselProps {
  images: any[]
  interval?: number
}

function resolveImageSrc(image: any): string {
  if (!image) return ''
  if (typeof image === 'string') return image
  if (typeof image === 'object') {
    if (typeof image.default === 'string') return image.default
    if (typeof image.uri === 'string') return image.uri
  }
  return ''
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function ImageCarousel({ images, interval = 15000 }: ImageCarouselProps) {
  const [shuffledImages] = useState(() =>
    shuffleArray(images.map(resolveImageSrc).filter((src) => src.length > 0))
  )
  const [activeIndex, setActiveIndex] = useState(() =>
    shuffledImages.length > 0 ? Math.floor(Math.random() * shuffledImages.length) : 0
  )
  const [showFirst, setShowFirst] = useState(true)
  const prevIndexRef = useRef(activeIndex)

  useEffect(() => {
    if (shuffledImages.length <= 1) return

    const id = setInterval(() => {
      setActiveIndex((prev) => {
        prevIndexRef.current = prev
        return (prev + 1) % shuffledImages.length
      })
      setShowFirst((prev) => !prev)
    }, interval)

    return () => clearInterval(id)
  }, [shuffledImages.length, interval])

  // Determine which image each slot shows
  const firstSlotIndex = showFirst ? activeIndex : prevIndexRef.current
  const secondSlotIndex = showFirst ? prevIndexRef.current : activeIndex

  // Empty state
  if (shuffledImages.length === 0) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #F4DED7 0%, #E7D5CC 100%)',
        }}
      >
        {/* Decorative Chinmaya logo at low opacity */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.08,
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              border: '3px solid #1C1917',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: '"Inclusive Sans", sans-serif',
                fontSize: 96,
                fontWeight: '400',
                color: '#1C1917',
              }}
            >
              J
            </span>
          </div>
        </div>

        {/* Bottom gradient overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 200,
            background:
              'linear-gradient(to top, rgba(28,25,23,0.5) 0%, rgba(28,25,23,0.15) 50%, transparent 100%)',
          }}
        />

        {/* Janata wordmark */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: 32,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#1C1917',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontSize: 12,
                fontFamily: '"Inclusive Sans", sans-serif',
                fontWeight: '400',
              }}
            >
              J
            </span>
          </div>
          <span
            style={{
              fontFamily: '"Inclusive Sans", sans-serif',
              fontWeight: '600',
              fontSize: 16,
              color: '#FFFFFF',
            }}
          >
            Janata
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* First image slot */}
      <img
        src={shuffledImages[firstSlotIndex]}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: showFirst ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
        }}
      />

      {/* Second image slot */}
      <img
        src={shuffledImages[secondSlotIndex]}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: showFirst ? 0 : 1,
          transition: 'opacity 1s ease-in-out',
        }}
      />

      {/* Bottom gradient overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 200,
          background:
            'linear-gradient(to top, rgba(28,25,23,0.5) 0%, rgba(28,25,23,0.15) 50%, transparent 100%)',
        }}
      />

      {/* Janata wordmark */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: 32,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#1C1917',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: '#FFFFFF',
              fontSize: 12,
              fontFamily: '"Inclusive Sans", sans-serif',
              fontWeight: '400',
            }}
          >
            J
          </span>
        </div>
        <span
          style={{
            fontFamily: '"Inclusive Sans", sans-serif',
            fontWeight: '600',
            fontSize: 16,
            color: '#FFFFFF',
          }}
        >
          Janata
        </span>
      </div>
    </div>
  )
}
