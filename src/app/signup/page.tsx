'use client'

import { useState } from 'react'
import { signup } from '@/apis/authApi'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Common/Button'
import Link from 'next/link'
import Image from 'next/image'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
    nickname: '',
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
    <div className="h-screen w-full bg-gradient-to-br from-purple-100 to-indigo-200 flex justify-center items-center p-4">
      <div className="w-full max-w-4xl mx-auto flex rounded-2xl shadow-xl overflow-hidden bg-white">
        {/* Left side with welcome image */}
        <div className="w-1/2 hidden md:flex justify-center items-center p-12">
          <Image
            src="/welcome.png"
            alt="Welcome"
            width={400}
            height={400}
            objectFit="contain"
          />
        </div>

        {/* Right side with form */}
        <div className="w-full md:w-1/2 p-8 sm:p-10">
          <form onSubmit={onSubmit}>
            <div className="flex justify-center mb-6">
              <Image
                src="/signupIcon.png"
                alt="Signup Icon"
                width={80}
                height={80}
                className="rounded-full"
              />
            </div>
            <h2 className="text-3xl font-bold text-purple-700 text-center mb-6">
              회원가입
            </h2>

            {error && (
              <p className="text-sm text-red-500 text-center mb-4">{error}</p>
            )}

            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-base font-bold text-gray-600 mb-2"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200"
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="password"
                className="block text-base font-bold text-gray-600 mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200"
              />
            </div>

            <div className="mb-8">
              <label
                htmlFor="nickname"
                className="block text-base font-bold text-gray-600 mb-2"
              >
                닉네임
              </label>
              <input
                id="nickname"
                name="nickname"
                value={form.nickname}
                onChange={onChange}
                required
                placeholder="닉네임을 입력하세요"
                className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200"
              />
            </div>

            <div className="mb-4">
              <Button
                type="submit"
                className="w-full py-3 rounded-lg bg-purple-500 text-white font-bold hover:bg-purple-600 active:bg-purple-700 transition duration-300"
              >
                회원가입 완료
              </Button>
            </div>
            <div className="text-center mt-6">
              <Link
                href="/login"
                className="text-sm text-purple-600 hover:underline"
              >
                로그인
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
