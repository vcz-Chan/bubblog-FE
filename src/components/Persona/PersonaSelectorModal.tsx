'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
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
  onSelect: (persona: Persona) => void
  onClose: () => void
}

export function PersonaSelectorModal({
  userId,
  isOpen,
  onSelect,
  onClose
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

          {loading && <p>로딩 중…</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && (
            <ul className="max-h-60 overflow-auto">
              {list.map(p => (
                <li
                  key={p.id}
                  onClick={() => {
                    onSelect(p)
                    onClose()
                  }}
                  className="flex items-center space-x-2 mb-1 border border-gray-300 rounded-lg px-1 py-3 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-gray-600 text-sm">
                      {p.description}
                    </p>
                  </div>
                  {isOwner && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleEdit(p)
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <PencilIcon className="h-5 w-5 text-yellow-600" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleDelete(p)
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <TrashIcon className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 text-right">
            <button
              onClick={onClose}
              className="inline-flex items-center space-x-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              <XMarkIcon className="h-5 w-5 text-gray-700" />
              <span>닫기</span>
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}