'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon, PencilIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useAuthStore, selectUserId } from '@/store/AuthStore'
import {
  getPersonasByUser,
  updatePersona,
  deletePersona,
  Persona
} from '@/apis/personaApi'

interface Props {
  userId: string
  isOpen: boolean
  onSelect: (persona: Persona | null) => void
  onClose: () => void
  selectedPersona?: Persona | null
}

export function PersonaSelectorModal({
  userId,
  isOpen,
  onSelect,
  onClose,
  selectedPersona
}: Props) {
  const authUserId = useAuthStore(selectUserId)
  const isOwner = authUserId === userId

  const [list, setList] = useState<Persona[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPersonas = () => {
    setLoading(true)
    setError(null)
    getPersonasByUser(userId)
      .then(data => setList(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (isOpen) fetchPersonas()
  }, [isOpen, userId])

  const handleEdit = async (p: Persona) => {
    const name = window.prompt('새 페르소나 이름을 입력하세요', p.name)
    if (name == null) return
    const description = window.prompt('새 설명을 입력하세요', p.description)
    if (description == null) return

    try {
      const updated = await updatePersona(p.id, { name, description })
      setList(list.map(x => (x.id === updated.id ? updated : x)))
    } catch (err: any) {
      alert('수정에 실패했습니다: ' + err.message)
    }
  }

  const handleDelete = async (p: Persona) => {
    if (!confirm(`'${p.name}' 페르소나를 삭제하시겠습니까?`)) return

    try {
      await deletePersona(p.id)
      setList(list.filter(x => x.id !== p.id))
    } catch (err: any) {
      alert('삭제에 실패했습니다: ' + err.message)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-100 overflow-y-auto"
    >
      {/* 투명 백드롭: 클릭 시 onClose 트리거 */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Panel className="relative bg-white p-6 rounded w-full max-w-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold">
              페르소나 선택
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-800" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {/* 기본 옵션 (페르소나 없음) */}
              <button
                onClick={() => {
                  onSelect(null)
                  onClose()
                }}
                className={`
                  w-full flex items-center gap-3 p-4 rounded-lg border-2
                  transition-all duration-200
                  ${selectedPersona === null
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-blue-300 hover:shadow-sm'
                  }
                `}
              >
                <div className="flex-shrink-0">
                  {selectedPersona === null ? (
                    <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-semibold ${selectedPersona === null ? 'text-blue-900' : 'text-gray-800'}`}>
                    기본 (페르소나 없음)
                  </p>
                  <p className={`text-sm ${selectedPersona === null ? 'text-blue-700' : 'text-gray-500'}`}>
                    AI가 기본 말투로 대화합니다
                  </p>
                </div>
              </button>

              {/* 페르소나 리스트 */}
              {list.map(p => {
                const isSelected = selectedPersona?.id === p.id
                return (
                  <div
                    key={p.id}
                    className={`
                      relative flex items-center gap-3 p-4 rounded-lg border-2
                      transition-all duration-200 group
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <button
                      onClick={() => {
                        onSelect(p)
                        onClose()
                      }}
                      className="flex-1 flex items-center gap-3 text-left"
                    >
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-gray-300 group-hover:border-blue-400 transition-colors" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                          {p.name}
                        </p>
                        <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                          {p.description}
                        </p>
                      </div>
                    </button>

                    {isOwner && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            handleEdit(p)
                          }}
                          className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                          aria-label="페르소나 수정"
                        >
                          <PencilIcon className="h-5 w-5 text-yellow-600" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            handleDelete(p)
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          aria-label="페르소나 삭제"
                        >
                          <TrashIcon className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}

              {list.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">등록된 페르소나가 없습니다</p>
                  {isOwner && (
                    <p className="text-xs mt-2 text-gray-400">설정 페이지에서 페르소나를 추가할 수 있습니다</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              닫기
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}