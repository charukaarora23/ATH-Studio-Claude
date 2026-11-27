// Team-shared edits on Books and Creative Fund posts: words changed on a slide, slides hidden, pictures swapped or moved,
// credits, slide colours. One fixed file (studio/edits.json); reads cost no store operation, each save is one (see _store.js).
// GET  /api/edits               -> { "<post key>": {texts, moves, pos, hidden, images, bgs, credits}, ... }
// POST /api/edits {key, edits}  -> the updated map (edits null removes the post's edits)
import { readJSON, writeJSON, backupDaily } from './_store.js';
const PATH = 'studio/edits.json';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.status(200).json((await readJSON(PATH)) || {});
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const key = String(body.key || '').slice(0, 300);
      if (!key) return res.status(400).json({ error: 'missing key' });
      if (JSON.stringify(body.edits || {}).length > 300000) return res.status(413).json({ error: 'edits too large: pictures must be uploaded, not embedded' });
      const all = (await readJSON(PATH)) || {};
      await backupDaily(PATH, all);
      if (body.edits) all[key] = body.edits; else delete all[key];
      await writeJSON(PATH, all);
      return res.status(200).json(all);
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
}
