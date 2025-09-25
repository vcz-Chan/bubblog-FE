'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <section className="w-full h-full flex justify-center items-center bg-gray-50">
      <div className="flex flex-col md:flex-row items-center max-w-4xl mx-auto p-8">
        <div className="md:w-1/2 p-4 flex justify-center">
          <Image
            src="/readingBookRobot.png"
            alt="Page not found robot"
            width={300}
            height={300}
            objectFit="contain"
          />
        </div>
        <div className="md:w-1/2 p-4 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">페이지를 찾을 수 없어요</h1>
          <p className="mt-4 text-lg text-gray-600">요청하신 주소가 변경되었거나 존재하지 않습니다.</p>
          <div className="mt-8">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:underline"
            >
              이전 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}