'use client'

import { useState, useEffect } from 'react'
import {
  getPersonasByUser,
  createPersona,
  updatePersona,
  deletePersona,
  Persona
} from '@/apis/personaApi'
import { useAuthStore, selectUserId } from '@/store/AuthStore'
import { Button } from '@/components/Common/Button'
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface Props {
  userId: string
}

export function PersonaManager({ userId }: Props) {
  const authUserId = useAuthStore(selectUserId)
  const isOwner = authUserId === userId

  const [list, setList] = useState<Persona[]>([])
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // load personas
  useEffect(() => {
    if (!userId) return
    setLoading(true)
    getPersonasByUser(userId)
      .then(setList)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  const add = async () => {
    if (!newName.trim()) return
    try {
      const created = await createPersona({ name: newName, description: newDesc })
      setList(prev => [...prev, created])
      setNewName(''); setNewDesc('')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const save = async (id: number) => {
    try {
      const updated = await updatePersona(id, { name: editName, description: editDesc })
      setList(prev => prev.map(p => p.id === id ? updated : p))
      setEditingId(null)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const remove = async (id: number) => {
    try {
      await deletePersona(id)
      setList(prev => prev.filter(p => p.id !== id))
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (loading) return <p>로딩 중…</p>
  if (error)   return <p className="text-red-600">{error}</p>

  return (
    <div className="flex flex-col gap-4 py-4">
      {isOwner && (
        <div className="flex flex-col md:flex-row items-start">
          <div className="w-full md:w-1/3 md:pr-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              type="text"
              placeholder="새 페르소나 이름"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="
                w-full bg-gray-100 rounded-md border-transparent
                px-4 py-2 text-gray-800
                focus:bg-white focus:ring-2 focus:ring-blue-300
              "
            />
          </div>
          <div className="w-full pt-4 md:w-2/3 md:pr-4 md:pt-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <input
              type="text"
              placeholder="설명 입력"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="
                w-full bg-gray-100 rounded-md border-transparent
                px-4 py-2 text-gray-800
                focus:bg-white focus:ring-2 focus:ring-blue-300
              "
            />
          </div>
          <div className="flex-shrink-0 self-end">
            <Button
              onClick={add}
              className="flex items-center gap-1"
            >
              <PlusIcon className="h-5 w-5" />
              추가
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {list.map(p => (
          <div
            key={p.id}
            className="
              group relative bg-gray-50 p-4 rounded-lg shadow-sm
              hover:shadow-md transition
            "
          >
            {editingId === p.id ? (
              <>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="
                    w-full mb-2 bg-white border border-gray-200
                    px-3 py-2 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-blue-300
                  "
                />
                <input
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="
                    w-full mb-4 bg-white border border-gray-200
                    px-3 py-2 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-blue-300
                  "
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => setEditingId(null)}
                  >
                    <XMarkIcon className="h-5 w-5" />
                    취소
                  </Button>
                  <Button
                    className="flex items-center gap-1"
                    onClick={() => save(p.id)}
                  >
                    <PlusIcon className="h-5 w-5 rotate-45" />
                    저장
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {p.name}
                  </h3>
                  {isOwner && (
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingId(p.id)
                          setEditName(p.name)
                          setEditDesc(p.description)
                        }}
                        aria-label="수정"
                      >
                        <PencilIcon className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        aria-label="삭제"
                      >
                        <TrashIcon className="h-5 w-5 text-gray-600 hover:text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-gray-600">
                  {p.description || <span className="italic text-gray-400">설명 없음</span>}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}