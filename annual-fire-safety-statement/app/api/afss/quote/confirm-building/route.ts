import { NextRequest, NextResponse } from 'next/server';
import {
  findSessionIdByCookie,
  logActivity,
  updateSession,
} from '@/lib/afss/quote-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/afss/quote/confirm-building
 * Step 2 confirmation — "YES, THAT'S IT" or "CHANGE ADDRESS".
 *
 * Body: { confirmed: boolean }
 *
 * confirmed=true   → set building_confirmed = true, advance to
 *                    document step, log building_confirmed.
 * confirmed=false  → keep current_step at 'property', log
 *                    building_change_requested so the wizard can
 *                    re-display the address step.
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

  const confirmed = body?.confirmed === true;

  try {
    if (confirmed) {
      const sb = (await import('@/lib/supabase/admin')).getAdminSupabase();
      // Update property + session in one transaction-ish flow.
      await sb
        .schema('afss')
        .from('properties')
        .update({
          building_confirmed: true,
          building_confirmed_at: new Date().toISOString(),
        })
        .eq('quote_session_id', id);

      await updateSession(id, {
        status: 'building_confirmed',
        current_step: 'document',
      });
      await logActivity(id, 'building_confirmed');
    } else {
      await updateSession(id, {
        status: 'property_saved',
        current_step: 'property',
      });
      await logActivity(id, 'building_change_requested');
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Failed to confirm building.' },
      { status: 500 }
    );
  }
}