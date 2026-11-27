# KVIST — Calm objects for slow homes

Scandinavian homewares storefront & real-time admin dashboard built with React 19, TypeScript, Tailwind CSS v4, React Router, Motion, Lenis smooth scroll, Lucide icons, and optional Firebase Auth / Firestore / Cloud Storage (with automatic zero-config local demo mode).

## Features

- **Storefront (`/`, `/shop`, `/product/:id`, `/checkout`, `/account`, `/login`)**
  - Bento-grid editorial home page, split-word typography animations, magnetic CTAs, pointer parallax product stages, and View Transitions between catalog cards and product pages.
  - Slide-over shopping bag with parabolic add-to-bag flight animation, free-shipping progress bar, and 3-step checkout with animated order confirmation.
  - Customer account order history with 4-step fulfillment progress bars.
- **Admin Dashboard (`/dashboard`, `/dashboard/orders`, `/dashboard/products`, `/dashboard/categories`)**
  - Real-time KPI sparkline tiles, interactive SVG revenue/orders spline chart (`7D` / `30D` / `90D`), daily goal ring + 24h histogram, category share donut, top products, inventory allocation tracker, and live simulated shopper traffic toggle with toast notifications.
  - Full order management with search, status filter pills, one-click fulfillment progression, and slide-over order detail drawer.
  - Complete product & category CRUD: live/draft visibility switches, starter catalog importer, slide-over product editor with live `ProductCard` preview, studio cutout/room scene pickers + WebP image upload, custom finishes & details, and category creation/renaming/reassignment.

## Getting Started

```bash
npm install
npm run dev
```

### Scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Production bundle build
- `npm run typecheck` — TypeScript strict check (`tsc --noEmit`)
- `npm run lint` — ESLint check across `.ts` / `.tsx`
- `npm run format` — Prettier auto-format (with `prettier-plugin-tailwindcss`)

### Optional Firebase Setup

Copy `.env.example` to `.env.local` and supply your `VITE_FIREBASE_*` keys to switch automatically from browser Demo mode to live Firebase Auth, Firestore, and Cloud Storage.
