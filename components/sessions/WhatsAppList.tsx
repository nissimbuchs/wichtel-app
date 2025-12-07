'use client'

import { useState, useEffect } from 'react'
import type { ParticipantAdmin } from '@/types/database.types'
import { generateWhatsAppUrl, openWhatsApp } from '@/services/whatsappService'
import { createClient } from '@/services/supabase/client'
import { SelfSendConfirmationModal } from './SelfSendConfirmationModal'
import { CompletionModal } from './CompletionModal'

interface WhatsAppListProps {
  sessionId: string
  participants: ParticipantAdmin[]
  onUpdate: () => void
}

export function WhatsAppList({ sessionId, participants, onUpdate }: WhatsAppListProps) {
  const [sentParticipants, setSentParticipants] = useState<Set<string>>(new Set())
  const [showSelfSendModal, setShowSelfSendModal] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantAdmin | null>(null)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Initialize sent status from database
    const sent = new Set(
      participants.filter((p) => p.whatsapp_sent_at !== null).map((p) => p.id)
    )
    setSentParticipants(sent)
  }, [participants])

  useEffect(() => {
    // Check if all sent
    if (sentParticipants.size === participants.length && participants.length > 0) {
      setShowCompletionModal(true)
    }
  }, [sentParticipants.size, participants.length])

  async function handleSendWhatsApp(participant: ParticipantAdmin) {
    // Check if it's the organizer
    if (participant.is_organizer) {
      setSelectedParticipant(participant)
      setShowSelfSendModal(true)
      return
    }

    await sendWhatsApp(participant)
  }

  async function sendWhatsApp(participant: ParticipantAdmin) {
    const url = generateWhatsAppUrl(
      participant,
      `${window.location.origin}/reveal/${participant.participant_token}`
    )

    openWhatsApp(url)

    // Mark as sent
    await markAsSent(participant.id)
  }

  async function markAsSent(participantId: string) {
    const { error } = await supabase
      .from('participants')
      .update({ whatsapp_sent_at: new Date().toISOString() })
      .eq('id', participantId)

    if (!error) {
      setSentParticipants((prev) => new Set(prev).add(participantId))
      onUpdate()
    }
  }

  async function handleSelfSendConfirm() {
    if (selectedParticipant) {
      await sendWhatsApp(selectedParticipant)
      setShowSelfSendModal(false)
      setSelectedParticipant(null)
    }
  }

  async function handleSelfSendSkip() {
    if (selectedParticipant) {
      await markAsSent(selectedParticipant.id)
      setShowSelfSendModal(false)
      setSelectedParticipant(null)
    }
  }

  const sentCount = sentParticipants.size
  const totalCount = participants.length

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">WhatsApp versenden</h2>
          <span className="text-sm font-medium text-gray-600">
            Versendet: {sentCount} von {totalCount}
          </span>
        </div>

        <div className="space-y-2">
          {participants.map((participant) => {
            const isSent = sentParticipants.has(participant.id)

            return (
              <div
                key={participant.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  participant.is_organizer
                    ? 'bg-organizer-bg border-yellow-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {isSent && <span className="text-green-600 text-xl">✓</span>}
                  <div>
                    <p className="font-medium text-gray-900">
                      {participant.name}
                      {participant.is_organizer && (
                        <span className="ml-2 text-sm">
                          👤 <span className="text-gray-600">(Du)</span>
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{participant.phone_number}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleSendWhatsApp(participant)}
                  disabled={isSent}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    isSent
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-green-50 border-2 border-green-600 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {isSent ? '📱 WhatsApp gesendet' : '📱 WhatsApp öffnen'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {showSelfSendModal && selectedParticipant && (
        <SelfSendConfirmationModal
          participant={selectedParticipant}
          onConfirm={handleSelfSendConfirm}
          onSkip={handleSelfSendSkip}
          onClose={() => {
            setShowSelfSendModal(false)
            setSelectedParticipant(null)
          }}
        />
      )}

      {showCompletionModal && (
        <CompletionModal onClose={() => setShowCompletionModal(false)} />
      )}
    </div>
  )
}
