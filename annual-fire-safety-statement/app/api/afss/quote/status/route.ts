import { NextResponse } from 'next/server';
import {
  findSessionIdByCookie,
  getSessionSummary,
} from '@/lib/afss/quote-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/afss/quote/status
 * Returns the current quote session summary for the requesting
 * visitor (resolved via cookie). Used by the UI to resume after
 * a refresh.
 */
export async function GET() {
  const id = await findSessionIdByCookie();
  if (!id) return NextResponse.json({ ok: true, session: null });
  const summary = await getSessionSummary(id);
  return NextResponse.json({ ok: true, session: summary });
}