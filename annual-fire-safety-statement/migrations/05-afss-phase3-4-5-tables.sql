-- =============================================================
-- AFSS 05 — Phase 3, 4, 5 Tables
-- Adds:
--   * afss.document_extractions  (Phase 3)
--   * afss.fire_safety_measures  (Phase 3)
--   * afss.pricing_rules         (Phase 4)
--   * afss.quotes                (Phase 4)
--   * afss.quote_line_items      (Phase 4)
--   * afss.payments              (Phase 5)
-- =============================================================

BEGIN;

-- =============================================================
-- TABLE: afss.document_extractions
-- =============================================================
CREATE TABLE afss.document_extractions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  quote_session_id UUID NOT NULL
    REFERENCES afss.quote_sessions(id) ON DELETE CASCADE,
  document_id UUID NOT NULL
    REFERENCES afss.documents(id) ON DELETE CASCADE,

  processor TEXT NOT NULL,
  processor_version TEXT,

  status TEXT NOT NULL DEFAULT 'pending',

  statement_type TEXT,
  building_name  TEXT,
  building_address TEXT,

  assessment_date  DATE,
  detected_due_date DATE,

  raw_text TEXT,
  raw_extraction_json JSONB NOT NULL DEFAULT '{}'::jsonb,

  confidence_score NUMERIC(4,3),

  processing_started_at   TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,

  error_code    TEXT,
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT doc_extract_status_valid CHECK (status IN (
    'pending','processing','completed','partial','failed','needs_review'
  )),
  CONSTRAINT doc_extract_confidence_range CHECK (
    confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)
  )
);

COMMENT ON TABLE afss.document_extractions IS
  'Result of running a document processor over a customer AFSS document.';

CREATE INDEX idx_doc_extract_quote_session_id
  ON afss.document_extractions (quote_session_id);
CREATE INDEX idx_doc_extract_document_id
  ON afss.document_extractions (document_id);
CREATE INDEX idx_doc_extract_status
  ON afss.document_extractions (status);
CREATE INDEX idx_doc_extract_processor
  ON afss.document_extractions (processor);
CREATE UNIQUE INDEX doc_extract_one_per_document
  ON afss.document_extractions (document_id);

CREATE TRIGGER trg_doc_extract_updated_at
  BEFORE UPDATE ON afss.document_extractions
  FOR EACH ROW
  EXECUTE PROCEDURE extensions.moddatetime(updated_at);

-- =============================================================
-- TABLE: afss.fire_safety_measures
-- =============================================================
CREATE TABLE afss.fire_safety_measures (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  quote_session_id UUID NOT NULL
    REFERENCES afss.quote_sessions(id) ON DELETE CASCADE,
  document_extraction_id UUID
    REFERENCES afss.document_extractions(id) ON DELETE CASCADE,

  measure_name TEXT NOT NULL,
  normalized_measure_key TEXT,

  performance_standard TEXT,
  assessment_date DATE,

  practitioner_name TEXT,
  practitioner_reference TEXT,

  service_frequency TEXT,

  source_page INTEGER,
  source_text TEXT,

  confidence_score NUMERIC(4,3),

  status TEXT NOT NULL DEFAULT 'detected',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fsm_confidence_range CHECK (
    confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)
  ),
  CONSTRAINT fsm_status_valid CHECK (status IN (
    'detected','normalized','needs_review','unmapped'
  ))
);

COMMENT ON TABLE afss.fire_safety_measures IS
  'Normalized rows of detected fire safety measures from an AFSS extraction.';

CREATE INDEX idx_fsm_quote_session_id
  ON afss.fire_safety_measures (quote_session_id);
CREATE INDEX idx_fsm_extraction_id
  ON afss.fire_safety_measures (document_extraction_id);
CREATE INDEX idx_fsm_normalized_key
  ON afss.fire_safety_measures (normalized_measure_key)
  WHERE normalized_measure_key IS NOT NULL;
CREATE INDEX idx_fsm_status
  ON afss.fire_safety_measures (status);

CREATE TRIGGER trg_fsm_updated_at
  BEFORE UPDATE ON afss.fire_safety_measures
  FOR EACH ROW
  EXECUTE PROCEDURE extensions.moddatetime(updated_at);

