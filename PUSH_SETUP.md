# ChoreQuest — Push Notifications Setup

## Overview

4 notification triggers:
| Trigger | Who gets notified | How |
|---|---|---|
| Kid marks chore done | Parent | Instant push |
| Parent approves chore | Kid | Instant push |
| Daily 5pm reminder | Kids with incomplete chores | Cron job |
| Weekly Sunday summary | Parents | Cron job |

---

## Step 1 — Generate VAPID Keys

VAPID keys identify your app to browser push services.
Run this once in your terminal:

```bash
npx web-push generate-vapid-keys
```

You'll get output like:
```
Public Key:  BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
Private Key: sMyTWMfFQFXFRXTDPgCNqPCNnOEMbcbHFIHpO8MKLT8
```

Add both to your `.env`:
```env
VITE_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
```

---

## Step 2 — Add Secrets to Supabase Edge Functions

In Supabase Dashboard → **Edge Functions → Secrets**, add:

| Secret Name | Value |
|---|---|
| `VAPID_PUBLIC_KEY` | Your public key from step 1 |
| `VAPID_PRIVATE_KEY` | Your private key from step 1 |
| `VAPID_SUBJECT` | `mailto:you@youremail.com` |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available in Edge Functions — no need to add them.

---

## Step 3 — Deploy Edge Functions

Install Supabase CLI if you haven't:
```bash
npm install -g supabase
```

Login and link your project:
```bash
supabase login
supabase link --project-ref yfvutiopvclccrfpfahu
```

Deploy all three functions:
```bash
supabase functions deploy send-push
supabase functions deploy daily-reminder
supabase functions deploy weekly-summary
```

---

## Step 4 — Schedule Cron Jobs

In Supabase Dashboard → **Database → Extensions**, enable **pg_cron**.

Then go to **SQL Editor** and run:

```sql
-- Daily reminder at 5pm UTC every day
select cron.schedule(
  'daily-kid-reminder',
  '0 17 * * *',
  $$
  select net.http_post(
    url := 'https://yfvutiopvclccrfpfahu.supabase.co/functions/v1/daily-reminder',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  )
  $$
);

-- Weekly summary at 8am UTC every Sunday
select cron.schedule(
  'weekly-parent-summary',
  '0 8 * * 0',
  $$
  select net.http_post(
    url := 'https://yfvutiopvclccrfpfahu.supabase.co/functions/v1/weekly-summary',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  )
  $$
);
```

Replace `YOUR_SERVICE_ROLE_KEY` with your key from Supabase → Settings → API → service_role key.

---

## Step 5 — Add Files to Your Vite Project

Copy these files into your existing chorequest project:

```
public/
  sw.js                                    ← copy to your public/ folder

src/
  lib/
    pushNotifications.js                   ← new file
  hooks/
    usePushNotifications.js                ← new file
    useFamily.js                           ← REPLACE existing file
  components/
    NotificationBell.jsx                   ← new file
```

---

## Step 6 — Add NotificationBell to Your App Headers

In `src/components/ParentView.jsx`, add the bell to the header:

```jsx
import { NotificationBell } from './NotificationBell'

// Inside ParentView, find the header div and add:
<NotificationBell familyId={family.id} userType="parent" />
```

In `src/components/KidView.jsx`, add it to the kid header:

```jsx
import { NotificationBell } from './NotificationBell'

// Inside KidView header:
<NotificationBell familyId={kid.family_id} userType="kid" kidId={kid.id} />
```

---

## Step 7 — Add VITE_VAPID_PUBLIC_KEY to .env

```env
VITE_SUPABASE_URL=https://yfvutiopvclccrfpfahu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-key...
VITE_VAPID_PUBLIC_KEY=your-public-key-from-step-1
```

---

## Testing

Test the instant notifications manually:
1. Open the app on two devices/tabs — one as parent, one as kid
2. Enable notifications on both (tap the 🔕 bell icon)
3. Kid marks a chore done → parent should get a push within 2 seconds
4. Parent approves → kid should get a push within 2 seconds

Test the cron jobs manually by calling the Edge Functions directly:
```bash
curl -X POST https://yfvutiopvclccrfpfahu.supabase.co/functions/v1/daily-reminder \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"

curl -X POST https://yfvutiopvclccrfpfahu.supabase.co/functions/v1/weekly-summary \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

---

## iOS Note

Web Push on iOS requires the app to be **installed as a PWA** (Add to Home Screen).
Safari on iOS 16.4+ supports Web Push for installed PWAs.

To make ChoreQuest installable, add to your `index.html`:
```html
<link rel="manifest" href="/manifest.json" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
```

And create `public/manifest.json`:
```json
{
  "name": "ChoreQuest",
  "short_name": "ChoreQuest",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#f59e0b",
  "icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }]
}
```
