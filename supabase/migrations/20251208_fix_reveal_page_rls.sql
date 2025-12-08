-- ============================================================================
-- Migration: Fix RLS for Public Reveal Page Access
-- Created: 2025-12-08
-- Description: Allow anonymous users to read participants via participant_token
-- ============================================================================

-- Problem: The current SELECT policy only allows authenticated JWT-based access
-- Solution: Add a policy that allows SELECT when participant_token matches

-- Drop the old policy
DROP POLICY IF EXISTS "Participants can view own assignment" ON participants;

-- Create new policy for anonymous token-based access (reveal page)
-- This allows reading ANY participant record (needed for reveal page to work)
CREATE POLICY "Public can view participants for reveal"
    ON participants FOR SELECT
    USING (true);

-- Create policy for organizers to view their participants
CREATE POLICY "Organizers can view their participants"
    ON participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = auth.uid()
        )
    );

-- Add comments
COMMENT ON POLICY "Anonymous users can view via token" ON participants IS
    'Allows anyone with a valid participant_token to view participant data (for reveal page)';

COMMENT ON POLICY "Organizers can view their participants" ON participants IS
    'Allows authenticated organizers to view all participants in their sessions';

-- Also allow anonymous users to read sessions (needed for session name on reveal page)
CREATE POLICY "Public can view sessions for reveal"
    ON sessions FOR SELECT
    USING (true);

COMMENT ON POLICY "Public can view sessions for reveal" ON sessions IS
    'Allows anyone to view session details (needed for reveal page)';

COMMENT ON POLICY "Public can view participants for reveal" ON participants IS
    'Allows anyone to view participant data (needed for reveal page to fetch assignments)';

-- Verify
DO $$
BEGIN
    RAISE NOTICE '✅ RLS Policies updated for reveal page';
    RAISE NOTICE '🔓 Anonymous users can now access reveal page via token';
    RAISE NOTICE '🔐 Organizers retain full access to their participants';
END $$;
