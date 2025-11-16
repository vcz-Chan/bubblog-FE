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
  const hasInput = input.trim().length > 0

  return (
    <div className="sticky flex flex-col justify-center w-full bottom-0 px-3 sm:px-4 z-10">
      <div className='pb-3 sm:pb-4 bg-[rgb(244,246,248)] rounded-t-3xl'>
        <motion.form
          onSubmit={onSubmit}
          className="
            relative flex flex-col w-full
            border-2 border-gray-200 bg-white
            rounded-2xl sm:rounded-3xl shadow-lg
            px-3 sm:px-4 py-2
            transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
            focus-within:border-blue-500 focus-within:shadow-xl
            focus-within:shadow-blue-100/50
            hover:shadow-xl
          "
        >
          <input
            type="text"
            value={input}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            placeholder="무엇이든 물어보세요..."
            aria-label="채팅 메시지 입력"
            className="
              flex-1 bg-transparent text-gray-800 placeholder-gray-400
              outline-none border-none py-3 px-3
              text-base
              disabled:opacity-50
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
              aria-label={disabled ? '전송 중...' : '메시지 전송'}
              className={`
                p-2.5 sm:p-2 rounded-full transition-all duration-200
                min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0
                flex items-center justify-center
                ${hasInput && !disabled
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200'
                  : 'bg-blue-500 hover:bg-blue-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            >
              {disabled ? (
                <ArrowPathIcon className="h-5 w-5 text-white animate-spin" />
              ) : (
                <PaperAirplaneIcon className="h-5 w-5 text-white rotate-90" />
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  )
}