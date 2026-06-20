# UniStay

Student housing platform built for Casa Solutions. Lets students search and enquire about properties across German cities, and gives landlords a simple way to list rooms.

## Stack

- Next.js 15 (App Router)
- Tailwind CSS
- Firebase (auth + Firestore)
- Cloudflare D1 (Casa-managed listings)
- HousingAnywhere feed integration

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000/unistay](http://localhost:3000/unistay).

## Environment variables

Create a `.env.local` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
ADMIN_EMAIL=
NEXT_PUBLIC_SITE_URL=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_D1_DATABASE_ID=
CLOUDFLARE_API_TOKEN=
```

## Deployment

Deploy to Vercel. Set the same environment variables in the Vercel dashboard. The Cloudflare D1 database is managed separately via `wrangler`.
