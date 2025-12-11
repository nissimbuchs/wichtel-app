import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

const locales = ['de', 'fr', 'it', 'en'] as const
export type Locale = typeof locales[number]

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale parameter is valid
  if (!locales.includes(locale as Locale)) notFound()

  return {
    locale: locale as string,
    messages: (await import(`./locales/${locale}.json`)).default,
    timeZone: 'Europe/Zurich',
    now: new Date()
  }
})
