# 🦩 Flamingo Market

Multi-vendor marketplace — Next.js 14 (App Router), Prisma + PostgreSQL (Neon), NextAuth, Tailwind, Cloudinary, Resend, Stripe, MTN MoMo.

## What works
- Sign up with **real email OTP** (6-digit, 10 min expiry, 5 attempts, 60 s resend cooldown), login, **forgot/reset password**
- Roles: ADMIN / SELLER / BUYER (route protection via middleware)
- Marketplace, search, product & store pages, reviews (verified buyers), wishlist, cart
- Checkout: Cash on Delivery, Stripe, MTN MoMo (sandbox or production)
- Order tracking with status timeline + **email to buyer on every status change**
- Seller: add / **edit** / hide products (Cloudinary uploads), orders, earnings, withdrawal requests
- Admin: stats, orders, sellers, products, categories, promo codes, **withdrawal approvals**
- Contact form (saved in DB + emailed to `ADMIN_EMAIL`), sitemap.xml, robots.txt, Open Graph tags

## Not built yet
Push notifications, multi-language, dark mode, seller analytics, banner manager, AI recommendations, product boosting, in-app chat, Airtel Money. Withdrawals are approved in the admin panel but **money is sent manually** (MoMo/bank), then marked "Paid".

---

## Deploy: step by step

### 1. Put the code on GitHub
```bash
cd flamingo-market
git init && git add . && git commit -m "Flamingo Market"
git branch -M main
git remote add origin https://github.com/YOUR_USER/flamingo-market.git
git push -u origin main
```
(`.env` is git-ignored — never commit secrets.)

### 2. Database — Neon (free)
1. https://neon.tech → create project → region closest to you.
2. Dashboard → **Connection details**. Copy two strings:
   - **Pooled** (host has `-pooler`) → `DATABASE_URL`
   - **Direct** (toggle "Pooled connection" off) → `DIRECT_URL`

### 3. Images — Cloudinary (free)
1. https://cloudinary.com → sign up → Dashboard.
2. Copy **Cloud name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, **API Key** → `CLOUDINARY_API_KEY`, **API Secret** → `CLOUDINARY_API_SECRET`.

### 4. Email (signup OTP, password reset, orders) — Resend
1. https://resend.com → sign up → **API Keys** → create → `RESEND_API_KEY`.
2. **Domains → Add Domain.** Use a domain/subdomain you own (e.g. `mail.yourdomain.com`). Add the DNS records Resend shows (SPF, DKIM) at your DNS provider and wait for "Verified".
3. Set `EMAIL_FROM="Flamingo Market <noreply@mail.yourdomain.com>"`.

> ⚠️ Without a verified domain, Resend only delivers to your own account's email — real users will never get their OTP. This is the #1 reason OTP "doesn't work".
> There is no truly unlimited free email. Resend's free plan has a daily and monthly cap (check current numbers at resend.com/pricing); beyond it you pay, or switch the sender in `src/lib/email.ts` to another provider (Brevo, Postmark, SES, SMTP).

### 5. Secrets
```bash
openssl rand -base64 32     # → NEXTAUTH_SECRET
```
`ADMIN_EMAIL` = your email (gets order alerts + contact messages, and becomes the admin login).

### 6. Create tables + admin (run once, from your computer)
```bash
npm install
cp .env.example .env        # fill in the values above
# also set ADMIN_PASSWORD (min 8 chars) in .env
npx prisma db push          # creates tables in Neon
npm run db:seed             # 8 categories + your admin account
```
Re-run `npx prisma db push` any time `prisma/schema.prisma` changes.

### 7. Vercel
1. https://vercel.com → **Add New → Project** → import the GitHub repo (framework: Next.js, auto-detected).
2. **Environment Variables**: add everything from `.env.example` you filled in. Set `NEXTAUTH_URL` to your final URL, e.g. `https://flamingo-market.vercel.app` (update it if you add a custom domain).
3. Deploy. Build command is `prisma generate && next build` (already in `package.json`).
4. Add your custom domain under Project → Settings → Domains, then update `NEXTAUTH_URL` and redeploy.

### 8. Optional integrations
- **Google login:** console.cloud.google.com → APIs & Services → Credentials → OAuth client (Web). Authorized redirect URI: `https://YOUR_DOMAIN/api/auth/callback/google`. Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
- **Stripe:** keys from dashboard.stripe.com → `STRIPE_SECRET_KEY`. Webhook endpoint `https://YOUR_DOMAIN/api/payments/webhook`, event `checkout.session.completed` → copy signing secret to `STRIPE_WEBHOOK_SECRET`.
- **MTN MoMo:** momodeveloper.mtn.com → subscribe to *Collection* → `MOMO_SUBSCRIPTION_KEY`, create API user/key (`MOMO_API_USER`, `MOMO_API_KEY`). Keep `MOMO_ENV=sandbox` for testing; real money needs MTN production approval and `MOMO_ENV=production`.
- **Telegram alerts:** create a bot with @BotFather → `TELEGRAM_BOT_TOKEN`; your chat id → `TELEGRAM_CHAT_ID`.

### 9. Go-live test checklist
1. Register a new account with a different email → OTP arrives → verify → login.
2. Forgot password → code arrives → reset → login.
3. Log in as admin → create/check categories → approve a seller.
4. Seller: add product with images → edit it → appears in marketplace.
5. Buyer: place a Cash-on-Delivery order → admin gets email; seller sets *Shipped* → buyer gets email.
6. Contact form → message arrives at `ADMIN_EMAIL`.
7. Seller requests withdrawal → admin approves/pays at `/admin/withdrawals`.

## Local development
```bash
npm install && cp .env.example .env   # fill in
npx prisma db push
SEED_DEMO=true npm run db:seed         # optional demo seller/buyer (never in production)
npm run dev
```
