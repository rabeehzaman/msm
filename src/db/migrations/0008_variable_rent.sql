-- Variable rent (Rishad, 12 Nov 2026).
-- Additive: one new column with a safe default, one new table, one new column on rent_payments.
-- Existing rooms stay Fixed. Existing payments keep their Rental Month (year, month) and stay part 1.
-- The Rental Month itself needs no change: rent_payments already stores year and month apart from paid_date.
-- Run in one transaction. Take a backup first (see RESULT.md).

BEGIN;

-- 1. Rent type, versioned with the rent history so a switch applies from a chosen month.
--    For a Variable row, amount is the optional usual / approximate rent (0 = none), never the amount due.
ALTER TABLE room_rents
  ADD COLUMN rent_type text NOT NULL DEFAULT 'fixed' CHECK (rent_type IN ('fixed', 'variable'));

-- 2. Each month's rent for a Variable room.
CREATE TABLE room_month_rents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  year integer NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, year, month)
);
CREATE INDEX room_month_rents_tenant_idx ON room_month_rents (tenant_id, year, month);
ALTER TABLE room_month_rents ENABLE ROW LEVEL SECURITY;

-- 3. A month can be paid in parts (₹3,000 then ₹1,500), Fixed or Variable (13 Nov 2026: all rooms).
--    Every existing row becomes part 1, so the new unique key holds them exactly as the old one did.
--    The app gives each extra payment the next part (max + 1) with the room row locked.
ALTER TABLE rent_payments ADD COLUMN part integer NOT NULL DEFAULT 1 CHECK (part >= 1);
CREATE UNIQUE INDEX rent_payments_room_month_part_key ON rent_payments (room_id, year, month, part);
-- The only non-additive step: the old one-payment-per-month key is replaced by the key above.
ALTER TABLE rent_payments DROP CONSTRAINT rent_payments_room_id_year_month_key;

COMMIT;

-- Rollback (only if no Variable room has been used yet and no month has more than one payment,
-- i.e. `select count(*) from rent_payments where part <> 1;` returns 0):
-- BEGIN;
-- ALTER TABLE rent_payments ADD CONSTRAINT rent_payments_room_id_year_month_key UNIQUE (room_id, year, month);
-- DROP INDEX rent_payments_room_month_part_key;
-- ALTER TABLE rent_payments DROP COLUMN part;
-- DROP TABLE room_month_rents;
-- ALTER TABLE room_rents DROP COLUMN rent_type;
-- COMMIT;
