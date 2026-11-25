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
const bkSize = (u, w) => u && u.startsWith('/api/img?') && !u.includes('&w=') ? u + '&w=' + w : u;   // a smaller copy: the originals are often several MB
const bkImg = u => u ? (/^https:\/\/(media\.artstoheartsproject\.com|cdn\.shopify\.com|[a-z0-9]+\.public\.blob\.vercel-storage\.com)\//.test(u) ? '/api/img?u=' + encodeURIComponent(u) : u) : '';
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

// ---------- the book's design language ----------
// Every book post is a page of the book: a white page with section tabs on its edge (Curator, Cover, Artists, Inside),
// faces full bleed with the name set large, quotes over the person, artworks always whole. Brand colours only, no gradients.
// two lines of similar length, never a number left alone ("Arts to Hearts / Magazine", not "ATH Magazine / 14")
const bkBalance = t => { const w = String(t).split(' '); let best = [t], d = 1e9; for (let k = 1; k < w.length; k++) { const a = w.slice(0, k).join(' '), b = w.slice(k).join(' '); if (/^\d+$/.test(w[k]) && k === w.length - 1) continue; const x = Math.abs(a.length - b.length); if (x < d) { d = x; best = [a, b]; } } return best; };
const BK_SECT = ['Curator', 'Cover', 'Artists', 'Inside'];
const bkDot = c => `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${c};margin-right:14px;vertical-align:2px"></span>`;
const bkLabel = (t, c) => t ? `<p style="${T_REG};font-size:24px;letter-spacing:.14em;text-transform:uppercase;color:${c}">${bkDot(c)}${esc(t)}</p>` : '';
const bkFit = (t, w, max, k) => Math.min(max, Math.floor(w / (Math.max(1, ...String(t).split('\n').map(x => x.length)) * (k || .5))));
const bkPhoto = (slot, url, style, pos) => { const u = bkPic(slot, url); return u ? `<div class="a img" data-slot="${slot}" style="${style};background-image:url(${u});background-size:cover;background-position:${pos || 'center 28%'}"></div>` : `<div class="a ph" data-slot="${slot}" style="${style};color:${HL.pink};background:${HL.burg}">Drop their photo here</div>`; };
const bkTabs = (on, top) => BK_SECT.map((t, i) => { const act = t === on;
  return `<div class="a" style="left:916px;top:${(top || 210) + i * 214}px;width:76px;height:200px;border-radius:0 16px 16px 0;background:${act ? HL.white : i % 2 ? HL.rose : HL.pink};display:flex;align-items:center;justify-content:center">
    <p style="${act ? T_MED : T_REG};font-size:23px;letter-spacing:.16em;text-transform:uppercase;color:${HL.burg};writing-mode:vertical-rl">${t}</p></div>`; }).join('');
const bkMosaic = (faces, cols, rows) => { const w = 1080 / cols, h = 1350 / rows; const l = faces.filter(Boolean); if (!l.length) return '';
  return Array.from({length: cols * rows}, (_, i) => `<div class="a" style="left:${(i % cols) * w}px;top:${Math.floor(i / cols) * h}px;width:${w}px;height:${h}px;background:url(${l[i % l.length]}) center 28%/cover"></div>`).join('') + `<div class="a" style="inset:0;background:rgba(106,6,32,.55)"></div>`; };

const BKT = {
  // the page: a white card with the section tabs; holds a title, or a short read
  card(o){ const big = String(o.big || ''); const lines = big.length > 16 && big.includes(' ') && !big.includes('\n') ? bkBalance(big) : big.split('\n'); const bs = bkFit(lines.join('\n'), 700, o.img !== undefined && o.img ? (o.bigMax || 130) : 130, .56);
    return {bg: HL.burg, html: `${o.faces ? bkMosaic(o.faces, 6, 5) : o.photo ? bkPhoto(o.slot || 'bkbg', o.photo, 'inset:0') + '<div class="a" style="inset:0;background:rgba(28,19,16,.25)"></div>' : ''}
      <p class="a cn" style="left:52px;top:48px;color:${HL.white}">Arts to Hearts Project</p>${o.mono ? ivMono('white', 'right:52px;top:40px;width:96px;height:54px') : ''}
      ${bkTabs(o.tab)}
      <div class="a" style="left:80px;top:150px;width:840px;height:1090px;background:${HL.white};border-radius:20px"></div>
      <div class="a" style="left:140px;top:190px;width:720px;height:1010px;display:flex;flex-direction:column;justify-content:${o.list ? 'flex-start' : 'center'};${o.body ? 'align-items:flex-start;text-align:left' : 'align-items:center;text-align:center'};gap:26px">
        ${o.label ? bkLabel(o.label, HL.burg) : ''}
        ${o.serif ? `<p style="${BASK};font-style:italic;font-size:${o.body ? 44 : 62}px;line-height:1.15;color:${HL.burg}">${esc(o.serif)}</p>` : ''}
        ${big ? `<p style="${T_MED};font-size:${bs}px;line-height:.96;letter-spacing:-.035em;color:${HL.ink};white-space:nowrap">${lines.map(esc).join('<br>')}</p>` : ''}
        ${o.img !== undefined ? bkSlot(o.slot || 'bkin', o.img, 'position:relative;width:' + (o.imgW || 520) + 'px;height:' + (o.imgH || 560) + 'px;flex:none', o.ph || 'Drop the book mockup here').replace('class="a ', 'class="') : ''}
        ${o.body ? `<p style="${BASK};font-size:${o.body.length > 520 ? 32 : o.body.length > 380 ? 36 : o.body.length > 220 ? 42 : 52}px;line-height:1.42;color:${HL.ink}">${bkMark(o.body)}</p>` : ''}
        ${o.sub ? `<p style="${T_REG};font-size:34px;line-height:1.4;color:${HL.soft}">${esc(o.sub)}</p>` : ''}
        ${o.by ? `<p style="${T_MED};font-size:30px;color:${HL.burg}">${esc(o.by)}</p>` : ''}
        ${o.list ? `<div style="width:100%;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:64px;column-gap:36px;text-align:left;margin-top:10px">${o.list.map(a => `<div style="min-width:0"><p style="${T_MED};font-size:27px;line-height:1.15;color:${HL.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(a.name)}</p>${a.place ? `<p style="${T_REG};font-size:18px;line-height:1.3;color:${HL.burg};opacity:.7;margin-top:3px">${esc(a.place)}</p>` : ''}</div>`).join('')}</div>` : ''}
        ${o.pill ? `<p style="${T_MED};font-size:32px;color:${HL.white};background:${HL.burg};border-radius:999px;padding:14px 34px">${esc(o.pill)}</p>` : ''}</div>`}; },
  // a face, full bleed, the name set large (portraits may be cropped; artworks never are)
  portrait(o){ const nm = String(o.name || ''); const lines = nm.includes(' ') ? [nm.slice(0, nm.lastIndexOf(' ')), nm.slice(nm.lastIndexOf(' ') + 1)] : [nm]; const fs = bkFit(lines.join('\n'), 940, 150, .5);
    return {bg: HL.ink, html: `${bkPhoto(o.slot, o.face, 'inset:0')}<div class="a" style="inset:0;background:rgba(28,19,16,.26)"></div>
      <p class="a cn" style="left:52px;top:48px;color:${HL.white}">Arts to Hearts Project</p>${o.mono ? ivMono('white', 'right:52px;top:40px;width:96px;height:54px') : ''}
      <div class="a" style="left:64px;right:64px;bottom:84px;display:flex;flex-direction:column;gap:18px;color:${HL.white}">
        ${bkLabel(o.label, HL.white)}
        <p style="${T_MED};font-size:${fs}px;line-height:.92;letter-spacing:-.04em">${lines.map(esc).join('<br>')}</p>
        ${o.sub ? `<p style="${T_REG};font-size:32px;line-height:1.35;max-width:820px">${esc(o.sub)}</p>` : ''}</div>`}; },
  // their words over their photo
  say(o){ const q = String(o.q || ''); const fs = q.length > 200 ? 46 : q.length > 120 ? 56 : 66;
    return {bg: HL.burg, html: `${o.face ? bkPhoto(o.slot, o.face, 'inset:0') + '<div class="a" style="inset:0;background:rgba(28,19,16,.45)"></div>' : ''}
      <p class="a cn" style="left:52px;top:48px;color:${HL.white}">Arts to Hearts Project</p>
      <div class="a" style="left:80px;right:80px;top:${o.face ? 560 : 240}px;bottom:110px;display:flex;flex-direction:column;justify-content:${o.face ? 'flex-end' : 'center'};align-items:center;text-align:center;gap:36px">
        <p style="${BASK};font-size:${fs}px;line-height:1.22;color:${o.face ? HL.white : HL.pink}">${o.plain ? bkWhole(esc(q)) : `“${bkWhole(esc(q))}”`}</p>
        <p style="${T_MED};font-size:30px;letter-spacing:.02em;color:${HL.white}">${esc(o.name)}${o.handle ? ` <span style="${T_REG}">${esc(o.handle)}</span>` : ''}</p></div>`}; },
  // twelve faces: every selected artist sees themselves
  faces(o){ const cw = 306, ch = 228; return {bg: HL.white, html: `${hlBrand()}
    ${o.list.map((a, i) => { const x = 56 + (i % 3) * (cw + 24), y = 112 + Math.floor(i / 3) * 306;
      return `${a.face ? `<div class="a img" data-slot="${o.slot}${i}" style="left:${x}px;top:${y}px;width:${cw}px;height:${ch}px;border-radius:14px;background:url(${bkPic(o.slot + i, a.face)}) center 28%/cover"></div>` : `<div class="a" style="left:${x}px;top:${y}px;width:${cw}px;height:${ch}px;border-radius:14px;background:${i % 2 ? HL.pink : HL.rose};display:flex;align-items:center;justify-content:center;${T_MED};font-size:80px;color:${HL.burg}">${esc(a.name.charAt(0))}</div>`}
        <div class="a" style="left:${x}px;top:${y + ch + 10}px;width:${cw}px"><p style="${T_MED};font-size:24px;line-height:1.15;color:${HL.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(a.name)}</p><p style="${T_REG};font-size:20px;color:${HL.burg};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(a.handle || '')}</p></div>`; }).join('')}`}; },
  // what the book holds, in numbers taken from the artists' own entries
  numbers(o){ return {bg: HL.pink, html: `${hlBrand(HL.burg)}
    <div class="a" style="left:80px;right:80px;top:170px;bottom:120px;display:flex;flex-direction:column;justify-content:center;gap:40px">
      <div><p style="${T_MED};font-size:260px;line-height:.85;letter-spacing:-.05em;color:${HL.ink}">${esc(o.n)}</p><p style="${BASK};font-style:italic;font-size:46px;color:${HL.burg};margin-top:18px">${esc(o.what)}</p></div>
      <div style="border-top:2px solid ${HL.burg};opacity:.35"></div>
      ${o.rows.map(r => `<div style="display:flex;align-items:baseline;gap:28px"><p style="${T_MED};font-size:84px;line-height:1;letter-spacing:-.03em;color:${HL.ink};min-width:170px">${esc(r[0])}</p><p style="${T_REG};font-size:34px;line-height:1.3;color:${HL.ink}">${esc(r[1])}</p></div>`).join('')}</div>`}; },
  // one artist: the artwork whole, their face beside their name
  feature(o){ const w = o.w; return {bg: HL.white, html: `${hlBrand()}
    ${ivArt(bkPic(o.slot, w.img), `left:48px;right:48px;top:100px;height:${o.line ? 900 : 1000}px`, o.slot)}
    ${w.face ? `<div class="a" style="left:64px;top:${o.line ? 1046 : 1140}px;width:132px;height:132px;border-radius:50%;background:url(${w.face}) center 28%/cover"></div>` : ''}
    <div class="a" style="left:${w.face ? 222 : 64}px;right:64px;top:${o.line ? 1046 : 1140}px;display:flex;flex-direction:column;gap:4px">
      <p style="${T_MED};font-size:42px;line-height:1.1;letter-spacing:-.01em;color:${HL.ink}">${esc(w.artist)}</p>
      <p style="${T_REG};font-size:28px;color:${HL.burg}">${esc(w.handle || '')}</p>
      ${w.title ? `<p style="${BASK};font-style:italic;font-size:26px;color:${HL.soft}">${esc(w.title)}${w.medium ? ', ' + esc(w.medium.toLowerCase()) : ''}</p>` : ''}</div>
    ${o.line ? `<p class="a" style="left:64px;right:64px;top:1210px;${BASK};font-size:26px;line-height:1.36;color:${HL.ink}">${esc(o.line)}</p>` : ''}`}; },
  // quote on white with the speaker's face small
  quote(o){ const q = String(o.q || ''); const sz = q.length > 300 ? 42 : q.length > 200 ? 48 : q.length > 120 ? 56 : 64;
    return {bg: HL.white, html: `${hlBrand(HL.burg)}
    <div class="a" style="left:80px;right:80px;top:190px;bottom:300px;display:flex;align-items:center"><p style="${BASK};font-size:${sz}px;line-height:1.3;color:${HL.ink}">“${esc(q)}”</p></div>
    ${o.face ? `<div class="a" style="left:80px;top:1110px;width:110px;height:110px;border-radius:50%;background:url(${o.face}) center 28%/cover"></div>` : ''}
    <div class="a" style="left:${o.face ? 214 : 80}px;right:80px;top:1124px"><p style="${T_MED};font-size:34px;color:${HL.ink}">${esc(o.name)}</p><p style="${T_REG};font-size:26px;color:${HL.burg}">${esc(o.handle || o.role || '')}</p></div>`}; },
  // end card: one action, the monogram top centre
  end(o){ return {bg: HL.burg, html: `${ivMono('peony', 'left:430px;width:220px;top:150px;height:124px')}
    <div class="a" style="left:90px;right:90px;top:330px;bottom:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <p style="${BASK};font-size:52px;line-height:1.26;color:${HL.white}">${esc(o.head)}</p>
      <div style="width:240px;border-top:2px solid rgba(250,210,225,.35);margin:52px 0 38px"></div>
      <p style="${T_REG};font-size:34px;line-height:1.4;color:${HL.pink}">${esc(o.sub)}</p></div>
    <p class="a c" style="left:0;right:0;bottom:96px;${T_REG};font-size:28px;color:${HL.pink}">artstoheartsproject.com</p>`}; },
  // the artist's own story frame: their face and work, the book, the shop (code only once it works in Shopify)
  // the artist's printed page as a story: the proof they show their family
  kitPage(o){ const w = o.w, b = o.b; return {h: 1920, bg: HL.pink, html: `<p class="a cn" style="left:60px;top:120px;color:${HL.burg}">Arts to Hearts Project</p>
      <div class="a img" data-slot="${o.slot}" style="left:110px;right:110px;top:220px;height:1220px;background-image:url(${bkPic(o.slot, o.img)});background-size:contain;background-repeat:no-repeat;background-position:center;filter:drop-shadow(0 24px 40px rgba(28,19,16,.25))"></div>
      <div class="a" style="left:80px;right:80px;top:1490px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px">
        <p style="${BASK};font-style:italic;font-size:44px;color:${HL.burg}">My page in</p>
        <p style="${T_MED};font-size:64px;line-height:1;letter-spacing:-.03em;color:${HL.ink}">${esc(bkShort(b.name))}</p></div>
      <div class="a zone" style="left:240px;right:240px;top:1760px;height:80px;border:2px dashed ${HL.burg};border-radius:24px;opacity:.5;display:flex;align-items:center;justify-content:center;${T_MED};font-size:26px;color:${HL.burg}">Link sticker: the book</div>`}; },
  kit(o){ const w = o.w, b = o.b, sale = bkSale(b), code = b.codesLive && b.codes && b.codes.friends;
    return {h: 1920, bg: HL.burg, html: `<p class="a cn" style="left:60px;top:120px;color:${HL.white}">Arts to Hearts Project</p>
      <div class="a" style="left:60px;right:60px;top:200px;height:1300px;background:${HL.white};border-radius:24px"></div>
      ${ivArt(w.img, 'left:100px;right:100px;top:240px;height:800px', o.slot)}
      <div class="a" style="left:110px;right:110px;top:1080px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px">
        ${bkLabel('Selected artist', HL.burg)}
        <p style="${T_MED};font-size:72px;line-height:1;letter-spacing:-.03em;color:${HL.ink};margin-top:8px">${esc(w.artist)}</p>
        ${w.title ? `<p style="${BASK};font-style:italic;font-size:30px;color:${HL.soft}">${esc(w.title)}</p>` : ''}
        <p style="${BASK};font-size:36px;color:${HL.burg};margin-top:16px">in ${esc(bkShort(b.name))}</p></div>
      <div class="a" style="left:80px;right:80px;top:1550px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px">
        <p style="${T_REG};font-size:32px;color:${HL.pink}">${esc(sale.open ? sale.verb + ' the book at shop.artstoheartsproject.com' : 'The book opens for pre-order soon')}</p>
        ${code ? `<p style="${T_MED};font-size:32px;color:${HL.burg};background:${HL.pink};border-radius:999px;padding:10px 28px">Friends &amp; family: code ${esc(code)}</p>` : ''}</div>
      <div class="a zone" style="left:240px;right:240px;top:1760px;height:80px;border:2px dashed ${HL.pink};border-radius:24px;opacity:.6;display:flex;align-items:center;justify-content:center;${T_MED};font-size:26px;color:${HL.pink}">Link sticker: the book</div>`}; },
};

