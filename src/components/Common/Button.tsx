'use client'

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={
        `w-full py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 ` +
        `bg-blue-600 text-white hover:bg-blue-700 ` +
        className
      }
    >
      {children}
    </button>
  )
}