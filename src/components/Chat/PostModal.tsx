'use client'

import { useState, useEffect } from 'react'
import { getBlogById, BlogDetail } from '@/apis/blogApi'
import { PostDetailHeader } from '@/components/PostDetail/Header'
import { PostDetailBody }   from '@/components/PostDetail/Body'
import { PostDetailActions } from '@/components/PostDetail/Action'
import { useAuthStore, selectUserId, selectIsLogin } from '@/store/AuthStore'

interface PostModalProps {
  postId: string
  onClose: () => void
}

export function PostModal({ postId, onClose }: PostModalProps) {
  const userId = useAuthStore(selectUserId);
  const isAuthenticated = useAuthStore(selectIsLogin);
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