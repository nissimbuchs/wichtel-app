import type { ParticipantAdmin } from '@/types/database.types'
import { normalizePhoneNumber } from './phoneValidation'

/**
 * Generates a WhatsApp deep link with pre-filled message
 * Format: https://wa.me/{phone}?text={encoded_message}
 */
export function generateWhatsAppUrl(
  participant: ParticipantAdmin,
  assignmentUrl: string,
  sessionName?: string
): string {
  const message = `Hallo ${participant.name}! 🎄

Hier ist dein Link für ${sessionName || 'unser Wichteln'}:
${assignmentUrl}

Öffne den Link, um zu sehen, wen du beschenkst! 🎁`

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
