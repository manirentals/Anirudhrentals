# ARCHITECTURE.md — System Architecture & Data Flow

> **Read this first.** This file gives any developer or AI coding agent a complete understanding of the entire system: what every file does, how data flows between components, and how the pieces connect.

---

## 1. System Overview

This project is the **MCR (Mani's Car Rentals) vehicle leasing business management tool** with two tightly connected parts:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| `fleet_dashboard.html` | Standalone HTML + JS | Central hub: manage vehicles, track expenses, send contracts |
| `api/` folder | Next.js 14 (App Router) | Backend: email dispatch, contract signing page, Supabase integration |
| `car_lease_fillable.html` | Standalone HTML | Offline contract generator (Print to PDF) |

**The fleet dashboard is the primary interface.** Everything starts there.

---

## 2. Data Flow: How Everything Connects

```
┌──────────────────────────────────────────────────────────────────────┐
│                    fleet_dashboard.html                              │
│                    (Central Hub)                                     │
│                                                                      │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────────────┐   │
│  │ Add Vehicle  │   │ Log Expense  │   │ Send Contract           │   │
│  │ (modal)      │   │ (modal)      │   │ (modal)                 │   │
│  │              │   │              │   │                         │   │
│  │  Just asset   │   │ Per vehicle  │   │ Pre-fills vehicle data  │   │
│  details —    │   │ categorised  │   │ You enter: client,      │   │
│  NO lessee    │   │ actual       │   │ dates, RATE, BOND, DLF  │   │
│  info here    │   │ expenses     │   │ (saves back to vehicle) │   │
└──────┬───────┘   └──────┬───────┘   └───────────┬─────────────┘  │
│         │                  │                       │                 │
│         ▼                  ▼                       ▼                 │
│     Supabase          Supabase             POST {API_URL}/api/send  │
│    fleet_vehicles     fleet_expenses        (Next.js backend)        │
│                                                    │                 │
└────────────────────────────────────────────────────┼─────────────────┘
                                                     │
                                                     ▼
                                          ┌─────────────────────┐
                                          │  api/app/api/send/  │
                                          │  route.ts           │
                                          │                     │
                                          │  1. Stores contract │
                                          │     in Supabase     │
                                          │  2. Sends email via │
                                          │     Resend with a   │
                                          │     unique link     │
                                          └──────────┬──────────┘
                                                     │
                                                     ▼
                                          ┌─────────────────────┐
                                          │  Client receives    │
                                          │  email with link    │
                                          │  to /sign/[id]      │
                                          └──────────┬──────────┘
                                                     │
                                                     ▼
                                          ┌─────────────────────┐
                                          │  api/app/sign/      │
                                          │  [id]/page.tsx      │
                                          │                     │
                                          │  Fetches contract   │
                                          │  from Supabase by   │
                                          │  ID → renders full  │
                                          │  legal agreement +  │
                                          │  digital signature  │
                                          │  pad                │
                                          │                     │
                                          │  On sign → saves    │
                                          │  signature PNG,     │
                                          │  signed_at, and     │
                                          │  status='signed'    │
                                          │  to Supabase        │
                                          └─────────────────────┘
```

---

## 3. File-by-File Reference

### Root Directory

| File | What it does |
|------|-------------|
| `README.md` | Setup instructions, deployment steps, tech stack |
| `ARCHITECTURE.md` | **This file** — system design and data flow |
| `fleet_dashboard.html` | **Source dashboard file.** Vehicle registry, expense tracker logging actual outgoings, real-time rego countdown strip, active P&L dashboard, contract dispatch, and a Contracts tab showing live signing status. Reads/writes all data directly to Supabase via the JS CDN client. Three config constants at the top of the script: `API_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`. Lessee info and rental terms (Weekly Rate, Bond, DLF) are ONLY set via the "Send Contract" modal, never via "Add Vehicle" directly (though they save back to the vehicle record). |
| `car_lease_fillable.html` | Standalone fillable contract. Click "Configure Contract" → fill fields → "Print as PDF". No backend needed. |

### `api/` — Next.js Backend (deploy to Vercel)

| File | What it does |
|------|-------------|
| `package.json` | Dependencies: `next`, `react`, `@supabase/supabase-js`, `resend`, `react-signature-canvas` |
| `.env.example` | Template for required environment variables |
| `supabase_schema.sql` | SQL to create all 3 database tables. Paste into **Supabase → SQL Editor → Run** |
| `utils/supabase.ts` | Initialises the Supabase JS client using env vars. Uses `NEXT_PUBLIC_` prefix so it works in both server and client components. |
| `components/SignaturePad.tsx` | Touch-friendly signature canvas component (requires `"use client"`). Calls `onSave(dataUrl)` with the base64 PNG when the lessee submits. |
| `app/layout.tsx` | Root HTML layout, imports `globals.css` |
| `app/globals.css` | Design system: Inter font, Slate palette, Blue accent, glassmorphism modals |
| `public/fleet_dashboard.html` | Vercel-served homepage dashboard available at `/fleet_dashboard.html` |
| `app/page.tsx` | Redirects the site root to `/fleet_dashboard.html` |
| `app/admin/page.tsx` | Admin dashboard page — form to input contract details and trigger dispatch via `/api/send` |
| `app/api/send/route.ts` | **POST endpoint.** Receives contract data → inserts into Supabase `contracts` table → sends email via Resend with a unique `/sign/[id]` link. Has CORS headers configured to allow requests from the standalone fleet dashboard HTML. |
| `app/api/config/route.ts` | **GET endpoint.** Returns `NEXT_PUBLIC_` environment variables to the dashboard. Allows the static HTML dashboard to "auto-configure" on Vercel without manual hardcoding. |
| `app/sign/[id]/page.tsx` | **Client-facing page.** Fetches contract by ID from Supabase → renders professional legal agreement → captures digital signature → updates `signature`, `signed_at`, and `status='signed'` in Supabase. |

---

## 4. Database Schema (Supabase)

Three tables defined in `api/supabase_schema.sql`:

### `vehicles`
Stores every car in the fleet. Fields: `make`, `model`, `year`, `colour`, `rego`, `vin`, `weekly_rate`, `bond_amount`, `dlf_amount`, `car_cost`, `monthly_repayment`, `interest_total_5y`, `insurance_monthly`, `cpv_yearly`, `service_total_5y`, `misc_total_5y`, `purchase_date`, `first_installment_date`, `loan_term_months`, `rego_expiry`, `lessee_name`, `lessee_email`, `lessee_phone`, `status` (active/available/maintenance). Note: the UI relies on actual entries in the `expenses` table for Insurance, CPV, Servicing, and Misc rather than the static 5-year projections in this table.

### `expenses`
Tracks outgoings per vehicle. Foreign key to `vehicles.id`. Categories: `insurance`, `rego`, `servicing`, `fuel`, `repairs`, `tolls`. Fields: `amount`, `expense_date`, `description`.

### `contracts`
Every dispatched lease agreement. Contains full lessor/lessee details, vehicle info, financial terms, `signature` (base64 PNG), `signed_at` timestamp, and `status` (pending/signed).

---

## 5. Key Design Decisions

1. **Lessee and Financial Terms = Contract-scoped.** A vehicle is just an asset. The lessee, weekly rental rate, security bond, and DLF are ONLY set when a contract is sent via the "Send Contract" modal. They are locked into the contract, but also update the underlying vehicle record to keep the fleet table and P&L accurate.

2. **Supabase as the source of truth.** The fleet dashboard loads all vehicles, expenses, and contracts from Supabase on boot via `Promise.all`. All CRUD operations write directly to Supabase using the JS CDN client with field-name adapters (`dbToVehicle`, `vehicleToDb`, `dbToExpense`, `expenseToDb`) to bridge JS camelCase and Supabase snake_case, including the per-vehicle finance dates, till-date calculations, and 5-year cost fields.

3. **No authentication.** The admin dashboard has no login — the repo is private/hidden. Add auth later if needed.

4. **Styling: "Clean, Plain, Professional."** Inter font, plain light background, crisp grey 1px borders, no distracting accent colours or tooltip bulbs. Never make it look like a basic MVP—smooth transitions and careful spacing ensure a premium feel.

5. **Vercel deployment.** Set root directory to `api/` when importing to Vercel. Add env vars in project settings.

6. **CORS.** The `/api/send` route includes `Access-Control-Allow-Origin: *` headers and handles `OPTIONS` preflight requests. This is required because `fleet_dashboard.html` is served from a different origin than the Next.js API.

7. **Resend is optional at runtime.** If `RESEND_API_KEY` is not in the environment, the API saves the contract to Supabase and returns the signing link without sending an email. This allows testing the database flow independently.

---

## 6. Environment Variables Required

```env
RESEND_API_KEY=re_...              # From resend.com dashboard
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 7. Configuration in fleet_dashboard.html

The fleet dashboard features **Auto-Config**. On boot, it calls `/api/config` to fetch environment variables from Vercel. 

For local development without the API, you can manually set these `let` variables at the top of the dashboard script:

```js
let API_URL           = 'http://localhost:3000';
let SUPABASE_URL      = 'https://your-project.supabase.co';
let SUPABASE_ANON_KEY = 'your-anon-key';
```

The Supabase anon key is safe to expose in client-side code — it is a public key. Row-level security (RLS) controls what the anon key can access.

## 8. Fleet Dashboard Data Flow (Supabase)

```
Page Load
  └── boot()
        └── tryConfig() → GET /api/config (fetches Vercel env vars)
        └── supabase.createClient(URL, KEY)
        └── Promise.all([vehicles, expenses, contracts]) from Supabase
              └── renderAll() → renders all 4 tabs

Add/Edit Vehicle   → sb.from('vehicles').insert/update → local state update → re-render
Delete Vehicle     → sb.from('vehicles').delete        → local state update → re-render
Add Expense        → sb.from('expenses').insert        → local state update → re-render
Delete Expense     → sb.from('expenses').delete        → local state update → re-render

Send Contract
  └── POST API_URL/api/send (Next.js)
        └── Supabase insert (contracts table) + Resend email
  └── sb.from('vehicles').update lessee fields + status='active'
  └── sb.from('contracts').select refresh
  └── openSuccessModal(signLink) — copyable signing link
  └── renderAll()
```
