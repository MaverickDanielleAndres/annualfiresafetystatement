-- =============================================================
-- AFSS 07 — Provider-neutral extensions + simulation support
--
-- Additive migration. All statements are idempotent (IF NOT EXISTS).
-- Safe to apply against the production schema.
--
-- Adds:
--   * afss.properties.address_provider / address_provider_id / address_provider_json
--   * afss.properties.street_image_provider / street_image_* fields
--   * afss.quote_sessions.quote_mode / final_submitted_at
--   * afss.quotes.is_simulation (default false)
--   * afss.payments.payment_mode (real | simulation)
--   * afss.activity_events new event types (extension of CHECK)
--   * afss.quote_submissions (final submission record — separate
--     from payments so a customer can choose contact-first without
--     triggering a payment row)
--   * Index for activity_events by type
--
-- Does NOT touch: any non-afss schema, any other table, the public
-- schema, the afss-private Storage bucket, or auth config.
-- =============================================================

BEGIN;

-- ----------------------------------------------------------------
-- afss.properties — provider-neutral columns
-- ----------------------------------------------------------------
ALTER TABLE afss.properties
  ADD COLUMN IF NOT EXISTS address_provider        TEXT,
  ADD COLUMN IF NOT EXISTS address_provider_id     TEXT,
  ADD COLUMN IF NOT EXISTS address_provider_json   JSONB;

ALTER TABLE afss.properties
  ADD COLUMN IF NOT EXISTS street_image_provider       TEXT,
  ADD COLUMN IF NOT EXISTS street_image_id             TEXT,
  ADD COLUMN IF NOT EXISTS street_image_sequence_id    TEXT,
  ADD COLUMN IF NOT EXISTS street_image_captured_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS street_image_thumb_url      TEXT,
  ADD COLUMN IF NOT EXISTS street_image_json           JSONB,
  ADD COLUMN IF NOT EXISTS street_image_search_radius_m INTEGER NOT NULL DEFAULT 250;

COMMENT ON COLUMN afss.properties.address_provider        IS 'External provider of the address (geoapify, geoscape, manual, etc.). Provider-neutral.';
COMMENT ON COLUMN afss.properties.address_provider_id     IS 'External provider''s stable id for this address.';
COMMENT ON COLUMN afss.properties.street_image_provider   IS 'External provider of the street-level imagery (mapillary, manual, none).';

CREATE INDEX IF NOT EXISTS idx_properties_address_provider_id
  ON afss.properties (address_provider, address_provider_id)
  WHERE address_provider IS NOT NULL;

-- ----------------------------------------------------------------
-- afss.quote_sessions — final-submission tracking
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

CREATE INDEX IF NOT EXISTS idx_quote_sessions_final_submitted_at
  ON afss.quote_sessions (final_submitted_at)
  WHERE final_submitted_at IS NOT NULL;

-- ----------------------------------------------------------------
-- afss.quotes — explicit "is simulation" flag.
-- Production quotes stay false. Simulation flow marks true.
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

CREATE INDEX IF NOT EXISTS idx_quotes_is_simulation
  ON afss.quotes (is_simulation)
  WHERE is_simulation = TRUE;

-- ----------------------------------------------------------------
-- afss.payments — add payment_mode (real | simulation)
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

CREATE INDEX IF NOT EXISTS idx_payments_payment_mode
  ON afss.payments (payment_mode)
  WHERE payment_mode = 'simulation';

-- ----------------------------------------------------------------
-- afss.activity_events — extend allowed event types
-- (must DROP and re-ADD the CHECK constraint; Postgres can't
--  ALTER CHECK in place.)
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
-- afss.quote_submissions — final persisted submission state.
-- Separate from payments so contact-first customers still get a
-- row of record. idempotent on (quote_session_id).
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
CREATE INDEX IF NOT EXISTS idx_quote_submissions_payment_preference
  ON afss.quote_submissions (payment_preference);

ALTER TABLE afss.quote_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE afss.quote_submissions FORCE ROW LEVEL SECURITY;
REVOKE ALL ON afss.quote_submissions FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE afss.quote_submissions IS
  'One row per FINAL submitted quote. Used to atomically record the customer''s payment preference (contact-first or simulated pay-now) and to make the final state persistent + resumable after a refresh.';

COMMIT;
