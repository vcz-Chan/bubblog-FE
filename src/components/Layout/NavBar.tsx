'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import SearchBar from './SearchBar'
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import {
  PencilIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline'

export default function NavBar() {
  const { logout, userId, isAuthenticated } = useAuth()
  const router = useRouter();
  const [search, setSearch] = useState('');

  const handleLogout = async () => {
    try {
      await logout()
    } catch (e) {
      console.error('logout error', e)
    }
  }

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/search?query=${encodeURIComponent(search.trim())}`);
    setSearch('');  // 입력 초기화
  };

  return (
    <header className="bg-[rgb(244,246,248)] shadow-md sticky top-0 z-50">
      <div className="md:px-16 p-5 flex justify-between items-center">
        {/* 로고 */}
        <Link href="/" className="hidden md:flex items-center mr-16">
          {/* <Image
            src="/logo.jpeg"
            alt="서비스 로고"
            width={150}
            height={70}
            className="w-[150px] h-[70px] object-contain"
            priority
          /> */}
          <div className="text-center text-2xl font-bold text-gray-800">Bubblog</div>
        </Link>
        
        {/* 검색창 */}
        <SearchBar />

        {/* 메뉴 */}
        <nav className="flex items-center gap-2 md:gap-4 text-gray-700">

          {isAuthenticated ? (
            <>
              <Link
                href={`/blog/${userId}`}
                className="flex items-center gap-1 hover:text-blue-500 transition-colors"
              >
                <UserIcon className="h-6 w-6" />
                <span className="hidden xl:inline">내 블로그</span>
              </Link>

              <Link
                href="/write"
                className="flex items-center gap-1 hover:text-blue-500 transition-colors"
              >
                <PencilIcon className="h-6 w-6" />
                <span className="hidden xl:inline">글쓰기</span>
              </Link>

              <Link
                href={`/chatbot/${userId}`}
                className="flex items-center gap-1 hover:text-blue-500 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
                <span className="hidden xl:inline">내 챗봇</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 hover:text-blue-500 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
                <span className="hidden xl:inline">로그아웃</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1 hover:text-blue-500 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                <span className="hidden xl:inline">로그인</span>
              </Link>

              <Link
                href="/signup"
                className="flex items-center gap-1 hover:text-blue-500 transition-colors"
              >
                <UserIcon className="h-6 w-6" />
                <span className="hidden xl:inline">회원가입</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}