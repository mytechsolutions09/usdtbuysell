import { queryD1, isCloudflareConfigured } from './lib/cloudflare-d1.js';

export default async function handler(request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const hasD1 = isCloudflareConfigured();

  if (hasD1) {
    const qRes = await queryD1('SELECT id, buy_price_inr as buy, sell_price_inr as sell, spread_inr as spread, note, updated_by, created_at as time FROM price_history ORDER BY created_at DESC LIMIT 25');
    if (qRes.success && qRes.results) {
      return new Response(JSON.stringify({
        success: true,
        source: 'cloudflare_d1',
        history: qRes.results
      }), { status: 200, headers });
    }
  }

  return new Response(JSON.stringify({
    success: true,
    source: 'fallback',
    history: []
  }), { status: 200, headers });
}
