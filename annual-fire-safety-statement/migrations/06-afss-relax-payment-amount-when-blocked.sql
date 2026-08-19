-- =============================================================
-- AFSS 06 — Allow amount=0 only when blocked by business rule
-- =============================================================

BEGIN;

ALTER TABLE afss.payments
  DROP CONSTRAINT payments_amount_positive;

ALTER TABLE afss.payments
  ADD CONSTRAINT payments_amount_rule CHECK (
    amount > 0
    OR (amount = 0 AND blocked_by_business_rule = TRUE)
  );

COMMENT ON CONSTRAINT payments_amount_rule ON afss.payments IS
  'amount > 0 OR (amount = 0 AND blocked_by_business_rule = TRUE).';

COMMIT;