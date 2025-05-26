// components/NavBar.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

export default function NavBar() {
  const { logout, userId ,isAuthenticated } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (e) {
      console.error('logout error', e)
    }
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <Image
            src="/logo.jpeg"
            alt="서비스 로고"
            width={150}
            height={70}
            className="w-[150px] h-[70px]"
            priority
          />
        </Link>

        <nav className="flex gap-6 text-2xl">
          {isAuthenticated ? (
            <>
              <Link
                href={`/blog/${userId}`}
                className="text-black hover:text-blue-500 transition-colors"
              >
                내 블로그
              </Link>
              <Link
                href="/write"
                className="text-black hover:text-blue-500 transition-colors"
              >
                글쓰기
              </Link>
              <Link
                href={`/chatbot/${userId}`}
                className="text-black hover:text-blue-500 transition-colors"
              >
                내 챗봇
              </Link>
              <button
                onClick={handleLogout}
                className="text-black hover:text-blue-500 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-black hover:text-blue-500 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="text-black hover:text-blue-500 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}