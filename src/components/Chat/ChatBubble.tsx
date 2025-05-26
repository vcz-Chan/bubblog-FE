'use client'

interface Props {
  content: string
  role: 'user' | 'bot'
}

export function ChatBubble({ content, role }: Props) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={
          `relative max-w-[75%] p-4 rounded-xl ` +
          (isUser
            ? 'bg-purple-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none')
        }
      >
        {content}
        <span
          className={
            `absolute w-3 h-3 bg-${
              isUser ? 'purple-600' : 'gray-100'
            } ${isUser ? '-right-1 bottom-1 rotate-45' : '-left-1 bottom-1 rotate-45'}`
          }
        />
      </div>
    </div>
  )
}