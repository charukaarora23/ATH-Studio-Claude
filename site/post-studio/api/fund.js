// ATH Creative Fund: the monthly rounds (dates, link, winner, shortlist, check-ins, what is done), shared by the team.
// One fixed file (fund/rounds.json); reads cost no store operation, each save is one (see _store.js).
// GET  /api/fund                 -> { "<round id>": {...}, ... }
// POST /api/fund {id, round}     -> the updated map (round null removes it)
import { readJSON, writeJSON, backupDaily } from './_store.js';
const PATH = 'fund/rounds.json';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.status(200).json((await readJSON(PATH)) || {});
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const id = String(body.id || '').replace(/[^\w-]/g, '').slice(0, 40);
      if (!id) return res.status(400).json({ error: 'missing id' });
      if (JSON.stringify(body.round || {}).length > 400000) return res.status(413).json({ error: 'round too large: images must be uploaded, not embedded' });
      const all = (await readJSON(PATH)) || {};
      await backupDaily(PATH, all);
      if (body.round) all[id] = { ...body.round, id, saved: new Date().toISOString() }; else delete all[id];
      await writeJSON(PATH, all);
      return res.status(200).json(all);
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
}
