import { useCallback, useEffect } from 'react'
import { useChatSessionStore } from '@/store/ChatSessionStore'

interface UseSessionMessagesOptions {
  autoFetch?: boolean
  limit?: number
}

export function useSessionMessages(sessionId: number | null | undefined, options: UseSessionMessagesOptions = {}) {
  const {
    messages,
    paging,
    isLoading,
    error,
  } = useChatSessionStore(state => ({
    messages: sessionId != null ? state.messagesBySession[sessionId] ?? [] : [],
    paging: sessionId != null ? state.messagesPagingBySession[sessionId] ?? null : null,
    isLoading: sessionId != null ? state.messagesLoadingBySession[sessionId] ?? false : false,
    error: sessionId != null ? state.messagesErrorBySession[sessionId] ?? null : null,
  }))

  const fetchMessages = useChatSessionStore(state => state.fetchMessages)

  const autoFetch = options.autoFetch ?? true

  useEffect(() => {
    if (!autoFetch || sessionId == null) return
    fetchMessages(sessionId, { limit: options.limit, direction: 'backward', mode: 'replace' })
  }, [sessionId, autoFetch, options.limit, fetchMessages])

  const loadOlder = useCallback(() => {
    if (sessionId == null || !paging?.has_more || !paging.next_cursor) return
    fetchMessages(sessionId, {
      cursor: paging.next_cursor,
      direction: paging.direction ?? 'backward',
      mode: 'prepend',
    })
  }, [sessionId, paging, fetchMessages])

  const reload = useCallback(() => {
    if (sessionId == null) return
    fetchMessages(sessionId, { direction: 'backward', mode: 'replace' })
  }, [sessionId, fetchMessages])

  return {
    messages,
    paging,
    isLoading,
    error,
    loadOlder,
    reload,
  }
}
