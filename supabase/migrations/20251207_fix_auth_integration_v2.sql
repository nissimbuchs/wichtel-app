-- ============================================================================
-- Migration: Fix Auth Integration - Use auth.users instead of organizers table
-- Created: 2025-12-07 (v2 - with data cleanup)
-- Description: Drop organizers table and link sessions directly to auth.users
-- ============================================================================

-- STEP 1: Delete all existing data (since we're restructuring)
-- This is safe because the app is not yet in production
TRUNCATE TABLE participants CASCADE;
TRUNCATE TABLE sessions CASCADE;

-- STEP 2: Drop existing constraints and table
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_organizer_id_fkey;
DROP TABLE IF EXISTS organizers CASCADE;

-- STEP 3: Modify sessions table to reference auth.users
ALTER TABLE sessions
    ADD CONSTRAINT sessions_organizer_id_fkey
    FOREIGN KEY (organizer_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- STEP 4: Add missing columns to participants table
ALTER TABLE participants
    ADD COLUMN IF NOT EXISTS is_organizer BOOLEAN DEFAULT FALSE;

ALTER TABLE participants
    ADD COLUMN IF NOT EXISTS whatsapp_sent_at TIMESTAMP WITH TIME ZONE;

-- STEP 5: Remove email_sent column if it exists
ALTER TABLE participants
    DROP COLUMN IF EXISTS email_sent;

-- STEP 6: Update RLS Policies for sessions to use auth.uid()
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

-- STEP 7: Update RLS Policies for participants
DROP POLICY IF EXISTS "Organizers can view participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Organizers can insert participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Organizers can update participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Organizers can delete participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Participants can view their own assignment" ON participants;
DROP POLICY IF EXISTS "Public can read participant by token" ON participants;

-- Allow organizers to manage participants in their sessions
CREATE POLICY "Users can view participants in their sessions"
    ON participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = auth.uid()
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
-- This is needed so reveal pages can work without auth
CREATE POLICY "Anyone can read participant by token"
    ON participants FOR SELECT
    USING (true);

-- STEP 8: Verify the changes
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '📊 Current sessions count: %', (SELECT COUNT(*) FROM sessions);
    RAISE NOTICE '📊 Current participants count: %', (SELECT COUNT(*) FROM participants);
    RAISE NOTICE '🔐 RLS Policies updated for auth.users integration';
END $$;
