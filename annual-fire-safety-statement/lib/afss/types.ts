/**
 * AFSS — shared types.
 *
 * Kept narrow on purpose. Database is the source of truth for column
 * types; these mirror the public-facing shape of the wizard.
 */

export type QuoteStep =
  | 'contact'
  | 'property'
  | 'building_confirmation'
  | 'document'
  | 'due_date'
  | 'processing'
  | 'quote'
  | 'complete';

export type QuoteStatus =
  | 'started'
  | 'contact_saved'
  | 'property_saved'
  | 'building_confirmed'
  | 'document_uploaded'
  | 'awaiting_document'
  | 'processing'
  | 'needs_review'
  | 'quoted'
  | 'accepted'
  | 'paid'
  | 'abandoned'
  | 'cancelled'
  | 'expired';

export type DocumentChoice = 'uploaded' | 'cannot_find' | 'later';

export type DocumentType =
  | 'afss'
  | 'fire_safety_schedule'
  | 'building_photo'
  | 'other_supporting_document';

export type AnalysisStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'partial'
  | 'failed'
  | 'needs_review';

export type QuoteDbStatus =
  | 'draft'
  | 'automatic'
  | 'manual_review_required'
  | 'sent'
  | 'accepted'
  | 'expired'
  | 'superseded';

export type PaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded';

export type PaymentType =
  | 'full'
  | 'deposit'
  | 'booking_fee'
  | 'assessment_fee';

export interface QuoteSessionSummary {
  quote_reference: string;
  status: QuoteStatus;
  current_step: QuoteStep;
  document_choice: DocumentChoice | null;
  requires_manual_review: boolean;
  quote_number: string | null;
  quote_status: QuoteDbStatus | null;
  total_amount: number | null;
  currency: string;
  blocked_by_business_rule: boolean;
}