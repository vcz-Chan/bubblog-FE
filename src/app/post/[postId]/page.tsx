'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore, selectUserId, selectIsLogin } from '@/store/AuthStore'
import { getBlogById, BlogDetail, putPostView, putPostLike } from '@/apis/blogApi'

import { PostDetailHeader } from '@/components/PostDetail/Header'
import { PostDetailBody }   from '@/components/PostDetail/Body'
import { PostDetailActions } from '@/components/PostDetail/Action'
import { PostNavbar } from '@/components/PostDetail/PostNavbar'
import { DraggableModal }   from '@/components/Common/DraggableModal'
import { ChatViewButton  }   from '@/components/Chat/ChatViewButton'
import { ChatWindow }       from '@/components/Chat/ChatWindow'

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const router = useRouter()
  const authUserId = useAuthStore(selectUserId);
  const isAuthenticated = useAuthStore(selectIsLogin);

  const [post, setPost] = useState<BlogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked]     = useState(false)
  const [showChat, setShowChat] = useState(false)

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

  // 조회수
  useEffect(() => {
    if (!post) return

    const timer = setTimeout(() => {
      putPostView(post.id).catch(console.error)
    }, 30000)

    return () => clearTimeout(timer)
  }, [post])

const handleLike = async () => {
    if (!post) return

    try {
      if (liked) {
        await putPostLike(post.id)
        setPost({ ...post, likeCount: post.likeCount - 1 })
        setLiked(false)
      } else {
        await putPostLike(post.id)
        setPost({ ...post, likeCount: post.likeCount + 1 })
        setLiked(true)
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (!isAuthenticated) return <p className="text-center py-20">로그인 중…</p>
  if (loading)           return <p className="text-center py-20">로딩 중…</p>
  if (error)             return <p className="text-center py-20 text-red-500">{error}</p>
  if (!post)             return <p className="text-center py-20">게시글을 찾을 수 없습니다.</p>

  const isMyPost = post.userId === authUserId

  return (
    <article className="w-full p-8 lg:px-40">
      <PostDetailHeader post={post} >
      <ChatViewButton userId={post.userId} onClick={() => setShowChat(true)}/>
      </PostDetailHeader>
      <PostNavbar post={post} liked={liked} onLike={handleLike} />
      {showChat && (
        <DraggableModal
          path= {`/chatbot/${post.userId}`}
          onClose={() => setShowChat(false)}
        >
          {/* author의 userId로 채팅창 */}
          <ChatWindow userId={post.userId} />
        </DraggableModal>
      )}
        
      <PostDetailBody    content={post.content} />
      {isMyPost && <PostDetailActions postId={post.id} />}
    </article>
  )
}