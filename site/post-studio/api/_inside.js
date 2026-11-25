// Reads "what's inside" from a book's final review PDF text (one string per page). Plain rules, no AI.
// Finds: cover art credit, theme, editor's note, interviews (cover artist, invited artists, award winners), articles, artist index.
const clean = s => String(s || '').replace(/\*\*|\*|®|®/g, '').replace(/[ \t]+/g, ' ').trim();
const isUpper = l => /[A-Z]/.test(l) && l === l.toUpperCase() && l.replace(/[^A-Z]/g, '').length >= 6;
const flat = page => clean(String(page || '').replace(/\s*\n\s*/g, ' '));
const paras = page => { const out = []; let cur = ''; String(page || '').split('\n').map(clean).forEach(l => { if (!l) return; cur += (cur ? ' ' : '') + l; if (/[.!?”"’]$/.test(l) && cur.length > 160) { out.push(cur); cur = ''; } }); if (cur) out.push(cur); return out; };
const sentences = t => (String(t).match(/[^.!?]+[.!?]+["”’]?/g) || []).map(s => s.trim());
const tidy = (t, name) => { t = String(t || '').replace(/\b((?:[A-Za-z] ){2,}[A-Za-z])\b/g, m => m.replace(/ /g, '')).replace(/ARTSTOHEARTS\w*\s*\|\s*\d+|\d+\s*\|\s*ARTSTOHEARTS\w*/gi, ' ').replace(/\b([A-Z][A-Z'’.-]+\s+){1,4}[A-Z][A-Z'’.-]+\b/g, ' ').replace(/\s+/g, ' ').trim();
  if (name) { const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); t = t.replace(new RegExp('^(?:.*?)(' + esc + '\\s+)(?=' + esc + ')'), '').replace(new RegExp('^.{0,60}?(?=' + esc + ')'), ''); }
  return t; };
export function readInside(pages){
  const P = pages.map(p => String(p || ''));
  const lines = p => p.split('\n').map(clean).filter(Boolean).flatMap(l => { const m = l.match(/^(.*?[^\d\s|])(\d{1,3})$/); return m && !/^(ISSUE|EDITION|VOL)/i.test(m[1]) && /[A-Za-z]/.test(m[1]) ? [m[1].trim(), m[2]] : [l]; });
  // printed page number n → index in the PDF ("62 | ARTSTOHEARTSPROJECT" or "ARTSTOHEARTSPROJECT | 62")
  const pageOf = n => { const re = new RegExp(`(^|\\n)\\s*(${n}\\s*\\|\\s*ARTSTOHEARTS|ARTSTOHEARTS\\w*\\s*\\|\\s*${n})\\b`, 'i'); const k = P.findIndex(p => re.test(p)); return k >= 0 ? k : Math.min(P.length - 1, n - 1); };
  const out = {pages: P.length, interviews: [], articles: [], artists: []};
  // cover art credit
  const ci = P.findIndex(p => /FRONT COVER ART|COVER ART/i.test(p));
  if (ci >= 0) { const L = lines(P[ci]); const k = L.findIndex(l => /COVER ART/i.test(l)); const credit = (L[k + 1] || '').replace(/,$/, ''); const m = credit.match(/^(.+?)\s*-\s*©\s*(\d{4})?\s*(.+)$/); out.cover = m ? {title: m[1].trim(), year: m[2] || '', artist: m[3].trim()} : {credit}; }
  // contents
  const k0 = P.findIndex(p => /(^|\n)\s*CONTENTS\s*(\n|$)/.test(p));
  if (k0 >= 0) {
    const L = lines(P[k0]);
    L.forEach((l, i) => {
      const m = l.match(/^(In Conversation with|An Interview with|Interview with|Article by|Theme of the (?:Magazine|Book))\s*(.*)$/i); if (!m) return;
      const before = L.slice(0, i).reverse(); const title = before.find(x => isUpper(x) && !/^\d+$/.test(x)) || ''; const page = +(before.find(x => /^\d{1,3}$/.test(x)) || 0);
      const kind = m[1].toLowerCase();
      if (kind.startsWith('theme')) out.theme = {title, page};
      else if (kind.startsWith('article')) out.articles.push({title, by: m[2].trim(), page});
      else out.interviews.push({name: m[2].replace(/^(Award Winner|Cover Artist)\s+/i, '').trim(), award: /award winner/i.test(m[2]), title: title.replace(/:$/, ''), page});
    });
    // featured artists index: name / page / country triples on the pages after contents
    for (let k = k0 + 1; k < Math.min(P.length, k0 + 6); k++) { const L2 = lines(P[k]);
      for (let i = 0; i + 2 < L2.length; i++) if (/^\p{L}[\p{L} .'’-]{2,40}$/u.test(L2[i]) && /^\d{1,3}$/.test(L2[i + 1]) && /^\p{L}[\p{L} .'’-]{2,30}$/u.test(L2[i + 2]) && !isUpper(L2[i])) { out.artists.push({name: L2[i], page: +L2[i + 1], country: L2[i + 2]}); i += 2; } }
  }
  { const seen = new Set(); out.artists = out.artists.filter(a => { const k = a.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }); }
  // theme text
  if (out.theme) { const pg = P[pageOf(out.theme.page)] || ''; const ps = paras(pg).filter(p => p.length > 150); out.theme.text = ps[0] || ''; }
  // editor's note: the page that carries the signature
  const ei = P.findIndex(p => /Editor[’']s Note/i.test(p));
  if (ei >= 0) { const ps = paras(P[ei]).filter(p => p.length > 120); const h = (P[ei].match(/@\s?([A-Za-z0-9._]{3,})/) || [])[1]; out.editor = {text: ps.slice(0, 2).join(' '), handle: h ? '@' + h : ''}; }
  // interviews: intro, handle, role, quotes
  out.interviews.forEach(iv => {
    const start = iv.page ? pageOf(iv.page) : 0; const last = iv.name.split(' ').slice(-1)[0];
    const own = /@\s?(artstoheartsproject|charukaarora)\b/gi; const hasH = k => /@\s?[A-Za-z0-9._]{3,}/.test(P[k].replace(own, ''));
    let at = -1; for (let k = Math.max(0, start - 2); k < Math.min(P.length, start + 6); k++) if (P[k].includes(iv.name) && /An Interview with|Interview by|In Conversation/i.test(P[k])) { at = k; break; }
    if (at < 0) for (let k = Math.max(0, start - 2); k < Math.min(P.length, start + 6); k++) if ((P[k].includes(iv.name) || P[k].includes(last)) && hasH(k)) { at = k; break; }
    if (at < 0) for (let k = Math.max(0, start - 2); k < Math.min(P.length, start + 6); k++) if (P[k].includes(iv.name)) { at = k; break; }
    if (at < 0) return;
    const pg = P[at]; let h = null; for (let k = at; k < Math.min(P.length, at + 2) && !h; k++) h = P[k].replace(own, '').match(/@\s?([A-Za-z0-9._]{3,})/); iv.handle = h ? '@' + h[1] : '';
    const role = pg.match(/An Interview with (Cover Artist|Award Winner|Invited Artist|Curator|Juror)/i); iv.role = role ? role[1] : iv.award ? 'Award Winner' : 'Interview';
    const ss = sentences(flat(pg)).filter(x => x.length > 40 && !/@|https?:|Interview by|What follows/i.test(x));
    const s0 = ss.findIndex(x => x.includes(last)); let intro = ''; for (const x of ss.slice(Math.max(0, s0))) { if (intro.length > 260) break; intro += (intro ? ' ' : '') + x; } iv.intro = tidy(intro, iv.name);
    const by = pg.match(/Interview by:\s*\**\s*([^\n*]+)/i); iv.by = by ? clean(by[1]) : '';
    // quotes: the artist's own first-person sentences from the pages that follow (questions are left out)
    const cand = []; for (let k = at + 1; k < Math.min(P.length, at + 7); k++) sentences(flat(P[k])).forEach(x => { const w = x.split(/\s+/).length; if (w >= 10 && w <= 32 && /\b(I|my|me)\b/.test(x) && !/[?]|ARTSTOHEARTS|\b[a-z] [a-z] [a-z]\b/.test(x)) if (/^[A-Z“"]/.test(x)) cand.push(x); });
    const score = x => (/\b(always|believe|feel|want|love|hope|remember|never|every|light|memory|paint\w*)\b/gi.test(x) ? 2 : 0) + (x.split(/\s+/).length >= 14 ? 1 : 0) - (/^I (was|had|participated|initially)\b/.test(x) ? 1 : 0);
    const q = cand.map((x, i) => [x, score(x), i]).sort((a, b) => b[1] - a[1] || a[2] - b[2]).slice(0, 3).map(x => x[0]);
    iv.quotes = q; delete iv.award;
  });
  return out;
}
