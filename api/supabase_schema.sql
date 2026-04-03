-- ============================================================
-- SUPABASE SQL SCHEMA FOR FLEET MANAGEMENT + CONTRACT SYSTEM
-- ============================================================
-- HOW TO USE:
-- 1. Go to your Supabase project dashboard
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "+ New query"
-- 4. Paste this ENTIRE file into the editor
-- 5. Click "Run" (the green play button)
-- 6. All tables will be created automatically
-- ============================================================


-- ──────────────────────────────────────────────
-- TABLE 1: vehicles
-- Stores every vehicle in Anirudh's fleet
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  make          TEXT NOT NULL,
  model         TEXT NOT NULL,
  year          TEXT,
  colour        TEXT,
  rego          TEXT,
  vin           TEXT,

  weekly_rate   NUMERIC(10,2) DEFAULT 0,
  bond_amount   NUMERIC(10,2) DEFAULT 0,
  dlf_amount    NUMERIC(10,2) DEFAULT 0,
  car_cost            NUMERIC(10,2) DEFAULT 0,
  monthly_repayment   NUMERIC(10,2) DEFAULT 0,
  interest_total_5y   NUMERIC(10,2) DEFAULT 0,
  insurance_monthly   NUMERIC(10,2) DEFAULT 0,
  cpv_yearly          NUMERIC(10,2) DEFAULT 0,
  service_total_5y    NUMERIC(10,2) DEFAULT 0,
  misc_total_5y       NUMERIC(10,2) DEFAULT 0,
  purchase_date       DATE,
  first_installment_date DATE,
  loan_term_months    INTEGER DEFAULT 60,

  lessee_name   TEXT,
  lessee_email  TEXT,
  lessee_phone  TEXT,

  status        TEXT DEFAULT 'available'
                CHECK (status IN ('active', 'available', 'maintenance')),

  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);


-- ──────────────────────────────────────────────
-- TABLE 2: expenses
-- Tracks all outgoings per vehicle
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id    UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  category      TEXT NOT NULL
                CHECK (category IN ('insurance', 'rego', 'servicing', 'fuel', 'repairs', 'tolls')),
  description   TEXT,
  amount        NUMERIC(10,2) NOT NULL,
  expense_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT now()
);


-- ──────────────────────────────────────────────
-- TABLE 3: contracts
-- Stores every dispatched lease contract
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contracts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  lessor_name     TEXT,
  lessor_address  TEXT,
  lessor_phone    TEXT,

  client_name     TEXT NOT NULL,
  client_email    TEXT NOT NULL,
  client_address  TEXT,
  client_licence  TEXT,
  client_state    TEXT,
  client_expiry   TEXT,

  vehicle_make    TEXT,
  vehicle_model   TEXT,
  vehicle_year    TEXT,
  vehicle_rego    TEXT,
  vehicle_vin     TEXT,

  start_date      TEXT,
  end_date        TEXT,
  bond_amount     TEXT,
  weekly_payment  TEXT,
  dlf_amount      TEXT,

  signature       TEXT,
  signed_at       TIMESTAMPTZ,

  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending', 'signed')),

  created_at      TIMESTAMPTZ DEFAULT now()
);


-- ──────────────────────────────────────────────
-- AUTO-UPDATE TRIGGER for vehicles.updated_at
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();


-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────────
ALTER TABLE vehicles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on vehicles"  ON vehicles  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on expenses"  ON expenses  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on contracts" ON contracts FOR ALL USING (true) WITH CHECK (true);
