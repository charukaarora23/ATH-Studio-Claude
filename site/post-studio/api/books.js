// Books library: Books Data sheet + each book's artist tab + the public Shopify catalogue, merged into one JSON kept in Vercel Blob.
// GET  /api/books          -> the saved library {synced, books:[...]}
// GET  /api/books?sync=1   -> run the sync (the nightly cron calls this), returns the new library
// POST /api/books          -> run the sync (the "Sync now" button)
// Needs GOOGLE_SERVICE_ACCOUNT (the service account JSON). No AI here: plain data, no tokens spent.
import { put, list, del } from '@vercel/blob';
import crypto from 'node:crypto';

const MASTER = '18YXSenrWqh70doiXHJYERqSooqBw3aN88BVIGikhppA';
const SHOP = 'https://shop.artstoheartsproject.com';
const PREFIX = 'books/library-';

// ---------- Google auth (service account JWT, no extra packages) ----------
async function googleToken(){
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT; if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT is not set in Vercel');
  const sa = JSON.parse(raw); const now = Math.floor(Date.now() / 1000);
  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const body = b64({alg: 'RS256', typ: 'JWT'}) + '.' + b64({iss: sa.client_email, scope: 'https://www.googleapis.com/auth/spreadsheets.readonly', aud: sa.token_uri || 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600});
  const sig = crypto.createSign('RSA-SHA256').update(body).sign(sa.private_key).toString('base64url');
  const r = await fetch(sa.token_uri || 'https://oauth2.googleapis.com/token', {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: new URLSearchParams({grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: body + '.' + sig})});
  const j = await r.json(); if (!j.access_token) throw new Error('Google sign-in failed: ' + (j.error_description || j.error || r.status)); return j.access_token;
}
async function gget(token, path){
  const r = await fetch('https://sheets.googleapis.com/v4/spreadsheets/' + path, {headers: {Authorization: 'Bearer ' + token}});
  if (!r.ok) { const t = await r.text(); const e = new Error(`Sheets ${r.status}: ${t.slice(0, 160)}`); e.status = r.status; throw e; } return r.json();
}

// ---------- helpers ----------
const norm = s => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
const cellText = c => (c && (c.formattedValue || '')).trim();
const cellLink = c => { if (!c) return ''; if (c.hyperlink) return c.hyperlink; for (const run of c.chipRuns || []) { const u = run.chip && run.chip.richLinkProperties && run.chip.richLinkProperties.uri; if (u) return u; } return ''; };
const handleOf = s => { s = String(s || '').trim(); if (!s) return ''; const m = s.match(/instagram\.com\/(?:https?:\/\/(?:www\.)?instagram\.com\/)?@?([A-Za-z0-9._]+)/i); const h = m ? m[1] : s.replace(/^@/, '').split(/[\s/?]/)[0]; return /^[A-Za-z0-9._]{2,30}$/.test(h) ? '@' + h : ''; };
const url = s => /^https?:\/\//i.test(String(s || '').trim()) ? String(s).trim() : '';
const idGid = u => { const m = String(u).match(/spreadsheets\/d\/([A-Za-z0-9_-]+)/); const g = String(u).match(/gid=(\d+)/); return m ? {id: m[1], gid: g ? +g[1] : null} : null; };
async function pool(items, n, fn){ const out = []; let i = 0; await Promise.all(Array.from({length: Math.min(n, items.length)}, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]).catch(e => ({error: String(e.message || e)})); } })); return out; }

// ---------- the master sheet ----------
async function readMaster(token){
  const j = await gget(token, `${MASTER}?includeGridData=true&ranges=${encodeURIComponent("'Main '!A1:AZ400")}&fields=sheets.data.rowData.values(formattedValue,hyperlink,chipRuns)`);
  const rows = ((j.sheets || [])[0] || {}).data[0].rowData || [];
  const head = (rows[0].values || []).map(c => norm(cellText(c)));
  const col = (...names) => { for (const n of names) { const i = head.findIndex(h => h === n || h.startsWith(n)); if (i >= 0) return i; } return -1; };
  const C = {name: col('book name'), cat: col('category'), year: col('year'), sheet: col('artists data for graphics'), cover: col('cover artist'), coverIg: col('cover artist instagram'), landing: col('landing page'), shopify: col('shopify link'), amazon: col('amazon link'), bn: col('barnes'), designer: col('book designer'), published: col('no of published artists'), pages: col('no of pages'), status: col('status'), isbn: col('isbn'), launch: col('launch date')};
  return rows.slice(1).map(r => { const v = r.values || []; const t = k => C[k] >= 0 ? cellText(v[C[k]]) : ''; const l = k => C[k] >= 0 ? (cellLink(v[C[k]]) || url(cellText(v[C[k]]))) : '';
    const name = t('name'); if (!name) return null;
    return {name, category: t('cat'), year: t('year'), status: t('status'), pages: t('pages'), published: t('published'), designer: t('designer'), isbn: t('isbn'), launch: t('launch'),
      coverArtist: t('cover') ? {name: t('cover'), handle: handleOf(t('coverIg'))} : null,
      links: {landing: l('landing'), shopify: l('shopify'), amazon: l('amazon'), bn: l('bn')}, sheet: idGid(l('sheet'))};
  }).filter(Boolean);
}

