// src/lib/stripe.js
// ─────────────────────────────────────────────────────────────
// Client-side Stripe helpers.
// Calls our Supabase Edge Functions to create Checkout sessions
// and Billing Portal sessions — never touches secret keys.
// ─────────────────────────────────────────────────────────────

import { supabase } from './supabase'

// ── Start a Stripe Checkout session ──────────────────────────
// Redirects the user to Stripe's hosted checkout page.
// On success, Stripe redirects back to /upgrade/success
// On cancel, Stripe redirects back to /upgrade/cancel
export async function startCheckout({ familyId, email }) {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: {
      family_id:   familyId,
      email,
      success_url: `${window.location.origin}/?checkout=success`,
      cancel_url:  `${window.location.origin}/?checkout=cancel`,
    },
  })

  if (error) throw new Error(error.message)
  if (!data?.url) throw new Error('No checkout URL returned')

  // Redirect to Stripe Checkout
  window.location.href = data.url
}

// ── Open Stripe Billing Portal ────────────────────────────────
// Lets users manage their subscription, update payment method,
// cancel, or download invoices — all handled by Stripe.
export async function openBillingPortal({ familyId }) {
  const { data, error } = await supabase.functions.invoke('create-portal', {
    body: {
      family_id:   familyId,
      return_url:  `${window.location.origin}/`,
    },
  })

  if (error) throw new Error(error.message)
  if (!data?.url) throw new Error('No portal URL returned')

  window.location.href = data.url
}

// ── Plan config ───────────────────────────────────────────────
export const PLANS = {
  free: {
    name:      'Free',
    price:     '$0',
    period:    'forever',
    color:     '#64748b',
    features: [
      '✅ 1 kid',
      '✅ Basic chores',
      '✅ Coin balance',
      '❌ Multiple kids',
      '❌ Pay links',
      '❌ Reward Store',
      '❌ Weekly reports',
      '❌ Leaderboard',
    ],
  },
  premium: {
    name:      'Premium',
    price:     '$9.99',
    period:    'per month',
    color:     '#f59e0b',
    trial:     '14 days free',
    features: [
      '✅ Unlimited kids',
      '✅ All chore features',
      '✅ Coin balance',
      '✅ Pay links (Venmo, Cash App, PayPal)',
      '✅ Reward Store',
      '✅ Weekly reports & charts',
      '✅ Leaderboard',
      '✅ Priority support',
    ],
  },
}

// ── Feature gate helper ───────────────────────────────────────
// Returns true if the family's plan includes this feature.
// Call this anywhere in the app to show/hide premium features.
export function canAccess(plan, feature) {
  const gates = {
    multiple_kids:    plan === 'premium',
    pay_links:        plan === 'premium',
    reward_store:     plan === 'premium',
    weekly_reports:   plan === 'premium',
    leaderboard:      plan === 'premium',
  }
  return gates[feature] ?? true
}
