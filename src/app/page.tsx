"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { popularPosts } from "@/mocks/posts";
import { popularChatbots } from "@/mocks/chatbots";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

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

          {/* 로그인 상태에 따른 메뉴 */}
          <nav className="flex gap-6 text-2xl">
            {isLoggedIn ? (
              <>
                <Link href="/blog/1" className="text-black hover:text-blue-500 transition-colors">
                  내 블로그
                </Link>
                <Link href="/write" className="text-black hover:text-blue-500 transition-colors">
                  글쓰기
                </Link>
                <Link href="/chatbot" className="text-black hover:text-blue-500 transition-colors">
                  내 챗봇
                </Link>
              </>
            ) : (
              <Link href="/login" className="text-black hover:text-blue-500 transition-colors">
                로그인 / 회원가입
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
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
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow block"
              >
                <div className="h-40 bg-gray-100 rounded mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
                <p className="text-gray-700">{post.summary}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 인기 챗봇 */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">🤖 인기 챗봇</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularChatbots.map((bot) => (
              <Link
                key={bot.id}
                href={`/chatbot/${bot.id}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow block"
              >
                <div className="h-40 bg-gray-100 rounded mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{bot.name}</h3>
                <p className="text-gray-700">{bot.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}