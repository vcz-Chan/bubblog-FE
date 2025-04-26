"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  // 로그인 여부 (실제 구현 시에는 리프레쉬 토큰 체크)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // 인기 블로그, 인기 챗봇 데이터 (나중에 API 연결)
  const popularPosts = [
    { id: 1, title: "포스트 제목 1", summary: "포스트 요약 1" },
    { id: 2, title: "포스트 제목 2", summary: "포스트 요약 2" },
    { id: 3, title: "포스트 제목 3", summary: "포스트 요약 3" },
  ];

  const popularChatbots = [
    { id: 1, name: "챗봇 A", description: "여행 추천 챗봇" },
    { id: 2, name: "챗봇 B", description: "영어 회화 챗봇" },
    { id: 3, name: "챗봇 C", description: "스터디 관리 챗봇" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Image
              src="/logo.jpeg"
              alt="서비스 로고"
              width={150}
              height={40}
              priority
            />
          </Link>

          {/* 로그인 상태에 따른 메뉴 분기 */}
          <nav className="flex gap-6 text-2xl">
            {isLoggedIn ? (
              <>
                <Link href="/mypage" className="text-black hover:text-blue-500 transition-colors">
                  마이페이지
                </Link>
                <Link href="/write" className="text-black hover:text-blue-500 transition-colors">
                  글쓰기
                </Link>
                <Link href="/chatbot" className="text-black hover:text-blue-500 transition-colors">
                  챗봇 만들기
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-black hover:text-blue-500 transition-colors">
                  로그인 / 회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero 섹션 */}
      <section className="max-w-6xl mx-auto py-5 bg-gradient-to-r from-purple-300 via-purple-400 to-purple-300 text-white">
        <div className="px-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            기록이 대화가 되는 블로그, Bubblog입니다.
          </h1>
          <p className="text-lg text-gray-600">
            나의 경험을 기록하고, 나만의 챗봇을 만들어보세요!
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        
        {/* 인기 블로그 */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">🔥 인기 블로그</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-100 rounded mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
                <p className="text-gray-700 mb-4">{post.summary}</p>
                <Link href={`/post/${post.id}`} className="text-blue-500 hover:underline">
                  더 보기 →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 인기 챗봇 */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">🤖 인기 챗봇</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularChatbots.map((bot) => (
              <div
                key={bot.id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-100 rounded mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{bot.name}</h3>
                <p className="text-gray-700 mb-4">{bot.description}</p>
                <Link href={`/chatbot/${bot.id}`} className="text-blue-500 hover:underline">
                  챗봇 보기 →
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}