# GreenImpact - Testing & Credentials Guide

## Test Accounts

You can use these accounts to verify both flows. To set up an admin account, register via the `/signup` flow and then manually update the user's role in Supabase.

### 1. User Test Account
* **Email:** `user@greenimpact.test` (Or any email you create via signup)
* **Password:** `password123`
* **Role:** `subscriber` (Default upon signup/subscription)
* **Permissions:** Score entry, charity selection, dashboard access, verify winnings.

### 2. Admin Test Account
* **Email:** `admin@greenimpact.test`
* **Password:** `password123`
* **Role:** `admin` (Must be manually set in the Supabase `users` table: `UPDATE users SET role='admin' WHERE email='admin@greenimpact.test';`)
* **Permissions:** Admin dashboard, manage users, publish draws, approve/reject winners, mark payouts.

## Stripe Testing Details
When subscribing via Stripe Checkout, use the following test card:
* **Card Number:** `4242 4242 4242 4242`
* **Expiry:** Any future date (e.g., `12/28`)
* **CVC:** Any 3 digits (e.g., `123`)
* **Zip Code:** Any value

## Testing Checklist (PRD §16)

Verify the following flows to ensure the application is production-ready:

### 1. Core Authentication & Subscriptions
- [ ] Sign up a new user via the `/signup` page.
- [ ] User is redirected to Stripe Checkout (Monthly or Yearly).
- [ ] Enter Stripe test card details.
- [ ] Confirm redirection to `/dashboard` upon successful payment.
- [ ] Check email inbox (Resend) for Welcome and Subscription Confirmation emails.

### 2. Dashboard & Score Entry
- [ ] Verify the 5 dashboard modules load correctly (Subscription, Scores, Charity, Draws, Winnings).
- [ ] Attempt to enter a score below 1 or above 45 (Should fail with 400).
- [ ] Attempt to enter two scores on the same date (Should fail with 409 duplicate date error).
- [ ] Enter 6 unique scores and confirm the oldest one is automatically deleted (keeps only the latest 5).
- [ ] Modify the charity contribution slider to a value below 10% (Should be rejected).

### 3. Draw Engine & Admin Controls
- [ ] Log in using the Admin account and navigate to `/admin`.
- [ ] Go to the **Draws** tab and click "Create Monthly Draw".
- [ ] Select **Simulation Mode** (Algorithm) and run.
- [ ] Verify the system calculates a 40/35/25 prize pool split based on active subscribers.
- [ ] Once satisfied, **Publish** the draw.
- [ ] Verify that all active subscribers receive the Draw Results email.
- [ ] Verify that winners receive the high-priority Winner Alert email.

### 4. Winner Verification
- [ ] Log in as a winning User (Tier 3, 4, or 5).
- [ ] On the Dashboard under **Winnings**, click "Upload proof" for the pending payout.
- [ ] Upload an image. The status should change to "Under review".
- [ ] Switch to the Admin account and view the **Winners** tab.
- [ ] Approve the proof. The user's status becomes "Approved".
- [ ] Mark the payment as "Paid" once the external transfer is complete.
- [ ] Verify that a rejected payout cannot be marked as Paid.

### 5. Resiliency & Edge Cases
- [ ] Test Mobile Responsiveness (375px screens) on public pages and the dashboard.
- [ ] Verify Error Boundaries by temporarily breaking an API route (e.g. throwing an error) and ensuring the Dashboard does not fully crash (a grey "Could not load this section" box appears).
- [ ] Disconnect internet and verify loading skeleton animations trigger on slow networks.
