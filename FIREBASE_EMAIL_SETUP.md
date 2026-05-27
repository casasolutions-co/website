# Firebase Trigger Email — Setup Guide

The enquiry form writes to two Firestore collections:
- `enquiries` — stores every submission for Casa's records
- `mail` — the Trigger Email extension watches this and sends the emails

---

## Step 1 — Install the extension

1. Open [Firebase Console](https://console.firebase.google.com) → project **unistay-f7589**
2. Left sidebar → **Extensions** → **Explore extensions**
3. Search for **"Trigger Email from Firestore"** → click **Install**

---

## Step 2 — Configure SMTP during installation

When prompted for **SMTP connection URI**, use the format below for your email host:

```
smtps://your@email.com:YOUR_PASSWORD@smtp.your-host.com:465
```

### Common providers

| Host         | SMTP server                   | Port |
|--------------|-------------------------------|------|
| GoDaddy      | `smtpout.secureserver.net`    | 465  |
| Namecheap    | `mail.privateemail.com`       | 465  |
| Zoho Mail    | `smtp.zoho.eu`                | 465  |
| Ionos / 1&1  | `smtp.ionos.com`              | 465  |
| Hostinger    | `smtp.hostinger.com`          | 465  |
| Outlook 365  | `smtp.office365.com`          | 587  |

**Example for GoDaddy:**
```
smtps://contact@casasolutions.com:YourPassword@smtpout.secureserver.net:465
```

Set **Email documents collection** to: `mail`

Click **Install** — takes ~2 minutes.

---

## Step 3 — Set your admin email

In `.env.local` (and in your Vercel/hosting environment variables):

```
ADMIN_EMAIL=contact@casasolutions.com
NEXT_PUBLIC_SITE_URL=https://your-production-url.com
```

---

## Step 4 — Firestore security rules

In Firebase Console → **Firestore** → **Rules**, add write access for the two collections the API route uses:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Allow the server API route to write enquiries and trigger emails
    match /enquiries/{doc} {
      allow write: if true;
      allow read: if false; // admin only — tighten later
    }
    match /mail/{doc} {
      allow write: if true;
      allow read: if false;
    }

    // ... your existing rules below
  }
}
```

> **Note:** For production, restrict writes to authenticated server requests.
> These open rules are fine while testing.

---

## Step 5 — Test it

1. Run the app locally (`npm run dev`)
2. Go to a property detail page, sign in, fill in the enquiry form
3. Submit — check the Firebase Console → Firestore → `mail` collection
4. You should see a document appear; the extension picks it up within seconds
5. Check both inboxes: admin notification + student confirmation

---

## How it works (code)

`src/app/api/unistay/enquiry/route.ts` does three things on each submission:

1. Saves the enquiry to `enquiries/{auto-id}` (permanent record for Casa)
2. Adds a doc to `mail` → admin gets a notification with full details, reply-to set to student's email
3. Adds a doc to `mail` → student gets a confirmation naming the property

The Trigger Email extension watches the `mail` collection and fires SMTP emails for each new document automatically.
