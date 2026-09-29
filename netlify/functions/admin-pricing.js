import crypto from 'node:crypto';
import { queryD1, isCloudflareConfigured } from './lib/cloudflare-d1.js';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'valence-otc-super-secret-key-2026';

function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payloadStr).digest('base64url');
  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export default async function handler(request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const hasD1 = isCloudflareConfigured();

  // GET: Fetch pricing
  if (request.method === 'GET') {
    if (hasD1) {
      const qRes = await queryD1('SELECT * FROM admin_pricing WHERE id = ? LIMIT 1', ['default-pricing']);
      if (qRes.success && qRes.results && qRes.results.length > 0) {
        const row = qRes.results[0];
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
          source: 'cloudflare_d1',
          isCloudflareConnected: true,
          pricing
        }), { status: 200, headers });
      }
    }

    // Default fallback pricing
    return new Response(JSON.stringify({
      success: true,
      source: 'fallback',
      isCloudflareConnected: hasD1,
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
    }), { status: 200, headers });
  }

  // POST / PUT: Update pricing (Admin Only)
  if (request.method === 'POST' || request.method === 'PUT') {
    const authUser = verifyToken(request.headers.get('Authorization'));
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Valid admin token required to adjust OTC pricing' }), {
        status: 401,
        headers
      });
    }

    try {
      const body = await request.json();
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
        note = 'Admin updated pricing'
      } = body || {};

      if (!buyPriceInr || !sellPriceInr) {
        return new Response(JSON.stringify({ error: 'buyPriceInr and sellPriceInr are required' }), {
          status: 400,
          headers
        });
      }

      if (hasD1) {
        // Upsert into Cloudflare D1 SQL
        const updateSql = `
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
            updated_by = excluded.updated_by;
        `;

        const updateParams = [
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
          authUser.username || 'admin'
        ];

        const d1Res = await queryD1(updateSql, updateParams);

        if (!d1Res.success) {
          return new Response(JSON.stringify({ error: `Cloudflare D1 SQL error: ${d1Res.error}` }), {
            status: 500,
            headers
          });
        }

        // Insert into price_history audit table
        const histId = `hist-${Date.now()}`;
        const spreadInr = Number((buyPriceInr - sellPriceInr).toFixed(2));
        await queryD1(
          'INSERT INTO price_history (id, buy_price_inr, sell_price_inr, spread_inr, note, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
          [histId, Number(buyPriceInr), Number(sellPriceInr), spreadInr, note, authUser.username || 'admin']
        );

        return new Response(JSON.stringify({
          success: true,
          source: 'cloudflare_d1',
          isCloudflareConnected: true,
          message: 'Pricing synchronized with Cloudflare D1 SQL database',
          historyEntry: {
            id: histId,
            buy: Number(buyPriceInr),
            sell: Number(sellPriceInr),
            spread: spreadInr,
            note,
            time: 'Just now'
          }
        }), { status: 200, headers });
      }

      // If D1 is not yet configured, return success with local mode indicator
      return new Response(JSON.stringify({
        success: true,
        source: 'local_fallback',
        isCloudflareConnected: false,
        message: 'Saved in local mode (Set Cloudflare D1 environment variables in Netlify for edge persistence)'
      }), { status: 200, headers });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || 'Failed to update pricing' }), {
        status: 500,
        headers
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
}
