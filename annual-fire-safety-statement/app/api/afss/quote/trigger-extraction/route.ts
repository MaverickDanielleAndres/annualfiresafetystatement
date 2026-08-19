import { NextRequest, NextResponse } from 'next/server';
import {
  findSessionIdByCookie,
  logActivity,
  updateSession,
} from '@/lib/afss/quote-session';
import { getActiveProcessor } from '@/lib/afss/document-processor';
import { getAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/afss/quote/trigger-extraction
 * Kicks off the document processor for the most recent uploaded
 * AFSS on the current session.
 *
 * IMPORTANT: we do NOT fake extraction. We call the configured
 * processor (Google Document AI) and store whatever it returns.
 * If no processor is configured, the extraction is marked
 * needs_review.
 *
 * After extraction we move the session to step 'quote' and trigger
 * pricing generation.
 */
export async function POST(_req: NextRequest) {
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
    .select('id, storage_bucket, storage_path, mime_type, analysis_status')
    .eq('quote_session_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!doc)
    return NextResponse.json(
      { error: 'No document to extract from.' },
      { status: 400 }
    );

  await updateSession(id, { status: 'processing', current_step: 'processing' });
  await logActivity(id, 'analysis_started', { document_id: (doc as any).id });

  const processor = await getActiveProcessor();

  // Mark extraction row as processing.
  await sb
    .schema('afss')
    .from('document_extractions')
    .update({
      processor: processor.name,
      processor_version: processor.version,
      status: 'processing',
      processing_started_at: new Date().toISOString(),
    })
    .eq('document_id', (doc as any).id);

  let result;
  try {
    result = await processor.process(
      (doc as any).storage_path,
      (doc as any).mime_type
    );
  } catch (e: any) {
    await sb
      .schema('afss')
      .from('document_extractions')
      .update({
        status: 'failed',
        processing_completed_at: new Date().toISOString(),
        error_code: 'PROCESSOR_EXCEPTION',
        error_message: e?.message ?? 'unknown',
      })
      .eq('document_id', (doc as any).id);
    await sb
      .schema('afss')
      .from('documents')
      .update({ analysis_status: 'failed' })
      .eq('id', (doc as any).id);
    await updateSession(id, {
      status: 'needs_review',
      current_step: 'quote',
    });
    await logActivity(id, 'analysis_failed', {
      error_code: 'PROCESSOR_EXCEPTION',
    });
    return NextResponse.json({ ok: false, status: 'failed' });
  }

  // Persist extraction result.
  await sb
    .schema('afss')
    .from('document_extractions')
    .update({
      status: result.status,
      statement_type: result.statement_type ?? null,
      building_name: result.building_name ?? null,
      building_address: result.building_address ?? null,
      assessment_date: result.assessment_date ?? null,
      detected_due_date: result.detected_due_date ?? null,
      raw_text: result.raw_text ?? null,
      raw_extraction_json: result.raw_extraction_json ?? {},
      confidence_score: result.confidence_score ?? null,
      processing_completed_at: new Date().toISOString(),
    })
    .eq('document_id', (doc as any).id);

  // Persist normalized measures.
  if (result.measures && result.measures.length > 0) {
    const { data: extractionRow } = await sb
      .schema('afss')
      .from('document_extractions')
      .select('id')
      .eq('document_id', (doc as any).id)
      .maybeSingle();
    const extractionId = (extractionRow as any)?.id as string;
    const rows = result.measures.map((m) => ({
      quote_session_id: id,
      document_extraction_id: extractionId,
      measure_name: m.measure_name,
      normalized_measure_key: m.normalized_measure_key ?? null,
      performance_standard: m.performance_standard ?? null,
      assessment_date: m.assessment_date ?? null,
      practitioner_name: m.practitioner_name ?? null,
      practitioner_reference: m.practitioner_reference ?? null,
      service_frequency: m.service_frequency ?? null,
      source_page: m.source_page ?? null,
      source_text: m.source_text ?? null,
      confidence_score: m.confidence_score ?? null,
      status: m.normalized_measure_key ? 'normalized' : 'unmapped',
    }));
    if (rows.length > 0)
      await sb.schema('afss').from('fire_safety_measures').insert(rows);
  }

  // Update document analysis_status.
  await sb
    .schema('afss')
    .from('documents')
    .update({ analysis_status: result.status })
    .eq('id', (doc as any).id);

  await logActivity(id, 'analysis_completed', {
    status: result.status,
    confidence: result.confidence_score ?? null,
  });

  await updateSession(id, {
    status: result.status === 'needs_review' ? 'needs_review' : 'processing',
    current_step: 'quote',
  });

  return NextResponse.json({ ok: true, status: result.status });
}