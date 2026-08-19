import { NextResponse } from 'next/server';
import {
  findSessionIdByCookie,
  logActivity,
  updateSession,
} from '@/lib/afss/quote-session';
import { getAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/afss/quote/current-document-delete
 *
 * Removes the most recently uploaded document for the current
 * session: deletes the storage object AND marks the row as
 * deleted (so the audit trail stays intact).
 *
 * Used by the "Remove" button in the upload step.
 */
export async function POST() {
  const id = await findSessionIdByCookie();
  if (!id)
    return NextResponse.json(
      { error: 'No active quote session.' },
      { status: 401 }
    );

  const sb = getAdminSupabase();
  const { data: doc } = await sb
    .schema('afss')
    .from('documents')
    .select('id, storage_bucket, storage_path')
    .eq('quote_session_id', id)
    .eq('upload_status', 'uploaded')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!doc)
    return NextResponse.json({ ok: true, removed: false });

  try {
    await sb.storage
      .from((doc as any).storage_bucket)
      .remove([(doc as any).storage_path]);
  } catch {
    // best effort
  }
  await sb
    .schema('afss')
    .from('documents')
    .update({ upload_status: 'deleted', analysis_status: 'failed' })
    .eq('id', (doc as any).id);

  await updateSession(id, {
    document_choice: 'later',
    status: 'awaiting_document',
  });
  await logActivity(id, 'document_deleted', {
    document_id: (doc as any).id,
  });

  return NextResponse.json({ ok: true, removed: true });
}
