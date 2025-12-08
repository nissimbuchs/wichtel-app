'use client'

import type { ParticipantAdmin } from '@/types/database.types'
import { WichtelIcon } from '@/components/icons/WichtelIcon'

interface ParticipantListProps {
  participants: ParticipantAdmin[]
  onRemove: (participantId: string) => void
  canRemove: boolean
}

export function ParticipantList({ participants, onRemove, canRemove }: ParticipantListProps) {
  function handleRemove(participant: ParticipantAdmin) {
    const confirmed = window.confirm(
      `Wirklich ${participant.name} entfernen?`
    )
    if (confirmed) {
      onRemove(participant.id)
    }
  }

  return (
    <div className="space-y-2">
      {participants.map((participant) => (
        <div
          key={participant.id}
          className={`flex items-center justify-between p-4 rounded-lg border ${
            participant.is_organizer
              ? 'bg-organizer-bg border-yellow-200'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900 flex items-center gap-2">
                {participant.name}
                {participant.is_organizer && (
                  <span className="flex items-center gap-1 text-sm">
                    <WichtelIcon name="user" size={14} />
                    <span className="text-gray-600">(Du)</span>
                  </span>
                )}
              </p>
            </div>
            <p className="text-sm text-gray-600">{participant.phone_number}</p>
          </div>

          {canRemove && (
            <button
              onClick={() => handleRemove(participant)}
              className="ml-4 text-red-600 hover:text-red-800 transition font-medium text-sm"
            >
              Entfernen
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
