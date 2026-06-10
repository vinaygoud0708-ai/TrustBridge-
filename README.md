# 🌉 TrustBridge

> A transparent charity platform connecting donors to verified organizations — with real-time fund tracking, trust scoring, and full financial accountability.

[![CI Build](https://github.com/vinaygoud0708-ai/TrustBridge-/actions/workflows/ci.yml/badge.svg)](https://github.com/vinaygoud0708-ai/TrustBridge-/actions/workflows/ci.yml)

---

## 🚀 Deploy on Vercel (Recommended)

> **⚠️ Important:** This is a full-stack Next.js app with a database and API routes. It **cannot** be deployed on GitHub Pages. Use **Vercel** (free) instead.

### Step 1 — Import your GitHub repo on Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub
2. Click **"Add New → Project"**
3. Find **`TrustBridge-`** in your repositories and click **Import**
4. Vercel will auto-detect Next.js — click **Deploy**

### Step 2 — Add Environment Variables

After importing, go to your project on Vercel → **Settings → Environment Variables** and add:

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | `file:./prisma/dev.db` (demo) or your hosted DB URL | ✅ |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` to generate | ✅ |
| `NEXTAUTH_URL` | Your Vercel URL e.g. `https://trustbridge.vercel.app` | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | From [Stripe dashboard](https://dashboard.stripe.com) | ✅ |
| `STRIPE_SECRET_KEY` | From [Stripe dashboard](https://dashboard.stripe.com) | ✅ |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Webhooks | ✅ |
| `CLOUDINARY_CLOUD_NAME` | From [Cloudinary](https://cloudinary.com/console) | ✅ |
| `CLOUDINARY_API_KEY` | From Cloudinary | ✅ |
| `CLOUDINARY_API_SECRET` | From Cloudinary | ✅ |
| `RESEND_API_KEY` | From [Resend](https://resend.com) | ✅ |
| `PUSHER_APP_ID` | From [Pusher](https://dashboard.pusher.com) | ✅ |
| `PUSHER_KEY` | From Pusher | ✅ |
| `PUSHER_SECRET` | From Pusher | ✅ |
| `PUSHER_CLUSTER` | From Pusher | ✅ |
| `NEXT_PUBLIC_PUSHER_KEY` | Same as `PUSHER_KEY` | ✅ |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Same as `PUSHER_CLUSTER` | ✅ |

> See [`.env.example`](./.env.example) for a complete template.

### Step 3 — Redeploy

After adding all environment variables, click **"Redeploy"** in your Vercel dashboard.  
Your site will be live at `https://your-project.vercel.app` 🎉

---

## 💻 Local Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/vinaygoud0708-ai/TrustBridge-.git
cd TrustBridge-

# 2. Install dependencies
npm install

# 3. Set up environment variables (auto-creates .env with mock values)
node scripts/ensure-env.js

# 4. Generate Prisma client
npx prisma generate

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database

| Environment | Provider | Setup |
|---|---|---|
| Local dev | SQLite (`prisma/dev.db`) | Included in repo (pre-seeded) |
| Vercel (demo) | SQLite | Uses `prisma/dev.db` from repo |
| Vercel (production) | [Turso](https://turso.tech) (free) or [Neon](https://neon.tech) (free PostgreSQL) | Change `DATABASE_URL` env var |

### Seed the database (local only)

```bash
npx tsx prisma/seed.ts
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database ORM | Prisma |
| Database | SQLite / PostgreSQL |
| Authentication | NextAuth.js |
| Payments | Stripe |
| File Storage | Cloudinary |
| Real-time | Pusher |
| Email | Resend |
| UI | Radix UI + Tailwind CSS |

---

## 📁 Project Structure

```
app/
  (auth)/        # Login, register pages
  (dashboard)/   # Donor, charity, admin dashboards
  (public)/      # Public landing, campaigns, charities
  api/           # API routes (REST endpoints)
components/      # Reusable UI components
lib/             # Utilities, Prisma client, auth config
prisma/          # Schema, migrations, seed data
types/           # TypeScript type definitions
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m 'feat: add my feature'`)
4. Push to your branch and open a Pull Request

---

## 📄 License

MIT
