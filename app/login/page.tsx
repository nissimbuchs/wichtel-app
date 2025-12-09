'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/services/supabase/client'
import { Footer } from '@/components/layout/Footer'
import { WichtelIcon } from '@/components/icons/WichtelIcon'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const searchParams = useSearchParams()

  const supabase = createClient()

  useEffect(() => {
    // Check for auth error from callback
    const authError = searchParams.get('error')
    const errorDetails = searchParams.get('details')

    if (authError === 'auth_failed') {
      let errorMessage = 'Der Login-Link ist abgelaufen oder ungültig. Bitte fordere einen neuen Link an.'

      // Check for specific error types
      if (errorDetails) {
        const details = decodeURIComponent(errorDetails)
        if (details.includes('expired')) {
          errorMessage = 'Der Login-Link ist abgelaufen. Bitte fordere einen neuen Link an.'
        } else if (details.includes('invalid')) {
          errorMessage = 'Der Login-Link ist ungültig. Bitte fordere einen neuen Link an.'
        } else if (details.includes('already') || details.includes('used')) {
          errorMessage = 'Dieser Login-Link wurde bereits verwendet. Bitte fordere einen neuen Link an.'
        }
      }

      setError(errorMessage)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Prüfe deine E-Mails! Wir haben dir einen Magic Link geschickt. Der Link ist 10 Minuten gültig.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-christmas-red via-christmas-red-light to-christmas-gold">
    <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative snowflakes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 animate-pulse-slow">
          <WichtelIcon name="snowflake" size={60} className="text-white" />
        </div>
        <div className="absolute top-32 right-20 animate-bounce-slow">
          <WichtelIcon name="snowflake" size={50} className="text-white" />
        </div>
        <div className="absolute bottom-20 left-32 animate-wiggle">
          <WichtelIcon name="star" size={70} className="text-white" />
        </div>
        <div className="absolute bottom-32 right-10 animate-pulse-slow">
          <WichtelIcon name="sparkles" size={60} className="text-white" />
        </div>
      </div>

      <div className="glass-card-strong rounded-3xl p-10 md:p-12 max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="mb-4 flex justify-center animate-bounce-slow">
            <WichtelIcon name="tree" size={70} className="text-christmas-green" />
          </div>
          <h1 className="text-5xl font-bold text-christmas-red mb-3 drop-shadow-lg">Wichtel App</h1>
          <p className="text-gray-600 text-lg flex items-center justify-center gap-2">
            Organisiere dein Wichteln in unter 5 Minuten!
            <WichtelIcon name="gift" size={24} className="text-christmas-red" />
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              E-Mail-Adresse
              <WichtelIcon name="mail" size={16} />
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
            className="w-full bg-gradient-to-br from-christmas-red via-christmas-red to-christmas-red-dark text-white py-4 rounded-xl font-bold text-lg shadow-frost-lg hover:shadow-glow-red hover:scale-105 transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <WichtelIcon name="user-check" size={20} className="animate-bounce" />
                <span>Wird gesendet...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <WichtelIcon name="sparkles" size={20} />
                <span>Magic Link senden</span>
              </span>
            )}
          </button>
        </form>

        {message && (
          <div className="mt-6 p-5 bg-gradient-to-r from-christmas-green-light/20 to-christmas-green/20 border-2 border-christmas-green rounded-xl text-christmas-green-dark text-base font-medium animate-pulse-slow">
            <div className="flex items-start gap-3">
              <WichtelIcon name="check-circle" size={24} className="flex-shrink-0" />
              <span>{message}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-5 bg-red-50 border-2 border-red-300 rounded-xl text-red-800 text-base font-medium">
            <div className="flex items-start gap-3">
              <WichtelIcon name="alert-triangle" size={24} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="inline-block bg-gradient-to-r from-christmas-gold/20 to-christmas-gold-light/20 border-2 border-christmas-gold/30 rounded-xl p-4">
            <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
              <WichtelIcon name="lock" size={20} />
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
