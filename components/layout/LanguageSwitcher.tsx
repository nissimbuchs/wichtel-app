'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { type Locale } from '@/i18n'
import { useState, useTransition } from 'react'
import { WichtelIcon } from '@/components/icons/WichtelIcon'

const LANGUAGES = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
] as const

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = LANGUAGES.find(lang => lang.code === locale) || LANGUAGES[0]

  function changeLanguage(newLocale: Locale) {
    setIsOpen(false)

    // Set cookie and refresh
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="relative z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="glass-button px-4 py-2 rounded-lg text-white hover:text-white font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
        aria-label="Change language"
      >
        <span className="text-2xl">{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.label}</span>
        <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown - use fixed positioning to escape header bounds */}
          <div className="fixed sm:absolute right-3 sm:right-0 top-[70px] sm:top-auto sm:mt-2 w-44 sm:w-48 bg-white rounded-xl shadow-frost-lg border-2 border-white/20 overflow-hidden z-[100] max-h-[60vh] overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code as Locale)}
                disabled={locale === lang.code || isPending}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left flex items-center gap-2 sm:gap-3 transition-all text-sm sm:text-base ${
                  locale === lang.code
                    ? 'bg-christmas-red text-white font-bold'
                    : 'hover:bg-christmas-ice text-gray-800 hover:text-christmas-red'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-xl sm:text-2xl">{lang.flag}</span>
                <span>{lang.label}</span>
                {locale === lang.code && (
                  <WichtelIcon name="check" size={14} className="ml-auto" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
