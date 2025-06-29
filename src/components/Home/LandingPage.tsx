'use client'

import React from 'react'
import Link from 'next/link'
import BubbleBackground from '@/components/Home/BubbleBackground'
import AnimatedContent from '@/components/Home/AnimatedContent'

export function LandingPage() {
  return (
    <div className="relative overflow-auto text-gray-800 py-8 md:py-0 md:flex md:items-center md:justify-center md:h-screen">
      <BubbleBackground />

      <main className="relative z-10 flex flex-col items-center text-center px-4 space-y-12">
        {/* Hero */}
        <section className="max-w-2xl space-y-4">
          <h1 className="text-5xl font-bold">글이 대화가 되는 블로그</h1>
          <p className="text-base text-gray-600">
            Bubblog에서 내 글이 AI 챗봇이 되어 대화를 나눕니다.
          </p>
          <Link href="/signup">
            <span className="inline-block px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition">
              지금 시작하기
            </span>
          </Link>
        </section>

        {/* 사용 방법 4단계 (2열) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 max-w-5xl items-stretch">
          <AnimatedContent>
            <div className="flex flex-col h-full p-6 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold">1. 블로그를 작성하세요</h2>
              <p className="text-gray-700 mt-auto">
                글이 많을수록 챗봇의 답변이 더 풍부해집니다.
              </p>
            </div>
          </AnimatedContent>

          <AnimatedContent delay={0.4}>
            <div className="flex flex-col h-full p-6 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold">2. 말투를 만들어 선택하세요</h2>
              <p className="text-gray-700 mt-auto">
                챗봇의 대답 톤을 직접 설정해 다양한 분위기로 대화해 보세요.
              </p>
            </div>
          </AnimatedContent>

          <AnimatedContent delay={0.8}>
            <div className="flex flex-col h-full p-6 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold">3. 챗봇과 대화하세요</h2>
              <p className="text-gray-700 mt-auto">
                다양한 사용자의 챗봇과 대화하며 새로운 관점을 경험합니다.
              </p>
            </div>
          </AnimatedContent>

          <AnimatedContent delay={1.2}>
            <div className="flex flex-col h-full p-6 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold">4. 카테고리로 분류하세요</h2>
              <p className="text-gray-700 mt-auto">
                카테고리별로 글과 챗봇을 체계적으로 관리합니다.
              </p>
            </div>
          </AnimatedContent>
        </section>
      </main>
    </div>
  )
}