'use client'

interface CompletionModalProps {
  onClose: () => void
}

export function CompletionModal({ onClose }: CompletionModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">✅</div>
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
              <span className="text-xl flex-shrink-0">🔒</span>
              <p className="text-sm">
                Niemand kennt die Zuteilungen bis zum Öffnen des eigenen Links.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-christmas-red text-white py-3 rounded-lg font-semibold hover:bg-christmas-red-light transition"
        >
          Fertig
        </button>
      </div>
    </div>
  )
}
