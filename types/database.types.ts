export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          organizer_id: string
          name: string
          status: 'planning' | 'drawn' | 'completed' | 'archived'
          admin_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizer_id: string
          name: string
          status?: 'planning' | 'drawn' | 'completed' | 'archived'
          admin_token: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizer_id?: string
          name?: string
          status?: 'planning' | 'drawn' | 'completed' | 'archived'
          admin_token?: string
          created_at?: string
          updated_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          session_id: string
          name: string
          phone_number: string
          participant_token: string
          assigned_to_id: string | null
          is_organizer: boolean
          whatsapp_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          name: string
          phone_number: string
          participant_token: string
          assigned_to_id?: string | null
          is_organizer?: boolean
          whatsapp_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          name?: string
          phone_number?: string
          participant_token?: string
          assigned_to_id?: string | null
          is_organizer?: boolean
          whatsapp_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Admin view: Participant WITHOUT assigned_to_id (for anonymity)
export interface ParticipantAdmin {
  id: string
  name: string
  phone_number: string
  participant_token: string
  is_organizer: boolean
  whatsapp_sent_at: string | null
  created_at: string
}

// Participant view: WITH assignment (only for own view)
export interface ParticipantWithAssignment {
  id: string
  name: string
  assigned_to_id: string | null
  assigned_to_name?: string
}

export type Session = Database['public']['Tables']['sessions']['Row']
export type Participant = Database['public']['Tables']['participants']['Row']
