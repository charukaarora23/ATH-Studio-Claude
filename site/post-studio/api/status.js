// Shared "posted" status for the content calendar, kept in Vercel Blob.
// Each save writes a new file (so nothing is served stale from cache); reads use the newest one.
// GET  /api/status                  -> { "<item id>": { posted: true, by: "Name", at: "ISO date" }, ... }
// POST /api/status {id, posted, by} -> the updated map
import { put, list, del } from '@vercel/blob';

const PREFIX = 'calendar/status-';

async function newest() {
  const { blobs } = await list({ prefix: PREFIX, limit: 1000 });
  blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  return blobs;
}
async function readAll() {
  const blobs = await newest();
  if (!blobs.length) return {};
  const r = await fetch(blobs[0].url, { cache: 'no-store' });
  return r.ok ? r.json() : {};
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.status(200).json(await readAll());
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const id = String(body.id || '').slice(0, 300);
      if (!id) return res.status(400).json({ error: 'missing id' });
      const all = await readAll();
      if (body.posted) all[id] = { posted: true, by: String(body.by || '').slice(0, 60), at: new Date().toISOString() };
      else delete all[id];
      await put(PREFIX + Date.now() + '.json', JSON.stringify(all), { access: 'public', addRandomSuffix: true, contentType: 'application/json' });
      const old = (await newest()).slice(5).map(b => b.url);   // keep the last few versions
      if (old.length) await del(old).catch(() => {});
      return res.status(200).json(all);
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
}
