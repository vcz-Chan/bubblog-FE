'use client'

import Link from 'next/link'
import { BlogDetail } from '@/services/blogService'

interface Props {
  post: BlogDetail
}

export function PostDetailHeader({ post }: Props) {
  return (
    <header className="space-y-4 mb-8">
      {/* 제목 */}
      <h1 className="text-3xl font-bold text-gray-800">{post.title}</h1>

      {/* 작성자·방문 버튼·날짜 */}
      <div className="flex items-center text-sm text-gray-500 space-x-3">
        <span className="flex items-center space-x-2">
          <span>{post.nickname}</span>
          <Link
            href={`/blog/${post.userId}`}
            className="
              text-xs font-medium
              px-2 py-1
              bg-blue-100 text-blue-600
              rounded
              hover:bg-blue-200
              transition
            "
          >
            블로그 방문
          </Link>
        </span>
        <span>•</span>
        <time dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleString()}
        </time>
      </div>

      {/* 카테고리 */}
      <div className="text-sm text-gray-600">
        카테고리: {post.categoryList.join(' > ')}
      </div>
    </header>
  )
}