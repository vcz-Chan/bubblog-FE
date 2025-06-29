'use client'

import { useState, useEffect } from 'react'
import { getBlogById, BlogDetail } from '@/services/blogService'
import { PostDetailHeader } from '@/components/PostDetail/Header'
import { PostDetailBody }   from '@/components/PostDetail/Body'
import { PostDetailActions } from '@/components/PostDetail/Action'
import { useAuth } from '@/contexts/AuthContext'

interface PostModalProps {
  postId: string
  onClose: () => void
}

export function PostModal({ postId, onClose }: PostModalProps) {
  const { userId, isAuthenticated } = useAuth()
  const [post, setPost] = useState<BlogDetail | null>(null)

  useEffect(() => {
    getBlogById(Number(postId)).then(setPost)
  }, [postId])

  if (!post) return <div className="p-4">로딩 중…</div>

  const isMyPost = isAuthenticated && post.userId === userId

  return (
    <div className="p-4">
      <PostDetailHeader post={post} />
      <PostDetailBody content={post.content} />
      {isMyPost && <PostDetailActions postId={post.id} />}
    </div>
  )
}