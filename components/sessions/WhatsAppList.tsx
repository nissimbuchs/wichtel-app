'use client'

import { useState, useEffect } from 'react'
import type { ParticipantAdmin } from '@/types/database.types'
import { generateWhatsAppUrl, openWhatsApp } from '@/services/whatsappService'
import { createClient } from '@/services/supabase/client'
import { CompletionModal } from './CompletionModal'
import { WichtelIcon } from '@/components/icons/WichtelIcon'

interface WhatsAppListProps {
  sessionId: string
  sessionName: string
  participants: ParticipantAdmin[]
  onUpdate: () => void
}

export function WhatsAppList({ sessionId, sessionName, participants, onUpdate }: WhatsAppListProps) {
  const [sentParticipants, setSentParticipants] = useState<Set<string>>(new Set())
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
    // Organizers use the info-box link instead
    if (participant.is_organizer) {
      return
    }

    await sendWhatsApp(participant)
  }

  async function sendWhatsApp(participant: ParticipantAdmin) {
    const url = generateWhatsAppUrl(
      participant,
      `${window.location.origin}/reveal/${participant.participant_token}`,
      sessionName
    )

    openWhatsApp(url)

    // Mark as sent
    await markAsSent(participant.id)
  }

  async function handleOrganizerRevealClick(participant: ParticipantAdmin) {
    const revealUrl = `${window.location.origin}/reveal/${participant.participant_token}`
    window.open(revealUrl, '_blank')
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

  const sentCount = sentParticipants.size
  const viewedCount = participants.filter(p => p.reveal_viewed_at !== null).length
  const totalCount = participants.length
  const organizer = participants.find((p) => p.is_organizer)

  return (
    <div className="space-y-6">
      {/* Organizer Info-Box */}
      {organizer && (
        <div className="glass-card rounded-2xl p-8 hover:shadow-frost-lg transition-all duration-300 border-2 border-christmas-gold/50">
          <div className="flex items-start gap-4">
            <WichtelIcon name="user-check" size={48} className="text-christmas-gold-dark flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                Deine persönliche Zuteilung
              </h3>
              <p className="text-gray-700 mb-4 text-base leading-relaxed">
                Als Organisator kannst du hier direkt deine Zuteilung sehen, ohne WhatsApp zu verwenden.
              </p>
              <button
                onClick={() => handleOrganizerRevealClick(organizer)}
                className="px-6 py-3 bg-gradient-to-br from-christmas-gold via-christmas-gold to-christmas-gold-dark text-white rounded-xl font-bold text-base shadow-frost-lg hover:shadow-glow-gold hover:scale-105 transition-all duration-300 border border-white/20 flex items-center gap-2"
              >
                <WichtelIcon name="gift" size={20} />
                <span>Meine Zuteilung anzeigen</span>
              </button>
              <p className="text-sm text-gray-600 mt-3 font-medium flex items-center gap-2">
                <WichtelIcon name="lightbulb" size={16} />
                Hinweis: Dieser Link ist nur für dich!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl p-8 hover:shadow-frost-lg transition-all duration-300">
        {/* Header with Progress */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <WichtelIcon name="message-square" size={48} className="text-christmas-green" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900">WhatsApp versenden</h2>
              <p className="text-gray-600 text-sm mt-1">Sende jedem Teilnehmer seinen persönlichen Link</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Versendet Counter */}
            <div className="text-right">
              <div className="text-xl font-bold text-blue-600">{sentCount}</div>
              <div className="text-xs text-gray-600">Versendet</div>
            </div>
            {/* Abgerufen Counter */}
            <div className="text-right">
              <div className="text-xl font-bold text-green-600">{viewedCount}</div>
              <div className="text-xs text-gray-600">Abgerufen</div>
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
            const isViewed = participant.reveal_viewed_at !== null

            return (
              <div
                key={participant.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-xl border-2 transition-all ${
                  isViewed
                    ? 'bg-green-50 border-green-300'
                    : isSent
                    ? 'bg-blue-50 border-blue-300'
                    : participant.is_organizer
                    ? 'bg-gradient-to-r from-organizer-bg to-organizer-border/20 border-organizer-border'
                    : 'bg-gray-50 border-gray-200 hover:border-christmas-gold/50 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 mb-3 sm:mb-0">
                  {isViewed ? (
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce-slow">
                      <WichtelIcon name="check-circle" size={20} className="text-white font-bold" />
                    </div>
                  ) : isSent ? (
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <WichtelIcon name="check" size={20} className="text-white font-bold" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-xl">○</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg flex items-center gap-2 flex-wrap">
                      {participant.name}
                      {participant.is_organizer && (
                        <span className="inline-flex items-center gap-1 bg-christmas-gold/20 text-christmas-gold-dark px-3 py-1 rounded-full text-xs font-bold">
                          <WichtelIcon name="user" size={14} />
                          <span>Du</span>
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <WichtelIcon name="smartphone" size={14} />
                      <span>{participant.phone_number}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSendWhatsApp(participant)}
                  disabled={isSent || participant.is_organizer}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 text-base whitespace-nowrap flex items-center gap-2 ${
                    isViewed
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : isSent
                      ? 'bg-blue-100 text-blue-700 cursor-default'
                      : participant.is_organizer
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-br from-christmas-green via-christmas-green to-christmas-green-dark text-white shadow-frost-lg hover:shadow-glow-green hover:scale-105 border border-white/20'
                  }`}
                >
                  {isViewed ? (
                    <>
                      <WichtelIcon name="check-circle" size={16} />
                      Abgerufen
                    </>
                  ) : isSent ? (
                    <>
                      <WichtelIcon name="check" size={16} />
                      Versendet
                    </>
                  ) : participant.is_organizer ? (
                    <>
                      <WichtelIcon name="check" size={16} />
                      Link verfügbar
                    </>
                  ) : (
                    <>
                      <WichtelIcon name="message-square" size={16} />
                      WhatsApp öffnen
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {showCompletionModal && (
        <CompletionModal onClose={() => setShowCompletionModal(false)} />
      )}
    </div>
  )
}
