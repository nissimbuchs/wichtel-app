'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/services/supabase/client'
import type { Session } from '@/types/database.types'
import { Footer } from '@/components/layout/Footer'

export default function AppPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && user) {
      loadSessions()
    }
  }, [authLoading, user, showArchived])

  async function loadSessions() {
    const query = supabase
      .from('sessions')
      .select('*')
      .eq('organizer_id', user!.id)
      .order('created_at', { ascending: false })

    // Filter by archived status
    if (!showArchived) {
      query.neq('status', 'archived')
    }

    const { data, error } = await query

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-christmas-snow to-christmas-ice">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-slow">🎄</div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-christmas-red border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-700 text-xl font-medium">Lädt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-christmas-snow via-white to-christmas-ice">
      <header className="bg-gradient-to-r from-christmas-red to-christmas-red-light shadow-christmas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">🎄 Wichtel App</h1>
            <p className="text-sm text-white/90 mt-2 font-medium">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="px-6 py-3 bg-white/20 backdrop-blur border-2 border-white/40 rounded-xl hover:bg-white/30 transition-all text-white font-semibold"
          >
            Abmelden
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Meine Wichtel-Sessions</h2>
            <p className="text-gray-600 mt-1">Verwalte alle deine Wichtel-Veranstaltungen 🎁</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-6 py-4 rounded-xl font-bold transition-all duration-300 text-base shadow-md ${
                showArchived
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
              }`}
            >
              {showArchived ? '📋 Aktive anzeigen' : '📦 Archiv anzeigen'}
            </button>
            <button
              onClick={createNewSession}
              className="bg-gradient-to-r from-christmas-red to-christmas-red-light text-white px-8 py-4 rounded-xl font-bold hover:scale-105 hover:shadow-christmas transition-all duration-300 text-lg shadow-lg"
            >
              + Neue Session
            </button>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-xl border-4 border-christmas-ice">
            <div className="text-8xl mb-6 animate-wiggle">{showArchived ? '📦' : '🎁'}</div>
            <p className="text-gray-900 text-2xl font-bold mb-3">
              {showArchived ? 'Keine archivierten Sessions' : 'Noch keine Sessions erstellt'}
            </p>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              {showArchived
                ? 'Du hast noch keine Sessions archiviert. Archiviere alte Sessions um deine Liste übersichtlich zu halten.'
                : 'Erstelle deine erste Wichtel-Session in unter 5 Minuten und verschenke Freude! ✨'
              }
            </p>
            <button
              onClick={createNewSession}
              className="bg-gradient-to-r from-christmas-red to-christmas-red-light text-white px-10 py-4 rounded-xl font-bold hover:scale-105 hover:shadow-christmas transition-all duration-300 inline-block text-xl"
            >
              🎅 Jetzt starten
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => router.push(`/app/session/${session.id}`)}
                className="bg-white p-7 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-christmas-ice/50 hover:border-christmas-gold/50 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-christmas-red transition-colors">
                      {session.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>📅</span>
                      {new Date(session.created_at).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md ${
                      session.status === 'archived'
                        ? 'bg-gray-500 text-white'
                        : session.status === 'drawn'
                        ? 'bg-gradient-to-r from-christmas-green to-christmas-green-light text-white'
                        : session.status === 'completed'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-gradient-to-r from-christmas-gold to-christmas-gold-light text-white'
                    }`}
                  >
                    {session.status === 'archived'
                      ? '📦 Archiviert'
                      : session.status === 'planning'
                      ? '📝 In Planung'
                      : session.status === 'drawn'
                      ? '🎰 Ausgelost'
                      : '✅ Abgeschlossen'}
                  </span>
                  <span className="text-3xl group-hover:scale-125 transition-transform">
                    {session.status === 'archived'
                      ? '📦'
                      : session.status === 'planning'
                      ? '🎄'
                      : session.status === 'drawn'
                      ? '🎁'
                      : '🎉'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
