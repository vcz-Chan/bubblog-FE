'use client'

import { useState, useRef, useEffect, FormEvent, useCallback, useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getBlogById } from '@/apis/blogApi'
import { getUserProfile, UserProfile } from '@/apis/userApi'
import { askChatAPI, askChatAPIV2, type SearchPlan, type ContextItem, updateSession, deleteSession } from '@/apis/aiApi'
import type { ChatSessionMessage } from '@/utils/types'
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
import { useAuthStore } from '@/store/AuthStore'
import { useChatSessionStore } from '@/store/ChatSessionStore'
import { ThreeDotsLoader } from '@/components/Common/ThreeDotsLoader'
import { useIsMobile } from '@/hooks/useIsMobile'

const BANNER_STYLES: Record<'info' | 'success' | 'error', string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  error: 'border-red-200 bg-red-50 text-red-700',
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const toStringArray = (value: unknown): string[] => {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) {
    return value
      .map(item => (typeof item === 'string' ? item : null))
      .filter((item): item is string => !!item)
  }
  return []
}

const normalizeContextItems = (raw: unknown): ContextItem[] => {
  if (!Array.isArray(raw)) return []
  const pairs = raw
    .map((entry: any) => {
      const id = entry?.postId ?? entry?.post_id ?? entry?.id
      const title = entry?.postTitle ?? entry?.post_title ?? entry?.title
      if (id == null || title == null) return null
      return { post_id: String(id), post_title: String(title) }
    })
    .filter((item): item is ContextItem => !!item)
  return pairs
}

const pickMetaValue = (meta: Record<string, unknown> | null, keys: string[]) => {
  if (!meta) return undefined
  for (const key of keys) {
    if (meta[key] != null) return meta[key]
  }
  return undefined
}

const buildInspectorFromHistoryMessage = (
  message: ChatSessionMessage,
  planOverride: SearchPlan | null
): InspectorData | undefined => {
  const meta = isPlainObject(message.retrieval_meta) ? message.retrieval_meta : null

  // retrieval_meta에서 먼저 찾고, 없으면 search_plan에서 가져오기
  const rewritesFromMeta = toStringArray(pickMetaValue(meta, ['rewrites', 'rewrite_list', 'rewriteList']))
  const keywordsFromMeta = toStringArray(pickMetaValue(meta, ['keywords', 'keyword_list', 'keywordList']))

  const rewrites = rewritesFromMeta.length > 0 ? rewritesFromMeta : toStringArray(planOverride?.rewrites)
  const keywords = keywordsFromMeta.length > 0 ? keywordsFromMeta : toStringArray(planOverride?.keywords)

  const hybridResult = normalizeContextItems(pickMetaValue(meta, ['hybrid_result', 'hybridResult']))
  const searchResult = normalizeContextItems(pickMetaValue(meta, ['search_result', 'searchResult']))
  const contextItems = normalizeContextItems(pickMetaValue(meta, ['context', 'contexts']))

  // 실제 데이터가 있을 때만 인스펙션 표시
  const hasData = Boolean(rewrites.length || keywords.length || hybridResult.length || searchResult.length || contextItems.length)
  if (!hasData) return undefined

  return {
    version: 'v2',
    open: false,
    v2Plan: planOverride,
    v2PlanReceived: Boolean(planOverride),
    v2Rewrites: rewrites,
    v2RewritesReceived: true,  // History에서 로드되었으므로 항상 true
    v2Keywords: keywords,
    v2KeywordsReceived: true,  // History에서 로드되었으므로 항상 true
    v2HybridResult: hybridResult,
    v2HybridResultReceived: true,  // History에서 로드되었으므로 항상 true
    v2SearchResult: searchResult,
    v2SearchResultReceived: true,  // History에서 로드되었으므로 항상 true
    v2Context: contextItems,
    v2ContextReceived: true,  // History에서 로드되었으므로 항상 true
    pending: false,
  }
}

