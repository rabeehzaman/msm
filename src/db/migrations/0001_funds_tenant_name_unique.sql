-- Additive: prevents duplicate default funds when pages race on first load.
-- Pre-checked: no existing (tenant_id, name) duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS funds_tenant_id_name_key ON funds (tenant_id, name);
