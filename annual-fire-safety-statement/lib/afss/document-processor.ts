/**
 * AFSS — document processor adapter.
 *
 * Abstract interface so the database (afss.document_extractions) stays
 * provider-agnostic. Implementations live in sibling files (e.g.
 * google-document-ai.ts) and are selected at runtime based on
 * environment configuration.
 *
 * IMPORTANT: this is an EXTRACTOR. It pulls structured information
 * out of the document. It is NOT a pricing engine.
 */

import type { AnalysisStatus } from '@/lib/afss/types';

export interface ExtractionResult {
  status: AnalysisStatus;

  statement_type?: string | null;
  building_name?: string | null;
  building_address?: string | null;
  assessment_date?: string | null;     // YYYY-MM-DD
  detected_due_date?: string | null;   // YYYY-MM-DD

  raw_text?: string | null;
  raw_extraction_json?: Record<string, unknown>;

  confidence_score?: number | null;

  measures?: ExtractedMeasure[];
}

export interface ExtractedMeasure {
  measure_name: string;
  normalized_measure_key?: string | null; // UNMAPPED if cannot normalise
  performance_standard?: string | null;
  assessment_date?: string | null;
  practitioner_name?: string | null;
  practitioner_reference?: string | null;
  service_frequency?: string | null;
  source_page?: number | null;
  source_text?: string | null;
  confidence_score?: number | null;
}

export interface DocumentProcessor {
  readonly name: string;
  readonly version: string;
  process(documentPath: string, mimeType: string): Promise<ExtractionResult>;
}

/**
 * Provider selection. The active provider is whichever exports a
 * default DocumentProcessor implementation AND whose required env
 * vars are configured. Falls back to a stub that returns
 * 'needs_review' — which is the correct production behaviour when
 * no real processor is configured.
 */
export async function getActiveProcessor(): Promise<DocumentProcessor> {
  try {
    const mod = await import('./google-document-ai-processor');
    if (await mod.isConfigured()) {
      return new mod.GoogleDocumentAIProcessor();
    }
  } catch {
    // ignore
  }
  // Fallback: no real processor available — return needs_review.
  return new StubNeedsReviewProcessor();
}

class StubNeedsReviewProcessor implements DocumentProcessor {
  readonly name = 'stub_needs_review';
  readonly version = '0.0.0';
  async process(): Promise<ExtractionResult> {
    return {
      status: 'needs_review',
      raw_text: null,
      raw_extraction_json: {},
      confidence_score: null,
      measures: [],
    };
  }
}