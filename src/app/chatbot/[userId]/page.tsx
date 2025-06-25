'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getUserProfile, UserProfile } from '@/services/userService'
import {
  askChat,
  ContextItem,
  ChatMessage as ServiceChatMessage
} from '@/services/aiService'
import { ProfileHeader } from '@/components/Chat/ProfileHeader'
import { CategoryFilterButton } from '@/components/Category/CategoryFilterButton'
import { ChatMessages } from '@/components/Chat/ChatMessages'
import { ContextViewer } from '@/components/Chat/ContextViewer'
import { ChatInput } from '@/components/Chat/ChatInput'
import { CategorySelector } from '@/components/Category/CategorySelector'
import { PersonaSelectorModal } from '@/components/Persona/PersonaSelectorModal'
import { PersonaFilterButton } from '@/components/Persona/PersonaFilterButton'
import { Persona } from '@/services/personaService'
import { CategoryNode } from '@/services/categoryService'

export default function ChatPage() {
  const { userId } = useParams<{ userId: string }>()
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [errorUser, setErrorUser] = useState<string | null>(null)

  const [messages, setMessages] = useState<ServiceChatMessage[]>([
    { id: 1, role: 'bot', content: '안녕하세요! 무엇을 도와드릴까요?' },
  ])
  const [input, setInput] = useState('')
  const [contextList, setContextList] = useState<ContextItem[]>([])
  const [showContext, setShowContext] = useState(false)

  const [isCatOpen, setIsCatOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null)

  // 새로 추가: 페르소나 선택 모달
  const [isPersonaOpen, setIsPersonaOpen] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)

  const [isSending, setIsSending] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userId) return
    setLoadingUser(true)
    getUserProfile(userId)
      .then(p => { setProfile(p); setErrorUser(null) })
      .catch(err => setErrorUser(err.message))
      .finally(() => setLoadingUser(false))
  }, [userId])

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, contextList, showContext])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSending || !input.trim()) return

    setIsSending(true)
    const question = input.trim()
    const userMsg: ServiceChatMessage = {
      id: messages.length + 1,
      role: 'user',
      content: question,
    }
    const botId = userMsg.id + 1

    setMessages(prev => [
      ...prev,
      userMsg,
      { id: botId, role: 'bot', content: '' },
    ])
    setContextList([])
    setShowContext(false)

    try {
      await askChat(
        question,
        userId!,
        selectedCategory?.id ?? null,
        selectedPersona?.id ?? -1,
        items => setContextList(items),
        chunk => {
          setMessages(prev => {
            const next = [...prev]
            const msg = next.find(m => m.id === botId)
            if (msg) msg.content += chunk
            return next
          })
        }
      )
    } catch {
      setMessages(prev => {
        const next = [...prev]
        const msg = next.find(m => m.id === botId)
        if (msg) msg.content = '서버 요청 중 오류가 발생했습니다.'
        return next
      })
    } finally {
      setIsSending(false)
      setInput('')
    }
  }

  if (loadingUser) return <p>프로필 로딩 중…</p>
  if (errorUser)   return <p className="text-red-500">{errorUser}</p>
  if (!profile)    return null

  return (
    <div className="max-w-3xl p-6 w-full bg-white rounded-4xl">
      <ProfileHeader profile={profile} />

      <div className="flex gap-2 mb-4">
        <CategoryFilterButton
          selectedCategory={selectedCategory}
          onOpen={() => setIsCatOpen(true)}
        />
        <PersonaFilterButton
          selectedPersona={selectedPersona}
          onOpen={() => setIsPersonaOpen(true)}
        />
      </div>

      <CategorySelector
        userId={userId!}
        isOpen={isCatOpen}
        onClose={() => setIsCatOpen(false)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <PersonaSelectorModal
        userId={userId!}
        isOpen={isPersonaOpen}
        onSelect={p => setSelectedPersona(p)}
        onClose={() => setIsPersonaOpen(false)}
      />

      <ChatMessages messages={messages} chatEndRef={chatEndRef} />

      <ContextViewer
        items={contextList}
        visible={showContext}
        onToggle={() => setShowContext(v => !v)}
      />

      <ChatInput
        input={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        disabled={isSending}
      />

    </div>
  )
}