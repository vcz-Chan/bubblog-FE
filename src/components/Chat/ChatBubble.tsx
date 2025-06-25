'use client'

interface Props {
  content: string
  role: 'user' | 'bot'
}

export function ChatBubble({ content, role }: Props) {
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
    <div className={`flex ${alignment} mb-4 px-4`}>
      <div
        className={`
          relative max-w-[75%] px-6 py-4
          ${bgColor} ${textColor}
          ${bubbleCorners}
          shadow
        `}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {/* 꼬리 삼각형 */}
        <div
          className={`
            absolute bottom-0 ${trianglePos}
            w-3 h-3 ${bgColor}
            rotate-45
          `}
        />
      </div>
    </div>
  )
}