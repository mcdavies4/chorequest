// src/hooks/usePushNotifications.js
// ─────────────────────────────────────────────────────────────
// React hook that manages push notification state for a user.
// Call this once in App.jsx after the user logs in.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import {
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
  getNotificationPermission,
  isSubscribed,
} from '../lib/pushNotifications'

export function usePushNotifications({ familyId, userType, kidId = null }) {
  const [permission,  setPermission]  = useState(getNotificationPermission())
  const [subscribed,  setSubscribed]  = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [supported,   setSupported]   = useState(false)

  // Check support + existing subscription on mount
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    setSupported(supported)
    if (!supported || !familyId) return

    registerServiceWorker()
    isSubscribed().then(setSubscribed)
  }, [familyId])

  // Request permission and subscribe
  const subscribe = useCallback(async () => {
    if (!familyId || loading) return
    setLoading(true)
    try {
      const result = await subscribeToPush({ familyId, userType, kidId })
      if (result) {
        setSubscribed(true)
        setPermission('granted')
      }
    } finally {
      setLoading(false)
    }
  }, [familyId, userType, kidId, loading])

  // Unsubscribe
  const unsubscribe = useCallback(async () => {
    if (!familyId || loading) return
    setLoading(true)
    try {
      await unsubscribeFromPush(familyId)
      setSubscribed(false)
    } finally {
      setLoading(false)
    }
  }, [familyId, loading])

  return { permission, subscribed, loading, supported, subscribe, unsubscribe }
}
