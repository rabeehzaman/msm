-- Additive only: new tables, nullable columns on expense_entries, a private photo bucket.

CREATE TABLE expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 99,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

INSERT INTO expense_categories (tenant_id, name, sort_order)
SELECT t.id, c.name, c.ord
FROM tenants t
CROSS JOIN (VALUES
  ('Electricity (KSEB)', 1),
  ('Water', 2),
  ('Maintenance & Repairs', 3),
  ('Cleaning Materials', 4),
  ('Events/Programmes', 5),
  ('Stationery', 6),
  ('Miscellaneous', 7)
) AS c(name, ord)
ON CONFLICT (tenant_id, name) DO NOTHING;

ALTER TABLE expense_entries ADD COLUMN account_id uuid REFERENCES cash_accounts(id) ON DELETE RESTRICT;
ALTER TABLE expense_entries ADD COLUMN category_id uuid REFERENCES expense_categories(id) ON DELETE SET NULL;
ALTER TABLE expense_entries ADD COLUMN photo_path text;
ALTER TABLE expense_entries ADD COLUMN source_type text;   -- 'bill' or 'maintenance' when posted automatically
ALTER TABLE expense_entries ADD COLUMN source_id uuid;
ALTER TABLE expense_entries ADD COLUMN created_by uuid;
ALTER TABLE expense_entries ADD COLUMN updated_by uuid;

-- A regular bill's consumer number, e.g. separate KSEB meters for the Pally and the Madrasa.
CREATE TABLE bill_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  consumer_number text,
  category_id uuid REFERENCES expense_categories(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bill_account_id uuid NOT NULL REFERENCES bill_accounts(id) ON DELETE RESTRICT,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  due_date date,
  paid_date date,
  account_id uuid REFERENCES cash_accounts(id) ON DELETE RESTRICT,
  expense_id uuid REFERENCES expense_entries(id) ON DELETE RESTRICT,
  note text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bill_account_id, year, month)
);
CREATE INDEX bills_due_idx ON bills (tenant_id, paid_date, due_date);

CREATE TABLE maintenance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  date date NOT NULL,
  building_id uuid REFERENCES buildings(id) ON DELETE RESTRICT,
  room_id uuid REFERENCES rooms(id) ON DELETE RESTRICT,
  area text,
  work text NOT NULL,
  done_by text,
  cost numeric(12, 2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  photo_path text,
  paid_date date,
  account_id uuid REFERENCES cash_accounts(id) ON DELETE RESTRICT,
  expense_id uuid REFERENCES expense_entries(id) ON DELETE RESTRICT,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX maintenance_logs_date_idx ON maintenance_logs (tenant_id, date);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Private bucket for bill, maintenance and student photos: only people with a role can see them,
-- only Admin and Entry users can add them.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('mahallu-files', 'mahallu-files', false, 10485760, ARRAY['image/*'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY mahallu_files_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'mahallu-files'
    AND EXISTS (
      SELECT 1 FROM public.app_users u
      WHERE u.user_id = auth.uid() AND u.role IS NOT NULL AND u.is_active
    )
  );

CREATE POLICY mahallu_files_add ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'mahallu-files'
    AND EXISTS (
      SELECT 1 FROM public.app_users u
      WHERE u.user_id = auth.uid() AND u.role IN ('admin', 'entry') AND u.is_active
    )
  );
