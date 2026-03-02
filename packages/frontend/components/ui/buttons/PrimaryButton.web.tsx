import React from 'react'

interface PrimaryButtonProps {
  children: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  style?: any
}

export default function PrimaryButton({
  children,
  onPress,
  disabled,
  style,
}: PrimaryButtonProps) {
  const handleClick = (e: any) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!disabled && onPress) {
      onPress()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      style={{
        backgroundColor: '#f97316',
        padding: '12px 16px',
        borderRadius: '9999px',
        border: 'none',
        outline: 'none',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: '100%',
        ...style,
      }}
    >
      <span
        style={{
          color: '#171717',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: 16,
          textAlign: 'center',
          display: 'block',
        }}
      >
        {children}
      </span>
    </button>
  )
}
