'use client'

import { motion } from 'framer-motion'
import { ThreeDotsLoader } from '@/components/Common/ThreeDotsLoader'

interface Props {
  content: string
  role: 'user' | 'bot'
  loading?: boolean
}

export function ChatBubble({ content, role, loading = false }: Props) {
  const isUser = role === 'user'

  // 조건부 클래스 분리
  const alignment = isUser ? 'justify-end' : 'justify-start'
  const bgColor = isUser ? 'bg-purple-600' : 'bg-gray-200'
  const textColor = isUser ? 'text-white' : 'text-gray-900'
  const bubbleCorners = isUser
    ? 'rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-none'
    : 'rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-lg'
  const trianglePos = isUser
    ? 'right-0 translate-x-1/2'
    : 'left-0 -translate-x-1/2'

  return (
    <motion.div
      className={`flex ${alignment} mb-4 px-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ backfaceVisibility: 'hidden', perspective: 1000 }}
    >
      <motion.div
        className={`
          relative max-w-[75%] px-6 py-4
          ${bgColor} ${textColor}
          ${bubbleCorners}
          shadow
        `}
        whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
        transition={{ duration: 0.2 }}
        style={{ backfaceVisibility: 'hidden', WebkitFontSmoothing: 'antialiased' }}
      >
        {loading && !content ? (
          <div className="py-1"><ThreeDotsLoader colorClass={isUser ? 'bg-white/80' : 'bg-gray-500'} /></div>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
        {/* 꼬리 삼각형 */}
        <div
          className={`
            absolute bottom-0 ${trianglePos}
            w-3 h-3 ${bgColor}
            rotate-45
          `}
        />
      </motion.div>
    </motion.div>
  )
}
