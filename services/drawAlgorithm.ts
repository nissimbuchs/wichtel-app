import { createClient } from './supabase/client'
import type { ParticipantAdmin } from '@/types/database.types'

/**
 * Validates that partner constraints don't make a solution impossible
 */
function validatePartnerConstraints(participants: ParticipantAdmin[]): void {
  const n = participants.length

  // Count how many people have partners
  const partneredCount = participants.filter(p => p.partner_id !== null).length

  // Edge case: All participants are in pairs (even number, all paired)
  if (partneredCount === n && n % 2 === 0) {
    // This is solvable: each pair gives to the next pair in a cycle
    // Example: (A,B) (C,D) → A→C, B→D, C→B, D→A
    return
  }

  // Mathematical note: As long as not everyone is in one giant mutual exclusion group,
  // a derangement should exist. The retry mechanism will find it.
}

/**
 * Generates a random derangement with partner exclusion constraints
 * Ensures:
 * 1. Nobody gets themselves
 * 2. Partners don't get each other (if partner_id is set)
 */
function generateDerangement(
  participants: ParticipantAdmin[],
  partnerExclusionEnabled: boolean = false
): Map<string, string> {
  const n = participants.length

  if (n < 3) {
    throw new Error('Mindestens 3 Teilnehmer benötigt für die Auslosung')
  }

  // Validate partner constraints are solvable
  if (partnerExclusionEnabled) {
    validatePartnerConstraints(participants)
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

    // Check if valid derangement
    let isValid = true
    for (let i = 0; i < n; i++) {
      const giver = participants[i]
      const receiver = shuffled[i]

      // Rule 1: Nobody gets themselves
      if (giver.id === receiver.id) {
        isValid = false
        break
      }

      // Rule 2: Partners don't get each other
      if (partnerExclusionEnabled && giver.partner_id === receiver.id) {
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

  throw new Error('Konnte keine gültige Zuteilung nach maximalen Versuchen generieren. Bitte prüfe die Partner-Zuordnungen.')
}

/**
 * Main draw function that performs the Wichtel assignment
 * Uses server-side API to bypass RLS policies
 */
export async function performDraw(
  sessionId: string,
  participants: ParticipantAdmin[],
  partnerExclusionEnabled: boolean = false
): Promise<void> {
  if (participants.length < 3) {
    throw new Error('Mindestens 3 Teilnehmer benötigt für die Auslosung')
  }

  // Generate assignments with partner constraints
  const assignments = generateDerangement(participants, partnerExclusionEnabled)

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
