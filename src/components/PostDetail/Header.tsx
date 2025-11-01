'use client'

import Link from 'next/link'
import {
  EyeIcon,
  HandThumbUpIcon,
  UserIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import type { BlogDetail } from '@/apis/blogApi'

interface Props {
  post: BlogDetail
  children?: React.ReactNode
}

export function PostDetailHeader({ post, children }: Props) {
  return (
    <header className="mb-10 space-y-4">
      {/* 제목 */}
      <h1 className="text-4xl font-extrabold text-gray-900 font-sans">
        {post.title}
      </h1>

      {/* 작성자 & 블로그 방문 */}
      <div className="flex flex-wrap justify-end items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <UserIcon className="h-6 w-6 text-gray-400" />
          <span className="font-medium text-gray-700">
            {post.nickname}
          </span>
        </div>
        <Link
          href={`/blog/${post.userId}`}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
        >
          블로그 방문
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </Link>
        {children && (
          <div>
            {children}
          </div>
        )}
      </div>

      {/* 카테고리 & 통계 정보 */}
      <div className="
        flex flex-col md:flex-row md:items-center
        justify-between text-sm text-gray-500
        space-y-2 md:space-y-0
      ">
        {/* 카테고리 */}
        <div className="text-gray-600">
          카테고리: {post.categoryList.join(' > ')}
        </div>

        {/* 조회수 · 좋아요 · 날짜 */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <EyeIcon className="h-5 w-5 text-gray-600" />
            <span>{post.viewCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <HandThumbUpIcon className="h-5 w-5 text-gray-600" />
            <span>{post.likeCount}</span>
          </div>
          <time dateTime={post.createdAt} className="whitespace-nowrap">
            {new Date(post.createdAt).toLocaleString()}
          </time>
        </div>
      </div>
    </header>
  )
}