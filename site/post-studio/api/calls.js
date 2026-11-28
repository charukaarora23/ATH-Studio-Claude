// Open calls managed from the dashboard (Call manager), shared with the team in Vercel Blob.
// One fixed file (calls/calls.json); reads cost no store operation, each save is one (see _store.js).
// GET  /api/calls                          -> { calls: [ {id, link, f:{...fields}, archived, updated, by} ] }
// POST /api/calls {action:'save', call}    -> { calls }   (insert or replace by id)
// POST /api/calls {action:'remove', id}    -> { calls }
// POST /api/calls {action:'import', url}   -> { url, title, text, images:[{url, src, alt, cap}] }
//   reads the call page (direct, then through a reader service if the site turns servers away)
//   and copies its pictures into Blob. The fields are worked out in the browser (calls.js) so the
//   same rules also work on pasted page text.
import { readJSON, writeJSON, backupDaily } from './_store.js';
import { extract, rehost } from './article.js';

const PATH = 'calls/calls.json';
const UA = 'Mozilla/5.0 (compatible; ATH-Studio/1.0)';
const readAll = async () => (await readJSON(PATH)) || {calls: []};

export default async function handler(req, res){
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.status(200).json(await readAll());
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({error: 'method not allowed'}); }
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    if (body.action === 'import') {
      let url; try { url = new URL(String(body.url || '').trim()); if (!/^https?:$/.test(url.protocol)) throw 0; } catch { return res.status(400).json({error: 'That does not look like a web link.'}); }
      let page = null, why = '';
      try { const r = await fetch(url.href, {headers: {'User-Agent': UA, 'Accept': 'text/html'}, redirect: 'follow', signal: AbortSignal.timeout(15000)}); if (r.ok) page = extract(await r.text(), r.url || url.href); else why = `The page answered ${r.status}.`; } catch (e) { why = String(e && e.message || e); }
      if (!page || page.text.length < 400) { try { const r = await fetch('https://r.jina.ai/' + url.href, {headers: {'X-Return-Format': 'html', 'Accept': 'text/html'}, signal: AbortSignal.timeout(30000)}); if (r.ok) { const alt = extract(await r.text(), url.href); if (alt.text.length > (page ? page.text.length : 0)) page = alt; } } catch {} }
      if (!page || page.text.length < 200) return res.status(422).json({error: (why ? why + ' ' : '') + 'Could not read the call page from the link. Open it, press Ctrl+A then Ctrl+C, and paste it in the box below the link.'});
      const images = await rehost(page.images.slice(0, 10), 'calls/img-');
      return res.status(200).json({url: url.href, title: page.title, text: page.text.slice(0, 60000), images});
    }

    const all = await readAll(); all.calls = Array.isArray(all.calls) ? all.calls : [];
    if (body.action === 'save') {
      const c = body.call || {}; const id = String(c.id || '').slice(0, 120); if (!id) return res.status(400).json({error: 'missing id'});
      await backupDaily(PATH, all);
      const clean = {id, link: String(c.link || '').slice(0, 500), f: c.f && typeof c.f === 'object' ? c.f : {}, archived: !!c.archived, isNew: !!c.isNew, updated: new Date().toISOString(), by: String(c.by || '').slice(0, 60)};
      const i = all.calls.findIndex(x => x.id === id); if (i >= 0) all.calls[i] = clean; else all.calls.push(clean);
      await writeJSON(PATH, all); return res.status(200).json(all);
    }
    if (body.action === 'remove') {
      await backupDaily(PATH, all); all.calls = all.calls.filter(x => x.id !== String(body.id || ''));
      await writeJSON(PATH, all); return res.status(200).json(all);
    }
    return res.status(400).json({error: 'unknown action'});
  } catch (e) { return res.status(500).json({error: String(e && e.message || e)}); }
}