-- =============================================================
-- TABLE: afss.pricing_rules
-- =============================================================
CREATE TABLE afss.pricing_rules (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  rule_type TEXT NOT NULL,
  rule_key  TEXT NOT NULL,

  name        TEXT NOT NULL,
  description TEXT,

  calculation_type TEXT NOT NULL,

  amount      NUMERIC(12,2),
  percentage  NUMERIC(5,2),
  multiplier  NUMERIC(6,3),

  priority INTEGER NOT NULL DEFAULT 100,

  conditions_json JSONB NOT NULL DEFAULT '{}'::jsonb,

  environment TEXT NOT NULL DEFAULT 'production',
  active BOOLEAN NOT NULL DEFAULT FALSE,

  effective_from DATE,
  effective_to   DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pricing_rule_type_valid CHECK (rule_type IN (
    'base','measure','travel','urgency','minimum','adjustment'
  )),
  CONSTRAINT pricing_calc_type_valid CHECK (calculation_type IN (
    'fixed','per_unit','percentage','multiplier'
  )),
  CONSTRAINT pricing_environment_valid CHECK (environment IN (
    'production','test'
  )),
  CONSTRAINT pricing_rule_key_unique UNIQUE (rule_type, rule_key, environment)
);

COMMENT ON TABLE afss.pricing_rules IS
  'Auditable deterministic pricing inputs. Production rules only active=true and environment=production. Test rules carry environment=test.';

CREATE INDEX idx_pricing_rules_active
  ON afss.pricing_rules (active)
  WHERE active = TRUE;
CREATE INDEX idx_pricing_rules_type
  ON afss.pricing_rules (rule_type);

CREATE TRIGGER trg_pricing_rules_updated_at
  BEFORE UPDATE ON afss.pricing_rules
  FOR EACH ROW
  EXECUTE PROCEDURE extensions.moddatetime(updated_at);

-- =============================================================
-- TABLE: afss.quotes
-- =============================================================
CREATE TABLE afss.quotes (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  quote_session_id UUID NOT NULL
    REFERENCES afss.quote_sessions(id) ON DELETE RESTRICT,

  quote_number TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,

  status TEXT NOT NULL DEFAULT 'draft',

  base_amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  measures_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
  travel_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  adjustments_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

  subtotal  NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

  currency TEXT NOT NULL DEFAULT 'AUD',

  calculation_snapshot_json JSONB NOT NULL DEFAULT '{}'::jsonb,

  requires_manual_review BOOLEAN NOT NULL DEFAULT FALSE,
  review_reason TEXT,

  calculated_at TIMESTAMPTZ,
  approved_at   TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT quotes_status_valid CHECK (status IN (
    'draft','automatic','manual_review_required','sent','accepted',
    'expired','superseded'
  )),
  CONSTRAINT quotes_currency_len CHECK (char_length(currency) = 3),
  CONSTRAINT quotes_non_negative CHECK (
    base_amount >= 0 AND measures_amount >= 0 AND travel_amount >= 0
    AND adjustments_amount >= 0 AND subtotal >= 0 AND gst_amount >= 0
    AND total_amount >= 0
  ),
  CONSTRAINT quotes_number_unique UNIQUE (quote_number)
);

COMMENT ON TABLE afss.quotes IS
  'Quote versions. Audit snapshot preserves reproducibility. '
  'RESTRICT parent delete — quotes are financial records.';

CREATE INDEX idx_quotes_quote_session_id
  ON afss.quotes (quote_session_id);
CREATE INDEX idx_quotes_status
  ON afss.quotes (status);
CREATE INDEX idx_quotes_requires_review
  ON afss.quotes (requires_manual_review)
  WHERE requires_manual_review = TRUE;
CREATE INDEX idx_quotes_session_version
  ON afss.quotes (quote_session_id, version DESC);

CREATE TRIGGER trg_quotes_updated_at
  BEFORE UPDATE ON afss.quotes
  FOR EACH ROW
  EXECUTE PROCEDURE extensions.moddatetime(updated_at);

