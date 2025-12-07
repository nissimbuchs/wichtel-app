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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-christmas-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Lädt...</p>
        </div>
      </div>
    )
  }

  const canDraw = participants.length >= 3 && session.status === 'planning'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/app')}
            className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2"
          >
            ← Zurück
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-christmas-red">{session.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Session-ID: {session.id.substring(0, 8)}...
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                session.status === 'drawn'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {session.status === 'planning' ? 'In Planung' : 'Ausgelost'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Teilnehmer hinzufügen</h2>
                <ParticipantForm
                  onAdd={handleAddParticipant}
                  disabled={session.status !== 'planning'}
                />
              </div>
            </div>

            {/* Right: Participant List */}
            <div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Teilnehmer ({participants.length})
                </h2>
                {participants.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Noch keine Teilnehmer hinzugefügt
                  </p>
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
                <div className="mt-4">
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
                    <p className="text-sm text-gray-500 text-center mt-2">
                      💡 Mindestens 3 Teilnehmer benötigt für die Auslosung
                    </p>
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
