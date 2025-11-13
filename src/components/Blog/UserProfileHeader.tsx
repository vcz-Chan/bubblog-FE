'use client'

import Image from 'next/image'
import { UserProfile } from '@/apis/userApi'

interface Props {
  profile: UserProfile
  isMyBlog: boolean
}

export function UserProfileHeader({ profile, isMyBlog }: Props) {
  return (
    <div className="flex items-center gap-4">
      {profile.profileImageUrl ? (
        <Image
                      src={profile.profileImageUrl || '/logo.jpeg'}
          alt={profile.nickname}
          width={50}
          height={50}
          className="rounded-full w-[50px] h-[50px] object-cover"
        />
      ) : (
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
          ?
        </div>
      )}
      <h1 className="text-2xl font-bold">
        {isMyBlog ? '내 블로그' : `${profile.nickname}님의 블로그`}
      </h1>
    </div>
  )
}