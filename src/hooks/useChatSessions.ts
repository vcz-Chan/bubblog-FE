import { useCallback, useEffect } from 'react'
import { useChatSessionStore } from '@/store/ChatSessionStore'

interface UseChatSessionsOptions {
  autoFetch?: boolean
  limit?: number
}

export function useChatSessions(ownerUserId: string | null | undefined, options: UseChatSessionsOptions = {}) {
  const {
    sessions,
    sessionsPaging,
    sessionsLoading,
    sessionsLoadingMore,
    sessionsError,
    currentSessionId,
    isSessionPanelOpen,
  } = useChatSessionStore(state => ({
    sessions: state.sessions,
    sessionsPaging: state.sessionsPaging,
    sessionsLoading: state.sessionsLoading,
    sessionsLoadingMore: state.sessionsLoadingMore,
    sessionsError: state.sessionsError,
    currentSessionId: state.currentSessionId,
    isSessionPanelOpen: state.isSessionPanelOpen,
  }))

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

  const loadMore = useCallback(() => {
    if (!sessionsPaging?.has_more) return
    fetchMoreSessions()
  }, [sessionsPaging?.has_more, fetchMoreSessions])

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
    loadMore,
  }
}
