// src/components/SubscriptionBanner.jsx
// ─────────────────────────────────────────────────────────────
// Shows contextual banners based on subscription state:
//   - past_due: payment failed warning
//   - canceled: account downgraded notice
//   - success:  welcome back after checkout
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { openBillingPortal } from '../lib/stripe'

export function SubscriptionBanner({ subscription, familyId, checkoutMsg, onDismiss }) {
  const [portalLoading, setPortalLoading] = useState(false)

  const openPortal = async () => {
    setPortalLoading(true)
    try { await openBillingPortal({ familyId }) }
    catch (err) { console.error(err) }
    finally { setPortalLoading(false) }
  }

  // ── Checkout success ────────────────────────────────────────
  if (checkoutMsg === 'success') {
    return (
      <div style={bannerStyle('#22c55e', '#052e16')}>
        <span style={{ fontSize: 20 }}>🎉</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Welcome to Premium!</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>All features are now unlocked for your family.</div>
        </div>
        <button onClick={onDismiss} style={dismissBtn}>✕</button>
      </div>
    )
  }

  // ── Payment failed ──────────────────────────────────────────
  if (subscription?.status === 'past_due') {
    return (
      <div style={bannerStyle('#ef4444', '#450a0a')}>
        <span style={{ fontSize: 20 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Payment failed</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Update your payment method to keep Premium.</div>
        </div>
        <button onClick={openPortal} disabled={portalLoading} style={{ ...actionBtn, background: '#ef4444' }}>
          {portalLoading ? '...' : 'Fix now'}
        </button>
      </div>
    )
  }

  // ── Subscription canceled ───────────────────────────────────
  if (subscription?.status === 'canceled') {
    return (
      <div style={bannerStyle('#f59e0b', '#1c1002')}>
        <span style={{ fontSize: 20 }}>📋</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Premium ended</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>You're now on the Free plan. Resubscribe anytime.</div>
        </div>
        <button onClick={openPortal} disabled={portalLoading} style={{ ...actionBtn, background: '#f59e0b', color: '#1e293b' }}>
          {portalLoading ? '...' : 'Resubscribe'}
        </button>
      </div>
    )
  }

  return null
}

// ── Manage subscription button ────────────────────────────────
// Small button shown in settings / parent header
export function ManageSubscriptionButton({ familyId, plan }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try { await openBillingPortal({ familyId }) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  return (
    <button onClick={handleClick} disabled={loading} style={{
      background: plan === 'premium' ? '#f59e0b22' : '#1e293b',
      border: `1.5px solid ${plan === 'premium' ? '#f59e0b' : '#334155'}`,
      borderRadius: 12, padding: '8px 14px',
      fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13,
      color: plan === 'premium' ? '#f59e0b' : '#64748b',
      cursor: loading ? 'not-allowed' : 'pointer',
    }}>
      {loading ? '...' : plan === 'premium' ? '⭐ Manage Premium' : '🔒 Upgrade to Premium'}
    </button>
  )
}

// ── Shared styles ─────────────────────────────────────────────
const bannerStyle = (border, bg) => ({
  display: 'flex', alignItems: 'center', gap: 12,
  background: bg, border: `1.5px solid ${border}`,
  borderRadius: 14, padding: '12px 14px', margin: '12px 16px 0',
  fontFamily: "'Nunito',sans-serif", color: 'white',
})

const dismissBtn = {
  background: 'transparent', border: 'none',
  color: 'white', cursor: 'pointer', fontSize: 16, opacity: 0.7,
  padding: '2px 6px',
}

const actionBtn = {
  border: 'none', borderRadius: 10, padding: '7px 14px',
  fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12,
  color: 'white', cursor: 'pointer', whiteSpace: 'nowrap',
  flexShrink: 0,
}
