'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface DeleteSessionDialogProps {
  isOpen: boolean
  sessionTitle: string
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function DeleteSessionDialog({
  isOpen,
  sessionTitle,
  onClose,
  onConfirm,
  loading = false,
}: DeleteSessionDialogProps) {
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

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="w-full max-w-md rounded-2xl border-2 border-red-200 bg-white shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-red-100 bg-red-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-red-100 p-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-lg font-bold text-red-900">세션 삭제</h2>
                </div>
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1.5 text-red-600 hover:bg-red-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-sm text-gray-700 mb-2">
                  <strong className="font-semibold text-gray-900">&quot;{sessionTitle}&quot;</strong> 세션을 정말 삭제하시겠습니까?
                </p>
                <p className="text-sm text-gray-600">
                  이 작업은 되돌릴 수 없으며, 모든 대화 내용이 영구적으로 삭제됩니다.
                </p>

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
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        삭제 중...
                      </span>
                    ) : (
                      '삭제하기'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
