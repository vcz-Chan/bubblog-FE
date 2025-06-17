'use client'

import { useState } from 'react'
import { signup } from '@/services/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Common/Button'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
    nickname: '',
    profileImageUrl: ''
  })
  const [error, setError] = useState('')

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await signup(form)
      if (!res.success) throw new Error(res.message)
      router.push('/login')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
  <form
    onSubmit={onSubmit}
    className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md"
  >
    <h2 className="text-2xl font-semibold text-center mb-6">회원가입</h2>

    {error && (
      <p className="text-sm text-red-500 text-center mb-4">
        {error}
      </p>
    )}

    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">이메일</label>
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={onChange}
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">비밀번호</label>
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={onChange}
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">닉네임</label>
      <input
        name="nickname"
        value={form.nickname}
        onChange={onChange}
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>

    <div className="mb-6">
      <label className="block text-sm font-medium mb-1">프로필 이미지 URL</label>
      <input
        name="profileImageUrl"
        value={form.profileImageUrl}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>

    <Button type="submit">
      회원가입
    </Button>
  </form>
)
}