'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Edit3, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface SessionContextMenuProps {
  isOpen: boolean
  onClose: () => void
  onRename: () => void
  onDelete: () => void
  position?: { x: number; y: number }
}

export function SessionContextMenu({
  isOpen,
  onClose,
  onRename,
  onDelete,
  position,
}: SessionContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 감지
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    // ESC 키로 닫기
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          className="absolute z-50 w-48 rounded-lg border-2 border-gray-200 bg-white shadow-xl"
          style={{
            top: position?.y ?? 0,
            right: 8,
          }}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          <div className="py-1">
            <motion.button
              type="button"
              onClick={() => {
                onRename()
                onClose()
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.15 }}
            >
              <Edit3 className="w-4 h-4 text-blue-600" />
              <span className="font-medium">이름 변경</span>
            </motion.button>

            <div className="my-1 border-t border-gray-100" />

            <motion.button
              type="button"
              onClick={() => {
                onDelete()
                onClose()
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.15 }}
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-medium">삭제</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
