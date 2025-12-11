'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/services/supabase/client'
import type { Session } from '@/types/database.types'
import { Footer } from '@/components/layout/Footer'
import { WichtelIcon } from '@/components/icons/WichtelIcon'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslations, useFormatter } from 'next-intl'

export default function AppPage() {
  const t = useTranslations('dashboard')
  const tStatus = useTranslations('common.status')
  const format = useFormatter()
  const { user, loading: authLoading, signOut } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && user) {
      loadSessions()
    }
  }, [authLoading, user, showArchived])

  async function loadSessions() {
    const query = supabase
      .from('sessions')
      .select('*')
      .eq('organizer_id', user!.id)
      .order('created_at', { ascending: false })

    // Filter by archived status
    if (!showArchived) {
      query.neq('status', 'archived')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading sessions:', error)
    } else {
      setSessions(data || [])
    }
    setLoading(false)
  }

  async function createNewSession() {
    router.push('/app/session/new')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-christmas-snow to-christmas-ice">
        <div className="text-center">
          <motion.div
            layoutId="wichtel-logo"
            className="mx-auto mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/logo-icon.png"
              alt="Wichtel App"
              width={80}
              height={80}
              className="animate-bounce-slow drop-shadow-lg"
            />
          </motion.div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-christmas-red border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-700 text-xl font-medium">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-christmas-snow via-white to-christmas-ice">
      <header className="relative bg-gradient-to-r from-christmas-red/90 to-christmas-red-light/90 backdrop-blur-lg shadow-frost-lg border-b border-white/20">
        <div className="texture-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center relative z-10">
          <div>
            <motion.div
              layoutId="wichtel-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/logo-full.png"
                alt="Wichtel App"
                width={80}
                height={80}
                className="drop-shadow-lg mb-2"
              />
            </motion.div>
            <p className="text-sm text-white/90 font-medium">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="glass-button px-6 py-3 rounded-xl text-white hover:text-white font-semibold"
          >
            {t('logout')}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{t('title')}</h2>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              {t('subtitle')}
              <WichtelIcon name="gift" size={20} className="text-christmas-red" />
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`w-full sm:w-auto px-6 py-4 rounded-xl font-bold transition-all duration-300 text-base shadow-md flex items-center justify-center gap-2 ${
                showArchived
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'glass-button text-gray-700 hover:text-christmas-red'
              }`}
            >
              {showArchived ? (
                <>
                  <WichtelIcon name="list" size={20} />
                  {t('showActive')}
                </>
              ) : (
                <>
                  <WichtelIcon name="archive" size={20} />
                  {t('showArchive')}
                </>
              )}
            </button>
            <button
              onClick={createNewSession}
              className="w-full sm:w-auto bg-gradient-to-br from-christmas-red via-christmas-red to-christmas-red-dark text-white px-8 py-4 rounded-xl font-bold shadow-frost-lg hover:shadow-glow-red hover:scale-105 transition-all duration-300 text-lg border border-white/20"
            >
              {t('newSession')}
            </button>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl hover:shadow-frost-lg hover:scale-105 transition-all duration-300">
            <WichtelIcon
              name={showArchived ? "archive" : "gift"}
              size={96}
              className={`mx-auto mb-6 text-christmas-red ${!showArchived ? 'animate-wiggle' : 'animate-pulse-slow'}`}
            />
            <p className="text-gray-900 text-2xl font-bold mb-3">
              {showArchived ? t('empty.archived.title') : t('empty.active.title')}
            </p>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              {showArchived ? t('empty.archived.description') : t('empty.active.description')}
            </p>
            <button
              onClick={createNewSession}
              className="bg-gradient-to-br from-christmas-red via-christmas-red to-christmas-red-dark text-white px-10 py-4 rounded-xl font-bold shadow-frost-lg hover:shadow-glow-red hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 text-xl border border-white/20"
            >
              <WichtelIcon name="sparkles" size={24} />
              {t('empty.active.action')}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => router.push(`/app/session/${session.id}`)}
                className="glass-card p-7 rounded-2xl hover:shadow-frost-lg hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-christmas-red transition-colors">
                      {session.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <WichtelIcon name="calendar" size={16} />
                      {format.dateTime(new Date(session.created_at), {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 ${
                      session.status === 'archived'
                        ? 'bg-gray-500 text-white'
                        : session.status === 'drawn'
                        ? 'bg-gradient-to-r from-christmas-green to-christmas-green-light text-white'
                        : session.status === 'completed'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-gradient-to-r from-christmas-gold to-christmas-gold-light text-white'
                    }`}
                  >
                    {session.status === 'archived' ? (
                      <>
                        <WichtelIcon name="archive" size={16} />
                        {tStatus('archived')}
                      </>
                    ) : session.status === 'planning' ? (
                      <>
                        <WichtelIcon name="edit" size={16} />
                        {tStatus('planning')}
                      </>
                    ) : session.status === 'drawn' ? (
                      <>
                        <WichtelIcon name="dices" size={16} />
                        {tStatus('drawn')}
                      </>
                    ) : (
                      <>
                        <WichtelIcon name="check" size={16} />
                        {tStatus('completed')}
                      </>
                    )}
                  </span>
                  <span className="group-hover:scale-125 transition-transform">
                    {session.status === 'archived' ? (
                      <WichtelIcon name="archive" size={32} className="text-gray-500" />
                    ) : session.status === 'planning' ? (
                      <WichtelIcon name="tree" size={32} className="text-christmas-red" />
                    ) : session.status === 'drawn' ? (
                      <WichtelIcon name="gift" size={32} className="text-christmas-green" />
                    ) : (
                      <WichtelIcon name="check-circle" size={32} className="text-blue-500" />
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
