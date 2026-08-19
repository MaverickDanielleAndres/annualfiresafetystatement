-- =============================================================
-- AFSS 02 — Private Storage Bucket
-- Creates the dedicated, namespaced, PRIVATE Storage bucket for
-- AFSS customer documents.
--
-- Bucket characteristics:
--   * id  : afss-private
--   * public: false (private — signed URLs only)
--   * file_size_limit: 50 MiB
--   * allowed MIME types: PDF, JPEG, PNG, TIFF
--
-- No storage policies are added for anon/authenticated. All
-- upload/download/list operations are performed server-side via
-- the service role key, which bypasses storage RLS.
-- =============================================================

BEGIN;

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'afss-private',
  'afss-private',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public            = EXCLUDED.public,
  file_size_limit   = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMIT;