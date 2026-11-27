// Sales from ATH's own order dashboard (shopbackend /api/claude/). The token lives only in Vercel (SHOP_API_TOKEN).
// Temporary explore mode for setup: GET /api/sales?k=<SHOP_API_DEBUG_KEY>&p=<path under /api/claude/>
const BASE = 'https://shopbackend.artstoheartsproject.com/api/claude/';
export default async function handler(req, res){
  res.setHeader('Cache-Control', 'no-store');
  const q = req.query || {}; const tok = process.env.SHOP_API_TOKEN;
  if (!tok) return res.status(500).json({error: 'SHOP_API_TOKEN is not set'});
  if (!process.env.SHOP_API_DEBUG_KEY || q.k !== process.env.SHOP_API_DEBUG_KEY) return res.status(403).json({error: 'not yet available'});
  const path = String(q.p || '').replace(/^\/+/, '').replace(/\.\./g, '');
  try {
    const r = await fetch(BASE + path, {headers: {Authorization: 'Bearer ' + tok, 'X-API-Key': tok, Accept: 'application/json'}});
    const text = await r.text();
    return res.status(200).json({status: r.status, type: r.headers.get('content-type'), body: text.slice(0, 20000)});
  } catch (e) { return res.status(502).json({error: String(e.message || e)}); }
}
