'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  SparklesIcon,
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

  if (loading) return <p className="text-center py-8 text-gray-500">로딩 중…</p>
  if (error) return <p className="text-center py-8 text-red-600">{error}</p>

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* 추가 폼 */}
      {isOwner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100"
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  페르소나 이름
                </label>
                <input
                  type="text"
                  placeholder="예: 친절한 조언자"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="
                    w-full bg-white rounded-lg border border-gray-200
                    px-4 py-3 text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all
                  "
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <input
                  type="text"
                  placeholder="예: 따뜻하고 격려하는 말투"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="
                    w-full bg-white rounded-lg border border-gray-200
                    px-4 py-3 text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all
                  "
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={add}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5" />
                페르소나 추가
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 페르소나 리스트 */}
      {list.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            아직 페르소나가 없습니다
          </h3>
          <p className="text-sm text-gray-400">
            첫 페르소나를 만들어 AI 챗봇을 개성있게 만들어보세요
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {list.map(p => (
              <motion.div
                key={p.id}
                variants={item}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
                className="
                  group relative bg-white rounded-xl p-5 shadow-md
                  hover:shadow-xl transition-all duration-300
                  border border-gray-100 hover:border-blue-200
                "
              >
                {editingId === p.id ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="
                        w-full bg-gray-50 border border-gray-200
                        px-3 py-2 rounded-lg text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                      "
                      placeholder="이름"
                    />
                    <textarea
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      className="
                        w-full bg-gray-50 border border-gray-200
                        px-3 py-2 rounded-lg text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        resize-none
                      "
                      rows={3}
                      placeholder="설명"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        취소
                      </button>
                      <Button
                        onClick={() => save(p.id)}
                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700"
                      >
                        저장
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* 아이콘 */}
                    <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <SparklesIcon className="h-6 w-6 text-white" />
                    </div>

                    {/* 액션 버튼 */}
                    {isOwner && (
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(p.id)
                            setEditName(p.name)
                            setEditDesc(p.description)
                          }}
                          className="p-1.5 rounded-lg bg-white shadow-md hover:bg-blue-50 transition-colors"
                          aria-label="수정"
                        >
                          <PencilIcon className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => remove(p.id)}
                          className="p-1.5 rounded-lg bg-white shadow-md hover:bg-red-50 transition-colors"
                          aria-label="삭제"
                        >
                          <TrashIcon className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    )}

                    {/* 콘텐츠 */}
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {p.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {p.description || (
                          <span className="italic text-gray-400">설명 없음</span>
                        )}
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}