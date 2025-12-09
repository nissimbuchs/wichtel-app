-- ============================================================================
-- Migration: Add Partner Exclusion Feature
-- Created: 2025-12-10
-- Description: Add session-level partner mode + participant partner links
-- ============================================================================

-- STEP 1: Add partner exclusion mode to sessions table
ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS partner_exclusion_enabled BOOLEAN DEFAULT FALSE;

-- STEP 2: Add partner_id to participants table
ALTER TABLE participants
    ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES participants(id) ON DELETE SET NULL;

-- STEP 3: Add constraint to prevent self-partnering
ALTER TABLE participants
    ADD CONSTRAINT no_self_partner CHECK (id != partner_id);

-- STEP 4: Create index for partner lookups
CREATE INDEX IF NOT EXISTS idx_participants_partner ON participants(partner_id);

-- STEP 5: Create function to validate bidirectional partnership
CREATE OR REPLACE FUNCTION validate_partner_bidirectional()
RETURNS TRIGGER AS $$
BEGIN
    -- If partner_id is set, ensure it's bidirectional
    IF NEW.partner_id IS NOT NULL THEN
        -- Check if partner exists in same session
        IF NOT EXISTS (
            SELECT 1 FROM participants
            WHERE id = NEW.partner_id
            AND session_id = NEW.session_id
        ) THEN
            RAISE EXCEPTION 'Partner must be in the same session';
        END IF;

        -- Auto-update partner's partner_id to maintain bidirectional relationship
        UPDATE participants
        SET partner_id = NEW.id
        WHERE id = NEW.partner_id
        AND (partner_id IS NULL OR partner_id != NEW.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 6: Create trigger for bidirectional validation
DROP TRIGGER IF EXISTS validate_partner_trigger ON participants;
CREATE TRIGGER validate_partner_trigger
    AFTER INSERT OR UPDATE OF partner_id ON participants
    FOR EACH ROW
    EXECUTE FUNCTION validate_partner_bidirectional();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Changes:
-- - Added partner_exclusion_enabled to sessions table
-- - Added partner_id to participants table with foreign key constraint
-- - Added no_self_partner CHECK constraint
-- - Created index for partner lookups
-- - Created trigger to maintain bidirectional partnerships automatically
-- ============================================================================
