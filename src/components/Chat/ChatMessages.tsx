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
    <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2">
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