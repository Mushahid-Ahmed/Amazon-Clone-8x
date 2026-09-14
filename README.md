# Amazon Clone — full-stack storefront

An Amazon-inspired storefront with a complete, production-shaped backend:
Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 on the
frontend, and a Prisma-backed API with real persistence, sessions, and
transactional checkout on the backend. The same codebase runs on SQLite
locally and Vercel Postgres in production.

## Feature map

- **Catalog** — search, category/flag/price filters, five sort orders,
  pagination, product detail pages.
- **Auth** — register/login/logout with bcrypt-hashed passwords and
  httpOnly session cookies; no demo or shared account. Guests can browse
  and cart, but every order, tracking, and account endpoint requires an
  authenticated session, and a guest cart merges into the user's cart on
  login.
- **Cart** — session- or user-scoped items, quantity caps, save-for-later,
  stock guards, server-side merge on login.
- **Checkout** — authentication required; server-computed totals (shipping
  rules, 8.5% tax), saved addresses or inline address entry, mock payment
  gateway (card ending 4242/5555 approves, 0000 declines with 402, cash on
  delivery marks the payment pending), transactional stock decrement with
  order/items/tracking events created atomically, user-scoped order
  history (foreign order IDs return 404), cancel with restock.
- **Reviews** — one review per user per product, rating/review-count
  recompute from aggregates, helpful votes, four sort orders.
- **Accounts** — address book with default-address semantics, Prime toggle,
  order history synced across devices.

## Tech stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Frontend   | Next.js 15 App Router, React 19, Tailwind CSS v4              |
| API        | Route handlers, Zod validation, uniform JSON error envelope   |
| ORM/DB     | Prisma 6 — SQLite locally, Vercel Postgres in production      |
| Auth       | Custom DB sessions (sha256-hashed tokens), bcrypt, 7-day TTL  |
| Testing    | API smoke suite (78 checks), Playwright e2e at 4 viewports, axe |
| Deploy     | Vercel (`vercel-build` prepares the Postgres schema + seed)   |

## Run locally

```bash
npm install
npm run db:setup     # create + seed the SQLite database
npm run dev          # http://localhost:3000
```

Visitors browse and build a cart without an account. Checkout, order
history, order tracking, and account pages require signing in — you'll be
redirected to `/auth` and returned to where you were after logging in.
Register your own account from the sign-in page; a guest cart merges into
your account cart at login.

Other scripts:

```bash
npm run test:api     # 78-check API smoke suite (idempotent)
npm run test:e2e     # Playwright across 375/768/1024/1440 viewports
npm run test:a11y    # accessibility subset (axe, zero serious violations)
npm run build        # production build
```

## Environment

Copy `.env.example` to `.env` for local development. Local development is
zero-config — `DATABASE_URL="file:./dev.db"`. In production, Vercel Postgres
exposes `POSTGRES_PRISMA_URL` automatically; the server prefers any
`postgres://`/`postgresql://` URL it finds.

## Agent logs

`.agent-logs/` contains the session-by-session agent transcript for this
build (per the assignment, it ships with the repo — it is not gitignored).
