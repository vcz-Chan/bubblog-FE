import { useCallback, useEffect } from 'react'
import { useChatSessionStore } from '@/store/ChatSessionStore'

interface UseChatSessionsOptions {
  autoFetch?: boolean
  limit?: number
}

export function useChatSessions(ownerUserId: string | null | undefined, options: UseChatSessionsOptions = {}) {
  const sessions = useChatSessionStore(state => state.sessions)
  const sessionsPaging = useChatSessionStore(state => state.sessionsPaging)
  const sessionsLoading = useChatSessionStore(state => state.sessionsLoading)
  const sessionsLoadingMore = useChatSessionStore(state => state.sessionsLoadingMore)
  const sessionsError = useChatSessionStore(state => state.sessionsError)
  const currentSessionId = useChatSessionStore(state => state.currentSessionId)
  const isSessionPanelOpen = useChatSessionStore(state => state.isSessionPanelOpen)

  const fetchInitialSessions = useChatSessionStore(state => state.fetchInitialSessions)
  const fetchMoreSessions = useChatSessionStore(state => state.fetchMoreSessions)
  const selectSession = useChatSessionStore(state => state.selectSession)
  const setPanelOpen = useChatSessionStore(state => state.setPanelOpen)
  const resetSessions = useChatSessionStore(state => state.resetSessions)

  const autoFetch = options.autoFetch ?? true

  useEffect(() => {
    if (!autoFetch) return
    if (!ownerUserId) {
      resetSessions()
      return
    }
    fetchInitialSessions({ ownerUserId, limit: options.limit })
  }, [ownerUserId, options.limit, autoFetch, fetchInitialSessions, resetSessions])

  const hasMoreSessions = Boolean(sessionsPaging?.has_more)

  const loadMore = useCallback(() => {
    if (!hasMoreSessions) return
    fetchMoreSessions()
  }, [hasMoreSessions, fetchMoreSessions])

  return {
    sessions,
    sessionsPaging,
    sessionsLoading,
    sessionsLoadingMore,
    sessionsError,
    currentSessionId,
    isSessionPanelOpen,
    selectSession,
    setPanelOpen,
    fetchInitialSessions,
    resetSessions,
    loadMore,
  }
}
