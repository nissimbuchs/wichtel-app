'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/services/supabase/client'
import type { Session, ParticipantAdmin } from '@/types/database.types'
import { v4 as uuidv4 } from 'uuid'
import { ParticipantList } from '@/components/sessions/ParticipantList'
import { ParticipantForm } from '@/components/sessions/ParticipantForm'
import { DrawButton } from '@/components/sessions/DrawButton'
import { WhatsAppList } from '@/components/sessions/WhatsAppList'

export default function SessionDetailPage() {
  const params = useParams()
  const sessionId = params.id as string
  const { user } = useAuth()
  const [session, setSession] = useState<Session | null>(null)
  const [participants, setParticipants] = useState<ParticipantAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadSession()
      loadParticipants()
    }
  }, [user, sessionId])

  async function loadSession() {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) {
      console.error('Error loading session:', error)
      router.push('/app')
    } else {
      setSession(data)
    }
    setLoading(false)
  }

  async function loadParticipants() {
    // CRITICAL: Do NOT select assigned_to_id to preserve anonymity
    const { data, error } = await supabase
      .from('participants')
      .select('id, name, phone_number, participant_token, is_organizer, whatsapp_sent_at, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading participants:', error)
    } else {
      setParticipants(data || [])
    }
  }

  async function handleAddParticipant(name: string, phoneNumber: string) {
    if (!user) return

    // Check if organizer's phone number
    const isOrganizer = phoneNumber === user.phone // Simple check, could be improved

    const { error } = await supabase.from('participants').insert({
      session_id: sessionId,
      name,
      phone_number: phoneNumber,
      participant_token: uuidv4(),
      is_organizer: isOrganizer,
    })

    if (error) {
      throw error
    }

    await loadParticipants()
  }

  async function handleRemoveParticipant(participantId: string) {
    if (session?.status === 'drawn') {
      alert('Teilnehmer können nach der Auslosung nicht mehr entfernt werden!')
      return
    }

    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', participantId)

    if (error) {
      console.error('Error removing participant:', error)
    } else {
      await loadParticipants()
    }
  }

  if (loading || !session) {
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

  const canDraw = participants.length >= 3 && session.status === 'planning'

  return (
    <div className="min-h-screen bg-gradient-to-br from-christmas-snow via-white to-christmas-ice">
      <header className="bg-gradient-to-r from-christmas-red to-christmas-red-light shadow-christmas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/app')}
            className="text-white/90 hover:text-white mb-3 flex items-center gap-2 font-semibold transition-all hover:translate-x-1"
          >
            ← Zurück zu allen Sessions
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">{session.name}</h1>
              <p className="text-sm text-white/80 mt-2 font-medium">
                Session-ID: {session.id.substring(0, 8)}... • {participants.length} Teilnehmer
              </p>
            </div>
            <span
              className={`px-5 py-2 rounded-xl text-base font-bold shadow-lg ${
                session.status === 'drawn'
                  ? 'bg-white text-christmas-green'
                  : 'bg-white/90 text-christmas-gold-dark'
              }`}
            >
              {session.status === 'planning' ? '📝 In Planung' : '🎰 Ausgelost'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {session.status === 'drawn' ? (
          // WhatsApp Send Mode
          <WhatsAppList
            sessionId={sessionId}
            participants={participants}
            onUpdate={loadParticipants}
          />
        ) : (
          // Planning Mode
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Add Participants */}
            <div>
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-christmas-ice/50">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">👥</span>
                  <h2 className="text-2xl font-bold text-gray-900">Teilnehmer hinzufügen</h2>
                </div>
                <ParticipantForm
                  onAdd={handleAddParticipant}
                  disabled={session.status !== 'planning'}
                />
              </div>
            </div>

            {/* Right: Participant List */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-christmas-ice/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">🎄</span>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Teilnehmer
                    </h2>
                  </div>
                  <span className="bg-christmas-gold/20 text-christmas-gold-dark px-4 py-2 rounded-xl font-bold text-lg">
                    {participants.length}
                  </span>
                </div>
                {participants.length === 0 ? (
                  <div className="text-center py-12 bg-christmas-ice/30 rounded-xl">
                    <div className="text-6xl mb-3 animate-pulse-slow">🎁</div>
                    <p className="text-gray-600 text-lg font-medium">
                      Noch keine Teilnehmer hinzugefügt
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Füge mindestens 3 Personen hinzu
                    </p>
                  </div>
                ) : (
                  <ParticipantList
                    participants={participants}
                    onRemove={handleRemoveParticipant}
                    canRemove={session.status === 'planning'}
                  />
                )}
              </div>

              {/* Draw Button */}
              {session.status === 'planning' && (
                <div className="bg-gradient-to-br from-christmas-gold/10 to-christmas-gold-light/10 rounded-2xl p-6 border-2 border-christmas-gold/30 shadow-lg">
                  <DrawButton
                    sessionId={sessionId}
                    participants={participants}
                    canDraw={canDraw}
                    onDrawComplete={() => {
                      loadSession()
                      loadParticipants()
                    }}
                  />
                  {!canDraw && participants.length < 3 && (
                    <div className="mt-4 text-center bg-white/70 rounded-xl p-4">
                      <p className="text-sm text-gray-700 font-medium flex items-center justify-center gap-2">
                        <span className="text-2xl">💡</span>
                        <span>Mindestens 3 Teilnehmer benötigt für die Auslosung</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
