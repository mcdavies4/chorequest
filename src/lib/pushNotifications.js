// src/lib/pushNotifications.js
// ─────────────────────────────────────────────────────────────
// Client-side Web Push subscription manager.
//
// Flow:
//   1. Register service worker
//   2. Request notification permission
//   3. Subscribe to push with our VAPID public key
//   4. Save subscription endpoint to Supabase push_subscriptions table
// ─────────────────────────────────────────────────────────────

import { supabase } from './supabase'

// Your VAPID public key — generated in setup step
// Replace this with your own from: npx web-push generate-vapid-keys
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

// Convert VAPID key from base64 to Uint8Array (required by browser API)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

// ── Register the service worker ───────────────────────────────
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported')
    return null
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    console.log('Service worker registered:', reg.scope)
    return reg
  } catch (err) {
    console.error('Service worker registration failed:', err)
    return null
  }
}

// ── Check current permission status ──────────────────────────
export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission // 'default' | 'granted' | 'denied'
}

// ── Request permission + subscribe ───────────────────────────
export async function subscribeToPush({ familyId, userType, kidId = null }) {
  if (!VAPID_PUBLIC_KEY) {
    console.error('VITE_VAPID_PUBLIC_KEY not set in .env')
    return null
  }

  // 1. Request permission
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    console.warn('Notification permission denied')
    return null
  }

  // 2. Get service worker registration
  const reg = await navigator.serviceWorker.ready

  // 3. Subscribe to push
  let subscription
  try {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
  } catch (err) {
    console.error('Push subscription failed:', err)
    return null
  }

  // 4. Extract keys
  const sub = subscription.toJSON()
  const { endpoint } = sub
  const p256dh = sub.keys?.p256dh
  const auth   = sub.keys?.auth

  if (!endpoint || !p256dh || !auth) {
    console.error('Invalid subscription object')
    return null
  }

  // 5. Save to Supabase (upsert by endpoint)
  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { family_id: familyId, user_type: userType, kid_id: kidId, endpoint, p256dh, auth },
      { onConflict: 'endpoint' }
    )
    .select()
    .single()

  if (error) {
    console.error('Failed to save push subscription:', error)
    return null
  }

  console.log('Push subscription saved:', data.id)
  return data
}

// ── Unsubscribe ───────────────────────────────────────────────
export async function unsubscribeFromPush(familyId) {
  const reg = await navigator.serviceWorker.ready
  const subscription = await reg.pushManager.getSubscription()
  if (!subscription) return

  const endpoint = subscription.endpoint

  // Unsubscribe from browser
  await subscription.unsubscribe()

  // Remove from Supabase
  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)
    .eq('family_id', familyId)
}

// ── Check if already subscribed ──────────────────────────────
export async function isSubscribed() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    return !!sub
  } catch {
    return false
  }
}
