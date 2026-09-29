/**
 * Cloudflare Worker for Valence OTC Crypto Platform
 * Direct Native Binding to Cloudflare D1 SQL (env.DB)
 * Runs entirely on Cloudflare edge — No .env API keys or tokens required!
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

async function sha256(text) {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createToken(payload, secretKey = 'valence-otc-edge-secret-2026') {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const payloadStr = btoa(JSON.stringify({
    ...payload,
    exp: Date.now() + (24 * 60 * 60 * 1000)
  }));
  
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadStr));
  const sigArray = Array.from(new Uint8Array(sigBuffer));
  const sig = btoa(String.fromCharCode.apply(null, sigArray)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return `${payloadStr}.${sig}`;
}

async function verifyToken(authHeader, secretKey = 'valence-otc-edge-secret-2026') {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  try {
    const payload = JSON.parse(atob(parts[0]));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Health / Root check
    if (path === '/' || path === '/health') {
      return new Response(JSON.stringify({
        status: 'online',
        service: 'Valence OTC Cloudflare D1 Backend',
        database: Boolean(env.DB) ? 'bound' : 'missing_binding',
        timestamp: new Date().toISOString()
      }), { status: 200, headers: CORS_HEADERS });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({
        error: 'D1 database binding missing. Ensure [[d1_databases]] binding is set to DB in wrangler.toml or Cloudflare Dashboard.'
      }), { status: 500, headers: CORS_HEADERS });
    }

    try {
      // 1. ADMIN AUTH LOGIN (/api/auth-login)
      if (path === '/api/auth-login' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const { username, password } = body;

        if (!username || !password) {
          return new Response(JSON.stringify({ error: 'Username and password required' }), {
            status: 400,
            headers: CORS_HEADERS
          });
        }

        const hashed = await sha256(password);

        // Query admin_users directly from Cloudflare D1 SQL
        const user = await env.DB.prepare(
          'SELECT id, username, password_hash, role, email FROM admin_users WHERE username = ? LIMIT 1'
        ).bind(username.trim()).first();

        if (user && user.password_hash === hashed) {
          // Update last_login timestamp
          ctx.waitUntil(
            env.DB.prepare('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?')
              .bind(user.id)
              .run()
          );

          const token = await createToken({ id: user.id, username: user.username, role: user.role });

          return new Response(JSON.stringify({
            success: true,
            source: 'cloudflare_d1_worker',
            token,
            user: {
              id: user.id,
              username: user.username,
              role: user.role,
              email: user.email
            }
          }), { status: 200, headers: CORS_HEADERS });
        }

        // Fallback for default admin
        if (username.trim().toLowerCase() === 'admin' && (hashed === 'e2c34df04100fc0de4d5e94b7ef893d56d11636c253c612347209772bf6249d3' || password === 'valence2026!')) {
          const fallbackUser = { id: 'usr-admin-1', username: 'admin', role: 'superadmin' };
          const token = await createToken(fallbackUser);
          return new Response(JSON.stringify({
            success: true,
            source: 'cloudflare_d1_worker',
            token,
            user: fallbackUser
          }), { status: 200, headers: CORS_HEADERS });
        }

        return new Response(JSON.stringify({ error: 'Invalid admin credentials' }), {
          status: 401,
          headers: CORS_HEADERS
        });
      }

      // 2. GET PRICING (/api/admin-pricing)
      if (path === '/api/admin-pricing' && request.method === 'GET') {
        const row = await env.DB.prepare(
          'SELECT * FROM admin_pricing WHERE id = ? LIMIT 1'
        ).bind('default-pricing').first();

        if (row) {
          const pricing = {
            buyPriceInr: row.buy_price_inr,
            sellPriceInr: row.sell_price_inr,
            baseBenchmarkInr: row.base_benchmark_inr,
            minTradeInr: row.min_trade_inr,
            maxTradeInr: row.max_trade_inr,
            minTradeUsdt: row.min_trade_usdt || 300,
            maxTradeUsdt: row.max_trade_usdt || 1200000,
            deskSpreadBps: row.desk_spread_bps || 14,
            bankDetails: {
              bankName: row.bank_name,
              accountNumber: row.account_number,
              ifsc: row.ifsc,
              beneficiaryName: row.beneficiary_name,
              upiId: row.upi_id,
              city: row.city
            },
            lastUpdated: row.updated_at
          };

          return new Response(JSON.stringify({
            success: true,
            source: 'cloudflare_d1_worker',
            isCloudflareConnected: true,
            pricing
          }), { status: 200, headers: CORS_HEADERS });
        }

        // Seed fallback if table is empty
        return new Response(JSON.stringify({
          success: true,
          source: 'default_seed',
          pricing: {
            buyPriceInr: 90.25,
            sellPriceInr: 88.80,
            baseBenchmarkInr: 89.45,
            minTradeInr: 25000,
            maxTradeInr: 100000000,
            minTradeUsdt: 300,
            maxTradeUsdt: 1200000,
            deskSpreadBps: 14,
            bankDetails: {
              beneficiaryName: 'VALENCE OTC MARKETS PRIVATE LIMITED',
              bankName: 'HDFC Bank Ltd (Corporate OTC Treasury Branch)',
              accountNumber: '50200084920199',
              ifsc: 'HDFC0000123',
              upiId: 'valence.otc@hdfcbank',
              city: 'Mumbai, BKC'
            },
            lastUpdated: new Date().toISOString()
          }
        }), { status: 200, headers: CORS_HEADERS });
      }

      // 3. UPDATE PRICING (/api/admin-pricing)
      if (path === '/api/admin-pricing' && (request.method === 'POST' || request.method === 'PUT')) {
        const auth = await verifyToken(request.headers.get('Authorization'));
        if (!auth) {
          return new Response(JSON.stringify({ error: 'Unauthorized: Admin authentication token required' }), {
            status: 401,
            headers: CORS_HEADERS
          });
        }

        const body = await request.json().catch(() => ({}));
        const {
          buyPriceInr,
          sellPriceInr,
          baseBenchmarkInr = 89.45,
          minTradeInr = 25000,
          maxTradeInr = 100000000,
          minTradeUsdt = 300,
          maxTradeUsdt = 1200000,
          deskSpreadBps = 14,
          bankDetails = {},
          note = 'Rate calibrated by Admin'
        } = body;

        // Upsert into Cloudflare D1 SQL
        await env.DB.prepare(`
          INSERT INTO admin_pricing (
            id, buy_price_inr, sell_price_inr, base_benchmark_inr, min_trade_inr, max_trade_inr,
            min_trade_usdt, max_trade_usdt, desk_spread_bps, bank_name, account_number, ifsc,
            beneficiary_name, upi_id, city, updated_at, updated_by
          ) VALUES (
            'default-pricing', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?
          )
          ON CONFLICT(id) DO UPDATE SET
            buy_price_inr = excluded.buy_price_inr,
            sell_price_inr = excluded.sell_price_inr,
            base_benchmark_inr = excluded.base_benchmark_inr,
            min_trade_inr = excluded.min_trade_inr,
            max_trade_inr = excluded.max_trade_inr,
            min_trade_usdt = excluded.min_trade_usdt,
            max_trade_usdt = excluded.max_trade_usdt,
            desk_spread_bps = excluded.desk_spread_bps,
            bank_name = excluded.bank_name,
            account_number = excluded.account_number,
            ifsc = excluded.ifsc,
            beneficiary_name = excluded.beneficiary_name,
            upi_id = excluded.upi_id,
            city = excluded.city,
            updated_at = CURRENT_TIMESTAMP,
            updated_by = excluded.updated_by
        `).bind(
          Number(buyPriceInr),
          Number(sellPriceInr),
          Number(baseBenchmarkInr),
          Number(minTradeInr),
          Number(maxTradeInr),
          Number(minTradeUsdt),
          Number(maxTradeUsdt),
          Number(deskSpreadBps),
          bankDetails.bankName || null,
          bankDetails.accountNumber || null,
          bankDetails.ifsc || null,
          bankDetails.beneficiaryName || null,
          bankDetails.upiId || null,
          bankDetails.city || null,
          auth.username || 'admin'
        ).run();

        // Add to price_history table
        const histId = `hist-${Date.now()}`;
        const spreadInr = Number((buyPriceInr - sellPriceInr).toFixed(2));
        await env.DB.prepare(
          'INSERT INTO price_history (id, buy_price_inr, sell_price_inr, spread_inr, note, updated_by) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(histId, Number(buyPriceInr), Number(sellPriceInr), spreadInr, note, auth.username || 'admin').run();

        return new Response(JSON.stringify({
          success: true,
          source: 'cloudflare_d1_worker',
          isCloudflareConnected: true,
          message: 'Saved directly to Cloudflare D1 SQL via Edge Worker',
          historyEntry: {
            id: histId,
            buy: Number(buyPriceInr),
            sell: Number(sellPriceInr),
            spread: spreadInr,
            note,
            time: 'Just now'
          }
        }), { status: 200, headers: CORS_HEADERS });
      }

      // 4. GET HISTORY (/api/admin-history)
      if (path === '/api/admin-history' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT id, buy_price_inr as buy, sell_price_inr as sell, spread_inr as spread, note, updated_by, created_at as time FROM price_history ORDER BY created_at DESC LIMIT 25'
        ).all();

        return new Response(JSON.stringify({
          success: true,
          source: 'cloudflare_d1_worker',
          history: results || []
        }), { status: 200, headers: CORS_HEADERS });
      }

      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: CORS_HEADERS
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || 'Worker server error' }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }
  }
};
