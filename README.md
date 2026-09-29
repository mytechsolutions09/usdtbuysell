# Valence OTC Crypto — Institutional USDT Trading Desk

Institutional-grade Over-The-Counter (OTC) crypto desk web application built with React, Vite, Netlify Serverless Functions, and Cloudflare D1 SQL.

---

## Key Features

1. **Restricted Admin Portal**:
   - Gated with secure administrator authentication.
   - Live USDT/INR price tuning with instant spread calculation and preview.
   - Configurable banking and RTGS/IMPS settlement rails.
   - Price audit log tracking historical price changes.
   - **Default Admin Login**: `admin` / `valence2026!`

2. **Cloudflare D1 SQL Database Integration**:
   - Edge SQL relational storage on Cloudflare D1.
   - Tables for `admin_users`, `admin_pricing`, and `price_history`.
   - SQL schema available at [`cloudflare/schema.sql`](file:///h:/site/otc-crypto/cloudflare/schema.sql).

3. **Netlify Production Hosting**:
   - Optimized Vite build (`dist/`).
   - Serverless API functions in [`netlify/functions/`](file:///h:/site/otc-crypto/netlify/functions/).
   - Automated routing and SPA fallback via [`netlify.toml`](file:///h:/site/otc-crypto/netlify.toml) and [`public/_redirects`](file:///h:/site/otc-crypto/public/_redirects).

---

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

---

## Deployment & Setup Instructions

For step-by-step instructions on setting up Cloudflare D1 SQL and deploying to Netlify, see [`DEPLOYMENT_GUIDE.md`](file:///h:/site/otc-crypto/DEPLOYMENT_GUIDE.md).
