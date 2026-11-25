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
  const facts = [b.status && 'Status: ' + b.status, b.pages && b.pages + ' pages', b.published && b.published + ' published artists', b.designer && 'Designed by ' + b.designer, b.coverArtist && `Cover: ${b.coverArtist.name}${b.coverArtist.handle ? ' ' + b.coverArtist.handle : ''}`, b.tab && 'Sheet tab: ' + b.tab].filter(Boolean).map(bkEsc).join(' · ');
  const arts = (b.artists || []).map(a => { const w = (a.works || [])[0]; return `<div class="bk-a">${w ? `<div class="bk-w" style="background-image:url('${bkEsc(w.img)}')"></div>` : '<div class="bk-w bk-none">No artwork</div>'}<b>${bkEsc(a.name)}</b><span>${bkEsc(a.handle || '')}</span>${w && w.details ? `<i>${bkEsc(w.details)}</i>` : ''}</div>`; }).join('');
  return `<section class="bk-detail"><h2>${bkEsc(b.name)}</h2><p class="meta">${facts}</p>${links ? `<p class="meta">${links}</p>` : ''}
    ${b.loading ? '<p class="meta">Loading the artists…</p>' : arts ? `<div class="bk-arts">${arts}</div>` : `<p class="meta">${b.artistsError ? bkEsc(b.artistsError) + '.' : 'No artists in the sheet yet.'}</p>`}</section>`;
}
function booksRender(){
  const el = document.getElementById('books'); if (!el) return;
  if (!BOOKS && !BOOKBUSY) { booksLoad(false); return; }
  const lib = BOOKS || {books: []}; const q = BOOKQ.toLowerCase();
  const list = lib.books.map((b, i) => [b, i]).filter(([b]) => !q || (b.name + ' ' + b.category + ' ' + b.year).toLowerCase().includes(q));
  const when = lib.synced ? new Date(lib.synced).toLocaleString() : 'never';
  const totalA = lib.books.reduce((n, b) => n + (b.count || 0), 0);
  el.innerHTML = `<div class="bk-top"><div><h1>Books</h1><p class="meta">${lib.books.length} books · ${totalA} artists · last synced ${bkEsc(when)}. Syncs by itself every night.</p>${lib.err ? `<p class="bk-warn">Sync failed: ${bkEsc(lib.err)}</p>` : ''}${(lib.problems || []).length ? `<p class="bk-warn">${lib.problems.length} artist sheet${lib.problems.length > 1 ? 's' : ''} could not be read. Share ${lib.problems.length > 1 ? 'them' : 'it'} with the studio robot.</p>` : ''}</div>
    <div class="bk-act"><input type="search" placeholder="Find a book" value="${bkEsc(BOOKQ)}" id="bkq"><button type="button" class="btn" id="bksync"${BOOKBUSY ? ' disabled' : ''}>${BOOKBUSY ? 'Syncing…' : 'Sync now'}</button></div></div>
    ${BOOKSEL !== null && lib.books[BOOKSEL] ? bookDetail(lib.books[BOOKSEL]) : ''}
    <div class="bk-grid">${list.map(([b, i]) => bookCard(b, i)).join('') || '<p class="meta">No books yet. Press Sync now.</p>'}</div>`;
  el.querySelector('#bksync').onclick = () => booksLoad(true);
  const qi = el.querySelector('#bkq'); qi.oninput = () => { BOOKQ = qi.value; const pos = qi.selectionStart; booksRender(); const n = document.getElementById('bkq'); n.focus(); n.setSelectionRange(pos, pos); };
  el.querySelectorAll('[data-book]').forEach(b => b.onclick = async () => { const i = +b.dataset.book; BOOKSEL = BOOKSEL === i ? null : i; window.scrollTo({top: 0});
    const bk = BOOKSEL !== null && BOOKS.books[i]; if (bk && !bk.artists && bk.count) { bk.loading = true; booksRender(); try { const r = await fetch('/api/books?book=' + i); const j = await r.json(); if (r.ok) bk.artists = j.artists || []; } catch {} bk.loading = false; }
    booksRender(); });
}
