import { create } from 'zustand'
import {
  ChatSession,
  ChatSessionListResponse,
  ChatSessionMessage,
  ChatSessionMessagesResponse,
  ChatSessionPaging,
} from '@/utils/types'
import {
  getChatSessions,
  getChatSessionMessages,
  GetChatSessionsParams,
  GetChatSessionMessagesParams,
} from '@/apis/aiSessionApi'
import { AskSessionEventPayload } from '@/apis/aiApi'

type MessageMergeMode = 'replace' | 'append' | 'prepend'

interface MessagesPagingState {
  direction: 'forward' | 'backward'
  has_more: boolean
  next_cursor: string | null
}

interface FetchMessagesOptions extends GetChatSessionMessagesParams {
  mode?: MessageMergeMode
  replace?: boolean
}

const DEFAULT_SESSION_ERROR = '세션을 불러오지 못했습니다.'
const DEFAULT_MESSAGE_ERROR = '메시지를 불러오지 못했습니다.'

function mergeMessages(
  current: ChatSessionMessage[],
  incoming: ChatSessionMessage[],
  mode: MessageMergeMode
) {
  let combined: ChatSessionMessage[]
  if (mode === 'replace') {
    combined = incoming
  } else if (mode === 'append') {
    combined = [...current, ...incoming]
  } else {
    combined = [...incoming, ...current]
  }

  const map = new Map<number, ChatSessionMessage>()
  combined.forEach(msg => map.set(msg.id, msg))

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
}

export interface ChatSessionStoreState {
  sessions: ChatSession[]
  sessionsPaging: ChatSessionPaging | null
  sessionsQuery: GetChatSessionsParams | null
  sessionsLoading: boolean
  sessionsLoadingMore: boolean
  sessionsError: string | null

  currentSessionId: number | null
  isSessionPanelOpen: boolean

  messagesBySession: Record<number, ChatSessionMessage[]>
  messagesPagingBySession: Record<number, MessagesPagingState | null>
  messagesLoadingBySession: Record<number, boolean>
  messagesErrorBySession: Record<number, string | null>

  isStreaming: boolean
  streamingSessionId: number | null
  streamingBuffer: string

  fetchInitialSessions: (params: GetChatSessionsParams) => Promise<void>
  fetchMoreSessions: () => Promise<void>
  selectSession: (sessionId: number | null) => void
  resetSessions: () => void

  fetchMessages: (sessionId: number, options?: FetchMessagesOptions) => Promise<void>
  prependMessages: (sessionId: number, messages: ChatSessionMessage[]) => void
  appendMessages: (sessionId: number, messages: ChatSessionMessage[]) => void

  upsertSessionFromStream: (payload: AskSessionEventPayload, partial?: Partial<ChatSession>) => void
  setPanelOpen: (open: boolean) => void

  beginStreaming: (sessionId: number, initial?: string) => void
  appendStreamingChunk: (sessionId: number, chunk: string) => void
  endStreaming: (sessionId?: number) => void

  /** dev-only helper */
  __devHydrateSessions?: (response: ChatSessionListResponse) => void
}

