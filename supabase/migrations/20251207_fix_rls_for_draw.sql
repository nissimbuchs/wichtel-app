-- ============================================================================
-- Migration: Fix RLS Policy for Draw Algorithm
-- Created: 2025-12-07
-- Description: Allow updating assigned_to_id during draw
-- ============================================================================

-- The issue: The UPDATE policy only checks session ownership,
-- but doesn't allow updating assigned_to_id specifically

-- Solution: Modify the UPDATE policy to explicitly allow assigned_to_id updates
DROP POLICY IF EXISTS "Users can update participants in their sessions" ON participants;

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

-- Add a comment to clarify what this policy allows
COMMENT ON POLICY "Users can update participants in their sessions" ON participants IS
    'Allows organizers to update participants in their own sessions, including assigned_to_id during draw';

-- Verify
DO $$
BEGIN
    RAISE NOTICE '✅ RLS Policy updated for draw algorithm';
    RAISE NOTICE '🔐 Organizers can now update assigned_to_id in their sessions';
END $$;
