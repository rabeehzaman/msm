-- Additive only: new tables plus the room layout the spec asks to pre-load.

CREATE TABLE buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE floors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  building_id uuid NOT NULL REFERENCES buildings(id) ON DELETE RESTRICT,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (building_id, name)
);

CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  floor_id uuid NOT NULL REFERENCES floors(id) ON DELETE RESTRICT,
  name text NOT NULL,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (floor_id, name)
);

-- One row per tenant per stay. The room is Occupied while a row has no end date.
CREATE TABLE room_tenancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  tenant_name text NOT NULL,
  phone text,
  shop_name text,
  start_date date NOT NULL,
  end_date date,
  notes text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR end_date >= start_date)
);
CREATE UNIQUE INDEX room_tenancies_one_open_per_room ON room_tenancies (room_id) WHERE end_date IS NULL;
CREATE INDEX room_tenancies_room_idx ON room_tenancies (room_id);

-- Rent history: the amount on the latest row at or before a month is that month's rent.
CREATE TABLE room_rents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  amount numeric(12, 2) NOT NULL CHECK (amount >= 0),
  effective_from date NOT NULL,          -- always the 1st of a month
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, effective_from)
);

CREATE TABLE rent_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  tenancy_id uuid NOT NULL REFERENCES room_tenancies(id) ON DELETE RESTRICT,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  paid_date date NOT NULL,
  account_id uuid NOT NULL REFERENCES cash_accounts(id) ON DELETE RESTRICT,
  receipt_number text NOT NULL,
  note text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, year, month)          -- a month can only be paid once
);
CREATE INDEX rent_payments_year_idx ON rent_payments (tenant_id, year);

ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_tenancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_rents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;

-- Spec section 4: pre-load this layout. Rooms start Vacant, with no tenant or rent.
INSERT INTO buildings (tenant_id, name, sort_order)
SELECT t.id, b.name, b.ord
FROM tenants t
CROSS JOIN (VALUES ('Pally Building', 1), ('Madrasa Building', 2)) AS b(name, ord)
ON CONFLICT (tenant_id, name) DO NOTHING;

INSERT INTO floors (tenant_id, building_id, name, sort_order)
SELECT b.tenant_id, b.id, f.name, f.ord
FROM buildings b
JOIN (VALUES
  ('Pally Building', 'Ground Floor', 1),
  ('Pally Building', 'First Floor', 2),
  ('Madrasa Building', 'Ground Floor', 1)
) AS f(building, name, ord) ON f.building = b.name
ON CONFLICT (building_id, name) DO NOTHING;

INSERT INTO rooms (tenant_id, floor_id, name, sort_order)
SELECT f.tenant_id, f.id, r.name, r.ord
FROM floors f
CROSS JOIN (VALUES ('Room 1', 1), ('Room 2', 2), ('Room 3', 3)) AS r(name, ord)
ON CONFLICT (floor_id, name) DO NOTHING;
