'use client'

import { Blog } from '@/services/blogService'
import { PostCard } from '../Post/PostCard'
import Link from 'next/link'

interface Props {
  posts?: Blog[]
  isMyBlog: boolean
  onDelete: (id: number) => void
}

export function PostsGrid({ posts = [], isMyBlog, onDelete }: Props) {
  if (posts.length === 0) {
    return <p className="text-center text-gray-500">등록된 글이 없습니다.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post}>
          {isMyBlog && (
            <>
              <Link
                href={`/edit/${post.id}`}
                className="text-green-600 hover:underline text-sm"
              >
                수정
              </Link>
              <button
                onClick={() => onDelete(post.id)}
                className="text-red-500 hover:underline text-sm"
              >
                삭제
              </button>
            </>
          )}
        </PostCard>
      ))}
    </div>
  )
}