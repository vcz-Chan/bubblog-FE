'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  UserProfile
} from '@/services/userService'
import { PersonaManager } from '@/components/Persona/PersonaManager'

export default function SettingsPage() {
  const { userId } = useAuth()

  // --- 프로필 ---
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [nickname, setNickname] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [errorProfile, setErrorProfile] = useState<string | null>(null)

  // 프로필 로드
  useEffect(() => {
    if (!userId) return
    setLoadingProfile(true)
    getUserProfile(userId)
      .then(p => {
        setProfile(p)
        setNickname(p.nickname)
        setProfileImageUrl(p.profileImageUrl ?? '')
        setErrorProfile(null)
      })
      .catch(e => setErrorProfile(e.message))
      .finally(() => setLoadingProfile(false))
  }, [userId])

  // 프로필 저장
  const saveProfile = async () => {
    if (!profile) return
    try {
      const updated = await updateUserProfile({ nickname, profileImageUrl })
      setProfile(updated)
      setErrorProfile(null)
    } catch (e: any) {
      setErrorProfile(e.message)
    }
  }

  // 계정 삭제
  const withdraw = async () => {
    try {
      await deleteUserAccount()
      // 로그아웃 처리하거나 리디렉션
    } catch (e: any) {
      setErrorProfile(e.message)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-12">
      {/* 프로필 섹션 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">프로필 설정</h2>
        {loadingProfile ? (
          <p>로딩 중…</p>
        ) : errorProfile ? (
          <p className="text-red-600">{errorProfile}</p>
        ) : profile && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1">닉네임</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">프로필 이미지 URL</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={profileImageUrl}
                onChange={e => setProfileImageUrl(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={saveProfile}
              >
                저장
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={withdraw}
              >
                탈퇴
              </button>
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">페르소나 설정</h2>
        {userId && <PersonaManager userId={userId} />}
      </section>
    </div>
  )
}