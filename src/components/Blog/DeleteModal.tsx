'use client'

import { Dialog } from '@headlessui/react'

interface Props {
  isOpen: boolean
  title?: string
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteModal({ isOpen, title, onCancel, onConfirm }: Props) {
  return (
    <Dialog open={isOpen} onClose={onCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <Dialog.Title className="text-lg font-bold mb-4">
            삭제 확인
          </Dialog.Title>
          <p className="text-gray-700 mb-6">
            &quot;{title}&quot; 글을 정말 삭제하시겠습니까?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            >
              삭제
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}