'use client'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { MEDIA } from '@/utils/breakpoints'

export function useIsMobile(): boolean {
  return useMediaQuery(MEDIA.mdDown)
}

