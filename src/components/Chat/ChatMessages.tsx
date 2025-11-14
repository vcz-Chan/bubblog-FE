'use client'

import { useEffect, useRef } from 'react'
import { ChatBubble } from './ChatBubble'
import { InspectorPanel } from '@/components/Chat/InspectorPanel'
import { ThreeDotsLoader } from '@/components/Common/ThreeDotsLoader'
import type { ContextItem, SearchPlan } from '@/apis/aiApi'

export interface InspectorData {
  version: 'v1' | 'v2'
  open: boolean
  // v1
  v1Context?: ContextItem[]
  v1ContextReceived?: boolean
  // v2
  v2Plan?: SearchPlan | null
  v2PlanReceived?: boolean
  v2Rewrites?: string[]
  v2RewritesReceived?: boolean
  v2Keywords?: string[]
  v2KeywordsReceived?: boolean
  v2HybridResult?: ContextItem[]
  v2HybridResultReceived?: boolean
  v2SearchResult?: ContextItem[]
  v2SearchResultReceived?: boolean
  v2Context?: ContextItem[]
  v2ContextReceived?: boolean
  // pending: inspector data not arrived yet
  pending?: boolean
}

export interface ChatMessage {
  id: number
  role: 'user' | 'bot'
  content: string
  inspector?: InspectorData
}

interface Props {
  messages: ChatMessage[]
  chatEndRef: React.RefObject<HTMLDivElement | null >
  loadingMoreTop?: boolean
  hasMoreTop?: boolean
  onLoadMoreTop?: () => void
  onToggleInspector?: (id: number) => void
  onInspectorItemClick?: (messageId: number, item: ContextItem) => void
}

export function ChatMessages({
  messages,
  chatEndRef,
  loadingMoreTop,
  hasMoreTop,
  onLoadMoreTop,
  onToggleInspector,
  onInspectorItemClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const topSentinelRef = useRef<HTMLDivElement | null>(null)
  const prevScrollHeightRef = useRef<number | null>(null)

  useEffect(() => {
    if (!onLoadMoreTop || !hasMoreTop) return
    const sentinel = topSentinelRef.current
    const container = containerRef.current
    if (!sentinel || !container) return

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (entry?.isIntersecting && !loadingMoreTop) {
          prevScrollHeightRef.current = container.scrollHeight
          onLoadMoreTop()
        }
      },
      { root: container, threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMoreTop, loadingMoreTop, onLoadMoreTop])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (!loadingMoreTop && prevScrollHeightRef.current != null) {
      const delta = container.scrollHeight - prevScrollHeightRef.current
      container.scrollTop += delta
      prevScrollHeightRef.current = null
    }
  }, [loadingMoreTop, messages])

  return (
    <div
      ref={containerRef}
      className="mb-4 flex-1 space-y-4 overflow-y-auto px-2 w-full h-full"
    >
      <div ref={topSentinelRef} />
      {loadingMoreTop && (
        <div className="flex justify-center">
          <ThreeDotsLoader />
        </div>
      )}
      {messages.map(msg => (
        <div key={msg.id} className="space-y-2">
          {msg.role === 'bot' && msg.inspector && (() => {
            const ins = msg.inspector
            const hasAnyData = ins.version === 'v1'
              ? !!ins.v1ContextReceived
              : !!(ins.v2PlanReceived || ins.v2RewritesReceived || ins.v2KeywordsReceived || ins.v2HybridResultReceived || ins.v2SearchResultReceived || ins.v2ContextReceived)

            if (!hasAnyData) return null

            return (
              <InspectorPanel
                version={ins.version}
                visible={ins.open}
                onToggle={() => onToggleInspector?.(msg.id)}
                v1Context={ins.v1Context}
                v1ContextReceived={ins.v1ContextReceived}
                v2Plan={ins.v2Plan}
                v2PlanReceived={ins.v2PlanReceived}
                v2Rewrites={ins.v2Rewrites}
                v2RewritesReceived={ins.v2RewritesReceived}
                v2Keywords={ins.v2Keywords}
                v2KeywordsReceived={ins.v2KeywordsReceived}
                v2HybridResult={ins.v2HybridResult}
                v2HybridResultReceived={ins.v2HybridResultReceived}
                v2SearchResult={ins.v2SearchResult}
                v2SearchResultReceived={ins.v2SearchResultReceived}
                v2Context={ins.v2Context}
                v2ContextReceived={ins.v2ContextReceived}
                onItemClick={onInspectorItemClick ? (item) => onInspectorItemClick(msg.id, item) : undefined}
              />
            )
          })()}
          <ChatBubble content={msg.content} role={msg.role} loading={msg.role === 'bot' && !msg.content} />
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  )
}
