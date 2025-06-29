'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/Common/Button'

interface Props {
  userId: string
  onClick: () => void
}

export function ChatViewButton({ userId, onClick }: Props) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mql.matches)
    mql.addEventListener
      ? mql.addEventListener('change', handler)
      : mql.addListener(handler)
    return () => {
      mql.removeEventListener
        ? mql.removeEventListener('change', handler)
        : mql.removeListener(handler)
    }
  }, [])

  if (isMobile) {
    return (
      <Link
        href={`/chatbot/${userId}`}
      >
        <Button>
        챗봇 이동
        </Button>
      </Link>
    )
  }

  return (
    <Button onClick={onClick}>
      이 블로그에 대해 질문하기
    </Button>
  )
}