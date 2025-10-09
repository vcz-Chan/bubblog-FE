'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { getUserProfile, UserProfile } from '@/apis/userApi'
import { getBlogById } from '@/apis/blogApi'
import { askChatAPI, askChatAPIV2 } from '@/apis/aiApi'
import { ProfileHeader } from './ProfileHeader'
import { CategoryFilterButton } from '@/components/Category/CategoryFilterButton'
import { ChatMessages, type ChatMessage as UIChatMessage, type InspectorData } from './ChatMessages'
import { ChatInput } from './ChatInput'
import { CategorySelector } from '@/components/Category/CategorySelector'
import { PersonaSelectorModal } from '@/components/Persona/PersonaSelectorModal'
import { PersonaFilterButton } from '@/components/Persona/PersonaFilterButton'
import { Persona } from '@/apis/personaApi'
import { CategoryNode } from '@/apis/categoryApi'
import { useAuthStore, selectIsLogin } from '@/store/AuthStore'
import { truncate } from '@/utils/seo'
import { VersionToggle } from '@/components/Chat/VersionToggle'

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

  const [messages,    setMessages]    = useState<UIChatMessage[]>([])
  const [input,       setInput]       = useState('')
  const [askVersion, setAskVersion] = useState<'v1' | 'v2'>('v1')

  const [isCatOpen,        setIsCatOpen]        = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null)

  const [isPersonaOpen,     setIsPersonaOpen]   = useState(false)
  const [selectedPersona,   setSelectedPersona] = useState<Persona | null>(null)

  const [isSending, setIsSending] = useState(false)
  const [existInPost, setExistInPost] = useState<boolean | null>(null)
  const [currentPostTitle, setCurrentPostTitle] = useState<string | null>(postTitle ?? null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoadingUser(true)
    getUserProfile(userId)
      .then(p => { setProfile(p); setErrorUser(null) })
      .catch(e => setErrorUser(e.message))
      .finally(() => setLoadingUser(false))
  }, [userId])

  useEffect(() => {
    if (postId == null || postTitle) return
    let active = true
    getBlogById(postId)
      .then(p => { if (active) setCurrentPostTitle(p.title) })
      .catch(() => { if (active) setCurrentPostTitle(null) })
    return () => { active = false }
  }, [postId, postTitle])

  useEffect(() => {
    if (!isAuthenticated) {
      // optionally handle auth redirect
    }
  }, [isAuthenticated])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSending || !input.trim()) return

    setIsSending(true)
    const question = input.trim()
    const userMsg: UIChatMessage = {
      id: messages.length + 1,
      role: 'user',
      content: question,
    }
    const botId = userMsg.id + 1

    const initialInspector: InspectorData =
      askVersion === 'v1'
        ? { version: 'v1', open: false, v1Context: [], v1ContextReceived: false, pending: true }
        : {
            version: 'v2',
            open: false,
            v2Plan: null,
            v2PlanReceived: false,
            v2Rewrites: [],
            v2RewritesReceived: false,
            v2Keywords: [],
            v2KeywordsReceived: false,
            v2HybridResult: [],
            v2HybridResultReceived: false,
            v2SearchResult: [],
            v2SearchResultReceived: false,
            v2Context: [],
            v2ContextReceived: false,
            pending: true,
          }

    setMessages(prev => [...prev, userMsg, { id: botId, role: 'bot', content: '', inspector: initialInspector }])

    try {
      if (askVersion === 'v1') {
        await askChatAPI(
          question,
          userId,
          postId != null ? null : (selectedCategory?.id ?? null),
          selectedPersona?.id ?? -1,
          items => {
            setMessages(prev => {
              const next = [...prev]
              const msg = next.find(m => m.id === botId)
              if (msg && msg.inspector) {
                msg.inspector.v1Context = items
                msg.inspector.v1ContextReceived = true
                msg.inspector.pending = false
              }
              return next
            })
          },
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
      } else {
        await askChatAPIV2(
          question,
          userId,
          postId != null ? null : (selectedCategory?.id ?? null),
          selectedPersona?.id ?? -1,
          {
            onSearchPlan: p => setMessages(prev => {
              const next = [...prev]
              const msg = next.find(m => m.id === botId)
              if (msg?.inspector) {
                msg.inspector.v2Plan = p
                msg.inspector.v2PlanReceived = true
                msg.inspector.pending = false
              }
              return next
            }),
            onRewrites: r => setMessages(prev => {
              const next = [...prev]
              const msg = next.find(m => m.id === botId)
              if (msg?.inspector) {
                msg.inspector.v2Rewrites = r
                msg.inspector.v2RewritesReceived = true
                msg.inspector.pending = false
              }
              return next
            }),
            onKeywords: k => setMessages(prev => {
              const next = [...prev]
              const msg = next.find(m => m.id === botId)
              if (msg?.inspector) {
                msg.inspector.v2Keywords = k
                msg.inspector.v2KeywordsReceived = true
                msg.inspector.pending = false
              }
              return next
            }),
            onHybridResult: items => setMessages(prev => {
              const next = [...prev]
              const msg = next.find(m => m.id === botId)
              if (msg?.inspector) {
                msg.inspector.v2HybridResult = items
                msg.inspector.v2HybridResultReceived = true
                msg.inspector.pending = false
              }
              return next
            }),
            onSearchResult: items => setMessages(prev => {
              const next = [...prev]
              const msg = next.find(m => m.id === botId)
              if (msg?.inspector) {
                msg.inspector.v2SearchResult = items
                msg.inspector.v2SearchResultReceived = true
                msg.inspector.pending = false
              }
              return next
            }),
            onExistInPostStatus: exists => setExistInPost(exists),
            onContext: items => setMessages(prev => {
              const next = [...prev]
              const msg = next.find(m => m.id === botId)
              if (msg?.inspector) {
                msg.inspector.v2Context = items
                msg.inspector.v2ContextReceived = true
                msg.inspector.pending = false
              }
              return next
            }),
            onAnswerChunk: chunk => {
              setMessages(prev => {
                const next = [...prev]
                const msg = next.find(m => m.id === botId)
                if (msg) msg.content += chunk
                return next
              })
            },
            onError: (message) => {
              setMessages(prev => {
                const next = [...prev]
                const msg = next.find(m => m.id === botId)
                if (msg) msg.content = message || '서버 요청 중 오류가 발생했습니다.'
                return next
              })
            }
          },
          { postId }
        )
      }
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

      <main className="flex-1 mt-4">
        <ChatMessages
          messages={messages}
          chatEndRef={chatEndRef}
          onToggleInspector={(id) => {
            setMessages(prev => prev.map(m => (m.id === id && m.inspector) ? { ...m, inspector: { ...m.inspector, open: !m.inspector.open } } : m))
          }}
        />
      </main>

      <footer className="flex-none mt-4">
        <ChatInput
          input={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          disabled={isSending}
        >
          <div className="flex gap-2 mt-2 items-center">
            <VersionToggle value={askVersion} onChange={setAskVersion} disabled={isSending} />
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
