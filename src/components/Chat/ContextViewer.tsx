'use client'
import Link from "next/link"

export interface ContextItem {
  post_id: string
  post_title: string
  post_chunk: string
}

interface Props {
  items: ContextItem[]
  visible: boolean
  onToggle: () => void
}

export function ContextViewer({ items, visible, onToggle }: Props) {
  return (
    <>
      {items.length > 0 && (
        <button
          onClick={onToggle}
          className="mb-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition"
        >
          {visible ? '컨텍스트 숨기기' : '관련 문서 보기'}
        </button>
      )}
      {visible && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          {items.map(ctx => (
            <Link href={`/post/${ctx.post_id}`}>
              <div className="font-semibold">{ctx.post_title}</div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}