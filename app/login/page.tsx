'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { createClient } from '@/services/supabase/client'
import { Footer } from '@/components/layout/Footer'
import { WichtelIcon } from '@/components/icons/WichtelIcon'
import { useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'

function LoginForm() {
  const t = useTranslations('auth.login')
  const tErrors = useTranslations('auth.errors')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [browserName, setBrowserName] = useState('')
  const searchParams = useSearchParams()

  const supabase = createClient()

  // Detect browser name
  useEffect(() => {
    const userAgent = navigator.userAgent
    let browser = 'diesem Browser'

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browser = 'Chrome'
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari'
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox'
    } else if (userAgent.includes('Edg')) {
      browser = 'Edge'
    }

    setBrowserName(browser)
  }, [])

  useEffect(() => {
    // Check for auth error from callback
    const authError = searchParams.get('error')
    const errorDetails = searchParams.get('details')

    if (authError === 'auth_failed') {
      let errorMessage = tErrors('expiredLink')

      // Check for specific error types
      if (errorDetails) {
        const details = decodeURIComponent(errorDetails)
        if (details.includes('code verifier') || details.includes('code_verifier') || details.includes('validation_failed')) {
          errorMessage = tErrors('wrongBrowser', { browserName: browserName || tErrors('sameBrowser') })
        } else if (details.includes('expired')) {
          errorMessage = tErrors('expired')
        } else if (details.includes('invalid')) {
          errorMessage = tErrors('invalid')
        } else if (details.includes('already') || details.includes('used')) {
          errorMessage = tErrors('used')
        }
      }

      setError(errorMessage)
    }
  }, [searchParams, browserName, tErrors])

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
        data: {
          language: locale, // Store language in user metadata for email template
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage(t('successMessage', { browserName: browserName || t('thisBrowser') }))
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
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo-full.png"
              alt="Wichtel App"
              width={300}
              height={0}
              priority
              className="drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              style={{ height: 'auto', width: 'auto' }}
            />
          </div>
          <p className="text-gray-600 text-lg flex items-center justify-center gap-2">
            {t('subtitle')}
            <WichtelIcon name="gift" size={24} className="text-christmas-red" />
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              {t('emailLabel')}
              <WichtelIcon name="mail" size={16} />
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
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
                <span>{t('submittingButton')}</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <WichtelIcon name="sparkles" size={20} />
                <span>{t('submitButton')}</span>
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
              {t('infoText')}
            </p>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-christmas-red via-christmas-red-light to-christmas-gold">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
