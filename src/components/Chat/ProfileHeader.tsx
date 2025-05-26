'use client'

import { UserProfile } from '@/services/userService'

interface Props {
  profile: UserProfile
}

export function ProfileHeader({ profile }: Props) {
  return (
    <div className="flex items-center mb-4">
      <h1 className="text-2xl font-bold">
        {profile.nickname}의 챗봇
      </h1>
    </div>
  )
}