-- ============================================================================
-- Migration: Fix RLS for Public Reveal Page Access (v2)
-- Created: 2025-12-08
-- Description: Allow anonymous users to read participants and sessions for reveal page
-- ============================================================================

-- Drop old restrictive policy if it exists
DROP POLICY IF EXISTS "Participants can view own assignment" ON participants;

-- Create new policy for anonymous token-based access (reveal page)
-- This allows reading ANY participant record (needed for reveal page to work)
DROP POLICY IF EXISTS "Public can view participants for reveal" ON participants;
CREATE POLICY "Public can view participants for reveal"
    ON participants FOR SELECT
    USING (true);

-- Also allow anonymous users to read sessions (needed for session name on reveal page)
DROP POLICY IF EXISTS "Public can view sessions for reveal" ON sessions;
CREATE POLICY "Public can view sessions for reveal"
    ON sessions FOR SELECT
    USING (true);

-- Add comments
COMMENT ON POLICY "Public can view participants for reveal" ON participants IS
    'Allows anyone to view participant data (needed for reveal page to fetch assignments)';

COMMENT ON POLICY "Public can view sessions for reveal" ON sessions IS
    'Allows anyone to view session details (needed for reveal page)';

-- Verify
SELECT 'RLS Policies updated for reveal page' AS status;
