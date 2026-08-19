import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import {
  findSessionIdByCookie,
  logActivity,
  updateSession,
} from '@/lib/afss/quote-session';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  validateUploadedFile,
} from '@/lib/afss/validation';
import { getAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/afss/quote/document-upload
 * Step 3 — receive the AFSS file. Multipart form with field 'file'.
 *
 * Validates MIME + size, computes SHA-256, uploads to private
 * bucket afss-private, inserts documents row, updates session,
 * queues document_extractions row (status='pending').
 *
 * The actual extraction runs separately via the
 * /api/afss/quote/trigger-extraction endpoint (or scheduled job)
 * so this handler returns quickly.
 */
export async function POST(req: NextRequest) {
  const id = await findSessionIdByCookie();
  if (!id)
    return NextResponse.json(
      { error: 'No active quote session.' },
      { status: 401 }
    );

  const form = await req.formData().catch(() => null);
  if (!form)
    return NextResponse.json(
      { error: 'Expected multipart form.' },
      { status: 400 }
    );

  const file = form.get('file');
  if (!(file instanceof File))
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });

  const valid = validateUploadedFile(file);
  if (!valid.ok)
    return NextResponse.json({ error: valid.error }, { status: 400 });

  const documentTypeRaw = form.get('document_type');
  const documentType =
    documentTypeRaw === 'fire_safety_schedule'
      ? 'fire_safety_schedule'
      : 'afss';

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const checksumSha256 = createHash('sha256')
    .update(bytes)
    .digest('hex');

  const sb = getAdminSupabase();

  // Pre-allocate document UUID for the storage path.
  const { data: idRow, error: idErr } = await sb.rpc('uuid_generate_v4');
  // Fallback if RPC not present — build locally.
  let documentUuid: string;
  if (!idErr && idRow) {
    documentUuid = String(idRow);
  } else {
    documentUuid = crypto.randomUUID();
  }

  const ext = guessExtension(file.type, file.name);
  const storageBucket = 'afss-private';
  const storagePath =
    `quote-sessions/${id}/documents/${documentUuid}/original.${ext}`;

  try {
    const { error: upErr } = await sb.storage
      .from(storageBucket)
      .upload(storagePath, bytes, {
        contentType: file.type,
        upsert: false,
        cacheControl: 'private, max-age=0, no-store',
      });

    if (upErr) {
      await logActivity(id, 'document_upload_failed', {
        error: upErr.message,
      });
      return NextResponse.json(
        { error: 'Failed to store the file. Please try again.' },
        { status: 500 }
      );
    }

    const { data: docRow, error: docErr } = await sb
      .schema('afss')
      .from('documents')
      .insert({
        id: documentUuid,
        quote_session_id: id,
        document_type: documentType,
        storage_bucket: storageBucket,
        storage_path: storagePath,
        original_filename: sanitizeFilename(file.name),
        mime_type: file.type,
        file_size_bytes: file.size,
        checksum_sha256: checksumSha256,
        upload_status: 'uploaded',
        analysis_status: 'pending',
      })
      .select('id')
      .single();

    if (docErr) {
      // Compensate: remove the storage object we just wrote.
      await sb.storage.from(storageBucket).remove([storagePath]);
      return NextResponse.json(
        { error: 'Failed to record document metadata.' },
        { status: 500 }
      );
    }

    // Queue an extraction row (status='pending'). The actual
    // processor run is kicked off by /trigger-extraction.
    await sb.schema('afss').from('document_extractions').insert({
      document_id: documentUuid,
      quote_session_id: id,
      processor: 'pending', // replaced when processor runs
      status: 'pending',
    });

    await updateSession(id, {
      status: 'document_uploaded',
      current_step: 'due_date',
      document_choice: 'uploaded',
    });
    await logActivity(id, 'document_uploaded', {
      bytes: file.size,
      mime: file.type,
      document_id: documentUuid,
    });

    return NextResponse.json({
      ok: true,
      document_id: (docRow as any)?.id ?? documentUuid,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Upload failed.' },
      { status: 500 }
    );
  }
}

function guessExtension(mime: string, filename: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/tiff': 'tif',
  };
  if (mime in map) return map[mime];
  // Fallback to filename suffix.
  const m = filename.toLowerCase().match(/\.([a-z0-9]{2,5})$/);
  return m ? m[1] : 'bin';
}

function sanitizeFilename(s: string): string {
  return s
    .replace(/[^A-Za-z0-9._\- ]/g, '_')
    .slice(0, 200)
    .trim();
}