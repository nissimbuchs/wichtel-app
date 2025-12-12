-- Performance Optimization Migration
-- Fixes 20 of 23 Supabase performance warnings
-- https://supabase.com/docs/guides/database/database-linter

-- ============================================================================
-- 1. ADD MISSING INDEX FOR FOREIGN KEY
-- ============================================================================
-- Fix: Unindexed foreign key on participants.assigned_to_id
CREATE INDEX IF NOT EXISTS idx_participants_assigned_to_id
ON participants(assigned_to_id);

COMMENT ON INDEX idx_participants_assigned_to_id IS 'Index for assigned_to_id foreign key to improve join performance';

-- ============================================================================
-- 2. OPTIMIZE RLS POLICIES - FIX AUTH.UID() RE-EVALUATION
-- ============================================================================
-- Problem: auth.uid() is re-evaluated for each row, causing performance issues
-- Solution: Use (select auth.uid()) to evaluate once per query

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions;
DROP POLICY IF EXISTS "Anyone can view session names for reveal pages" ON sessions;

DROP POLICY IF EXISTS "Users can view participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Anyone can read participant by token" ON participants;
DROP POLICY IF EXISTS "Users can insert participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Users can update participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Users can delete participants in their sessions" ON participants;

-- ============================================================================
-- SESSIONS POLICIES (OPTIMIZED)
-- ============================================================================

-- SELECT: Combined policy for public access + authenticated access
-- Fixes "Multiple Permissive Policies" warning by combining two policies
CREATE POLICY "Sessions can be viewed by anyone or organizer"
    ON sessions FOR SELECT
    USING (
        true  -- Anyone can view (needed for reveal pages)
        OR (select auth.uid()) = organizer_id  -- Organizer optimization
    );

-- INSERT: Users can create their own sessions
CREATE POLICY "Users can insert their own sessions"
    ON sessions FOR INSERT
    WITH CHECK ((select auth.uid()) = organizer_id);

-- UPDATE: Users can update their own sessions
CREATE POLICY "Users can update their own sessions"
    ON sessions FOR UPDATE
    USING ((select auth.uid()) = organizer_id)
    WITH CHECK ((select auth.uid()) = organizer_id);

-- DELETE: Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions"
    ON sessions FOR DELETE
    USING ((select auth.uid()) = organizer_id);

-- ============================================================================
-- PARTICIPANTS POLICIES (OPTIMIZED)
-- ============================================================================

-- SELECT: Combined policy for token-based access + organizer access
-- Fixes "Multiple Permissive Policies" warning by combining two policies
CREATE POLICY "Participants can be viewed by anyone or organizer"
    ON participants FOR SELECT
    USING (
        true  -- Anyone can read (needed for reveal pages with token)
        OR EXISTS (  -- Organizer can view participants in their sessions
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = (select auth.uid())
        )
    );

-- INSERT: Organizers can add participants to their sessions
CREATE POLICY "Users can insert participants in their sessions"
    ON participants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = session_id
            AND sessions.organizer_id = (select auth.uid())
        )
    );

-- UPDATE: Organizers can update participants in their sessions
CREATE POLICY "Users can update participants in their sessions"
    ON participants FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = (select auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = (select auth.uid())
        )
    );

-- DELETE: Organizers can delete participants from their sessions
CREATE POLICY "Users can delete participants in their sessions"
    ON participants FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = (select auth.uid())
        )
    );

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✅ Added index for assigned_to_id foreign key (1 fix)
-- ✅ Optimized 9 RLS policies to use (select auth.uid()) (9 fixes)
-- ✅ Combined multiple permissive policies into single policies (10 fixes)
-- ⚠️ Kept 3 unused indexes (may be useful as app scales)
--
-- Total fixes: 20 of 23 warnings
-- Remaining: 3 unused index INFO warnings (acceptable)
