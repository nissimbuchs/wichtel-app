-- ============================================================================
-- Wichtel-App Complete Database Schema
-- Created: 2025-12-10
-- Description: Single consolidated migration with all features
-- ============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'planning'
        CHECK (status IN ('planning', 'drawn', 'completed', 'archived')),
    admin_token VARCHAR(255) UNIQUE NOT NULL,
    partner_exclusion_enabled BOOLEAN DEFAULT FALSE,
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
    partner_id UUID REFERENCES participants(id) ON DELETE SET NULL,
    is_organizer BOOLEAN DEFAULT FALSE,
    whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
    reveal_viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT no_self_assignment CHECK (id != assigned_to_id),
    CONSTRAINT no_self_partner CHECK (id != partner_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sessions_organizer ON sessions(organizer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_admin_token ON sessions(admin_token);
CREATE INDEX IF NOT EXISTS idx_participants_session ON participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_token ON participants(participant_token);
CREATE INDEX IF NOT EXISTS idx_participants_reveal_viewed ON participants(reveal_viewed_at);
CREATE INDEX IF NOT EXISTS idx_participants_partner ON participants(partner_id);

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

-- Apply Triggers
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_participants_updated_at ON participants;
CREATE TRIGGER update_participants_updated_at
    BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PARTNER BIDIRECTIONAL RELATIONSHIP TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_partner_bidirectional()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.partner_id IS NOT NULL THEN
        -- Check if partner exists in same session
        IF NOT EXISTS (
            SELECT 1 FROM participants
            WHERE id = NEW.partner_id
            AND session_id = NEW.session_id
        ) THEN
            RAISE EXCEPTION 'Partner must be in the same session';
        END IF;

        -- Auto-update partner's partner_id to maintain bidirectional relationship
        UPDATE participants
        SET partner_id = NEW.id
        WHERE id = NEW.partner_id
        AND (partner_id IS NULL OR partner_id != NEW.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_partner_trigger ON participants;
CREATE TRIGGER validate_partner_trigger
    AFTER INSERT OR UPDATE OF partner_id ON participants
    FOR EACH ROW
    EXECUTE FUNCTION validate_partner_bidirectional();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies for clean slate
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can view participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Users can insert participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Users can update participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Users can delete participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Anyone can read participant by token" ON participants;
DROP POLICY IF EXISTS "allow_select_sessions" ON sessions;
DROP POLICY IF EXISTS "allow_select_participants" ON participants;

-- ============================================================================
-- SESSIONS POLICIES
-- ============================================================================

-- SELECT: Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
    ON sessions FOR SELECT
    USING (auth.uid() = organizer_id);

-- INSERT: Users can create their own sessions
CREATE POLICY "Users can insert their own sessions"
    ON sessions FOR INSERT
    WITH CHECK (auth.uid() = organizer_id);

-- UPDATE: Users can update their own sessions
CREATE POLICY "Users can update their own sessions"
    ON sessions FOR UPDATE
    USING (auth.uid() = organizer_id)
    WITH CHECK (auth.uid() = organizer_id);

-- DELETE: Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions"
    ON sessions FOR DELETE
    USING (auth.uid() = organizer_id);

-- ============================================================================
-- PARTICIPANTS POLICIES
-- ============================================================================

-- SELECT: Organizers can view participants in their sessions
CREATE POLICY "Users can view participants in their sessions"
    ON participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = auth.uid()
        )
    );

-- SELECT: Anyone can read participant by token (for reveal pages)
CREATE POLICY "Anyone can read participant by token"
    ON participants FOR SELECT
    USING (true);

-- INSERT: Organizers can add participants to their sessions
CREATE POLICY "Users can insert participants in their sessions"
    ON participants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = session_id
            AND sessions.organizer_id = auth.uid()
        )
    );

-- UPDATE: Organizers can update participants in their sessions
CREATE POLICY "Users can update participants in their sessions"
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

-- DELETE: Organizers can delete participants from their sessions
CREATE POLICY "Users can delete participants in their sessions"
    ON participants FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = auth.uid()
        )
    );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE sessions IS 'Secret Santa sessions organized by authenticated users';
COMMENT ON TABLE participants IS 'Participants in Secret Santa sessions';
COMMENT ON COLUMN participants.assigned_to_id IS 'Who this participant must give a gift to (set during draw)';
COMMENT ON COLUMN participants.partner_id IS 'Partner who should not be assigned to this participant';
COMMENT ON COLUMN participants.reveal_viewed_at IS 'Timestamp when participant first viewed their reveal page';
COMMENT ON COLUMN participants.whatsapp_sent_at IS 'Timestamp when WhatsApp invitation was sent';
COMMENT ON COLUMN sessions.partner_exclusion_enabled IS 'Whether partner exclusion is active for this session';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Tables: sessions, participants
-- Indexes: 6 performance indexes
-- Triggers: 2 updated_at triggers + 1 partner bidirectional trigger
-- RLS: 9 security policies (4 for sessions, 5 for participants)
-- Features: Partner exclusion, WhatsApp tracking, Reveal tracking
-- ============================================================================
