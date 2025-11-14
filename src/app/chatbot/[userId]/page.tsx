'use client'

import { useState, useRef, useEffect, FormEvent, useCallback, useMemo } from 'react'
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
import { SessionListPanel } from '@/components/Chat/SessionListPanel'
import { useChatSessions } from '@/hooks/useChatSessions'
import { useSessionMessages } from '@/hooks/useSessionMessages'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useAuthStore } from '@/store/AuthStore'
import { useChatSessionStore } from '@/store/ChatSessionStore'

export default function ChatPage() {
  const { userId } = useParams<{ userId: string }>()
  const searchParams = useSearchParams()
  const postIdParam = searchParams.get('postId')
  const postId = postIdParam ? Number(postIdParam) : undefined
  const [postTitle, setPostTitle] = useState<string | null>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [errorUser, setErrorUser] = useState<string | null>(null)

  const [liveMessages, setLiveMessages] = useState<UIChatMessage[]>([])
  const [input, setInput] = useState('')
  const [askVersion, setAskVersion] = useState<'v1' | 'v2'>('v1')

  const [isCatOpen, setIsCatOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null)

  const [isPersonaOpen, setIsPersonaOpen] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)

  const [isSending, setIsSending] = useState(false)

  const [modalPostId, setModalPostId] = useState<string | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const tempIdRef = useRef(-1)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const viewerId = useAuthStore(state => state.userId)

  const {
    sessions,
    sessionsLoading,
    sessionsLoadingMore,
    sessionsError,
    sessionsPaging,
    currentSessionId,
    isSessionPanelOpen,
    selectSession,
    setPanelOpen,
    loadMore,
  } = useChatSessions(userId, { limit: 20 })
  const {
    messages: historyMessages,
    paging: historyPaging,
    isLoading: historyLoading,
    error: historyError,
    isFetchingOlder,
    loadOlder,
  } = useSessionMessages(currentSessionId, { limit: 20 })
  const upsertSessionFromStream = useChatSessionStore(state => state.upsertSessionFromStream)
  const updateSessionMeta = useChatSessionStore(state => state.updateSessionMeta)
  const fetchSessionMessages = useChatSessionStore(state => state.fetchMessages)
  const historyUiMessages = useMemo<UIChatMessage[]>(() => {
    return historyMessages.map(msg => ({
      id: msg.id,
      role: msg.role === 'assistant' ? 'bot' : 'user',
      content: msg.content,
    }))
  }, [historyMessages])
  const combinedMessages = useMemo(() => [...historyUiMessages, ...liveMessages], [historyUiMessages, liveMessages])

  useEffect(() => {
    if (isDesktop) setPanelOpen(true)
  }, [isDesktop, setPanelOpen])

  const handleSelectSession = useCallback(
    (sessionId: number | null) => {
      selectSession(sessionId)
      setLiveMessages([])
      if (!isDesktop) setPanelOpen(false)
    },
    [selectSession, isDesktop, setPanelOpen]
  )

  const handleOpenPanel = () => setPanelOpen(true)
  const handleClosePanel = () => setPanelOpen(false)

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
  }, [combinedMessages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSending || !input.trim()) return

    setIsSending(true)
    const question = input.trim()
    const userMsgId = tempIdRef.current--
    const botId = tempIdRef.current--
    const userMsg: UIChatMessage = {
      id: userMsgId,
      role: 'user',
      content: question,
    }

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

    setLiveMessages(prev => [
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
            setLiveMessages(prev => {
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
            setLiveMessages(prev => {
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
            onSearchPlan: p => setLiveMessages(prev => {
              const next = [...prev]
              const msg = next.find(m => m.id === botId)
              if (msg?.inspector) {
                msg.inspector.v2Plan = p
                msg.inspector.v2PlanReceived = true
                msg.inspector.pending = false
              }
              return next
            }),
            onRewrites: r => setLiveMessages(prev => {
              const next = [...prev]
              const msg = next.find(m => m.id === botId)
              if (msg?.inspector) {
                msg.inspector.v2Rewrites = r
                msg.inspector.v2RewritesReceived = true
                msg.inspector.pending = false
              }
              return next
            }),
            onKeywords: k => setLiveMessages(prev => {
              const next = [...prev]
              const msg = next.find(m => m.id === botId)
              if (msg?.inspector) {
                msg.inspector.v2Keywords = k
                msg.inspector.v2KeywordsReceived = true
                msg.inspector.pending = false
              }
              return next
            }),
            onHybridResult: items => setLiveMessages(prev => {
              const next = [...prev]
              const msg = next.find(m => m.id === botId)
              if (msg?.inspector) {
                msg.inspector.v2HybridResult = items
                msg.inspector.v2HybridResultReceived = true
                msg.inspector.pending = false
              }
              return next
            }),
            onSearchResult: items => setLiveMessages(prev => {
              const next = [...prev]
              const msg = next.find(m => m.id === botId)
              if (msg?.inspector) {
                msg.inspector.v2SearchResult = items
                msg.inspector.v2SearchResultReceived = true
                msg.inspector.pending = false
              }
              return next
            }),
            onContext: items => setLiveMessages(prev => {
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
              setLiveMessages(prev => {
                const next = [...prev]
                const msg = next.find(m => m.id === botId)
                if (msg) msg.content += chunk
                return next
              })
            },
            onSession: payload => {
              upsertSessionFromStream(payload)
              selectSession(payload.session_id)
            },
            onSessionSaved: payload => {
              updateSessionMeta(payload.session_id, { updated_at: new Date().toISOString() })
              fetchSessionMessages(payload.session_id, { direction: 'backward', mode: 'replace' }).finally(() => {
                setLiveMessages([])
              })
            },
            onSessionError: payload => {
              const message = payload.reason || payload.message || '세션 저장 중 오류가 발생했습니다.'
              setLiveMessages(prev => {
                const next = [...prev]
                const msg = next.find(m => m.id === botId)
                if (msg) msg.content = message
                return next
              })
            },
            onError: (message) => {
              setLiveMessages(prev => {
                const next = [...prev]
                const msg = next.find(m => m.id === botId)
                if (msg) msg.content = message || '서버 요청 중 오류가 발생했습니다.'
                return next
              })
            }
          },
          {
            postId,
            sessionId: currentSessionId ?? null,
            requesterUserId: viewerId ?? null,
          }
        )
      }
    } catch {
      setLiveMessages(prev => {
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
    <div className='bg-[rgb(244,246,248)] w-full min-h-screen'>
      <div className="flex min-h-screen w-full">
        <div className="relative hidden h-full w-72 border-r border-gray-200 lg:flex lg:shrink-0">
          <SessionListPanel
            sessions={sessions}
            loading={sessionsLoading}
            loadingMore={sessionsLoadingMore}
            error={sessionsError}
            selectedSessionId={currentSessionId}
            onSelect={handleSelectSession}
            onLoadMore={loadMore}
            hasMore={sessionsPaging?.has_more}
            className="lg:block"
          />
        </div>

        {!isDesktop && isSessionPanelOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={handleClosePanel} />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[90%] shadow-xl">
              <SessionListPanel
                sessions={sessions}
                loading={sessionsLoading}
                loadingMore={sessionsLoadingMore}
                error={sessionsError}
                selectedSessionId={currentSessionId}
                onSelect={handleSelectSession}
                onLoadMore={loadMore}
                hasMore={sessionsPaging?.has_more}
                className="h-full"
                onClose={handleClosePanel}
              />
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col items-center overflow-hidden px-4 pb-8 pt-6 sm:px-8 md:px-10 lg:px-16">
          <div className='flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 rounded-2xl bg-[rgb(244,246,248)] pb-4 pt-2'>
            <div className="flex items-center gap-2">
              {!isDesktop && (
                <button
                  type="button"
                  onClick={handleOpenPanel}
                  className="rounded-md border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 lg:hidden"
                  aria-label="세션 목록 열기"
                >
                  <span className="block h-4 w-5">
                    <span className="block h-0.5 w-full bg-current" />
                    <span className="mt-1 block h-0.5 w-full bg-current" />
                    <span className="mt-1 block h-0.5 w-full bg-current" />
                  </span>
                </button>
              )}
              <ProfileHeader profile={profile} />
            </div>
            {postId != null && (
              <div className='my-auto'>
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                  {postTitle ? `"${postTitle}" 글에 대해 질문 중` : '이 글 범위로 질문 중'}
                </span>
              </div>
            )}
          </div>

          <div className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center overflow-hidden">
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

            {historyError && (
              <div className="mb-2 w-full rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-600">
                {historyError}
              </div>
            )}

            {/* 채팅 메시지 구간 (스크롤) */}
            <ChatMessages
              messages={combinedMessages}
              chatEndRef={chatEndRef}
              loadingMoreTop={isFetchingOlder}
              hasMoreTop={Boolean(currentSessionId && historyPaging?.has_more)}
              onLoadMoreTop={currentSessionId ? loadOlder : undefined}
              onToggleInspector={(id) => {
                setLiveMessages(prev => prev.map(m => (m.id === id && m.inspector) ? { ...m, inspector: { ...m.inspector, open: !m.inspector.open } } : m))
              }}
              onInspectorItemClick={(_id, item) => setModalPostId(item.post_id)}
            />
            {combinedMessages.length === 0 && !historyLoading && (
              <div className="flex h-[25vh] items-center justify-center">
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
              <div className='flex items-center md:mr-4 md:gap-4'>
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
    </div>
  )
}
