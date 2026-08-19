import { NextRequest, NextResponse } from 'next/server';
import {
  startOrResumeSession,
  logActivity,
  getCurrentSession,
  updateSession,
} from '@/lib/afss/quote-session';
import {
  validateFirstName,
  validateEmail,
  validateMobile,
} from '@/lib/afss/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/afss/quote/contact
 *
 * Step 1 — save customer contact. Creates the quote session if no
 * cookie, otherwise resumes it. Cookie is written server-side.
 *
 * Always returns the latest server-side status so the client only
 * has to update local state from a single field.
 */
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const fnR = validateFirstName(body?.first_name);
  if (!fnR.ok)
    return NextResponse.json({ error: fnR.error }, { status: 400 });
  const emR = validateEmail(body?.email);
  if (!emR.ok)
    return NextResponse.json({ error: emR.error }, { status: 400 });
  const moR = validateMobile(body?.mobile);
  if (!moR.ok)
    return NextResponse.json({ error: moR.error }, { status: 400 });

  const utm = body?.utm ?? {};
  const ref = req.headers.get('referer') ?? null;

  try {
    const { id, quote_reference, isNew } = await startOrResumeSession({
      first_name: fnR.value,
      email: emR.value,
      email_normalized: emR.value,
      mobile: moR.value,
      mobile_normalized: moR.value,
      source: typeof body?.source === 'string' ? body.source : null,
      utm_source: typeof utm?.source === 'string' ? utm.source : null,
      utm_medium: typeof utm?.medium === 'string' ? utm.medium : null,
      utm_campaign: typeof utm?.campaign === 'string' ? utm.campaign : null,
      utm_term: typeof utm?.term === 'string' ? utm.term : null,
      utm_content: typeof utm?.content === 'string' ? utm.content : null,
      referrer_url: ref,
      landing_path:
        typeof body?.landing_path === 'string' ? body.landing_path : null,
    });

    if (!isNew) {
      const sb = (await import('@/lib/supabase/admin')).getAdminSupabase();
      await sb
        .schema('afss')
        .from('quote_sessions')
        .update({
          first_name: fnR.value,
          email: emR.value,
          email_normalized: emR.value,
          mobile: moR.value,
          mobile_normalized: moR.value,
          status: 'contact_saved',
          current_step: 'property',
        })
        .eq('id', id);
      await logActivity(id, 'contact_saved', { resumed: true });
    } else {
      // New session: advance straight to step 2 so the wizard
      // resumes correctly on reload and so QuoteFlow's auto-sync
      // doesn't snap the customer back to step 1.
      const sb = (await import('@/lib/supabase/admin')).getAdminSupabase();
      await sb
        .schema('afss')
        .from('quote_sessions')
        .update({ current_step: 'property' })
        .eq('id', id);
    }

    const sess = await getCurrentSession();
    return NextResponse.json({
      ok: true,
      session_id: id,
      quote_reference,
      current_step: sess?.current_step ?? 'contact',
      status: sess?.status ?? 'contact_saved',
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Failed to save contact.' },
      { status: 500 }
    );
  }
}
