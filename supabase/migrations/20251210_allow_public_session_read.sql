-- Migration: Allow public read access to sessions table for reveal pages
-- Date: 2025-12-10
-- Problem: Reveal pages are accessed by non-authenticated participants who need to read session names
-- Solution: Add public SELECT policy for sessions table

-- Allow anyone to view sessions (needed for reveal pages)
-- This is safe because:
-- - Sessions only contain: name, status, created_at, organizer_id
-- - No sensitive assignment data (that's in participants table with its own RLS)
-- - Participants still cannot see other participants' assignments

CREATE POLICY "Anyone can view session names for reveal pages"
ON public.sessions
FOR SELECT
TO public
USING (true);

-- Note: Existing policy "Users can view their own sessions" remains in place
-- This new policy adds an additional way to read sessions (for reveal page context)
