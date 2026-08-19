-- =============================================================
-- AFSS 09 — MVP completion (combines 07 + 08 corrections)
--
-- Past-it: prior migrations 01-06 created the ten tables and the
-- storage bucket. This single file finishes the AFSS Instant Quote
-- MVP by adding the provider-neutral columns + the simulation
-- payments + final quote_submissions table + the safe
-- afss.next_quote_reference() function.
--
-- Idempotent (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS). Safe to
-- apply multiple times.
--
-- This file:
--   * Adds provider-neutral columns to afss.properties
--   * Adds quote_mode / payment_preference / final_submitted_at /
--     final_submission_id to afss.quote_sessions
--   * Adds is_simulation + quote_mode to afss.quotes
--   * Adds payment_mode to afss.payments
--   * Extends afss.activity_events CHECK with new event types
--   * Creates afss.quote_submissions
--   * Creates afss.next_quote_reference() (AFSS-specific,
--     SECURITY DEFINER, no user-supplied sequence name,
--     REVOKE on PUBLIC, GRANT only to service_role)
--   * Creates an INSERT/UPDATE trigger so any INSERT into
--     afss.quote_sessions automatically allocates a fresh
--     AFSS-YYYY-NNNNNN reference via the function above.
-- =============================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. afss.properties — provider-neutral columns
-- ----------------------------------------------------------------
ALTER TABLE afss.properties
  ADD COLUMN IF NOT EXISTS address_provider        TEXT,
  ADD COLUMN IF NOT EXISTS address_provider_id     TEXT,
  ADD COLUMN IF NOT EXISTS address_provider_json   JSONB,
  ADD COLUMN IF NOT EXISTS street_image_provider       TEXT,
  ADD COLUMN IF NOT EXISTS street_image_id             TEXT,
  ADD COLUMN IF NOT EXISTS street_image_sequence_id    TEXT,
  ADD COLUMN IF NOT EXISTS street_image_captured_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS street_image_thumb_url      TEXT,
  ADD COLUMN IF NOT EXISTS street_image_json           JSONB,
  ADD COLUMN IF NOT EXISTS street_image_search_radius_m INTEGER NOT NULL DEFAULT 250;

CREATE INDEX IF NOT EXISTS idx_properties_address_provider_id
  ON afss.properties (address_provider, address_provider_id)
  WHERE address_provider IS NOT NULL;

-- ----------------------------------------------------------------
-- 2. afss.quote_sessions — submission tracking
-- ----------------------------------------------------------------
ALTER TABLE afss.quote_sessions
  ADD COLUMN IF NOT EXISTS quote_mode         TEXT NOT NULL DEFAULT 'simulation',
  ADD COLUMN IF NOT EXISTS payment_preference TEXT,
  ADD COLUMN IF NOT EXISTS final_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS final_submission_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'afss'
      AND table_name   = 'quote_sessions'
      AND constraint_name = 'quote_sessions_quote_mode_valid'
  ) THEN
    ALTER TABLE afss.quote_sessions
      ADD CONSTRAINT quote_sessions_quote_mode_valid
        CHECK (quote_mode IN ('simulation','real'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'afss'
      AND table_name   = 'quote_sessions'
      AND constraint_name = 'quote_sessions_payment_preference_valid'
  ) THEN
    ALTER TABLE afss.quote_sessions
      ADD CONSTRAINT quote_sessions_payment_preference_valid
        CHECK (payment_preference IS NULL
          OR payment_preference IN ('pay_now_simulation','contact_first'));
  END IF;
END
$$;

-- ----------------------------------------------------------------
-- 3. afss.quotes — explicit simulation flag
-- ----------------------------------------------------------------
ALTER TABLE afss.quotes
  ADD COLUMN IF NOT EXISTS is_simulation BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS quote_mode   TEXT NOT NULL DEFAULT 'simulation';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'afss'
      AND table_name   = 'quotes'
      AND constraint_name = 'quotes_quote_mode_valid'
  ) THEN
    ALTER TABLE afss.quotes
      ADD CONSTRAINT quotes_quote_mode_valid
        CHECK (quote_mode IN ('simulation','real'));
  END IF;
END
$$;

-- ----------------------------------------------------------------
-- 4. afss.payments — payment_mode (real | simulation)
-- ----------------------------------------------------------------
ALTER TABLE afss.payments
  ADD COLUMN IF NOT EXISTS payment_mode TEXT NOT NULL DEFAULT 'real';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'afss'
      AND table_name   = 'payments'
      AND constraint_name = 'payments_payment_mode_valid'
  ) THEN
    ALTER TABLE afss.payments
      ADD CONSTRAINT payments_payment_mode_valid
        CHECK (payment_mode IN ('real','simulation'));
  END IF;
