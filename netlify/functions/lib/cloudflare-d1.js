/**
 * Cloudflare D1 SQL Client for Netlify Serverless Functions
 * Connects directly to Cloudflare D1 Serverless SQL REST API.
 */

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

/**
 * Check if Cloudflare D1 environment variables are available
 */
export function isCloudflareConfigured() {
  return Boolean(
    CLOUDFLARE_ACCOUNT_ID && 
    CLOUDFLARE_DATABASE_ID && 
    CLOUDFLARE_API_TOKEN
  );
}

/**
 * Execute a SQL query on Cloudflare D1
 * @param {string} sql 
 * @param {Array<any>} params 
 * @returns {Promise<{ success: boolean, results?: Array<any>, error?: string }>}
 */
export async function queryD1(sql, params = []) {
  if (!isCloudflareConfigured()) {
    return {
      success: false,
      isConfigured: false,
      error: 'Cloudflare D1 credentials missing. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, and CLOUDFLARE_API_TOKEN in Netlify.'
    };
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${CLOUDFLARE_DATABASE_ID}/query`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql,
        params
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      const errorMsg = data.errors?.map(e => e.message).join(', ') || `Cloudflare API error ${res.status}`;
      return { success: false, error: errorMsg };
    }

    const firstResult = data.result?.[0];
    return {
      success: true,
      results: firstResult?.results || [],
      meta: firstResult?.meta || {}
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Network error querying Cloudflare D1'
    };
  }
}
