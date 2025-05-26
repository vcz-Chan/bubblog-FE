// components/CategorySelector.tsx
'use client'

import { useState, useEffect, DragEvent } from 'react'
import { Dialog } from '@headlessui/react'
import { motion } from 'framer-motion'
import {
  getCategoryTree,
  CategoryNode,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/services/categoryService'

interface Props {
  userId: string | null,
  isOpen: boolean
  onClose: () => void
  selectedCategory: number | null
  setSelectedCategory: (id: number) => void
}

export function CategorySelector({
  userId,
  isOpen,
  onClose,
  selectedCategory,
  setSelectedCategory,
}: Props) {
  const [tree, setTree] = useState<CategoryNode[]>([])
  const [currentNodes, setCurrentNodes] = useState<CategoryNode[]>([])
  const [path, setPath] = useState<CategoryNode[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 전체 트리 로드
  const loadTree = () => {
    if (!userId) return
    setLoading(true)
    getCategoryTree(userId)
      .then(data => {
        setTree(data)
        setCurrentNodes(data.filter(n => n.root))
        setPath([])
        setError(null)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (isOpen) loadTree()
  }, [isOpen, userId])

  // 특정 단계까지 이동
  const goToLevel = (index: number) => {
    const newPath = path.slice(0, index + 1)
    setPath(newPath)
    const nextNodes = newPath.length
      ? newPath[newPath.length - 1].children
      : tree.filter(n => n.root)
    setCurrentNodes(nextNodes)
  }

  // 자식 보기
  const drill = (node: CategoryNode) => {
    setPath(prev => [...prev, node])
    setCurrentNodes(node.children)
  }

  // 선택
  const select = (id: number) => {
    setSelectedCategory(id)
    onClose()
  }

  // 하위 추가
  const createChild = async () => {
    const name = prompt('새 카테고리 이름')?.trim()
    if (!name) return
    const parentId = path.length ? path[path.length - 1].id : undefined
    await createCategory({ name, parentId })
    loadTree()
  }

  // 수정, 삭제
  const editNode = async (node: CategoryNode) => {
    const name = prompt('새 이름', node.name)?.trim()
    if (!name) return
    await updateCategory(node.id, { name })
    loadTree()
  }
  const deleteNode = async (node: CategoryNode) => {
    if (!confirm(`"${node.name}" 삭제하시겠습니까?`)) return
    await deleteCategory(node.id)
    loadTree()
  }

  // Drag & Drop
  const onDragStart = (e: DragEvent, node: CategoryNode) => {
    e.dataTransfer.setData('categoryId', String(node.id))
  }
  const onDragOver = (e: DragEvent) => e.preventDefault()
  const onDropNode = async (e: DragEvent, node: CategoryNode) => {
    e.preventDefault()
    const id = Number(e.dataTransfer.getData('categoryId'))
    if (id === node.id) return
    await updateCategory(id, { newParentId: node.id })
    loadTree()
  }
  const onDropRoot = async (e: DragEvent) => {
    e.preventDefault()
    const id = Number(e.dataTransfer.getData('categoryId'))
    await updateCategory(id, { newParentId: undefined })
    loadTree()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/40"
        onDragOver={onDragOver}
        onDrop={onDropRoot}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">카테고리 선택</h2>
            <button
              onClick={createChild}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm"
            >
              카테고리 추가
            </button>
          </div>

          {/* Breadcrumb */}
          <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-600">
            <button
              onClick={() => {
                setCurrentNodes(tree.filter(n => n.root))
                setPath([])
              }}
              className={path.length === 0 ? 'font-bold' : 'hover:underline'}
            >
              전체
            </button>
            {path.map((node, i) => (
              <span key={node.id} className="flex items-center">
                <span>/</span>
                <button
                  onClick={() => goToLevel(i)}
                  className={i === path.length - 1 ? 'font-bold' : 'hover:underline'}
                >
                  {node.name}
                </button>
              </span>
            ))}
          </div>

          {loading && <p className="text-center text-gray-500">로딩 중…</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {/* Category Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-2 gap-4">
              {currentNodes.map(node => (
                <motion.div
                  key={node.id}
                  draggable
                  onDragStart={e => onDragStart(e, node)}
                  onDragOver={onDragOver}
                  onDrop={e => onDropNode(e, node)}
                  whileTap={{ scale: 0.97 }}
                  className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 shadow-sm"
                >
                  <div className="flex items-center space-x-2">
                    
                    <button
                      onClick={() => select(node.id)}
                      className={`flex-1 text-left py-1 px-2 rounded-full ${
                        selectedCategory === node.id
                          ? 'bg-purple-500 text-white'
                          : 'hover:bg-purple-200'
                      }`}
                    >
                      {node.name}
                    </button>
                    
                    {node.children.length > 0 && (
                      <button
                        onClick={() => drill(node)}
                        className="text-gray-500 hover:text-gray-800"
                      >
                        ▶
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => editNode(node)}
                      className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => deleteNode(node)}
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs"
                    >
                      삭제
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <p className="mt-4 text-center text-xs text-gray-500">
            * 드래그하여 다른 항목 위에 놓으면 부모가 변경됩니다.
          </p>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}