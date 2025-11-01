'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { getBlogById } from '@/apis/blogApi'
import { getUserProfile, UserProfile } from '@/apis/userApi'
import { askChatAPI, askChatAPIV2 } from '@/apis/aiApi'
import { ProfileHeader } from '@/components/Chat/ProfileHeader'
import { CategoryFilterButton } from '@/components/Category/CategoryFilterButton'
import { ChatMessages, type ChatMessage as UIChatMessage, type InspectorData } from '@/components/Chat/ChatMessages'
import { ChatInput } from '@/components/Chat/ChatInput'
import { DraggableModal } from '@/components/Common/DraggableModal'
import { PostModal } from '@/components/Chat/PostModal'
import { CategorySelector } from '@/components/Category/CategorySelector'
import { PersonaSelectorModal } from '@/components/Persona/PersonaSelectorModal'
import { PersonaFilterButton } from '@/components/Persona/PersonaFilterButton'
import { Persona } from '@/apis/personaApi'
import { CategoryNode } from '@/apis/categoryApi'
import { VersionToggle } from '@/components/Chat/VersionToggle'

export default function ChatPage() {
  const { userId } = useParams<{ userId: string }>()
  const searchParams = useSearchParams()
  const postIdParam = searchParams.get('postId')
  const postId = postIdParam ? Number(postIdParam) : undefined
  const [postTitle, setPostTitle] = useState<string | null>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [errorUser, setErrorUser] = useState<string | null>(null)

  const [messages, setMessages] = useState<UIChatMessage[]>([])
  const [input, setInput] = useState('')
  const [askVersion, setAskVersion] = useState<'v1' | 'v2'>('v1')

  const [isCatOpen, setIsCatOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null)

  const [isPersonaOpen, setIsPersonaOpen] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)

  const [isSending, setIsSending] = useState(false)

  const [modalPostId, setModalPostId] = useState<string | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userId) return
    setLoadingUser(true)
    getUserProfile(userId)
      .then(p => { setProfile(p); setErrorUser(null) })
      .catch(err => setErrorUser(err.message))
      .finally(() => setLoadingUser(false))
  }, [userId])

  // 포스트 타이틀 로딩 (postId가 있을 때)
  useEffect(() => {
    if (postId == null) {
      setPostTitle(null)
      return
    }
    let active = true
    getBlogById(postId)
      .then(p => { if (active) setPostTitle(p.title) })
      .catch(() => { if (active) setPostTitle(null) })
    return () => { active = false }
  }, [postId])

  

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

    setMessages(prev => [
      ...prev,
      userMsg,
      { id: botId, role: 'bot', content: '', inspector: initialInspector },
    ])

    try {
      if (askVersion === 'v1') {
        await askChatAPI(
          question,
          userId!,
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
          { postId }
        )
      } else {
        await askChatAPIV2(
          question,
          userId!,
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
    <div className='bg-[rgb(244,246,248)] w-full h-full'>
      <div className="px-6 md:px-16 w-full flex flex-col items-center overflow-hidden max-h-full">
        <div className='flex gap-2 w-full justify-between sticky top-0 z-10 py-8 bg-[rgb(244,246,248)] flex-wrap max-w-5xl'>
          <ProfileHeader profile={profile} />
          {postId != null && (
            <div className='my-auto'>
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                {postTitle ? `"${postTitle}" 글에 대해 질문 중` : '이 글 범위로 질문 중'}
              </span>
            </div>
          )}
        </div>
      
        <div className="flex flex-col items-center justify-center w-full max-w-5xl overflow-hidden max-h-full">
          {postId == null && (
            <CategorySelector
              userId={userId!}
              isOpen={isCatOpen}
              onClose={() => setIsCatOpen(false)}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          )}

          <PersonaSelectorModal
            userId={userId!}
            isOpen={isPersonaOpen}
            onSelect={p => setSelectedPersona(p)}
            onClose={() => setIsPersonaOpen(false)}
          />

          {/* 채팅 메시지 구간 (스크롤) */}
          <ChatMessages
            messages={messages}
            chatEndRef={chatEndRef}
            onToggleInspector={(id) => {
              setMessages(prev => prev.map(m => (m.id === id && m.inspector) ? { ...m, inspector: { ...m.inspector, open: !m.inspector.open } } : m))
            }}
            onInspectorItemClick={(_id, item) => setModalPostId(item.post_id)}
          />
          {messages.length === 0 && (
            <div className="flex justify-center items-center h-[25vh]">
              {postId != null ? (
                <span className="text-2xl md:text-4xl text-gray-800 text-center">이 글에 대해 물어보세요</span>
              ) : (
                <span className="text-2xl md:text-4xl text-gray-800 text-center">블로그에 대해 물어보세요</span>
              )}
            </div>
          )}
          

          {modalPostId && (
            <DraggableModal path= {`/post/${modalPostId}`} onClose={() => setModalPostId(null)}>
              <PostModal postId={modalPostId} onClose={() => setModalPostId(null)} />
            </DraggableModal>
          )}

          <ChatInput
            input={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            disabled={isSending}
          >
            <div className='flex md:gap-4 items-center md:mr-4'>
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
        </div>
      </div>
    </div>
  )
}
