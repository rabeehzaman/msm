-- Additive only: new tables, one new enum set, default rows for the new tables.
-- No existing table or row is changed.

-- ---------- App users and roles ----------
CREATE TYPE app_role AS ENUM ('admin', 'entry', 'viewer');

CREATE TABLE app_users (
  user_id uuid PRIMARY KEY,                 -- auth.users.id
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  role app_role,                            -- NULL = waiting for an admin to give access
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Keeps the current day-to-day login working. Other accounts wait for an admin.
INSERT INTO app_users (user_id, tenant_id, email, display_name, role)
SELECT u.id, t.id, u.email, 'Admin', 'admin'
FROM auth.users u
CROSS JOIN LATERAL (SELECT id FROM tenants ORDER BY created_at LIMIT 1) t
WHERE u.email = 'admin@mahallu.app'
ON CONFLICT (user_id) DO NOTHING;

-- ---------- Cash and bank accounts ----------
CREATE TYPE cash_account_type AS ENUM ('cash', 'bank');

CREATE TABLE cash_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  type cash_account_type NOT NULL,
  bank_name text,
  account_number text,
  opening_balance numeric(14, 2) NOT NULL DEFAULT 0,
  opening_date date NOT NULL DEFAULT CURRENT_DATE,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

INSERT INTO cash_accounts (tenant_id, name, type)
SELECT id, 'Cash in Hand', 'cash' FROM tenants
ON CONFLICT (tenant_id, name) DO NOTHING;

-- ---------- Ledger: every rupee in or out of an account ----------
-- Balances are always calculated from this table, never stored.
CREATE TYPE ledger_direction AS ENUM ('in', 'out');
CREATE TYPE ledger_kind AS ENUM ('income', 'expense', 'transfer');

CREATE TABLE ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES cash_accounts(id) ON DELETE RESTRICT,
  date date NOT NULL,
  direction ledger_direction NOT NULL,
  kind ledger_kind NOT NULL,
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  source_type text NOT NULL,
  source_id uuid NOT NULL,
  category text NOT NULL,
  fund_id uuid REFERENCES funds(id) ON DELETE SET NULL,
  party text,
  house_name text,
  receipt_number text,
  book_number text,
  note text,
  created_by uuid,
  created_by_name text,
  updated_by uuid,
  updated_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- One money record can only ever hit the books once per direction.
  UNIQUE (source_type, source_id, direction)
);
CREATE INDEX ledger_entries_account_date_idx ON ledger_entries (tenant_id, account_id, date, created_at);
CREATE INDEX ledger_entries_date_idx ON ledger_entries (tenant_id, date);

-- ---------- Transfers between accounts ----------
CREATE TABLE cash_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  from_account_id uuid NOT NULL REFERENCES cash_accounts(id) ON DELETE RESTRICT,
  to_account_id uuid NOT NULL REFERENCES cash_accounts(id) ON DELETE RESTRICT,
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  date date NOT NULL,
  note text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (from_account_id <> to_account_id)
);

-- ---------- Automatic receipt numbers ----------
CREATE TABLE receipt_counters (
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  series text NOT NULL,
  last_number integer NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id, series)
);

-- ---------- Security: only the app's server connection can reach these tables ----------
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_counters ENABLE ROW LEVEL SECURITY;

-- Lets a signed-in person read their own role row (used by storage rules for photos).
CREATE POLICY app_users_read_own ON app_users
  FOR SELECT TO authenticated USING (user_id = auth.uid());
