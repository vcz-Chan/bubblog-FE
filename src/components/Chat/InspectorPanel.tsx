'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
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
    <div className="border border-gray-200 rounded-md p-3 bg-white">
      <div className="text-xs font-semibold text-gray-600 mb-2">{title}</div>
      {children}
    </div>
  )

  const renderList = (items: ContextItem[]) => (
    <ul className="list-disc ml-5 space-y-1">
      {items.map((it) => (
        <li key={it.post_id}>
          {onItemClick ? (
            <button
              type="button"
              className="text-left text-sm font-medium hover:text-green-600"
              onClick={() => onItemClick(it)}
            >
              {it.post_title}
            </button>
          ) : (
            <Link href={`/post/${it.post_id}`} className="text-sm font-medium hover:text-green-600">
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
      <button
        type="button"
        onClick={onToggle}
        className="px-3 py-1.5 text-sm rounded-md bg-gray-700 text-white hover:bg-gray-800"
        aria-expanded={visible}
      >
        {visible ? '검색 과정 닫기' : '검색 과정 보기'}
      </button>

      {visible && (
        <div className="mt-3 space-y-3">
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
              <Section title="Search Plan">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-700">
                    {v2PlanReceived ? (v2Summary || '계획 요약 없음') : <ThreeDotsLoader />}
                  </div>
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() => setPlanOpen((v) => !v)}
                  >
                    {planOpen ? '세부 접기' : '세부 보기'}
                  </button>
                </div>
                <div className="mt-2">
                  {timeFilterView}
                </div>
                {planOpen && (
                  v2PlanReceived ? (
                    v2Plan ? (
                      <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-48">
                        {JSON.stringify(v2Plan, null, 2)}
                      </pre>
                    ) : (
                      <div className="mt-2 text-sm text-gray-500">계획 없음</div>
                    )
                  ) : (
                    <div className="mt-2"><ThreeDotsLoader /></div>
                  )
                )}
              </Section>
              <Section title="Rewrites">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-700">
                    {v2RewritesReceived ? (
                      v2Rewrites && v2Rewrites.length > 0 ? `재작성 ${v2Rewrites.length}개` : '재작성 없음'
                    ) : (
                      <ThreeDotsLoader />
                    )}
                  </div>
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() => setRewritesOpen(v => !v)}
                    disabled={!v2RewritesReceived || (v2Rewrites?.length ?? 0) === 0}
                  >
                    {rewritesOpen ? '세부 접기' : '세부 보기'}
                  </button>
                </div>
                {rewritesOpen && v2RewritesReceived && v2Rewrites && v2Rewrites.length > 0 && (
                  <ul className="mt-2 list-disc ml-5 space-y-1 text-sm">
                    {v2Rewrites.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                )}
              </Section>
              <Section title="Keywords">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-700">
                    {v2KeywordsReceived ? (
                      v2Keywords && v2Keywords.length > 0 ? `키워드 ${v2Keywords.length}개` : '키워드 없음'
                    ) : (
                      <ThreeDotsLoader />
                    )}
                  </div>
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() => setKeywordsOpen(v => !v)}
                    disabled={!v2KeywordsReceived || (v2Keywords?.length ?? 0) === 0}
                  >
                    {keywordsOpen ? '세부 접기' : '세부 보기'}
                  </button>
                </div>
                {keywordsOpen && v2KeywordsReceived && v2Keywords && v2Keywords.length > 0 && (
                  <ul className="mt-2 list-disc ml-5 space-y-1 text-sm">
                    {v2Keywords.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                )}
              </Section>
              <Section title="Hybrid Result">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-700">
                    {v2HybridResultReceived ? (
                      v2HybridResult && v2HybridResult.length > 0 ? `후보 ${v2HybridResult.length}건` : '하이브리드 결과 없음'
                    ) : (
                      <ThreeDotsLoader />
                    )}
                  </div>
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() => setHybridOpen(v => !v)}
                    disabled={!v2HybridResultReceived || (v2HybridResult?.length ?? 0) === 0}
                  >
                    {hybridOpen ? '세부 접기' : '세부 보기'}
                  </button>
                </div>
                {hybridOpen && v2HybridResultReceived && v2HybridResult && v2HybridResult.length > 0 && (
                  <div className="mt-2">{renderList(v2HybridResult)}</div>
                )}
              </Section>
              <Section title="Search Result">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-700">
                    {v2SearchResultReceived ? (
                      v2SearchResult && v2SearchResult.length > 0 ? `결과 ${v2SearchResult.length}건` : '검색 결과 없음'
                    ) : (
                      <ThreeDotsLoader />
                    )}
                  </div>
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() => setSearchOpen(v => !v)}
                    disabled={!v2SearchResultReceived || (v2SearchResult?.length ?? 0) === 0}
                  >
                    {searchOpen ? '세부 접기' : '세부 보기'}
                  </button>
                </div>
                {searchOpen && v2SearchResultReceived && v2SearchResult && v2SearchResult.length > 0 && (
                  <div className="mt-2">{renderList(v2SearchResult)}</div>
                )}
              </Section>
              <Section title="Context">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-700">
                    {v2ContextReceived ? (
                      v2Context && v2Context.length > 0 ? `컨텍스트 ${v2Context.length}건` : '컨텍스트 없음'
                    ) : (
                      <ThreeDotsLoader />
                    )}
                  </div>
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() => setContextOpen(v => !v)}
                    disabled={!v2ContextReceived || (v2Context?.length ?? 0) === 0}
                  >
                    {contextOpen ? '세부 접기' : '세부 보기'}
                  </button>
                </div>
                {contextOpen && v2ContextReceived && v2Context && v2Context.length > 0 && (
                  <div className="mt-2">{renderList(v2Context)}</div>
                )}
              </Section>
            </>
          )}
        </div>
      )}
    </div>
  )
}
