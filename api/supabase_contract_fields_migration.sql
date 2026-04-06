-- ============================================================
-- MIGRATION: Add new contract fields to match rental_agreement.html
-- Run this in your Supabase SQL Editor (Project > SQL Editor > New Query)
-- ============================================================

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS lessor_email         TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_colour       TEXT,

  -- Emergency Contact
  ADD COLUMN IF NOT EXISTS emerg_name           TEXT,
  ADD COLUMN IF NOT EXISTS emerg_relationship   TEXT,
  ADD COLUMN IF NOT EXISTS emerg_phone          TEXT,

  -- Additional rental terms
  ADD COLUMN IF NOT EXISTS bond_due_date        TEXT,
  ADD COLUMN IF NOT EXISTS insurance_excess     TEXT DEFAULT '$1,000',

  -- Vehicle condition at handover
  ADD COLUMN IF NOT EXISTS ho_odometer          TEXT,
  ADD COLUMN IF NOT EXISTS ho_fuel              TEXT,
  ADD COLUMN IF NOT EXISTS ho_damage            TEXT,

  -- External contract link
  ADD COLUMN IF NOT EXISTS external_link        TEXT;

-- ── Fix expenses category constraint to include cpv and misc ──
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;
ALTER TABLE expenses
  ADD CONSTRAINT expenses_category_check
  CHECK (category IN ('insurance', 'rego', 'servicing', 'fuel', 'repairs', 'tolls', 'cpv', 'misc'));

-- ── Add rego_expiry to vehicles if missing ──
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS rego_expiry          DATE,
  ADD COLUMN IF NOT EXISTS external_contract_url TEXT;
