'use client'

import { UserProfile } from '@/services/userService'

interface Props {
  profile: UserProfile
}

export function ProfileHeader({ profile }: Props) {
  return (
    <div className="sticky top-0 z-10 w-full max-w-6xl pt-6 pb-4 bg-[rgb(244,246,248)]">
      <h1 className="text-3xl font-bold">
        {profile.nickname}의 챗봇
      </h1>
    </div>
  )
}