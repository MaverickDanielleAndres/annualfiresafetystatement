import { NextRequest, NextResponse } from 'next/server';
import {
  findSessionIdByCookie,
  logActivity,
  updateSession,
} from '@/lib/afss/quote-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/afss/quote/document-fallback
 * Customer selects "I CAN'T FIND MY AFSS →".
 *
 * Preserves all previous data. Sets document_choice = 'cannot_find'
 * and advances to the due-date step.
 */
export async function POST(_req: NextRequest) {
  const id = await findSessionIdByCookie();
  if (!id)
    return NextResponse.json(
      { error: 'No active quote session.' },
      { status: 401 }
    );

  try {
    await updateSession(id, {
      document_choice: 'cannot_find',
      status: 'awaiting_document',
      current_step: 'due_date',
    });
    await logActivity(id, 'document_missing', {
      reason: 'customer_cannot_find',
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Failed to record fallback.' },
      { status: 500 }
    );
  }
}