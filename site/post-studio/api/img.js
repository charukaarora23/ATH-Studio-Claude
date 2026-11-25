// Same-origin pass-through for book pictures, so downloads never come out blank (the image renderer needs CORS).
// GET /api/img?u=<url>[&w=<width>]  — only our own media host, Shopify's CDN and our Blob store.
// With w, the picture is shrunk (the originals are often several MB), so the Books tab loads fast. Cached at the edge for a week.
import sharp from 'sharp';
const ALLOW = /^https:\/\/(media\.artstoheartsproject\.com|cdn\.shopify\.com|shop\.artstoheartsproject\.com|[a-z0-9]+\.public\.blob\.vercel-storage\.com)\//i;
export default async function handler(req, res){
  const u = String((req.query && req.query.u) || ''); const w = Math.min(2000, Math.max(0, parseInt(req.query && req.query.w, 10) || 0));
  if (!ALLOW.test(u)) return res.status(400).send('host not allowed');
  try {
    const r = await fetch(u); if (!r.ok) return res.status(r.status).send('not found');
    let type = r.headers.get('content-type') || 'image/jpeg'; if (!/^image\//.test(type)) return res.status(415).send('not an image');
    let buf = Buffer.from(await r.arrayBuffer());
    if (w) { try { buf = await sharp(buf, {limitInputPixels: false}).rotate().resize({width: w, height: w * 2, fit: 'inside', withoutEnlargement: true}).jpeg({quality: 78, mozjpeg: true}).toBuffer(); type = 'image/jpeg'; } catch {} }
    res.setHeader('Content-Type', type); res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, immutable');
    return res.status(200).send(buf);
  } catch (e) { return res.status(502).send('could not fetch'); }
}
