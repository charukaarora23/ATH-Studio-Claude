// Shared "posted" status for the content calendar, kept in Vercel Blob.
// One fixed file (calendar/status.json); reads cost no store operation, each save is one (see _store.js).
// GET  /api/status                  -> { "<item id>": { posted: true, by: "Name", at: "ISO date" }, ... }
// POST /api/status {id, posted, by} -> the updated map
import { writeJSON, readOrMigrate, backupDaily } from './_store.js';
const PATH = 'calendar/status.json';
const readAll = () => readOrMigrate(PATH, 'calendar/status-', {});
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.status(200).json(await readAll());
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const id = String(body.id || '').slice(0, 300);
      if (!id) return res.status(400).json({ error: 'missing id' });
      const all = await readAll();
      await backupDaily(PATH, all);
      if (body.posted) all[id] = { posted: true, by: String(body.by || '').slice(0, 60), at: new Date().toISOString() };
      else delete all[id];
      await writeJSON(PATH, all);
      return res.status(200).json(all);
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
}
