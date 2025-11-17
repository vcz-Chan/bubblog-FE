'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'solid' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function Button({
  children,
  variant = 'solid',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  // 공통 스타일
  const baseClasses = [
    'inline-flex items-center justify-center gap-2',
    'rounded-lg font-medium',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'transition-colors duration-200'
  ].join(' ')

  // 크기별 스타일
  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-base min-h-[40px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]'
  }

  // variant별 스타일
  const variantClasses: Record<string, string> = {
    solid:   'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900',
    outline: 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
    ghost:   'bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-500'
  }

  // disabled 스타일
  const disabledClasses = isDisabled
    ? 'opacity-60 cursor-not-allowed pointer-events-none'
    : ''

  return (
    <motion.button
      {...props}
      disabled={isDisabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
    >
      {loading && (
        <ArrowPathIcon className="h-4 w-4 animate-spin" />
      )}
      {children}
    </motion.button>
  )
}
