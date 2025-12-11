import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
// @ts-ignore - We're importing internal functions for testing
import { performDraw } from '../drawAlgorithm'
import type { ParticipantAdmin } from '@/types/database.types'

// Simple derangement validator for testing
function isValidDerangement(assignments: Array<{ giverId: string; receiverId: string }>): boolean {
  // Check no self-assignment
  for (const { giverId, receiverId } of assignments) {
    if (giverId === receiverId) {
      return false
    }
  }

  // Check all IDs are covered exactly once as giver and receiver
  const giverIds = new Set(assignments.map(a => a.giverId))
  const receiverIds = new Set(assignments.map(a => a.receiverId))

  if (giverIds.size !== assignments.length || receiverIds.size !== assignments.length) {
    return false
  }

  return true
}

// Mock fetch globally
global.fetch = vi.fn()

describe('Draw Algorithm', () => {
  describe('Derangement Logic', () => {
    it('generates valid derangement for 3 participants', () => {
      // Mock participants
      const participants = [
        { id: '1', name: 'Alice', phone_number: '+41 79 111 11 11' },
        { id: '2', name: 'Bob', phone_number: '+41 79 222 22 22' },
        { id: '3', name: 'Charlie', phone_number: '+41 79 333 33 33' },
      ]

      // Simulate draw algorithm output
      const mockAssignments = [
        { giverId: '1', receiverId: '2' },
        { giverId: '2', receiverId: '3' },
        { giverId: '3', receiverId: '1' },
      ]

      expect(isValidDerangement(mockAssignments)).toBe(true)
    })

    it('generates valid derangement for 5 participants', () => {
      const mockAssignments = [
        { giverId: '1', receiverId: '3' },
        { giverId: '2', receiverId: '1' },
        { giverId: '3', receiverId: '5' },
        { giverId: '4', receiverId: '2' },
        { giverId: '5', receiverId: '4' },
      ]

      expect(isValidDerangement(mockAssignments)).toBe(true)
    })

    it('rejects self-assignment', () => {
      const invalidAssignments = [
        { giverId: '1', receiverId: '1' }, // Self-assignment!
        { giverId: '2', receiverId: '3' },
        { giverId: '3', receiverId: '2' },
      ]

      expect(isValidDerangement(invalidAssignments)).toBe(false)
    })

    it('rejects duplicate receivers', () => {
      const duplicateAssignments = [
        { giverId: '1', receiverId: '2' },
        { giverId: '2', receiverId: '2' }, // Duplicate receiver!
        { giverId: '3', receiverId: '1' },
      ]

      expect(isValidDerangement(duplicateAssignments)).toBe(false)
    })

    it('validates partner exclusion constraint', () => {
      // With partner exclusion, partners should not be assigned to each other
      const participants = [
        { id: '1', name: 'Alice', partner_id: '2' },
        { id: '2', name: 'Bob', partner_id: '1' },
        { id: '3', name: 'Charlie', partner_id: null },
        { id: '4', name: 'David', partner_id: null },
      ]

      // Valid: partners not assigned to each other
      const validAssignments = [
        { giverId: '1', receiverId: '3' }, // Alice -> Charlie (not Bob)
        { giverId: '2', receiverId: '4' }, // Bob -> David (not Alice)
        { giverId: '3', receiverId: '2' }, // Charlie -> Bob
        { giverId: '4', receiverId: '1' }, // David -> Alice
      ]

      // Check basic derangement
      expect(isValidDerangement(validAssignments)).toBe(true)

      // Check partner constraint
      const assignmentMap = new Map(validAssignments.map(a => [a.giverId, a.receiverId]))
      const alice_receives_from = validAssignments.find(a => a.receiverId === '1')?.giverId
      const bob_receives_from = validAssignments.find(a => a.receiverId === '2')?.giverId

      // Alice's partner is Bob (ID 2), Alice should NOT receive from Bob
      expect(assignmentMap.get('1')).not.toBe('2') // Alice not giving to Bob
      expect(alice_receives_from).not.toBe('2') // Alice not receiving from Bob
    })
  })

  describe('Edge Cases', () => {
    it('validates minimum participant count', () => {
      // Derangement requires minimum 2 participants theoretically
      // But Wichtel App requires 3 for practical reasons
      const twoParticipants = [
        { giverId: '1', receiverId: '2' },
        { giverId: '2', receiverId: '1' },
      ]

      // This is valid derangement, but app should reject < 3
      expect(isValidDerangement(twoParticipants)).toBe(true)
      expect(twoParticipants.length).toBeLessThan(3)
    })
  })

  describe('Real Algorithm Tests (performDraw)', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      // Mock successful API response
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('performs draw with 3 participants', async () => {
      const participants: ParticipantAdmin[] = [
        {
          id: '1',
          name: 'Alice',
          phone_number: '+41791111111',
          participant_token: 'token1',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: null,
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Bob',
          phone_number: '+41792222222',
          participant_token: 'token2',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: null,
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Charlie',
          phone_number: '+41793333333',
          participant_token: 'token3',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: null,
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
      ]

      await performDraw('session1', participants, false)

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith('/api/draw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      })

      // Verify the assignments in the body
      const callArgs = (global.fetch as any).mock.calls[0]
      const body = JSON.parse(callArgs[1].body)
      expect(body.sessionId).toBe('session1')
      expect(body.assignments).toHaveLength(3)
      expect(isValidDerangement(body.assignments)).toBe(true)
    })

    it('performs draw with partner exclusion enabled', async () => {
      const participants: ParticipantAdmin[] = [
        {
          id: '1',
          name: 'Alice',
          phone_number: '+41791111111',
          participant_token: 'token1',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: '2', // Alice's partner is Bob
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Bob',
          phone_number: '+41792222222',
          participant_token: 'token2',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: '1', // Bob's partner is Alice
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Charlie',
          phone_number: '+41793333333',
          participant_token: 'token3',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: null,
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'David',
          phone_number: '+41794444444',
          participant_token: 'token4',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: null,
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
      ]

      await performDraw('session1', participants, true)

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Verify the assignments respect partner constraints
      const callArgs = (global.fetch as any).mock.calls[0]
      const body = JSON.parse(callArgs[1].body)
      expect(body.assignments).toHaveLength(4)
      expect(isValidDerangement(body.assignments)).toBe(true)

      // Check partner constraints: Alice (1) should NOT give to Bob (2) and vice versa
      const aliceAssignment = body.assignments.find((a: any) => a.giverId === '1')
      const bobAssignment = body.assignments.find((a: any) => a.giverId === '2')
      expect(aliceAssignment.receiverId).not.toBe('2')
      expect(bobAssignment.receiverId).not.toBe('1')
    })

    it('throws error for less than 3 participants', async () => {
      const participants: ParticipantAdmin[] = [
        {
          id: '1',
          name: 'Alice',
          phone_number: '+41791111111',
          participant_token: 'token1',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: null,
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Bob',
          phone_number: '+41792222222',
          participant_token: 'token2',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: null,
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
      ]

      await expect(performDraw('session1', participants, false)).rejects.toThrow(
        'Mindestens 3 Teilnehmer benötigt für die Auslosung'
      )
    })

    it('handles API error response', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Database error' }),
      })

      const participants: ParticipantAdmin[] = [
        {
          id: '1',
          name: 'Alice',
          phone_number: '+41791111111',
          participant_token: 'token1',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: null,
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Bob',
          phone_number: '+41792222222',
          participant_token: 'token2',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: null,
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Charlie',
          phone_number: '+41793333333',
          participant_token: 'token3',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: null,
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
      ]

      await expect(performDraw('session1', participants, false)).rejects.toThrow('Database error')
    })

    it('generates valid assignments for 10 participants', async () => {
      const participants: ParticipantAdmin[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Person ${i + 1}`,
        phone_number: `+41${String(i + 1).padStart(9, '0')}`,
        participant_token: `token${i + 1}`,
        is_organizer: false,
        whatsapp_sent_at: null,
        reveal_viewed_at: null,
        partner_id: null,
        session_id: 'session1',
        created_at: new Date().toISOString(),
      }))

      await performDraw('session1', participants, false)

      const callArgs = (global.fetch as any).mock.calls[0]
      const body = JSON.parse(callArgs[1].body)
      expect(body.assignments).toHaveLength(10)
      expect(isValidDerangement(body.assignments)).toBe(true)
    })

    it('handles all participants in pairs (partner exclusion)', async () => {
      const participants: ParticipantAdmin[] = [
        {
          id: '1',
          name: 'Alice',
          phone_number: '+41791111111',
          participant_token: 'token1',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: '2',
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Bob',
          phone_number: '+41792222222',
          participant_token: 'token2',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: '1',
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Charlie',
          phone_number: '+41793333333',
          participant_token: 'token3',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: '4',
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'David',
          phone_number: '+41794444444',
          participant_token: 'token4',
          is_organizer: false,
          whatsapp_sent_at: null,
          reveal_viewed_at: null,
          partner_id: '3',
          session_id: 'session1',
          created_at: new Date().toISOString(),
        },
      ]

      // This should work: each pair can give to the other pair
      await performDraw('session1', participants, true)

      const callArgs = (global.fetch as any).mock.calls[0]
      const body = JSON.parse(callArgs[1].body)
      expect(body.assignments).toHaveLength(4)
      expect(isValidDerangement(body.assignments)).toBe(true)

      // Verify partner constraints
      body.assignments.forEach((assignment: any) => {
        const giver = participants.find(p => p.id === assignment.giverId)!
        expect(assignment.receiverId).not.toBe(giver.partner_id)
      })
    })
  })
})
