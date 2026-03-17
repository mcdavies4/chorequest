// src/components/NotificationBell.jsx
// ─────────────────────────────────────────────────────────────
// Notification permission button shown in the app header.
// Shows bell icon — clicking it prompts for permission and
// subscribes the user to push notifications.
// ─────────────────────────────────────────────────────────────

import { usePushNotifications } from '../hooks/usePushNotifications'

export function NotificationBell({ familyId, userType, kidId }) {
  const { permission, subscribed, loading, supported, subscribe, unsubscribe } = usePushNotifications({ familyId, userType, kidId })

  if (!supported) return null // Hide on unsupported browsers

  if (permission === 'denied') {
    return (
      <div title="Notifications blocked — check browser settings" style={{ fontSize: 18, opacity: 0.4, cursor: 'default' }}>
        🔕
      </div>
    )
  }

  return (
    <button
      onClick={subscribed ? unsubscribe : subscribe}
      disabled={loading}
      title={subscribed ? 'Notifications on — tap to turn off' : 'Tap to enable notifications'}
      style={{
        background:  'transparent',
        border:      'none',
        cursor:      loading ? 'wait' : 'pointer',
        fontSize:    20,
        padding:     '2px 6px',
        borderRadius: 8,
        transition:  'opacity 0.2s',
        opacity:     loading ? 0.5 : 1,
        position:    'relative',
      }}
    >
      {subscribed ? '🔔' : '🔕'}
      {subscribed && (
        <span style={{
          position:   'absolute',
          top:        0,
          right:      0,
          width:      8,
          height:     8,
          background: '#22c55e',
          borderRadius: '50%',
        }} />
      )}
    </button>
  )
}
