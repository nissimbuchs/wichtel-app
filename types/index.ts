// Re-export generated types from database.types
export type { Database, Tables, TablesInsert, TablesUpdate, Enums, CompositeTypes, Json } from './generated/database.types'

// Custom type aliases for convenience
// These survive type regeneration since they're in a separate file
import type { Tables, TablesInsert, TablesUpdate } from './generated/database.types'

export type Session = Tables<'sessions'>
export type Participant = Tables<'participants'>

export type SessionInsert = TablesInsert<'sessions'>
export type ParticipantInsert = TablesInsert<'participants'>

export type SessionUpdate = TablesUpdate<'sessions'>
export type ParticipantUpdate = TablesUpdate<'participants'>

// Custom view types for security
// ParticipantAdmin: For organizers - excludes assigned_to_id to maintain anonymity
export type ParticipantAdmin = Omit<Participant, 'assigned_to_id'>

// ParticipantWithAssignment: For reveal pages - includes assigned_to_id
export type ParticipantWithAssignment = Participant
