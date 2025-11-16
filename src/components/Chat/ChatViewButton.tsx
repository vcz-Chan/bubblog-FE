'use client'

import Link from 'next/link'
import { Button } from '@/components/Common/Button'
import { useAuthStore, selectIsLogin } from '@/store/AuthStore'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useToast } from '@/contexts/ToastContext'

interface Props {
  userId: string
  onClick: () => void
  postId?: number | string
  variant?: 'post' | 'blog'
}

export function ChatViewButton({ userId, onClick, postId, variant = 'post' }: Props) {
  const isMobile = useIsMobile()
  const isLogin = useAuthStore(selectIsLogin)
  const toast = useToast()

  const buildHref = () => `/chatbot/${userId}${postId != null ? `?postId=${postId}` : ''}`

  const handleClick = () => {
    if (!isLogin) {
      toast.info('로그인이 필요한 서비스입니다')
    }
    onClick()
  }

  if (postId == null) {
    const href = buildHref()
    return isLogin ? (
      <Link href={href}>
        <Button>챗봇 이동</Button>
      </Link>
    ) : (
      <Button onClick={handleClick}>챗봇 이동</Button>
    )
  }

  if (isMobile) {
    const href = buildHref()
    return (
      isLogin ? (
        <Link href={href}>
          <Button>챗봇 이동</Button>
        </Link>
      ) : (
        <Button onClick={handleClick}>챗봇 이동</Button>
      )
    )
  }

  return (
    <Button onClick={handleClick}>
      {variant === 'post' ? '이 글에 대해 질문하기' : '이 블로그에 대해 질문하기'}
    </Button>
  )
}
