import { useCallback, useEffect, useState } from 'react'
import { useChatSessionStore } from '@/store/ChatSessionStore'
import type { ChatSessionMessage } from '@/utils/types'

interface UseSessionMessagesOptions {
  autoFetch?: boolean
  limit?: number
}

const EMPTY_MESSAGES: ChatSessionMessage[] = []

export function useSessionMessages(sessionId: number | null | undefined, options: UseSessionMessagesOptions = {}) {
  const storeMessages = useChatSessionStore(state =>
    sessionId != null ? state.messagesBySession[sessionId] : undefined
  )
  const paging = useChatSessionStore(state =>
    sessionId != null ? state.messagesPagingBySession[sessionId] ?? null : null
  )
  const isLoading = useChatSessionStore(state =>
    sessionId != null ? state.messagesLoadingBySession[sessionId] ?? false : false
  )
  const error = useChatSessionStore(state =>
    sessionId != null ? state.messagesErrorBySession[sessionId] ?? null : null
  )
  const messages = storeMessages ?? EMPTY_MESSAGES

  const fetchMessages = useChatSessionStore(state => state.fetchMessages)
  const [isFetchingOlder, setIsFetchingOlder] = useState(false)
  useEffect(() => {
    setIsFetchingOlder(false)
  }, [sessionId])

  const autoFetch = options.autoFetch ?? true

  useEffect(() => {
    if (!autoFetch || sessionId == null) return
    fetchMessages(sessionId, { limit: options.limit, direction: 'backward', mode: 'replace' })
  }, [sessionId, autoFetch, options.limit, fetchMessages])

  const loadOlder = useCallback(() => {
    if (sessionId == null || !paging?.has_more || !paging.next_cursor || isFetchingOlder) return
    setIsFetchingOlder(true)
    fetchMessages(sessionId, {
      cursor: paging.next_cursor,
      direction: paging.direction ?? 'backward',
      mode: 'prepend',
    }).finally(() => setIsFetchingOlder(false))
  }, [sessionId, paging, fetchMessages, isFetchingOlder])

  const reload = useCallback(() => {
    if (sessionId == null) return Promise.resolve()
    return fetchMessages(sessionId, { direction: 'backward', mode: 'replace' })
  }, [sessionId, fetchMessages])

  return {
    messages,
    paging,
    isLoading,
    error,
    isFetchingOlder,
    loadOlder,
    reload,
  }
}
