-- Add language column to sessions table
-- This stores the organizer's language preference for WhatsApp messages
-- Default to 'de' (German) for existing sessions

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'de';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_sessions_language ON sessions(language);

-- Add comment
COMMENT ON COLUMN sessions.language IS 'Language preference for WhatsApp messages (de, fr, it, en)';
