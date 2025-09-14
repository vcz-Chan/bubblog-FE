'use client'

import { UserProfile } from '@/apis/userApi'

interface Props {
  profile: UserProfile
}

export function ProfileHeader({ profile }: Props) {
  return (
    <div className="">
      <h1 className="text-3xl font-bold">
        {profile.nickname}의 챗봇
      </h1>
    </div>
  )
}