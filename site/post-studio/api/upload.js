// Store one image for a daily post. Body: { data: "data:image/jpeg;base64,..." } -> { url }
import { put } from '@vercel/blob';
export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method not allowed' }); }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const m = /^data:(image\/(jpeg|png|webp));base64,(.+)$/.exec(String(body.data || ''));
    if (!m) return res.status(400).json({ error: 'expected a base64 image' });
    const buf = Buffer.from(m[3], 'base64'); if (buf.length > 3.5e6) return res.status(413).json({ error: 'image too large' });
    const ext = m[2] === 'jpeg' ? 'jpg' : m[2];
    const out = await put('daily/img-' + Date.now() + '.' + ext, buf, { access: 'public', addRandomSuffix: true, contentType: m[1] });
    return res.status(200).json({ url: out.url });
  } catch (e) { return res.status(500).json({ error: String(e && e.message || e) }); }
}