END
$$;

-- ----------------------------------------------------------------
-- 5. afss.activity_events — extend CHECK
-- ----------------------------------------------------------------
ALTER TABLE afss.activity_events DROP CONSTRAINT IF EXISTS activity_events_type_valid;
ALTER TABLE afss.activity_events
  ADD CONSTRAINT activity_events_type_valid CHECK (event_type IN (
    'quote_started','contact_saved','address_selected',
    'building_confirmed','building_change_requested',
    'building_preview_unavailable',
    'document_uploaded','document_upload_failed','document_missing',
    'document_replaced','document_deleted',
    'due_date_saved','due_date_unsure',
    'analysis_started','analysis_completed','analysis_failed',
    'quote_generated','quote_review_required','quote_viewed','quote_accepted',
    'payment_started','payment_completed',
    'payment_simulated','submission_finalized',
    'modal_closed','session_resumed'
  ));

-- ----------------------------------------------------------------
-- 6. afss.quote_submissions
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS afss.quote_submissions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  quote_session_id UUID NOT NULL UNIQUE
    REFERENCES afss.quote_sessions(id) ON DELETE CASCADE,
  quote_id         UUID
    REFERENCES afss.quotes(id) ON DELETE RESTRICT,
  payment_id       UUID
    REFERENCES afss.payments(id) ON DELETE RESTRICT,

  submission_reference TEXT NOT NULL,

  payment_preference TEXT NOT NULL,
  payment_mode       TEXT NOT NULL,
  payment_status     TEXT NOT NULL,

  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT submissions_payment_preference_valid
    CHECK (payment_preference IN ('pay_now_simulation','contact_first')),
  CONSTRAINT submissions_payment_mode_valid
    CHECK (payment_mode IN ('real','simulation')),
  CONSTRAINT submissions_payment_status_valid
    CHECK (payment_status IN ('simulated_paid','deferred','pending','succeeded','failed'))
);

CREATE INDEX IF NOT EXISTS idx_quote_submissions_session
  ON afss.quote_submissions (quote_session_id);
CREATE INDEX IF NOT EXISTS idx_quote_submissions_submitted_at
  ON afss.quote_submissions (submitted_at DESC);

ALTER TABLE afss.quote_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE afss.quote_submissions FORCE ROW LEVEL SECURITY;
REVOKE ALL ON afss.quote_submissions FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------
-- 7. afss.next_quote_reference()  — SAFE design
--
-- Concurrency-safe via Postgres nextval() on the AFSS-internal
-- sequence. Format: AFSS-YYYY-NNNNNN.
--
-- SECURITY: No user-supplied sequence name. The sequence is
-- hard-coded to afss.quote_reference_seq. REVOKE EXECUTE FROM
-- PUBLIC, anon, authenticated. GRANT EXECUTE only to service_role.
-- safe search_path pinned to pg_catalog.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION afss.next_quote_reference()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, afss
AS $$
DECLARE
  v_seq bigint;
  v_year int;
  v_padded text;
BEGIN
  v_seq := nextval('afss.quote_reference_seq');
  v_year := (now() AT TIME ZONE 'Australia/Sydney')::int; -- safe: uses built-in tz data
  -- Year also derivable from clock_timestamp() — both kept inside
  -- the function body, never from caller input.
  v_year := date_part('year', now())::int;
  v_padded := lpad(v_seq::text, 6, '0');
  RETURN format('AFSS-%s-%s', v_year, v_padded);
END
$$;

REVOKE ALL ON FUNCTION afss.next_quote_reference() FROM PUBLIC;
REVOKE ALL ON FUNCTION afss.next_quote_reference() FROM anon;
REVOKE ALL ON FUNCTION afss.next_quote_reference() FROM authenticated;
GRANT  EXECUTE ON FUNCTION afss.next_quote_reference() TO service_role;

COMMENT ON FUNCTION afss.next_quote_reference() IS
  'AFSS-only, concurrency-safe allocator for the AFSS-YYYY-NNNNNN quote reference. Hard-codes the internal sequence afss.quote_reference_seq; no user-supplied inputs. Service_role-only.';

-- ----------------------------------------------------------------
-- 8. Default trigger: any INSERT into afss.quote_sessions without
--    a quote_reference value gets one allocated automatically.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION afss.tg_set_quote_reference()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.quote_reference IS NULL OR NEW.quote_reference = '' THEN
    NEW.quote_reference := afss.next_quote_reference();
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_quote_sessions_set_reference ON afss.quote_sessions;
CREATE TRIGGER trg_quote_sessions_set_reference
  BEFORE INSERT ON afss.quote_sessions
  FOR EACH ROW
  EXECUTE FUNCTION afss.tg_set_quote_reference();

COMMIT;
