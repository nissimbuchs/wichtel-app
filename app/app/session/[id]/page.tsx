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
import { Footer } from '@/components/layout/Footer'

export default function SessionDetailPage() {
  const params = useParams()
  const sessionId = params.id as string
  const { user } = useAuth()
  const [session, setSession] = useState<Session | null>(null)
  const [participants, setParticipants] = useState<ParticipantAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')
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

  async function handleAddParticipant(name: string, phoneNumber: string, isOrganizer: boolean = false) {
    if (!user) return

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

  async function handleAddMyself() {
    // Check if organizer already exists
    const organizerExists = participants.some(p => p.is_organizer)
    if (organizerExists) {
      alert('Du bist bereits in der Teilnehmerliste!')
      return
    }

    const name = prompt('Dein Name:')
    if (!name) return

    const phoneNumber = prompt('Deine Telefonnummer:')
    if (!phoneNumber) return

    try {
      await handleAddParticipant(name, phoneNumber, true)
    } catch (error) {
      alert('Fehler beim Hinzufügen')
    }
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

  async function handleArchiveToggle() {
    const newStatus = session?.status === 'archived' ? 'completed' : 'archived'

    const { error } = await supabase
      .from('sessions')
      .update({ status: newStatus })
      .eq('id', sessionId)

    if (error) {
      console.error('Error updating session status:', error)
      alert('Fehler beim Archivieren der Session')
    } else {
      await loadSession()
    }
  }

  function handleDuplicateClick() {
    // Pre-fill with current name + year
    const currentYear = new Date().getFullYear()
    setNewSessionName(`${session?.name} ${currentYear}`)
    setShowDuplicateModal(true)
  }

  async function handleDuplicateConfirm() {
    try {
      if (!newSessionName.trim()) {
        alert('Bitte gib einen Namen für die neue Session ein')
        return
      }

      // Create new session with custom name
      const { data: newSession, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          organizer_id: user!.id,
          name: newSessionName.trim(),
          status: 'planning',
          admin_token: uuidv4(),
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      // Copy participants (without assignments)
      const participantsWithoutAssignments = participants.map(p => ({
        session_id: newSession.id,
        name: p.name,
        phone_number: p.phone_number,
        participant_token: uuidv4(),
        is_organizer: p.is_organizer,
      }))

      const { error: participantsError } = await supabase
        .from('participants')
        .insert(participantsWithoutAssignments)

      if (participantsError) throw participantsError

      // Navigate to new session
      router.push(`/app/session/${newSession.id}`)
    } catch (error) {
      console.error('Error duplicating session:', error)
      alert('Fehler beim Kopieren der Session')
    }
  }

  async function handleDeleteConfirm() {
    try {
      // Delete session (CASCADE will delete participants automatically)
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error

      // Navigate back to dashboard
      router.push('/app')
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Fehler beim Löschen der Session')
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-christmas-snow via-white to-christmas-ice">
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
            <div className="flex items-center gap-3">
              <span
                className={`px-5 py-2 rounded-xl text-base font-bold shadow-lg ${
                  session.status === 'archived'
                    ? 'bg-gray-500 text-white'
                    : session.status === 'drawn'
                    ? 'bg-white text-christmas-green'
                    : 'bg-white/90 text-christmas-gold-dark'
                }`}
              >
                {session.status === 'archived'
                  ? '📦 Archiviert'
                  : session.status === 'planning'
                  ? '📝 In Planung'
                  : '🎰 Ausgelost'}
              </span>
            </div>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={handleDuplicateClick}
              className="px-4 py-2 bg-white/20 backdrop-blur border-2 border-white/40 rounded-lg hover:bg-white/30 transition-all text-white text-sm font-semibold"
            >
              📋 Als Vorlage kopieren
            </button>
            <button
              onClick={handleArchiveToggle}
              className="px-4 py-2 bg-white/20 backdrop-blur border-2 border-white/40 rounded-lg hover:bg-white/30 transition-all text-white text-sm font-semibold"
            >
              {session.status === 'archived' ? '♻️ Wiederherstellen' : '📦 Archivieren'}
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-500/80 backdrop-blur border-2 border-red-400/40 rounded-lg hover:bg-red-600/80 transition-all text-white text-sm font-semibold"
            >
              🗑️ Löschen
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {session.status === 'drawn' ? (
          // WhatsApp Send Mode
          <WhatsAppList
            sessionId={sessionId}
            sessionName={session.name}
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

                {/* Add myself button */}
                {session.status === 'planning' && !participants.some(p => p.is_organizer) && (
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">oder</span>
                      </div>
                    </div>
                    <button
                      onClick={handleAddMyself}
                      className="mt-4 w-full bg-gradient-to-r from-christmas-gold to-christmas-gold-light text-white py-3 rounded-xl font-bold text-base hover:scale-105 hover:shadow-lg transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                    >
                      <span>🎅</span>
                      <span>Mich selbst hinzufügen (Organisator)</span>
                    </button>
                  </div>
                )}
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
      <Footer />

      {/* Duplicate Session Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-4xl">📋</span>
              Session kopieren
            </h2>
            <p className="text-gray-600 mb-6">
              Gib einen Namen für die neue Session ein. Alle Teilnehmer werden kopiert, aber es erfolgt eine neue Auslosung.
            </p>

            <div className="mb-6">
              <label htmlFor="sessionName" className="block text-sm font-bold text-gray-700 mb-2">
                Session Name *
              </label>
              <input
                id="sessionName"
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Wichteln 2025"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-christmas-red/30 focus:border-christmas-red transition-all text-lg"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDuplicateConfirm}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-christmas-red to-christmas-red-light text-white rounded-xl font-bold hover:scale-105 hover:shadow-christmas transition-all duration-300"
              >
                Kopieren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Session Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-3">
              <span className="text-4xl">⚠️</span>
              Session löschen
            </h2>
            <p className="text-gray-700 mb-2 font-semibold">
              Möchtest du die Session "{session?.name}" wirklich löschen?
            </p>
            <p className="text-gray-600 mb-6">
              Diese Aktion kann nicht rückgängig gemacht werden. Alle Teilnehmer und Zuteilungen werden ebenfalls gelöscht.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:scale-105 hover:shadow-lg transition-all duration-300"
              >
                Ja, löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