export const useChatSessionStore = create<ChatSessionStoreState>((set, get) => ({
  sessions: [],
  sessionsPaging: null,
  sessionsQuery: null,
  sessionsLoading: false,
  sessionsLoadingMore: false,
  sessionsError: null,

  currentSessionId: null,
  isSessionPanelOpen: false,

  messagesBySession: {},
  messagesPagingBySession: {},
  messagesLoadingBySession: {},
  messagesErrorBySession: {},

  isStreaming: false,
  streamingSessionId: null,
  streamingBuffer: '',

  async fetchInitialSessions(params) {
    set({ sessionsLoading: true, sessionsError: null })
    try {
      const res = await getChatSessions(params)
      set({
        sessions: res.sessions,
        sessionsPaging: res.paging,
        sessionsQuery: params ?? null,
        sessionsLoading: false,
        sessionsError: null,
      })
    } catch (error) {
      set({
        sessionsLoading: false,
        sessionsError: error instanceof Error ? error.message : DEFAULT_SESSION_ERROR,
      })
    }
  },

  async fetchMoreSessions() {
    const { sessionsPaging, sessionsLoadingMore, sessionsQuery } = get()
    if (sessionsLoadingMore || !sessionsPaging?.has_more || !sessionsPaging.cursor) return
    set({ sessionsLoadingMore: true })
    try {
      const res = await getChatSessions({
        ...sessionsQuery,
        cursor: sessionsPaging.cursor,
      })
      set(state => ({
        sessions: [...state.sessions, ...res.sessions],
        sessionsPaging: res.paging,
        sessionsLoadingMore: false,
      }))
    } catch (error) {
      set({
        sessionsLoadingMore: false,
        sessionsError: error instanceof Error ? error.message : DEFAULT_SESSION_ERROR,
      })
    }
  },

  selectSession(sessionId) {
    set({ currentSessionId: sessionId })
  },

  resetSessions() {
    set({
      sessions: [],
      sessionsPaging: null,
      sessionsQuery: null,
      sessionsError: null,
      currentSessionId: null,
      messagesBySession: {},
      messagesPagingBySession: {},
      messagesLoadingBySession: {},
      messagesErrorBySession: {},
    })
  },

  async fetchMessages(sessionId, options = {}) {
    const direction = options.direction ?? 'backward'
    const mode =
      options.mode ??
      (options.cursor ? (direction === 'backward' ? 'prepend' : 'append') : 'replace')
    set(state => ({
      messagesLoadingBySession: { ...state.messagesLoadingBySession, [sessionId]: true },
      messagesErrorBySession: { ...state.messagesErrorBySession, [sessionId]: null },
    }))
    try {
      const res: ChatSessionMessagesResponse = await getChatSessionMessages(sessionId, {
        direction,
        cursor: options.cursor,
        limit: options.limit,
      })
      set(state => {
        const current = state.messagesBySession[sessionId] ?? []
        const nextMessages = mergeMessages(current, res.messages, mode)
        return {
          messagesBySession: { ...state.messagesBySession, [sessionId]: nextMessages },
          messagesPagingBySession: { ...state.messagesPagingBySession, [sessionId]: res.paging },
          messagesLoadingBySession: { ...state.messagesLoadingBySession, [sessionId]: false },
        }
      })
    } catch (error) {
      set(state => ({
        messagesLoadingBySession: { ...state.messagesLoadingBySession, [sessionId]: false },
        messagesErrorBySession: {
          ...state.messagesErrorBySession,
          [sessionId]: error instanceof Error ? error.message : DEFAULT_MESSAGE_ERROR,
        },
      }))
    }
  },

  prependMessages(sessionId, messages) {
    set(state => {
      const list = state.messagesBySession[sessionId] ?? []
      return {
        messagesBySession: {
          ...state.messagesBySession,
          [sessionId]: mergeMessages(list, messages, 'prepend'),
        },
      }
    })
  },

  appendMessages(sessionId, messages) {
    set(state => {
      const list = state.messagesBySession[sessionId] ?? []
      return {
        messagesBySession: {
          ...state.messagesBySession,
          [sessionId]: mergeMessages(list, messages, 'append'),
        },
      }
    })
  },

  upsertSessionFromStream(payload, partial) {
    set(state => {
      const exists = state.sessions.find(s => s.session_id === payload.session_id)
      if (exists) return state

      const now = new Date().toISOString()
      const stub: ChatSession = {
        session_id: payload.session_id,
        owner_user_id: payload.owner_user_id,
        requester_user_id: payload.requester_user_id,
        title: partial?.title ?? null,
        metadata: partial?.metadata ?? null,
        last_question_at: partial?.last_question_at ?? now,
        created_at: partial?.created_at ?? now,
        updated_at: partial?.updated_at ?? now,
        message_count: partial?.message_count ?? 0,
      }

      return {
        sessions: [stub, ...state.sessions],
        sessionsPaging: state.sessionsPaging
          ? { ...state.sessionsPaging, has_more: true }
          : state.sessionsPaging,
      }
    })
  },

  setPanelOpen(open) {
    set({ isSessionPanelOpen: open })
  },

  beginStreaming(sessionId, initial = '') {
    set({
      isStreaming: true,
      streamingSessionId: sessionId,
      streamingBuffer: initial,
    })
  },

  appendStreamingChunk(sessionId, chunk) {
    set(state => {
      if (state.streamingSessionId !== sessionId) return state
      return { streamingBuffer: state.streamingBuffer + chunk }
    })
  },

  endStreaming(sessionId) {
    const state = get()
    if (sessionId != null && state.streamingSessionId !== sessionId) return
    set({
      isStreaming: false,
      streamingSessionId: null,
      streamingBuffer: '',
    })
  },

  __devHydrateSessions:
    process.env.NODE_ENV !== 'production'
      ? res => {
          set({
            sessions: res.sessions,
            sessionsPaging: res.paging,
          })
        }
      : undefined,
}))
