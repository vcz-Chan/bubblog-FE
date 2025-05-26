'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getBlogById, BlogDetail } from '@/services/blogService'

import { PostDetailHeader } from '@/components/PostDetail/Header'
import { PostDetailBody }   from '@/components/PostDetail/Body'
import { PostDetailActions } from '@/components/PostDetail/Action'

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const router = useRouter()
  const { userId, isAuthenticated } = useAuth()

  const [post, setPost] = useState<BlogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    setLoading(true)
    getBlogById(Number(postId))
      .then(setPost)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [isAuthenticated, postId])

  if (!isAuthenticated) return <p className="text-center py-20">로그인 중…</p>
  if (loading)           return <p className="text-center py-20">로딩 중…</p>
  if (error)             return <p className="text-center py-20 text-red-500">{error}</p>
  if (!post)             return <p className="text-center py-20">게시글을 찾을 수 없습니다.</p>

  const isMyPost = post.userId === userId

  return (
    <article className="max-w-4xl mx-auto p-6 space-y-8">
      <PostDetailHeader post={post} />
      <PostDetailBody    content={post.content} />
      {isMyPost && <PostDetailActions postId={post.id} />}
    </article>
  )
}