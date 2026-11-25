// Books library: Books Data sheet + each book's artist tab + the public Shopify catalogue, merged into one JSON kept in Vercel Blob.
// GET  /api/books          -> the saved library {synced, books:[...]}
// GET  /api/books?sync=1   -> run the sync (the nightly cron calls this), returns the new library
// POST /api/books          -> run the sync (the "Sync now" button)
// Needs GOOGLE_SERVICE_ACCOUNT (the service account JSON). No AI here: plain data, no tokens spent.
import { put, list, del } from '@vercel/blob';
import crypto from 'node:crypto';
import { readInside } from './_inside.js';
import { verifyArtists, fold } from './_verify.js';

const MASTER = '18YXSenrWqh70doiXHJYERqSooqBw3aN88BVIGikhppA';
const SHOP = 'https://shop.artstoheartsproject.com';
const PREFIX = 'books/library-';

// ---------- Google auth (service account JWT, no extra packages) ----------
async function googleToken(){
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT; if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT is not set in Vercel');
  let sa; try { sa = JSON.parse(raw); } catch { // a paste that lost a comma or quote: take the two fields we need
    const pick = k => { const m = raw.match(new RegExp('"' + k + '"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"')); return m ? JSON.parse('"' + m[1] + '"') : ''; };
    sa = {client_email: pick('client_email'), private_key: pick('private_key'), token_uri: pick('token_uri')}; }
  if (!sa.client_email || !/BEGIN PRIVATE KEY/.test(sa.private_key || '')) throw new Error('GOOGLE_SERVICE_ACCOUNT in Vercel is not the full JSON file. Paste the whole file again.');
  const now = Math.floor(Date.now() / 1000);
  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const body = b64({alg: 'RS256', typ: 'JWT'}) + '.' + b64({iss: sa.client_email, scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly', aud: sa.token_uri || 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600});
  const sig = crypto.createSign('RSA-SHA256').update(body).sign(sa.private_key).toString('base64url');
  const r = await fetch(sa.token_uri || 'https://oauth2.googleapis.com/token', {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: new URLSearchParams({grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: body + '.' + sig})});
  const j = await r.json(); if (!j.access_token) throw new Error('Google sign-in failed: ' + (j.error_description || j.error || r.status)); return j.access_token;
}
async function gget(token, path, tries = 2){
  const r = await fetch('https://sheets.googleapis.com/v4/spreadsheets/' + path, {headers: {Authorization: 'Bearer ' + token}});
  if (!r.ok && r.status >= 500 && tries > 0) { await new Promise(z => setTimeout(z, 800)); return gget(token, path, tries - 1); }
  if (!r.ok) { const t = await r.text(); const e = new Error(`Sheets ${r.status}: ${t.slice(0, 160)}`); e.status = r.status; throw e; } return r.json();
}

// ---------- helpers ----------
const norm = s => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
const cellText = c => String((c && c.formattedValue) || '').trim();
const cellLink = c => { if (!c) return ''; if (c.hyperlink) return c.hyperlink; for (const run of c.chipRuns || []) { const u = run.chip && run.chip.richLinkProperties && run.chip.richLinkProperties.uri; if (u) return u; } return ''; };
const handleOf = s => { s = String(s || '').trim(); if (!s) return ''; const m = s.match(/instagram\.com\/(?:https?:\/\/(?:www\.)?instagram\.com\/)?@?([A-Za-z0-9._]+)/i); const h = m ? m[1] : s.replace(/^@/, '').split(/[\s/?]/)[0]; return /^[A-Za-z0-9._]{2,30}$/.test(h) && !/^(https?|www|instagram|com|n\/?a|none)$/i.test(h) ? '@' + h : ''; };
const url = s => /^https?:\/\//i.test(String(s || '').trim()) ? String(s).trim() : '';
const idGid = u => { const m = String(u).match(/spreadsheets\/d\/([A-Za-z0-9_-]+)/); const g = String(u).match(/gid=(\d+)/); return m ? {id: m[1], gid: g ? +g[1] : null} : null; };
async function pool(items, n, fn){ const out = []; let i = 0; await Promise.all(Array.from({length: Math.min(n, items.length)}, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]).catch(e => ({error: String(e.message || e)})); } })); return out; }

