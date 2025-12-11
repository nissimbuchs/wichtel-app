'use client'

import type { ParticipantAdmin } from '@/types/database.types'
import { WichtelIcon } from '@/components/icons/WichtelIcon'
import { useTranslations } from 'next-intl'

interface ParticipantListProps {
  participants: ParticipantAdmin[]
  onRemove: (participantId: string) => void
  canRemove: boolean
  showPartnerInfo?: boolean
}

export function ParticipantList({
  participants,
  onRemove,
  canRemove,
  showPartnerInfo = false
}: ParticipantListProps) {
  const t = useTranslations('session.participant')

  // Helper to find partner name
  function getPartnerName(partnerId: string | null): string | null {
    if (!partnerId) return null
    const partner = participants.find(p => p.id === partnerId)
    return partner?.name || null
  }

  function handleRemove(participant: ParticipantAdmin) {
    const partnerName = getPartnerName(participant.partner_id)
    const message = partnerName
      ? t('confirmDeleteWithPartner', { name: participant.name, partnerName })
      : t('confirmDelete', { name: participant.name })

    const confirmed = window.confirm(message)
    if (confirmed) {
      onRemove(participant.id)
    }
  }

  return (
    <div className="space-y-2">
      {participants.map((participant) => {
        const partnerName = getPartnerName(participant.partner_id)

        return (
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
                      <span className="text-gray-600">{t('organizerBadge')}</span>
                    </span>
                  )}
                </p>
              </div>
              <p className="text-sm text-gray-600">{participant.phone_number}</p>

              {/* Partner info */}
              {showPartnerInfo && partnerName && (
                <div className="mt-1 flex items-center gap-1 text-xs text-christmas-blue font-medium">
                  <WichtelIcon name="users" size={12} />
                  <span>{t('partnerInfo', { name: partnerName })}</span>
                </div>
              )}
            </div>

            {canRemove && (
              <button
                onClick={() => handleRemove(participant)}
                className="ml-4 text-red-600 hover:text-red-800 transition font-medium text-sm"
              >
                {t('removeButton')}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
