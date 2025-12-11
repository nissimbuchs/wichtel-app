import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { SnowfallBackground } from '@/components/effects/SnowfallBackground'
import '../globals.css'

const locales = ['de', 'fr', 'it', 'en']

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  // Validate locale
  if (!locales.includes(locale)) notFound()

  // Load messages for the current locale
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SnowfallBackground />
          <div className="relative z-10">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
