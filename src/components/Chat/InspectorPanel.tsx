'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { ContextItem, SearchPlan } from '@/apis/aiApi'
import { ThreeDotsLoader } from '@/components/Common/ThreeDotsLoader'

interface Props {
  version: 'v1' | 'v2'
  visible: boolean
  onToggle: () => void
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
  onItemClick?: (item: ContextItem) => void
}

export function InspectorPanel({
  version,
  visible,
  onToggle,
  v1Context = [],
  v1ContextReceived = false,
  v2Plan = null,
  v2PlanReceived = false,
  v2Rewrites = [],
  v2RewritesReceived = false,
  v2Keywords = [],
  v2KeywordsReceived = false,
  v2HybridResult = [],
  v2HybridResultReceived = false,
  v2SearchResult = [],
  v2SearchResultReceived = false,
  v2Context = [],
  v2ContextReceived = false,
  onItemClick,
}: Props) {
  const [planOpen, setPlanOpen] = useState(false)
  const [rewritesOpen, setRewritesOpen] = useState(false)
  const [keywordsOpen, setKeywordsOpen] = useState(false)
  const [hybridOpen, setHybridOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="
      border border-gray-200 rounded-lg
      p-3 sm:p-4
      bg-white shadow-sm
      hover:shadow-md transition-shadow duration-200
    ">
      <div className="text-xs font-bold text-blue-700 mb-2 sm:mb-3 uppercase tracking-wide">
        {title}
      </div>
      {children}
    </div>
  )

  const renderList = (items: ContextItem[]) => (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={`${it.post_id}-${i}`} className="flex items-start gap-2">
          <span className="text-blue-500 mt-1">•</span>
          {onItemClick ? (
            <button
              type="button"
              className="
                text-left text-sm font-medium text-gray-700
                hover:text-blue-600 hover:underline
                transition-colors duration-150
                flex-1
              "
              onClick={() => onItemClick(it)}
            >
              {it.post_title}
            </button>
          ) : (
            <Link
              href={`/post/${it.post_id}`}
              className="
                text-sm font-medium text-gray-700
                hover:text-blue-600 hover:underline
                transition-colors duration-150
                flex-1
              "
            >
              {it.post_title}
            </Link>
          )}
        </li>
      ))}
    </ul>
  )

  const v2Summary = useMemo(() => {
    if (!v2Plan) return ''
    const bits: string[] = []
    if (v2Plan.mode) bits.push(v2Plan.mode)
    if (v2Plan.top_k) bits.push(`top_k:${v2Plan.top_k}`)
    if (v2Plan.hybrid?.enabled) bits.push(`hybrid:${v2Plan.hybrid.retrieval_bias ?? (v2Plan.hybrid.alpha != null ? `α=${v2Plan.hybrid.alpha}` : 'on')}`)
    return bits.join(' · ')
  }, [v2Plan])

  const timeFilterView = useMemo(() => {
    if (!v2PlanReceived) return <ThreeDotsLoader />
    const tf: any = (v2Plan as any)?.filters?.time
    if (!tf) return <div className="text-xs text-gray-500">시간 필터 없음</div>

    const fmt = (s?: string) => {
      if (!s) return ''
      const d = new Date(s)
      if (isNaN(d.getTime())) return s
      return d.toLocaleDateString('ko-KR')
    }

    if (tf.type === 'absolute') {
      return (
        <div className="flex items-center gap-2 text-xs text-gray-700">
          <span className="text-gray-600">기간</span>
          <span className="px-2 py-0.5 rounded-full bg-gray-100">{fmt(tf.from) || '시작'}</span>
          <span>~</span>
          <span className="px-2 py-0.5 rounded-full bg-gray-100">{fmt(tf.to) || '종료'}</span>
        </div>
      )
    }
    if (tf.type === 'relative') {
      // 상대 기간은 정의가 다양할 수 있어 JSON으로 요약 표시
      return (
        <div className="text-xs bg-gray-50 p-2 rounded text-gray-700">
          상대 기간
          <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(tf, null, 2)}</pre>
        </div>
      )
    }
    // 알 수 없는 포맷은 raw 출력
    return (
      <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">{JSON.stringify(tf, null, 2)}</pre>
    )
  }, [v2PlanReceived, v2Plan])

  return (
    <div className="mx-2 md:mx-4 mb-3">
      <motion.button
        type="button"
        onClick={onToggle}
        className="
          px-3 sm:px-4 py-1.5 sm:py-2
          text-sm font-medium rounded-lg
          bg-white border-2 border-gray-300
          text-gray-700 shadow-sm
          hover:bg-gray-50 hover:border-gray-400 hover:shadow-md
          flex items-center gap-2
          transition-all duration-200
          w-full sm:w-auto
        "
        aria-expanded={visible}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          animate={{ rotate: visible ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <ChevronDown size={16} />
        </motion.div>
        {visible ? '검색 과정 닫기' : '검색 과정 보기'}
      </motion.button>

      <AnimatePresence>
        {visible && (
          <motion.div
            className="mt-3 space-y-3 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ willChange: 'height, opacity' }}
          >
          {version === 'v1' ? (
            <Section title="Context">
              {v1ContextReceived ? (
                v1Context.length > 0 ? renderList(v1Context) : (
                  <div className="text-sm text-gray-500">표시할 컨텍스트가 없습니다.</div>
                )
              ) : (
                <ThreeDotsLoader />
              )}
            </Section>
          ) : (
            <>
              {v2Plan && (
                <Section title="Search Plan">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-700">
                      {v2PlanReceived ? (v2Summary || '계획 요약 없음') : <ThreeDotsLoader />}
                    </div>
                    <motion.button
                      type="button"
                      className="
                        text-xs px-2.5 py-1.5 rounded-md
                        bg-blue-50 hover:bg-blue-100
                        text-blue-700 font-medium
                        flex items-center gap-1
                        transition-colors duration-150
                      "
                      onClick={() => setPlanOpen((v) => !v)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.div
                        animate={{ rotate: planOpen ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <ChevronDown size={12} />
                      </motion.div>
                      {planOpen ? '세부 접기' : '세부 보기'}
                    </motion.button>
                  </div>
                  <div className="mt-2">
                    {timeFilterView}
                  </div>
                  <AnimatePresence>
                    {planOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {v2PlanReceived ? (
                          v2Plan ? (
                            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-48">
                              {JSON.stringify(v2Plan, null, 2)}
                            </pre>
                          ) : (
                            <div className="mt-2 text-sm text-gray-500">계획 없음</div>
                          )
                        ) : (
                          <div className="mt-2"><ThreeDotsLoader /></div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Section>
              )}
              {v2Rewrites && v2Rewrites.length > 0 && (
                <Section title="Rewrites">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-700">
                      재작성 {v2Rewrites.length}개
                    </div>
                    <motion.button
                      type="button"
                      className="
                        text-xs px-2.5 py-1.5 rounded-md
                        bg-blue-50 hover:bg-blue-100
                        text-blue-700 font-medium
                        flex items-center gap-1
                        transition-colors duration-150
                      "
                      onClick={() => setRewritesOpen(v => !v)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.div
                        animate={{ rotate: rewritesOpen ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <ChevronDown size={12} />
                      </motion.div>
                      {rewritesOpen ? '세부 접기' : '세부 보기'}
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {rewritesOpen && (
                      <motion.ul
                        className="mt-2 list-disc ml-5 space-y-1 text-sm overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {v2Rewrites.map((s, i) => <li key={i}>{s}</li>)}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </Section>
              )}
              {v2Keywords && v2Keywords.length > 0 && (
                <Section title="Keywords">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-700">
                      키워드 {v2Keywords.length}개
                    </div>
                    <motion.button
                      type="button"
                      className="
                        text-xs px-2.5 py-1.5 rounded-md
                        bg-blue-50 hover:bg-blue-100
                        text-blue-700 font-medium
                        flex items-center gap-1
                        transition-colors duration-150
                      "
                      onClick={() => setKeywordsOpen(v => !v)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.div
                        animate={{ rotate: keywordsOpen ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <ChevronDown size={12} />
                      </motion.div>
                      {keywordsOpen ? '세부 접기' : '세부 보기'}
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {keywordsOpen && (
                      <motion.ul
                        className="mt-2 list-disc ml-5 space-y-1 text-sm overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {v2Keywords.map((s, i) => <li key={i}>{s}</li>)}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </Section>
              )}
              {v2HybridResult && v2HybridResult.length > 0 && (
                <Section title="Hybrid Result">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-700">
                      후보 {v2HybridResult.length}건
                    </div>
                    <motion.button
                      type="button"
                      className="
                        text-xs px-2.5 py-1.5 rounded-md
                        bg-blue-50 hover:bg-blue-100
                        text-blue-700 font-medium
                        flex items-center gap-1
                        transition-colors duration-150
                      "
                      onClick={() => setHybridOpen(v => !v)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.div
                        animate={{ rotate: hybridOpen ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <ChevronDown size={12} />
                      </motion.div>
                      {hybridOpen ? '세부 접기' : '세부 보기'}
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {hybridOpen && (
                      <motion.div
                        className="mt-2 overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {renderList(v2HybridResult)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Section>
              )}
              {v2SearchResult && v2SearchResult.length > 0 && (
                <Section title="Search Result">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-700">
                      결과 {v2SearchResult.length}건
                    </div>
                    <motion.button
                      type="button"
                      className="
                        text-xs px-2.5 py-1.5 rounded-md
                        bg-blue-50 hover:bg-blue-100
                        text-blue-700 font-medium
                        flex items-center gap-1
                        transition-colors duration-150
                      "
                      onClick={() => setSearchOpen(v => !v)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.div
                        animate={{ rotate: searchOpen ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <ChevronDown size={12} />
                      </motion.div>
                      {searchOpen ? '세부 접기' : '세부 보기'}
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {searchOpen && (
                      <motion.div
                        className="mt-2 overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {renderList(v2SearchResult)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Section>
              )}
              {v2Context && v2Context.length > 0 && (
                <Section title="Context">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-700">
                      컨텍스트 {v2Context.length}건
                    </div>
                    <motion.button
                      type="button"
                      className="
                        text-xs px-2.5 py-1.5 rounded-md
                        bg-blue-50 hover:bg-blue-100
                        text-blue-700 font-medium
                        flex items-center gap-1
                        transition-colors duration-150
                      "
                      onClick={() => setContextOpen(v => !v)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.div
                        animate={{ rotate: contextOpen ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <ChevronDown size={12} />
                      </motion.div>
                      {contextOpen ? '세부 접기' : '세부 보기'}
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {contextOpen && (
                      <motion.div
                        className="mt-2 overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {renderList(v2Context)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Section>
              )}
            </>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
