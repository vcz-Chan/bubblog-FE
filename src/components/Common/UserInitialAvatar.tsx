'use client'

import Image from 'next/image'

interface UserInitialAvatarProps {
  name?: string | null
  imageUrl?: string | null
  size?: number // px
  className?: string
}

const getInitial = (name?: string | null) => {
  if (!name) return '?'
  const trimmed = name.trim()
  if (!trimmed) return '?'
  return trimmed[0]?.toUpperCase() ?? '?'
}

export default function UserInitialAvatar({
  name,
  imageUrl,
  size = 40,
  className = '',
}: UserInitialAvatarProps) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name ? `${name}의 프로필 이미지` : '프로필 이미지'}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
      />
    )
  }

  const fontSize = Math.max(12, Math.floor(size / 2))

  return (
    <div
      style={{ width: size, height: size, fontSize }}
      className={`rounded-full bg-gray-300 text-gray-700 font-semibold flex items-center justify-center ${className}`}
      aria-label={name ? `${name}의 이니셜` : '알 수 없는 사용자'}
    >
      {getInitial(name)}
    </div>
  )
}
