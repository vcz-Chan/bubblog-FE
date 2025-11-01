'use client'

import React from 'react'
import type { JSX } from 'react'
import { useState, useEffect, DragEvent, ChangeEvent, useRef } from 'react'
import { Dialog } from '@headlessui/react'
import {
  getCategoryTree,
  CategoryNode,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/apis/categoryApi'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  XCircleIcon,
  MinusSmallIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/AuthStore';
import { ConfirmModal } from '@/components/Common/ConfirmModal'

interface Props {
  userId: string | null
  isOpen: boolean
  onClose: () => void
  selectedCategory: CategoryNode | null
  setSelectedCategory: (category: CategoryNode | null) => void
}

export function CategorySelector({
  userId,
  isOpen,
  onClose,
  selectedCategory,
  setSelectedCategory,
}: Props) {
  const { userId: authUserId } = useAuthStore()
  const isOwner = authUserId === userId
  const [tree, setTree] = useState<CategoryNode[]>([])
  const [filteredTree, setFilteredTree] = useState<CategoryNode[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryNode | null>(null)
  const [hoverTargetId, setHoverTargetId] = useState<number | null>(null)

  // 키보드 내비게이션을 위한 ref
  const listRef = useRef<HTMLDivElement>(null)

  // Inline creation/edit state
  // undefined: 생성 모드 아님, null: 루트 생성, number: 해당 id 하위 생성
  const [creatingParentId, setCreatingParentId] = useState<number | null | undefined>(undefined)
  const [newName, setNewName] = useState<string>('')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editedName, setEditedName] = useState<string>('')
  
  // 검색 하이라이트 렌더러
  const renderHighlighted = (text: string) => {
    const term = searchTerm.trim()
    if (!term) return text
    try {
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig')
      const parts = text.split(regex)
      return (
        <>
          {parts.map((part, i) =>
            regex.test(part) ? (
              <mark key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5">{part}</mark>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </>
      )
    } catch {
      return text
    }
  }

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
      setCreatingParentId(undefined)
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
  const selectNode = (category: CategoryNode | null) => {
    setSelectedCategory(category)
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
      setCreatingParentId(undefined)
      return
    }
    await createCategory({
      name,
      parentId: creatingParentId === null ? undefined : creatingParentId,
    })
    cancelCreate()
    loadTree()
    setCreatingParentId(undefined)
  }

  // 루트 생성 시작
  const startCreatingRoot = () => {
    setCreatingParentId(null)
    setNewName('')
  }

  // 생성 취소
  const cancelCreate = () => {
    setCreatingParentId(undefined)
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

  // 삭제 - ConfirmModal 사용
  const requestDelete = (node: CategoryNode) => {
    setDeleteTarget(node)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await deleteCategory(deleteTarget.id)
    setDeleteTarget(null)
    loadTree()
  }

  const cancelDelete = () => setDeleteTarget(null)

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
    setHoverTargetId(null)
  }
  const onDropRoot = async (e: DragEvent) => {
    e.preventDefault()
    const id = Number(e.dataTransfer.getData('categoryId'))
    await updateCategory(id, { newParentId: 0 }) // 0은 최상위로 이동
    loadTree()
  }

  // 리스트 컨테이너에서 ↑/↓로 포커스 이동
  const onKeyDownList = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const root = listRef.current
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLButtonElement>('button[data-cat-id]'))
    if (items.length === 0) return
    const active = document.activeElement as HTMLElement | null
    const idx = active ? items.findIndex(el => el === active) : -1
    let nextIdx = idx
    if (e.key === 'ArrowDown') nextIdx = Math.min(items.length - 1, idx + 1)
    if (e.key === 'ArrowUp') nextIdx = Math.max(0, idx - 1)
    if (nextIdx !== idx && items[nextIdx]) {
      e.preventDefault()
      items[nextIdx].focus()
    }
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

      // 드래그 가능 여부
      const dragProps = isOwner
        ? {
            draggable: true,
            onDragStart: (e: DragEvent) => onDragStart(e, node),
            onDragOver: (e: DragEvent) => { onDragOver(e); setHoverTargetId(node.id) },
            onDragLeave: () => setHoverTargetId(prev => (prev === node.id ? null : prev)),
            onDrop: (e: DragEvent) => onDropNode(e, node),
          }
        : {}

      // 공통 컨테이너 스타일: 테두리, 배경, 패딩, rounded
      const baseClass = 'flex items-center gap-2 mb-1 rounded-md px-2 py-2 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500'
      const highlightClass = hoverTargetId === node.id ? 'ring-2 ring-indigo-300' : ''
      const containerClass = `${baseClass} ${highlightClass}`

      const line: JSX.Element[] = []

      // 노드 항목
      line.push(
        <div
          key={`node-${node.id}`}
          style={indentStyle}
          className={containerClass}
          role="treeitem"
          aria-level={level + 1}
          aria-selected={selectedCategory?.id === node.id || undefined}
          {...dragProps}
        >
          {/* 확장/접기 아이콘 */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(node.id)}
              className="w-6 h-6 flex items-center justify-center mx-1 text-gray-600 hover:text-gray-800"
              aria-label={isExpanded ? '닫기' : '열기'}
              aria-expanded={hasChildren ? isExpanded : undefined}
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          ) : (
            // 자식이 없으면 빈 공간 유지
            <div
              className="w-6 h-6 flex items-center justify-center mx-1 text-gray-400"
              aria-hidden="true"
            >
              <MinusSmallIcon className="w-4 h-4" />
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
                onClick={() => selectNode(node)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    selectNode(node)
                  } else if (e.key === 'ArrowRight') {
                    if (hasChildren && !isExpanded) toggleExpand(node.id)
                  } else if (e.key === 'ArrowLeft') {
                    if (hasChildren && isExpanded) toggleExpand(node.id)
                  }
                }}
                className={`flex-1 text-left text-sm py-1 outline-none ${
                  selectedCategory?.id === node.id
                    ? 'font-semibold text-indigo-700'
                    : 'hover:underline text-gray-800'
                }`}
                data-cat-id={node.id}
              >
                {renderHighlighted(node.name)}
              </button>
              {/* 인라인 생성/수정/삭제 아이콘 */}
              {isOwner && (
              <>
                <button
                  onClick={() => startCreating(node.id)}
                  className="w-6 h-6 flex items-center justify-center text-green-600 hover:text-green-800"
                  aria-label="하위 카테고리 추가"
                >
                  <PlusCircleIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startEditing(node)}
                  className="w-6 h-6 flex items-center justify-center text-blue-600 hover:text-blue-800"
                  aria-label="카테고리 이름 수정"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => requestDelete(node)}
                  className="w-6 h-6 flex items-center justify-center text-red-600 hover:text-red-800"
                  aria-label="카테고리 삭제"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
               </>)}
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

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-100 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/40"
          onDragOver={isOwner ? onDragOver : undefined}
          onDrop={isOwner ? onDropRoot : undefined}
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[80vh] overflow-auto">
          {/* Header + Search (sticky) */}
          <div className="sticky top-0 z-10 -mx-6 px-6 pt-2 pb-3 mb-3 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">카테고리 선택</h2>
              <button
                onClick={loadTree}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                aria-label="새로고침"
                title="새로고침"
              >
                <ArrowPathIcon className="w-5 h-5" />
                <span className="text-sm">새로고침</span>
              </button>
            </div>
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="카테고리 검색"
                className="w-full border px-2 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-6 text-gray-500">
              <div className="h-5 w-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
              로딩 중…
            </div>
          )}
          {error && <p className="text-center text-red-500 py-4">{error}</p>}

          {!loading && !error && (
            <div>
              <div className="mb-4">
                <button
                  onClick={() => selectNode(null)}
                  className={`
                    w-full
                    px-5 py-2
                    rounded-full
                    text-sm font-medium
                    transition
                    ${selectedCategory
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }
                  `}
                >
                  {selectedCategory ? '클릭 시 카테고리 선택 해제' : '전체 카테고리 선택 중'}
                </button>
              </div>
              {isOwner && (
                <div className="mb-2">
                  <div
                    className="border border-dashed border-gray-300 p-2 text-center text-sm text-gray-600"
                    onDragOver={onDragOver}
                    onDrop={onDropRoot}
                  >
                    여기에 드롭 시 최상위로 이동
                  </div>
                </div>
              )}

              {/* 최상위 생성 버튼 */}
              {isOwner && creatingParentId === undefined && (
                <div className="flex items-center mb-2">
                  <button
                    onClick={startCreatingRoot}
                    className="text-green-600 hover:text-green-800"
                  >
                    최상위 추가
                  </button>
                </div>
              )}

              {/* 트리 목록 / 빈 상태 */}
              {(() => {
                const hasSearch = !!searchTerm.trim()
                const display = (hasSearch ? filteredTree : tree)
                if (!display.length) {
                  return (
                    <div className="text-center text-sm text-gray-500 py-10">
                      {hasSearch ? '검색 결과가 없습니다.' : (
                        <div className="space-y-2">
                          <p>카테고리가 없습니다.</p>
                          {isOwner && (
                            <button onClick={startCreatingRoot} className="text-indigo-600 hover:underline">최상위 카테고리부터 만들어보세요</button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                }
                return (
                  <div ref={listRef} role="tree" onKeyDown={onKeyDownList}>
                    {renderNodes(display)}
                  </div>
                )
              })()}

              {/* 인라인 생성 폼 (루트 카테고리용) */}
              {isOwner &&creatingParentId === null && (
                <div
                  key="create-root"
                  className="mt-8 flex items-center space-x-2 mb-2 border rounded p-2 bg-white"
                >
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="새 루트 카테고리 추가"
                    className="flex-1 border px-2 py-1 rounded text-sm"
                  />
                  <button
                    onClick={confirmCreate}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    확인
                  </button>
                  <button
                    onClick={cancelCreate}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    취소
                  </button>
                </div>
              )}
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
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="삭제 확인"
        message={deleteTarget ? `"${deleteTarget.name}" 카테고리를 삭제하시겠습니까?` : ''}
        confirmText="삭제"
        cancelText="취소"
        isDestructive
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  )
}

 
