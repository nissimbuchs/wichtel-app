'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/services/supabase/client'
import { v4 as uuidv4 } from 'uuid'

export default function NewSessionPage() {
  const { user } = useAuth()
  const [sessionName, setSessionName] = useState(`Wichteln ${new Date().getFullYear()}`)
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
            ← Zurück
          </button>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Neue Wichtel-Session</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card rounded-2xl p-8 hover:shadow-frost-lg transition-all duration-300">
          <form onSubmit={handleCreateSession} className="space-y-6">
            <div>
              <label htmlFor="sessionName" className="block text-sm font-medium text-gray-700 mb-2">
                Session-Name
              </label>
              <input
                id="sessionName"
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="z.B. Weihnachtsfeier 2024"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-red focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Gib deiner Session einen Namen, damit du sie später leicht wiederfindest.
              </p>
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
              {creating ? 'Wird erstellt...' : 'Session erstellen'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
