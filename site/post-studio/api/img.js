// Same-origin pass-through for artwork pictures, so downloads never come out blank (the image renderer needs CORS).
// GET /api/img?u=<url>  — only our own media host and Shopify's CDN; cached at the edge for a week.
const ALLOW = /^https:\/\/(media\.artstoheartsproject\.com|cdn\.shopify\.com|shop\.artstoheartsproject\.com|[a-z0-9]+\.public\.blob\.vercel-storage\.com)\//i;
export default async function handler(req, res){
  const u = String((req.query && req.query.u) || '');
  if (!ALLOW.test(u)) return res.status(400).send('host not allowed');
  try {
    const r = await fetch(u); if (!r.ok) return res.status(r.status).send('not found');
    const type = r.headers.get('content-type') || 'image/jpeg'; if (!/^image\//.test(type)) return res.status(415).send('not an image');
    res.setHeader('Content-Type', type); res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, immutable');
    return res.status(200).send(Buffer.from(await r.arrayBuffer()));
  } catch (e) { return res.status(502).send('could not fetch'); }
}
