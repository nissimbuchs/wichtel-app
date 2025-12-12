'use client'

import { WichtelIcon } from '@/components/icons/WichtelIcon'
import { useTranslations } from 'next-intl'

interface CompletionModalProps {
  onClose: () => void
}

export function CompletionModal({ onClose }: CompletionModalProps) {
  const t = useTranslations('whatsapp.completion')
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-card-strong rounded-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="mb-4 flex justify-center">
            <WichtelIcon name="check-circle" size={64} className="text-christmas-green" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h2>
        </div>

        <div className="space-y-3 mb-6 text-gray-700">
          <p>{t('message')}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <WichtelIcon name="lock" size={20} className="flex-shrink-0 text-blue-600" />
              <p className="text-sm">{t('security')}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-br from-christmas-red via-christmas-red to-christmas-red-dark text-white py-3 rounded-lg font-semibold shadow-frost-lg hover:shadow-glow-red hover:scale-105 transition-all duration-300 border border-white/20"
        >
          {t('done')}
        </button>
      </div>
    </div>
  )
}
