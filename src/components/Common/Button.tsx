'use client'

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost'
  children: React.ReactNode
}

export function Button({
  children,
  variant = 'solid',
  className = '',
  ...props
}: ButtonProps) {
  // 공통 스타일
  const baseClasses = [
    'inline-flex items-center justify-center',
    'px-4 py-2 rounded-lg font-medium',
    'transition-transform transform hover:scale-105 hover:shadow-md',
    'focus:outline-none focus:ring-2 focus:ring-offset-2'
  ].join(' ')

  // 색상 지정 제거 → variant별로 중립 컬러만 남김
  const variantClasses: Record<string, string> = {
    solid:   'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900',
    outline: 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
    ghost:   'bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-500'
  }

  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}