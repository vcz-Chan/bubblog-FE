'use client'

import { motion } from 'framer-motion'
import { UserIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export type SettingsTab = 'profile' | 'persona' | 'security'

interface SettingsTabsProps {
  activeTab: SettingsTab
  onTabChange: (tab: SettingsTab) => void
}

const tabs = [
  { id: 'profile' as const, label: '프로필', icon: UserIcon },
  { id: 'persona' as const, label: '페르소나', icon: SparklesIcon },
  { id: 'security' as const, label: '보안', icon: ShieldCheckIcon }
]

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="border-b border-gray-200 bg-white rounded-t-xl">
      <nav className="flex space-x-8 px-6" aria-label="설정 탭">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative py-4 px-1 text-sm font-medium transition-colors
                ${isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </div>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
