# Motor Vehicle Lease & Fleet Management System

A full-stack digital signature web application and fleet management dashboard for MCR (Mani's Car Rentals). Lightweight, tailored "DocuSign alternative" combined with a financial operations dashboard.

## Repository Structure

```
├── README.md                    ← You are here
├── ARCHITECTURE.md              ← System design and data flow
├── fleet_dashboard.html         ← Source copy of the Fleet Manager dashboard
├── car_lease_fillable.html      ← Offline contract generator with "Print to PDF"
│
└── api/                         ← Next.js backend (deploy to Vercel)
    ├── package.json
    ├── tsconfig.json
    ├── next.config.mjs
    ├── .env.example             ← Required environment variables template
    ├── supabase_schema.sql      ← Database setup — paste into Supabase SQL Editor
    ├── utils/
    │   └── supabase.ts          ← Supabase client initialisation
    ├── public/
    │   └── fleet_dashboard.html ← Deployed homepage dashboard on Vercel
    ├── components/
    │   └── SignaturePad.tsx     ← Touch-friendly digital signature canvas
    └── app/
        ├── layout.tsx           ← Root layout
        ├── globals.css          ← Design system (Inter, Slate, Blue accent)
        ├── page.tsx             ← Redirects homepage to /fleet_dashboard.html
        ├── admin/page.tsx       ← Admin contract dispatch form
        ├── api/send/route.ts    ← POST endpoint: stores contract + emails client
        └── sign/[id]/page.tsx  ← Client contract view + signature capture
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14+ (App Router) | Server-side rendering, API routes |
| Styling | Vanilla CSS | No Tailwind — pure CSS design system |
| Database | Supabase | Contracts, vehicles, expenses storage |
| Email | Resend SDK | Sends contract signing links to clients |
| Signature | react-signature-canvas | Mobile-friendly digital signature |
| Offline Tools | Standalone HTML | fleet_dashboard.html talks directly to Supabase; car_lease_fillable.html is offline |

---

## Setup & Deployment

### 1. Supabase Database Setup

Open `api/supabase_schema.sql` and copy the entire file contents into:

**Supabase Dashboard → SQL Editor → New Query → Run**

This creates three tables:
- `vehicles` — Fleet registry (make, model, rego, rego expiry, lessee, rates, status, finance timing fields, and 5-year cost inputs)
- `expenses` — Outgoings per vehicle (insurance, rego, servicing, fuel, repairs, tolls)
- `contracts` — Dispatched lease contracts with signature tracking

If you already ran the original schema before these finance fields were added, also run:

`api/supabase_vehicle_cost_fields.sql`

### 2. Environment Configuration

Navigate to the `api/` directory and create `.env.local`:

```env
# Resend Email Key
RESEND_API_KEY=re_your_api_key_here

# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Production URL (update after Vercel deploy)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Running Locally

```bash
cd api
npm install
npm run dev
```

The fleet dashboard boots at `http://localhost:3000/fleet_dashboard.html`.
The manual contract sender sits at `http://localhost:3000/admin`.

### 4. Deploying to Vercel

1. Push this repo to GitHub
2. Import into Vercel, set the **Root Directory** to `api/`
3. Add the environment variables from step 2 in Vercel project settings
4. Update `NEXT_PUBLIC_APP_URL` to your production domain, for example `https://anirudhrentals.vercel.app`

### 5. Automatic Configuration (Vercel)

If you are deploying to Vercel, the dashboard will **automatically** connect to your Supabase project using the environment variables set in step 4. No manual file editing is required.

### 6. Local Development Configuration (Manual)

If running `fleet_dashboard.html` locally without the Next.js dev server, open the file in a text editor and update the constants at the top of the script:

```js
let API_URL           = 'http://localhost:3000';
let SUPABASE_URL      = 'https://your-project.supabase.co';
let SUPABASE_ANON_KEY = 'your-anon-key';
```

---

## How the System Works

### Fleet Dashboard (`fleet_dashboard.html`)
The central hub. In production it is served from `/fleet_dashboard.html` by Vercel. Requires Supabase credentials to be configured.

1. **Overview tab** — Add vehicles, see stat cards (Total Vehicles, Active Leases, Monthly Revenue, Outgoings, Net Profit), and track upcoming Rego renewals. The table shows the **Current Lessee** and their **Lease Dates** (Start → End) for at-a-glance management.
2. **Send/Save Contract** — Click the green arrow icon on any vehicle row. This opens a versatile modal where you can:
    - **Digital Send**: Fill client details and email a unique signing link via Resend.
    - **External Link**: Attach an existing contract link (e.g., Google Drive), which skips the email and marks the vehicle as Active immediately.
    - **Manual Download**: Use the **"Preview & Print PDF"** button to generate a fully filled, professional A4 contract for manual signing or local saving.
3. **Outgoings tab** — Log operational expenses per vehicle (Insurance, Rego Renewals, Servicing, Fuel, Repairs, Tolls, Misc, CPV). These actual expenses are stored in Supabase and drive the dynamic P&L dashboard.
4. **P&L tab** — Per-vehicle profit & loss cards with a Fleet Totals summary including operational monthly P&L and 5-year cost projections.
5. **Contracts tab** — All contracts pulled live from Supabase. Includes visual badges for **EXTERNAL** links and a one-click button to view those external documents.

### Contract Flow
1. Click the "Send/Save" icon on a vehicle in the fleet dashboard.
2. If sending digitally: The dashboard POSTs details to the Next.js API (`/api/send`), which saves to Supabase and emails the client via Resend.
3. If linking externally: The dashboard updates the vehicle and contract records with the provided URL, bypassing the email flow.
4. If downloading manually: The dashboard generates a client-side HTML preview using the professional `rental_agreement.html` template and triggers the browser's print-to-PDF dialog.
5. Digital signatures are captured at `/sign/[id]` and saved directly back to the database.

### Rental Agreement Template (`rental_agreement.html`)
The official 13-clause legal agreement used for all manual and digital contracts. Branded for **Anirudh Ahlawat** (Lessor). Fully A4-compliant and optimized for printing.

---

## Notes for Future AI Agents
- The UI direction for this app is **"Clean, Plain, Professional"**. Stick to the predefined CSS variables in `globals.css` (Inter typography, plain light backgrounds, crisp 1px gray borders). Avoid making it look like a cheap MVP, but keep it minimal and without overly strong accent colors.
- `react-signature-canvas` requires `"use client"` to function without throwing SSR mismatch errors in the Next.js App Router.
- The fleet dashboard (`fleet_dashboard.html`) features **Auto-Config**. On boot, it attempts to fetch configuration from `/api/config`. If this fails (e.g., during local offline development), it falls back to any hardcoded values in the script.
- The `api/` folder is the Next.js root. When deploying to Vercel, set root directory to `api/`.
- The API route (`/api/send`) has CORS headers configured to allow requests from the standalone fleet dashboard HTML file.
- If `RESEND_API_KEY` is not set, the API still saves the contract to Supabase and returns the signing link — it just skips sending the email.
- The Contracts tab in the fleet dashboard constructs signing links using the `API_URL` returned by the config handshake.
