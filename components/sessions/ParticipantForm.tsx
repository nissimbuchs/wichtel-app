'use client'

import { useState } from 'react'

interface ParticipantFormProps {
  onAdd: (name: string, phoneNumber: string, isOrganizer: boolean) => Promise<void>
  disabled?: boolean
  hasOrganizer?: boolean
}

export function ParticipantForm({ onAdd, disabled, hasOrganizer }: ParticipantFormProps) {
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isOrganizer, setIsOrganizer] = useState(false)
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

      // Phone number validation (basic)
      const phoneRegex = /^[+]?[0-9\s()-]{8,}$/
      if (!phoneRegex.test(phoneNumber)) {
        throw new Error('Ungültige Telefonnummer')
      }

      await onAdd(name.trim(), phoneNumber.trim(), isOrganizer)

      // Clear form
      setName('')
      setPhoneNumber('')
      setIsOrganizer(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen')
    } finally {
      setLoading(false)
    }
  }

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
          Format: +41 oder 0041 oder Schweizer Nummer (079 123 45 67)
        </p>
      </div>

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
            <span className="block text-sm font-bold text-gray-900">
              🎅 Ich bin der Organisator
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
        className="w-full bg-christmas-red text-white py-2 rounded-lg font-semibold hover:bg-christmas-red-light transition disabled:opacity-50 disabled:cursor-not-allowed"
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
