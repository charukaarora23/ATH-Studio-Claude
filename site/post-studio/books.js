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
function bookDetail(b){
  const links = [['Shop', b.shop && b.shop.url], ['Landing page', b.links.landing], ['Amazon', b.links.amazon], ['Barnes & Noble', b.links.bn]].filter(x => x[1]).map(([l, u]) => `<a href="${bkEsc(u)}" target="_blank" rel="noopener">${l}</a>`).join(' · ');
  const facts = [b.status && 'Status: ' + b.status, b.pages && b.pages + ' pages', b.published && b.published + ' published artists', b.designer && 'Designed by ' + b.designer, b.coverArtist && `Cover: ${b.coverArtist.name}${b.coverArtist.handle ? ' ' + b.coverArtist.handle : ''}`, b.juror && 'Juror: ' + b.juror, b.codes && b.codes.artist && `Codes: ${b.codes.artist} (artists)${b.codes.friends ? ', ' + b.codes.friends + ' (friends & family)' : ''}${b.codesLive ? ', live in Shopify' : ', not live in Shopify yet'}`, b.tab && 'Sheet tab: ' + b.tab].filter(Boolean).map(bkEsc).join(' · ');
  const arts = (b.artists || []).map(a => { const w = (a.works || [])[0]; return `<div class="bk-a">${w ? `<div class="bk-w" style="background-image:url('${bkEsc(w.img)}')"></div>` : '<div class="bk-w bk-none">No artwork</div>'}<b>${bkEsc(a.name)}</b><span>${bkEsc(a.handle || '')}</span>${w && w.details ? `<i>${bkEsc(w.details)}</i>` : ''}</div>`; }).join('');
  const d = b.dates || {}; const dates = [['Call opens', d.callOpens], ['Call closes', d.callCloses], ['Selected announced', d.selected], ['Pre-order opens', d.preorder], ['To print', d.print], ['Ships', d.ships]].filter(x => x[1]).map(([l, v]) => l + ' ' + bkEsc(v)).join(' · ');
  return `<section class="bk-detail"><h2>${bkEsc(b.name)}</h2><p class="meta">${facts}</p>${dates ? `<p class="meta">${dates}</p>` : ''}${links ? `<p class="meta">${links}</p>` : ''}
    ${bookInside(b)}
    ${b.loading ? '<p class="meta">Loading the artists…</p>' : arts ? `<div class="bk-arts">${arts}</div>` : `<p class="meta">${b.artistsError ? bkEsc(b.artistsError) + '.' : 'No artists in the sheet yet.'}</p>`}</section>`;
}
function booksRender(){
  const el = document.getElementById('books'); if (!el) return;
  if (!BOOKS && !BOOKBUSY) { booksLoad(false); return; }
  const lib = BOOKS || {books: []}; const q = BOOKQ.toLowerCase();
  const list = lib.books.map((b, i) => [b, i]).filter(([b]) => !q || (b.name + ' ' + b.category + ' ' + b.year).toLowerCase().includes(q));
  const when = lib.synced ? new Date(lib.synced).toLocaleString() : 'never';
  const totalA = lib.books.reduce((n, b) => n + (b.count || 0), 0);
  el.innerHTML = `<div class="bk-top"><div><h1>Books</h1><p class="meta">${lib.books.length} books · ${totalA} artists · last synced ${bkEsc(when)}. Syncs by itself every night.</p>${lib.err ? `<p class="bk-warn">Sync failed: ${bkEsc(lib.err)}</p>` : ''}${(lib.problems || []).map(p => `<p class="bk-warn">${bkEsc(p.error)}</p>`).join('')}</div>
    <div class="bk-act"><input type="search" placeholder="Find a book" value="${bkEsc(BOOKQ)}" id="bkq"><button type="button" class="btn" id="bksync"${BOOKBUSY ? ' disabled' : ''}>${BOOKBUSY ? 'Syncing…' : 'Sync now'}</button></div></div>
    ${BOOKSEL !== null && lib.books[BOOKSEL] ? bookDetail(lib.books[BOOKSEL]) : ''}
    <div class="bk-grid">${list.map(([b, i]) => bookCard(b, i)).join('') || '<p class="meta">No books yet. Press Sync now.</p>'}</div>`;
  el.querySelector('#bksync').onclick = () => booksLoad(true);
  const qi = el.querySelector('#bkq'); qi.oninput = () => { BOOKQ = qi.value; const pos = qi.selectionStart; booksRender(); const n = document.getElementById('bkq'); n.focus(); n.setSelectionRange(pos, pos); };
  el.querySelectorAll('[data-bkv]').forEach(x => x.onclick = () => { const k = x.dataset.bkv; const sel = el.querySelector(`[data-bkp="${k}"]`); bookShowPosts(BOOKSEL, k, sel ? +sel.value : 1); });
  el.querySelectorAll('[data-bkp]').forEach(x => x.onchange = () => bookShowPosts(BOOKSEL, x.dataset.bkp, +x.value));
  el.querySelectorAll('[data-book]').forEach(b => b.onclick = async () => { const i = +b.dataset.book; BOOKSEL = BOOKSEL === i ? null : i; if (BOOKVIEW) { BOOKVIEW = null; document.body.classList.remove('bkposts'); } window.scrollTo({top: 0});
    const bk = BOOKSEL !== null && BOOKS.books[i]; if (bk && !bk.artists && bk.count) { bk.loading = true; booksRender(); try { const r = await fetch('/api/books?book=' + i); const j = await r.json(); if (r.ok) bk.artists = j.artists || []; } catch {} bk.loading = false; }
    booksRender(); });
}

