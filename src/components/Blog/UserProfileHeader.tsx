'use client'

import Image from 'next/image'
import Link from 'next/link'
import { UserProfile } from '@/services/userService'

interface Props {
  profile: UserProfile
  isMyBlog: boolean
}

export function UserProfileHeader({ profile, isMyBlog }: Props) {
  return (
    <div className="flex items-center gap-4">
      {profile.profileImageUrl ? (
        <Image
          src={profile.profileImageUrl}
          alt={profile.nickname}
          width={64}
          height={64}
          className="rounded-full"
        />
      ) : (
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
          ?
        </div>
      )}
      <h1 className="text-2xl font-bold">
        {isMyBlog ? '내 블로그' : `${profile.nickname}님의 블로그`}
      </h1>
      <Link
        href={`/chatbot/${profile.userId}`}
        className="text-sm px-2 py-1 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition"
      >
        챗봇 방문
      </Link>
    </div>
  )
}