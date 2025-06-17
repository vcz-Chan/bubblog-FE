'use client'

import { useState, useEffect } from 'react'
import {
  getPersonasByUser,
  createPersona,
  updatePersona,
  deletePersona,
  Persona
} from '@/services/personaService'
import { useAuth } from '@/contexts/AuthContext'

interface Props {
  userId: string
}

export function PersonaManager({ userId }: Props) {
  const { userId: authUserId } = useAuth()
  const isOwner = authUserId === userId

  const [list, setList] = useState<Persona[]>([])
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    getPersonasByUser(userId)
      .then(data => setList(data))
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
    <div className="space-y-4">
      {isOwner && (
        <div className="flex space-x-2">
          <input
            className="flex-1 border px-3 py-2 rounded"
            placeholder="이름"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <input
            className="flex-2 border px-3 py-2 rounded"
            placeholder="설명"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={add}
          >
            추가
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {list.map(p => (
          <li key={p.id} className="flex items-center space-x-2">
            {editingId === p.id ? (
              <>
                <input
                  className="border px-2 py-1 rounded"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
                <input
                  className="flex-1 border px-2 py-1 rounded"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                />
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                  onClick={() => save(p.id)}
                >
                  저장
                </button>
                <button
                  className="px-3 py-1 bg-gray-400 text-white rounded"
                  onClick={() => setEditingId(null)}
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <span className="font-medium">{p.name}</span>
                <span className="text-gray-600 flex-1">{p.description}</span>
                {isOwner && (
                  <>
                    <button
                      className="px-2 py-1 bg-yellow-500 text-white rounded"
                      onClick={() => {
                        setEditingId(p.id)
                        setEditName(p.name)
                        setEditDesc(p.description)
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => remove(p.id)}
                    >
                      삭제
                    </button>
                  </>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}