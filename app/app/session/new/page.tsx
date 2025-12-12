'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/services/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { useTranslations, useLocale } from 'next-intl'

export default function NewSessionPage() {
  const t = useTranslations('session.new')
  const locale = useLocale()
  const { user } = useAuth()
  const [sessionName, setSessionName] = useState(t('defaultName', { year: new Date().getFullYear() }))
  const [partnerExclusionEnabled, setPartnerExclusionEnabled] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setCreating(true)
    setError('')

    const { data, error: createError } = await supabase
      .from('sessions')
      .insert({
        organizer_id: user.id,
        name: sessionName,
        status: 'planning',
        admin_token: uuidv4(),
        partner_exclusion_enabled: partnerExclusionEnabled,
        language: locale, // Store organizer's language for WhatsApp messages
      })
      .select()
      .single()

    if (createError) {
      setError(createError.message)
      setCreating(false)
    } else {
      router.push(`/app/session/${data.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-christmas-snow via-white to-christmas-ice">
      <header className="relative bg-gradient-to-r from-christmas-red/90 to-christmas-red-light/90 backdrop-blur-lg shadow-frost-lg border-b border-white/20">
        <div className="texture-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <button
            onClick={() => router.back()}
            className="text-white/90 hover:text-white mb-2 flex items-center gap-2 font-semibold transition-all hover:translate-x-1"
          >
            ← {t('back')}
          </button>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">{t('title')}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card rounded-2xl p-8 hover:shadow-frost-lg transition-all duration-300">
          <form onSubmit={handleCreateSession} className="space-y-6">
            <div>
              <label htmlFor="sessionName" className="block text-sm font-medium text-gray-700 mb-2">
                {t('nameLabel')}
              </label>
              <input
                id="sessionName"
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder={t('namePlaceholder')}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-red focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                {t('nameHelp')}
              </p>
            </div>

            <div className="bg-christmas-ice/30 border-2 border-christmas-blue/30 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <input
                  id="partnerExclusion"
                  type="checkbox"
                  checked={partnerExclusionEnabled}
                  onChange={(e) => setPartnerExclusionEnabled(e.target.checked)}
                  className="mt-1 h-5 w-5 text-christmas-blue focus:ring-christmas-blue border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="partnerExclusion" className="flex-1 cursor-pointer">
                  <span className="block text-base font-bold text-gray-900">
                    {t('partnerExclusion.label')}
                  </span>
                  <span className="block text-sm text-gray-600 mt-1">
                    {t('partnerExclusion.description')}
                  </span>
                </label>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-gradient-to-br from-christmas-red via-christmas-red to-christmas-red-dark text-white py-3 rounded-lg font-semibold shadow-frost-lg hover:shadow-glow-red hover:scale-105 transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:hover:scale-100"
            >
              {creating ? t('creating') : t('submitButton')}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
