'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/services/supabase/client'
import type { Session } from '@/types/database.types'

export default function AppPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && user) {
      loadSessions()
    }
  }, [authLoading, user])

  async function loadSessions() {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('organizer_id', user!.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading sessions:', error)
    } else {
      setSessions(data || [])
    }
    setLoading(false)
  }

  async function createNewSession() {
    router.push('/app/session/new')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-christmas-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Lädt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-christmas-red">🎄 Wichtel App</h1>
            <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            Abmelden
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Meine Wichtel-Sessions</h2>
          <button
            onClick={createNewSession}
            className="bg-christmas-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-christmas-red-light transition"
          >
            + Neue Session
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg mb-4">Noch keine Sessions erstellt</p>
            <p className="text-gray-500 mb-6">Erstelle deine erste Wichtel-Session in unter 5 Minuten!</p>
            <button
              onClick={createNewSession}
              className="bg-christmas-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-christmas-red-light transition inline-block"
            >
              Jetzt starten 🎁
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => router.push(`/app/session/${session.id}`)}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{session.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Erstellt am {new Date(session.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      session.status === 'drawn'
                        ? 'bg-green-100 text-green-800'
                        : session.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {session.status === 'planning'
                      ? 'In Planung'
                      : session.status === 'drawn'
                      ? 'Ausgelost'
                      : 'Abgeschlossen'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