// ---------- posts for a book: the selected artists (announcement, features, share kits) ----------
// Each artist is elevated AND the book is sold: every feature ends on the book and one clear action.
let BOOKVIEW = null;   // {book: index, kind: 'announce' | 'features' | 'kits', part}
const BK_PER = 8;      // artists per feature carousel: 100 artists → about 13 carousels, not 100 posts
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
      ${o.img ? ivArt(o.img, 'left:240px;right:240px;top:130px;height:700px', 'bkbook') : ''}
      <div class="a" style="left:80px;right:80px;top:${o.img ? 880 : 300}px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px">
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

function bookGroups(){
  const v = BOOKVIEW; const b = v && BOOKS && BOOKS.books[v.book]; if (!b) return [];
  const arts = (b.artists || []).filter(a => a.name).map(a => ({...a, name: bkName(a.name), handle: bkHandle(a.handle)})); const n = arts.length; const name = bkShort(b.name); const sale = bkSale(b);
  const works = arts.map(bkWork); const credits = {}; works.forEach(w => { if (w.img) credits[w.img] = {text: `${w.title ? w.title + ' by ' : ''}${w.artist}${w.handle ? ' ' + w.handle : ''}`, artist: w.artist, title: w.title}; });
  const coverWork = works.find(w => w.img) || {};
  const tags = '#artstoheartsproject #artbook #publishedartist #contemporaryart';
  const base = {credits, book: true};
  if (v.kind === 'announce') {
    const per = 20, pages = []; for (let i = 0; i < n; i += per) pages.push(arts.slice(i, i + per));
    const S = [BKT.cover({img: coverWork.img, serif: 'The selected artists', big: b.name, under: n ? `${n} artists` : ''}),
      ...pages.map(l => BKT.names({list: l, sz: 30, gap: 18})),
      BKT.end({head: `Congratulations to every artist selected for ${name}.`, sub: 'Your feature is coming. The book opens for pre-order soon.'})];
    const cap = `The selected artists for ${name}.\n\nCongratulations to all ${n} artists. Find your name in the slides, share it, and tag @artstoheartsproject. Every artist will be featured here over the coming weeks.\n\n${sale.line}\n\n${tags}`;
    return [{...base, title: `${name} · Selected artists`, meta: `${S.length} slides · post on the day the list goes live`, slides: S.map((s, j) => ({...s, title: 'selected-' + (j + 1)})), cap, pin: sale.line}];
  }
  const parts = Math.max(1, Math.ceil(n / BK_PER)); const p = Math.min(Math.max(1, v.part || 1), parts);
  const chunk = works.slice((p - 1) * BK_PER, p * BK_PER);
  if (v.kind === 'kits') {
    const K = chunk.map((w, i) => ({...BKT.kit({w, b, slot: 'bkkit' + i}), label: w.artist}));
    const code = b.codes && b.codes.artist;
    const dm = `Hi {first name}, your feature for ${name} is live on our page today. Here is a story frame made for you: share it and tag @artstoheartsproject, and we'll reshare it.${sale.open ? ` ${sale.line.replace('. Link in bio.', '')} at shop.artstoheartsproject.com.` : ''}${b.codesLive && code ? ` Your artist code for the book is ${code}${b.codes.friends ? `, and friends and family can use ${b.codes.friends}` : ''}.` : ''} Thank you for being part of the book.`;
    return [{...base, title: `${name} · Share kits ${p} of ${parts}`, meta: `${K.length} story frames, one per artist in features ${p} · send each artist theirs with the message below`, slides: K.map((s, j) => ({...s, title: 'share-kit-' + ((p - 1) * BK_PER + j + 1)})), story: true, cap: dm, pin: ''}];
  }
  const longest = Math.max(0, ...chunk.map(w => w.line.length));
  const S = [BKT.cover({img: chunk[0] && chunk[0].img, serif: 'Meet the artists of', big: b.name}),
    ...chunk.map((w, i) => HLT.work({w: {...w, about: bkCut(w.line, longest > 160 ? 150 : 170)}, img: w.img, slot: 'bkw' + i, under: true})),
    BKT.book({b, img: bkImg(b.shop && b.shop.image), line: `${n} artists, one book${b.pages ? `, ${b.pages} pages` : ''}. Every page chosen by our jury.`}),
    BKT.end({head: sale.open ? sale.line.replace(' Link in bio.', '') : `${name} opens for pre-order soon.`, sub: sale.open ? 'Link in bio.' : 'Follow along to meet every artist in the book.'})];
  const cap = `Meet ${chunk.length} of the ${n} artists in ${name}.\n\n${chunk.map(w => `${w.artist}${w.handle ? ' ' + w.handle : ''}${w.title ? `, ${w.title}` : ''}`).join('\n')}\n\nEvery one of them is in the book.\n${sale.line}\n\n${tags}`;
  return [{...base, title: `${name} · Artist features ${p} of ${parts}`, meta: `${S.length} slides · tag the ${chunk.length} artists in the image · then send each artist their share kit`, slides: S.map((s, j) => ({...s, title: `features-${p}-${j + 1}`})), cap, pin: sale.line}];
}
function bookPostsBar(b, i){
  const n = (b.artists || []).length; if (!n) return '';
  const parts = Math.ceil(n / BK_PER); const opt = k => Array.from({length: parts}, (_, j) => `<option value="${j + 1}"${BOOKVIEW && BOOKVIEW.kind === k && BOOKVIEW.part === j + 1 ? ' selected' : ''}>${j + 1} of ${parts}</option>`).join('');
  return `<div class="bk-posts"><b>Posts</b>
    <button type="button" class="btn ghost" data-bkv="announce">Selected artists</button>
    <span class="bk-pick"><button type="button" class="btn ghost" data-bkv="features">Artist features</button><select data-bkp="features">${opt('features')}</select></span>
    <span class="bk-pick"><button type="button" class="btn ghost" data-bkv="kits">Share kits</button><select data-bkp="kits">${opt('kits')}</select></span>
    ${BOOKVIEW ? '<button type="button" class="btn ghost" data-bkv="close">Close posts</button>' : ''}</div>`;
}
function bookShowPosts(i, kind, part){
  if (kind === 'close') { BOOKVIEW = null; document.body.classList.remove('bkposts'); booksRender(); return; }
  BOOKVIEW = {book: i, kind, part: part || 1}; document.body.classList.add('bkposts'); booksRender(); render();
  const o = document.getElementById('out'); if (o) o.scrollIntoView({behavior: 'smooth'});
}

