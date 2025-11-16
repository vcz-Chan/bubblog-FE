'use client'

import { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface Props {
  input: string
  onChange: (v: string) => void
  onSubmit: (e: FormEvent) => void
  disabled: boolean
  children?: React.ReactNode
}

export function ChatInput({
  input,
  onChange,
  onSubmit,
  disabled,
  children
}: Props) {
  return (
    <div className="sticky flex flex-col justify-center w-full bottom-0 px-4 z-10">
      <div className='pb-4 bg-[rgb(244,246,248)] rounded-t-3xl'>
        <motion.form
          onSubmit={onSubmit}
          className="
            relative flex flex-col w-full
            border border-gray-200 bg-white
            rounded-3xl shadow px-4 py-2
          "
          whileFocus={{ boxShadow: '0 0 0 3px rgba(147, 51, 234, 0.1)' }}
        >
          <input
            type="text"
            value={input}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            placeholder="메시지를 입력하세요"
            className="
              flex-1 bg-transparent text-gray-700 placeholder-gray-400
              outline-none border-none py-2 px-3
              pr-12
            "
          />
          <div className='flex items-center justify-between'>
            {children && (
            <div>
              {children}
            </div>
            )}
            <motion.button
              type="submit"
              disabled={disabled}
              className="
                p-2 rounded-full
                bg-purple-600 hover:bg-purple-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              transition={{ duration: 0.15 }}
            >
              {disabled ? (
                <ArrowPathIcon className="h-5 w-5 text-white animate-spin" />
              ) : (
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <PaperAirplaneIcon className="h-5 w-5 text-white rotate-90" />
                </motion.div>
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  )
}