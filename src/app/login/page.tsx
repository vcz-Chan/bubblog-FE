'use client'

import { useState, useEffect } from 'react'
import { useAuthStore, selectLogin, selectIsLogin } from '@/store/AuthStore'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Common/Button'

import BubbleBackground from '@/components/Home/BubbleBackground'

// 아이콘 SVG 컴포넌트
const MailIcon = () => (
  <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);
const LockIcon = () => (
  <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

// Bubblog 로고 아이콘 (색상을 모노톤 그라데이션으로 변경)
const BubblogLogoIcon = () => (
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.33331 16C5.33331 15.6464 5.40254 15.2963 5.53674 14.965C6.46008 12.6521 8.52084 10.9388 11.0208 10.7139C11.3831 10.678 11.7228 10.4571 11.901 10.1341C12.9156 8.35623 14.7958 7.33331 16.9469 7.33331C19.6243 7.33331 21.841 8.85042 22.7687 11.0375C22.9138 11.3838 23.2503 11.6167 23.6333 11.6167H23.6666C25.9316 11.6167 27.7666 13.4517 27.7666 15.7167C27.7666 17.5833 26.5416 19.1583 24.8916 19.6416C24.5166 19.7583 24.2333 20.1083 24.2333 20.5083V20.5083C24.2333 22.4416 22.675 24 20.7416 24H11.3333C7.98331 24 5.33331 21.35 5.33331 18V16Z" fill="url(#grayGradient)" />
        <defs>
            <linearGradient id="grayGradient" x1="16.55" y1="7.33331" x2="16.55" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4B5563" /> {/* Gray 600 */}
                <stop offset="1" stopColor="#1F2937" /> {/* Gray 800 */}
            </linearGradient>
        </defs>
    </svg>
);

export default function LoginPage() {
  const login = useAuthStore(selectLogin)
  const isAuthenticated = useAuthStore(selectIsLogin)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login({ email, password })
      router.push('/')
    } catch (err: any) {
      setError('이메일 또는 비밀번호를 확인해주세요.')
    }
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
      <BubbleBackground />
      <div className="relative z-10 w-full max-w-lg">
        
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BubblogLogoIcon />
              <h1 className="text-3xl font-bold text-gray-800">Welcome to Bubblog</h1>
            </div>
            <p className="text-lg text-gray-500 mt-2">
              로그인하고 대화를 시작해 보세요
            </p>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-6">로그인</h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <p className="text-base text-red-600 bg-red-100 p-3 rounded-lg text-center">
                {error}
              </p>
            )}

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MailIcon />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="이메일 주소"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition text-lg"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <LockIcon />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="비밀번호"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition text-lg"
                />
              </div>
            </div>

            {/* 버튼 색상을 모노톤 그라데이션으로 변경 */}
            <Button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-xl"
            >
              로그인
            </Button>
          </form>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-base text-gray-200">
            아직 계정이 없으신가요?{' '}
            <a href="/signup" className="font-semibold text-white hover:text-gray-200 hover:underline transition-colors text-base">
              회원가입
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}