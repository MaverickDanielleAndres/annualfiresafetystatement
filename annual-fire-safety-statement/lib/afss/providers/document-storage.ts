/**
 * AFSS — Document storage abstraction.
 *
 * Today: wraps Supabase Storage (private bucket `afss-private`).
 * Path layout (used by ALL uploads):
 *
 *   quote-sessions/<session_id>/documents/<document_id>/original.<ext>
 *
 * The session id is the parent UUID, the document id is the row's
 * UUID, the filename is original.<ext>. This keeps the storage
 * tree readable to admins and the database the source of truth.
 *
 * Customer names/emails are NEVER part of the storage path.
 *
 * If we ever migrate off Supabase Storage, this interface is the
 * only place that changes.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadInput {
  bucket: string;
  path: string;
  bytes: Uint8Array;
  contentType: string;
}

export interface DocumentStorage {
  readonly name: string;
  upload(input: UploadInput): Promise<{ ok: true } | { ok: false; reason: string }>;
  remove(bucket: string, path: string): Promise<void>;
}

export class SupabaseDocumentStorage implements DocumentStorage {
  readonly name = 'supabase';

  constructor(private readonly sb: SupabaseClient) {}

  async upload(input: UploadInput) {
    try {
      const { error } = await this.sb.storage
        .from(input.bucket)
        .upload(input.path, input.bytes, {
          contentType: input.contentType,
          cacheControl: 'private, max-age=0, no-store',
          upsert: false,
        });
      if (error) {
        return { ok: false as const, reason: error.message };
      }
      return { ok: true as const };
    } catch (e: any) {
      return { ok: false as const, reason: e?.message ?? 'unknown error' };
    }
  }

  async remove(bucket: string, path: string): Promise<void> {
    try {
      await this.sb.storage.from(bucket).remove([path]);
    } catch {
      // Best-effort; surface in audit logs elsewhere.
    }
  }
}

export function documentStoragePath(args: {
  sessionId: string;
  documentId: string;
  extension: string;
}): string {
  const safeExt = args.extension.replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'bin';
  return `quote-sessions/${args.sessionId}/documents/${args.documentId}/original.${safeExt}`;
}
