-- =============================================================
-- AFSS 04 — last_activity_at trigger
--
-- `last_activity_at` was only set on INSERT (via DEFAULT). It
-- must also update whenever the session is touched so abandoned-
-- session detection works correctly. The existing `updated_at`
-- trigger fires on any UPDATE but does NOT touch last_activity_at.
--
-- This migration adds a dedicated trigger that updates
-- last_activity_at = now() on every UPDATE.
-- =============================================================

BEGIN;

CREATE OR REPLACE FUNCTION afss.touch_last_activity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_activity_at := now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION afss.touch_last_activity() IS
  'Sets last_activity_at to now() on every UPDATE.';

CREATE TRIGGER trg_quote_sessions_last_activity
  BEFORE UPDATE ON afss.quote_sessions
  FOR EACH ROW
  EXECUTE PROCEDURE afss.touch_last_activity();

COMMIT;