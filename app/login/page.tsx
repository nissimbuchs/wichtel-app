'use client'

import { useState } from 'react'
import { createClient } from '@/services/supabase/client'
import { Footer } from '@/components/layout/Footer'

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-christmas-red via-christmas-red-light to-christmas-gold">
    <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative snowflakes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl animate-pulse-slow">❄️</div>
        <div className="absolute top-32 right-20 text-5xl animate-bounce-slow">❄️</div>
        <div className="absolute bottom-20 left-32 text-7xl animate-wiggle">⭐</div>
        <div className="absolute bottom-32 right-10 text-6xl animate-pulse-slow">✨</div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-12 max-w-md w-full relative z-10 border-4 border-white/30">
        <div className="text-center mb-10">
          <div className="text-7xl mb-4 animate-bounce-slow">🎄</div>
          <h1 className="text-5xl font-bold text-christmas-red mb-3 drop-shadow-lg">Wichtel App</h1>
          <p className="text-gray-600 text-lg">Organisiere dein Wichteln in unter 5 Minuten! 🎁</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-3">
              E-Mail-Adresse ✉️
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              required
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-christmas-red/30 focus:border-christmas-red transition-all text-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-christmas-red to-christmas-red-light text-white py-4 rounded-xl font-bold text-lg hover:scale-105 hover:shadow-christmas transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-bounce">🎅</span>
                <span>Wird gesendet...</span>
              </span>
            ) : (
              'Magic Link senden 🪄'
            )}
          </button>
        </form>

        {message && (
          <div className="mt-6 p-5 bg-gradient-to-r from-christmas-green-light/20 to-christmas-green/20 border-2 border-christmas-green rounded-xl text-christmas-green-dark text-base font-medium animate-pulse-slow">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <span>{message}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-5 bg-red-50 border-2 border-red-300 rounded-xl text-red-800 text-base font-medium">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="inline-block bg-gradient-to-r from-christmas-gold/20 to-christmas-gold-light/20 border-2 border-christmas-gold/30 rounded-xl p-4">
            <p className="text-sm text-gray-700 font-medium">
              <span className="text-xl mr-2">🔐</span>
              Kein Passwort nötig! Wir senden dir einen sicheren Login-Link per E-Mail.
            </p>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  )
}
