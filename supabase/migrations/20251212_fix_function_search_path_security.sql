-- Fix search_path security warnings for database functions
-- https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- Fix validate_partner_bidirectional function
CREATE OR REPLACE FUNCTION validate_partner_bidirectional()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.partner_id IS NOT NULL THEN
        -- Check if partner exists in same session
        IF NOT EXISTS (
            SELECT 1 FROM public.participants
            WHERE id = NEW.partner_id
            AND session_id = NEW.session_id
        ) THEN
            RAISE EXCEPTION 'Partner must be in the same session';
        END IF;

        -- Auto-update partner's partner_id to maintain bidirectional relationship
        UPDATE public.participants
        SET partner_id = NEW.id
        WHERE id = NEW.partner_id
        AND (partner_id IS NULL OR partner_id != NEW.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at timestamp. Search path fixed for security.';
COMMENT ON FUNCTION validate_partner_bidirectional() IS 'Maintains bidirectional partner relationships. Search path fixed for security.';
