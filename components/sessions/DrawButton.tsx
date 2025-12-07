'use client'

import { useState } from 'react'
import type { ParticipantAdmin } from '@/types/database.types'
import { DrawConfirmationModal } from './DrawConfirmationModal'

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
        className="w-full bg-christmas-green text-white py-3 rounded-lg font-semibold hover:bg-christmas-green-light transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {canDraw ? '🎲 Auslosung durchführen' : '⏳ Auslosung nicht möglich'}
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
