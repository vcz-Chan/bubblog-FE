'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteBlog } from '@/apis/blogApi'

interface Props {
  postId: number
}

// 블로그 글 상세 페이지의 액션 컴포넌트 
export function PostDetailActions({ postId }: Props) {
  const router = useRouter()

  const onDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await deleteBlog(postId)
      router.push('/')
    } catch {
      alert('삭제에 실패했습니다.')
    }
  }

  return (
    <div className="flex gap-4">
      <Link
        href={`/write?postId=${postId}`}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        수정하기
      </Link>
      <button
        onClick={onDelete}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        삭제하기
      </button>
    </div>
  )
}