// components/CategorySelector.tsx
'use client'

import type { JSX } from 'react'
import { useState, useEffect, DragEvent, ChangeEvent } from 'react'
import { Dialog } from '@headlessui/react'
import {
  getCategoryTree,
  CategoryNode,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/services/categoryService'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  XCircleIcon,
  MinusSmallIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

interface Props {
  userId: string | null
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
  const [filteredTree, setFilteredTree] = useState<CategoryNode[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Inline creation/edit state
  const [creatingParentId, setCreatingParentId] = useState<number | null>(null)
  const [newName, setNewName] = useState<string>('')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editedName, setEditedName] = useState<string>('')

  // 전체 트리 로드
  const loadTree = () => {
    if (!userId) return
    setLoading(true)
    getCategoryTree(userId)
      .then((data) => {
        setTree(data)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (isOpen) {
      loadTree()
      setSearchTerm('')
      setExpandedIds(new Set())
      setCreatingParentId(null)
      setEditingId(null)
    }
  }, [isOpen, userId])

  // 검색어 변경 시 필터된 트리 업데이트
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTree(tree)
      return
    }
    const term = searchTerm.trim().toLowerCase()

    // 재귀적으로 노드 필터링: 일치 노드 또는 자식에 일치 항목이 있으면 포함
    const filterNodes = (nodes: CategoryNode[]): CategoryNode[] => {
      const result: CategoryNode[] = []
      for (const node of nodes) {
        const nameMatch = node.name.toLowerCase().includes(term)
        const filteredChildren = filterNodes(node.children)
        if (nameMatch || filteredChildren.length > 0) {
          result.push({
            ...node,
            children: filteredChildren,
          })
        }
      }
      return result
    }

    setFilteredTree(filterNodes(tree))

    // 일치하는 노드를 펼치기 위해 모든 노드를 확장
    const collectIds = (nodes: CategoryNode[], acc: Set<number>) => {
      for (const node of nodes) {
        acc.add(node.id)
        if (node.children.length > 0) {
          collectIds(node.children, acc)
        }
      }
    }
    const newExpanded = new Set<number>()
    collectIds(filterNodes(tree), newExpanded)
    setExpandedIds(newExpanded)
  }, [searchTerm, tree])

  // 노드 확장/접기 토글
  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // 선택
  const selectNode = (id: number) => {
    setSelectedCategory(id)
    onClose()
  }

  // 인라인 생성 버튼 클릭
  const startCreating = (parentId: number | null) => {
    setCreatingParentId(parentId)
    setNewName('')
  }

  // 생성 확인
  const confirmCreate = async () => {
    const name = newName.trim()
    if (!name) {
      setCreatingParentId(null)
      return
    }
    await createCategory({ name, parentId: creatingParentId ?? undefined })
    loadTree()
    setCreatingParentId(null)
  }

  // 생성 취소
  const cancelCreate = () => {
    setCreatingParentId(null)
    setNewName('')
  }

  // 인라인 수정 버튼 클릭
  const startEditing = (node: CategoryNode) => {
    setEditingId(node.id)
    setEditedName(node.name)
  }

  // 수정 확인
  const confirmEdit = async () => {
    if (editingId === null) return
    const name = editedName.trim()
    if (!name) {
      setEditingId(null)
      return
    }
    await updateCategory(editingId, { name })
    loadTree()
    setEditingId(null)
  }

  // 수정 취소
  const cancelEdit = () => {
    setEditingId(null)
    setEditedName('')
  }

  // 삭제
  const deleteNodeById = async (node: CategoryNode) => {
    if (!confirm(`"${node.name}"을(를) 삭제하시겠습니까?`)) return
    await deleteCategory(node.id)
    loadTree()
  }

  // Drag & Drop
  const onDragStart = (e: DragEvent, node: CategoryNode) => {
    e.dataTransfer.setData('categoryId', String(node.id))
  }
  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
  }
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

  

  // 트리 렌더링 (재귀)
  const renderNodes = (
    nodes: CategoryNode[],
    level: number = 0
  ): JSX.Element[] => {
    return nodes.flatMap((node) => {
      const isExpanded = expandedIds.has(node.id)
      const hasChildren = node.children.length > 0

      // 들여쓰기 스타일
      const indentStyle = { marginLeft: `${level * 16}px` }

      // 현재 수정 중인 노드
      const isEditing = editingId === node.id
      // 현재 생성 중인 자식
      const isCreatingHere = creatingParentId === node.id

      // 공통 컨테이너 스타일: 테두리, 배경, 패딩, rounded
      const containerClass =
        'flex items-center space-x-2 mb-1 border border-gray-300 rounded-lg px-1 py-3 bg-white hover:bg-gray-50'

      const line: JSX.Element[] = []

      // 노드 항목
      line.push(
        <div
          key={`node-${node.id}`}
          style={indentStyle}
          className={containerClass}
          draggable
          onDragStart={(e) => onDragStart(e, node)}
          onDragOver={onDragOver}
          onDrop={(e) => onDropNode(e, node)}
        >
          {/* 확장/접기 아이콘 */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(node.id)}
              className="w-6 h-6 flex items-center justify-center mx-1 text-gray-600 hover:text-gray-800"
              aria-label={isExpanded ? '닫기' : '열기'}
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-5 h-5" />
              ) : (
                <ChevronRightIcon className="w-5 h-5" />
              )}
            </button>
          ) : (
            // 자식이 없으면 빈 공간 유지
            <div
              className="w-6 h-6 flex items-center justify-center mx-1 text-gray-400"
              aria-hidden="true"
            >
              <MinusSmallIcon className="w-5 h-5" />
            </div>
          )}

          {/* 노드 이름 또는 인라인 편집 */}
          {isEditing ? (
            <>
              <input
                type="text"
                value={editedName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditedName(e.target.value)
                }
                className="border px-2 py-1 rounded text-sm flex-1"
              />
              <button
                onClick={confirmEdit}
                className="w-6 h-6 flex items-center justify-center text-blue-600 hover:text-blue-800"
                aria-label="편집 확인"
              >
                <CheckIcon className="w-5 h-5" />
              </button>
              <button
                onClick={cancelEdit}
                className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800"
                aria-label="편집 취소"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => selectNode(node.id)}
                className={`flex-1 text-left text-sm py-1 ${
                  selectedCategory === node.id
                    ? 'font-bold underline text-purple-700'
                    : 'hover:underline text-gray-800'
                }`}
              >
                {node.name}
              </button>
              {/* 인라인 생성/수정/삭제 아이콘 */}
              <button
                onClick={() => startCreating(node.id)}
                className="w-6 h-6 flex items-center justify-center text-green-600 hover:text-green-800"
                aria-label="하위 카테고리 추가"
              >
                <PlusCircleIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => startEditing(node)}
                className="w-6 h-6 flex items-center justify-center text-blue-600 hover:text-blue-800"
                aria-label="카테고리 이름 수정"
              >
                <PencilSquareIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteNodeById(node)}
                className="w-6 h-6 flex items-center justify-center text-red-600 hover:text-red-800"
                aria-label="카테고리 삭제"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      )

      // 인라인 생성 폼
      if (isCreatingHere) {
        line.push(
          <div
            key={`create-${node.id}`}
            style={{ paddingLeft: `${(level + 1) * 16}px` }}
            className="flex items-center space-x-2 mb-1 border border-gray-300 rounded-lg p-3 bg-white"
          >
            <input
              type="text"
              value={newName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewName(e.target.value)
              }
              placeholder="새 카테고리 이름"
              className="border px-2 py-1 rounded text-sm flex-1"
            />
            <button
              onClick={confirmCreate}
              className="w-6 h-6 flex items-center justify-center text-blue-600 hover:text-blue-800"
              aria-label="생성 확인"
            >
              <CheckIcon className="w-5 h-5" />
            </button>
            <button
              onClick={cancelCreate}
              className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800"
              aria-label="생성 취소"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        )
      }

      // 자식 노드 렌더링
      if (hasChildren && isExpanded) {
        line.push(...renderNodes(node.children, level + 1))
      }

      return line
    })
  }

  // 루트 레벨에서 생성 버튼과 인라인 폼
  const renderRootCreation = (): JSX.Element | null => {
    if (creatingParentId !== null) return null

    return (
      <div className="flex items-center space-x-2 mb-2">
        <button
          onClick={() => startCreating(null)}
          className="flex items-center space-x-1 text-green-600 hover:text-green-800"
        >
          <PlusCircleIcon className="w-5 h-5" />
          <span className="text-sm">최상위 추가</span>
        </button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/40"
        onDragOver={onDragOver}
        onDrop={onDropRoot}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[80vh] overflow-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">카테고리 선택</h2>
            <button
              onClick={loadTree}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
            >
              <XCircleIcon className="w-5 h-5" />
              <span className="text-sm">새로고침</span>
            </button>
          </div>

          {/* 검색창 */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              placeholder="카테고리 검색"
              className="w-full border px-2 py-1 rounded text-sm"
            />
          </div>

          {loading && <p className="text-center text-gray-500">로딩 중…</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <div>
              {/* 최상위 드롭 영역 */}
              <div className="mb-2">
                <div
                  className="border border-dashed border-gray-300 p-2 text-center text-sm text-gray-600"
                  onDragOver={onDragOver}
                  onDrop={onDropRoot}
                >
                  여기에 드롭 시 최상위로 이동
                </div>
              </div>

              {/* 최상위 생성 버튼 */}
              {renderRootCreation()}

              {/* 트리 목록 */}
              <div>
                {renderNodes(filteredTree.length ? filteredTree : tree)}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              닫기
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}