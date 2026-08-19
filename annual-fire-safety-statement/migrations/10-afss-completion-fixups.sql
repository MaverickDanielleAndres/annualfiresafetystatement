-- =============================================================
-- AFSS 10 — Completion fixups (smallest safe corrective migration)
--
-- Applied AFTER 09 if any of the following are still missing or
-- wrong:
--
--   * afss.next_quote_reference() has a bad type cast on its
--     Australia/Sydney line (casts timestamptz to int directly).
--     The trigger that auto-allocates quote references therefore
--     throws "cannot cast type timestamp without time zone to
--     integer" and rolls back the INSERT.
--   * afss.payments.preferred_at column is missing.
--   * afss.quote_sessions status CHECK does not yet allow
--     'submitted' (needed by the TALK TO US FIRST path).
--
-- All statements are idempotent. Safe to apply even if the
-- previous state is non-migration-09.
-- =============================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. Fix afss.next_quote_reference() — drop the bad cast line.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION afss.next_quote_reference()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, afss
AS $$
DECLARE
  v_seq   bigint;
  v_year  int;
  v_pad   text;
BEGIN
  v_seq  := nextval('afss.quote_reference_seq');
  v_year := date_part('year', (now() AT TIME ZONE 'Australia/Sydney'))::int;
  v_pad  := lpad(v_seq::text, 6, '0');
  RETURN format('AFSS-%s-%s', v_year, v_pad);
END
$$;

REVOKE ALL ON FUNCTION afss.next_quote_reference() FROM PUBLIC;
REVOKE ALL ON FUNCTION afss.next_quote_reference() FROM anon;
REVOKE ALL ON FUNCTION afss.next_quote_reference() FROM authenticated;
GRANT  EXECUTE ON FUNCTION afss.next_quote_reference() TO service_role;

COMMENT ON FUNCTION afss.next_quote_reference() IS
  'AFSS-only, concurrency-safe allocator for the AFSS-YYYY-NNNNNN quote reference. Hard-codes the internal sequence afss.quote_reference_seq; no user-supplied inputs. Service_role-only.';

-- ----------------------------------------------------------------
-- 2. afss.payments.preferred_at column (if missing)
-- ----------------------------------------------------------------
ALTER TABLE afss.payments
  ADD COLUMN IF NOT EXISTS preferred_at TIMESTAMPTZ;

-- ----------------------------------------------------------------
-- 3. Allow 'submitted' on afss.quote_sessions.status
-- ----------------------------------------------------------------
ALTER TABLE afss.quote_sessions DROP CONSTRAINT IF EXISTS quote_sessions_status_valid;

ALTER TABLE afss.quote_sessions
  ADD CONSTRAINT quote_sessions_status_valid
  CHECK (status IN (
    'started',
    'contact_saved',
    'property_saved',
    'building_confirmed',
    'document_uploaded',
    'awaiting_document',
    'processing',
    'needs_review',
    'quoted',
    'accepted',
    'submitted',
    'paid',
    'abandoned',
    'cancelled',
    'expired'
  ));

COMMIT;
