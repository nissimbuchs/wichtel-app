import { createClient } from './supabase/client'
import type { ParticipantAdmin } from '@/types/database.types'

/**
 * Generates a random derangement (permutation where no element appears in its original position)
 * This ensures nobody gets themselves in the Wichtel assignment
 */
function generateDerangement(participants: ParticipantAdmin[]): Map<string, string> {
  const n = participants.length

  if (n < 3) {
    throw new Error('Mindestens 3 Teilnehmer benötigt für die Auslosung')
  }

  const assignments = new Map<string, string>()
  const maxAttempts = 1000
  let attempts = 0

  while (attempts < maxAttempts) {
    attempts++

    // Fisher-Yates shuffle
    const shuffled = [...participants]
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // Check if valid derangement (nobody gets themselves)
    let isValid = true
    for (let i = 0; i < n; i++) {
      if (participants[i].id === shuffled[i].id) {
        isValid = false
        break
      }
    }

    if (isValid) {
      // Create assignments
      for (let i = 0; i < n; i++) {
        assignments.set(participants[i].id, shuffled[i].id)
      }
      return assignments
    }
  }

  throw new Error('Konnte keine gültige Zuteilung nach maximalen Versuchen generieren')
}

/**
 * Main draw function that performs the Wichtel assignment
 * Uses server-side API to bypass RLS policies
 */
export async function performDraw(
  sessionId: string,
  participants: ParticipantAdmin[]
): Promise<void> {
  if (participants.length < 3) {
    throw new Error('Mindestens 3 Teilnehmer benötigt für die Auslosung')
  }

  // Generate assignments
  const assignments = generateDerangement(participants)

  // Convert Map to array for API
  const assignmentsArray = Array.from(assignments.entries()).map(([giverId, receiverId]) => ({
    giverId,
    receiverId,
  }))

  // Call server-side API that uses SERVICE ROLE KEY (bypasses RLS)
  const response = await fetch('/api/draw', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      assignments: assignmentsArray,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Fehler beim Speichern der Zuteilungen')
  }
}
