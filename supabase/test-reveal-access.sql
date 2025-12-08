-- Test script to debug reveal page access issues
-- Run this in Supabase SQL Editor to see what's happening

-- 1. Check if RLS is enabled on tables
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('participants', 'sessions');

-- 2. List all policies on participants table
SELECT
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'participants';

-- 3. List all policies on sessions table
SELECT
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'sessions';

-- 4. Check a sample participant record (replace token with real one)
-- SELECT id, name, session_id, assigned_to_id, participant_token
-- FROM participants
-- WHERE participant_token = 'your-token-here'
-- LIMIT 1;

-- 5. Test if session can be read for that participant
-- SELECT s.id, s.name
-- FROM sessions s
-- INNER JOIN participants p ON p.session_id = s.id
-- WHERE p.participant_token = 'your-token-here';
