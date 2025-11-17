'use client'

import { Dialog } from '@headlessui/react'

interface ConfirmModalProps {
  isOpen: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isDestructive?: boolean
}

export function ConfirmModal({
  isOpen,
  title = '확인',
  message = '이 작업을 진행하시겠습니까?',
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onClose={onCancel} className="relative z-[200]">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          {title && (
            <Dialog.Title className="text-lg font-bold mb-4">{title}</Dialog.Title>
          )}
          {message && <p className="text-gray-700 mb-6">{message}</p>}
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded text-white ${
                isDestructive
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

