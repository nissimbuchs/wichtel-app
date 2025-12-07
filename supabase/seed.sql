-- ============================================================================
-- Seed Data for Development & Testing
-- Created: 2025-12-07
-- Story: story-01-supabase-setup-database-schema
-- Run with: supabase db reset (includes migrations + seed)
-- ============================================================================

-- Insert Test Organizer
INSERT INTO organizers (id, email) VALUES
    ('00000000-0000-0000-0000-000000000001', 'test@example.com')
ON CONFLICT (email) DO NOTHING;

-- Insert Test Session
INSERT INTO sessions (id, organizer_id, name, admin_token, status) VALUES
    ('00000000-0000-0000-0000-000000000010',
     '00000000-0000-0000-0000-000000000001',
     'Test Wichteln 2025',
     'test-admin-token-12345',
     'planning')
ON CONFLICT (id) DO NOTHING;

-- Insert Test Participants (minimum 3 for Derangement)
INSERT INTO participants (id, session_id, name, phone_number, participant_token) VALUES
    ('00000000-0000-0000-0000-000000000100',
     '00000000-0000-0000-0000-000000000010',
     'Max Mustermann',
     '+4917012345678',
     'participant-token-max'),
    ('00000000-0000-0000-0000-000000000101',
     '00000000-0000-0000-0000-000000000010',
     'Anna Schmidt',
     '+4917087654321',
     'participant-token-anna'),
    ('00000000-0000-0000-0000-000000000102',
     '00000000-0000-0000-0000-000000000010',
     'Peter Müller',
     '+4917055555555',
     'participant-token-peter')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED DATA COMPLETE
-- ============================================================================
-- Test Organizer: test@example.com
-- Test Session: Test Wichteln 2025 (planning status)
-- Test Participants: 3 participants (Max, Anna, Peter)
-- Ready for: Derangement algorithm testing, RLS policy testing
-- ============================================================================
