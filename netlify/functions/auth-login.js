import crypto from 'node:crypto';
import { queryD1, isCloudflareConfigured } from './lib/cloudflare-d1.js';

// Default fallback credentials if Cloudflare D1 is not yet linked
const FALLBACK_ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const FALLBACK_ADMIN_PASS = process.env.ADMIN_PASSWORD || 'valence2026!';
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'valence-otc-super-secret-key-2026';

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function generateSimpleToken(user) {
  const payload = {
    sub: user.id || 'usr-admin-1',
    username: user.username,
    role: user.role || 'admin',
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  const str = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(str).digest('base64url');
  return `${str}.${sig}`;
}

export default async function handler(request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    const body = await request.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password are required' }), {
        status: 400,
        headers
      });
    }

    const hashedInput = sha256(password);
    const hasD1 = isCloudflareConfigured();

    if (hasD1) {
      // Query Cloudflare D1 SQL database
      const qRes = await queryD1('SELECT id, username, password_hash, role, email FROM admin_users WHERE username = ? LIMIT 1', [username.trim()]);
      
      if (qRes.success && qRes.results && qRes.results.length > 0) {
        const user = qRes.results[0];
        if (user.password_hash === hashedInput) {
          // Update last_login
          await queryD1('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

          const token = generateSimpleToken(user);
          return new Response(JSON.stringify({
            success: true,
            source: 'cloudflare_d1',
            token,
            user: {
              id: user.id,
              username: user.username,
              role: user.role,
              email: user.email
            }
          }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: 'Invalid admin credentials' }), {
            status: 401,
            headers
          });
        }
      }
    }

    // Fallback mode if Cloudflare D1 is pending setup or user matches fallback
    if (username.trim().toLowerCase() === FALLBACK_ADMIN_USER.toLowerCase() && password === FALLBACK_ADMIN_PASS) {
      const fallbackUser = {
        id: 'usr-admin-fallback',
        username: FALLBACK_ADMIN_USER,
        role: 'superadmin',
        email: 'admin@valence-otc.internal'
      };
      const token = generateSimpleToken(fallbackUser);

      return new Response(JSON.stringify({
        success: true,
        source: hasD1 ? 'cloudflare_d1' : 'local_fallback',
        token,
        isCloudflareConnected: hasD1,
        user: fallbackUser,
        notice: hasD1 ? null : 'Running in standalone fallback mode. Configure Netlify Cloudflare D1 env variables to enable edge SQL sync.'
      }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: 'Invalid admin credentials' }), {
      status: 401,
      headers
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers
    });
  }
}
