'use client'

import { useState } from 'react'

interface ParticipantFormProps {
  onAdd: (name: string, phoneNumber: string) => Promise<void>
  disabled?: boolean
}

export function ParticipantForm({ onAdd, disabled }: ParticipantFormProps) {
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
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

      await onAdd(name.trim(), phoneNumber.trim())

      // Clear form
      setName('')
      setPhoneNumber('')
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
          placeholder="+49 170 1234567"
          disabled={disabled || loading}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-red focus:border-transparent disabled:bg-gray-100"
        />
        <p className="mt-1 text-xs text-gray-500">
          Format: +49 oder 0049 oder deutsche Nummer
        </p>
      </div>

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
