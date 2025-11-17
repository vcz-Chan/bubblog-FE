'use client'

import { Rnd } from 'react-rnd'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowsPointingOutIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface DraggableModalProps {
  path: string
  children: React.ReactNode
  onClose: () => void
  initialWidth?: number
  initialHeight?: number
}

export function DraggableModal({
  path,
  children,
  onClose,
  initialWidth = 600,
  initialHeight = 400,
}: DraggableModalProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const x = (window.innerWidth - initialWidth) / 2
    const y = (window.innerHeight - initialHeight) / 2
    setPos({ x, y })
  }, [initialWidth, initialHeight])

  if (!pos) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Rnd
        default={{
          x: pos.x,
          y: pos.y,
          width: initialWidth,
          height: initialHeight,
        }}
        bounds="parent"
        minWidth={240}
        minHeight={160}
        enableResizing={{
          top: true, right: true, bottom: true, left: true,
          topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
        }}
        dragHandleClassName="modal-header"
        className="pointer-events-auto bg-gray-50 border border-gray-200 rounded-lg shadow-2xl overflow-hidden"
        style={{ zIndex: 1000 }}
      >
        <div
          className="
            modal-header flex items-center justify-between
            bg-gray-100 border-b border-gray-200
            px-4 py-2 cursor-move select-none
          "
        >
          <Link
            href={path}
            className="flex items-center gap-1 text-gray-800 hover:text-gray-900"
          >
            <ArrowsPointingOutIcon className="h-5 w-5" />
            <span className="text-lg font-medium">
              전체보기
            </span>
          </Link>
          <button
            onClick={onClose}
            className="
              text-gray-500 hover:text-gray-800
              p-1 rounded-full transition
            "
            aria-label="닫기"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* 본문 영역 */}
        <div className="p-4 h-[calc(100%-3.5rem)] overflow-auto">
          {children}
        </div>
      </Rnd>
    </div>
  )
}