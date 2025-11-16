import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, MessageSquare, Clock, MoreVertical } from 'lucide-react'
import { ChatSession } from '@/utils/types'
import { SessionContextMenu } from './SessionContextMenu'
import { RenameSessionModal } from './RenameSessionModal'
import { DeleteSessionDialog } from './DeleteSessionDialog'

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
  onRetry?: () => void
  onSessionUpdate?: (sessionId: number, title: string) => Promise<void>
  onSessionDelete?: (sessionId: number) => Promise<void>
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
  onRetry,
  onSessionUpdate,
  onSessionDelete,
}: SessionListPanelProps) {
  const [contextMenuOpen, setContextMenuOpen] = useState<number | null>(null)
  const [renameModalOpen, setRenameModalOpen] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const openRenameModal = (sessionId: number) => {
    setTimeout(() => setRenameModalOpen(sessionId), 0)
  }

  const openDeleteDialog = (sessionId: number) => {
    setTimeout(() => setDeleteDialogOpen(sessionId), 0)
  }

  const handleRename = async (sessionId: number, newTitle: string) => {
    if (!onSessionUpdate) return

    try {
      setActionLoading(true)
      await onSessionUpdate(sessionId, newTitle)
      setRenameModalOpen(null)
    } catch (error) {
      console.error('Failed to rename session:', error)
      alert('세션 이름 변경에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (sessionId: number) => {
    if (!onSessionDelete) return

    try {
      setActionLoading(true)
      await onSessionDelete(sessionId)
      setDeleteDialogOpen(null)
    } catch (error) {
      console.error('Failed to delete session:', error)
      alert('세션 삭제에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <>
      <motion.aside
        className={`flex h-full w-full flex-col bg-white ${className}`}
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        exit={{ x: -320 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
      >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <p className="text-lg font-bold text-gray-900">대화 세션</p>
        </div>
        {onClose && (
          <motion.button
            type="button"
            className="rounded-full p-1.5 text-gray-500 hover:bg-white/80 hover:text-gray-700"
            onClick={onClose}
            aria-label="세션 패널 닫기"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      <div className="border-b border-gray-100 px-4 py-3">
        <motion.button
          type="button"
          onClick={() => onSelect(null)}
          className="w-full rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-100 hover:border-blue-400 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            새 세션 시작
          </span>
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {loading && sessions.length === 0 && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="rounded-xl border-2 border-gray-100 bg-white p-4 animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded bg-gray-200" />
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                  <div className="h-3 w-16 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <motion.div
            className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-600 mb-1">아직 저장된 세션이 없습니다</p>
            <p className="text-xs text-gray-400">첫 질문을 해보세요!</p>
          </motion.div>
        )}

        {sessions.map(session => {
          const isActive = selectedSessionId === session.session_id
          const isContextMenuOpen = contextMenuOpen === session.session_id
          return (
            <div
              key={session.session_id}
              className="relative group mb-2"
              style={{ zIndex: isContextMenuOpen ? 50 : undefined }}
            >
              <motion.div
                onClick={() => onSelect(session.session_id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(session.session_id)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`세션 선택: ${getSessionTitle(session)}`}
                className={`w-full rounded-xl border-2 px-4 py-3.5 text-left transition-all cursor-pointer ${
                  isActive
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md'
                    : 'border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm'
                }`}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                        {getSessionTitle(session)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(session.updated_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {session.message_count}개
                      </span>
                    </div>
                  </div>

                  {/* 세션 관리 버튼 */}
                  <div className="relative">
                    <motion.button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-gray-200 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setContextMenuOpen(contextMenuOpen === session.session_id ? null : session.session_id)
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </motion.button>

                    <SessionContextMenu
                      isOpen={isContextMenuOpen}
                      onClose={() => setContextMenuOpen(null)}
                      onRename={() => openRenameModal(session.session_id)}
                      onDelete={() => openDeleteDialog(session.session_id)}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          )
        })}

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p className="mb-2">{error}</p>
            {onRetry && (
              <button
                type="button"
                className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                onClick={onRetry}
              >
                다시 시도
              </button>
            )}
          </div>
        )}
      </div>

      {hasMore && (
        <div className="border-t border-gray-100 px-4 py-3 bg-white">
          <motion.button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="w-full rounded-lg border-2 border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={!loadingMore ? { scale: 1.02 } : {}}
            whileTap={!loadingMore ? { scale: 0.98 } : {}}
          >
            {loadingMore ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                불러오는 중…
              </span>
            ) : (
              '더 보기'
            )}
          </motion.button>
        </div>
      )}
      </motion.aside>

      {/* Modals */}
      {renameModalOpen !== null && (() => {
        const session = sessions.find(s => s.session_id === renameModalOpen)
        if (!session) return null
        return (
          <RenameSessionModal
            isOpen={true}
            currentTitle={getSessionTitle(session)}
            onClose={() => setRenameModalOpen(null)}
            onConfirm={(newTitle) => handleRename(session.session_id, newTitle)}
            loading={actionLoading}
          />
        )
      })()}

      {deleteDialogOpen !== null && (() => {
        const session = sessions.find(s => s.session_id === deleteDialogOpen)
        if (!session) return null
        return (
          <DeleteSessionDialog
            isOpen={true}
            sessionTitle={getSessionTitle(session)}
            onClose={() => setDeleteDialogOpen(null)}
            onConfirm={() => handleDelete(session.session_id)}
            loading={actionLoading}
          />
        )
      })()}
    </>
  )
}
