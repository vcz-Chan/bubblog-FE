// components/PostDetail/PostNavbar.tsx
'use client'

import Link from 'next/link'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  HeartIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import type { BlogDetail } from '@/apis/blogApi'

interface Props {
  post: BlogDetail
  liked: boolean
  onLike: () => void
}

export function PostNavbar({ post, liked, onLike }: Props) {
  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () =>
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    })

  return (
    <nav className="fixed bottom-4 right-8 lg:right-0 lg:w-40 lg:pr-8 lg:top-1/3 lg:z-20">
      <div className="
        flex flex-row lg:w-10 lg:flex-col items-center m-auto
        bg-white/90 backdrop-blur-sm
        rounded-xl shadow-lg
      ">
        <button
          onClick={scrollToTop}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="위로 이동"
        >
          <ChevronUpIcon className="h-5 w-5 text-gray-600" />
        </button>

        <button
          onClick={scrollToBottom}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="아래로 이동"
        >
          <ChevronDownIcon className="h-5 w-5 text-gray-600" />
        </button>

        <button
          onClick={onLike}
          className={`
            relative p-2 rounded-full transition
            ${liked ? 'bg-red-100' : 'hover:bg-gray-100'}
          `}
          aria-label="좋아요 토글"
        >
          <HeartIcon
            className={`
              h-5 w-5 transition
              ${liked
                ? 'text-red-600'
                : 'text-gray-600 hover:text-red-600'}
            `}
          />
        </button>
        <span className="text-xs text-gray-700">
            {post.likeCount}
        </span>

        <Link
          href={`/blog/${post.userId}`}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="블로그 방문"
        >
          <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-600" />
        </Link>
      </div>
    </nav>
  )
}