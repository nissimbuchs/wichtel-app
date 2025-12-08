'use client'

import { useState } from 'react'
import type { ParticipantAdmin } from '@/types/database.types'
import { DrawConfirmationModal } from './DrawConfirmationModal'
import { WichtelIcon } from '@/components/icons/WichtelIcon'

interface DrawButtonProps {
  sessionId: string
  participants: ParticipantAdmin[]
  canDraw: boolean
  onDrawComplete: () => void
}

export function DrawButton({ sessionId, participants, canDraw, onDrawComplete }: DrawButtonProps) {
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
            Auslosung durchführen
          </>
        ) : (
          <>
            <WichtelIcon name="alert-triangle" size={20} />
            Auslosung nicht möglich
          </>
        )}
      </button>

      {showConfirmation && (
        <DrawConfirmationModal
          sessionId={sessionId}
          participants={participants}
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