const bkMark = t => { const ss = String(t).match(/[^.!?]+[.!?]+[”"’']?\s*/g) || []; if (ss.length < 2 || ss[0].length > String(t).length * .6) return esc(t); return mark(esc(ss[0].trim())) + ' ' + esc(String(t).slice(ss[0].length)); };   // the first sentence in Pink when there is more after it
const bkPic = (slot, url) => (typeof state !== 'undefined' && state.images && state.images[slot]) || url || '';
const bkSlot = (slot, url, style, ph) => { const u = bkPic(slot, url); return u ? `<div class="a img" data-slot="${slot}" style="${style};background-image:url(${u});background-position:center;background-size:contain;background-repeat:no-repeat"></div>` : `<div class="a ph" data-slot="${slot}" style="${style};color:${HL.burg}">${esc(ph)}</div>`; };

// ---------- the book, read once: who is inside, which artists are in print ----------
const bkCase = t => { t = String(t || '').trim(); return t && t === t.toUpperCase() && /\p{Lu}{3}/u.test(t) ? t.charAt(0) + t.slice(1).toLowerCase() : t; };   // "THE SUMMER WE REMEMBER" → "The summer we remember"
const BK_MED = /oil|acrylic|watercolou?r|gouache|mixed media|digital|photograph|sculpt|ceramic|bronze|charcoal|pastel|graphite|pencil|ink\b|textile|fib(er|re)|collage|print|resin|clay|glass|wood|enamel|tempera|spray|embroider/i;
// what the artists' own entries say about the book: the main mediums, the years, the countries
function bkFacts(W){ const cnt = {}; const key = m => { m = m.toLowerCase(); return /oil/.test(m) ? 'paint in oil' : /acrylic/.test(m) ? 'paint in acrylic' : /watercolou?r|gouache/.test(m) ? 'work in watercolour' : /mixed|collage/.test(m) ? 'work in mixed media' : /digital/.test(m) ? 'make digital art' : /photo/.test(m) ? 'are photographers' : /sculpt|bronze|ceramic|clay|resin|glass|wood/.test(m) ? 'make sculpture and objects' : /textile|fib|embroider/.test(m) ? 'work in textile' : /charcoal|pastel|graphite|pencil|ink/.test(m) ? 'draw' : /print/.test(m) ? 'make prints' : ''; };
  W.forEach(w => { const k = key(w.medium || ''); if (k) cnt[k] = (cnt[k] || 0) + 1; });
  const rows = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => [String(v), k]);
  const yrs = W.map(w => w.year).filter(Boolean); const recent = yrs.filter(y => y >= new Date().getFullYear() - 1).length;
  if (recent > W.length * .4 && rows.length < 4) rows.push([String(recent), 'works made this year or last']);
  const places = new Set(W.map(w => w.place.trim().toLowerCase()).filter(Boolean)); if (places.size > 4) rows.unshift([String(places.size), 'countries']);
  return rows.slice(0, 4); }
const BK_FEAT = 10;   // artists per feature carousel
const bkRoleOf = r => { r = String(r || '').toLowerCase(); return /curat|juror/.test(r) ? 'curator' : /cover/.test(r) ? 'cover' : /invited/.test(r) ? 'invited' : /award/.test(r) ? 'award' : /writer|article/.test(r) ? 'writer' : 'interview'; };
function bkData(b){
  if (b._d && b._d.n === (b.artists || []).length) return b._d;
  const all = (b.artists || []).filter(a => a.name).map(a => ({...a, name: bkName(a.name), handle: bkHandle(a.handle)}));
  const checked = !!b.verify; const inPrint = checked ? all.filter(a => a.print && a.print.page) : all;
  inPrint.sort((x, y) => ((x.print || {}).page || 9999) - ((y.print || {}).page || 9999));
  const missing = checked ? all.filter(a => !(a.print && a.print.page)) : [];
  const works = inPrint.map(a => { const det = ((a.works || [])[0] || {}).details || ''; const med = det.split(/\s*,\s*/).find(x => BK_MED.test(x)) || ''; const yr = (det.match(/\b(19[5-9]\d|20[0-3]\d)\b/) || [])[0];
    const bw = bkWork(a); return {...bw, details: det, bio: a.bio || '', line: a.line || '', img: bkSize(bw.img, 1600), face: bkSize(bkImg(a.headshot), 600), medium: med.replace(/\s+/g, ' ').trim(), year: yr ? +yr : null, place: a.place || '', page: a.print && a.print.page, titleOk: !(a.print && a.print.title === false)}; });
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

// ---------- the book's keyword: one word people comment to get a look inside (set the same word in ManyChat) ----------
const BK_STOP = /^(the|a|an|of|and|for|in|on|to|we|our|my|your|book|big|art|arts|artist|artists|edition|ed|magazine|mag|ath|vol|volume|issue|emerging|rise|top|best|new|\d+)$/i;
function bkKeyword(b){ let o = ''; try { o = localStorage.getItem('bkkw:' + b.name) || ''; } catch {} if (o) return o.toUpperCase();
  if (b.keyword) return String(b.keyword).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const th = (b.inside && b.inside.theme && b.inside.theme.title) || ''; const pick = t => String(t).split(/[^A-Za-z]+/).find(w => w.length > 3 && !BK_STOP.test(w));
  return (pick(th) || pick(String(b.name).replace(/edition.*$/i, '')) || 'BOOK').toUpperCase(); }
const bkMany = n => n >= 1000 ? 'thousands of artists' : 'hundreds of artists';   // never the exact number

// ---------- frames made from the book's own pictures ----------
Object.assign(BKT, {
  // a photograph of the book (photoshoot, scene or spread mockup), full bleed, a short line over it
  photo(o){ const u = bkPic(o.slot, o.img); return {bg: HL.ink, html: `${u ? `<div class="a img" data-slot="${o.slot}" style="inset:0;background-image:url(${u});background-size:cover;background-position:center"></div>` : `<div class="a ph" data-slot="${o.slot}" style="inset:0;color:${HL.pink};background:${HL.burg}">Drop a photoshoot or mockup picture here</div>`}
    ${o.head || o.label ? `<div class="a" style="inset:0;background:rgba(28,19,16,.28)"></div>` : ''}
    <p class="a cn" style="left:52px;top:48px;color:${HL.white}">Arts to Hearts Project</p>${o.mono ? ivMono('white', 'right:52px;top:40px;width:96px;height:54px') : ''}
    ${o.head || o.label ? `<div class="a" style="left:64px;right:64px;bottom:84px;display:flex;flex-direction:column;gap:20px;color:${HL.white}">${bkLabel(o.label, HL.white)}
      ${o.serif ? `<p style="${BASK};font-style:italic;font-size:54px;line-height:1.15">${esc(o.serif)}</p>` : ''}
      ${o.head ? `<p style="${T_MED};font-size:${o.head.length > 40 ? 70 : 92}px;line-height:.98;letter-spacing:-.035em;max-width:900px">${esc(o.head)}</p>` : ''}
      ${o.sub ? `<p style="${T_REG};font-size:32px;line-height:1.35;max-width:840px">${esc(o.sub)}</p>` : ''}</div>` : ''}`}; },
  // a real page of the book, whole, as it was printed, with whose page it is
  page(o){ const w = o.w || {}; const u = bkPic(o.slot, o.img); return {bg: o.bg || HL.pink, html: `${hlBrand(HL.burg)}
    ${u ? `<div class="a img" data-slot="${o.slot}" style="left:150px;right:150px;top:110px;height:960px;background-image:url(${u});background-size:contain;background-repeat:no-repeat;background-position:center;filter:drop-shadow(0 18px 30px rgba(28,19,16,.22))"></div>` : `<div class="a ph" data-slot="${o.slot}" style="left:150px;right:150px;top:110px;height:960px;color:${HL.burg}">The printed page</div>`}
    ${w.face ? `<div class="a" style="left:72px;top:1118px;width:120px;height:120px;border-radius:50%;background:url(${w.face}) center 28%/cover"></div>` : ''}
    <div class="a" style="left:${w.face ? 216 : 72}px;right:72px;top:1122px;display:flex;flex-direction:column;gap:6px">
      <p style="${T_MED};font-size:40px;line-height:1.1;color:${HL.ink}">${esc(o.title || w.artist || '')}</p>
      <p style="${T_REG};font-size:28px;color:${HL.burg}">${esc(o.sub || [w.handle, o.pageNo ? 'Page ' + o.pageNo : ''].filter(Boolean).join(' · '))}</p></div>`}; },
  // two facing pages, like the book lying open
  spread(o){ const one = (u, x, k) => u ? `<div class="a img" data-slot="${o.slot}${k}" style="left:${x}px;top:250px;width:470px;height:660px;background-image:url(${bkPic(o.slot + k, u)});background-size:contain;background-repeat:no-repeat;background-position:${k === 'l' ? 'right' : 'left'} center"></div>` : '';
    return {bg: HL.pink, html: `${hlBrand(HL.burg)}<div class="a" style="left:60px;right:60px;top:230px;height:700px;background:${HL.white};border-radius:6px;box-shadow:0 24px 50px rgba(28,19,16,.18)"></div>${one(o.l, 70, 'l')}${one(o.r, 540, 'r')}
      <div class="a" style="left:540px;top:230px;width:1px;height:700px;background:rgba(28,19,16,.12)"></div>
      <div class="a" style="left:80px;right:80px;top:1000px;display:flex;flex-direction:column;gap:10px">
        ${o.head ? `<p style="${T_MED};font-size:48px;line-height:1.08;letter-spacing:-.02em;color:${HL.ink}">${esc(o.head)}</p>` : ''}
        ${o.sub ? `<p style="${BASK};font-size:30px;line-height:1.4;color:${HL.ink}">${esc(o.sub)}</p>` : ''}</div>`}; },
  // the comment ask: what they get for the keyword
  ask(o){ return {bg: HL.burg, html: `${ivMono('peony', 'left:430px;width:220px;top:150px;height:124px')}
    <div class="a" style="left:90px;right:90px;top:330px;bottom:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <p style="${BASK};font-size:50px;line-height:1.26;color:${HL.white}">${esc(o.head)}</p>
      <p style="${T_REG};font-size:32px;color:${HL.pink};margin-top:48px">Comment</p>
      <p style="${T_MED};font-size:${o.key.length > 8 ? 120 : 150}px;line-height:1;letter-spacing:-.04em;color:${HL.rose};margin-top:12px">${esc(o.key)}</p>
      <p style="${T_REG};font-size:32px;line-height:1.4;color:${HL.pink};margin-top:28px">${esc(o.sub)}</p></div>
    <p class="a c" style="left:0;right:0;bottom:96px;${T_REG};font-size:28px;color:${HL.pink}">artstoheartsproject.com</p>`}; },
});

// the book's proper name: "ATH Magazine 14" is "Arts to Hearts Magazine, Issue 14"
const bkTitleCase = t => String(t || '').toLowerCase().replace(/(^|\s)(\p{L})/gu, (m, a, c) => a + c.toUpperCase()).replace(/\s(A|An|And|The|Of|In|On|To|For|At|By)(?=\s)/g, m => m.toLowerCase());
const bkProper = b => { const m = String(b.name || '').match(/^ATH Magazine\s*(\d+)/i); return m ? `Arts to Hearts Magazine, Issue ${m[1]}` : bkShort(b.name); };
Object.assign(BKT, {
  // the selected names, set like a printed list: two columns, name then handle, nothing else
  roll(o){ const half = Math.ceil(o.list.length / 2); const col = l => l.map(a => `<div style="break-inside:avoid"><p style="${T_MED};font-size:${o.sz}px;line-height:1.18;color:${HL.ink}">${esc(a.name)}</p>${a.handle ? `<p style="${T_REG};font-size:${Math.round(o.sz * .72)}px;line-height:1.3;color:${HL.burg}">${esc(a.handle)}</p>` : ''}</div>`).join('');
    return {bg: HL.white, html: `${hlBrand()}<p class="a" style="left:80px;top:118px;${BASK};font-style:italic;font-size:34px;color:${HL.burg}">${esc(o.head)}</p>
      <div class="a" style="left:80px;right:80px;top:200px;bottom:80px;display:grid;grid-template-columns:1fr 1fr;gap:0 56px;align-content:start"><div style="display:flex;flex-direction:column;gap:${o.gap}px">${col(o.list.slice(0, half))}</div><div style="display:flex;flex-direction:column;gap:${o.gap}px">${col(o.list.slice(half))}</div></div>`}; },
  // four selected works, each whole on white, credited under it
  works(o){ const cell = (w, i) => { const x = 60 + (i % 2) * 495, y = 110 + Math.floor(i / 2) * 610;
      return `${ivArt(bkPic(o.slot + i, w.img), `left:${x}px;top:${y}px;width:465px;height:500px`, o.slot + i)}
        <div class="a" style="left:${x}px;top:${y + 512}px;width:465px"><p style="${T_MED};font-size:24px;line-height:1.2;color:${HL.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(w.artist)}</p><p style="${BASK};font-style:italic;font-size:21px;color:${HL.soft};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(w.title || '')}</p></div>`; };
    return {bg: HL.white, html: `${hlBrand()}${o.list.slice(0, 4).map(cell).join('')}`}; },
  // a sentence on Burgundy, set large: the moment of the post
  moment(o){ return {bg: HL.burg, html: `<p class="a cn" style="left:52px;top:48px;color:${HL.white}">Arts to Hearts Project</p>
    <div class="a" style="left:90px;right:90px;top:180px;bottom:180px;display:flex;flex-direction:column;justify-content:center;gap:40px">
      ${o.label ? bkLabel(o.label, HL.pink) : ''}
      <p style="${BASK};font-size:${o.text.length > 120 ? 54 : 66}px;line-height:1.22;color:${HL.white}">${esc(o.text)}</p>
      ${o.sub ? `<p style="${T_REG};font-size:32px;line-height:1.45;color:${HL.pink}">${esc(o.sub)}</p>` : ''}</div>`}; },
});

// ---------- the editorial set: calm, generous, one thing per slide ----------
// 96px margins, few sizes, no highlights. Tracked caps only for small labels. Artworks whole on white.
const bkCaps = (t, c, sz) => `<p style="${T_MED};font-size:${sz || 22}px;letter-spacing:.22em;text-transform:uppercase;color:${c}">${esc(t)}</p>`;
const bkIssue = b => { const m = String(b.name || '').match(/^ATH Magazine\s*(\d+)/i); return m ? {title: 'Arts to Hearts Magazine', issue: 'Issue ' + m[1], no: m[1]} : {title: bkShort(b.name), issue: '', no: ''}; };
Object.assign(BKT, {
  // cover: the publication, the issue set large, the theme; Burgundy, nothing else
  issueCover(o){ return {bg: HL.burg, html: `<p class="a cn" style="left:52px;top:48px;color:${HL.white}">Arts to Hearts Project</p>${ivMono('white', 'right:52px;top:40px;width:96px;height:54px')}
    <div class="a" style="left:96px;right:96px;top:200px;bottom:150px;display:flex;flex-direction:column;justify-content:space-between">
      ${bkCaps(o.kicker, HL.pink)}
      <div>
        <p style="${BASK};font-style:italic;font-size:52px;line-height:1.2;color:${HL.white}">${esc(o.title)}</p>
        ${o.no ? `<p style="${T_MED};font-size:300px;line-height:.86;letter-spacing:-.05em;color:${HL.white};margin-top:24px">${esc(o.no)}</p>` : ''}
        ${o.theme ? `<p style="${BASK};font-style:italic;font-size:46px;line-height:1.25;color:${HL.pink};margin-top:40px">${esc(o.theme)}</p>` : ''}</div>
      <div style="width:120px;border-top:2px solid ${HL.rose}"></div></div>`}; },
  // a page of words on white
  read(o){ const t = String(o.body || ''); const sz = t.length > 420 ? 36 : t.length > 300 ? 40 : t.length > 180 ? 46 : 54;
    return {bg: o.burg ? HL.burg : HL.white, html: `<p class="a cn" style="left:52px;top:48px;color:${o.burg ? HL.white : HL.ink}">Arts to Hearts Project</p>
    <div class="a" style="left:96px;right:96px;top:170px;bottom:150px;display:flex;flex-direction:column;justify-content:center;gap:44px">
      ${o.label ? bkCaps(o.label, o.burg ? HL.pink : HL.burg) : ''}
      <p style="${BASK};font-size:${sz}px;line-height:1.48;color:${o.burg ? HL.white : HL.ink}">${esc(t)}</p></div>`}; },
  // one artwork, whole, as large as the page allows; the artist and title beneath
  single(o){ const w = o.w; return {bg: HL.white, html: `<p class="a cn" style="left:52px;top:48px;color:${HL.ink}">Arts to Hearts Project</p>
    ${ivArt(bkPic(o.slot, w.img), 'left:96px;right:96px;top:130px;height:1000px', o.slot)}
    <div class="a" style="left:96px;right:96px;top:1172px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px">
      <p style="${T_MED};font-size:30px;letter-spacing:-.005em;color:${HL.ink}">${esc(w.artist)}</p>
      ${w.title ? `<p style="${BASK};font-style:italic;font-size:24px;color:${HL.soft}">${esc(w.title)}</p>` : ''}</div>`}; },
  // the names, as a printed roll: a heading, a hairline, two calm columns
  roll2(o){ const half = Math.ceil(o.list.length / 2); const col = l => l.map(a => `<div><p style="${T_MED};font-size:32px;line-height:1.2;color:${HL.ink}">${esc(a.name)}</p>${a.handle ? `<p style="${T_REG};font-size:21px;line-height:1.45;letter-spacing:.01em;color:${HL.burg}">${esc(a.handle)}</p>` : ''}</div>`).join('');
    return {bg: HL.white, html: `<p class="a cn" style="left:52px;top:48px;color:${HL.ink}">Arts to Hearts Project</p>
    <div class="a" style="left:96px;right:96px;top:150px">${bkCaps(o.head, HL.burg, 20)}<div style="border-top:1px solid rgba(28,19,16,.18);margin-top:26px"></div></div>
    <div class="a" style="left:96px;right:96px;top:240px;bottom:96px;display:grid;grid-template-columns:1fr 1fr;gap:0 64px;align-content:start">
      <div style="display:flex;flex-direction:column;gap:30px">${col(o.list.slice(0, half))}</div><div style="display:flex;flex-direction:column;gap:30px">${col(o.list.slice(half))}</div></div>`}; },
  // end card: the monogram top centre, one sentence, one action
  close(o){ return {bg: HL.burg, html: `${ivMono('peony', 'left:430px;width:220px;top:150px;height:124px')}
    <div class="a" style="left:110px;right:110px;top:360px;bottom:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:44px">
      <p style="${BASK};font-size:58px;line-height:1.25;color:${HL.white}">${esc(o.head)}</p>
      <div style="width:120px;border-top:2px solid ${HL.rose}"></div>
      <p style="${T_REG};font-size:32px;line-height:1.45;color:${HL.pink}">${esc(o.sub)}</p></div>
    <p class="a c" style="left:0;right:0;bottom:96px;${T_REG};font-size:26px;letter-spacing:.04em;color:${HL.pink}">artstoheartsproject.com</p>`}; },
});

// ---------- the agreed look (Nov 2026): magazine cover, monograph plates, gallery frames, full-bleed portraits, a quiet credits page ----------
// Premium rules: artworks whole on full white pages with generous space; credits in a scale of greys; no split half-image pages.
const BKNAT = {};   // natural sizes of the pictures, so frames hug the work and credits sit right under it
function bkNat(u){ if (!u) return null; if (BKNAT[u] !== undefined) return BKNAT[u]; BKNAT[u] = null; const im = new Image();
  im.onload = () => { BKNAT[u] = {w: im.naturalWidth, h: im.naturalHeight}; clearTimeout(bkNat.t); bkNat.t = setTimeout(() => { if (typeof BOOKVIEW !== 'undefined' && BOOKVIEW) render(); }, 120); }; im.src = u; return null; }
// fit a picture of size n into a box, keeping its shape
const bkFitBox = (n, W, H) => { if (!n) return {w: W, h: H}; const r = Math.min(W / n.w, H / n.h); return {w: Math.round(n.w * r), h: Math.round(n.h * r)}; };
const BKG1 = 'rgba(28,19,16,.56)', BKG2 = 'rgba(28,19,16,.4)';   // the credit greys: title, then medium
const bkCredit = (w, align) => `<div style="display:flex;flex-direction:column;gap:6px;${align === 'c' ? 'align-items:center;text-align:center' : ''}">
    <p style="${T_MED};font-size:27px;letter-spacing:-.005em;color:${HL.ink}">${esc(w.artist)}</p>
    ${w.title ? `<p style="${BASK};font-style:italic;font-size:22px;color:${BKG1}">${esc(w.title)}</p>` : ''}
    ${w.medium || w.year ? `<p style="${T_REG};font-size:17px;letter-spacing:.02em;color:${BKG2}">${esc([w.medium, w.year].filter(Boolean).join(', '))}</p>` : ''}</div>`;
Object.assign(BKT, {
  // cover: one artwork full bleed (the only crop allowed), the masthead, the issue, the line
  masthead(o){ const u = bkPic(o.slot, o.img); return {bg: HL.ink, html: `${u ? `<div class="a img" data-slot="${o.slot}" style="inset:0;background-image:url(${u});background-size:cover;background-position:center"></div>` : `<div class="a" style="inset:0;background:${HL.burg}"></div>`}
    <div class="a" style="inset:0;background:rgba(28,19,16,.2)"></div>
    <p class="a" style="left:0;right:0;top:66px;text-align:center;${T_MED};font-size:112px;line-height:1;letter-spacing:-.035em;color:${HL.white}">ARTS TO HEARTS</p>
    <p class="a" style="left:0;right:0;top:204px;text-align:center;${T_MED};font-size:19px;letter-spacing:.22em;text-transform:uppercase;color:${HL.white}">${esc(o.line)}</p>
    <div class="a" style="left:72px;right:72px;bottom:96px;color:${HL.white}"><p style="${BASK};font-style:italic;font-size:52px;line-height:1">${esc(o.kicker)}</p><p style="${T_MED};font-size:128px;line-height:.92;letter-spacing:-.04em;margin-top:16px">${o.big.map(esc).join('<br>')}</p></div>`}; },
  // a plate: the artwork whole, large, on a full white page; the credit beneath in greys
  plate(o){ const w = o.w, u = bkPic(o.slot, w.img); const b = bkFitBox(bkNat(u), 860, 940); const left = Math.round((1080 - b.w) / 2), top = Math.round(150 + (940 - b.h) * .55);
    return {bg: HL.white, html: `<p class="a cn" style="left:52px;top:48px;color:${HL.ink}">Arts to Hearts Project</p>
    ${ivArt(u, `left:${left}px;top:${top}px;width:${b.w}px;height:${b.h}px`, o.slot)}
    <div class="a" style="left:${left}px;width:${Math.max(b.w, 420)}px;top:${top + b.h + 34}px">${bkCredit(w)}</div>`}; },
  // a framed work on a white wall with its wall label
  framed(o){ const w = o.w, u = bkPic(o.slot, w.img); const b = bkFitBox(bkNat(u), 700, 820); const left = Math.round((1080 - b.w - 48) / 2), top = Math.round(150 + (820 - b.h) * .5);
    return {bg: HL.white, html: `<p class="a cn" style="left:52px;top:48px;color:${HL.ink}">Arts to Hearts Project</p>
    <div class="a" style="left:${left}px;top:${top}px;width:${b.w + 48}px;height:${b.h + 48}px;background:${HL.white};padding:24px;box-shadow:0 30px 60px rgba(28,19,16,.2),0 2px 6px rgba(28,19,16,.1);border:1px solid rgba(28,19,16,.07)">
      <div class="img" data-slot="${o.slot}" style="width:100%;height:100%;background-image:url(${u});background-size:contain;background-repeat:no-repeat;background-position:center"></div></div>
    <div class="a" style="right:${Math.max(96, 1080 - left - b.w - 48 - 40)}px;top:${Math.min(1100, top + b.h + 48 + 40)}px;width:420px;background:${HL.white};border:1px solid rgba(28,19,16,.12);padding:24px 28px">${bkCredit(w)}</div>`}; },
  // the artist, full bleed, their name set large
  face(o){ const nm = String(o.name || ''); const sp = nm.lastIndexOf(' '); const lines = sp > 0 ? [nm.slice(0, sp), nm.slice(sp + 1)] : [nm]; const fs = bkFit(lines.join('\n'), 940, 150, .52);
    return {bg: HL.ink, html: `${bkPhoto(o.slot, o.face, 'inset:0', 'center 25%')}<div class="a" style="inset:0;background:rgba(28,19,16,.22)"></div>
    <p class="a cn" style="left:52px;top:48px;color:${HL.white}">Arts to Hearts Project</p>
    <div class="a" style="left:64px;right:64px;bottom:92px;color:${HL.white}">${bkCaps(o.label, HL.white, 19)}
      <p style="${T_MED};font-size:${fs}px;line-height:.9;letter-spacing:-.045em;margin-top:22px">${lines.map(esc).join('<br>')}</p>
      ${o.handle ? `<p style="${T_REG};font-size:28px;margin-top:22px;color:rgba(255,255,255,.85)">${esc(o.handle)}</p>` : ''}</div>`}; },
  // credits page: every name, quiet, three columns
  credits(o){ const n = o.list.length, nc = n > 24 ? 3 : 2; const per = Math.ceil(n / nc); const cols = Array.from({length: nc}, (_, k) => o.list.slice(k * per, (k + 1) * per));
    const fs = n > 54 ? 21 : n > 40 ? 23 : n > 24 ? 25 : n > 12 ? 30 : 34, lh = n > 54 ? 1.62 : n > 40 ? 1.78 : 2;
    return {bg: HL.white, html: `<p class="a cn" style="left:52px;top:48px;color:${HL.ink}">Arts to Hearts Project</p>
    <p class="a" style="left:96px;top:150px;${BASK};font-style:italic;font-size:64px;color:${HL.ink}">${esc(o.head)}</p>
    ${o.intro ? `<p class="a" style="left:96px;right:150px;top:252px;${BASK};font-size:28px;line-height:1.5;color:${BKG1}">${esc(o.intro)}</p>` : ''}
    <div class="a" style="left:96px;right:96px;top:${o.intro ? 380 : 262}px;border-top:1px solid rgba(28,19,16,.25)"></div>
    <div class="a" style="left:96px;right:96px;top:${o.intro ? 418 : 300}px;display:grid;grid-template-columns:repeat(${nc},1fr);gap:0 30px">${cols.map(c => `<div>${c.map(x => `<p style="${T_REG};font-size:${fs}px;line-height:${lh};color:${HL.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x)}</p>`).join('')}</div>`).join('')}</div>
    <p class="a" style="left:96px;bottom:84px;${T_MED};font-size:16px;letter-spacing:.22em;text-transform:uppercase;color:${BKG2}">${esc(o.foot)}</p>`}; },
});

// The selected artists, announced with care: the call, the jury, the artists, a kind word to everyone who applied, what comes next.
// No book imagery (the book doesn't exist yet), no numbers.
// ---------- facts about the selection, from the artists' own words (never guessed from names) ----------
const BK_COUNTRIES = 'Afghanistan Albania Algeria Argentina Armenia Australia Austria Azerbaijan Bangladesh Belarus Belgium Bolivia Bosnia Brazil Bulgaria Cambodia Cameroon Canada Chile China Colombia Croatia Cuba Cyprus Czechia Denmark Ecuador Egypt Estonia Ethiopia Finland France Georgia Germany Ghana Greece Guatemala Hungary Iceland India Indonesia Iran Iraq Ireland Israel Italy Jamaica Japan Jordan Kazakhstan Kenya Korea Latvia Lebanon Lithuania Luxembourg Malaysia Malta Mexico Moldova Mongolia Morocco Nepal Netherlands Nigeria Norway Pakistan Palestine Peru Philippines Poland Portugal Qatar Romania Russia Rwanda Serbia Singapore Slovakia Slovenia Spain Sweden Switzerland Syria Taiwan Thailand Tunisia Turkey Uganda Ukraine Uruguay Venezuela Vietnam Zimbabwe Senegal'.split(' ');
const BK_ALIAS = [[/united states|u\.?s\.?a\b|\busa?\b|america(?!n)|alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|wisconsin|wyoming|las vegas|san diego|boston/i, 'United States'],
  [/united kingdom|\buk\b|england|scotland|wales|london|britain|british/i, 'United Kingdom'], [/south korea|korean/i, 'Korea'], [/méxico|mexican|mexico city/i, 'Mexico'], [/indian\b/i, 'India'], [/polish/i, 'Poland'], [/romanian/i, 'Romania'],
  [/ukrainian/i, 'Ukraine'], [/iranian/i, 'Iran'], [/french|paris/i, 'France'], [/cuban/i, 'Cuba'], [/senegalese/i, 'Senegal'], [/greek/i, 'Greece'], [/italian/i, 'Italy'], [/chinese|shenzhen/i, 'China'], [/bratislava|slovak/i, 'Slovakia'],
  [/dutch|the netherlands|utrecht/i, 'Netherlands'], [/toronto|quebec|ontario/i, 'Canada'], [/dublin|irish/i, 'Ireland'], [/turkish/i, 'Turkey'], [/russian/i, 'Russia'], [/german\b/i, 'Germany'], [/spanish/i, 'Spain'], [/japanese/i, 'Japan'], [/brazilian/i, 'Brazil'], [/nigerian/i, 'Nigeria']];
function bkCountries(text){ const t = String(text || ''); const out = new Set(); if (/\bgeorgia\b/i.test(t) && /atlanta|usa|united states/i.test(t)) out.add('United States');
  BK_ALIAS.forEach(([re, c]) => { if (re.test(t)) out.add(c); }); BK_COUNTRIES.forEach(c => { if (c !== 'Georgia' && new RegExp('\\b' + c + '\\b', 'i').test(t)) out.add(c); }); return [...out]; }
const bkPronoun = bio => { const t = ' ' + String(bio || '').toLowerCase() + ' '; const she = (t.match(/\b(she|her|hers|herself)\b/g) || []).length, he = (t.match(/\b(he|his|him|himself)\b/g) || []).length; return she > he ? 'she' : he > she ? 'he' : ''; };
const bkRound = n => n >= 50 ? Math.floor(n / 10) * 10 + '+' : n >= 10 ? Math.floor(n / 5) * 5 + '+' : String(n);
function bkSelection(D){
  const W = D.works; const all = W.map(w => w.line + ' ' + (w.medium || '')); const C = new Set(); W.forEach(w => bkCountries(w.line + ' ' + (w.bio || '')).forEach(c => C.add(c)));
  const count = re => all.filter(t => re.test(t)).length; const she = W.filter(w => bkPronoun(w.bio) === 'she').length, known = W.filter(w => bkPronoun(w.bio)).length;
  const rows = [];
  const painters = count(/paint|oil|acrylic|watercolou?r|gouache/i); if (painters >= 5) rows.push([bkRound(painters), 'painters, in oil, acrylic and watercolour']);
  const the = c => /^(United|Netherlands|Philippines)/.test(c) ? 'the ' + c : c; if (C.size >= 5) { const l = [...C].slice(0, 4).map(the); rows.push([bkRound(C.size), `countries, including ${l.slice(0, -1).join(', ')} and ${l[l.length - 1]}`]); }
  if (known >= W.length * .6 && she / known >= .5) rows.push([Math.floor(she / known * 10) * 10 + '%', 'of the artists are women']);
  const mixed = count(/mixed|collage/i); if (mixed >= 5) rows.push([bkRound(mixed), 'working in mixed media and collage']);
  const other = count(/sculpt|textile|photograph|digital|print|install/i); if (other >= 5 && rows.length < 4) rows.push([bkRound(other), 'in sculpture, textile, photography, print and digital']);
  return {rows: rows.slice(0, 4), countries: [...C], n: W.length, painters, mixed, she, known};
}
// names that must never break across lines
const bkKeep = t => String(t || '').replace(/-\s*\n\s*/g, '-').replace(/(\w)\(/g, '$1 (').replace(/\s+/g, ' ').trim().replace(/Arts to Hearts/g, 'Arts to Hearts').replace(/United (States|Kingdom)/g, 'United $1').replace(/Magazine, Issue (\d+)/g, 'Magazine, Issue $1').replace(/Issue (\d+)/g, 'Issue $1').replace(/ to (the )?(?=[A-Z])/g, (m, t) => ' to\u00a0' + (t ? 'the\u00a0' : ''));
const bkWhole = h => h.replace(/([\p{L}\d]+(?:[-‑][\p{L}\d]+)+)/gu, '<span style="white-space:nowrap">$1</span>');   // hyphenated words never split across lines
const bkFirst = t => { const m = String(t || '').match(/^[^.!?]+[.!?]+/); return m ? m[0].trim() : String(t || '').trim(); };

// ---------- the house style, shared with the interviews, the Heart List and the editorials ----------
Object.assign(BKT, {
  // cover, as the interview cover: the work full bleed, a label, a large white headline, the arrow
  hcover(o){ const h = bkKeep(o.head), sz = h.length > 60 ? 74 : h.length > 44 ? 86 : 100; const u = bkPic(o.slot, o.img);
    return {bg: B.ink, html: `${ivArt(u, 'inset:0', o.slot, 'cover')}<div class="a" style="inset:0;background:rgba(20,9,12,.34)"></div>${ivCorners({mono: true}, '#FFFFFF', B.burg)}
      <div class="a" style="left:72px;right:72px;bottom:140px;display:flex;flex-direction:column;gap:22px">
        <p class="cn" style="color:#FFFFFF">${esc(o.label)}</p>
        <p style="${T_MED};font-size:${sz}px;line-height:.98;letter-spacing:-.035em;color:#FFFFFF">${esc(h)}</p>
        ${o.sub ? `<p style="${T_REG};font-size:30px;color:#FFFFFF;margin-top:8px">${esc(bkKeep(o.sub))}</p>` : ''}</div>`}; },
  // words, as the Heart List: Baskerville in Burgundy, the first sentence in Pink
  htext(o){ const t = bkKeep(o.text); let first = bkFirst(t), rest = t.slice(first.length).trim();
    if (!rest) { const w = first.split(' '); const k = w.findIndex((x, i) => i >= 4 && i <= w.length * .6 && /,$/.test(x)); const cut = k > 0 ? k + 1 : Math.max(4, Math.ceil(w.length * .45)); rest = w.slice(cut).join(' '); first = w.slice(0, cut).join(' '); }   /* one sentence: only its opening is highlighted */ const n = t.length; const sz = n > 380 ? 44 : n > 260 ? 50 : n > 160 ? 56 : 64;
    return {bg: B.ground, html: `${ivCorners({})}
      ${o.label ? `<p class="a cn" style="left:72px;top:170px;color:${B.burg}">${esc(o.label)}</p>` : ''}
      <div class="a" style="left:72px;right:72px;top:${o.label ? 230 : 200}px;bottom:200px"><p style="${BASK};font-size:${sz}px;line-height:1.3;color:${B.burg}">${mark(bkWhole(esc(first)))}${rest ? ' ' + bkWhole(esc(rest)) : ''}</p></div>
      ${o.by ? `<p class="a" style="left:72px;right:72px;top:1130px;${T_MED};font-size:30px;color:${B.burg}">${esc(o.by)}${o.handle ? ` <span style="${T_REG}">${esc(o.handle)}</span>` : ''}</p>` : ''}`}; },
  // the selection in rounded numbers, as the interview's list page
  tally(o){ return {bg: B.ground, html: `${ivCorners({})}
    <p class="a cn" style="left:72px;top:170px;color:${B.burg}">${esc(o.label)}</p>
    <div class="a" style="left:72px;right:72px;top:236px">${o.rows.map(r => `<div style="display:flex;align-items:baseline;gap:34px;padding:34px 0;border-top:1px solid ${B.rule}"><p style="${T_MED};font-size:${r[0].length > 4 ? 84 : 104}px;line-height:.9;letter-spacing:-.04em;color:${B.ink};min-width:250px">${esc(r[0])}</p><p style="${BASK};font-size:38px;line-height:1.3;color:${B.ink}">${esc(r[1])}</p></div>`).join('')}</div>`}; },
  // the artist, full bleed, as the interview cover
  hface(o){ const u = bkPic(o.slot, o.face); return {bg: B.ink, html: `${u ? `<div class="a img" data-slot="${o.slot}" style="inset:0;background-image:url(${u});background-size:cover;background-position:center 25%"></div>` : `<div class="a ph" data-slot="${o.slot}" style="inset:0;color:#FAD2E1;background:${B.burg}">Drop their photo here</div>`}<div class="a" style="inset:0;background:rgba(20,9,12,.28)"></div>${ivCorners({}, '#FFFFFF', B.burg)}
    <div class="a" style="left:72px;right:72px;bottom:140px;display:flex;flex-direction:column;gap:20px"><p class="cn" style="color:#FFFFFF">${esc(o.label)}</p>
      <p style="${T_MED};font-size:${o.name.length > 18 ? 96 : 120}px;line-height:.92;letter-spacing:-.04em;color:#FFFFFF">${esc(o.name)}</p>
      ${o.line ? `<p style="${T_REG};font-size:30px;line-height:1.35;color:#FFFFFF;max-width:860px">${esc(o.line)}</p>` : ''}</div>`}; },
  // end card, as the editorial and Heart List: one keyword, one action
  keyEnd(o){ return {bg: B.burg, html: `${ivMono('peony', 'left:430px;width:220px;top:150px;height:124px')}
    <div class="a" style="left:80px;right:80px;top:330px;bottom:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <p style="${BASK};font-size:48px;line-height:1.28;color:#FFFFFF">${esc(bkKeep(o.head))}</p>
      <p style="${T_MED};font-size:${o.key.length > 8 ? 120 : 150}px;line-height:1;letter-spacing:-.04em;color:${HL.rose};margin-top:48px;display:flex;align-items:center">${arrowDot(HL.rose, HL.burg, 112)}${esc(o.key)}</p>
      <p style="${T_REG};font-size:34px;line-height:1.38;color:${HL.pink};margin-top:40px">${esc(o.offer)}</p>
      ${o.foot ? `<div style="width:240px;border-top:2px solid rgba(250,210,225,.35);margin:52px 0 38px"></div>
      <p style="${T_REG};font-size:30px;line-height:1.4;color:${HL.pink}">${esc(o.foot)}</p>` : ''}</div>
    <p class="a c" style="left:0;right:0;bottom:96px;${T_REG};font-size:28px;color:${HL.pink}">artstoheartsproject.com</p>`}; },
});
const bkCap = w => { const d = String(((w.works || [])[0] || {}).details || w.details || '').split(/\s*,\s*/); const size = d.find(x => /\d\s*(x|×)\s*\d/.test(x)) || ''; return [w.title, w.year || '', size, w.medium || '']; };

// ---------- the tabbed card (from the "Wrapped" reference): the carousel's own chapters as tabs on a white page ----------
const BK_CH = ['The call', 'The artists', "What's next"];
const bkTabRow = on => BK_CH.map((t, i) => { const act = t === on;
  return `<div class="a" style="left:870px;top:${150 + (1060 - (BK_CH.length * 232 - 16)) / 2 + i * 232}px;width:66px;height:216px;border-radius:0 14px 14px 0;background:${act ? HL.white : i % 2 ? HL.rose : HL.pink};display:flex;align-items:center;justify-content:center">
    <p style="${act ? T_MED : T_REG};font-size:19px;letter-spacing:.16em;text-transform:uppercase;color:${HL.burg};writing-mode:vertical-rl;white-space:nowrap">${esc(t)}</p></div>`; }).join('');
const bkB = t => bkWhole(esc(bkKeep(t))).replace(/\*\*(.+?)\*\*/g, (m, x) => x.length < 30 ? `<span style="white-space:nowrap">${mark(x)}</span>` : mark(x));   /* emphasis is the house Pink highlight */   // **words** set heavier, as in the Highlights card
Object.assign(BKT, {
  tabcard(o){ const u = bkPic(o.slot || 'bkbg', o.bg);
    return {bg: HL.burg, html: `${u ? `<div class="a img" data-slot="${o.slot || 'bkbg'}" style="inset:0;background-image:url(${u});background-size:cover;background-position:center"></div><div class="a" style="inset:0;background:rgba(28,19,16,.32)"></div>` : ''}
    <p class="a cn" style="left:52px;top:48px;color:${HL.white}">Arts to Hearts Project</p>${o.mono ? ivMono('white', 'right:52px;top:40px;width:96px;height:54px') : ''}
    <p class="a" style="left:72px;bottom:60px;${T_REG};font-size:24px;color:${HL.white};opacity:.85">@artstoheartsproject</p>
    <div class="a" style="right:72px;bottom:46px;width:56px;height:56px;border-radius:50%;background:${HL.white};display:flex;align-items:center;justify-content:center;${T_MED};font-size:28px;color:${HL.burg}">&rarr;</div>
    ${bkTabRow(o.tab)}
    <div class="a" style="left:150px;top:150px;width:724px;height:1060px;background:${HL.white};border-radius:16px;box-shadow:0 24px 60px rgba(20,9,12,.28)"></div>
    <div class="a" style="left:196px;top:190px;width:632px;height:980px;display:flex;flex-direction:column;align-items:center;justify-content:${o.top ? 'flex-start' : 'center'};text-align:center">
      ${o.kicker ? `<p style="${T_MED};font-size:19px;letter-spacing:.22em;text-transform:uppercase;color:${HL.ink};margin-bottom:26px">${esc(bkKeep(o.kicker))}</p>` : ''}
      ${o.head ? `<p style="${BASK};font-style:italic;font-size:${Math.min(o.headSz || 104, bkFit(o.head.join('\n'), 600, 200, .52))}px;white-space:nowrap;line-height:1.05;letter-spacing:-.01em;color:${HL.ink}">${o.head.map(x => esc(x)).join('<br>')}</p>` : ''}
      ${o.sub ? `<p style="${BASK};font-size:${o.subSz || 32}px;line-height:1.45;color:${HL.ink};margin-top:30px;max-width:580px">${bkB(o.sub)}</p>` : ''}
      ${o.body ? `<div style="text-align:left;width:100%">${o.label ? `<p style="${T_REG};font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:${HL.burg};margin-bottom:24px">${bkDot(HL.burg)}${esc(o.label)}</p>` : ''}<p style="${BASK};font-size:${o.body.length > 300 ? 36 : o.body.length > 200 ? 40 : 46}px;line-height:1.36;color:${HL.burg}">${(() => { const t = bkKeep(o.body), f = bkFirst(t), r = t.slice(f.length).trim(); return mark(bkWhole(esc(f))) + (r ? ' ' + bkWhole(esc(r)) : ''); })()}</p></div>` : ''}
      ${o.prose ? `<div style="margin-top:${o.head ? 44 : 0}px;width:100%;text-align:left;display:flex;flex-direction:column;gap:${o.gap || 30}px">${o.prose.map(l => `<p style="${BASK};font-size:${o.lineSz || 38}px;line-height:1.36;color:${HL.burg}">${bkB(l)}</p>`).join('')}</div>` : ''}
      ${o.lines ? `<div style="margin-top:${o.head ? 44 : 0}px;display:flex;flex-direction:column;gap:${o.gap || 26}px">${o.lines.map(l => `<p style="${BASK};font-size:${o.lineSz || 30}px;line-height:1.38;color:${HL.ink}">${bkB(l)}</p>`).join('')}</div>` : ''}
      ${o.list ? `<div style="margin-top:34px;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:${o.list.length > 30 ? 9 : 14}px 24px;text-align:left">${o.list.map(a => `<p style="font-size:${o.list.length > 30 ? 19 : 22}px;line-height:1.25;color:${HL.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><span style="${T_MED}">${esc(a.name)}</span>${a.place ? ` <span style="${T_REG};color:${BKG2}">${esc(a.place)}</span>` : ''}</p>`).join('')}</div>` : ''}
      ${o.foot ? `<p style="${T_REG};font-size:${o.footSz || 26}px;line-height:1.45;color:${BKG1};margin-top:40px;max-width:560px">${bkB(o.foot)}</p>` : ''}</div>`}; },
  // the project cover: the work full bleed (as the interview cover), the project set largest, so every announcement is told apart
  pcover(o){ const u = bkPic(o.slot, o.img); const t = o.title.map(x => bkKeep(x)); const sz = Math.min(150, bkFit(t.join('\n'), 940, 200, .5));
    return {bg: B.ink, html: `${ivArt(u, 'inset:0', o.slot, 'cover')}<div class="a" style="inset:0;background:rgba(20,9,12,.36)"></div>${ivCorners({mono: true}, '#FFFFFF', B.burg)}
      <div class="a" style="left:72px;right:72px;bottom:140px;display:flex;flex-direction:column;gap:18px">
        <p class="cn" style="color:#FFFFFF">${esc(o.label)}</p>
        ${o.serif ? `<p style="${BASK};font-style:italic;font-size:58px;line-height:1.1;color:#FFFFFF">${esc(o.serif)}</p>` : ''}
        <p style="${T_MED};font-size:${sz}px;line-height:.95;letter-spacing:-.035em;color:#FFFFFF;white-space:nowrap">${t.map(x => /^Issue\b/.test(x) ? `<span style="${BASK};font-style:italic;letter-spacing:-.02em">${esc(x)}</span>` : esc(x)).join('<br>')}</p>
        ${o.sub ? `<p style="${T_REG};font-size:30px;line-height:1.35;color:#FFFFFF;margin-top:10px">${bkWhole(esc(bkKeep(o.sub)))}</p>` : ''}</div>`}; },
  // cover B: the work whole on white (never cropped), the project under it, as the interview's framed cover
  fcover(o){ const u = bkPic(o.slot, o.img); const t = o.title.map(x => bkKeep(x));
    return {bg: B.ground, html: `${ivCorners({mono: true})}${ivArt(u, 'left:72px;right:72px;top:130px;height:600px', o.slot)}
      <div class="a" style="left:72px;right:72px;top:790px;display:flex;flex-direction:column;gap:14px">
        <p class="cn" style="color:${B.burg}">${esc(o.label)}</p>
        <p style="${T_MED};font-size:92px;line-height:.98;letter-spacing:-.035em;color:${B.ink}">${t.map(x => /^Issue\b/.test(x) ? `<span style="${BASK};font-style:italic;letter-spacing:-.02em">${esc(x)}</span>` : esc(x)).join(' ')}</p>
        ${o.sub ? `<p style="${T_REG};font-size:30px;line-height:1.35;color:${B.ink};opacity:.75">${bkWhole(esc(bkKeep(o.sub)))}</p>` : ''}</div>`}; },
  // cover C: Burgundy, type only: the project large in white, the theme in Pink italic
  bcover(o){ const t = o.title.map(x => bkKeep(x)); const sz = Math.min(150, bkFit(t.join('\n'), 936, 200, .5));
    return {bg: HL.burg, html: `${ivMono('white', 'right:52px;top:36px;width:112px;height:63px')}
      <p class="a" style="left:72px;bottom:60px;${T_REG};font-size:24px;color:${HL.pink};opacity:.9">@artstoheartsproject</p>
      <div class="a" style="right:72px;bottom:46px;width:56px;height:56px;border-radius:50%;background:${HL.pink};display:flex;align-items:center;justify-content:center;${T_MED};font-size:28px;color:${HL.burg}">&rarr;</div>
      <div class="a" style="left:72px;right:72px;top:0;bottom:150px;display:flex;flex-direction:column;justify-content:center;gap:24px">
        <p class="cn" style="color:${HL.pink}">${esc(o.label)}</p>
        <p style="${T_MED};font-size:${sz}px;line-height:.95;letter-spacing:-.035em;color:#FFFFFF;white-space:nowrap">${t.map(x => /^Issue\b/.test(x) ? `<span style="${BASK};font-style:italic;letter-spacing:-.02em">${esc(x)}</span>` : esc(x)).join('<br>')}</p>
        ${o.serif ? `<p style="${BASK};font-style:italic;font-size:54px;line-height:1.15;color:${HL.rose};margin-top:12px">${esc(o.serif)}</p>` : ''}
        ${o.sub ? `<p style="${T_REG};font-size:30px;line-height:1.35;color:#FFFFFF;opacity:.85">${bkWhole(esc(bkKeep(o.sub)))}</p>` : ''}</div>`}; },
  // cover: the artwork fills the slide, the white card sits low with the title (same type as the tabbed card)
  acover(o){ const lines = String(o.big).split('\n'); const bs = bkFit(lines.join('\n'), 760, 84, .56);
    return {bg: HL.ink, html: `${bkPhoto(o.slot, o.img, 'inset:0', 'center')}<div class="a" style="inset:0;background:rgba(28,19,16,.12)"></div>
      <p class="a cn" style="left:52px;top:48px;color:${HL.white}">Arts to Hearts Project</p>${ivMono('white', 'right:52px;top:40px;width:96px;height:54px')}
      <div class="a" style="left:80px;right:80px;bottom:80px;background:${HL.white};border-radius:20px;padding:52px 56px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:18px">
        <p style="${BASK};font-style:italic;font-size:52px;line-height:1.1;color:${HL.burg}">${esc(o.serif)}</p>
        <p style="${T_MED};font-size:${bs}px;line-height:.98;letter-spacing:-.035em;color:${HL.ink};white-space:nowrap">${lines.map(esc).join('<br>')}</p>
        ${o.sub ? `<p style="${T_REG};font-size:30px;color:${HL.soft}">${esc(o.sub)}</p>` : ''}</div>`}; },
  // the names, on the house white page: two calm columns, the name in ink, the country in light grey
  names(o){ return {bg: B.ground, html: `${ivCorners({})}
    <p class="a cn" style="left:72px;top:170px;color:${B.burg}">${esc(o.label)}</p>
    <div class="a" style="left:72px;right:72px;top:250px;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:68px;column-gap:40px">${o.list.map(a => `<div style="min-width:0"><p style="${T_MED};font-size:27px;line-height:1.15;color:${B.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(a.name)}</p>${a.place ? `<p style="${T_REG};font-size:18px;line-height:1.3;color:${BKG2};margin-top:4px">${esc(a.place)}</p>` : ''}</div>`).join('')}</div>`}; },
  // the artists' own titles, set as lines: the selection told through the work, nobody singled out
  titles(o){ return {bg: B.ground, html: `${ivCorners({})}
    <p class="a cn" style="left:72px;top:170px;color:${B.burg}">${esc(o.label)}</p>
    <div class="a" style="left:72px;right:72px;top:240px;bottom:330px;display:flex;flex-direction:column;justify-content:center;gap:${o.lines.length > 7 ? 18 : 24}px">${o.lines.map(l => `<p style="${BASK};font-style:italic;font-size:${o.lines.length > 7 ? 54 : 62}px;line-height:1.12;color:${B.burg}">${bkWhole(esc(l))}</p>`).join('')}</div>
    <p class="a" style="left:72px;right:200px;top:1060px;${BASK};font-size:32px;line-height:1.4;color:${B.ink}">${bkB(o.foot)}</p>`}; },
  // the artist (from the Helen Job reference): full bleed, a label, the name large, a few lines about them
  meet(o){ const u = bkPic(o.slot, o.face); return {bg: HL.ink, html: `${u ? `<div class="a img" data-slot="${o.slot}" style="inset:0;background-image:url(${u});background-size:cover;background-position:center 25%"></div>` : `<div class="a ph" data-slot="${o.slot}" style="inset:0;color:${HL.pink};background:${HL.burg}">Drop their photo here</div>`}
    <div class="a" style="inset:0;background:rgba(20,9,12,.3)"></div>
    <div class="a" style="left:64px;right:64px;top:64px;color:${HL.white}"><p style="${T_REG};font-size:24px;letter-spacing:.14em;text-transform:uppercase">${bkDot(HL.white)}${esc(o.label)}</p>
      <p style="${T_MED};font-size:${o.name.length > 18 ? 96 : 116}px;line-height:.98;letter-spacing:-.035em;margin-top:26px">${bkWhole(esc(o.name))}</p>
      ${o.role ? `<p style="${T_REG};font-size:26px;letter-spacing:.12em;text-transform:uppercase;margin-top:18px">${esc(o.role)}</p>` : ''}</div>
    ${o.text ? `<p class="a" style="left:64px;right:250px;bottom:84px;${T_REG};font-size:34px;line-height:1.32;color:${HL.white}">${bkWhole(esc(bkKeep(o.text)))}</p>` : ''}
    <p class="a" style="right:64px;bottom:88px;${T_REG};font-size:24px;letter-spacing:.14em;text-transform:uppercase;color:${HL.white}">&rarr; Swipe</p>`}; },
  // their own words over their photo (from the T—BI reference)
  words(o){ const u = bkPic(o.slot, o.face); const q = bkKeep(o.q); const sz = q.length > 150 ? 58 : q.length > 90 ? 68 : 78;
    return {bg: HL.ink, html: `${u ? `<div class="a img" data-slot="${o.slot}" style="inset:0;background-image:url(${u});background-size:cover;background-position:center 25%"></div>` : `<div class="a" style="inset:0;background:${HL.burg}"></div>`}
    <div class="a" style="inset:0;background:rgba(20,9,12,.34)"></div><p class="a cn" style="left:52px;top:48px;color:${HL.white}">Arts to Hearts Project</p>
    <div class="a" style="left:90px;right:90px;bottom:110px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:34px">
      <p style="${BASK};font-size:${sz}px;line-height:1.14;color:${HL.white}">&ldquo;${bkWhole(esc(q))}&rdquo;</p>
      <p style="${T_MED};font-size:26px;letter-spacing:.14em;text-transform:uppercase;color:${HL.white}">${esc(o.name)}</p></div>`}; },
});
const bkPlaceOf = w => { const c = bkCountries(w.line + ' ' + (w.bio || '')); return c.length ? c[0] : ''; };
const bkSay = w => { const s = String(w.line || ''); const m = s.match(/^\s*I(?:'m| am)\b[^.!?]{20,150}[.!?]?/); return m ? m[0].trim().replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ') : ''; };   // their own first-person words

// a few of the artists' own titles that carry the book's theme (memory, summer, home, light ...), read from the work itself
function bkThemeTitles(D, themeText, k = 7){
  const stop = new Set('the and for with that this from your you was were have what when where which there their them they into about maybe more only just than then also every each some being been would could'.split(' '));
  const root = w => w.toLowerCase().replace(/[^a-z]/g, '').replace(/(ies|es|s|ing|ed|y)$/, '');
  const T = new Set(String(themeText || '').split(/\s+/).map(root).filter(w => w.length > 3 && !stop.has(w)));
  'summer memory memories remember home light childhood evening afternoon sun beach sea harbour tender soft dream golden blue hour warm return carry'.split(' ').forEach(w => T.add(root(w)));
  const core = new Set(String(themeText || '').split(/[.!?]/)[0].split(/\s+/).map(root).filter(w => w.length > 3 && !stop.has(w)).concat(['memor', 'summer']));   // the theme's own title words count double
  const seen = new Set();
  return D.works.map(w => String(w.title || '').trim()).filter(t => t.length >= 4 && t.length <= 34 && t !== t.toUpperCase() && !/\d|[_/(]/.test(t) && !/untitled/i.test(t))
    .filter(t => { const key = t.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; })
    .map(t => ({t, n: t.split(/\s+/).reduce((n, w) => n + (core.has(root(w)) ? 2 : T.has(root(w)) ? 1 : 0), 0)})).filter(x => x.n > 0)
    .sort((x, y) => y.n - x.n || x.t.length - y.t.length).slice(0, k).map(x => x.t);
}

// Selected artists (v9, from the templates the user liked): faces-mosaic tabbed cards for the cover, congratulations and the names;
// six artists each shown as artwork whole + face circle + credit (the award winner and interviewees first, quoted over their photo); the Burgundy book card with the pre-order pill.
function bkSelectedPost(b, D, coverKind){
  const I = bkIssue(b), proper = bkProper(b), short = bkShort(b.name), th = (b.inside && b.inside.theme) || {}; const theme = bkTitleCase(th.title || ''); const KW = bkKeyword(b);
  const ed = I.issue || 'this book', sel = bkSelection(D), sale = bkSale(b); const big = I.issue ? `Arts to Hearts\nMagazine, ${I.issue}` : short;
  const words = n => ({10: 'ten', 15: 'fifteen', 20: 'twenty', 25: 'twenty-five', 30: 'thirty', 40: 'forty', 50: 'fifty', 60: 'sixty', 70: 'seventy', 80: 'eighty', 90: 'ninety', 100: 'a hundred'}[n] || String(n));
  const over = n => n > 10 ? 'more than ' + words(n > 50 ? Math.floor((n - 1) / 10) * 10 : Math.floor((n - 1) / 5) * 5) : 'several';
  const F = D.works.filter(w => w.img && w.face); const faces = D.works.filter(w => w.face).map(w => w.face);
  // who is featured: the award winner and the interviewed artists (they have their own words), then works whose titles carry the theme, then spread through the book
  const voices = (D.people || []).filter(p => p.quotes && p.quotes.length && p.kind !== 'curator').map(p => ({p, w: D.find(p.name)})).filter(x => x.w && x.w.img && x.w.face);
  const titles = bkThemeTitles(D, (th.title || '') + ' ' + (th.text || ''), 12);
  const picks = [], used = new Set(); const add = (w, q) => { if (w && !used.has(w.artist) && picks.length < 6) { picks.push({w, q}); used.add(w.artist); } };
  voices.forEach(x => add(x.w, bkCut(x.p.quotes[0], 220)));
  titles.forEach(t => add(F.find(x => x.title === t)));
  for (let i = 0; picks.length < 6 && i < F.length; i += Math.max(1, Math.floor(F.length / 7))) add(F[i]);
  const feat = (k) => picks[k] && BKT.feature({w: {...picks[k].w, img: bkPic('bkf' + k, picks[k].w.img)}, slot: 'bkf' + k, line: ''});
  const bioLine = w => (bkKeep(w.bio).match(/[^.!?]+[.!?]+/g) || []).map(x => x.trim()).filter((x, i) => i > 0 && x.length > 60 && x.length < 200 && /work|practice|explor|paint|memor|light|colou?r|feel|story|stories|nature|home/i.test(x))[0] || '';
  const said = (k) => { const x = picks[k]; if (!x) return null; const q = x.q || bkSay(x.w) || bioLine(x.w); return q && BKT.say({slot: 'bks' + k, face: x.w.face, q, name: x.w.artist, handle: x.w.handle, plain: !x.q && !bkSay(x.w)}); };   /* quote marks only for their own words */
  const people = D.works.map(w => ({name: w.artist, place: bkPlaceOf(w)})); const pages = Math.ceil(people.length / 26), per = Math.ceil(people.length / Math.max(1, pages));
  const brief = ((th.text || '').match(/[^.!?]+[.!?]+/g) || []).map(x => x.trim()).filter(x => x.split(' ').length > 4).slice(0, 2).join(' ');
  const coverImg = picks[0] ? picks[0].w.img : (F[0] || {}).img;
  const cover = coverKind === 'photo' ? BKT.pcover({slot: 'bkcov', img: coverImg, label: 'Selected artists', title: I.issue ? ['Arts to Hearts', 'Magazine', I.issue] : bkBalance(proper), sub: theme ? `Introducing the artists of ${theme}` : 'Introducing the artists'})
    : coverKind === 'burgundy' ? BKT.bcover({label: 'Selected artists', title: I.issue ? ['Arts to Hearts', 'Magazine', I.issue] : bkBalance(proper), serif: theme, sub: 'Introducing the artists'})
    : coverKind === 'artwork' ? BKT.acover({img: coverImg, slot: 'bkcovart', serif: 'Meet the artists of', big, sub: theme || ''})   /* the artwork full bleed (a cover may crop), the card below; click or drop to swap */
    : BKT.card({faces, mono: true, tab: 'Artists', serif: 'Meet the artists of', big, sub: theme || ''});
  const S = [
    cover,
    BKT.card({faces, tab: 'Artists', serif: 'Congratulations', big, sub: 'to every artist selected. Your work is going into print, and we are celebrating it with you.'}),
    ...Array.from({length: pages}, (_, p) => BKT.card({faces, tab: 'Artists', serif: p ? 'The selected artists, continued' : 'The selected artists', list: people.slice(p * per, (p + 1) * per)})),
    feat(0), said(0),
    theme && brief && BKT.htext({label: 'The theme', text: `${proper} is ${theme}. ${brief}`}),
    feat(1), said(1),
    BKT.card({faces, tab: 'Artists', label: 'The selection', body: `We received hundreds of submissions from artists all over the world. From them, we found ${sel.painters >= sel.n * .5 ? `${over(sel.painters)} talented painters, alongside artists in photography, collage and mixed media` : `${over(sel.n)} talented artists`}. We are so excited to welcome ${over(sel.n)} creators into ${ed}${sel.countries.length >= 5 ? `, from ${over(sel.countries.length)} countries` : ''}.`}),
    feat(2), said(2),
    feat(3), said(3),
    BKT.card({tab: 'Inside', big, sub: `${(s => s[0].toUpperCase() + s.slice(1))(over(sel.n))} artists, one ${I.issue ? 'magazine' : 'book'}. Every one of them will be featured here, one by one.`, pill: sale.open ? sale.verb + ' · link in bio' : 'Pre-order opens soon'}),
    feat(4), said(4), feat(5),
    BKT.keyEnd({head: `Congratulations to every artist in ${ed}.`, key: KW, offer: `Comment ${KW} and we'll send you the full list.`})].filter(Boolean);
  if (S.length > 20) S.splice(19, S.length - 20);
  const cap = `Introducing the artists of ${proper}${theme ? ': ' + theme : ''}.\n\nWe received hundreds of submissions from artists all over the world, and we are so excited to welcome ${over(sel.n)} creators into this ${I.issue ? 'issue' : 'book'}${sel.countries.length >= 5 ? `, from ${over(sel.countries.length)} countries` : ''}. Congratulations to every artist selected. Your work is going into print, and over the coming weeks each of you will be featured here.\n\nComment ${KW} and we'll send you the full list.\n\nTo everyone who applied: thank you for trusting us with your work. Please keep going, and we hope to see you in our next call.`;
  return {S, cap};
}

// ---------- the posts themselves (open in the normal preview: edit, replace images, download) ----------
function bookGroups(){
  const v = BOOKVIEW; const b = v && BOOKS && BOOKS.books[v.book]; if (!b) return [];
  const D = bkData(b), name = bkShort(b.name), sale = bkSale(b), n = D.works.length, W = D.works.filter(w => w.img), F = D.works.filter(w => w.face);
  const M = b.media || {}; const P = M.pages || {}; const pg = k => k && P[k] ? bkImg(P[k]) : ''; const KW = bkKeyword(b); const many = bkMany(n);
  const spreads = (M.spreads || []).map(bkImg), scenes = (M.scenes || []).map(bkImg), shoot = (M.shoot || []).map(bkImg), photos = [...shoot, ...scenes];
  const front = bkImg(M.covers && M.covers.front) || bkImg(b.shop && b.shop.image);
  const credits = {}; D.works.forEach(w => { if (w.img) credits[w.img] = {text: `${w.title ? w.title + ' by ' : ''}${w.artist}${w.handle ? ' ' + w.handle : ''}`, artist: w.artist, title: w.title}; });
  const tags = '#artstoheartsproject #artbook #contemporaryart #artcollectors';
  const out = []; const id = v.id;
  const post = (title, slides, cap, meta) => out.push({book: true, credits, title: `${name} · ${title}`, meta: meta + ` · keyword ${KW}`, cap: cap + '\n\n' + tags, pin: `Comment ${KW} and we'll send you a look inside.`, slides: slides.filter(Boolean).map((s, j) => ({...s, title: id + '-' + (j + 1)}))});
  const faces = (from, k) => { const l = F.slice(from, from + k); return (l.length >= 6 ? l : F.slice(0, k)).map(w => w.face); };
  const photo = (k, o) => BKT.photo({img: photos.length ? photos[k % photos.length] : '', slot: 'bkph' + k, ...o});
  const ask = head => BKT.ask({head: head || `There is so much more inside ${name}.`, key: KW, sub: `and we'll send you a look inside${sale.open ? ', with the ' + sale.verb.toLowerCase() + ' link' : ''}.`});
  const bookCard = (tab, line) => BKT.card({tab, img: front || bkPic('bkbook', '') || undefined, slot: 'bkbook', big: name, bigMax: 72, sub: line, pill: sale.open ? sale.verb + ' · link in bio' : 'Pre-order opens soon'});
  const feature = (w, i, slot) => BKT.feature({w, slot: (slot || 'bkw') + i, line: bkCut(w.line, 120)});
  const theirPage = (w, i, slot) => pg(w.page) ? BKT.page({img: pg(w.page), slot: (slot || 'bkpg') + i, w, pageNo: w.page}) : feature(w, i, slot);
  const spreadAt = (k, head, sub, slot) => pg(k) ? BKT.spread({l: pg(k), r: pg(k + 1), slot: slot || 'bksp' + k, head, sub}) : null;
  // a voice from inside the book: their face, their words over it, the interview pages themselves, their work, the ask
  const voice = (p, label, tab, slot, hook) => { const w = D.find(p.name) || {}; const face = w.face || ''; const q = p.quotes.slice(0, 3);
    return [BKT.portrait({slot: slot + 'f', face, label, name: p.name, sub: hook || p.handle || '', mono: true}),
      q[0] && BKT.say({slot: slot + 'f', face, q: bkCut(q[0], 230), name: p.name, handle: p.handle}),
      p.intro && BKT.card({tab, label: p.title ? bkCase(p.title) : '', body: bkCut(p.intro, 460)}),
      spreadAt(p.page, `${p.name}, in ${name}`, p.page ? `Pages ${p.page} and ${p.page + 1}.` : '', slot + 's'),
      q[1] && BKT.quote({q: bkCut(q[1], 330), name: p.name, handle: p.handle, face}),
      w.img && feature(w, 0, slot + 'w'),
      q[2] && BKT.quote({q: bkCut(q[2], 330), name: p.name, handle: p.handle, face}),
      ask(`${p.name.split(' ')[0]}'s full interview is in ${name}.`)]; };

  if (id === 'selected') { const r = bkSelectedPost(b, D, v.cover); out.push({book: true, credits, title: `${bkProper(b)} · Selected artists`, meta: 'Post the day the list goes live · tag the artists in the image', cap: r.cap + '\n\n' + tags, pin: 'Congratulations to every artist selected. Cheer them on below.', slides: r.S.filter(Boolean).map((s, j) => ({...s, title: 'selected-' + (j + 1)}))}); }
  else if (id === 'theme') { const th = (b.inside && b.inside.theme) || {}; const f = W.slice(0, 3);
    post('The theme', [photos.length ? photo(1, {mono: true, label: name, head: bkCase(th.title) || name}) : BKT.card({faces: faces(30, 30), mono: true, tab: 'Inside', serif: `The theme of ${name}`, big: bkCase(th.title) || name}),
      th.text && BKT.card({tab: 'Inside', body: bkCut(th.text, 480)}), ...f.map((w, i) => theirPage(w, i, 'bkt')),
      BKT.ask({head: th.title ? `Which ${bkCase(th.title).toLowerCase().replace(/^the /, '')} is yours? Tell us below.` : 'What does this theme mean to you?', key: KW, sub: 'for a look inside the book.'})],
      `${th.title ? bkCase(th.title) + '.' : ''}\n\n${bkCut(th.text || '', 300)}\n\nComment ${KW} for a look inside.`, 'Ask a question people answer in the comments'); }
  else if (id === 'curator' && D.curator) { const p = D.curator;
    post('The curator', voice(p, 'The curator', 'Curator', 'bkcur', `Chose every work in ${name}`), `${p.name}${p.handle ? ' ' + p.handle : ''} curated ${name}.\n\n${p.quotes[0] ? '“' + bkCut(p.quotes[0], 220) + '”' : ''}\n\nComment ${KW} for a look inside.`, p.handle ? `Collab post: invite ${p.handle}` : 'Add their photo'); }
  else if (/^voice\d+$/.test(id)) { const p = D.voices[+id.slice(5)]; if (p) post(p.name, voice(p, p.kind === 'award' ? 'Award winner' : p.kind === 'invited' ? 'Invited artist' : 'In conversation', 'Inside', 'bkv', p.title ? bkCase(p.title) : ''),
      `${p.title ? bkCase(p.title) + '.' : p.name}\n\n${p.quotes[0] ? '“' + bkCut(p.quotes[0], 220) + '”' : ''}\n\n${p.name}${p.handle ? ' ' + p.handle : ''}, in ${name}. Comment ${KW} to read a page of the interview.`, p.handle ? `Collab post: invite ${p.handle}` : 'Interview from the book'); }
  else if (id === 'peek') { const list = spreads.length ? spreads.slice(0, 8).map((u, i) => BKT.photo({img: u, slot: 'bkpk' + i})) : D.works.slice(4, 12).filter(w => pg(w.page)).map((w, i) => theirPage(w, i, 'bkpk'));
    post('A first look inside', [photos.length ? photo(2, {mono: true, label: name, head: "We can't show you every page. Here are a few."}) : BKT.card({faces: faces(4, 30), mono: true, tab: 'Inside', serif: 'A first look inside', big: name}),
      ...list, ask('Hundreds more pages are inside.')],
      `A first look inside ${name}.\n\nComment ${KW} and we'll send you a few more pages.`, 'Real spreads from the Mockups folder'); }
  else if (id === 'cover' && D.cover) { const c = D.cover, p = D.coverP || {quotes: []}; const w = D.find(c.artist) || {};
    post('Cover reveal', [BKT.card({tab: 'Cover', mono: true, img: front || '', slot: 'bkcvr', serif: 'The cover', big: name, bigMax: 72, sub: `Art by ${c.artist}`}),
      photos.length ? photo(3, {label: 'The cover', head: c.title ? `${c.title}${c.year ? ', ' + c.year : ''}` : `Art by ${c.artist}`}) : null,
      BKT.portrait({slot: 'bkcvf', face: w.face, label: 'The cover artist', name: c.artist, sub: D.coverHandle}),
      p.quotes[0] && BKT.say({slot: 'bkcvf', face: w.face, q: bkCut(p.quotes[0], 230), name: c.artist, handle: D.coverHandle}),
      (p.intro) && BKT.card({tab: 'Cover', label: p.title ? bkCase(p.title) : '', body: bkCut(p.intro, 420)}),
      spreadAt(p.page, `${c.artist}'s story`, p.page ? `Pages ${p.page} and ${p.page + 1}.` : '', 'bkcvs'),
      p.quotes[1] && BKT.quote({q: bkCut(p.quotes[1], 330), name: c.artist, handle: D.coverHandle, face: w.face}), ask(`Read ${c.artist.split(' ')[0]}'s story in ${name}.`)],
      `${p.title ? bkCase(p.title) + '.' : 'The cover of ' + name + '.'}\n\n${p.quotes[0] ? '“' + bkCut(p.quotes[0], 220) + '”\n\n' : ''}${c.title ? c.title + ' by ' : 'Art by '}${c.artist}${D.coverHandle ? ' ' + D.coverHandle : ''}, on the cover of ${name}. Comment ${KW} for a look inside.`, D.coverHandle ? `Collab post: invite ${D.coverHandle}` : 'Cover reveal'); }
  else if (id === 'open') { const inside = [D.curator && `Curated by ${D.curator.name}.`, D.cover && `On the cover, ${D.cover.artist}.`, D.voices.length && `Conversations with ${D.voices.slice(0, 3).map(p => p.name).join(', ')}${D.voices.length > 3 ? ' and more' : ''}.`, `Work by ${many}, each with their own page.`].filter(Boolean).join(' ');
    post('Pre-order is open', [photos.length ? photo(4, {mono: true, label: 'Pre-order is open', head: name}) : BKT.card({faces: faces(0, 30), mono: true, tab: 'Inside', serif: 'Pre-order is open', big: name}),
      BKT.card({tab: 'Inside', label: 'Inside the book', body: inside}), ...spreads.slice(0, 3).map((u, i) => BKT.photo({img: u, slot: 'bkos' + i})),
      BKT.faces({list: F.slice(0, 12).map(w => ({name: w.artist, handle: w.handle, face: w.face})), slot: 'bkof'}), bookCard('Inside', b.shop && b.shop.price ? `$${b.shop.price}. Ships when it's printed.` : "Ships when it's printed."), ask()],
      `${name} is open for pre-order.\n\n${inside}\n\nComment ${KW} for a look inside, or tap the link in bio.`, 'Pin to the grid'); }
  else if (id === 'editor') { const e = {...b.inside.editor, text: b.inside.editor.text.replace(/^ear Reader/, 'Dear Reader')}; const parts = (e.text.match(/[^.!?]+[.!?]+/g) || [e.text]); const a = [], cur = []; let len = 0;
    parts.forEach(x => { if (len + x.length > 460 && cur.length) { a.push(cur.join('').trim()); cur.length = 0; len = 0; } cur.push(x); len += x.length; }); if (cur.length) a.push(cur.join('').trim());
    const first = (parts[0] || '').trim();
    post("The editor's note", [photos.length ? photo(5, {mono: true, label: "From the editor's note", head: bkCut(first, 90)}) : BKT.card({faces: faces(20, 30), mono: true, tab: 'Inside', serif: "The editor's note", big: name}), ...a.slice(0, 3).map((t, i, l) => BKT.card({tab: 'Inside', body: t, by: i === l.length - 1 ? e.by || '' : ''})), ask(`The rest of the note opens ${name}.`)],
      `From the editor's note in ${name}.\n\n${bkCut(e.text, 260)}\n\nComment ${KW} for a look inside.`, 'A short read from the book'); }
  else if (/^feat\d+$/.test(id)) { const k = +id.slice(4), parts = Math.ceil(n / BK_FEAT); const chunk = D.works.slice(k * BK_FEAT, (k + 1) * BK_FEAT);
    post(`Artist features ${k + 1} of ${parts}`, [BKT.card({faces: chunk.map(w => w.face), mono: true, tab: 'Artists', serif: 'Meet the artists of', big: name, sub: chunk.map(w => w.artist).slice(0, 3).join(', ') + ' and more, on their own pages'}),
      ...chunk.flatMap((w, i) => [feature(w, i), pg(w.page) ? BKT.page({img: pg(w.page), slot: 'bkpg' + i, w, pageNo: w.page}) : null]).filter(Boolean).slice(0, 18), ask(`Every one of them has a page in ${name}.`)],
      `Meet some of the artists in ${name}.\n\n${chunk.map(w => `${w.artist}${w.handle ? ' ' + w.handle : ''}${w.title ? `, ${w.title}` : ''}`).join('\n')}\n\nEach has their own page in the book. Comment ${KW} for a look inside.`, `Tag every artist · send each their kit the same day (Artist kits tab)`); }
  else if (id === 'why') { const lines = [D.curator && `${D.curator.name} chose every work.`, D.voices.length && `Conversations with the artists behind the work.`, `${many[0].toUpperCase() + many.slice(1)}, each with their own page.`, 'Printed to keep on the shelf, not scrolled past.'].filter(Boolean).join(' ');
    post('Who it is for', [photos.length ? photo(6, {mono: true, head: 'For the person who keeps art books on the table.'}) : BKT.card({faces: faces(40, 30), mono: true, tab: 'Inside', serif: 'Who it is for', big: name}),
      BKT.card({tab: 'Inside', body: lines}), photos[7] ? photo(7, {}) : null, spreads[3] ? BKT.photo({img: spreads[3], slot: 'bkys'}) : null, bookCard('Inside', 'For collectors, artists, and anyone who wants new art on their table.'), ask()],
      `For the person who keeps art books on the table.\n\n${lines}\n\nComment ${KW} for a look inside.`, 'Gift angle'); }
  else if (id === 'family') post('Friends and family', [BKT.card({faces: faces(10, 30), mono: true, tab: 'Artists', serif: 'Know an artist in', big: name}),
      BKT.card({tab: 'Artists', body: `Friends and family of our artists get their own code for the book: ${b.codesLive ? b.codes.friends : '[shows once ticked live in Shopify]'}. Use it at checkout.`}), spreads[4] ? BKT.photo({img: spreads[4], slot: 'bkfs'}) : feature(W[8] || W[0], 0, 'bkf'), bookCard('Artists', 'Pre-order with the friends and family code.'), ask()],
      `Know an artist in ${name}? Friends and family get their own code: ${b.codesLive ? b.codes.friends : '[code shows once ticked live in Shopify]'}.\n\nComment ${KW} for a look inside.`, 'Only post once the code is live in Shopify');
  else if (id === 'print') post('Going to print', [photos.length ? photo(8, {mono: true, label: 'Going to print soon', head: name}) : BKT.card({faces: faces(50, 30), mono: true, tab: 'Inside', serif: 'Going to print soon', big: name}),
      ...spreads.slice(5, 8).map((u, i) => BKT.photo({img: u, slot: 'bkgs' + i})), bookCard('Inside', "Pre-order now and it ships as soon as it's printed."), ask()],
      `${name} goes to print soon. Pre-order now and it ships as soon as it's printed.\n\nComment ${KW} for a look inside.`, 'Plain date, no countdown');
  else if (id === 'arrived') post("It's here", [photo(0, {mono: true, label: "It's here", head: name}), ...[1, 2, 3].map(k => photos[k] ? photo(k, {}) : null),
      BKT.faces({list: F.slice(12, 24).map(w => ({name: w.artist, handle: w.handle, face: w.face})), slot: 'bkaf'}), bookCard('Inside', 'In stock and shipping now.'), ask()],
      `${name} is here.\n\nThank you to every artist inside it.\n\nComment ${KW} for a look inside.`, 'Use the photoshoot (Pictures tab)');
  else if (id === 'archive') { const f = W.slice(10, 13); post('From the archive', [photos.length ? photo(9, {mono: true, label: 'From our shelf', head: name}) : BKT.card({faces: f.map(w => w.face), mono: true, tab: 'Inside', serif: 'From our shelf', big: name}), ...f.map((w, i) => theirPage(w, i, 'bkr')), bookCard('Inside', 'Still on the shelf.'), ask()],
      `From our shelf: ${name}.\n\n${f.map(w => w.artist + (w.handle ? ' ' + w.handle : '')).join(', ')} and ${many} more.\n\nComment ${KW} for a look inside.`, 'Backlist rotation'); }
  else if (/^kits\d+$/.test(id)) { const k = +id.slice(4), chunk = D.works.slice(k * BK_FEAT, (k + 1) * BK_FEAT); const code = b.codes && b.codes.artist;
    const K = chunk.flatMap((w, i) => [{...BKT.kit({w: {...w, img: bkPic('bkkit' + i, w.img)}, b, slot: 'bkkit' + i}), label: w.artist + ': I\'m in it'},
      pg(w.page) ? {...BKT.kitPage({w, b, img: pg(w.page), slot: 'bkkp' + i}), label: w.artist + ': my page'} : null]).filter(Boolean);
    const dm = `Hi {first name}, your feature for ${name} is live on our page today. Here are two story frames made for you: "I'm in it" and your printed page. Share them and tag @artstoheartsproject, and we'll reshare.${sale.open ? ` ${sale.line.replace('. Link in bio.', '')} at shop.artstoheartsproject.com.` : ''}${b.codesLive && code ? ` Your artist code for the book is ${code}${b.codes.friends ? `, and friends and family can use ${b.codes.friends}` : ''}.` : ''} When your copy arrives, send us a photo of you with it. Thank you for being part of the book.`;
    out.push({book: true, credits, title: `${name} · Artist kits ${k + 1} of ${Math.ceil(n / BK_FEAT)}`, meta: `Two story frames per artist ("I'm in it" and their printed page) · send each artist theirs with the message below`, slides: K.map((s, j) => ({...s, title: 'kit-' + (k * BK_FEAT + Math.floor(j / 2) + 1) + '-' + (j % 2 ? 'page' : 'in-it')})), story: true, cap: dm, pin: ''}); }
  return out;
}

// ---------- the Books tab: a list of books, then one book on its own page ----------
let BOOKTAB = 'inside';
const BK_TABS = [['inside', 'Inside the book'], ['artists', 'Artists'], ['pictures', 'Pictures'], ['pre', 'Pre-launch'], ['launch', 'Launch'], ['after', 'After launch'], ['kits', 'Artist kits']];
function bookCard(b, i){
  const img = b.shop && b.shop.image ? `<img class="bk-cv" loading="lazy" decoding="async" src="${bkEsc(bkSize(bkImg(b.shop.image), 360))}" alt="">` : `<div class="bk-cv bk-none">${bkEsc(b.name)}</div>`;
  const sale = b.shop ? `${b.shop.preorder ? 'Pre-order' : b.shop.available ? 'In stock' : 'Sold out'}${b.shop.price ? ' · $' + bkEsc(b.shop.price) : ''}` : 'Not in the shop yet';
  const v = b.verify; const art = b.artistsError ? `<span class="bk-warn">${bkEsc(b.artistsError)}</span>` : v ? `${v.inPrint} artists in print` : b.sheet ? `${b.count || 0} artists (sheet)` : '<span class="bk-warn">No artist sheet linked</span>';
  return `<button type="button" class="bk-card" data-book="${i}">${img}<b>${bkEsc(b.name)}</b><span>${bkEsc([b.status, b.year].filter(Boolean).join(' · '))}</span><span>${art}</span><span>${sale}</span></button>`;
}
function bookHead(b){
  const links = [['Shop', b.shop && b.shop.url], ['Landing page', b.links.landing], ['Amazon', b.links.amazon], ['Final PDF', b.links.pdf]].filter(x => x[1]).map(([l, u]) => `<a href="${bkEsc(u)}" target="_blank" rel="noopener">${l}</a>`).join(' · ');
  const T = bkDates(b); const dl = [['Selected', T.selected, 'selected'], ['Pre-order', T.preorder, 'preorder'], ['To print', T.print, 'print'], ['Ships', T.ships, 'ships']].filter(x => x[1]).map(([l, d, k]) => `<span>${l} <b>${bkFmt(d)}</b>${T.est[k] ? ' <i>(est.)</i>' : ''}</span>`).join('');
  const v = b.verify; const ver = v ? `<p class="${v.missing.length ? 'bk-warn' : 'bk-ok'}">Checked against the final PDF: ${v.inPrint} of ${v.total} artists in print${v.missing.length ? `, ${v.missing.length} not in print (left out of posts)` : ''}${v.titleCheck && v.titleCheck.length ? `, ${v.titleCheck.length} artwork titles differ from print` : ''}.</p>` : b.links.pdf ? `<p class="bk-warn">${bkEsc(b.insideError || 'Not checked against the final PDF yet. Press Sync now.')}</p>` : '<p class="bk-warn">No final PDF linked in Books Data (column J) yet, so artists come from the sheet unchecked.</p>';
  const sale = b.shop ? `${b.shop.preorder ? 'Pre-order open' : b.shop.available ? 'In stock' : 'Sold out'}${b.shop.price ? ' · $' + bkEsc(b.shop.price) : ''}` : 'Not in the shop yet';
  return `<div class="bk-head">${b.shop && b.shop.image ? `<img src="${bkEsc(bkSize(bkImg(b.shop.image), 300))}" alt="">` : ''}<div><button type="button" class="btn ghost" id="bkback">&larr; All books</button>
    <h2>${bkEsc(b.name)}</h2><p class="meta">${bkEsc([b.status, sale, b.pages && b.pages + ' pages', b.designer && 'Designed by ' + b.designer].filter(Boolean).join(' · '))}</p>
    <p class="meta bk-kw">Keyword <input id="bkkw" value="${bkEsc(bkKeyword(b))}" maxlength="16" title="People comment this word to get a look inside. Set the same word in ManyChat."> · set the same word in ManyChat: it sends a look inside and the shop link</p>
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
  const card = w => `<div class="bk-a"><div class="bk-pic">${w.img ? `<img loading="lazy" decoding="async" src="${bkEsc(bkSize(w.img.replace(/&w=\d+/, ''), 400))}" alt="">` : '<div class="bk-w bk-none">No artwork in the sheet</div>'}${w.face ? `<img class="bk-face" loading="lazy" decoding="async" src="${bkEsc(bkSize(w.face.replace(/&w=\d+/, ''), 120))}" alt="">` : ''}</div><b>${bkEsc(w.artist)}</b><span>${bkEsc(w.handle)}</span>${w.title ? `<i>${bkEsc(w.title)}</i>` : ''}${w.page ? `<span class="bk-ok">Page ${w.page}</span>` : ''}${w.titleOk ? '' : '<span class="bk-warn">Title in the sheet differs from print</span>'}</div>`;
  return `<p class="meta">${D.works.length} artists${D.checked ? ' in the final PDF, in page order' : ' from the sheet (not checked against a PDF yet)'}.</p><div class="bk-arts">${D.works.map(card).join('')}</div>
    ${D.missing.length ? `<h3>In the sheet but not in the final PDF</h3><p class="meta">Replaced, dropped or spelled differently. Left out of every post.</p><p>${D.missing.map(a => bkEsc(a.name)).join(' · ')}</p>` : ''}`;
}
function bookTabPhase(b, phase){
  const P = bkPlan(b).filter(p => p.phase === phase); const today = Date.now();
  const intro = {pre: 'While the book is being made: who is inside it, before anyone can buy it. Ends with the cover reveal.', launch: 'Pre-order is open until it goes to print: the book, the editor, every artist, one action each time.', after: 'The book is here, then it rotates in the backlist.'}[phase];
  if (!P.length) return `<p class="meta">${intro}</p><p class="meta">Nothing here yet for this book.</p>`;
  return `<p class="meta">${intro} ${P.length} posts.</p><div class="bk-plan">${P.map(p => `<div class="bk-row${p.when && p.t < today - DAY ? ' past' : ''}${BOOKVIEW && BOOKVIEW.id === p.id ? ' on' : ''}"><span class="bk-when">${p.when ? bkFmt(p.when) : '—'}</span><div><b>${bkEsc(p.title)}</b>${p.collab ? ' <span class="bk-tag">Collab</span>' : ''}<p class="meta">${bkEsc(p.what)}</p></div><button type="button" class="btn ghost" data-bkopen="${p.id}">Open</button>${p.id === 'selected' && BOOKVIEW && BOOKVIEW.id === 'selected' ? `<div class="bk-covers">Cover: ${[['faces', 'Faces'], ['artwork', 'Artwork'], ['photo', 'Photo'], ['burgundy', 'Burgundy']].map(([k, l]) => `<button type="button" class="btn ghost${(BOOKVIEW.cover || 'faces') === k ? ' on' : ''}" data-bkcover="${k}">${l}</button>`).join(' ')}</div>` : ''}</div>`).join('')}</div>`;
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
    const body = BOOKTAB === 'inside' ? bookTabInside(b) : BOOKTAB === 'artists' ? bookTabArtists(b) : BOOKTAB === 'pictures' ? bookTabPictures(b) : BOOKTAB === 'kits' ? bookTabKits(b) : bookTabPhase(b, BOOKTAB);
    el.innerHTML = `<section class="bk-detail">${bookHead(b)}<div class="bk-tabs">${BK_TABS.map(([k, l]) => `<button type="button" class="${BOOKTAB === k ? 'on' : ''}" data-bktab="${k}">${l}</button>`).join('')}</div><div class="bk-body">${body}</div>${BOOKVIEW ? '<p class="meta bk-close"><button type="button" class="btn ghost" id="bkclose">Close the post</button></p>' : ''}</section>`;
    el.querySelector('#bkback').onclick = () => { BOOKSEL = null; bookClosePost(); booksRender(); window.scrollTo({top: 0}); };
    el.querySelectorAll('[data-bktab]').forEach(x => x.onclick = () => { BOOKTAB = x.dataset.bktab; bookClosePost(); booksRender(); });
    el.querySelectorAll('[data-bkopen]').forEach(x => x.onclick = () => bookOpenPost(x.dataset.bkopen));
    el.querySelectorAll('[data-bkcover]').forEach(x => x.onclick = () => { if (BOOKVIEW) { BOOKVIEW.cover = x.dataset.bkcover; booksRender(); render(); } });
    el.querySelectorAll('[data-bkget]').forEach(x => x.onclick = () => bookGetMedia(BOOKSEL, x.dataset.bkget));
    const kw = el.querySelector('#bkkw'); if (kw) kw.onchange = () => { const v = kw.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); try { v ? localStorage.setItem('bkkw:' + b.name, v) : localStorage.removeItem('bkkw:' + b.name); } catch {} booksRender(); if (BOOKVIEW) render(); };
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
  if (bk && !bk.media) fetch('/api/media?book=' + i).then(r => r.ok ? r.json() : {}).then(m => { bk.media = m || {}; if (BOOKSEL === i) { booksRender(); if (BOOKVIEW) render(); } }).catch(() => {});
  if (bk && !bk.artists && bk.count) { bk.loading = true; booksRender(); try { const r = await fetch('/api/books?book=' + i); const j = await r.json(); if (r.ok) bk.artists = j.artists || []; } catch {} bk.loading = false; }
  booksRender();
}
function bookClosePost(){ if (BOOKVIEW) { BOOKVIEW = null; document.body.classList.remove('bkposts'); } }
function bookOpenPost(id){
  BOOKVIEW = {book: BOOKSEL, id}; document.body.classList.add('bkposts'); booksRender(); render();
  const o = document.getElementById('out'); if (o) o.scrollIntoView({behavior: 'smooth'});
}

// ---------- the book's own pictures: pages, mockups, photoshoot (taken once from the Dropbox links in Books Data) ----------
const BKGET = {};
async function bookGetMedia(i, part){
  const bk = BOOKS.books[i]; BKGET[i + part] = 'busy'; booksRender();
  try { const r = await fetch(`/api/media?book=${i}&part=${part}`, {method: 'POST'}); const j = await r.json(); if (!r.ok) throw new Error(j.error || r.status); const {read, ...m} = j; bk.media = m; BKGET[i + part] = read ? `${read.kept} pictures in ${read.seconds}s` : 'done'; }
  catch (e) { BKGET[i + part] = 'error: ' + (e.message || e); }
  if (BOOKSEL === i) { booksRender(); if (BOOKVIEW) render(); }
}
function bookTabPictures(b){
  const m = b.media || {}, i = BOOKSEL; const pages = Object.entries(m.pages || {}).sort((x, y) => x[0] - y[0]);
  const row = (part, label, link, has, note) => { const st = BKGET[i + part];
    return `<div class="bk-row"><span class="bk-when">${label}</span><div><b>${has ? has : 'Not taken yet'}</b><p class="meta">${link ? note : 'No link in Books Data for this book.'}${st ? ' · ' + bkEsc(st === 'busy' ? 'Working… keep this tab open' : st) : ''}</p></div>${link ? `<button type="button" class="btn ghost" data-bkget="${part}"${st === 'busy' ? ' disabled' : ''}>${part === 'pages' && m.pagesDone === false ? 'Continue' : has ? 'Take again' : 'Take them'}</button>` : ''}</div>`; };
  const grid = (list, cls) => list.length ? `<div class="bk-pics ${cls || ''}">${list.map(u => `<img loading="lazy" decoding="async" src="${bkEsc(bkSize(bkImg(u), cls ? 220 : 420))}" alt="">`).join('')}</div>` : '';
  return `<p class="meta">The book's own pictures, taken once from the Dropbox folders in Books Data and used across the posts and kits. Take the pages first: every artist's printed page comes from there.</p>
    <div class="bk-plan">${row('pages', 'Pages', b.links.pages, pages.length && `${pages.length} pages${m.pagesDone === false ? ' so far: press Continue for the rest' : ''}`, 'Page by Page Graphics. A big book takes two or three presses, each about 4 minutes.')}
    ${row('mockups', 'Mockups', b.links.mockups, (m.spreads || m.scenes) && `${(m.spreads || []).length} spreads, ${(m.scenes || []).length} scenes${m.covers && m.covers.front ? ', the cover' : ''}`, 'Spread mockups, scene mockups, the shop covers. Under a minute.')}
    ${row('shoot', 'Photoshoot', b.links.shoot, (m.shoot || []).length && `${m.shoot.length} photos`, 'Up to 40 photos from the photoshoot folder.')}</div>
    ${(m.spreads || []).length ? '<h3>Spreads</h3>' + grid(m.spreads) : ''}${(m.scenes || []).length ? '<h3>Scenes</h3>' + grid(m.scenes) : ''}${(m.shoot || []).length ? '<h3>Photoshoot</h3>' + grid(m.shoot) : ''}
    ${pages.length ? '<h3>Pages</h3>' + grid(pages.map(p => p[1]), 'pg') : ''}`;
}
