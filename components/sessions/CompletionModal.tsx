'use client'

import { WichtelIcon } from '@/components/icons/WichtelIcon'

interface CompletionModalProps {
  onClose: () => void
}

export function CompletionModal({ onClose }: CompletionModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-card-strong rounded-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="mb-4 flex justify-center">
            <WichtelIcon name="check-circle" size={64} className="text-christmas-green" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Alle Nachrichten versendet!
          </h2>
        </div>

        <div className="space-y-3 mb-6 text-gray-700">
          <p>
            Jeder Teilnehmer (inklusive du) hat jetzt seinen persönlichen Link erhalten.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <WichtelIcon name="lock" size={20} className="flex-shrink-0 text-blue-600" />
              <p className="text-sm">
                Niemand kennt die Zuteilungen bis zum Öffnen des eigenen Links.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-br from-christmas-red via-christmas-red to-christmas-red-dark text-white py-3 rounded-lg font-semibold shadow-frost-lg hover:shadow-glow-red hover:scale-105 transition-all duration-300 border border-white/20"
        >
          Fertig
        </button>
      </div>
    </div>
  )
}
