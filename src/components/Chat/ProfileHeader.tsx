'use client'

import { motion } from 'framer-motion'
import { UserProfile } from '@/apis/userApi'

interface Props {
  profile: UserProfile
}

export function ProfileHeader({ profile }: Props) {
  return (
    <motion.div
      className=""
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.h1
        className="text-3xl font-bold "
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
      >
        {profile.nickname}의 챗봇
      </motion.h1>
    </motion.div>
  )
}