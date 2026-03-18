// src/components/UpgradeModal.jsx
// ─────────────────────────────────────────────────────────────
// Modal shown when a free user tries to access a premium feature.
// Also used as the standalone /upgrade pricing page.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { startCheckout, PLANS } from '../lib/stripe'

export function UpgradeModal({ familyId, email, onClose, featureName }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleUpgrade = async () => {
    setLoading(true)
    setError(null)
    try {
      await startCheckout({ familyId, email })
      // Page redirects to Stripe — no need to set loading false
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#00000088',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 9000, padding: '0 0 0 0',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0f172a', borderRadius: '24px 24px 0 0',
          width: '100%', maxWidth: 430, padding: '28px 24px 40px',
          fontFamily: "'Nunito', sans-serif",
          animation: 'slideUp 0.3s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, background: '#334155', borderRadius: 99, margin: '0 auto 24px' }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>🏆</div>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: 'white', marginBottom: 6 }}>
            Unlock ChoreQuest Premium
          </div>
          {featureName && (
            <div style={{ background: '#1e293b', border: '1.5px solid #f59e0b44', borderRadius: 12, padding: '8px 16px', display: 'inline-block' }}>
              <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>
                ✨ {featureName} is a Premium feature
              </span>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div style={{ background: '#1e293b', border: '2px solid #f59e0b', borderRadius: 20, padding: '20px 18px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'white' }}>Premium</div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Everything your family needs</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color: '#f59e0b' }}>$9.99</div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>per month</div>
            </div>
          </div>

          {/* Trial badge */}
          <div style={{ background: '#22c55e22', border: '1.5px solid #22c55e', borderRadius: 10, padding: '7px 14px', marginBottom: 16, textAlign: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#22c55e' }}>🎉 14-day free trial — cancel anytime</span>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['👨‍👩‍👧', 'Unlimited kids'],
              ['💸', 'Pay links (Venmo, Cash App, PayPal)'],
              ['🛍️', 'Full Reward Store'],
              ['📋', 'Weekly reports & earnings charts'],
              ['🏆', 'Leaderboard between kids'],
              ['🔔', 'Push notifications'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Free tier reminder */}
        <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 16 }}>ℹ️</span>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
            Free plan: 1 kid, basic chores, coin balance. Upgrade anytime for the full experience.
          </div>
        </div>

        {error && (
          <div style={{ background: '#ef444415', border: '1.5px solid #ef4444', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#ef4444', fontWeight: 700 }}>
            ❌ {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{
            width: '100%', background: loading ? '#334155' : 'linear-gradient(135deg,#f59e0b,#f97316)',
            border: 'none', borderRadius: 16, padding: '16px',
            fontFamily: "'Fredoka One',cursive", fontSize: 20,
            color: loading ? '#64748b' : 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 24px #f59e0b55',
            marginBottom: 12,
          }}
        >
          {loading ? 'Redirecting to Stripe...' : 'Start Free Trial 🚀'}
        </button>

        <button
          onClick={onClose}
          style={{ width: '100%', background: 'transparent', border: 'none', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 14, color: '#475569', cursor: 'pointer' }}
        >
          Maybe later
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ── Inline gate — wraps any feature ──────────────────────────
// Usage: <PremiumGate feature="pay_links" plan={plan} familyId={familyId} email={email}>
//          <YourComponent />
//        </PremiumGate>
export function PremiumGate({ feature, plan, familyId, email, children, featureLabel }) {
  const [showModal, setShowModal] = useState(false)
  const isPremium = plan === 'premium'

  if (isPremium) return children

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        style={{ position: 'relative', cursor: 'pointer' }}
      >
        {/* Blurred preview */}
        <div style={{ filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none' }}>
          {children}
        </div>
        {/* Lock overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0f172acc', borderRadius: 16,
          gap: 8,
        }}>
          <span style={{ fontSize: 32 }}>🔒</span>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: 'white' }}>Premium Feature</div>
          <div style={{ background: '#f59e0b', borderRadius: 99, padding: '5px 16px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: '#1e293b' }}>
            Unlock for $9.99/mo
          </div>
        </div>
      </div>
      {showModal && (
        <UpgradeModal
          familyId={familyId}
          email={email}
          featureName={featureLabel}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
