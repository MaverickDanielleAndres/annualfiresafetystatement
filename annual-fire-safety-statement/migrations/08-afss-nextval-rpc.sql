-- =============================================================
-- AFSS 08 — public.nextval RPC
--
-- lib/afss/reference.ts calls sb.rpc('nextval', { sequence_name })
-- to allocate the next quote_reference_seq value. PostgREST looks
-- up functions in the `public` schema; without an explicit RPC
-- wrapper around the built-in nextval() the call returns
-- "function public.nextval(sequence_name) not found".
--
-- This migration adds a tiny stable wrapper that delegates to
-- Postgres's first-class nextval() and returns it as a numeric.
--
-- Idempotent. Safe to apply on top of the existing schema.
-- =============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.nextval(sequence_name text)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v bigint;
BEGIN
  EXECUTE format('SELECT nextval(%L)', sequence_name) INTO v;
  RETURN v;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'nextval: % (%)', SQLERRM, sequence_name;
END;
$$;

REVOKE ALL ON FUNCTION public.nextval(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.nextval(text) TO service_role;

COMMENT ON FUNCTION public.nextval(text) IS
  'Service-only wrapper around Postgres nextval(). Required because lib/afss/reference.ts reaches it via sb.rpc().';

COMMIT;
