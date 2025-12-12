import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

export const locales = ['de', 'fr', 'it', 'en'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'de'

// Get locale from cookie or browser language
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value

  // Return cookie locale if valid
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale
  }

  // Try to get browser language from Accept-Language header
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language')

  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "de-DE,de;q=0.9,en;q=0.8")
    const browserLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase()
    if (locales.includes(browserLang as Locale)) {
      return browserLang as Locale
    }
  }

  // Default to German
  return defaultLocale
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from cookie/browser
  let locale = await requestLocale

  if (!locale || !locales.includes(locale as Locale)) {
    locale = await getLocale()
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
    timeZone: 'Europe/Zurich',
    now: new Date()
  }
})
