'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/Common/Button'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm
}: DeleteAccountModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="닫기"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>

                {/* Title */}
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold text-center text-gray-900 mb-2"
                >
                  계정을 삭제하시겠습니까?
                </Dialog.Title>

                {/* Description */}
                <Dialog.Description className="text-sm text-center text-gray-600 mb-6">
                  이 작업은 되돌릴 수 없습니다. 계정을 삭제하면 다음 데이터가 영구적으로 삭제됩니다:
                </Dialog.Description>

                {/* Warning List */}
                <div className="bg-red-50 rounded-lg p-4 mb-6">
                  <ul className="space-y-2 text-sm text-red-800">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>모든 게시글과 댓글</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>프로필 및 개인정보</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>페르소나 설정</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>AI 챗봇 대화 기록</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 text-gray-700 hover:bg-gray-100"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={() => {
                      onConfirm()
                      onClose()
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                  >
                    삭제
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
