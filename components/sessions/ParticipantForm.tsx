'use client'

import { useState } from 'react'
import { WichtelIcon } from '@/components/icons/WichtelIcon'
import type { ParticipantAdmin } from '@/types/database.types'
import { isValidPhoneNumber, normalizePhoneNumber } from '@/services/phoneValidation'

interface ParticipantFormProps {
  onAdd: (name: string, phoneNumber: string, isOrganizer: boolean, partnerId?: string | null) => Promise<void>
  disabled?: boolean
  hasOrganizer?: boolean
  partnerExclusionEnabled?: boolean
  existingParticipants?: ParticipantAdmin[]
}

export function ParticipantForm({
  onAdd,
  disabled,
  hasOrganizer,
  partnerExclusionEnabled = false,
  existingParticipants = []
}: ParticipantFormProps) {
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [partnerId, setPartnerId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Basic validation
      if (!name.trim()) {
        throw new Error('Name ist erforderlich')
      }
      if (!phoneNumber.trim()) {
        throw new Error('Telefonnummer ist erforderlich')
      }

      // International phone number validation
      if (!isValidPhoneNumber(phoneNumber)) {
        throw new Error('Ungültige Telefonnummer. Bitte gib eine internationale Nummer ein (z.B. +41 79 123 45 67)')
      }

      // Duplicate phone number check (normalize for comparison)
      const normalizedPhone = normalizePhoneNumber(phoneNumber)
      const existingParticipant = existingParticipants.find(
        p => normalizePhoneNumber(p.phone_number) === normalizedPhone
      )
      if (existingParticipant) {
        throw new Error(`Telefonnummer bereits verwendet von: ${existingParticipant.name}`)
      }

      // Partner validation (defensive check, though UI prevents self-selection)
      // Note: Self-assignment is structurally impossible when adding NEW participants
      // since they don't exist in availablePartners yet. DB constraint provides backend protection.
      if (partnerId && partnerExclusionEnabled) {
        const selectedPartner = existingParticipants.find(p => p.id === partnerId)
        if (selectedPartner && normalizePhoneNumber(selectedPartner.phone_number) === normalizedPhone) {
          throw new Error('Du kannst dich nicht selbst als Partner auswählen')
        }
      }

      await onAdd(name.trim(), phoneNumber.trim(), isOrganizer, partnerId || null)

      // Clear form
      setName('')
      setPhoneNumber('')
      setIsOrganizer(false)
      setPartnerId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen')
    } finally {
      setLoading(false)
    }
  }

  // Filter out already-partnered participants
  const availablePartners = existingParticipants.filter(p => !p.partner_id)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Max Mustermann"
          disabled={disabled || loading}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-red focus:border-transparent disabled:bg-gray-100"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Telefonnummer *
        </label>
        <input
          id="phone"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+41 79 123 45 67"
          disabled={disabled || loading}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-red focus:border-transparent disabled:bg-gray-100"
        />
        <p className="mt-1 text-xs text-gray-500">
          Format: Schweizer Nummern (079...) oder internationale mit Ländercode (+41, +49, +1, etc.)
        </p>
      </div>

      {/* Partner Selection */}
      {partnerExclusionEnabled && availablePartners.length > 0 && (
        <div>
          <label htmlFor="partner" className="block text-sm font-medium text-gray-700 mb-1">
            Partner (optional)
          </label>
          <select
            id="partner"
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            disabled={disabled || loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-red focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">Kein Partner</option>
            {availablePartners.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Wähle einen Partner aus, der nicht zugelost werden soll.
          </p>
        </div>
      )}

      {/* Organizer Checkbox */}
      {!hasOrganizer && (
        <div className="flex items-start gap-3 p-4 bg-christmas-gold/10 rounded-lg border-2 border-christmas-gold/30">
          <input
            id="isOrganizer"
            type="checkbox"
            checked={isOrganizer}
            onChange={(e) => setIsOrganizer(e.target.checked)}
            disabled={disabled || loading}
            className="mt-1 h-5 w-5 text-christmas-gold focus:ring-christmas-gold border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="isOrganizer" className="flex-1 cursor-pointer">
            <span className="block text-sm font-bold text-gray-900 flex items-center gap-2">
              <WichtelIcon name="user-check" size={16} />
              Ich bin der Organisator
            </span>
            <span className="block text-xs text-gray-600 mt-1">
              Als Organisator erhältst du einen direkten Link zu deiner Zuteilung (kein WhatsApp nötig)
            </span>
          </label>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={disabled || loading}
        className="w-full bg-gradient-to-br from-christmas-red via-christmas-red to-christmas-red-dark text-white py-2 rounded-lg font-semibold shadow-frost-lg hover:shadow-glow-red hover:scale-105 transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? 'Wird hinzugefügt...' : '+ Hinzufügen'}
      </button>

      {disabled && (
        <p className="text-sm text-gray-500 text-center">
          Nach der Auslosung können keine Teilnehmer mehr hinzugefügt werden.
        </p>
      )}
    </form>
  )
}
