'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export interface ContextItem {
  post_id: string
  post_title: string
}

interface Props {
  items: ContextItem[]
  visible: boolean
  onToggle: () => void
  onItemClick?: (item: ContextItem) => void
}

export function ContextViewer({
  items,
  visible,
  onToggle,
  onItemClick,
}: Props) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)')
    const update = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mql.matches)

    if (mql.addEventListener) {
      mql.addEventListener('change', update)
    } else {
      mql.addListener(update)
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', update)
      } else {
        mql.removeListener(update)
      }
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div className='w-full flex flex-col'>
      <button
        onClick={onToggle}
        className=" flex-1 
          px-4 py-2 mx-8 
          bg-gray-500 hover:bg-gray-600
          text-white
          transition rounded-lg
        "
      >
        {visible ? '컨텍스트 숨기기' : '관련 문서 보기'}
      </button>

      {visible && (
        <div
          className="
            p-4 mx-8
            bg-gray-50 rounded-lg
            border border-gray-200
            space-y-3
          "
        >
          {items.map(ctx => {
            const commonClasses = `
              block w-full text-left
              font-semibold
              cursor-pointer hover:text-green-600
              transition
            `
            const useDiv = onItemClick && !isMobile
            return useDiv ? (
              <div
                key={ctx.post_id}
                onClick={() => onItemClick(ctx)}
                className={commonClasses}
                role="button"
              >
                {ctx.post_title}
              </div>
            ) : (
              <Link key={ctx.post_id} href={`/post/${ctx.post_id}`}>
                <div className={commonClasses}>
                  {ctx.post_title}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}