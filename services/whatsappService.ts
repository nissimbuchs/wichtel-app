import type { ParticipantAdmin } from '@/types/database.types'
import { normalizePhoneNumber } from './phoneValidation'

// Import translation messages
import deMessages from '@/locales/de.json'
import frMessages from '@/locales/fr.json'
import itMessages from '@/locales/it.json'
import enMessages from '@/locales/en.json'

type Locale = 'de' | 'fr' | 'it' | 'en'

const messages = {
  de: deMessages,
  fr: frMessages,
  it: itMessages,
  en: enMessages,
}

/**
 * Formats a WhatsApp message with interpolated values
 */
function formatMessage(
  template: string,
  values: Record<string, string>
): string {
  let result = template
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }
  return result
}

/**
 * Generates a WhatsApp deep link with pre-filled message
 * Format: https://wa.me/{phone}?text={encoded_message}
 */
export function generateWhatsAppUrl(
  participant: ParticipantAdmin,
  assignmentUrl: string,
  sessionName?: string,
  locale: Locale = 'de'
): string {
  // Get the message template for the locale
  const messageTemplate = messages[locale].whatsapp.message

  // Format the message with interpolated values
  const message = formatMessage(messageTemplate, {
    name: participant.name,
    sessionName: sessionName || messages[locale].whatsapp.message.split('\n')[0], // fallback
    assignmentUrl,
  })

  // Normalize phone number for WhatsApp (international E.164 format)
  // Supports worldwide phone numbers with automatic country code detection
  const phone = normalizePhoneNumber(participant.phone_number)

  // URL encode the message
  const encodedMessage = encodeURIComponent(message)

  // Use https://api.whatsapp.com for better mobile compatibility
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`
}

/**
 * Opens WhatsApp URL (works on mobile and desktop)
 */
export function openWhatsApp(url: string): void {
  window.open(url, '_blank')
}
