-- ============================================================================
-- Migration: Fix Auth Integration - Use auth.users instead of organizers table
-- Created: 2025-12-07
-- Description: Drop organizers table and link sessions directly to auth.users
-- ============================================================================

-- Drop existing constraints and table
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_organizer_id_fkey;
DROP TABLE IF EXISTS organizers CASCADE;

-- Modify sessions table to reference auth.users
ALTER TABLE sessions
    DROP CONSTRAINT IF EXISTS sessions_organizer_id_fkey;

ALTER TABLE sessions
    ADD CONSTRAINT sessions_organizer_id_fkey
    FOREIGN KEY (organizer_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- Add missing columns to participants table
ALTER TABLE participants
    ADD COLUMN IF NOT EXISTS is_organizer BOOLEAN DEFAULT FALSE;

ALTER TABLE participants
    ADD COLUMN IF NOT EXISTS whatsapp_sent_at TIMESTAMP WITH TIME ZONE;

-- Rename email_sent to match our code
ALTER TABLE participants
    DROP COLUMN IF EXISTS email_sent;

-- Update RLS Policies for sessions to use auth.uid()
DROP POLICY IF EXISTS "Organizers can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Organizers can insert their own sessions" ON sessions;
DROP POLICY IF EXISTS "Organizers can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Organizers can delete their own sessions" ON sessions;

CREATE POLICY "Users can view their own sessions"
    ON sessions FOR SELECT
    USING (auth.uid() = organizer_id);

CREATE POLICY "Users can insert their own sessions"
    ON sessions FOR INSERT
    WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own sessions"
    ON sessions FOR UPDATE
    USING (auth.uid() = organizer_id);

CREATE POLICY "Users can delete their own sessions"
    ON sessions FOR DELETE
    USING (auth.uid() = organizer_id);

-- Update RLS Policies for participants
DROP POLICY IF EXISTS "Organizers can view participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Organizers can insert participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Organizers can update participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Organizers can delete participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Participants can view their own assignment" ON participants;

CREATE POLICY "Users can view participants in their sessions"
    ON participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM participants AS p
            WHERE p.participant_token = current_setting('request.headers')::json->>'x-participant-token'
            AND p.id = participants.id
        )
    );

CREATE POLICY "Users can insert participants in their sessions"
    ON participants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = session_id
            AND sessions.organizer_id = auth.uid()
        )
    );

CREATE POLICY "Users can update participants in their sessions"
    ON participants FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete participants in their sessions"
    ON participants FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = auth.uid()
        )
    );

-- Allow public read access for reveal pages (token-based)
CREATE POLICY "Public can read participant by token"
    ON participants FOR SELECT
    USING (true);

COMMENT ON POLICY "Public can read participant by token" ON participants IS
    'Allows reveal pages to fetch participant data using participant_token';