// ---------- each book's artist tab ----------
function parseArtists(values){
  const hi = values.findIndex(r => r.some(c => norm(c) === 'name') && r.some(c => /instagram/i.test(c)));
  if (hi < 0) return [];
  const head = values[hi].map(norm); const find = re => head.findIndex(h => re.test(h));
  const C = {name: find(/^name$/), web: find(/^website/), ig: find(/^instagram/), line: find(/^1 liner|^one liner/), bio: find(/bio|statement/), place: find(/country/), head: find(/^artist image|headshot/)};
  const works = head.map((h, i) => /^artwork \d+$/.test(h) ? i : -1).filter(i => i >= 0);
  return values.slice(hi + 1).map(r => { const g = i => i >= 0 ? String(r[i] || '').trim() : '';
    const name = g(C.name); if (!name || /^total /i.test(name)) return null;
    return {name, handle: handleOf(g(C.ig)), website: url(g(C.web)), line: g(C.line), place: g(C.place), bio: g(C.bio), headshot: url(g(C.head)),
      works: works.map(i => ({img: url(g(i)), details: head[i + 1] && /details/.test(head[i + 1]) ? g(i + 1) : ''})).filter(w => w.img)};
  }).filter(Boolean);
}
async function readArtistSheets(token, books){
  const bySheet = {}; books.forEach(b => { if (b.sheet) (bySheet[b.sheet.id] = bySheet[b.sheet.id] || []).push(b); });
  const problems = [];
  await pool(Object.entries(bySheet), 4, async ([id, list]) => {
    let meta; try { meta = await gget(token, `${id}?fields=sheets.properties(sheetId,title)`); }
    catch (e) { list.forEach(b => { b.artistsError = e.status === 403 || e.status === 404 ? 'Share this sheet with the studio robot' : e.message; }); problems.push({sheet: id, error: e.message}); return; }
    const tabs = Object.fromEntries((meta.sheets || []).map(s => [s.properties.sheetId, s.properties.title]));
    const want = list.map(b => ({b, title: b.sheet.gid !== null && tabs[b.sheet.gid] !== undefined ? tabs[b.sheet.gid] : Object.values(tabs)[0]}));
    const ranges = [...new Set(want.map(w => w.title))];
    const j = await gget(token, `${id}/values:batchGet?${ranges.map(t => 'ranges=' + encodeURIComponent(`'${t.replace(/'/g, "''")}'!A1:AF1500`)).join('&')}`);
    const byTitle = {}; (j.valueRanges || []).forEach((vr, i) => { byTitle[ranges[i]] = vr.values || []; });
    want.forEach(({b, title}) => { b.tab = title; b.artists = parseArtists(byTitle[title] || []); });
  });
  return problems;
}

// ---------- Shopify (public catalogue) ----------
async function readShopify(){
  const all = [];
  for (let page = 1; page <= 20; page++) { const r = await fetch(`${SHOP}/products.json?limit=250&page=${page}`); if (!r.ok) break; const j = await r.json(); const p = j.products || []; all.push(...p); if (p.length < 250) break; }
  return all.map(p => { const v = (p.variants || [])[0] || {}; const tags = [].concat(p.tags || []).join(',');
    return {title: p.title, handle: p.handle, url: `${SHOP}/products/${p.handle}`, image: ((p.images || [])[0] || {}).src || '', price: v.price || '', available: (p.variants || []).some(x => x.available), preorder: /pre-?order/i.test(p.title + ' ' + tags + ' ' + (p.body_html || '').slice(0, 400)), published: p.published_at || ''}; });
}
function matchShop(book, shop){
  const h = (String(book.links.shopify).match(/\/products\/([^/?#]+)/) || [])[1]; if (h) { const p = shop.find(x => x.handle === h); if (p) return p; }
  const want = new Set(norm(book.name).split(' ').filter(w => w.length > 1 && !['the', 'of', 'edition', 'ed', 'artbook', 'book'].includes(w)));
  let best = null, score = 0;
  for (const p of shop) { const got = new Set(norm(p.title).split(' ')); let hit = 0; want.forEach(w => { if (got.has(w)) hit++; }); const s = want.size ? hit / want.size : 0; if (s > score) { score = s; best = p; } }
  return score >= .75 ? best : null;
}

// ---------- store ----------
async function versions(){ const { blobs } = await list({ prefix: PREFIX, limit: 1000 }); return blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)); }
async function readLib(){ const v = await versions(); if (!v.length) return {synced: null, books: []}; const r = await fetch(v[0].url, {cache: 'no-store'}); return r.ok ? r.json() : {synced: null, books: []}; }
async function sync(){
  const token = await googleToken();
  const [books, shop] = await Promise.all([readMaster(token), readShopify().catch(() => [])]);
  const problems = await readArtistSheets(token, books);
  books.forEach(b => { const p = matchShop(b, shop); if (p) b.shop = p; b.count = (b.artists || []).length; });
  const lib = {synced: new Date().toISOString(), books, shopCount: shop.length, problems};
  await put(PREFIX + Date.now() + '.json', JSON.stringify(lib), { access: 'public', addRandomSuffix: true, contentType: 'application/json' });
  const old = (await versions()).slice(3).map(b => b.url); if (old.length) await del(old).catch(() => {});
  return lib;
}

export default async function handler(req, res){
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'POST' || (req.method === 'GET' && req.query && req.query.sync)) return res.status(200).json(await sync());
    if (req.method === 'GET') return res.status(200).json(await readLib());
    res.setHeader('Allow', 'GET, POST'); return res.status(405).json({error: 'method not allowed'});
  } catch (e) { return res.status(500).json({error: String(e && e.message || e)}); }
}
