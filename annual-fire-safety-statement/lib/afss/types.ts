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
  | 'complete'
  | 'submitted';

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

export type PaymentPreference = 'pay_now_simulation' | 'contact_first';

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
  /** Simulation vs real quote engine. Drives UI note. */
  quote_mode?: 'simulation' | 'real' | null;
  /** Customer's final payment preference, if any. */
  payment_preference?: PaymentPreference | null;
  /** When the customer clicked submit and a submission row was written. */
  final_submitted_at?: string | null;
  /** True when a quote_submissions row exists for this session. */
  is_submitted?: boolean;
  /** Pre-submit resume info — surfaced so the flow can pick up where it left off. */
  resume_step?: string | null;
}

export interface QuoteSubmissionSummary {
  id: string;
  submission_reference: string;
  payment_preference: PaymentPreference;
  payment_mode: 'real' | 'simulation';
  payment_status: 'simulated_paid' | 'deferred' | 'pending' | 'succeeded' | 'failed';
  submitted_at: string;
  quote_number: string | null;
  total_amount: number | null;
  currency: string;
  is_simulation: boolean;
}
