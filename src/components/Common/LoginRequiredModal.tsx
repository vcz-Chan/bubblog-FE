'use client'

import { Dialog } from '@headlessui/react'
import Link from 'next/link'

interface Props {
  isOpen: boolean
  onClose: () => void
  onContinue?: () => void
}

export function LoginRequiredModal({ isOpen, onClose, onContinue }: Props) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <Dialog.Title className="text-lg font-bold mb-4">
            로그인이 필요합니다
          </Dialog.Title>
          <p className="text-gray-700 mb-6">
            해당 서비스는 로그인이 필요해요.
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                onContinue?.();
                onClose();
              }}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              그냥 이용하기
            </button>
            <Link
              href="/login"
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              로그인 하러가기
            </Link>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default LoginRequiredModal;

