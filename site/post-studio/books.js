// Books tab: the library synced from Books Data + artist sheets + Shopify (api/books.js).
let BOOKS = null, BOOKSEL = null, BOOKQ = '', BOOKBUSY = false;
const bkEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
async function booksLoad(sync){
  BOOKBUSY = true; booksRender();
  try { const r = await fetch('/api/books', sync ? {method: 'POST'} : {}); const j = await r.json(); if (!r.ok) throw new Error(j.error || r.status); BOOKS = j; BOOKS.err = ''; }
  catch (e) { BOOKS = {...(BOOKS || {books: []}), err: String(e.message || e)}; }
  BOOKBUSY = false; booksRender();
}
function bookCard(b, i){
  const img = b.shop && b.shop.image ? `<div class="bk-cv" style="background-image:url('${bkEsc(b.shop.image)}')"></div>` : `<div class="bk-cv bk-none">${bkEsc(b.name)}</div>`;
  const sale = b.shop ? `${b.shop.preorder ? 'Pre-order' : b.shop.available ? 'In stock' : 'Sold out'}${b.shop.price ? ' · $' + bkEsc(b.shop.price) : ''}` : 'Not found in the shop';
  const art = b.loading ? 'Loading…' : b.artistsError ? `<span class="bk-warn">${bkEsc(b.artistsError)}</span>` : b.sheet ? `${b.count || 0} artists` : '<span class="bk-warn">No artist sheet linked</span>';
  return `<button type="button" class="bk-card${BOOKSEL === i ? ' on' : ''}" data-book="${i}">${img}<b>${bkEsc(b.name)}</b><span>${bkEsc([b.category, b.year].filter(Boolean).join(' · '))}</span><span>${art}</span><span>${sale}</span></button>`;
}
// ---------- posts for a book: the selected artists (announcement, features, share kits) ----------
// Each artist is elevated AND the book is sold: every feature ends on the book and one clear action.
let BOOKVIEW = null;   // {book: index, kind: 'announce' | 'features' | 'kits', part}
const bkImg = u => u ? (/^https:\/\/(media\.artstoheartsproject\.com|cdn\.shopify\.com)\//.test(u) ? '/api/img?u=' + encodeURIComponent(u) : u) : '';
const bkShort = n => String(n || '').replace(/^101 ArtBook\s*-\s*/i, '101 Art Book: ').replace(/\s+/g, ' ').trim();
const bkTitle = d => String(d || '').split(/,\s*/)[0].trim();          // "I SEE You, 50x70 cm, oil…" → "I SEE You"
const bkName = n => String(n || '').replace(/\s+/g, ' ').trim().split(' ').map(w => w.length > 2 && w === w.toUpperCase() && /\p{Lu}{2}/u.test(w) ? w.toLowerCase().replace(/(^|['’-])(\p{L})/gu, (m, a, c) => a + c.toUpperCase()) : w).join(' ');
const bkHandle = h => /^@(https?|www|instagram)$/i.test(h || '') ? '' : (h || '');
const bkWork = a => { const w = (a.works || [])[0] || {}; return {artist: bkName(a.name), handle: bkHandle(a.handle), title: bkTitle(w.details), img: bkImg(w.img), line: bkLine(a.line || a.place)}; };
const bkLine = t => (String(t || '').replace(/\s+/g, ' ').replace(/(https?:\/\/)?\S+\.(com|net|org|art|co|io|shop|studio|uk|de|fr|es|it|me|info|gallery)(\/\S*)?/gi, '').match(/[^.!?]+[.!?]*/g) || []).map(x => x.trim()).filter(x => x.split(' ').length > 2 && !/instagram|website|www|https?|myshopify|@\w|find (his|her|their) work|can be found|discover more|follow (him|her|them)/i.test(x)).join(' ').replace(/\s+([.,])/g, '$1').trim();
function bkSale(b){ const s = b.shop || {}; return s.preorder ? {verb: 'Pre-order', line: `Pre-order ${bkShort(b.name)}. Link in bio.`, open: true}
  : s.available ? {verb: 'Order', line: `Order ${bkShort(b.name)}. Link in bio.`, open: true}
  : {verb: 'Coming soon', line: `${bkShort(b.name)} opens for pre-order soon. Follow along.`, open: false}; }
const bkCut = (t, n) => { t = String(t || '').replace(/\s+/g, ' ').trim(); if (t.length <= n) return t; const s = t.slice(0, n); const k = Math.max(s.lastIndexOf('. '), s.lastIndexOf(', ')); return (k > n * .5 ? s.slice(0, k) : s.slice(0, s.lastIndexOf(' '))).replace(/[,;:]$/, '') + (k > n * .5 && s[k] === '.' ? '.' : '…'); };

const BKT = {
  // cover: one artwork full bleed (the only crop allowed), the book named plainly
  cover(o){ const big = bkShort(o.big); const words = big.length > 16 && big.includes(' ') ? splitHalf(big) : [big];
    const bs = Math.min(120, Math.floor(920 / (Math.max(...words.map(w => w.length), 1) * .58)));
    return {bg: HL.ink, html: `${o.img ? `${ivArt(o.img, 'inset:0', 'bkcover', 'cover')}<div class="a" style="inset:0;background:rgba(20,9,12,.42)"></div>` : `<div class="a" style="inset:0;background:${HL.burg}"></div>`}
      <p class="a cn" style="left:52px;top:48px;color:${HL.white}">Arts to Hearts Project</p>${ivMono('white', 'right:52px;top:40px;width:96px;height:54px')}
      <div class="a" style="left:60px;right:60px;top:140px;bottom:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:${HL.white}">
        <p style="${BASK};font-style:italic;font-size:64px;line-height:1.15">${esc(o.serif)}</p>
        <p style="${T_MED};font-size:${bs}px;line-height:.95;letter-spacing:-.03em;margin-top:18px">${words.map(esc).join('<br>')}</p>
        ${o.under ? `<p style="${T_REG};font-size:32px;letter-spacing:.08em;text-transform:uppercase;margin-top:34px">${esc(o.under)}</p>` : ''}</div>`}; },
  // the names, two columns, so every selected artist is seen
  names(o){ const half = Math.ceil(o.list.length / 2); const col = l => l.map(a => `<p style="${T_MED};font-size:${o.sz}px;line-height:1.25;color:${HL.ink};break-inside:avoid">${esc(a.name)}${a.handle ? `<br><span style="${T_REG};font-size:${Math.round(o.sz * .78)}px;color:${HL.burg}">${esc(a.handle)}</span>` : ''}</p>`).join('');
    return {bg: HL.white, html: `${hlBrand()}<div class="a" style="left:72px;right:72px;top:150px;bottom:90px;display:grid;grid-template-columns:1fr 1fr;gap:0 40px;align-content:start"><div style="display:flex;flex-direction:column;gap:${o.gap}px">${col(o.list.slice(0, half))}</div><div style="display:flex;flex-direction:column;gap:${o.gap}px">${col(o.list.slice(half))}</div></div>`}; },
  // the book, sold plainly: its cover whole, what it is, one action
  book(o){ const b = o.b, sale = bkSale(b);
    return {bg: HL.pink, html: `${hlBrand(HL.burg)}
      ${bkSlot('bkbook', o.img, 'left:200px;right:200px;top:130px;height:700px', 'Drop the book mockup here')}
      <div class="a" style="left:80px;right:80px;top:880px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px">
        <p style="${T_MED};font-size:60px;line-height:1.05;letter-spacing:-.02em;color:${HL.ink}">${esc(bkShort(b.name))}</p>
        <p style="${BASK};font-size:32px;line-height:1.35;color:${HL.burg}">${esc(o.line)}</p>
        <p style="${T_MED};font-size:34px;color:${HL.white};background:${HL.burg};border-radius:999px;padding:14px 34px;margin-top:14px">${esc(sale.open ? sale.verb + ' · link in bio' : 'Opening for pre-order soon')}</p></div>`}; },
  // end card: one action, the monogram
  end(o){ return {bg: HL.burg, html: `${ivMono('peony', 'left:430px;width:220px;top:150px;height:124px')}
    <div class="a" style="left:80px;right:80px;top:330px;bottom:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <p style="${BASK};font-size:50px;line-height:1.28;color:${HL.white}">${esc(o.head)}</p>
      <div style="width:240px;border-top:2px solid rgba(250,210,225,.35);margin:52px 0 38px"></div>
      <p style="${T_REG};font-size:34px;line-height:1.4;color:${HL.pink}">${esc(o.sub)}</p></div>
    <p class="a c" style="left:0;right:0;bottom:96px;${T_REG};font-size:28px;color:${HL.pink}">artstoheartsproject.com</p>`}; },
  // the artist's own story frame: their work, the book, the shop (and the friends & family code once it works in Shopify)
  kit(o){ const w = o.w, b = o.b, sale = bkSale(b), code = b.codesLive && b.codes && b.codes.friends;
    return {h: 1920, bg: HL.white, html: `<p class="a cn" style="left:60px;top:120px;color:${HL.ink}">Arts to Hearts Project</p>
      ${ivArt(w.img, 'left:60px;right:60px;top:220px;height:900px', o.slot)}
      <div class="a" style="left:70px;right:70px;top:1170px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px">
        <p style="${BASK};font-style:italic;font-size:44px;color:${HL.burg}">Selected for</p>
        <p style="${T_MED};font-size:${bkShort(b.name).length > 26 ? 56 : 70}px;line-height:1.02;letter-spacing:-.02em;color:${HL.ink}">${esc(bkShort(b.name))}</p>
        <p style="${T_MED};font-size:36px;color:${HL.ink};margin-top:14px">${esc(w.artist)}${w.handle ? ` <span style="color:${HL.burg}">${esc(w.handle)}</span>` : ''}</p>
        ${w.title ? `<p style="${BASK};font-style:italic;font-size:30px;color:${HL.soft}">${esc(w.title)}</p>` : ''}
        <p style="${T_REG};font-size:32px;color:${HL.burg};margin-top:22px">${esc(sale.open ? sale.verb + ' the book at shop.artstoheartsproject.com' : 'The book opens for pre-order soon')}</p>
        ${code ? `<p style="${T_MED};font-size:32px;color:${HL.ink};background:${HL.pink};border-radius:999px;padding:10px 28px">Friends &amp; family: code ${esc(code)}</p>` : ''}</div>
      <div class="a zone" style="left:240px;right:240px;top:1780px;height:80px;border:2px dashed ${HL.burg};border-radius:24px;opacity:.5;display:flex;align-items:center;justify-content:center;${T_MED};font-size:26px;color:${HL.burg}">Link sticker: the book</div>`}; },
};


// more frames for the book's life: a voice from inside the book, a page of words, a first look at the artworks
Object.assign(BKT, {
  // someone from inside the book (curator, cover artist, invited artist): their picture or work, named plainly
  person(o){ return {bg: HL.white, html: `${hlBrand()}${o.mono ? ivMono('burgundy', 'right:52px;top:40px;width:96px;height:54px') : ''}
    ${bkSlot(o.slot, o.img, 'left:36px;right:36px;top:110px;height:900px', o.ph || 'Drop their picture or artwork here')}
    <div class="a" style="left:72px;right:72px;top:1040px;display:flex;flex-direction:column;gap:8px">
      <p style="${BASK};font-style:italic;font-size:34px;color:${HL.burg}">${esc(o.kicker || '')}</p>
      <p style="${T_MED};font-size:${o.name.length > 22 ? 54 : 64}px;line-height:1.02;letter-spacing:-.02em;color:${HL.ink}">${esc(o.name)}</p>
      ${o.handle ? `<p style="${T_REG};font-size:32px;color:${HL.burg}">${esc(o.handle)}</p>` : ''}</div>`}; },
  // their words, verbatim, with one phrase in Pink
  quote(o){ const q = String(o.q || ''); const sz = q.length > 300 ? 40 : q.length > 200 ? 46 : q.length > 120 ? 54 : 62;
    return {bg: HL.white, html: `${hlBrand(HL.burg)}
    <div class="a" style="left:72px;right:72px;top:200px;bottom:280px;display:flex;align-items:center">
      <p style="${BASK};font-size:${sz}px;line-height:1.32;color:${HL.ink}">“${esc(q)}”</p></div>
    <p class="a" style="left:72px;right:72px;top:1130px;${T_MED};font-size:34px;letter-spacing:-.01em;color:${HL.burg}">${esc(o.name)}${o.handle ? ` <span style="${T_REG}">${esc(o.handle)}</span>` : ''}</p>`}; },
  // a page of words: the theme, the editor's note
  words(o){ const t = String(o.body || ''); const sz = t.length > 520 ? 34 : t.length > 380 ? 38 : t.length > 260 ? 44 : 50;
    return {bg: o.pink ? HL.pink : HL.white, html: `${hlBrand(HL.burg)}
    <div class="a" style="left:72px;right:72px;top:170px;bottom:150px;display:flex;flex-direction:column;justify-content:center;gap:34px">
      ${o.head ? `<p style="${T_MED};font-size:60px;line-height:1.05;letter-spacing:-.02em;color:${HL.ink}">${esc(o.head)}</p>` : ''}
      <p style="${BASK};font-size:${sz}px;line-height:1.4;color:${HL.ink}">${bkMark(t)}</p>
      ${o.by ? `<p style="${T_MED};font-size:30px;color:${HL.burg}">${esc(o.by)}</p>` : ''}</div>`}; },
  // two artworks, each whole, credited under it
  pair(o){ const cell = (w, top, k) => `${bkSlot(o.slot + k, w.img, `left:60px;right:60px;top:${top}px;height:470px`, 'Artwork')}
      <p class="a" style="left:72px;right:72px;top:${top + 480}px;${T_MED};font-size:26px;color:${HL.ink}">${esc(w.artist)}${w.handle ? ` <span style="color:${HL.burg}">${esc(w.handle)}</span>` : ''}${w.title ? ` <span style="${BASK};font-style:italic;color:${HL.soft}">${esc(w.title)}</span>` : ''}</p>`;
    return {bg: HL.white, html: `${hlBrand()}${cell(o.a, 100, 'a')}${o.b ? cell(o.b, 650, 'b') : ''}`}; },
});
const bkMark = t => { const ss = String(t).match(/[^.!?]+[.!?]+[”"’']?\s*/g) || []; if (ss.length < 2 || ss[0].length > String(t).length * .6) return esc(t); return mark(esc(ss[0].trim())) + ' ' + esc(String(t).slice(ss[0].length)); };   // the first sentence in Pink when there is more after it
const bkPic = (slot, url) => (typeof state !== 'undefined' && state.images && state.images[slot]) || url || '';
const bkSlot = (slot, url, style, ph) => { const u = bkPic(slot, url); return u ? `<div class="a img" data-slot="${slot}" style="${style};background-image:url(${u});background-position:center;background-size:contain;background-repeat:no-repeat"></div>` : `<div class="a ph" data-slot="${slot}" style="${style};color:${HL.burg}">${esc(ph)}</div>`; };

// ---------- the book, read once: who is inside, which artists are in print ----------
const bkCase = t => { t = String(t || '').trim(); return t && t === t.toUpperCase() && /\p{Lu}{3}/u.test(t) ? t.charAt(0) + t.slice(1).toLowerCase() : t; };   // "THE SUMMER WE REMEMBER" → "The summer we remember"
const BK_FEAT = 10;   // artists per feature carousel
const bkRoleOf = r => { r = String(r || '').toLowerCase(); return /curat|juror/.test(r) ? 'curator' : /cover/.test(r) ? 'cover' : /invited/.test(r) ? 'invited' : /award/.test(r) ? 'award' : /writer|article/.test(r) ? 'writer' : 'interview'; };
function bkData(b){
  if (b._d && b._d.n === (b.artists || []).length) return b._d;
  const all = (b.artists || []).filter(a => a.name).map(a => ({...a, name: bkName(a.name), handle: bkHandle(a.handle)}));
  const checked = !!b.verify; const inPrint = checked ? all.filter(a => a.print && a.print.page) : all;
  inPrint.sort((x, y) => ((x.print || {}).page || 9999) - ((y.print || {}).page || 9999));
  const missing = checked ? all.filter(a => !(a.print && a.print.page)) : [];
  const works = inPrint.map(a => ({...bkWork(a), page: a.print && a.print.page, titleOk: !(a.print && a.print.title === false)}));
  const ins = b.inside || {}; const people = (ins.interviews || []).filter(p => p.name).map(p => ({...p, kind: bkRoleOf(p.role), handle: bkHandle(p.handle || ''), quotes: (p.quotes || []).filter(Boolean)}));
  const find = n => works.find(w => n && w.artist.toLowerCase() === String(n).toLowerCase());
  const cover = ins.cover || (b.coverArtist ? {artist: b.coverArtist.name} : null);
  const coverP = cover && (people.find(p => p.kind === 'cover') || people.find(p => cover.artist && p.name.toLowerCase() === cover.artist.toLowerCase()));
  const curator = people.find(p => p.kind === 'curator') || (b.juror ? {name: b.juror, kind: 'curator', quotes: []} : null);
  const voices = people.filter(p => p !== coverP && p !== curator && p.kind !== 'writer');
  return b._d = {n: (b.artists || []).length, all, inPrint, missing, works, people, cover, coverP, coverHandle: (coverP && coverP.handle) || (b.coverArtist && b.coverArtist.handle) || '', curator, voices, find, checked};
}

// ---------- dates: from Books Data, the missing ones estimated from the ones we have ----------
const DAY = 864e5;
const bkParse = s => { const t = Date.parse(String(s || '').trim()); return isNaN(t) ? null : new Date(t); };
const bkAdd = (d, n) => d ? new Date(d.getTime() + n * DAY) : null;
const bkFmt = d => d ? d.toLocaleDateString('en-GB', {weekday: 'short', day: 'numeric', month: 'short'}) : '';
function bkDates(b){
  const d = b.dates || {}; const g = k => bkParse(d[k]); const est = {};
  let closes = g('callCloses'), selected = g('selected'), pre = g('preorder'), print = g('print'), ships = g('ships');
  const set = (k, v) => { est[k] = true; return v; };
  if (!selected && closes) selected = set('selected', bkAdd(closes, 14));
  if (!pre && selected) pre = set('preorder', bkAdd(selected, 30));
  if (!selected && pre) selected = set('selected', bkAdd(pre, -30));
  if (!print && pre) print = set('print', bkAdd(pre, 21));
  if (!ships && print) ships = set('ships', bkAdd(print, 25));
  if (!pre && ships) { print = print || set('print', bkAdd(ships, -25)); pre = set('preorder', bkAdd(print, -21)); selected = selected || set('selected', bkAdd(pre, -30)); }
  return {selected, preorder: pre, print, ships, arrived: bkAdd(ships, 10), est, any: !!(selected || pre)};
}

// ---------- the plan: every post for one book, in order, each with one clear action ----------
// Editorial-led: we sell what's inside (the curator, the cover artist, invited voices, the artists), not pages.
function bkPlan(b){
  const D = bkData(b), T = bkDates(b), n = D.works.length, name = bkShort(b.name);
  const at = (base, k) => base ? bkAdd(base, k) : null; const P = [];
  const add = (phase, id, when, title, what, slides, collab) => P.push({phase, id, when, title, what, slides, collab});
  add('pre', 'selected', T.selected, 'The selected artists', `Every name in the book, ${Math.ceil(n / 20) || 1} slide${n > 20 ? 's' : ''} of names. Congratulations, and "your feature is coming".`, Math.ceil(n / 20) + 2);
  if (b.inside && b.inside.theme || b.category) add('pre', 'theme', at(T.selected, 5), 'The theme', 'What the book is about, in the editor\'s words, with four artworks from inside.', 5);
  if (D.curator) add('pre', 'curator', at(T.selected, 9), `The curator: ${D.curator.name}`, `Who chose the work and what they looked for, in their own words.${D.curator.handle ? ' Collab post with ' + D.curator.handle + '.' : ''}`, 2 + Math.min(3, (D.curator.quotes || []).length) + 1, !!D.curator.handle);
  const V = D.voices.filter(p => p.quotes.length || p.intro); const span = T.selected && T.preorder ? Math.max(8, (T.preorder - T.selected) / DAY - 14) : 16;
  V.forEach((p, k) => add('pre', 'voice' + D.voices.indexOf(p), at(T.selected, 12 + Math.round(k * span / Math.max(1, V.length))), `${p.kind === 'award' ? 'Award winner' : p.kind === 'invited' ? 'Invited artist' : 'Interview'}: ${p.name}`, `Their interview from the book, three quotes, then where to find it.${p.handle ? ' Collab post with ' + p.handle + ' (their followers see the book).' : ''}`, 2 + Math.min(3, p.quotes.length) + 1, !!p.handle));
  if (n) add('pre', 'peek', at(T.preorder, -6), 'A first look inside', 'Eight artworks from the book, whole and credited. Pre-order opens soon.', 7);
  if (D.cover) add('pre', 'cover', at(T.preorder, -2), `Cover reveal: ${D.cover.artist}`, `The cover, the artwork, the artist in their words.${D.coverHandle ? ' Collab post with ' + D.coverHandle + '.' : ''}`, 4 + Math.min(2, D.coverP ? D.coverP.quotes.length : 0), !!D.coverHandle);
  add('launch', 'open', T.preorder, 'Pre-order is open', `The book, what's inside it (${[D.curator && 'the curator', D.cover && 'the cover artist', D.voices.length && D.voices.length + ' interviews', n && n + ' artists'].filter(Boolean).join(', ')}), the price, link in bio.`, 5);
  if (b.inside && b.inside.editor) add('launch', 'editor', at(T.preorder, 3), "The editor's note", "The editor's note from the book, as a short read.", 4);
  const parts = Math.ceil(n / BK_FEAT); for (let k = 0; k < parts; k++) { const when = at(T.preorder, 5 + k * 3); add(T.ships && when && when > T.ships ? 'after' : 'launch', 'feat' + k, when, `Artist features ${k + 1} of ${parts}`, `${Math.min(BK_FEAT, n - k * BK_FEAT)} artists, each artwork whole with their line. Tag every artist, then send them their share kit.`, Math.min(BK_FEAT, n - k * BK_FEAT) + 3); }
  add('launch', 'why', at(T.preorder, 10), 'Why this book', 'What a reader gets: who is inside, how it was chosen, what it is like to hold. One action: pre-order.', 5);
  if (b.codes && b.codes.friends) add('launch', 'family', at(T.print, -5), 'For artists\' friends and family', `The friends & family code ${b.codes.friends}${b.codesLive ? '' : ' (shows once ticked live in Shopify)'}.`, 3);
  if (T.print) add('launch', 'print', at(T.print, -1), 'Going to print', 'The last days at the pre-order price. Clear date, no countdown noise.', 3);
  if (T.ships) add('after', 'arrived', T.arrived, 'It\'s here', 'The book in hand (photoshoot pictures), the artists, order now.', 5);
  if (T.ships) add('after', 'archive', at(T.arrived, 45), 'From the archive', 'Back on the shelf: three artworks and the book, for readers who missed it.', 5);
  P.forEach(p => { p.t = p.when ? p.when.getTime() : Infinity; }); P.sort((x, y) => x.t - y.t);
  return P;
}

// ---------- the posts themselves (open in the normal preview: edit, replace images, download) ----------
function bookGroups(){
  const v = BOOKVIEW; const b = v && BOOKS && BOOKS.books[v.book]; if (!b) return [];
  const D = bkData(b), name = bkShort(b.name), sale = bkSale(b), n = D.works.length, W = D.works.filter(w => w.img);
  const credits = {}; D.works.forEach(w => { if (w.img) credits[w.img] = {text: `${w.title ? w.title + ' by ' : ''}${w.artist}${w.handle ? ' ' + w.handle : ''}`, artist: w.artist, title: w.title}; });
  const tags = '#artstoheartsproject #artbook #contemporaryart #artcollectors';
  const bookImg = bkImg(b.shop && b.shop.image); const out = [];
  const post = (title, slides, cap, meta, extra) => out.push({book: true, credits, title: `${name} · ${title}`, meta, cap: cap + '\n\n' + tags, pin: sale.line, slides: slides.map((s, j) => ({...s, title: v.id + '-' + (j + 1)})), ...(extra || {})});
  const pick = (k, from) => { const l = W.slice(from || 0, (from || 0) + k); return l.length ? l : W.slice(0, k); };
  const endSale = () => BKT.end({head: sale.open ? sale.line.replace(' Link in bio.', '') : `${name} opens for pre-order soon.`, sub: sale.open ? 'Link in bio.' : 'Follow along to meet every artist in the book.'});
  const voicePost = (p, kicker, slot) => { const q = p.quotes.slice(0, 3); const w = D.find(p.name);
    const S = [BKT.person({slot, img: w && w.img, kicker, name: p.name, handle: p.handle, mono: true}),
      ...(p.intro ? [BKT.words({body: bkCut(p.intro, 420)})] : []), ...q.map(x => BKT.quote({q: bkCut(x, 380), name: p.name, handle: p.handle})),
      BKT.book({b, img: bookImg, line: `Read the full interview${p.page ? ' on page ' + p.page : ''} of ${name}.`}), endSale()];
    return S; };
  const id = v.id;
  if (id === 'selected') { const per = 20, pages = []; for (let i = 0; i < n; i += per) pages.push(D.works.slice(i, i + per).map(w => ({name: w.artist, handle: w.handle})));
    post('Selected artists', [BKT.cover({img: bkPic('bkcover', (W[0] || {}).img), serif: 'The selected artists', big: b.name, under: n ? `${n} artists` : ''}), ...pages.map(l => BKT.names({list: l, sz: 30, gap: 18})),
      BKT.end({head: `Congratulations to every artist selected for ${name}.`, sub: 'Your feature is coming. Share this post and tag us.'})],
      `The selected artists for ${name}.\n\nCongratulations to all ${n} artists. Find your name, share it, and tag @artstoheartsproject. Every artist will be featured here over the coming weeks.`, 'Post on the day the list goes live'); }
  else if (id === 'theme') { const th = (b.inside && b.inside.theme) || {}; const f = pick(4);
    post('The theme', [BKT.cover({img: bkPic('bkcover', (f[0] || {}).img), serif: 'The theme of', big: b.name}), BKT.words({head: bkCase(th.title), body: bkCut(th.text || '', 520), pink: true}),
      BKT.pair({a: f[0] || {}, b: f[1], slot: 'bkt1'}), BKT.pair({a: f[2] || f[0] || {}, b: f[3], slot: 'bkt2'}), endSale()],
      `${th.title ? th.title + '. ' : ''}The theme of ${name}.\n\n${bkCut(th.text || '', 300)}\n\nArtworks: ${f.map(w => w.artist + (w.handle ? ' ' + w.handle : '')).join(', ')}.`, 'Collab: none · tag the four artists'); }
  else if (id === 'curator' && D.curator) { const p = D.curator;
    post('The curator', voicePost(p, b.juror && !p.intro ? 'Juror and curator' : 'The curator', 'bkcur'), `${p.name}${p.handle ? ' ' + p.handle : ''} curated ${name}.\n\n${p.quotes[0] ? '“' + bkCut(p.quotes[0], 220) + '”' : ''}\n\nThe full conversation is in the book.`, p.handle ? `Collab post: invite ${p.handle}` : 'Add their picture'); }
  else if (/^voice\d+$/.test(id)) { const p = D.voices[+id.slice(5)]; if (p) post(p.name, voicePost(p, p.kind === 'award' ? 'Award winner' : p.kind === 'invited' ? 'Invited artist' : 'In conversation', 'bkv'),
      `${p.name}${p.handle ? ' ' + p.handle : ''} in ${name}.\n\n${p.quotes[0] ? '“' + bkCut(p.quotes[0], 220) + '”' : ''}\n\nRead the full interview in the book.`, p.handle ? `Collab post: invite ${p.handle}` : 'Interview from the book'); }
  else if (id === 'peek') { const f = pick(8, 4);
    post('A first look inside', [BKT.cover({img: bkPic('bkcover', (f[0] || {}).img), serif: 'A first look inside', big: b.name}), ...[0, 2, 4, 6].filter(i => f[i]).map(i => BKT.pair({a: f[i], b: f[i + 1], slot: 'bkp' + i})), endSale()],
      `A first look inside ${name}.\n\n${f.map(w => w.artist + (w.handle ? ' ' + w.handle : '')).join('\n')}\n\n${sale.open ? sale.line : 'Pre-order opens soon.'}`, 'Tag the eight artists'); }
  else if (id === 'cover' && D.cover) { const c = D.cover, p = D.coverP || {quotes: []}; const w = D.find(c.artist);
    post('Cover reveal', [BKT.cover({img: bkPic('bkcvr', bookImg), serif: 'The cover of', big: b.name, under: `Art by ${c.artist}`}),
      BKT.person({slot: 'bkcva', img: w && w.img, kicker: 'The cover artist', name: c.artist, handle: D.coverHandle, ph: 'Drop the cover artwork here'}),
      ...(c.title ? [BKT.words({head: c.title + (c.year ? ` (${c.year})` : ''), body: p.intro ? bkCut(p.intro, 380) : `${c.artist}'s work is on the cover of ${name}.`})] : []),
      ...p.quotes.slice(0, 2).map(x => BKT.quote({q: bkCut(x, 380), name: c.artist, handle: D.coverHandle})), endSale()],
      `The cover of ${name}: ${c.title ? c.title + ' by ' : ''}${c.artist}${D.coverHandle ? ' ' + D.coverHandle : ''}.\n\n${p.quotes[0] ? '“' + bkCut(p.quotes[0], 220) + '”\n\n' : ''}${sale.open ? sale.line : 'Pre-order opens soon.'}`, D.coverHandle ? `Collab post: invite ${D.coverHandle}` : 'Cover reveal'); }
  else if (id === 'open') { const inside = [D.curator && `Curated by ${D.curator.name}.`, D.cover && `On the cover, ${D.cover.artist}.`, D.voices.length && `Interviews with ${D.voices.slice(0, 3).map(p => p.name).join(', ')}${D.voices.length > 3 ? ' and more' : ''}.`, n && `${n} artists${b.pages ? ', ' + b.pages + ' pages' : ''}.`].filter(Boolean).join(' ');
    post('Pre-order is open', [BKT.cover({img: bkPic('bkcvr', bookImg), serif: 'Pre-order is open', big: b.name}), BKT.words({head: 'Inside the book', body: inside}),
      BKT.pair({a: W[0] || {}, b: W[1], slot: 'bko'}), BKT.book({b, img: bookImg, line: b.shop && b.shop.price ? `$${b.shop.price}. Ships when it's printed.` : 'Ships when it\'s printed.'}), endSale()],
      `${name} is open for pre-order.\n\n${inside}\n\n${sale.line}`, 'Pin to the grid'); }
  else if (id === 'editor') { const e = {...b.inside.editor, text: b.inside.editor.text.replace(/^ear Reader/, 'Dear Reader')}; const parts = (e.text.match(/[^.!?]+[.!?]+/g) || [e.text]); const a = [], cur = []; let len = 0;
    parts.forEach(x => { if (len + x.length > 420 && cur.length) { a.push(cur.join('').trim()); cur.length = 0; len = 0; } cur.push(x); len += x.length; }); if (cur.length) a.push(cur.join('').trim());
    post("The editor's note", [BKT.cover({img: bkPic('bkcover', (W[2] || W[0] || {}).img), serif: "The editor's note", big: b.name}), ...a.slice(0, 3).map((t, i) => BKT.words({body: t, by: i === Math.min(2, a.length - 1) ? e.by || '' : ''})), endSale()],
      `From the editor's note in ${name}.\n\n${bkCut(e.text, 260)}`, 'A short read from the book'); }
  else if (/^feat\d+$/.test(id)) { const k = +id.slice(4), parts = Math.ceil(n / BK_FEAT); const chunk = D.works.slice(k * BK_FEAT, (k + 1) * BK_FEAT); const longest = Math.max(0, ...chunk.map(w => w.line.length));
    post(`Artist features ${k + 1} of ${parts}`, [BKT.cover({img: bkPic('bkcover', (chunk.find(w => w.img) || {}).img), serif: 'Meet the artists of', big: b.name}),
      ...chunk.map((w, i) => HLT.work({w: {...w, about: bkCut(w.line, longest > 160 ? 150 : 170)}, img: bkPic('bkw' + i, w.img), slot: 'bkw' + i, under: true})),
      BKT.book({b, img: bookImg, line: `${n} artists, one book${b.pages ? `, ${b.pages} pages` : ''}.`}), endSale()],
      `Meet ${chunk.length} of the ${n} artists in ${name}.\n\n${chunk.map(w => `${w.artist}${w.handle ? ' ' + w.handle : ''}${w.title ? `, ${w.title}` : ''}`).join('\n')}\n\nEvery one of them is in the book.\n${sale.line}`, `Tag the ${chunk.length} artists in the image · then send each their share kit (Artist kits tab)`); }
  else if (id === 'why') { const lines = [D.curator && `${D.curator.name} chose every work.`, D.voices.length && `${D.voices.length} conversations with the artists behind the work.`, n && `${n} artists, each with their own page.`, 'Printed to keep on the shelf, not scrolled past.'].filter(Boolean).join(' ');
    post('Why this book', [BKT.cover({img: bkPic('bkcover', (W[5] || W[0] || {}).img), serif: 'Why this book', big: b.name}), BKT.words({body: lines, pink: true}), BKT.pair({a: W[6] || W[0] || {}, b: W[7], slot: 'bky'}), BKT.book({b, img: bookImg, line: 'For collectors, artists and anyone who wants new art on their table.'}), endSale()],
      `Why ${name}?\n\n${lines}\n\n${sale.line}`, 'One action: pre-order'); }
  else if (id === 'family') post('Friends and family', [BKT.book({b, img: bookImg, line: `Friends and family of our artists: use ${b.codesLive ? b.codes.friends : '(code shows when live)'} at checkout.`}), BKT.pair({a: W[8] || W[0] || {}, b: W[9], slot: 'bkf'}), BKT.pair({a: W[10] || W[1] || {}, b: W[11], slot: 'bkf2'}), endSale()],
      `Know an artist in ${name}? Friends and family get their own code: ${b.codesLive ? b.codes.friends : '[code shows once ticked live in Shopify]'}.\n\n${sale.line}`, 'Only post once the code is live in Shopify');
  else if (id === 'print') post('Going to print', [BKT.cover({img: bkPic('bkcvr', bookImg), serif: 'Going to print soon', big: b.name}), BKT.pair({a: W[12] || W[0] || {}, b: W[13], slot: 'bkg'}), BKT.pair({a: W[14] || W[1] || {}, b: W[15], slot: 'bkg2'}), BKT.book({b, img: bookImg, line: 'Pre-order now and it ships as soon as it\'s printed.'}), endSale()],
      `${name} goes to print soon. Pre-order now and it ships as soon as it's printed.\n\n${sale.line}`, 'Plain date, no countdown');
  else if (id === 'arrived') post("It's here", [BKT.cover({img: bkPic('bkshoot', ''), serif: "It's here", big: b.name}), BKT.pair({a: W[0] || {}, b: W[1], slot: 'bka'}), BKT.pair({a: W[2] || {}, b: W[3], slot: 'bka2'}), BKT.book({b, img: bookImg, line: 'In stock and shipping now.'}), endSale()],
      `${name} is here.\n\nThank you to every artist inside it.\n\n${sale.line}`, 'Use the photoshoot pictures on the cover (drop them in)');
  else if (id === 'archive') { const f = pick(3, 10); post('From the archive', [BKT.cover({img: bkPic('bkcover', (f[0] || {}).img), serif: 'From our shelf', big: b.name}), ...f.map((w, i) => HLT.work({w: {...w, about: bkCut(w.line, 150)}, img: bkPic('bkr' + i, w.img), slot: 'bkr' + i, under: true})), endSale()],
      `From our shelf: ${name}.\n\n${f.map(w => w.artist + (w.handle ? ' ' + w.handle : '')).join(', ')} and ${Math.max(0, n - 3)} more artists.\n\n${sale.line}`, 'Backlist rotation'); }
  else if (/^kits\d+$/.test(id)) { const k = +id.slice(4), chunk = D.works.slice(k * BK_FEAT, (k + 1) * BK_FEAT);
    const K = chunk.map((w, i) => ({...BKT.kit({w: {...w, img: bkPic('bkkit' + i, w.img)}, b, slot: 'bkkit' + i}), label: w.artist})); const code = b.codes && b.codes.artist;
    const dm = `Hi {first name}, your feature for ${name} is live on our page today. Here is a story frame made for you: share it and tag @artstoheartsproject, and we'll reshare it.${sale.open ? ` ${sale.line.replace('. Link in bio.', '')} at shop.artstoheartsproject.com.` : ''}${b.codesLive && code ? ` Your artist code for the book is ${code}${b.codes.friends ? `, and friends and family can use ${b.codes.friends}` : ''}.` : ''} Thank you for being part of the book.`;
    out.push({book: true, credits, title: `${name} · Share kits ${k + 1} of ${Math.ceil(n / BK_FEAT)}`, meta: `${K.length} story frames, one per artist · send each artist theirs with the message below`, slides: K.map((s, j) => ({...s, title: 'share-kit-' + (k * BK_FEAT + j + 1)})), story: true, cap: dm, pin: ''}); }
  return out;
}

// ---------- the Books tab: a list of books, then one book on its own page ----------
let BOOKTAB = 'inside';
const BK_TABS = [['inside', 'Inside the book'], ['artists', 'Artists'], ['pre', 'Pre-launch'], ['launch', 'Launch'], ['after', 'After launch'], ['kits', 'Artist kits']];
function bookCard(b, i){
  const img = b.shop && b.shop.image ? `<img class="bk-cv" loading="lazy" src="${bkEsc(b.shop.image)}" alt="">` : `<div class="bk-cv bk-none">${bkEsc(b.name)}</div>`;
  const sale = b.shop ? `${b.shop.preorder ? 'Pre-order' : b.shop.available ? 'In stock' : 'Sold out'}${b.shop.price ? ' · $' + bkEsc(b.shop.price) : ''}` : 'Not in the shop yet';
  const v = b.verify; const art = b.artistsError ? `<span class="bk-warn">${bkEsc(b.artistsError)}</span>` : v ? `${v.inPrint} artists in print` : b.sheet ? `${b.count || 0} artists (sheet)` : '<span class="bk-warn">No artist sheet linked</span>';
  return `<button type="button" class="bk-card" data-book="${i}">${img}<b>${bkEsc(b.name)}</b><span>${bkEsc([b.status, b.year].filter(Boolean).join(' · '))}</span><span>${art}</span><span>${sale}</span></button>`;
}
function bookHead(b){
  const links = [['Shop', b.shop && b.shop.url], ['Landing page', b.links.landing], ['Amazon', b.links.amazon], ['Final PDF', b.links.pdf]].filter(x => x[1]).map(([l, u]) => `<a href="${bkEsc(u)}" target="_blank" rel="noopener">${l}</a>`).join(' · ');
  const T = bkDates(b); const dl = [['Selected', T.selected, 'selected'], ['Pre-order', T.preorder, 'preorder'], ['To print', T.print, 'print'], ['Ships', T.ships, 'ships']].filter(x => x[1]).map(([l, d, k]) => `<span>${l} <b>${bkFmt(d)}</b>${T.est[k] ? ' <i>(est.)</i>' : ''}</span>`).join('');
  const v = b.verify; const ver = v ? `<p class="${v.missing.length ? 'bk-warn' : 'bk-ok'}">Checked against the final PDF: ${v.inPrint} of ${v.total} artists in print${v.missing.length ? `, ${v.missing.length} not in print (left out of posts)` : ''}${v.titleCheck && v.titleCheck.length ? `, ${v.titleCheck.length} artwork titles differ from print` : ''}.</p>` : b.links.pdf ? `<p class="bk-warn">${bkEsc(b.insideError || 'Not checked against the final PDF yet. Press Sync now.')}</p>` : '<p class="bk-warn">No final PDF linked in Books Data (column J) yet, so artists come from the sheet unchecked.</p>';
  const sale = b.shop ? `${b.shop.preorder ? 'Pre-order open' : b.shop.available ? 'In stock' : 'Sold out'}${b.shop.price ? ' · $' + bkEsc(b.shop.price) : ''}` : 'Not in the shop yet';
  return `<div class="bk-head">${b.shop && b.shop.image ? `<img src="${bkEsc(b.shop.image)}" alt="">` : ''}<div><button type="button" class="btn ghost" id="bkback">&larr; All books</button>
    <h2>${bkEsc(b.name)}</h2><p class="meta">${bkEsc([b.status, sale, b.pages && b.pages + ' pages', b.designer && 'Designed by ' + b.designer].filter(Boolean).join(' · '))}</p>
    ${dl ? `<p class="bk-dates">${dl}</p>` : '<p class="meta">No dates in Books Data yet (columns AH to AN), so posts are listed in order without dates.</p>'}${ver}${links ? `<p class="meta">${links}</p>` : ''}</div></div>`;
}
function bkWho(p, label){ return `<div class="bk-iv"><p class="bk-role">${bkEsc(label)}</p><p><b>${bkEsc(p.name)}</b> ${bkEsc(p.handle || '')}${p.page ? ` · page ${p.page}` : ''}</p>${p.title ? `<p class="meta">${bkEsc(bkCase(p.title))}</p>` : ''}${p.intro ? `<p>${bkEsc(bkCut(p.intro, 360))}</p>` : ''}${(p.quotes || []).map(q => `<blockquote>“${bkEsc(q)}”</blockquote>`).join('')}</div>`; }
function bookTabInside(b){
  const D = bkData(b), i = b.inside || {}; if (!i.cover && !i.interviews && !b.juror && !b.coverArtist) return `<p class="meta">${b.links.pdf ? 'The final PDF will be read on the next sync.' : 'Add the final PDF link in Books Data to see what\'s inside.'}</p>`;
  const card = [];
  if (D.curator) card.push(bkWho(D.curator, 'Curator'));
  if (D.cover) card.push(bkWho({...(D.coverP || {}), name: D.cover.artist, handle: D.coverHandle, title: D.cover.title ? `${D.cover.title}${D.cover.year ? ' (' + D.cover.year + ')' : ''}` : ''}, 'Cover artist'));
  D.voices.forEach(p => card.push(bkWho(p, p.kind === 'award' ? 'Award winner' : p.kind === 'invited' ? 'Invited artist' : 'Interview')));
  const row = (k, v) => v ? `<div class="bk-in"><b>${k}</b><div>${v}</div></div>` : '';
  return `<div class="bk-ivs">${card.join('')}</div>
    ${row('Theme', i.theme ? `<b>${bkEsc(bkCase(i.theme.title))}</b><br>${bkEsc(i.theme.text || '')}` : '')}
    ${row("Editor's note", i.editor && i.editor.text ? bkEsc(i.editor.text.replace(/^ear Reader/, 'Dear Reader')) + (i.editor.by ? `<br><i>${bkEsc(i.editor.by)}</i>` : '') : '')}
    ${row('Articles', (i.articles || []).map(a => bkEsc(`${bkCase(a.title)}${a.by ? ' by ' + a.by : ''}${a.page ? ' · page ' + a.page : ''}`)).join('<br>'))}
    ${i.by !== 'ai' ? '<p class="meta">Read with layout rules. Add ANTHROPIC_API_KEY in Vercel and the next sync reads every book properly (once per book).</p>' : ''}`;
}
function bookTabArtists(b){
  const D = bkData(b); if (b.loading) return '<p class="meta">Loading the artists…</p>'; if (!D.all.length) return `<p class="meta">${b.artistsError ? bkEsc(b.artistsError) : 'No artists in the sheet yet.'}</p>`;
  const card = w => `<div class="bk-a">${w.img ? `<img loading="lazy" decoding="async" src="${bkEsc(w.img)}" alt="">` : '<div class="bk-w bk-none">No artwork in the sheet</div>'}<b>${bkEsc(w.artist)}</b><span>${bkEsc(w.handle)}</span>${w.title ? `<i>${bkEsc(w.title)}</i>` : ''}${w.page ? `<span class="bk-ok">Page ${w.page}</span>` : ''}${w.titleOk ? '' : '<span class="bk-warn">Title in the sheet differs from print</span>'}</div>`;
  return `<p class="meta">${D.works.length} artists${D.checked ? ' in the final PDF, in page order' : ' from the sheet (not checked against a PDF yet)'}.</p><div class="bk-arts">${D.works.map(card).join('')}</div>
    ${D.missing.length ? `<h3>In the sheet but not in the final PDF</h3><p class="meta">Replaced, dropped or spelled differently. Left out of every post.</p><p>${D.missing.map(a => bkEsc(a.name)).join(' · ')}</p>` : ''}`;
}
function bookTabPhase(b, phase){
  const P = bkPlan(b).filter(p => p.phase === phase); const today = Date.now();
  const intro = {pre: 'While the book is being made: who is inside it, before anyone can buy it. Ends with the cover reveal.', launch: 'Pre-order is open until it goes to print: the book, the editor, every artist, one action each time.', after: 'The book is here, then it rotates in the backlist.'}[phase];
  if (!P.length) return `<p class="meta">${intro}</p><p class="meta">Nothing here yet for this book.</p>`;
  return `<p class="meta">${intro} ${P.length} posts.</p><div class="bk-plan">${P.map(p => `<div class="bk-row${p.when && p.t < today - DAY ? ' past' : ''}${BOOKVIEW && BOOKVIEW.id === p.id ? ' on' : ''}"><span class="bk-when">${p.when ? bkFmt(p.when) : '—'}</span><div><b>${bkEsc(p.title)}</b>${p.collab ? ' <span class="bk-tag">Collab</span>' : ''}<p class="meta">${bkEsc(p.what)}</p></div><button type="button" class="btn ghost" data-bkopen="${p.id}">Open</button></div>`).join('')}</div>`;
}
function bookTabKits(b){
  const D = bkData(b), parts = Math.ceil(D.works.length / BK_FEAT); if (!parts) return '<p class="meta">No artists yet.</p>';
  return `<p class="meta">A story frame for every artist (their artwork, "Selected for", the shop${b.codesLive ? ', the friends & family code' : ''}), with the message to send. Send each batch on the day of that artist's feature.</p><div class="bk-plan">${Array.from({length: parts}, (_, k) => { const c = D.works.slice(k * BK_FEAT, (k + 1) * BK_FEAT);
    return `<div class="bk-row${BOOKVIEW && BOOKVIEW.id === 'kits' + k ? ' on' : ''}"><span class="bk-when">Batch ${k + 1}</span><div><b>${c.length} share kits</b><p class="meta">${bkEsc(c.map(w => w.artist).join(', '))}</p></div><button type="button" class="btn ghost" data-bkopen="kits${k}">Open</button></div>`; }).join('')}</div>`;
}
function booksRender(){
  const el = document.getElementById('books'); if (!el) return;
  if (!BOOKS && !BOOKBUSY) { booksLoad(false); return; }
  const lib = BOOKS || {books: []}; const b = BOOKSEL !== null && lib.books[BOOKSEL];
  if (b) {
    const body = BOOKTAB === 'inside' ? bookTabInside(b) : BOOKTAB === 'artists' ? bookTabArtists(b) : BOOKTAB === 'kits' ? bookTabKits(b) : bookTabPhase(b, BOOKTAB);
    el.innerHTML = `<section class="bk-detail">${bookHead(b)}<div class="bk-tabs">${BK_TABS.map(([k, l]) => `<button type="button" class="${BOOKTAB === k ? 'on' : ''}" data-bktab="${k}">${l}</button>`).join('')}</div><div class="bk-body">${body}</div>${BOOKVIEW ? '<p class="meta bk-close"><button type="button" class="btn ghost" id="bkclose">Close the post</button></p>' : ''}</section>`;
    el.querySelector('#bkback').onclick = () => { BOOKSEL = null; bookClosePost(); booksRender(); window.scrollTo({top: 0}); };
    el.querySelectorAll('[data-bktab]').forEach(x => x.onclick = () => { BOOKTAB = x.dataset.bktab; bookClosePost(); booksRender(); });
    el.querySelectorAll('[data-bkopen]').forEach(x => x.onclick = () => bookOpenPost(x.dataset.bkopen));
    const c = el.querySelector('#bkclose'); if (c) c.onclick = () => { bookClosePost(); booksRender(); };
    return;
  }
  const q = BOOKQ.toLowerCase(); const list = lib.books.map((x, i) => [x, i]).filter(([x]) => !q || (x.name + ' ' + x.category + ' ' + x.year + ' ' + x.status).toLowerCase().includes(q));
  const when = lib.synced ? new Date(lib.synced).toLocaleString() : 'never';
  el.innerHTML = `<div class="bk-top"><div><h1>Books</h1><p class="meta">${lib.books.length} books · last synced ${bkEsc(when)}. Press Sync now after adding a book or a PDF link.</p>${lib.err ? `<p class="bk-warn">Sync failed: ${bkEsc(lib.err)}</p>` : ''}${(lib.problems || []).length ? `<details class="meta"><summary>${lib.problems.length} things to fix in the sheets</summary>${lib.problems.map(p => `<p class="bk-warn">${bkEsc((p.sheet ? p.sheet + ': ' : '') + p.error)}</p>`).join('')}</details>` : ''}</div>
    <div class="bk-act"><input type="search" placeholder="Find a book" value="${bkEsc(BOOKQ)}" id="bkq"><button type="button" class="btn" id="bksync"${BOOKBUSY ? ' disabled' : ''}>${BOOKBUSY ? 'Syncing…' : 'Sync now'}</button></div></div>
    <div class="bk-grid">${list.map(([x, i]) => bookCard(x, i)).join('') || '<p class="meta">No books yet. Press Sync now.</p>'}</div>`;
  el.querySelector('#bksync').onclick = () => booksLoad(true);
  const qi = el.querySelector('#bkq'); qi.oninput = () => { BOOKQ = qi.value; const pos = qi.selectionStart; booksRender(); const nq = document.getElementById('bkq'); nq.focus(); nq.setSelectionRange(pos, pos); };
  el.querySelectorAll('[data-book]').forEach(x => x.onclick = () => bookOpen(+x.dataset.book));
}
async function bookOpen(i){
  BOOKSEL = i; BOOKTAB = 'inside'; bookClosePost(); window.scrollTo({top: 0}); const bk = BOOKS.books[i];
  if (bk && !bk.artists && bk.count) { bk.loading = true; booksRender(); try { const r = await fetch('/api/books?book=' + i); const j = await r.json(); if (r.ok) bk.artists = j.artists || []; } catch {} bk.loading = false; }
  booksRender();
}
function bookClosePost(){ if (BOOKVIEW) { BOOKVIEW = null; document.body.classList.remove('bkposts'); } }
function bookOpenPost(id){
  BOOKVIEW = {book: BOOKSEL, id}; document.body.classList.add('bkposts'); booksRender(); render();
  const o = document.getElementById('out'); if (o) o.scrollIntoView({behavior: 'smooth'});
}
