-- ============================================================================
-- Validation Tests for Story-01 Database Schema
-- Story: story-01-supabase-setup-database-schema
-- Run in Supabase SQL Editor to verify deployment
-- ============================================================================

-- Test 1: Verify all tables exist
SELECT 'Test 1: Verify all tables exist' as test_name;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('organizers', 'sessions', 'participants')
ORDER BY table_name;
-- Expected: 3 rows (organizers, participants, sessions)

-- Test 2: Verify indexes exist
SELECT 'Test 2: Verify indexes exist' as test_name;
SELECT indexname FROM pg_indexes
WHERE tablename IN ('sessions', 'participants')
ORDER BY indexname;
-- Expected: idx_sessions_organizer, idx_sessions_admin_token,
--           idx_participants_session, idx_participants_token

-- Test 3: Verify RLS is enabled
SELECT 'Test 3: Verify RLS is enabled' as test_name;
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('organizers', 'sessions', 'participants')
ORDER BY tablename;
-- Expected: All have rowsecurity = true

-- Test 4: Verify policies exist
SELECT 'Test 4: Verify policies exist' as test_name;
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('organizers', 'sessions', 'participants')
ORDER BY tablename, policyname;
-- Expected: 7 policies total

-- Test 5: Verify triggers exist
SELECT 'Test 5: Verify triggers exist' as test_name;
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('organizers', 'sessions', 'participants')
ORDER BY event_object_table, trigger_name;
-- Expected: 3 triggers (update_*_updated_at)

-- Test 6: Verify seed data exists
SELECT 'Test 6: Verify seed data - Organizers' as test_name;
SELECT COUNT(*) as organizer_count FROM organizers;
-- Expected: 1

SELECT 'Test 6: Verify seed data - Sessions' as test_name;
SELECT COUNT(*) as session_count FROM sessions;
-- Expected: 1

SELECT 'Test 6: Verify seed data - Participants' as test_name;
SELECT COUNT(*) as participant_count FROM participants;
-- Expected: 3

-- Test 7: Test updated_at trigger (modify and check)
SELECT 'Test 7: Test updated_at trigger' as test_name;
UPDATE participants SET name = name || ' (Test)' WHERE participant_token = 'participant-token-max';
SELECT name, created_at, updated_at, (updated_at > created_at) as trigger_works
FROM participants
WHERE participant_token = 'participant-token-max';
-- Expected: trigger_works = true
-- Rollback the test change:
UPDATE participants SET name = REPLACE(name, ' (Test)', '') WHERE participant_token = 'participant-token-max';

-- Test 8: Test CHECK constraint (should fail)
SELECT 'Test 8: Test CHECK constraint (should FAIL)' as test_name;
-- This INSERT should fail with check constraint violation:
-- INSERT INTO participants (id, session_id, name, phone_number, participant_token, assigned_to_id)
-- VALUES (
--     '00000000-0000-0000-0000-999999999999',
--     '00000000-0000-0000-0000-000000000010',
--     'Test Self Assignment',
--     '+49170',
--     'token-test-fail',
--     '00000000-0000-0000-0000-999999999999'  -- Same as id!
-- );
-- Expected: ERROR: new row violates check constraint "no_self_assignment"
-- NOTE: Commented out to avoid error - uncomment to test manually

-- Test 9: Test Foreign Key CASCADE
SELECT 'Test 9: Foreign Key Relationships' as test_name;
SELECT
    c.table_name,
    c.constraint_name,
    c.constraint_type,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints c
JOIN information_schema.referential_constraints rc
    ON c.constraint_name = rc.constraint_name
WHERE c.table_schema = 'public'
AND c.table_name IN ('sessions', 'participants')
AND c.constraint_type = 'FOREIGN KEY'
ORDER BY c.table_name, c.constraint_name;
-- Expected: sessions.organizer_id → CASCADE on delete
--           participants.session_id → CASCADE on delete
--           participants.assigned_to_id → SET NULL on delete

-- ============================================================================
-- Validation Tests Complete
-- ============================================================================
-- All tests should pass for deployment to be considered successful
-- ============================================================================
