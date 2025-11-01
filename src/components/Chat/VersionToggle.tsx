'use client'

interface Props {
  value: 'v1' | 'v2'
  onChange: (v: 'v1' | 'v2') => void
  disabled?: boolean
}

export function VersionToggle({ value, onChange, disabled }: Props) {
  const base = 'px-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const active = 'bg-gray-900 text-white hover:bg-gray-800'
  const inactive = 'bg-gray-100 text-gray-700 hover:bg-gray-200'

  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label="Ask version">
      <button
        type="button"
        className={`${base} ${value === 'v1' ? active : inactive}`}
        aria-pressed={value === 'v1'}
        onClick={() => !disabled && onChange('v1')}
        disabled={disabled}
      >
        v1
      </button>
      <button
        type="button"
        className={`${base} ${value === 'v2' ? active : inactive}`}
        aria-pressed={value === 'v2'}
        onClick={() => !disabled && onChange('v2')}
        disabled={disabled}
      >
        v2
      </button>
    </div>
  )
}

