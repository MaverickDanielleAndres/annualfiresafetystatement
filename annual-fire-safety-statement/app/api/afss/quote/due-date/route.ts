import { NextRequest, NextResponse } from 'next/server';
import {
  findSessionIdByCookie,
  logActivity,
  updateSession,
} from '@/lib/afss/quote-session';
import { validateDueDate } from '@/lib/afss/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/afss/quote/due-date
 * Step 4 — save the AFSS due date (or "I'm not sure").
 *
 * Body: { due_date: 'YYYY-MM-DD' | null }
 *  * null/empty → due_date_known=false, afss_due_date=null
 *  * valid date → due_date_known=true,  afss_due_date=date
 */
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const id = await findSessionIdByCookie();
  if (!id)
    return NextResponse.json(
      { error: 'No active quote session.' },
      { status: 401 }
    );

  const r = validateDueDate(body?.due_date);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });

  try {
    await updateSession(id, {
      afss_due_date: r.value.date,
      due_date_known: r.value.known,
      status: 'processing',
      current_step: 'quote',
    });
    await logActivity(id, r.value.known ? 'due_date_saved' : 'due_date_unsure', {
      known: r.value.known,
      date: r.value.date,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Failed to save due date.' },
      { status: 500 }
    );
  }
}