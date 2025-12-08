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

  // Format phone number for WhatsApp
  let phone = participant.phone_number.replace(/[^0-9]/g, '')

  // If Swiss number starting with 0, replace with 41
  if (phone.startsWith('0')) {
    phone = '41' + phone.substring(1)
  }

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
