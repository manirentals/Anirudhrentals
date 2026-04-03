-- Run this in Supabase SQL Editor if your tables already exist
-- It adds the new 5-year vehicle cost fields used by the fleet dashboard.

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS car_cost NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_repayment NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interest_total_5y NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS insurance_monthly NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cpv_yearly NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_total_5y NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS misc_total_5y NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS purchase_date DATE,
  ADD COLUMN IF NOT EXISTS first_installment_date DATE,
  ADD COLUMN IF NOT EXISTS loan_term_months INTEGER DEFAULT 60;
