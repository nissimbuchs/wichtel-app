'use client'

import { useState } from 'react'
import { createClient } from '@/services/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Prüfe deine E-Mails! Wir haben dir einen Magic Link geschickt. 📧')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-christmas-red to-christmas-red-light">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-christmas-red mb-2">🎄 Wichtel App</h1>
          <p className="text-gray-600">Organisiere dein Wichteln in unter 5 Minuten</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-Mail-Adresse
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-red focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-christmas-red text-white py-3 rounded-lg font-semibold hover:bg-christmas-red-light transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Wird gesendet...' : 'Magic Link senden 🪄'}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Kein Passwort nötig! Wir senden dir einen sicheren Login-Link per E-Mail.</p>
        </div>
      </div>
    </div>
  )
}
