-- Other Income (Rishad, 12 Nov 2026). Additive only: two new tables and their starting heads.
-- Nothing existing is changed. Each entry posts to ledger_entries (source_type 'other_income', kind 'income')
-- like Collections do, so Cash & Bank, Fund Overview, Dashboard and Reports pick it up.
-- Run in one transaction. Take a backup first (see RESULT.md).

BEGIN;

CREATE TABLE income_heads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 99,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);
ALTER TABLE income_heads ENABLE ROW LEVEL SECURITY;

CREATE TABLE other_income_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  head_id uuid NOT NULL REFERENCES income_heads(id) ON DELETE RESTRICT,
  fund_id uuid NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
  account_id uuid NOT NULL REFERENCES cash_accounts(id) ON DELETE RESTRICT,
  date date NOT NULL,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  received_from text,
  receipt_number text NOT NULL,
  book_number text,
  note text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX other_income_entries_date_idx ON other_income_entries (tenant_id, date DESC);
CREATE INDEX other_income_entries_head_idx ON other_income_entries (head_id);
ALTER TABLE other_income_entries ENABLE ROW LEVEL SECURITY;

-- Starting heads from the spec. The admin can rename or deactivate them later.
INSERT INTO income_heads (tenant_id, name, sort_order)
SELECT t.id, h.name, h.ord
FROM tenants t
CROSS JOIN (VALUES
  ('Hall / Auditorium hire', 1),
  ('Ambulance / Vehicle hire', 2),
  ('Sale of old items / scrap', 3),
  ('Auction', 4),
  ('Bank interest', 5),
  ('Certificate / Registration fees', 6),
  ('Cemetery charges', 7),
  ('Miscellaneous', 8)
) AS h(name, ord)
ON CONFLICT (tenant_id, name) DO NOTHING;

COMMIT;

-- Rollback (only if no entries were saved; entries also have ledger lines with source_type 'other_income'):
-- BEGIN; DROP TABLE other_income_entries; DROP TABLE income_heads; COMMIT;
