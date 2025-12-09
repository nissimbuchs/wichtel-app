'use client'

import { useState } from 'react'
import type { ParticipantAdmin } from '@/types/database.types'
import { performDraw } from '@/services/drawAlgorithm'
import { WichtelIcon } from '@/components/icons/WichtelIcon'

interface DrawConfirmationModalProps {
  sessionId: string
  participants: ParticipantAdmin[]
  partnerExclusionEnabled: boolean
  onClose: () => void
  onComplete: () => void
}

export function DrawConfirmationModal({
  sessionId,
  participants,
  partnerExclusionEnabled,
  onClose,
  onComplete,
}: DrawConfirmationModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setLoading(true)
    setError('')

    try {
      await performDraw(sessionId, participants, partnerExclusionEnabled)
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Auslosung')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-card-strong rounded-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Auslosung durchführen?</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <WichtelIcon name="info" size={24} className="text-blue-600 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">Wichtig:</p>
              <p>
                Auch <strong>DU</strong> wirst erst beim Öffnen deines eigenen Links sehen, wen du
                beschenkst.
              </p>
              <p className="mt-2">
                Niemand (auch nicht du als Organisator) kennt die Zuteilungen im Voraus.
              </p>
              {partnerExclusionEnabled && (
                <p className="mt-2 font-semibold text-christmas-blue">
                  Partner-Ausschluss ist aktiv: Partner werden nicht einander zugelost.
                </p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 glass-button px-4 py-3 rounded-lg font-semibold text-gray-700 hover:text-christmas-red disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-br from-christmas-green via-christmas-green to-christmas-green-dark text-white rounded-lg font-semibold shadow-frost-lg hover:shadow-glow-green hover:scale-105 transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Läuft...' : 'Verstanden, starten'}
          </button>
        </div>
      </div>
    </div>
  )
}
