-- =============================================================
-- AFSS 01 — Schema Foundation
-- Creates the `afss` schema with all tables, indexes, triggers,
-- RLS, and grants required for the Instant Quote workflow.
--
-- Isolation strategy:
--   * Dedicated PostgreSQL schema `afss`.
--   * All AFSS access is via server-side service role (bypasses RLS).
--   * No PostgREST exposure of `afss` to anon/authenticated.
--   * REVOKE removes any default privileges.
--
-- This migration does NOT touch the `public` schema, `storage`, or any
-- other shared object in the database.
-- =============================================================

BEGIN;

-- ----------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------
-- pgcrypto and uuid-ossp are pre-installed. We additionally need
-- citext (case-insensitive email) and moddatetime (updated_at helper).
CREATE EXTENSION IF NOT EXISTS citext     WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;

-- ----------------------------------------------------------------
-- Dedicated schema
-- ----------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS afss;

COMMENT ON SCHEMA afss IS
  'AFSS (Annual Fire Safety Statement) Instant Quote workflow. '
  'Isolated from other applications sharing this Supabase project.';

-- ----------------------------------------------------------------
-- Sequence: human-readable quote references
-- ----------------------------------------------------------------
-- Application builds AFSS-YYYY-NNNNNN using this sequence and the
-- current year. Sequence is monotonic; year prefix carries the year.
CREATE SEQUENCE IF NOT EXISTS afss.quote_reference_seq
  START WITH 1
  INCREMENT BY 1
  NO MAXVALUE
  CACHE 1;

COMMENT ON SEQUENCE afss.quote_reference_seq IS
  'Monotonic counter for AFSS-YYYY-NNNNNN quote references.';

-- =============================================================
-- TABLE: afss.quote_sessions
-- =============================================================
CREATE TABLE afss.quote_sessions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  quote_reference TEXT NOT NULL,
  session_token_hash TEXT,

  status TEXT NOT NULL DEFAULT 'started',
  current_step TEXT NOT NULL DEFAULT 'contact',

  first_name       TEXT,
  email            CITEXT,
  email_normalized CITEXT,
  mobile           TEXT,
  mobile_normalized TEXT,

  afss_due_date  DATE,
  due_date_known BOOLEAN NOT NULL DEFAULT FALSE,

  document_choice TEXT,

  source        TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_term      TEXT,
  utm_content   TEXT,
  referrer_url  TEXT,
  landing_path  TEXT,

  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at     TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT quote_sessions_quote_reference_unique UNIQUE (quote_reference),
  CONSTRAINT quote_sessions_status_valid CHECK (status IN (
    'started','contact_saved','property_saved','building_confirmed',
    'document_uploaded','awaiting_document','processing','needs_review',
    'quoted','accepted','paid','abandoned','cancelled','expired'
  )),
  CONSTRAINT quote_sessions_current_step_valid CHECK (current_step IN (
    'contact','property','building_confirmation','document',
    'due_date','processing','quote','complete'
  )),
  CONSTRAINT quote_sessions_document_choice_valid CHECK (
    document_choice IS NULL
    OR document_choice IN ('uploaded','cannot_find','later')
  ),
  CONSTRAINT quote_sessions_first_name_len CHECK (
    first_name IS NULL OR char_length(first_name) BETWEEN 1 AND 100
  ),
  CONSTRAINT quote_sessions_email_len CHECK (
    email IS NULL OR char_length(email) <= 320
  ),
  CONSTRAINT quote_sessions_mobile_len CHECK (
    mobile IS NULL OR char_length(mobile) BETWEEN 6 AND 30
  )
);

COMMENT ON TABLE afss.quote_sessions IS
  'One row per AFSS Instant Quote customer session, including abandoned.';

CREATE INDEX idx_quote_sessions_session_token_hash
  ON afss.quote_sessions (session_token_hash)
  WHERE session_token_hash IS NOT NULL;
CREATE INDEX idx_quote_sessions_email_normalized
  ON afss.quote_sessions (email_normalized)
  WHERE email_normalized IS NOT NULL;
CREATE INDEX idx_quote_sessions_mobile_normalized
  ON afss.quote_sessions (mobile_normalized)
  WHERE mobile_normalized IS NOT NULL;
CREATE INDEX idx_quote_sessions_status
  ON afss.quote_sessions (status);
CREATE INDEX idx_quote_sessions_last_activity_at
  ON afss.quote_sessions (last_activity_at);
CREATE INDEX idx_quote_sessions_created_at
  ON afss.quote_sessions (created_at);
CREATE INDEX idx_quote_sessions_afss_due_date
  ON afss.quote_sessions (afss_due_date)
  WHERE afss_due_date IS NOT NULL;
CREATE INDEX idx_quote_sessions_status_last_activity
  ON afss.quote_sessions (status, last_activity_at DESC);