const updateSessionQueryParam = (sessionId: number | null) => {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (sessionId != null) {
    url.searchParams.set('sessionId', String(sessionId))
  } else {
    url.searchParams.delete('sessionId')
  }
  const newPath = `${url.pathname}${url.search ? url.search : ''}`
  window.history.replaceState({}, '', newPath)
}

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
  const [inspectorOpenMap, setInspectorOpenMap] = useState<Map<number, boolean>>(new Map())

  const [isCatOpen, setIsCatOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null)

  const [isPersonaOpen, setIsPersonaOpen] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)

  const [isSending, setIsSending] = useState(false)

  const [modalPostId, setModalPostId] = useState<string | null>(null)
  const [banner, setBanner] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const tempIdRef = useRef(-1)
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeSessionIdRef = useRef<number | null>(null)
  const viewerId = useAuthStore(state => state.userId)

  const isMobile = useIsMobile();

  const PANEL_TOP_OFFSET = isMobile ? 72 : 96 // px

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
    fetchInitialSessions,
    resetSessions,
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
    const transformed: UIChatMessage[] = []
    let pendingPlan: SearchPlan | null = null
    for (const msg of historyMessages) {
      const rawPlan = (msg.search_plan as SearchPlan | null) ?? null
      if (msg.role === 'user') {
        if (rawPlan) pendingPlan = rawPlan
        transformed.push({
          id: msg.id,
          role: 'user',
          content: msg.content,
        })
        continue
      }

      const planForMessage = rawPlan ?? pendingPlan
      if (rawPlan || pendingPlan) pendingPlan = null
      const inspector = buildInspectorFromHistoryMessage(msg, planForMessage)
      transformed.push({
        id: msg.id,
        role: 'bot',
        content: msg.content,
        ...(inspector ? { inspector } : {}),
      })
    }
    return transformed
  }, [historyMessages])
  const combinedMessages = useMemo(() => {
    const applyOpenState = (msg: UIChatMessage): UIChatMessage => ({
      ...msg,
      inspector: msg.inspector ? { ...msg.inspector, open: inspectorOpenMap.get(msg.id) ?? false } : undefined
    })
    return [...historyUiMessages.map(applyOpenState), ...liveMessages.map(applyOpenState)]
  }, [historyUiMessages, liveMessages, inspectorOpenMap])
  const showBanner = useCallback((type: 'info' | 'success' | 'error', message: string) => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current)
    setBanner({ type, message })
    bannerTimerRef.current = setTimeout(() => setBanner(null), 4000)
  }, [])

  type SessionSelectionOptions = {
    keepPanel?: boolean
    preserveLiveMessages?: boolean
    force?: boolean
  }

  const syncSessionSelection = useCallback(
    (sessionId: number | null, options?: SessionSelectionOptions) => {
      const shouldSkip = !options?.force && sessionId === currentSessionId
      if (!options?.keepPanel) setPanelOpen(false)
      if (shouldSkip) return
      activeSessionIdRef.current = sessionId
      selectSession(sessionId)
      if (!options?.preserveLiveMessages) setLiveMessages([])
    },
    [currentSessionId, selectSession, setPanelOpen, setLiveMessages]
  )

  const handleSelectSession = useCallback(
    (sessionId: number | null) => {
      syncSessionSelection(sessionId)
    },
    [syncSessionSelection]
  )

  const handleSessionUpdate = useCallback(async (sessionId: number, title: string) => {
    try {
      await updateSession(sessionId, { title })
      updateSessionMeta(sessionId, { title })
      showBanner('success', '세션 이름이 변경되었습니다.')
    } catch (error) {
      console.error('Failed to update session:', error)
      showBanner('error', '세션 이름 변경에 실패했습니다.')
      throw error
    }
  }, [updateSessionMeta, showBanner])

  const handleSessionDelete = useCallback(async (sessionId: number) => {
    try {
      await deleteSession(sessionId)

      // 세션 목록 새로고침
      resetSessions()
      if (userId) {
        fetchInitialSessions({ ownerUserId: userId, limit: 20 })
      }

      // 현재 세션이 삭제된 경우 새 세션으로 전환
      if (sessionId === currentSessionId) {
        syncSessionSelection(null, { preserveLiveMessages: true })
        showBanner('info', '삭제된 세션입니다. 새 대화를 시작하세요.')
      } else {
        showBanner('success', '세션이 삭제되었습니다.')
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
      showBanner('error', '세션 삭제에 실패했습니다.')
      throw error
    }
  }, [currentSessionId, userId, updateSessionMeta, resetSessions, fetchInitialSessions, syncSessionSelection, showBanner])

  useEffect(() => {
    activeSessionIdRef.current = currentSessionId
    updateSessionQueryParam(currentSessionId)
  }, [currentSessionId])

  const handledSessionParamRef = useRef<string | null>(null)
  useEffect(() => {
    const param = searchParams.get('sessionId')
    if (handledSessionParamRef.current === param) return
    handledSessionParamRef.current = param
    if (!param) return
    const parsed = Number(param)
    if (!Number.isNaN(parsed)) {
      syncSessionSelection(parsed, { keepPanel: true, preserveLiveMessages: true, force: true })
    }
  }, [searchParams, syncSessionSelection])

  useEffect(() => () => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current)
  }, [])

  useEffect(() => {
    activeSessionIdRef.current = null
    setLiveMessages([])
    resetSessions()
    updateSessionQueryParam(null)
  }, [userId, resetSessions])

  const handleOpenPanel = () => setPanelOpen(true)
  const handleClosePanel = () => setPanelOpen(false)
  const retrySessions = useCallback(() => {
    if (!userId) return
    fetchInitialSessions({ ownerUserId: userId, limit: 20 })
  }, [userId, fetchInitialSessions])
  const retryHistory = useCallback(() => {
    if (!currentSessionId) return
    fetchSessionMessages(currentSessionId, { direction: 'backward', mode: 'replace' })
  }, [currentSessionId, fetchSessionMessages])

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

  useEffect(() => {
    if (sessionsError) showBanner('error', sessionsError)
  }, [sessionsError, showBanner])

  useEffect(() => {
    if (historyError) showBanner('error', historyError)
  }, [historyError, showBanner])

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

    const resolvedCategoryId = postId != null ? null : (selectedCategory?.id ?? null)
    const resolvedSessionId = activeSessionIdRef.current ?? null

    try {
      if (askVersion === 'v1') {
        await askChatAPI(
          question,
          userId!,
          resolvedCategoryId,
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
          {
            postId,
            sessionId: resolvedSessionId,
            requesterUserId: viewerId ?? null,
            onSession: payload => {
              upsertSessionFromStream(payload)
              syncSessionSelection(payload.session_id, { keepPanel: true, preserveLiveMessages: true })
              showBanner('info', '새 대화 세션을 시작했어요.')
            },
            onSessionSaved: payload => {
              updateSessionMeta(payload.session_id, { updated_at: new Date().toISOString() })
              fetchSessionMessages(payload.session_id, { direction: 'backward', mode: 'replace' }).finally(() => {
                setLiveMessages([])
              })
              showBanner('success', payload.cached ? '이전 답변을 재사용했어요.' : '대화가 저장되었어요.')
            },
            onSessionError: payload => {
              const message = payload.reason || payload.message || '세션 저장 중 오류가 발생했습니다.'
              setLiveMessages(prev => {
                const next = [...prev]
                const msg = next.find(m => m.id === botId)
                if (msg) msg.content = message
                return next
              })
              showBanner('error', message)
            },
          }
        )
      } else {
        await askChatAPIV2(
          question,
          userId!,
          resolvedCategoryId,
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
              syncSessionSelection(payload.session_id, { keepPanel: true, preserveLiveMessages: true })
              showBanner('info', '새 대화 세션을 시작했어요.')
            },
            onSessionSaved: payload => {
              updateSessionMeta(payload.session_id, { updated_at: new Date().toISOString() })
              fetchSessionMessages(payload.session_id, { direction: 'backward', mode: 'replace' }).finally(() => {
                setLiveMessages([])
              })
              showBanner('success', payload.cached ? '이전 답변을 재사용했어요.' : '대화가 저장되었어요.')
            },
            onSessionError: payload => {
              const message = payload.reason || payload.message || '세션 저장 중 오류가 발생했습니다.'
              setLiveMessages(prev => {
                const next = [...prev]
                const msg = next.find(m => m.id === botId)
                if (msg) msg.content = message
                return next
              })
              showBanner('error', message)
            },
            onError: (message) => {
              setLiveMessages(prev => {
                const next = [...prev]
                const msg = next.find(m => m.id === botId)
                if (msg) msg.content = message || '서버 요청 중 오류가 발생했습니다.'
                return next
              })
              showBanner('error', message || '서버 요청 중 오류가 발생했습니다.')
            }
          },
          {
            postId,
            sessionId: resolvedSessionId,
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
      showBanner('error', '서버 요청 중 오류가 발생했습니다.')
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
      <div className="flex max-h-full w-full">
        <AnimatePresence>
          {isSessionPanelOpen && (
            <div className="fixed inset-0 z-40">
              <motion.div
                className="absolute left-0 right-0 bg-black/30"
                style={{ top: PANEL_TOP_OFFSET, bottom: 0, willChange: 'opacity' }}
                onClick={handleClosePanel}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <div
                className={`absolute left-0 w-full sm:w-96 sm:max-w-md sm:rounded-xl overflow-hidden`}
                style={{
                  top: PANEL_TOP_OFFSET,
                  bottom: 0,
                }}
              >
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
                  onRetry={retrySessions}
                  onSessionUpdate={handleSessionUpdate}
                  onSessionDelete={handleSessionDelete}
                />
              </div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex flex-1 flex-col items-center overflow-hidden px-4 pb-8 pt-6 sm:px-8 md:px-10 lg:px-16">
          <div className='flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 rounded-2xl bg-[rgb(244,246,248)] pb-4 pt-2'>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenPanel}
                className="rounded-md border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
                aria-label="세션 목록 열기"
              >
                <span className="block h-4 w-5">
                  <span className="block h-0.5 w-full bg-current" />
                  <span className="mt-1 block h-0.5 w-full bg-current" />
                  <span className="mt-1 block h-0.5 w-full bg-current" />
                </span>
              </button>
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
          {banner && (
            <div className={`mt-3 w-full max-w-5xl rounded-md border px-4 py-2 text-sm ${BANNER_STYLES[banner.type]}`}>
              {banner.message}
            </div>
          )}

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
              selectedPersona={selectedPersona}
            />

            {historyError && (
              <div className="mb-2 w-full rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <p className="mb-2">{historyError}</p>
                {currentSessionId && (
                  <button
                    type="button"
                    className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                    onClick={retryHistory}
                  >
                    다시 시도
                  </button>
                )}
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
                setInspectorOpenMap(prev => {
                  const next = new Map(prev)
                  next.set(id, !prev.get(id))
                  return next
                })
              }}
              onInspectorItemClick={(_id, item) => setModalPostId(item.post_id)}
            />
            {historyLoading && combinedMessages.length === 0 && (
              <div className="flex h-[25vh] items-center justify-center">
                <ThreeDotsLoader />
              </div>
            )}
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
