'use client'

import dynamic from 'next/dynamic'
const MarkdownViewer = dynamic(
  () => import('@/components/Post/MarkdownViewer'),
  { ssr: false }
)

interface Props {
  content: string
}

export function PostDetailBody({ content }: Props) {
  return (
    <section className="bg-gray-50 border rounded p-6 mb-8">
      <MarkdownViewer value={content} />
    </section>
  )
}