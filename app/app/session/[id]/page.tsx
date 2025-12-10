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
import { WichtelIcon } from '@/components/icons/WichtelIcon'
import Image from 'next/image'

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

  // Reload participants when user returns to tab (after viewing reveal)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        loadParticipants()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user])

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
      .select('id, name, phone_number, participant_token, is_organizer, whatsapp_sent_at, reveal_viewed_at, partner_id, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading participants:', error)
    } else {
      setParticipants(data || [])
    }
  }

  async function handleAddParticipant(
    name: string,
    phoneNumber: string,
    isOrganizer: boolean = false,
    partnerId: string | null = null
  ) {
    if (!user) return

    const { error } = await supabase.from('participants').insert({
      session_id: sessionId,
      name,
      phone_number: phoneNumber,
      participant_token: uuidv4(),
      is_organizer: isOrganizer,
      partner_id: partnerId,
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
          <div className="mb-4 flex justify-center">
            <Image
              src="/logo-icon.png"
              alt="Wichtel App"
              width={80}
              height={80}
              className="animate-bounce-slow drop-shadow-lg"
            />
          </div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-christmas-red border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-700 text-xl font-medium">Lädt...</p>
        </div>
      </div>
    )
  }

  const canDraw = participants.length >= 3 && session.status === 'planning'

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-christmas-snow via-white to-christmas-ice">
      <header className="relative bg-gradient-to-r from-christmas-red/90 to-christmas-red-light/90 backdrop-blur-lg shadow-frost-lg border-b border-white/20">
        <div className="texture-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
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
                className={`px-5 py-2 rounded-xl text-base font-bold shadow-lg flex items-center gap-2 ${
                  session.status === 'archived'
                    ? 'bg-gray-500 text-white'
                    : session.status === 'drawn'
                    ? 'bg-white text-christmas-green'
                    : 'bg-white/90 text-christmas-gold-dark'
                }`}
              >
                {session.status === 'archived' ? (
                  <>
                    <WichtelIcon name="archive" size={20} />
                    <span>Archiviert</span>
                  </>
                ) : session.status === 'planning' ? (
                  <>
                    <WichtelIcon name="edit" size={20} />
                    <span>In Planung</span>
                  </>
                ) : (
                  <>
                    <WichtelIcon name="dices" size={20} />
                    <span>Ausgelost</span>
                  </>
                )}
              </span>
            </div>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={handleDuplicateClick}
              className="glass-button px-4 py-2 rounded-lg text-white hover:text-white text-sm font-semibold flex items-center gap-2"
            >
              <WichtelIcon name="clipboard" size={16} />
              Als Vorlage kopieren
            </button>
            <button
              onClick={handleArchiveToggle}
              className="glass-button px-4 py-2 rounded-lg text-white hover:text-white text-sm font-semibold flex items-center gap-2"
            >
              {session.status === 'archived' ? (
                <>
                  <WichtelIcon name="rotate-ccw" size={16} />
                  Wiederherstellen
                </>
              ) : (
                <>
                  <WichtelIcon name="archive" size={16} />
                  Archivieren
                </>
              )}
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-500/80 backdrop-blur border-2 border-red-400/40 rounded-lg hover:bg-red-600/80 transition-all text-white text-sm font-semibold flex items-center gap-2"
            >
              <WichtelIcon name="trash" size={16} />
              Löschen
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
              <div className="glass-card rounded-2xl p-8 hover:shadow-frost-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <WichtelIcon name="users" size={40} className="text-christmas-red" />
                  <h2 className="text-2xl font-bold text-gray-900">Teilnehmer hinzufügen</h2>
                </div>
                <ParticipantForm
                  onAdd={handleAddParticipant}
                  disabled={session.status !== 'planning'}
                  hasOrganizer={participants.some(p => p.is_organizer)}
                  partnerExclusionEnabled={session.partner_exclusion_enabled}
                  existingParticipants={participants}
                />
              </div>
            </div>

            {/* Right: Participant List */}
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-8 hover:shadow-frost-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <WichtelIcon name="tree" size={40} className="text-christmas-green" />
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
                    <div className="mb-3 flex justify-center">
                      <WichtelIcon name="gift" size={64} className="text-christmas-red animate-pulse-slow" />
                    </div>
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
                    showPartnerInfo={session.partner_exclusion_enabled}
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
                    partnerExclusionEnabled={session.partner_exclusion_enabled}
                    onDrawComplete={() => {
                      loadSession()
                      loadParticipants()
                    }}
                  />
                  {!canDraw && participants.length < 3 && (
                    <div className="mt-4 text-center bg-white/70 rounded-xl p-4">
                      <p className="text-sm text-gray-700 font-medium flex items-center justify-center gap-2">
                        <WichtelIcon name="lightbulb" size={24} className="text-christmas-gold-dark" />
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
          <div className="glass-card-strong rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <WichtelIcon name="clipboard" size={40} className="text-christmas-red" />
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
                className="flex-1 glass-button px-6 py-3 rounded-xl font-bold text-gray-700 hover:text-christmas-red"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDuplicateConfirm}
                className="flex-1 px-6 py-3 bg-gradient-to-br from-christmas-red via-christmas-red to-christmas-red-dark text-white rounded-xl font-bold shadow-frost-lg hover:shadow-glow-red hover:scale-105 transition-all duration-300 border border-white/20"
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
          <div className="glass-card-strong rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-3">
              <WichtelIcon name="alert-triangle" size={40} className="text-red-600" />
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
                className="flex-1 glass-button px-6 py-3 rounded-xl font-bold text-gray-700 hover:text-christmas-red"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-6 py-3 bg-gradient-to-br from-red-500 via-red-500 to-red-600 text-white rounded-xl font-bold shadow-frost-lg hover:shadow-glow-red hover:scale-105 transition-all duration-300 border border-white/20"
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
