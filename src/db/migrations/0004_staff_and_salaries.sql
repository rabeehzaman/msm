-- Additive only: new tables, plus one nullable column on room_tenancies (a table added in 0003).

-- Months before this date are not shown as pending. NULL means count from the start date.
ALTER TABLE room_tenancies ADD COLUMN dues_from date;

CREATE TYPE staff_role AS ENUM ('ustadh', 'cleaning', 'other');
CREATE TYPE cleaning_fee_mode AS ENUM ('none', 'included', 'separate');
CREATE TYPE allowance_mode AS ENUM ('lump', 'split');

CREATE TABLE staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  role staff_role NOT NULL DEFAULT 'ustadh',
  phone text,
  monthly_salary numeric(12, 2) NOT NULL DEFAULT 0,
  joining_date date NOT NULL,
  dues_from date,
  is_active boolean NOT NULL DEFAULT true,
  cleaning_fee numeric(12, 2) NOT NULL DEFAULT 0,
  cleaning_mode cleaning_fee_mode NOT NULL DEFAULT 'none',
  notes text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE salary_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  kind text NOT NULL DEFAULT 'salary' CHECK (kind IN ('salary', 'cleaning')),
  basic numeric(12, 2) NOT NULL DEFAULT 0,
  cleaning numeric(12, 2) NOT NULL DEFAULT 0,
  ramadan numeric(12, 2) NOT NULL DEFAULT 0,
  other_additions numeric(12, 2) NOT NULL DEFAULT 0,
  other_note text,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  paid_date date NOT NULL,
  account_id uuid NOT NULL REFERENCES cash_accounts(id) ON DELETE RESTRICT,
  note text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, year, month, kind)     -- a month can only be paid once
);
CREATE INDEX salary_payments_year_idx ON salary_payments (tenant_id, year, month);

CREATE TABLE ramadan_allowances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
  year integer NOT NULL,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  mode allowance_mode NOT NULL,
  months jsonb NOT NULL,                   -- e.g. [3] for a lump sum, [2,3,4] for a split
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ramadan_allowances_year_idx ON ramadan_allowances (tenant_id, year);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ramadan_allowances ENABLE ROW LEVEL SECURITY;
