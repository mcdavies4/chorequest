# ChoreQuest — Stripe Setup Guide

## What's included

| File | Purpose |
|---|---|
| `src/lib/stripe.js` | Client helpers: startCheckout, openBillingPortal, canAccess |
| `src/hooks/useSubscription.js` | React hook: loads plan, syncs in realtime |
| `src/components/UpgradeModal.jsx` | Bottom sheet upgrade prompt + PremiumGate wrapper |
| `src/components/SubscriptionBanner.jsx` | Status banners (past_due, canceled, success) |
| `src/App.jsx` | Updated root — replace your existing App.jsx |
| `supabase/functions/create-checkout/` | Edge Function: creates Stripe Checkout session |
| `supabase/functions/create-portal/` | Edge Function: creates Stripe Billing Portal session |
| `supabase/functions/stripe-webhook/` | Edge Function: handles all Stripe webhook events |

---

## Step 1 — Create Product in Stripe

1. Go to **dashboard.stripe.com → Products → Add Product**
2. Name: `ChoreQuest Premium`
3. Pricing model: **Recurring**
4. Price: `$9.99` / `month`
5. Click **Save product**
6. Copy the **Price ID** — looks like `price_1ABC123...`

---

## Step 2 — Create Webhook in Stripe

1. Stripe Dashboard → **Developers → Webhooks → Add Endpoint**
2. Endpoint URL:
   ```
   https://yfvutiopvclccrfpfahu.supabase.co/functions/v1/stripe-webhook
   ```
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Click **Add endpoint**
5. Copy the **Signing secret** — looks like `whsec_...`

---

## Step 3 — Add Secrets to Supabase Edge Functions

Supabase Dashboard → **Edge Functions → Secrets → Add new secret**

| Secret Name | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` from Stripe → Developers → API Keys |
| `STRIPE_PRICE_ID` | `price_1ABC...` from Step 1 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from Step 2 |

---

## Step 4 — Deploy the 3 Edge Functions

```bash
supabase functions deploy create-checkout
supabase functions deploy create-portal
supabase functions deploy stripe-webhook
```

---

## Step 5 — Copy Files into Your Project

Replace / add these files:

```
src/
  App.jsx                          ← REPLACE existing
  lib/
    stripe.js                      ← NEW
  hooks/
    useSubscription.js             ← NEW
  components/
    UpgradeModal.jsx               ← NEW
    SubscriptionBanner.jsx         ← NEW
```

---

## Step 6 — Add Feature Gates to ParentView

In `src/components/ParentView.jsx`, gate premium features.

The `ParentView` now receives `plan`, `isPremium`, `familyId`, `userEmail`, and `canAccess` props.

**Example — gate the pay links section:**
```jsx
import { PremiumGate } from './UpgradeModal'

// Wrap the pay links buttons:
<PremiumGate
  feature="pay_links"
  plan={plan}
  familyId={familyId}
  email={userEmail}
  featureLabel="Pay Links"
>
  {/* your existing pay links JSX */}
</PremiumGate>
```

**Example — gate the leaderboard tab:**
```jsx
{tab === 'leaderboard' && (
  <PremiumGate feature="leaderboard" plan={plan} familyId={familyId} email={userEmail} featureLabel="Leaderboard">
    <Leaderboard kids={data.kids} />
  </PremiumGate>
)}
```

**Example — gate the reward store:**
```jsx
{tab === 'store' && (
  <PremiumGate feature="reward_store" plan={plan} familyId={familyId} email={userEmail} featureLabel="Reward Store">
    {/* store JSX */}
  </PremiumGate>
)}
```

---

## Step 7 — Add Manage Subscription Button to Parent Header

In `ParentView.jsx` header, import and add:
```jsx
import { ManageSubscriptionButton } from './SubscriptionBanner'

// In the header:
<ManageSubscriptionButton familyId={familyId} plan={plan} />
```

---

## Step 8 — Test with Stripe Test Cards

Use these card numbers in Stripe Checkout (test mode):
| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires 3D Secure |

Expiry: any future date. CVC: any 3 digits. ZIP: any 5 digits.

---

## Step 9 — Go Live

When ready to accept real payments:
1. Complete Stripe's business verification
2. Switch from `sk_test_...` to `sk_live_...` in Supabase secrets
3. Update `STRIPE_PRICE_ID` to the live price ID
4. Create a new live webhook and update `STRIPE_WEBHOOK_SECRET`
5. Redeploy the 3 Edge Functions

---

## Free vs Premium Feature Matrix

| Feature | Free | Premium |
|---|---|---|
| Number of kids | 1 | Unlimited |
| Basic chores | ✅ | ✅ |
| Coin balance | ✅ | ✅ |
| Pay links | ❌ | ✅ |
| Reward Store | ❌ | ✅ |
| Weekly reports | ❌ | ✅ |
| Leaderboard | ❌ | ✅ |
| Push notifications | ✅ | ✅ |
| Price | $0 | $9.99/mo |
| Trial | — | 14 days free |
