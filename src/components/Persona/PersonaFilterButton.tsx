'use client'

import { Persona } from '@/services/personaService'

interface PersonaFilterButtonProps {
  selectedPersona: Persona | null
  onOpen: () => void
}

export function PersonaFilterButton({
  selectedPersona,
  onOpen
}: PersonaFilterButtonProps) {
  return (
    <div className="mb-6 flex items-center space-x-2">
      <button
        onClick={onOpen}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
      >
        {selectedPersona
          ? '말투: ' + selectedPersona.name
          : '말투 선택'}
      </button>
    </div>
  )
}