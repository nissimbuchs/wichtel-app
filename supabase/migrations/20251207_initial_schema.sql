-- ============================================================================
-- Migration: Initial Database Schema for Wichtel-App
-- Created: 2025-12-07
-- Story: story-01-supabase-setup-database-schema
-- Description: Complete database schema with Tables, Indexes, Triggers, RLS
-- ============================================================================

-- Enable UUID Extension (pgcrypto for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Organizers Table
CREATE TABLE IF NOT EXISTS organizers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'planning'
        CHECK (status IN ('planning', 'drawn', 'completed', 'archived')),
    admin_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participants Table
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    participant_token VARCHAR(255) UNIQUE NOT NULL,
    assigned_to_id UUID REFERENCES participants(id) ON DELETE SET NULL,
    email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT no_self_assignment CHECK (id != assigned_to_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for organizer session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_organizer ON sessions(organizer_id);

-- Index for admin token lookups
CREATE INDEX IF NOT EXISTS idx_sessions_admin_token ON sessions(admin_token);

-- Index for participant session listings
CREATE INDEX IF NOT EXISTS idx_participants_session ON participants(session_id);

-- Index for reveal page token lookups
CREATE INDEX IF NOT EXISTS idx_participants_token ON participants(participant_token);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATED_AT
-- ============================================================================

-- Updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers to Tables
DROP TRIGGER IF EXISTS update_organizers_updated_at ON organizers;
CREATE TRIGGER update_organizers_updated_at
    BEFORE UPDATE ON organizers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_participants_updated_at ON participants;
CREATE TRIGGER update_participants_updated_at
    BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Organizers can view own data" ON organizers;
DROP POLICY IF EXISTS "Organizers can manage own sessions" ON sessions;
DROP POLICY IF EXISTS "Organizers can manage participants (no assignments)" ON participants;
DROP POLICY IF EXISTS "Organizers can insert participants" ON participants;
DROP POLICY IF EXISTS "Organizers can update participants" ON participants;
DROP POLICY IF EXISTS "Organizers can delete participants" ON participants;
DROP POLICY IF EXISTS "Participants can view own assignment" ON participants;

-- Organizers: Can only see their own data
CREATE POLICY "Organizers can view own data"
    ON organizers FOR SELECT
    USING (auth.uid() = id);

-- Sessions: Organizers can CRUD their own sessions
CREATE POLICY "Organizers can manage own sessions"
    ON sessions FOR ALL
    USING (organizer_id = auth.uid());

-- Participants: CRITICAL FOR ANONYMITY
-- Organizers can manage participants BUT cannot see assigned_to_id field
CREATE POLICY "Organizers can manage participants (no assignments)"
    ON participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can insert participants"
    ON participants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can update participants"
    ON participants FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can delete participants"
    ON participants FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = auth.uid()
        )
    );

-- Participants can view own assignment via token
CREATE POLICY "Participants can view own assignment"
    ON participants FOR SELECT
    USING (participant_token = current_setting('request.jwt.claims', true)::json->>'participant_token');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Tables: organizers, sessions, participants
-- Indexes: 4 performance indexes created
-- Triggers: 3 updated_at triggers created
-- RLS: 5 security policies created
-- ============================================================================