-- =============================================================
-- TABLE: afss.properties
-- =============================================================
CREATE TABLE afss.properties (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  quote_session_id UUID NOT NULL
    REFERENCES afss.quote_sessions(id) ON DELETE CASCADE,

  address_line_1    TEXT,
  address_line_2    TEXT,
  suburb            TEXT,
  state             TEXT,
  postcode          TEXT,
  country           TEXT NOT NULL DEFAULT 'AU',
  formatted_address TEXT,

  google_place_id TEXT,
  latitude       DOUBLE PRECISION,
  longitude      DOUBLE PRECISION,

  streetview_pano_id   TEXT,
  streetview_heading   DOUBLE PRECISION,
  streetview_pitch     DOUBLE PRECISION,

  building_confirmed    BOOLEAN     NOT NULL DEFAULT FALSE,
  building_confirmed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT properties_one_per_session UNIQUE (quote_session_id),
  CONSTRAINT properties_state_valid CHECK (
    state IS NULL OR state IN
      ('NSW','VIC','QLD','WA','SA','TAS','ACT','NT')
  ),
  CONSTRAINT properties_country_len CHECK (char_length(country) = 2),
  CONSTRAINT properties_postcode_format CHECK (
    postcode IS NULL OR postcode ~ '^[0-9]{4}$'
  ),
  CONSTRAINT properties_latitude_range CHECK (
    latitude IS NULL OR latitude BETWEEN -90 AND 90
  ),
  CONSTRAINT properties_longitude_range CHECK (
    longitude IS NULL OR longitude BETWEEN -180 AND 180
  )
);

CREATE INDEX idx_properties_quote_session_id
  ON afss.properties (quote_session_id);
CREATE INDEX idx_properties_google_place_id
  ON afss.properties (google_place_id)
  WHERE google_place_id IS NOT NULL;
CREATE INDEX idx_properties_state_postcode
  ON afss.properties (state, postcode)
  WHERE state IS NOT NULL;

-- =============================================================
-- TABLE: afss.documents
-- =============================================================
CREATE TABLE afss.documents (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  quote_session_id UUID NOT NULL
    REFERENCES afss.quote_sessions(id) ON DELETE CASCADE,

  document_type TEXT NOT NULL,

  storage_bucket TEXT NOT NULL,
  storage_path   TEXT NOT NULL,

  original_filename TEXT NOT NULL,
  mime_type         TEXT NOT NULL,
  file_size_bytes   BIGINT NOT NULL,

  checksum_sha256 TEXT,

  upload_status   TEXT NOT NULL DEFAULT 'pending',
  analysis_status TEXT NOT NULL DEFAULT 'pending',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT documents_document_type_valid CHECK (
    document_type IN (
      'afss','fire_safety_schedule','building_photo','other_supporting_document'
    )
  ),
  CONSTRAINT documents_upload_status_valid CHECK (
    upload_status IN ('pending','uploaded','failed','deleted')
  ),
  CONSTRAINT documents_analysis_status_valid CHECK (
    analysis_status IN (
      'pending','processing','completed','partial','failed','needs_review'
    )
  ),
  CONSTRAINT documents_file_size_positive CHECK (file_size_bytes > 0),
  CONSTRAINT documents_mime_type_allowed CHECK (
    mime_type IN (
      'application/pdf','image/jpeg','image/png','image/tiff'
    )
  ),
  CONSTRAINT documents_storage_path_unique UNIQUE (storage_bucket, storage_path)
);

CREATE INDEX idx_documents_quote_session_id
  ON afss.documents (quote_session_id);
CREATE INDEX idx_documents_document_type
  ON afss.documents (document_type);
CREATE INDEX idx_documents_upload_status
  ON afss.documents (upload_status);
CREATE INDEX idx_documents_analysis_status
  ON afss.documents (analysis_status);

-- =============================================================
-- TABLE: afss.activity_events
-- =============================================================
CREATE TABLE afss.activity_events (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  quote_session_id UUID NOT NULL
    REFERENCES afss.quote_sessions(id) ON DELETE CASCADE,

  event_type     TEXT  NOT NULL,
  metadata_json  JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT activity_events_type_valid CHECK (event_type IN (
    'quote_started','contact_saved','address_selected',
    'building_confirmed','building_change_requested',
    'document_uploaded','document_upload_failed','document_missing',
    'due_date_saved',
    'analysis_started','analysis_completed','analysis_failed',
    'quote_generated','quote_review_required','quote_viewed','quote_accepted',
    'payment_started','payment_completed',
    'modal_closed','session_resumed'
  ))
);

CREATE INDEX idx_activity_events_quote_session_id
  ON afss.activity_events (quote_session_id);
CREATE INDEX idx_activity_events_event_type
  ON afss.activity_events (event_type);
CREATE INDEX idx_activity_events_created_at
  ON afss.activity_events (created_at);
CREATE INDEX idx_activity_events_session_created
  ON afss.activity_events (quote_session_id, created_at DESC);

-- =============================================================
-- TRIGGERS: updated_at automation via extensions.moddatetime
-- =============================================================
CREATE TRIGGER trg_quote_sessions_updated_at
  BEFORE UPDATE ON afss.quote_sessions
  FOR EACH ROW
  EXECUTE PROCEDURE extensions.moddatetime(updated_at);

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON afss.properties
  FOR EACH ROW
  EXECUTE PROCEDURE extensions.moddatetime(updated_at);

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON afss.documents
  FOR EACH ROW
  EXECUTE PROCEDURE extensions.moddatetime(updated_at);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================
ALTER TABLE afss.quote_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE afss.properties      ENABLE ROW LEVEL SECURITY;
ALTER TABLE afss.documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE afss.activity_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE afss.quote_sessions  FORCE ROW LEVEL SECURITY;
ALTER TABLE afss.properties      FORCE ROW LEVEL SECURITY;
ALTER TABLE afss.documents       FORCE ROW LEVEL SECURITY;
ALTER TABLE afss.activity_events FORCE ROW LEVEL SECURITY;

REVOKE ALL ON afss.quote_sessions  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON afss.properties      FROM PUBLIC, anon, authenticated;
REVOKE ALL ON afss.documents       FROM PUBLIC, anon, authenticated;
REVOKE ALL ON afss.activity_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE afss.quote_reference_seq
  FROM PUBLIC, anon, authenticated;

COMMIT;