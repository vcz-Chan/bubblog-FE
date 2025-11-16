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
  const bgColor = isUser ? 'bg-white' : 'bg-gray-50'
  const borderColor = isUser ? 'border-gray-300' : 'border-gray-200'
  const textColor = 'text-gray-900'

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
          relative max-w-[80%] px-5 py-3.5
          ${bgColor} ${textColor} ${borderColor}
          border-2 rounded-2xl
          shadow-sm hover:shadow-md
          transition-shadow duration-200
        `}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
          opacity: { duration: 0.3 }
        }}
        style={{ backfaceVisibility: 'hidden', WebkitFontSmoothing: 'antialiased' }}
      >
        {loading && !content ? (
          <div className="py-1"><ThreeDotsLoader colorClass="bg-gray-400" /></div>
        ) : (
          <div className="space-y-2">
            <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{content}</p>
            {/* 타임스탬프 */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-400">
                {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {!isUser && (
                <motion.button
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigator.clipboard.writeText(content)}
                >
                  복사
                </motion.button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
