'use client'

import type { ParticipantAdmin } from '@/types/database.types'

interface SelfSendConfirmationModalProps {
  participant: ParticipantAdmin
  onConfirm: () => void
  onSkip: () => void
  onClose: () => void
}

export function SelfSendConfirmationModal({
  participant,
  onConfirm,
  onSkip,
  onClose,
}: SelfSendConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">An dich selbst senden?</h2>

        <div className="mb-4">
          <p className="text-gray-700 mb-2">Du sendest jetzt WhatsApp an deine eigene Nummer:</p>
          <p className="font-medium text-gray-900">{participant.phone_number}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div className="text-sm text-yellow-900">
              <p className="font-semibold">Tipp:</p>
              <p>Öffne den Link später, um zu sehen, wen du beschenkst.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
          >
            Überspringen
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Ja, an mich senden
          </button>
        </div>
      </div>
    </div>
  )
}
