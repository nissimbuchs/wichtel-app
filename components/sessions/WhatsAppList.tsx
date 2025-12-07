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
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-christmas-ice/50">
        {/* Header with Progress */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-5xl">💬</span>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">WhatsApp versenden</h2>
              <p className="text-gray-600 text-sm mt-1">Sende jedem Teilnehmer seinen persönlichen Link</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-christmas-green">{sentCount}</div>
              <div className="text-sm text-gray-600">von {totalCount}</div>
            </div>
            <div className="relative w-20 h-20">
              <svg className="transform -rotate-90 w-20 h-20">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-christmas-ice"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - sentCount / totalCount)}`}
                  className="text-christmas-green transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                {Math.round((sentCount / totalCount) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Participant List */}
        <div className="space-y-3">
          {participants.map((participant) => {
            const isSent = sentParticipants.has(participant.id)

            return (
              <div
                key={participant.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-xl border-2 transition-all ${
                  isSent
                    ? 'bg-christmas-green/5 border-christmas-green/30'
                    : participant.is_organizer
                    ? 'bg-gradient-to-r from-organizer-bg to-organizer-border/20 border-organizer-border'
                    : 'bg-gray-50 border-gray-200 hover:border-christmas-gold/50 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 mb-3 sm:mb-0">
                  {isSent && (
                    <div className="flex-shrink-0 w-10 h-10 bg-christmas-green rounded-full flex items-center justify-center animate-bounce-slow">
                      <span className="text-white text-xl font-bold">✓</span>
                    </div>
                  )}
                  {!isSent && (
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-xl">○</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg flex items-center gap-2 flex-wrap">
                      {participant.name}
                      {participant.is_organizer && (
                        <span className="inline-flex items-center gap-1 bg-christmas-gold/20 text-christmas-gold-dark px-3 py-1 rounded-full text-xs font-bold">
                          <span>👤</span>
                          <span>Du</span>
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <span>📱</span>
                      <span>{participant.phone_number}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSendWhatsApp(participant)}
                  disabled={isSent}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 text-base whitespace-nowrap ${
                    isSent
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-christmas-green to-christmas-green-light text-white hover:scale-105 hover:shadow-lg shadow-md'
                  }`}
                >
                  {isSent ? '✓ Gesendet' : '💬 WhatsApp öffnen'}
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
