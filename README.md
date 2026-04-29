# GreenImpact — Charity Golf Platform

A full-stack charity golf platform where subscribers enter Stableford golf scores, participate in monthly prize draws, and contribute a portion of their subscription to their chosen charity.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase (PostgreSQL + Auth + Storage)
- **Payments:** Stripe (Subscriptions, Checkout, Webhooks)
- **Emails:** Resend (Transactional emails)
- **Fonts:** DM Serif Display, DM Sans

## Features

### Subscriber Features
- **Authentication** — Email/password signup & login via Supabase Auth
- **Subscription** — Monthly (£9.99) or Yearly (£99.99) via Stripe Checkout
- **Score Entry** — Enter Stableford scores (1–45), rolling window of 5 scores
- **Charity Selection** — Choose a charity and set contribution percentage (10–100%)
- **Prize Draws** — Monthly draws match your scores against drawn numbers
- **Winner Verification** — Upload proof screenshots for admin review
- **Dashboard** — Full overview: subscription, scores, charity, draws, winnings

### Admin Features
- **User Management** — View/edit profiles, scores, subscriptions
- **Draw Management** — Create, simulate (random or algorithm), and publish draws
- **Charity Management** — Add/edit/delete charities, toggle featured
- **Winner Review** — Approve/reject proof submissions, mark as paid
- **Reports** — Platform analytics: users, prize pools, charity contributions, payouts

### Platform Features
- **Row Level Security** — All database tables protected with Supabase RLS
- **Webhook Processing** — Stripe events for subscription lifecycle
- **Email Notifications** — Welcome, subscription, draw results, winner alerts
- **Responsive Design** — Mobile-first with cream/gold/green design system
- **Middleware Auth** — Route protection for dashboard and admin areas

## Project Structure

```
app/
├── (public)/          # Homepage, charities, pricing
├── admin/             # Admin dashboard (6 sections)
├── dashboard/         # User dashboard + winner verification
├── login/ & signup/   # Authentication pages
├── api/
│   ├── scores/        # CRUD for golf scores
│   ├── charities/     # Public charity listing
│   ├── donations/     # Independent donations
│   ├── winners/       # Proof upload
│   ├── admin/         # Admin draws, winners management
│   ├── stripe/        # Checkout, portal, webhooks
│   └── user/          # Charity percentage
components/
├── dashboard/         # 5 dashboard modules
├── Navbar.tsx         # Global navigation
lib/
├── supabase.ts        # Browser + service-role clients
├── supabase-route.ts  # Cookie-based server client (API routes)
├── auth.ts            # Auth helpers (getUser, getSubscription)
├── stripe.ts          # Stripe client
├── email.ts           # Resend email templates
├── drawEngine.ts      # Draw generation + matching
├── prizeCalculator.ts # Prize pool distribution
supabase/migrations/   # 5 SQL migration files
```

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_MONTHLY_PRICE_ID=
STRIPE_YEARLY_PRICE_ID=
RESEND_API_KEY=
NEXTAUTH_SECRET=
NEXT_PUBLIC_APP_URL=
```

### 3. Database Setup
Run the SQL migrations in order via Supabase SQL Editor:
```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_auth_trigger.sql
supabase/migrations/004_storage_buckets.sql
supabase/migrations/005_seed_charities.sql
```

### 4. Stripe Products
Create two recurring products in Stripe Dashboard:
- **Monthly** — £9.99/month → copy Price ID
- **Yearly** — £99.99/year → copy Price ID

### 5. Run Locally
```bash
npm run dev
```

### 6. Test Stripe Webhooks Locally
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Test Card
Use Stripe test card: `4242 4242 4242 4242` with any future expiry and any CVC.

## Deployment
Deploy to Vercel:
1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

## Design Philosophy
- **Charity-first, not sport-first** — Design leads with charitable impact
- **No traditional golf imagery** — Clean, modern, motion-enhanced
- **Color palette:** Cream (#F7F4EE), Forest Green (#1B3A2D), Gold (#D4A843)
- **Typography:** DM Serif Display (headings), DM Sans (body)