// ---------- the master sheet ----------
async function readMaster(token){
  const j = await gget(token, `${MASTER}?includeGridData=true&ranges=${encodeURIComponent("'Main '!A1:AZ400")}&fields=sheets.data.rowData.values(formattedValue,hyperlink,chipRuns)`);
  const rows = ((j.sheets || [])[0] || {}).data[0].rowData || [];
  if (!rows.length) throw new Error('Books Data sheet looks empty'); const head = (rows[0].values || []).map(c => norm(cellText(c)));
  const col = (...names) => { for (const n of names) { const i = head.findIndex(h => h === n || h.startsWith(n)); if (i >= 0) return i; } return -1; };
  const C = {name: col('book name'), cat: col('category'), year: col('year'), sheet: col('artists data for graphics'), cover: col('cover artist'), coverIg: col('cover artist instagram'), landing: col('landing page'), shopify: col('shopify link'), amazon: col('amazon link'), bn: col('barnes'), designer: col('book designer'), published: col('no of published artists'), pages: col('no of pages'), status: col('status'), isbn: col('isbn'), discount: col('artist disc'), opens: col('call opens'), closes: col('call closes'), juror: col('juror'), selected: col('selected announced'), preorder: col('pre order opens'), print: col('to print'), ships: col('ships'), ff: col('friends and family'), live: col('codes live'), pdf: col('final review pdf'), pdffile: col('pdf file')};
  readMaster.cols = C;
  return rows.slice(1).map((r, ri) => { const v = r.values || []; const t = k => C[k] >= 0 ? cellText(v[C[k]]) : ''; const l = k => C[k] >= 0 ? (cellLink(v[C[k]]) || url(cellText(v[C[k]]))) : '';
    const name = t('name'); if (!name) return null;
    return {name, row: ri + 2, codesLive: /^true$/i.test(t('live')), category: t('cat'), year: t('year'), status: t('status'), pages: t('pages'), published: t('published'), designer: t('designer'), isbn: t('isbn'), juror: t('juror'), codes: {artist: t('discount'), friends: t('ff')},
      dates: {callOpens: t('opens'), callCloses: t('closes'), selected: t('selected'), preorder: t('preorder'), print: t('print'), ships: t('ships')},
      coverArtist: t('cover') ? {name: t('cover'), handle: handleOf(t('coverIg'))} : null,
      links: {landing: l('landing'), shopify: l('shopify'), amazon: l('amazon'), bn: l('bn'), pdf: l('pdf') || l('pdffile')}, sheet: idGid(l('sheet'))};
  }).filter(Boolean);
}


