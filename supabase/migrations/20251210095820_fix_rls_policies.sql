-- ============================================================================
-- Fix RLS Policies - Add missing INSERT/UPDATE/DELETE policies
-- Created: 2025-12-10
-- Description: Adds missing RLS policies for authenticated operations
-- ============================================================================

-- Drop existing permissive policies that allow everything
DROP POLICY IF EXISTS "allow_select_sessions" ON sessions;
DROP POLICY IF EXISTS "allow_select_participants" ON participants;

-- Drop any other existing policies to ensure clean slate
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can view participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Users can insert participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Users can update participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Users can delete participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Anyone can read participant by token" ON participants;

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
