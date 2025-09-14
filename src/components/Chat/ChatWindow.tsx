'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { getUserProfile, UserProfile } from '@/apis/userApi'
import { getBlogById } from '@/apis/blogApi'
import {
  askChatAPI,
  ContextItem,
  ChatMessage as ServiceChatMessage
} from '@/apis/aiApi'
import { ProfileHeader } from './ProfileHeader'
import { CategoryFilterButton } from '@/components/Category/CategoryFilterButton'
import { ChatMessages } from './ChatMessages'
import { ContextViewer } from './ContextViewer'
import { ChatInput } from './ChatInput'
import { CategorySelector } from '@/components/Category/CategorySelector'
import { PersonaSelectorModal } from '@/components/Persona/PersonaSelectorModal'
import { PersonaFilterButton } from '@/components/Persona/PersonaFilterButton'
import { Persona } from '@/apis/personaApi'
import { CategoryNode } from '@/apis/categoryApi'
import { useAuthStore, selectIsLogin } from '@/store/AuthStore'
import { truncate } from '@/utils/seo'

interface Props {
  userId: string
  postId?: number
  postTitle?: string
}

export function ChatWindow({ userId, postId, postTitle }: Props) {
  const isAuthenticated = useAuthStore(selectIsLogin)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [errorUser, setErrorUser]     = useState<string | null>(null)

  const [messages,    setMessages]    = useState<ServiceChatMessage[]>([])
  const [input,       setInput]       = useState('')
  const [contextList, setContextList] = useState<ContextItem[]>([])
  const [showContext, setShowContext] = useState(false)

  const [isCatOpen,        setIsCatOpen]        = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null)

  const [isPersonaOpen,     setIsPersonaOpen]   = useState(false)
  const [selectedPersona,   setSelectedPersona] = useState<Persona | null>(null)

  const [isSending, setIsSending] = useState(false)
  const [existInPost, setExistInPost] = useState<boolean | null>(null)
  const [currentPostTitle, setCurrentPostTitle] = useState<string | null>(postTitle ?? null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // 1) 프로필
  useEffect(() => {
    setLoadingUser(true)
    getUserProfile(userId)
      .then(p => { setProfile(p); setErrorUser(null) })
      .catch(e => setErrorUser(e.message))
      .finally(() => setLoadingUser(false))
  }, [userId])

  // 1-1) 포스트 제목 로딩 (필요 시)
  useEffect(() => {
    if (postId == null || postTitle) return
    let active = true
    getBlogById(postId)
      .then(p => { if (active) setCurrentPostTitle(p.title) })
      .catch(() => { if (active) setCurrentPostTitle(null) })
    return () => { active = false }
  }, [postId, postTitle])

  // 2) 인증
  useEffect(() => {
    if (!isAuthenticated) {
      // 로그인으로 리다이렉트하거나 에러 처리
    }
  }, [isAuthenticated])

  // 3) 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, contextList, showContext])

  // 4) 전송
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

    setMessages(prev => [...prev, userMsg, { id: botId, role: 'bot', content: '' }])
    setContextList([])
    setShowContext(false)

    try {
      await askChatAPI(
        question,
        userId,
        postId != null ? null : (selectedCategory?.id ?? null),
        selectedPersona?.id ?? -1,
        items => setContextList(items),
        chunk => {
          setMessages(prev => {
            const next = [...prev]
            const msg = next.find(m => m.id === botId)
            if (msg) msg.content += chunk
            return next
          })
        },
        { postId: postId, onExistInPostStatus: (exists) => setExistInPost(exists) }
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
    <div className="flex flex-col h-full">
      <header className="flex-none">
        <ProfileHeader profile={profile} />
        {postId != null && (
          <div className="mt-2 flex flex-row flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                existInPost === false
                  ? 'bg-gray-100 text-gray-600'
                  : existInPost === true
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {currentPostTitle
                ? `"${truncate(currentPostTitle, 40)}" 글에 대해 질문 중`
                : '이 글 범위로 질문 중'}
            </span>
            {existInPost === false && (
              <span className="text-xs text-gray-500">관련 내용을 찾지 못했어요</span>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto mt-4">
        <ChatMessages messages={messages} chatEndRef={chatEndRef} />
        <ContextViewer
          items={contextList}
          visible={showContext}
          onToggle={() => setShowContext(v => !v)}
        />
        <div ref={chatEndRef} />
      </main>

      <footer className="flex-none mt-4">
        <ChatInput
          input={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          disabled={isSending}
        >
            <div className="flex gap-2 mt-2">
          {postId == null && (
            <CategoryFilterButton
              selectedCategory={selectedCategory}
              onOpen={() => setIsCatOpen(true)}
            />
          )}
          <PersonaFilterButton
            selectedPersona={selectedPersona}
            onOpen={() => setIsPersonaOpen(true)}
          />
        </div>
        </ChatInput>
      </footer>

      {postId == null && (
        <CategorySelector
          userId={userId}
          isOpen={isCatOpen}
          onClose={() => setIsCatOpen(false)}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      )}

      <PersonaSelectorModal
        userId={userId}
        isOpen={isPersonaOpen}
        onSelect={p => setSelectedPersona(p)}
        onClose={() => setIsPersonaOpen(false)}
      />
    </div>
  )
}
