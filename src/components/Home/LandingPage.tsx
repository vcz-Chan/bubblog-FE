'use client'

import React from 'react'
import Link from 'next/link'
import BubbleBackground from '@/components/Home/BubbleBackground'
import AnimatedContent from '@/components/Home/AnimatedContent'

export function LandingPage() {
  return (
    <div className="relative overflow-hidden text-gray-800 flex items-center justify-center h-screen">
      <BubbleBackground />

      <main className="relative z-10 flex flex-col items-center text-center px-4 space-y-20">
        {/* Hero 섹션 */}
        <section className="max-w-2xl space-y-4">
          <h1 className="text-5xl font-bold">
            글이 대화가 되는 블로그
          </h1>
          <p className="text-base text-gray-600">
            Bubblog은 사용자의 블로그 콘텐츠를 기반으로 AI 챗봇을 생성해<br/>
            대화를 통해 콘텐츠를 탐색할 수 있는 플랫폼입니다.
          </p>
          <Link href="/signup">
            <span className="inline-block px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition">
              지금 시작하기
            </span>
          </Link>
        </section>

        {/* 사용 방법 3단계 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 px-4">
          <AnimatedContent>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">1. 블로그를 작성하세요</h2>
              <p>자신만의 글을 작성하면 AI 챗봇이 대답합니다.</p>
            </div>
          </AnimatedContent>

          <AnimatedContent delay={0.5}>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">2. 다른 사람의 챗봇과 대화하세요</h2>
              <p>다른 사용자의 블로그 챗봇을 선택해 대화를 나눕니다.</p>
            </div>
          </AnimatedContent>

          <AnimatedContent delay={1}>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">3. 다양한 카테고리를 만들어 분류하세요</h2>
              <p>카테고리별로 글과 챗봇을 체계적으로 관리합니다.</p>
            </div>
          </AnimatedContent>
        </section>
      </main>
    </div>
  )
}