'use client'

import Link from 'next/link'

export function BlogControls() {
  return (
    <div className="flex gap-4 mb-6">
      <Link href="/write">
        <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
          새 글 작성
        </button>
      </Link>
      <Link href="/settings">
        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
          블로그 설정
        </button>
      </Link>
    </div>
  )
}