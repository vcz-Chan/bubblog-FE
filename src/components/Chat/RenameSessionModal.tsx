'use client'

import { useState, useEffect, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface RenameSessionModalProps {
  isOpen: boolean
  currentTitle: string
  onClose: () => void
  onConfirm: (newTitle: string) => void
  loading?: boolean
}

export function RenameSessionModal({
  isOpen,
  currentTitle,
  onClose,
  onConfirm,
  loading = false,
}: RenameSessionModalProps) {
  const [title, setTitle] = useState(currentTitle)

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle)
    }
  }, [isOpen, currentTitle])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (title.trim() && title !== currentTitle) {
      onConfirm(title.trim())
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="w-full max-w-md rounded-2xl border-2 border-gray-200 bg-white shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-bold text-gray-900">세션 이름 변경</h2>
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="p-6">
                <label htmlFor="session-title" className="block text-sm font-medium text-gray-700 mb-2">
                  새로운 이름
                </label>
                <input
                  id="session-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="세션 이름을 입력하세요"
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors"
                  autoFocus
                  disabled={loading}
                />

                {/* Actions */}
                <div className="mt-6 flex gap-3 justify-end">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="rounded-lg border-2 border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    취소
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading || !title.trim() || title === currentTitle}
                    className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    whileHover={!loading && title.trim() && title !== currentTitle ? { scale: 1.02 } : {}}
                    whileTap={!loading && title.trim() && title !== currentTitle ? { scale: 0.98 } : {}}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        변경 중...
                      </span>
                    ) : (
                      '변경하기'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
