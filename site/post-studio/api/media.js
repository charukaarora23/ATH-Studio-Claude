// A book's own pictures, taken once from the Dropbox folders already linked in Books Data:
// Page by Page Graphics (every page), Mockups (spreads, scenes, shop covers), Photoshoot.
// Each folder is streamed (they can be gigabytes), each picture shrunk to web size and kept in Blob.
// GET  /api/media?book=<i>             → what we have for that book
// POST /api/media?book=<i>&part=pages|mockups|shoot → fetch that folder now (one at a time; pages take ~3 min)
import { put } from '@vercel/blob';
import { readJSON, writeJSON } from './_store.js';
import sharp from 'sharp';
import { readLib } from './books.js';
import { streamZipImages } from './_zipstream.js';

const slug = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const dl = u => { try { const x = new URL(u); if (/dropbox\.com$/i.test(x.hostname)) { x.searchParams.set('dl', '1'); x.searchParams.delete('st'); } return x.toString(); } catch { return ''; } };
// one fixed file per book; reading it costs no store operation (see _store.js)
const readMedia = async key => (await readJSON(`books/media/${key}.json`)) || {};
const save = (key, m) => writeJSON(`books/media/${key}.json`, m);

export default async function handler(req, res){
  res.setHeader('Cache-Control', 'no-store');
  try {
    const lib = await readLib(); const b = lib.books[+(req.query.book ?? -1)]; if (!b) return res.status(404).json({error: 'no such book'});
    const key = slug(b.name); const media = await readMedia(key);
    if (!req.query.part) return res.status(200).json(media);
    const part = String(req.query.part || ''); const src = {pages: b.links.pages, mockups: b.links.mockups, shoot: b.links.shoot}[part];
    if (!src) return res.status(400).json({error: part ? `No ${part === 'pages' ? 'Page by Page Graphics' : part === 'mockups' ? 'Mockups' : 'Photoshoot'} link for this book in Books Data` : 'part?'});
    const pageNo = name => { const m = name.split('/').pop().replace(/\.[a-z]+$/i, '').match(/(\d+)\s*$/); return m ? +m[1] : -1; };
    const have = new Set(part === 'pages' && media.pages ? Object.keys(media.pages).map(Number) : []);
    const prev = part !== 'pages' && media.items && media.items[part] || {};   // mockups / photoshoot pictures already taken are not saved again
    const T0 = Date.now(), stop = () => Date.now() - T0 > 270000; const got = {}; let inflight = [], skipped = 0;
    const size = part === 'pages' ? 1100 : 1600; const cap = part === 'shoot' ? 40 : part === 'mockups' ? 200 : 1000; let n = Object.keys(prev).length;
    const handle = async (name, bytes) => { const base = name.split('/').pop().replace(/\.[a-z]+$/i, '');
      const jpg = await sharp(bytes, {limitInputPixels: false}).rotate().resize({width: size, height: size, fit: 'inside', withoutEnlargement: true}).jpeg({quality: 80, mozjpeg: true}).toBuffer();
      const meta = await sharp(jpg).metadata();
      const blob = await put(`books/media/${key}/${part}/${slug(name)}.jpg`, jpg, {access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'image/jpeg'});
      got[name] = {url: blob.url, w: meta.width, h: meta.height, base, folder: name.split('/').slice(0, -1).join('/')}; };
    const files = await streamZipImages(dl(src), async (name, bytes) => {   // at most 3 pictures in hand at once, so memory stays small
      if (++n > cap) return; while (inflight.length >= 3) await Promise.race(inflight);
      const p = handle(name, bytes).catch(() => { skipped++; }).finally(() => { inflight = inflight.filter(x => x !== p); }); inflight.push(p);
    }, {shouldStop: () => stop() || n >= cap, want: name => part === 'pages' ? !have.has(pageNo(name)) : !prev[name]});   // pages already taken stream past without work
    await Promise.all(inflight);
    const all = part === 'pages' ? got : {...prev, ...got}; if (part !== 'pages') media.items = {...(media.items || {}), [part]: all};
    const items = Object.values(all);
    if (part === 'pages') { const pages = {...(media.pages || {})}; items.forEach(x => { const m = x.base.match(/(\d+)\s*$/); if (m) pages[+m[1]] = x.url; }); media.pages = pages; media.pagesDone = !stop(); }
    if (part === 'mockups') { media.spreads = items.filter(x => /spread/i.test(x.folder + x.base)).map(x => x.url);
      media.covers = {front: (items.find(x => /front/i.test(x.base)) || {}).url || '', back: (items.find(x => /back/i.test(x.base)) || {}).url || ''};
      media.scenes = items.filter(x => !/spread/i.test(x.folder + x.base) && !/shopify|front|back/i.test(x.folder + x.base)).map(x => x.url); }
    if (part === 'shoot') media.shoot = items.map(x => x.url);
    media[part + 'At'] = new Date().toISOString(); await save(key, media);
    return res.status(200).json({...media, read: {part, files, kept: items.length, skipped, seconds: Math.round((Date.now() - T0) / 1000)}});
  } catch (e) { return res.status(500).json({error: String(e && e.message || e)}); }
}
