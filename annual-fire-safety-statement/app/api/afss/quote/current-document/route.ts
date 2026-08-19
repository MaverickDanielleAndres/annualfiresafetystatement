import { NextResponse } from 'next/server';
import { findSessionIdByCookie } from '@/lib/afss/quote-session';
import { getAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/afss/quote/current-document
 *
 * Returns the most recently uploaded document metadata for the
 * current session, so the upload step can show its current state
 * after a refresh / back-nav.
 */
export async function GET() {
  const id = await findSessionIdByCookie();
  if (!id) return NextResponse.json({ ok: true, document: null });

  const sb = getAdminSupabase();
  const { data } = await sb
    .schema('afss')
    .from('documents')
    .select(
      'id, original_filename, mime_type, file_size_bytes, upload_status, created_at'
    )
    .eq('quote_session_id', id)
    .eq('upload_status', 'uploaded')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return NextResponse.json({ ok: true, document: null });
  return NextResponse.json({
    ok: true,
    document: {
      document_id: (data as any).id,
      filename: (data as any).original_filename,
      size_bytes: Number((data as any).file_size_bytes),
      mime_type: (data as any).mime_type,
      uploaded_at: (data as any).created_at,
    },
  });
}
