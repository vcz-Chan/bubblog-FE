'use client'

import { useState } from 'react'
import { signup } from '@/services/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Common/Button'
import ImageUploader from '@/components/Common/ImageUploader'

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
      className="w-full max-w-md mt-8 bg-white rounded-2xl shadow-xl p-8 sm:p-10"
    >
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
        회원가입
      </h2>

      {error && (
        <p className="text-sm text-red-500 text-center mb-4">
          {error}
        </p>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          required
          placeholder="••••••••"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
          <input
            name="nickname"
            value={form.nickname}
            onChange={onChange}
            required
            placeholder="닉네임을 입력하세요"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            프로필 이미지
          </label>
          <ImageUploader
            folder="profile-images"
            onUploaded={url => setForm(prev => ({ ...prev, profileImageUrl: url }))}
          />
          {form.profileImageUrl && (
            <img
              src={form.profileImageUrl}
              alt="프로필 이미지 미리보기"
              className="mt-2 w-20 h-20 rounded-full object-cover border"
            />
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:bg-blue-800 transition"
      >
        회원가입
      </Button>
    </form>
  )
}