'use client'

import { Persona } from '@/services/personaService'
import { Button } from '@/components/Common/Button'
import { SpeakerWaveIcon } from '@heroicons/react/24/outline'

interface PersonaFilterButtonProps {
  selectedPersona: Persona | null
  onOpen: () => void
}

export function PersonaFilterButton({
  selectedPersona,
  onOpen,
}: PersonaFilterButtonProps) {
  return (
    <div className="flex items-center">
      <Button
        onClick={onOpen}
        variant="ghost"
      >
        <SpeakerWaveIcon className="h-5 w-5 mr-1" />
        {selectedPersona
          ? `말투: ${selectedPersona.name}`
          : '말투 선택'}
      </Button>
    </div>
  )
}