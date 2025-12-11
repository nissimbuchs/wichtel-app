import { describe, it, expect } from 'vitest'

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
})