// ---------- discount codes: same style as the team's (COLLAGE25, MAG11, SVB7, TINY2) ----------
const SERIES = [[/\bmagazine\b/, 'MAG'], [/studio visit/, 'SVB'], [/wom[ae]n artists? on the rise/, 'WAR'], [/tiny creatives/, 'TINY'], [/art makers/, 'ARTMAKERS'], [/emerging artworks/, 'ARTWORKS'], [/emerging artists/, 'ARTISTS'], [/art and woman/, 'ARTWOMAN'], [/artists to watch/, 'ATW'], [/catalog/, 'CATALOG']];
const STOP = new Set(['the', 'a', 'of', 'and', 'book', 'books', 'artbook', 'edition', 'ed', 'ath', 'vol', 'big', 'great', 'artists', 'artist']);
function codeFor(b, taken){
  const n = norm(b.name); const num = (n.match(/\b(20\d\d)\b/) || [])[1]; const ed = (n.match(/\b(?:edition|ed|vol|magazine|book|catalog|creatives)\s+(\d{1,3})\b|\b(\d{1,2})$/) || []).slice(1).find(Boolean);
  const yy = num ? num.slice(2) : String(b.year || '').slice(2);
  const ser = SERIES.find(([re]) => re.test(n));
  let base = ser ? ser[1] + (ed || (ser[1] === 'MAG' || ser[1] === 'SVB' || ser[1] === 'TINY' ? '' : yy)) : n.replace(/\b(19|20)\d\d\b|\b\d+\b/g, ' ').split(' ').filter(w => w && !STOP.has(w)).slice(0, 2).join('').toUpperCase().slice(0, 12) + yy;
  base = base.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'BOOK' + yy;
  let code = base, i = 2; while (taken.has(code)) code = base + (i++);
  taken.add(code); return code;
}
const colA1 = i => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
async function fillCodes(token, books){
  const C = readMaster.cols || {}; if (C.discount < 0 || C.ff < 0) return [];
  const taken = new Set(books.flatMap(b => [b.codes.artist, b.codes.friends]).filter(Boolean).map(x => x.toUpperCase()));
  const active = b => Object.values(b.dates || {}).some(Boolean);
  const data = [];
  books.filter(active).forEach(b => {
    if (!b.codes.artist) { b.codes.artist = codeFor(b, taken); data.push({range: `'Main '!${colA1(C.discount)}${b.row}`, values: [[b.codes.artist]]}); }
    if (!b.codes.friends) { let f = b.codes.artist.toUpperCase() + 'FAM', i = 2; while (taken.has(f)) f = b.codes.artist.toUpperCase() + 'FAM' + (i++); taken.add(f); b.codes.friends = f; data.push({range: `'Main '!${colA1(C.ff)}${b.row}`, values: [[f]]}); }
  });
  if (!data.length) return [];
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MASTER}/values:batchUpdate`, {method: 'POST', headers: {Authorization: 'Bearer ' + token, 'Content-Type': 'application/json'}, body: JSON.stringify({valueInputOption: 'RAW', data})});
  if (!r.ok) return [{sheet: 'Books Data', error: r.status === 403 ? 'To fill discount codes automatically, give the studio robot Editor access on Books Data' : 'Could not write codes: ' + r.status}];
  return [];
}


// ---------- what's inside: each book's digital PDF (the "Pdf File" link in Books Data), read once and kept until it changes ----------
// Dropbox links are public downloads: a folder comes as a zip (the largest PDF inside is the book), a file comes as the PDF.
const driveId = u => (String(u).match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([A-Za-z0-9_-]{20,})/) || [])[1];
const keyOf = u => crypto.createHash('sha1').update(String(u).replace(/[?&](st|dl)=[^&]*/g, '')).digest('hex').slice(0, 20);
const dropDl = u => { const x = new URL(u); x.searchParams.set('dl', '1'); x.searchParams.delete('st'); return x.toString(); };
async function sizeOf(url){ try { const r = await fetch(url, {headers: {Range: 'bytes=0-0'}}); const n = +(r.headers.get('original-content-length') || (r.headers.get('content-range') || '').split('/')[1] || r.headers.get('content-length') || 0); try { await r.body.cancel(); } catch {} return n; } catch { return 0; } }
async function readInsides(token, books, deadline){
  const todo = books.filter(b => b.links && b.links.pdf); if (!todo.length) return [];
  const { blobs } = await list({ prefix: 'books/inside/', limit: 1000 }); const cache = Object.fromEntries(blobs.map(x => [x.pathname.replace(/^books\/inside\/|\.json$/g, ''), x]));
  const problems = []; let fresh = 0;
  // newest books first, so this month's books are read before the backlist
  for (const b of todo) {
    const link = b.links.pdf, drive = driveId(link), drop = /dropbox\.com/.test(link);
    if (!drive && !drop) { b.insideError = 'Pdf File must be a Dropbox or Google Drive link'; continue; }
    try {
      const key = drive || keyOf(link); const c = cache[key];
      let version = '', url = '', headers = {};
      if (drive) { const mr = await fetch(`https://www.googleapis.com/drive/v3/files/${drive}?fields=modifiedTime&supportsAllDrives=true`, {headers: {Authorization: 'Bearer ' + token}}); if (!mr.ok) { b.insideError = 'Share this Drive PDF with the studio robot, or use the Dropbox link'; continue; } version = (await mr.json()).modifiedTime; url = `https://www.googleapis.com/drive/v3/files/${drive}?alt=media&supportsAllDrives=true`; headers = {Authorization: 'Bearer ' + token}; }
      else { url = dropDl(link); version = String(await sizeOf(url)); }
      if (c) { const j = await (await fetch(c.url, {cache: 'no-store'})).json(); if (j.norm && (j.modified === version || (!version && j.inside))) { b.inside = j.inside; if (j.norm) b.verify = verifyArtists(b.artists, j.norm); continue; } }
      if (drop && +version > 0 && +version < 5000) { b.insideError = 'No PDF in this Dropbox folder yet'; continue; }
      if (drop && +version > 450e6) { b.insideError = 'This folder is too large to read (keep only the digital PDF in it)'; continue; }
      if (fresh >= 1 && Date.now() > deadline) { b.insideError = 'Will be read on the next sync'; continue; }
      const fr = await fetch(url, {headers}); if (!fr.ok) { b.insideError = 'Could not download the PDF (' + fr.status + ')'; continue; }
      let bytes = new Uint8Array(await fr.arrayBuffer());
      if (bytes[0] === 0x50 && bytes[1] === 0x4b) { const { unzipSync } = await import('fflate'); const files = unzipSync(bytes, {filter: f => /\.pdf$/i.test(f.name) && !/__MACOSX/.test(f.name)}); const names = Object.keys(files).sort((x, y) => files[y].length - files[x].length); if (!names.length) { b.insideError = 'No PDF in this Dropbox folder yet'; continue; } bytes = files[names[0]]; b.pdfName = names[0]; }
      const { pdfPages } = await import('./_pdf.js'); const pages = await pdfPages(bytes); fresh++; bytes = null;
      const rules = readInside(pages); let inside = rules;
      try { const { aiInside } = await import('./_ai.js'); const ai = await aiInside(pages); if (ai) inside = {...ai, artists: rules.artists, pages: rules.pages}; } catch (e) { rules.aiError = String(e.message || e).slice(0, 160); }
      inside.file = b.pdfName || ''; const norm = pages.map(fold); b.verify = verifyArtists(b.artists, norm);
      if (pages.join('').replace(/\s/g, '').length < 2000) { b.insideError = 'This PDF has no readable text (it may be the print file)'; continue; }
      b.inside = inside;
      await put(`books/inside/${key}.json`, JSON.stringify({modified: version, inside, norm}), {access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json'});
    } catch (e) { b.insideError = 'Could not read the PDF: ' + String(e.message || e).slice(0, 120); problems.push({sheet: b.name, error: b.insideError}); }
  }
  return problems;
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
  const tok = t => norm(t).replace(/\bwomen\b/g, 'woman').split(' ').map(w => w.length > 3 ? w.replace(/s$/, '') : w);
  const want = new Set(tok(book.name).filter(w => (w.length > 1 || /\d/.test(w)) && !['the', 'of', 'and', 'edition', 'ed', 'artbook', 'book'].includes(w)));
  let best = null, score = 0;
  const nums = [...want].filter(w => /^\d+$/.test(w));
  for (const p of shop) { const got = new Set(tok(p.title)); if (nums.length && !nums.some(n => got.has(n))) continue; let hit = 0; want.forEach(w => { if (got.has(w)) hit++; }); const s = want.size ? hit / want.size : 0; if (s > score) { score = s; best = p; } }
  return score >= .75 ? best : null;
}

