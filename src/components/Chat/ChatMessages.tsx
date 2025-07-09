'use client'

import { ChatBubble } from './ChatBubble'

export interface ChatMessage {
  id: number
  role: 'user' | 'bot'
  content: string
}

interface Props {
  messages: ChatMessage[]
  chatEndRef: React.RefObject<HTMLDivElement | null >
}

export function ChatMessages({ messages, chatEndRef }: Props) {
  return (
    <div className="w-full flex-1 mb-4 space-y-4 px-2 overflow-y-auto overscroll-contain">
      {messages.map(msg => (
        <ChatBubble
          key={msg.id}
          content={msg.content}
          role={msg.role}
        />
      ))}
      <div ref={chatEndRef} />
    </div>
  )
}