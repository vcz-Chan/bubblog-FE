// app/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Common/Button'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // 이미 로그인 상태면 메인으로
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
  <form
    onSubmit={onSubmit}
    className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md"
  >
    <h2 className="text-2xl font-semibold text-center mb-6">로그인</h2>

    {error && (
      <p className="text-sm text-red-500 text-center mb-4">
        {error}
      </p>
    )}

    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">이메일</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>

    <div className="mb-6">
      <label className="block text-sm font-medium mb-1">비밀번호</label>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>

    <Button type="submit">
      로그인
    </Button>
  </form>
)
}