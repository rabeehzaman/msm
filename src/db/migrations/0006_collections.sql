-- Additive only: one new table, one new fund row, nullable columns on three existing tables.

INSERT INTO funds (tenant_id, type, name, is_restricted)
SELECT id, 'general', 'Nercha Fund', false FROM tenants
ON CONFLICT (tenant_id, name) DO NOTHING;

CREATE TABLE collection_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'general' CHECK (kind IN ('general', 'friday', 'subscription')),
  fund_id uuid REFERENCES funds(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 99,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

INSERT INTO collection_categories (tenant_id, name, kind, fund_id, sort_order)
SELECT t.id, c.name, c.kind, f.id, c.ord
FROM tenants t
CROSS JOIN (VALUES
  ('Friday (Jumu''ah) Collection', 'friday', 'General Fund', 1),
  ('General Fund', 'general', 'General Fund', 2),
  ('Nercha Fund', 'general', 'Nercha Fund', 3),
  ('Subscription', 'subscription', 'General Fund', 4),
  ('Donations', 'general', 'General Fund', 5)
) AS c(name, kind, fund, ord)
JOIN funds f ON f.tenant_id = t.id AND f.name = c.fund
ON CONFLICT (tenant_id, name) DO NOTHING;

ALTER TABLE income_entries ADD COLUMN account_id uuid REFERENCES cash_accounts(id) ON DELETE RESTRICT;
ALTER TABLE income_entries ADD COLUMN category_id uuid REFERENCES collection_categories(id) ON DELETE SET NULL;
ALTER TABLE income_entries ADD COLUMN house_name text;
ALTER TABLE income_entries ADD COLUMN book_number text;
ALTER TABLE income_entries ADD COLUMN created_by uuid;
ALTER TABLE income_entries ADD COLUMN updated_by uuid;

ALTER TABLE friday_collections ADD COLUMN account_id uuid REFERENCES cash_accounts(id) ON DELETE RESTRICT;
ALTER TABLE friday_collections ADD COLUMN counted_by text;
ALTER TABLE friday_collections ADD COLUMN created_by uuid;
ALTER TABLE friday_collections ADD COLUMN updated_by uuid;

ALTER TABLE subscription_payments ADD COLUMN account_id uuid REFERENCES cash_accounts(id) ON DELETE RESTRICT;
ALTER TABLE subscription_payments ADD COLUMN book_number text;
ALTER TABLE subscription_payments ADD COLUMN periods jsonb NOT NULL DEFAULT '[]';
ALTER TABLE subscription_payments ADD COLUMN note text;
ALTER TABLE subscription_payments ADD COLUMN created_by uuid;
ALTER TABLE subscription_payments ADD COLUMN updated_by uuid;
CREATE INDEX subscription_payments_book_idx ON subscription_payments (tenant_id, book_number, receipt_number);

ALTER TABLE collection_categories ENABLE ROW LEVEL SECURITY;
