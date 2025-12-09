-- Add reveal_viewed_at field to track when participants view their assignment
-- This enables "Versendet" → "Abgerufen" status tracking in WhatsApp list

ALTER TABLE participants
ADD COLUMN reveal_viewed_at TIMESTAMP WITH TIME ZONE;

-- Add index for performance when querying by viewed status
CREATE INDEX idx_participants_reveal_viewed ON participants(reveal_viewed_at);

-- Comment for clarity
COMMENT ON COLUMN participants.reveal_viewed_at IS 'Timestamp when participant first viewed their reveal page';