// what's inside the book, read from its Final Review PDF
function bookInside(b){
  if (!b.links || !b.links.pdf) return '<p class="meta">Add the Final Review PDF link in Books Data to see what\'s inside.</p>';
  if (!b.inside) return `<p class="bk-warn">${bkEsc(b.insideError || 'The Final Review PDF will be read on the next sync.')}</p>`;
  const i = b.inside; const row = (k, v) => v ? `<div class="bk-in"><b>${k}</b><div>${v}</div></div>` : '';
  const ivs = (i.interviews || []).filter(x => x.intro || x.quotes && x.quotes.length).map(x => `<div class="bk-iv"><p><b>${bkEsc(x.name)}</b> ${bkEsc(x.handle || '')} · <i>${bkEsc(x.role || '')}</i>${x.page ? ' · page ' + x.page : ''}</p><p class="meta">${bkEsc(x.title ? x.title.charAt(0) + x.title.slice(1).toLowerCase() : '')}</p>${x.quotes && x.quotes[0] ? `<blockquote>“${bkEsc(x.quotes[0])}”</blockquote>` : ''}</div>`).join('');
  return `<section class="bk-inside"><h3>Inside the book</h3>
    ${row('Cover', i.cover ? bkEsc(i.cover.title ? `${i.cover.title}${i.cover.year ? ' (' + i.cover.year + ')' : ''} by ${i.cover.artist}` : i.cover.credit) : '')}
    ${row('Theme', i.theme ? `<b>${bkEsc(i.theme.title)}</b><br>${bkEsc((i.theme.text || '').slice(0, 280))}${(i.theme.text || '').length > 280 ? '…' : ''}` : '')}
    ${row("Editor's note", i.editor && i.editor.text ? bkEsc(i.editor.text.slice(0, 280)) + '…' : '')}
    ${row('Articles', (i.articles || []).map(a => bkEsc(`${a.title.charAt(0) + a.title.slice(1).toLowerCase()} by ${a.by}`)).join('<br>'))}
    ${row('Featured artists', i.artists && i.artists.length ? `${i.artists.length} artists, with page numbers` : '')}
    ${ivs ? `<div class="bk-ivs">${ivs}</div>` : ''}</section>`;
}