// ---------- store ----------
async function versions(){ const { blobs } = await list({ prefix: PREFIX, limit: 1000 }); return blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)); }
// the library is a few MB: kept in memory on a warm function and reused until a newer version is saved
let MEMO = null;
async function readLib(){ const v = await versions(); if (!v.length) return {synced: null, books: []}; if (MEMO && MEMO.url === v[0].url) return MEMO.lib;
  const r = await fetch(v[0].url, {cache: 'no-store'}); if (!r.ok) return {synced: null, books: []}; const lib = await r.json(); MEMO = {url: v[0].url, lib}; return lib; }
async function sync(){
  const T0 = Date.now();
  const token = await googleToken();
  const [books, shop] = await Promise.all([readMaster(token), readShopify().catch(() => [])]);
  const problems = await readArtistSheets(token, books);
  problems.push(...await fillCodes(token, books).catch(e => [{sheet: 'Books Data', error: String(e.message || e)}]));
  books.forEach(b => { const p = matchShop(b, shop); if (p) b.shop = p; b.count = (b.artists || []).length; });
  problems.push(...await readInsides(token, books, T0 + 120000).catch(e => [{sheet: 'PDFs', error: String(e.message || e)}]));
  const lib = {synced: new Date().toISOString(), books, shopCount: shop.length, problems};
  await put(PREFIX + Date.now() + '.json', JSON.stringify(lib), { access: 'public', addRandomSuffix: true, contentType: 'application/json' });
  const old = (await versions()).slice(3).map(b => b.url); if (old.length) await del(old).catch(() => {});
  return lib;
}

export default async function handler(req, res){
  res.setHeader('Cache-Control', 'no-store');
  try {
    // the list is sent without artists (the full library is several MB); one book's artists come with ?book=<index>
    const slim = lib => ({...lib, books: lib.books.map(({artists, ...b}) => b)});
    if (req.method === 'POST' || (req.method === 'GET' && req.query && req.query.sync)) return res.status(200).json(slim(await sync()));
    if (req.method === 'GET' && req.query && req.query.book !== undefined) { const lib = await readLib(); const b = lib.books[+req.query.book]; return b ? res.status(200).json(b) : res.status(404).json({error: 'no such book'}); }
    if (req.method === 'GET') return res.status(200).json(slim(await readLib()));
    res.setHeader('Allow', 'GET, POST'); return res.status(405).json({error: 'method not allowed'});
  } catch (e) { return res.status(500).json({error: String(e && e.message || e)}); }
}
