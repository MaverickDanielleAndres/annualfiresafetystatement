-- =============================================================
-- AFSS 03 — service_role Grants
--
-- The Next.js server uses the Supabase service_role key to connect
-- via PostgREST. PostgREST runs as `authenticator`, then switches
-- to `service_role` based on the JWT. `service_role` has the
-- BYPASSRLS attribute so RLS is skipped for it.
--
-- However `service_role` still needs schema-level USAGE and
-- table-level privileges. Without these grants, every server-side
-- call would fail with "permission denied for schema afss".
--
-- This migration grants the minimum required privileges to
-- `service_role`. anon / authenticated remain completely revoked.
-- =============================================================

BEGIN;

GRANT USAGE ON SCHEMA afss TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA afss
  TO service_role;

GRANT USAGE, SELECT
  ON ALL SEQUENCES IN SCHEMA afss
  TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA afss
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA afss
  GRANT USAGE, SELECT ON SEQUENCES TO service_role;

COMMIT;