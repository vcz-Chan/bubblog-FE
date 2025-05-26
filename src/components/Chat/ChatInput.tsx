'use client'

import { FormEvent } from 'react'

interface Props {
  input: string
  onChange: (v: string) => void
  onSubmit: (e: FormEvent) => void
  disabled: boolean
}

export function ChatInput({ input, onChange, onSubmit, disabled }: Props) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="text"
        className="flex-1 p-3 border rounded-full focus:outline-none"
        placeholder="메시지를 입력하세요"
        value={input}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full disabled:opacity-50 transition"
      >
        {disabled ? '전송 중…' : '보내기'}
      </button>
    </form>
  )
}