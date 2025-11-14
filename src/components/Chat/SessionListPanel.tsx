import { ChatSession } from '@/utils/types'

interface SessionListPanelProps {
  sessions: ChatSession[]
  loading: boolean
  loadingMore?: boolean
  error: string | null
  isOpen?: boolean
  selectedSessionId: number | null
  onSelect: (sessionId: number | null) => void
  onLoadMore?: () => void
  hasMore?: boolean
  className?: string
  onClose?: () => void
}

function formatTimestamp(iso: string | null) {
  if (!iso) return '방금 생성됨'
  try {
    const date = new Date(iso)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } catch {
    return iso
  }
}

function getSessionTitle(session: ChatSession) {
  if (session.title && session.title.trim().length > 0) return session.title
  return `세션 #${session.session_id}`
}

export function SessionListPanel({
  sessions,
  loading,
  loadingMore,
  error,
  selectedSessionId,
  onSelect,
  onLoadMore,
  hasMore,
  className = '',
  onClose,
}: SessionListPanelProps) {
  return (
    <aside className={`flex h-full w-full flex-col bg-white ${className}`}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-base font-semibold text-gray-900">대화 세션</p>
        {onClose && (
          <button
            type="button"
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            onClick={onClose}
            aria-label="세션 패널 닫기"
          >
            <span className="block h-5 w-5">×</span>
          </button>
        )}
      </div>

      <div className="border-b px-4 py-3">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="w-full rounded-md border border-dashed border-blue-400 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          + 새 세션 시작
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {loading && sessions.length === 0 && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div className="rounded-md border border-dashed border-gray-200 p-4 text-sm text-gray-500">
            아직 저장된 세션이 없습니다. 첫 질문을 해보세요.
          </div>
        )}

        {sessions.map(session => {
          const isActive = selectedSessionId === session.session_id
          return (
            <button
              key={session.session_id}
              type="button"
              onClick={() => onSelect(session.session_id)}
              className={`w-full rounded-md border px-3 py-3 text-left transition ${
                isActive ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'
              }`}
            >
              <p className="text-sm font-semibold text-gray-900">{getSessionTitle(session)}</p>
              <p className="mt-1 text-xs text-gray-500">{formatTimestamp(session.updated_at)}</p>
              <p className="mt-1 text-xs text-gray-400">{session.message_count}개의 메시지</p>
            </button>
          )
        })}

        {error && (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {hasMore && (
        <div className="border-t px-4 py-3">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="w-full rounded-md border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {loadingMore ? '불러오는 중…' : '더 보기'}
          </button>
        </div>
      )}
    </aside>
  )
}
