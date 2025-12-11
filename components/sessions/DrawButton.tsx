'use client'

import { useState } from 'react'
import type { ParticipantAdmin } from '@/types/database.types'
import { DrawConfirmationModal } from './DrawConfirmationModal'
import { WichtelIcon } from '@/components/icons/WichtelIcon'
import { useTranslations } from 'next-intl'

interface DrawButtonProps {
  sessionId: string
  participants: ParticipantAdmin[]
  canDraw: boolean
  partnerExclusionEnabled: boolean
  onDrawComplete: () => void
}

export function DrawButton({
  sessionId,
  participants,
  canDraw,
  partnerExclusionEnabled,
  onDrawComplete
}: DrawButtonProps) {
  const t = useTranslations('session.draw')
  const [showConfirmation, setShowConfirmation] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowConfirmation(true)}
        disabled={!canDraw}
        className="w-full bg-gradient-to-br from-christmas-green via-christmas-green to-christmas-green-dark text-white py-3 rounded-lg font-semibold shadow-frost-lg hover:shadow-glow-green hover:scale-105 transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {canDraw ? (
          <>
            <WichtelIcon name="dices" size={20} />
            {t('buttonEnabled')}
          </>
        ) : (
          <>
            <WichtelIcon name="alert-triangle" size={20} />
            {t('buttonDisabled')}
          </>
        )}
      </button>

      {showConfirmation && (
        <DrawConfirmationModal
          sessionId={sessionId}
          participants={participants}
          partnerExclusionEnabled={partnerExclusionEnabled}
          onClose={() => setShowConfirmation(false)}
          onComplete={() => {
            setShowConfirmation(false)
            onDrawComplete()
          }}
        />
      )}
    </>
  )
}
