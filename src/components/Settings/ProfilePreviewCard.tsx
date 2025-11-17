'use client'

import Image from 'next/image'
import { UserIcon } from '@heroicons/react/24/outline'
import { UserProfile } from '@/apis/userApi'

interface ProfilePreviewCardProps {
  profile: UserProfile
  profileImageUrl: string
}

export function ProfilePreviewCard({
  profile,
  profileImageUrl
}: ProfilePreviewCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Gradient Header */}
      <div className="h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      {/* Profile Content */}
      <div className="px-6 pb-6 -mt-12">
        {/* Avatar */}
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={profile.nickname}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                <UserIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="mt-4 space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">
            {profile.nickname}
          </h3>
          <p className="text-sm text-gray-500">
            @{profile.userId}
          </p>
        </div>

        {/* Stats (optional - can be extended) */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-xs text-gray-500 mt-1">게시글</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-xs text-gray-500 mt-1">팔로워</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-xs text-gray-500 mt-1">팔로잉</div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">가입일</span>
            <span className="text-gray-900 font-medium">
              {new Date(profile.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
