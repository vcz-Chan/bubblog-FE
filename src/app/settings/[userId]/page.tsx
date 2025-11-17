// components/SettingsPage.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { ProfilePreviewCard } from '@/components/Settings/ProfilePreviewCard'
import { SettingsTabs, SettingsTab } from '@/components/Settings/SettingsTabs'
import { DeleteAccountModal } from '@/components/Settings/DeleteAccountModal'
import SettingsSkeleton from '@/components/Skeletons/SettingsSkeleton'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'

export default function SettingsPage() {
  const userId = useAuthStore(selectUserId);
  const logout = useAuthStore(selectLogout);
  const router = useRouter()
  const toast = useToast()

  // 탭 상태
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

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

  // 로딩 상태
  if (loadingProfile) {
    return <SettingsSkeleton />
  }

  // 탭 콘텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {errorProfile ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{errorProfile}</p>
              </div>
            ) : profile ? (
              <>
                {/* 닉네임 입력 */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    닉네임
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    maxLength={20}
                    className="
                      w-full rounded-lg border border-gray-300
                      px-4 py-3 text-gray-800
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-all
                    "
                    placeholder="닉네임을 입력하세요"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {nickname.length}/20자
                  </p>
                </div>

                {/* 프로필 이미지 업로더 */}
                <div>
                  <label className="block mb-3 text-sm font-semibold text-gray-700">
                    프로필 이미지
                  </label>
                  <ImageUploader
                    folder="profile-images"
                    onUploaded={url => setProfileImageUrl(url)}
                  />
                </div>

                {/* 저장 / 탈퇴 버튼 */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
                  <Button
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => setConfirmOpen(true)}
                  >
                    계정 탈퇴
                  </Button>
                  <Button
                    onClick={saveProfile}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    변경사항 저장
                  </Button>
                </div>
              </>
            ) : null}
          </motion.div>
        )

      case 'persona':
        return (
          <motion.div
            key="persona"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {userId && <PersonaManager userId={userId} />}
          </motion.div>
        )

      case 'security':
        return (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16"
          >
            <p className="text-gray-500">보안 설정은 준비 중입니다.</p>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 사이드바 - 프로필 미리보기 */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-8">
              {profile && (
                <ProfilePreviewCard
                  profile={profile}
                  profileImageUrl={profileImageUrl}
                />
              )}
            </div>
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* 탭 네비게이션 */}
              <SettingsTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {/* 탭 콘텐츠 */}
              <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {renderTabContent()}
                </AnimatePresence>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 탈퇴 확인 모달 */}
      <DeleteAccountModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleWithdraw}
      />
    </motion.div>
  )
}