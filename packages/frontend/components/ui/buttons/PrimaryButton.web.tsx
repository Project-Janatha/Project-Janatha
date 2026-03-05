import React from 'react'

interface PrimaryButtonProps {
  children: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  style?: any
  className?: string
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
      className="bg-primary px-4 py-3 rounded-full active:bg-primary-press disabled:opacity-50 cursor-pointer w-full"
      style={{ border: 'none', outline: 'none', ...style }}
    >
      <span className="text-backgroundStrong font-inter text-base text-center block">
        {children}
      </span>
    </button>
  )
}
