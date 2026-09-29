-- ==============================================================================
-- CLOUDFLARE D1 SQL SCHEMA FOR VALENCE OTC CRYPTO DESK
-- Database engine: SQLite (Cloudflare D1 edge SQL database)
-- ==============================================================================

-- 1. Admin Users Table
-- Stores authorized OTC Desk administrators and operators
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- SHA-256 hex encoded
  role TEXT DEFAULT 'admin',   -- 'superadmin', 'admin', 'desk_operator'
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- 2. Admin Pricing & Desk Calibration Table
-- Live benchmark buying and selling USDT/INR rates & institutional banking rails
CREATE TABLE IF NOT EXISTS admin_pricing (
  id TEXT PRIMARY KEY DEFAULT 'default-pricing',
  buy_price_inr REAL NOT NULL,      -- Rate customers pay to BUY USDT from Desk (e.g. 90.25)
  sell_price_inr REAL NOT NULL,     -- Rate customers receive when SELLING USDT to Desk (e.g. 88.80)
  base_benchmark_inr REAL NOT NULL, -- Global reference benchmark (e.g. 89.45)
  min_trade_inr REAL NOT NULL,      -- Minimum transaction size in INR (e.g. 25000)
  max_trade_inr REAL NOT NULL,      -- Maximum transaction size in INR (e.g. 100000000)
  min_trade_usdt REAL DEFAULT 300,
  max_trade_usdt REAL DEFAULT 1200000,
  desk_spread_bps REAL DEFAULT 14,
  bank_name TEXT,
  account_number TEXT,
  ifsc TEXT,
  beneficiary_name TEXT,
  upi_id TEXT,
  city TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT DEFAULT 'system'
);

-- 3. Price History & Audit Log Table
-- Audit trail tracking every single rate change made by desk admins
CREATE TABLE IF NOT EXISTS price_history (
  id TEXT PRIMARY KEY,
  buy_price_inr REAL NOT NULL,
  sell_price_inr REAL NOT NULL,
  spread_inr REAL NOT NULL,
  note TEXT,
  updated_by TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- SEED INITIAL DATA
-- ==============================================================================

-- Default admin user:
-- Username: admin
-- Password: valence2026!
-- SHA-256 hash of "valence2026!":
-- e2c34df04100fc0de4d5e94b7ef893d56d11636c253c612347209772bf6249d3
INSERT OR IGNORE INTO admin_users (id, username, password_hash, role, email)
VALUES (
  'usr-admin-1',
  'admin',
  'e2c34df04100fc0de4d5e94b7ef893d56d11636c253c612347209772bf6249d3',
  'superadmin',
  'treasury@valence-otc.internal'
);

-- Default Pricing Benchmark Calibration
INSERT OR IGNORE INTO admin_pricing (
  id,
  buy_price_inr,
  sell_price_inr,
  base_benchmark_inr,
  min_trade_inr,
  max_trade_inr,
  min_trade_usdt,
  max_trade_usdt,
  desk_spread_bps,
  bank_name,
  account_number,
  ifsc,
  beneficiary_name,
  upi_id,
  city,
  updated_by
) VALUES (
  'default-pricing',
  90.25,
  88.80,
  89.45,
  25000,
  100000000,
  300,
  1200000,
  14,
  'HDFC Bank Ltd (Corporate OTC Treasury Branch)',
  '50200084920199',
  'HDFC0000123',
  'VALENCE OTC MARKETS PRIVATE LIMITED',
  'valence.otc@hdfcbank',
  'Mumbai, BKC',
  'system-seed'
);

-- Initial audit history entry
INSERT OR IGNORE INTO price_history (id, buy_price_inr, sell_price_inr, spread_inr, note, updated_by)
VALUES (
  'hist-seed-1',
  90.25,
  88.80,
  1.45,
  'Initial prime liquidity desk baseline rate calibration',
  'system'
);
