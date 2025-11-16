'use client'

import { motion } from 'framer-motion'

interface Props {
  value: 'v1' | 'v2'
  onChange: (v: 'v1' | 'v2') => void
  disabled?: boolean
}

export function VersionToggle({ value, onChange, disabled }: Props) {
  return (
    <div className="inline-flex items-center gap-0.5 p-1 bg-gray-100 rounded-lg relative" role="group" aria-label="Ask version">
      {/* Sliding background pill */}
      <motion.div
        className="absolute top-1 bottom-1 left-1 bg-purple-600 rounded-md"
        style={{ width: 'calc(50% - 6px)' }}
        initial={false}
        animate={{
          x: value === 'v1' ? 0 : 'calc(100% + 4px)',
        }}
        transition={{
          duration: 0.25,
          ease: [0.4, 0, 0.2, 1],
        }}
      />

      <motion.button
        type="button"
        className={`
          relative z-10 px-4 py-1.5 text-sm font-medium rounded-md
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
          ${value === 'v1' ? 'text-white' : 'text-gray-700 hover:text-gray-900'}
        `}
        aria-pressed={value === 'v1'}
        onClick={() => !disabled && onChange('v1')}
        disabled={disabled}
        whileTap={!disabled ? { scale: 0.97 } : {}}
      >
        v1
      </motion.button>
      <motion.button
        type="button"
        className={`
          relative z-10 px-4 py-1.5 text-sm font-medium rounded-md
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
          ${value === 'v2' ? 'text-white' : 'text-gray-700 hover:text-gray-900'}
        `}
        aria-pressed={value === 'v2'}
        onClick={() => !disabled && onChange('v2')}
        disabled={disabled}
        whileTap={!disabled ? { scale: 0.97 } : {}}
      >
        v2
      </motion.button>
    </div>
  )
}

