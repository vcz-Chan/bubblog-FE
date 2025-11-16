'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteBlog } from '@/apis/blogApi'
import { Pencil, Trash2 } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface Props {
  postId: number
}

export function PostDetailActions({ postId }: Props) {
  const router = useRouter()
  const toast = useToast()

  const onDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await deleteBlog(postId)
      toast.success('게시글이 삭제되었습니다')
      router.push('/')
    } catch (err: any) {
      toast.error(err.message || '삭제에 실패했습니다')
    }
  }

  return (
    <div className="border-gray-200 flex justify-end items-center gap-4">
      <Link
        href={`/write?postId=${postId}`}
        className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 font-semibold rounded-lg shadow-sm hover:bg-indigo-700  hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Pencil size={16} />
        <span>수정</span>
      </Link>
      <button
        onClick={onDelete}
        className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 font-semibold rounded-lg shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <Trash2 size={16} />
        <span>삭제</span>
      </button>
    </div>
  )
}
