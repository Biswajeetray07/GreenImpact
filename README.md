# 🏌️ GreenImpact — Charity Golf Platform

> **Every round changes a life.** Track your Stableford scores, enter monthly prize draws, and direct a portion of every subscription to the charity you believe in.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe)](https://stripe.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)](https://vercel.com/)

---

## 📖 Overview

GreenImpact is a full-stack subscription platform that combines golf performance tracking, monthly prize draws, and charitable giving. Subscribers log Stableford scores, compete in algorithmically-weighted draws, and allocate 10–100% of their subscription fee to a charity of their choice.

### How It Works

1. **Subscribe** — Choose a Monthly (£9.99) or Yearly (£99.99) plan via Stripe Checkout.
2. **Log Scores** — Enter your Stableford scores (1–45). The platform keeps a rolling window of your latest 5.
3. **Pick a Charity** — Select from verified charities and set your contribution percentage (min 10%).
4. **Win Prizes** — Each month, a draw matches submitted scores against randomly generated numbers. Prizes are split across 3 tiers (40% / 35% / 25%).
5. **Get Paid** — Winners upload proof, an admin verifies, and payouts are processed.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Frontend** | React 18, Tailwind CSS |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **Auth** | Supabase Auth (Email/Password) |
| **Storage** | Supabase Storage (charity images, winner proofs) |
| **Payments** | Stripe (Checkout, Customer Portal, Webhooks) |
| **Emails** | Resend (transactional emails) |
| **Deployment** | Vercel |
| **Typography** | DM Serif Display, DM Sans |

---

## ✨ Features

### Subscriber Dashboard
- **Score Entry** — Enter Stableford scores with duplicate-date validation and automatic rolling-window enforcement (latest 5 kept).
- **Charity Selection** — Browse charities, select one, and adjust your contribution slider (10–100%).
- **Prize Draws** — View draw history and check if your scores matched any winning numbers.
- **Winner Verification** — Upload proof screenshots for admin review and track payout status.
- **Subscription Management** — Access Stripe Customer Portal to update payment method or cancel.

### Admin Panel (`/admin`)
- **Dashboard** — Live metrics: active subscribers, total revenue, prize pool, charity contributions.
- **User Management** — View/edit user profiles, scores, and subscription status.
- **Draw Engine** — Create monthly draws, run simulations (random or weighted algorithm), and publish results.
- **Charity Management** — Add, edit, delete charities with image upload. Toggle featured charity.
- **Winner Review** — Approve/reject proof submissions and mark payouts as completed.
- **Reports** — Platform-wide analytics and financial summaries.

### Platform & Security
- **Row Level Security (RLS)** — All Supabase tables enforce RLS policies. Sensitive writes route through service-role API endpoints.
- **Middleware Auth** — Route-level protection for `/dashboard` and `/admin` paths.
- **Stripe Webhooks** — Handles `checkout.session.completed`, `invoice.payment_failed`, and `customer.subscription.deleted`.
- **Email Notifications** — Welcome, subscription confirmation, draw results, and winner alerts via Resend.
- **Error Boundaries** — Graceful fallback UI when individual dashboard modules fail to load.
- **Responsive Design** — Mobile-first, tested down to 375px.

---

## 📁 Project Structure

```
GreenImpact/
├── app/
│   ├── (auth)/              # Login & Signup pages
│   ├── (public)/            # Homepage, Charities, Pricing
│   ├── admin/               # Admin dashboard (6 sections)
│   │   ├── charities/       # Charity CRUD
│   │   ├── draws/           # Draw management
│   │   ├── reports/         # Analytics
│   │   ├── users/           # User management
│   │   └── winners/         # Winner review
│   ├── api/
│   │   ├── admin/           # Admin-only endpoints (draws, winners, charities, users)
│   │   ├── auth/            # Sign-out handler
│   │   ├── charities/       # Public charity listing
│   │   ├── donations/       # Independent donation tracking
│   │   ├── scores/          # Score CRUD (with [id] route)
│   │   ├── stripe/          # Checkout, Portal, Webhook
│   │   ├── user/            # Charity selection & percentage
│   │   └── winners/         # Proof upload
│   ├── dashboard/           # Subscriber dashboard + verify flow
│   ├── subscribe/           # Success & Cancel pages
│   ├── globals.css          # Design system (glassmorphism, animations)
│   └── layout.tsx           # Root layout with fonts
│
├── components/
│   ├── admin/               # Admin table clients (users, draws, charities, winners)
│   ├── dashboard/           # 5 dashboard modules (Subscription, Scores, Charity, Draws, Winnings)
│   ├── Navbar.tsx           # Sticky nav with scroll blur + admin routing
│   ├── Footer.tsx           # 4-column footer
│   ├── ScoreEntry.tsx       # Score input form
│   ├── ScoreList.tsx        # Score history table
│   ├── CharityCard.tsx      # Charity display card
│   ├── FeaturedCharity.tsx  # Homepage featured charity section
│   ├── ProofUpload.tsx      # Winner proof upload widget
│   └── ErrorBoundary.tsx    # Graceful error fallback
│
├── lib/
│   ├── supabase.ts          # Browser client + Service-role client
│   ├── supabase-route.ts    # Cookie-based server client (API routes)
│   ├── auth.ts              # getUser(), getSubscription() helpers
│   ├── stripe.ts            # Stripe SDK instance
│   ├── email.ts             # Resend email templates (4 types)
│   ├── drawEngine.ts        # Draw generation + score matching
│   └── prizeCalculator.ts   # Prize pool split (40/35/25)
│
├── supabase/migrations/     # 5 SQL migration files
├── types/                   # TypeScript type definitions
├── middleware.ts             # Auth route protection
├── vercel.json              # Vercel deployment config
└── tailwind.config.ts       # Tailwind theme (colors, fonts)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (test mode)
- A [Resend](https://resend.com) API key

### 1. Clone & Install

```bash
git clone https://github.com/Biswajeetray07/GreenImpact.git
cd GreenImpact
npm install
```

### 2. Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

# Resend
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Run these migrations **in order** via the Supabase SQL Editor:

| Order | File | Purpose |
|-------|------|---------|
| 1 | `001_initial_schema.sql` | Tables: users, subscriptions, scores, charities, draws, winners, donations |
| 2 | `002_rls_policies.sql` | Row Level Security policies for all tables |
| 3 | `003_auth_trigger.sql` | Auto-create user record on Supabase Auth signup |
| 4 | `004_storage_buckets.sql` | Storage buckets for charities and winner-proofs |
| 5 | `005_seed_charities.sql` | Seed 3 default charities |

### 4. Stripe Products

In the [Stripe Dashboard](https://dashboard.stripe.com/test/products), create two recurring products:

- **Monthly Plan** — £9.99/month → Copy the Price ID into `STRIPE_MONTHLY_PRICE_ID`
- **Yearly Plan** — £99.99/year → Copy the Price ID into `STRIPE_YEARLY_PRICE_ID`

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Stripe Webhooks (Local)

In a separate terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

---

## 🧪 Testing

### Test Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| User | `user@greenimpact.test` | `password123` | Created via signup flow |
| Admin | `admin@greenimpact.test` | `password123` | Must set `role='admin'` in Supabase `users` table |

**Promote a user to admin:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@greenimpact.test';
```

### Stripe Test Card

| Field | Value |
|-------|-------|
| Card Number | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |

### Testing Checklist

- [ ] **Sign up** → Redirected to Stripe Checkout
- [ ] **Pay** with test card → Lands on success page with charity selection
- [ ] **Enter scores** → Validates range (1–45), rejects duplicate dates, enforces 5-score rolling window
- [ ] **Select charity** → Contribution slider enforces ≥10%
- [ ] **Admin: Create draw** → Simulate with algorithm → Publish
- [ ] **Winner flow** → Upload proof → Admin approves → Mark as paid
- [ ] **Stripe Portal** → Update payment method or cancel subscription

---

## 🚢 Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git add . && git commit -m "deploy" && git push
   ```

2. **Import into Vercel** → Select your repo → Framework: Next.js

3. **Set Environment Variables** — Add all variables from `.env.example` in Vercel project settings.

4. **Deploy** — Vercel builds and deploys automatically.

5. **Post-deploy**:
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel domain.
   - Add a Stripe webhook endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.deleted`

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Cream | `#F7F4EE` | Page backgrounds |
| Forest Green | `#1B3A2D` | Primary text, nav, cards |
| Gold | `#D4A843` | Accents, CTAs, highlights |
| Success Green | `#16A34A` | Confirmations, positive states |
| Danger Red | `#DC2626` | Errors, destructive actions |

**Typography:** DM Serif Display (headings) + DM Sans (body)

**Effects:** Glassmorphism cards, stagger animations, gradient text, button shine, scroll-triggered backdrop blur on navbar.

---

## 📄 License

This project was built as a sample assignment for [Digital Heroes](https://digitalheroes.co.in) trainee selection process.
