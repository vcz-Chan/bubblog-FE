'use client'

export const BREAKPOINT = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

export const MEDIA = {
  mdDown: `(max-width: ${BREAKPOINT.md}px)`,
} as const