-- =============================================================
-- TABLE: afss.quote_line_items
-- =============================================================
CREATE TABLE afss.quote_line_items (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  quote_id UUID NOT NULL
    REFERENCES afss.quotes(id) ON DELETE CASCADE,

  line_type TEXT NOT NULL,
  reference_key TEXT,

  description TEXT NOT NULL,
  quantity    NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

  sort_order INTEGER NOT NULL DEFAULT 100,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT quote_li_type_valid CHECK (line_type IN (
    'base','measure','travel','adjustment','gst'
  )),
  CONSTRAINT quote_li_non_negative CHECK (
    quantity >= 0 AND unit_amount >= 0 AND total_amount >= 0
  )
);

COMMENT ON TABLE afss.quote_line_items IS
  'Explainable breakdown of a quote. Sum equals quote.total_amount.';

CREATE INDEX idx_quote_li_quote_id
  ON afss.quote_line_items (quote_id);
CREATE INDEX idx_quote_li_quote_sort
  ON afss.quote_line_items (quote_id, sort_order);

-- =============================================================
-- TABLE: afss.payments
-- =============================================================
CREATE TABLE afss.payments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  quote_id UUID
    REFERENCES afss.quotes(id) ON DELETE RESTRICT,
  quote_session_id UUID NOT NULL
    REFERENCES afss.quote_sessions(id) ON DELETE RESTRICT,

  provider TEXT NOT NULL DEFAULT 'stripe',

  provider_payment_id TEXT,
  provider_checkout_id TEXT,

  amount   NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AUD',

  status TEXT NOT NULL DEFAULT 'requires_payment_method',

  payment_type TEXT,

  blocked_by_business_rule BOOLEAN NOT NULL DEFAULT TRUE,
  blocked_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  paid_at     TIMESTAMPTZ,
  failed_at   TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  CONSTRAINT payments_status_valid CHECK (status IN (
    'requires_payment_method','requires_confirmation','processing',
    'succeeded','failed','canceled','refunded'
  )),
  CONSTRAINT payments_payment_type_valid CHECK (
    payment_type IS NULL OR payment_type IN (
      'full','deposit','booking_fee','assessment_fee'
    )
  ),
  CONSTRAINT payments_currency_len CHECK (char_length(currency) = 3),
  CONSTRAINT payments_amount_positive CHECK (amount > 0),
  CONSTRAINT payments_provider_payment_unique UNIQUE (provider, provider_payment_id)
);

COMMENT ON TABLE afss.payments IS
  'Payment records (Stripe etc.). Live charging is BLOCKED_BY_BUSINESS_RULE '
  'until Pete/Ken confirms payment model.';

CREATE INDEX idx_payments_quote_id
  ON afss.payments (quote_id)
  WHERE quote_id IS NOT NULL;
CREATE INDEX idx_payments_quote_session_id
  ON afss.payments (quote_session_id);
CREATE INDEX idx_payments_status
  ON afss.payments (status);
CREATE INDEX idx_payments_blocked
  ON afss.payments (blocked_by_business_rule)
  WHERE blocked_by_business_rule = TRUE;

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON afss.payments
  FOR EACH ROW
  EXECUTE PROCEDURE extensions.moddatetime(updated_at);

-- =============================================================
-- RLS for new tables
-- =============================================================
ALTER TABLE afss.document_extractions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE afss.fire_safety_measures  ENABLE ROW LEVEL SECURITY;
ALTER TABLE afss.pricing_rules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE afss.quotes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE afss.quote_line_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE afss.payments              ENABLE ROW LEVEL SECURITY;

ALTER TABLE afss.document_extractions  FORCE ROW LEVEL SECURITY;
ALTER TABLE afss.fire_safety_measures  FORCE ROW LEVEL SECURITY;
ALTER TABLE afss.pricing_rules         FORCE ROW LEVEL SECURITY;
ALTER TABLE afss.quotes                FORCE ROW LEVEL SECURITY;
ALTER TABLE afss.quote_line_items      FORCE ROW LEVEL SECURITY;
ALTER TABLE afss.payments              FORCE ROW LEVEL SECURITY;

REVOKE ALL ON afss.document_extractions  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON afss.fire_safety_measures  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON afss.pricing_rules         FROM PUBLIC, anon, authenticated;
REVOKE ALL ON afss.quotes                FROM PUBLIC, anon, authenticated;
REVOKE ALL ON afss.quote_line_items      FROM PUBLIC, anon, authenticated;
REVOKE ALL ON afss.payments              FROM PUBLIC, anon, authenticated;

COMMIT;