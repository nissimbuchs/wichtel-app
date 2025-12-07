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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2"
          >
            ← Zurück
          </button>
          <h1 className="text-3xl font-bold text-christmas-red">Neue Wichtel-Session</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
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
              className="w-full bg-christmas-red text-white py-3 rounded-lg font-semibold hover:bg-christmas-red-light transition disabled:opacity-50"
            >
              {creating ? 'Wird erstellt...' : 'Session erstellen'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
