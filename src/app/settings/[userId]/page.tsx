// components/SettingsPage.tsx
'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import { useAuthStore, selectUserId, selectLogout } from '@/store/AuthStore'
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  UserProfile
} from '@/apis/userApi'
import { PersonaManager } from '@/components/Persona/PersonaManager'
import ImageUploader from '@/components/Common/ImageUploader'
import { Button } from '@/components/Common/Button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'

export default function SettingsPage() {
  const userId = useAuthStore(selectUserId);
  const logout = useAuthStore(selectLogout);
  const router = useRouter()
  const toast = useToast()

  // 프로필 상태
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [nickname, setNickname] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [errorProfile, setErrorProfile] = useState<string | null>(null)

  // 탈퇴 확인 모달 상태
  const [confirmOpen, setConfirmOpen] = useState(false)

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
      .catch(e => {
        setErrorProfile(e.message)
        toast.error('프로필을 불러오는데 실패했습니다')
      })
      .finally(() => setLoadingProfile(false))
  }, [userId, toast])

  // 프로필 저장
  const saveProfile = async () => {
    if (!profile) return
    try {
      const updated = await updateUserProfile({ nickname, profileImageUrl })
      setProfile(updated)
      setErrorProfile(null)
      toast.success('프로필이 저장되었습니다')
    } catch (e: any) {
      setErrorProfile(e.message)
      toast.error(e.message || '프로필 저장에 실패했습니다')
    }
  }

  // 계정 삭제
  const handleWithdraw = async () => {
    try {
      await deleteUserAccount()
      toast.success('계정이 삭제되었습니다')
      await logout()
      router.replace('/')
    } catch (e: any) {
      setErrorProfile(e.message)
      toast.error(e.message || '계정 삭제에 실패했습니다')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* 프로필 설정 섹션 */}
      <section className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">
          프로필 설정
        </h2>

        {loadingProfile ? (
          <p className="text-center text-gray-500">로딩 중…</p>
        ) : errorProfile ? (
          <p className="text-red-600">{errorProfile}</p>
        ) : profile ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 닉네임 입력 */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  닉네임
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="
                    w-full rounded-md border border-gray-200
                    px-4 py-2 text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-blue-300
                  "
                />
              </div>

              {/* 프로필 이미지 업로더 */}
              <div className="flex flex-col items-start">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  프로필 이미지
                </label>
                {profileImageUrl && (
                  <Image
                    src={profileImageUrl}
                    alt="프로필 미리보기"
                    width={100}
                    height={100}
                    className="rounded-full object-cover border mb-2"
                  />
                )}
                <ImageUploader
                  folder="profile-images"
                  onUploaded={url => setProfileImageUrl(url)}
                />
              </div>
            </div>

            {/* 저장 / 탈퇴 버튼 */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={() => setConfirmOpen(true)}
              >
                탈퇴
              </Button>
              <Button onClick={saveProfile}>저장</Button>
            </div>
          </div>
        ) : null}
      </section>

      {/* 페르소나 설정 섹션 */}
      <section className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">
          페르소나 설정
        </h2>
        {userId && <PersonaManager userId={userId} />}
      </section>

      {/* 탈퇴 확인 모달 */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-80 space-y-4">
            <h3 className="text-lg font-semibold">정말 계정을 삭제하시겠습니까?</h3>
            <p className="text-sm text-gray-600">
              삭제된 계정은 복구할 수 없습니다.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="text-gray-700 hover:bg-gray-100"
                onClick={() => setConfirmOpen(false)}
              >
                취소
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={handleWithdraw}
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}