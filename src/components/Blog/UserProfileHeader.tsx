'use client'

import { UserProfile } from '@/apis/userApi'
import UserInitialAvatar from '@/components/Common/UserInitialAvatar'

interface Props {
  profile: UserProfile
  isMyBlog: boolean
}

export function UserProfileHeader({ profile, isMyBlog }: Props) {
  return (
    <div className="flex items-center gap-4">
      <UserInitialAvatar
        name={profile.nickname}
        imageUrl={profile.profileImageUrl}
        size={64}
        className="w-16 h-16"
      />
      <h1 className="text-2xl font-bold">
        {isMyBlog ? '내 블로그' : `${profile.nickname}님의 블로그`}
      </h1>
    </div>
  )
}
