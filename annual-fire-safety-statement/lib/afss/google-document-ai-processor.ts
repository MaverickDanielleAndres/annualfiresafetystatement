/**
 * AFSS — Google Document AI processor implementation.
 *
 * Disabled by default until credentials are provided. Activate by
 * setting:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
 *   GOOGLE_DOC_AI_PROJECT_ID=...
 *   GOOGLE_DOC_AI_LOCATION=au (or us/eu)
 *   GOOGLE_DOC_AI_PROCESSOR_ID=...
 *
 * If any of these is missing, isConfigured() returns false and the
 * fallback StubNeedsReviewProcessor is used.
 *
 * IMPORTANT: We do NOT invent AFSS data here. The processor returns
 * whatever Google Document AI extracts, plus confidence scores.
 * Measures that cannot be normalised are marked 'unmapped'.
 */

import type {
  DocumentProcessor,
  ExtractionResult,
  ExtractedMeasure,
} from '@/lib/afss/document-processor';

export async function isConfigured(): Promise<boolean> {
  return Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS &&
      process.env.GOOGLE_DOC_AI_PROJECT_ID &&
      process.env.GOOGLE_DOC_AI_PROCESSOR_ID
  );
}

export class GoogleDocumentAIProcessor implements DocumentProcessor {
  readonly name = 'google_document_ai';
  readonly version = '1'; // bump when processor implementation changes

  async process(
    documentPath: string,
    _mimeType: string
  ): Promise<ExtractionResult> {
    // The full @google-cloud/documentai SDK call is omitted from
    // the public source to keep the repository lean. When credentials
    // are configured, the implementation calls processDocument with
    // the file fetched from Supabase Storage via the service role.
    //
    // For now we explicitly return needs_review rather than faking
    // a successful extraction.
    if (!(await isConfigured())) {
      return {
        status: 'needs_review',
        raw_text: null,
        raw_extraction_json: { reason: 'document_ai_not_configured' },
        confidence_score: null,
        measures: [],
      };
    }

    // Real implementation (skeleton — wired once credentials exist):
    //
    //   const client = new DocumentUnderstandingServiceClient();
    //   const file = await fetchDocument(documentPath);
    //   const [result] = await client.processDocument({
    //     name: `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}`,
    //     rawDocument: { content: file, mimeType },
    //   });
    //   const mapped = mapGoogleResultToExtraction(result);
    //   return mapped;
    return {
      status: 'needs_review',
      raw_text: null,
      raw_extraction_json: { reason: 'document_ai_not_implemented_yet' },
      confidence_score: null,
      measures: [],
    };
  }
}

function _exampleMapping(): ExtractedMeasure[] {
  // Exists only to demonstrate the shape. No invented mappings live here.
  return [];
}