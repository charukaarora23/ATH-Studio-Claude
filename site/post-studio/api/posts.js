// Shared queue of daily posts for @artstoheartsproject (form fields + image URLs), kept in Vercel Blob.
// GET  /api/posts           -> { "<post id>": {...post}, ... }
// POST /api/posts {id, post} (post null deletes) -> the updated map
import { put, list, del } from '@vercel/blob';
const PREFIX = 'daily/posts-';
async function versions() { const { blobs } = await list({ prefix: PREFIX, limit: 1000 }); return blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)); }
async function readAll() { const v = await versions(); if (!v.length) return {}; const r = await fetch(v[0].url, { cache: 'no-store' }); return r.ok ? r.json() : {}; }
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.status(200).json(await readAll());
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const id = String(body.id || '').slice(0, 80); if (!id) return res.status(400).json({ error: 'missing id' });
      const all = await readAll();
      if (body.post) all[id] = { ...body.post, id, updated: new Date().toISOString() }; else delete all[id];
      await put(PREFIX + Date.now() + '.json', JSON.stringify(all), { access: 'public', addRandomSuffix: true, contentType: 'application/json' });
      const old = (await versions()).slice(5).map(b => b.url); if (old.length) await del(old).catch(() => {});
      return res.status(200).json(all);
    }
    res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'method not allowed' });
  } catch (e) { return res.status(500).json({ error: String(e && e.message || e) }); }
}
