import type { ParticipantAdmin } from '@/types/database.types'

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

  // Remove + from phone number and format for WhatsApp
  const phone = participant.phone_number.replace(/[^0-9]/g, '')

  // URL encode the message
  const encodedMessage = encodeURIComponent(message)

  return `https://wa.me/${phone}?text=${encodedMessage}`
}

/**
 * Opens WhatsApp URL (works on mobile and desktop)
 */
export function openWhatsApp(url: string): void {
  window.open(url, '_blank')
}
