# Valence OTC Crypto — Deployment & Architecture Guide

This platform is configured for production hosting on **Netlify** with serverless SQL persistence on **Cloudflare D1**.

---

## 1. Admin Authentication System

Access to the **Admin Pricing & Margins Engine** is strictly restricted to authenticated administrators.

- **Default Administrator Credentials**:
  - **Username**: `admin`
  - **Password**: `valence2026!`
- **Security Features**:
  - **Restricted Access**: Non-authenticated visitors see a locked screen when visiting the Admin route, and clicking on the Admin navigation button prompts the secure modal.
  - **Auto-Fill Helper**: In development and initial setup, the login modal includes a one-click auto-fill pill for rapid testing.
  - **Session Management**: Authenticated sessions are stored securely and can be terminated anytime using the **Log Out** button in the Navbar or inside the Admin Panel.
  - **Audit Logging**: Every rate change is logged in the SQL audit table with timestamp, admin username, and price spread.

---

## 2. Cloudflare D1 SQL Setup

[Cloudflare D1](https://developers.cloudflare.com/d1/) is Cloudflare's serverless edge SQL database (SQLite-compatible).

### Step A: Create D1 Database

You can create the database using the **Cloudflare Dashboard** or the **Wrangler CLI**:

#### Option 1: Via Cloudflare Dashboard
1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **D1 SQL**.
2. Click **Create Database**, name it `valence-otc-db`, and choose your preferred primary region.
3. Note your **Database ID** (UUID) from the database settings page.
4. Note your **Account ID** from the Cloudflare Dashboard overview right sidebar.

#### Option 2: Via Wrangler CLI
```bash
npx wrangler d1 create valence-otc-db
```

### Step B: Execute the SQL Schema

Run the provided schema file (`cloudflare/schema.sql`):

#### Via Cloudflare Dashboard Console
1. Open your database in the dashboard and click the **Console** tab.
2. Paste the contents of `cloudflare/schema.sql` and click **Execute**.

#### Via Wrangler CLI
```bash
npx wrangler d1 execute valence-otc-db --file=./cloudflare/schema.sql
```

### Step C: Generate a Cloudflare API Token
1. Go to **My Profile** → **API Tokens** → **Create Token**.
2. Create a custom token with permission:
   - **Account** → **D1** → **Edit**
3. Copy the generated token.

---

## 3. Netlify Hosting Setup

The project includes pre-configured [`netlify.toml`](file:///h:/site/otc-crypto/netlify.toml) and [`public/_redirects`](file:///h:/site/otc-crypto/public/_redirects) for automatic builds, SPA routing, and serverless functions.

### Step A: Connect Repository to Netlify
1. Push this project to your GitHub/GitLab repository.
2. Log in to [Netlify](https://app.netlify.com) and click **Add new site** → **Import an existing project**.
3. Select your repository.
4. Netlify will automatically detect settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

### Step B: Add Environment Variables in Netlify
Go to **Site settings** → **Environment variables** and add:

| Variable Name | Description | Example / Default |
|---|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID | `a1b2c3d4e5f6...` |
| `CLOUDFLARE_DATABASE_ID` | Your Cloudflare D1 Database UUID | `99e8a1bc-3412-4212-...` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token with D1 Edit access | `cf_tok_...` |
| `ADMIN_JWT_SECRET` | Secret key used to sign admin session tokens | `super-secret-random-key` |
| `ADMIN_USERNAME` | Fallback admin username | `admin` |
| `ADMIN_PASSWORD` | Fallback admin password | `valence2026!` |

### Step C: Deploy
Click **Deploy site**. Once deployed, your Netlify URL will serve the complete platform!

---

## 4. Architecture Overview

```
                      +-----------------------------+
                      |         End User            |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |      Netlify Edge CDN       |
                      |  - React SPA (Vite build)   |
                      |  - Admin Login & Gating     |
                      +--------------+--------------+
                                     |  /api/* rewrites
                                     v
                      +-----------------------------+
                      | Netlify Serverless Functions|
                      |  - /api/auth-login          |
                      |  - /api/admin-pricing       |
                      |  - /api/admin-history       |
                      +--------------+--------------+
                                     |  Parameterized SQL queries
                                     v
                      +-----------------------------+
                      |    Cloudflare D1 SQL (DB)   |
                      |  - admin_users              |
                      |  - admin_pricing            |
                      |  - price_history            |
                      +-----------------------------+
```

### Edge Resilience & Fallback
If the Cloudflare D1 environment variables are not yet configured or pending activation, the platform automatically runs in **Standalone Fallback Mode** with browser-side encryption. The Admin Panel displays a status badge (`🟢 Cloudflare D1 SQL: Connected` vs `🟡 Cloudflare D1 SQL: Standalone`) so you always know the exact operational state of the database.
