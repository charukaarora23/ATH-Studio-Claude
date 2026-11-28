// Call manager (Open calls tab): one shared list of every open call, so the team never has to set a call up by hand again.
// - Add a call by pasting its link (or the page text). The details are read with rules and can be corrected.
// - Each call keeps ONE keyword, its own hashtags and its real dates (opens → closes). These core fields are shared
//   with the team and always win over a browser's local draft, so every post asks for the same keyword.
// - The month of posts is spread over the call's real length (callPlan): fixed countdown posts stay on their day,
//   the rest spread evenly, and gaps longer than 3 days are filled with single graphics. The calendar uses this plan.
// Shared store: api/calls.js → calls/calls.json. A shared entry id is the call's name in the Open call menu.

let SHAREDC = {}, CM_LOADED = false, CM_MODE = 'local', CM_EDIT = null, CM_DRAFT = null, CM_MSG = '';
const CORE = ['name', 'series', 'edition', 'editionLabel', 'keyword', 'deadline', 'opens', 'link', 'fee', 'selected', 'hashtags', 'style', 'colour', 'jury', 'prize', 'results'];
const cmDay = s => { const d = new Date(String(s || '') + 'T00:00:00'); return isNaN(d) ? null : d; };
const cmFmt = d => d ? `${d.getDate()} ${MONTHS[d.getMonth()]}` : '–';

// ---------- shared overlay ----------
async function cmLoad(){
  try { const r = await fetch('api/calls', {cache: 'no-store'}); if (!r.ok) throw 0; const j = await r.json(); SHAREDC = {}; (j.calls || []).forEach(c => SHAREDC[c.id] = c); CM_MODE = 'shared'; }
  catch { try { SHAREDC = JSON.parse(localStorage.getItem('athCalls') || '{}'); } catch { SHAREDC = {}; } CM_MODE = 'local'; }
  CM_LOADED = true; cmRegister();
}
// new calls become entries in the Open call menu; preset calls get the team's core fields
function cmRegister(){
  Object.values(SHAREDC).forEach(c => { if (c.isNew && !PRESETS[c.id]) PRESETS[c.id] = {...cmBase(c.f), ...c.f}; });
  const cur = $('preset').value, blank = Object.keys(PRESETS).find(n => /blank/i.test(n));
  const names = Object.keys(PRESETS).filter(n => n !== blank && !(SHAREDC[n] && SHAREDC[n].archived)).concat(blank ? [blank] : []);
  $('preset').innerHTML = names.map(k => `<option>${esc(k)}</option>`).join('') + (Object.values(SHAREDC).some(c => c.archived) ? `<optgroup label="Archived">${Object.values(SHAREDC).filter(c => c.archived && PRESETS[c.id]).map(c => `<option>${esc(c.id)}</option>`).join('')}</optgroup>` : '');
  if ([...$('preset').options].some(o => o.value === cur)) $('preset').value = cur;
  else { let last = null; try { last = localStorage.getItem('athLastPreset'); } catch {} if (last && PRESETS[last]) $('preset').value = last; }
}
// called from loadCall: the team's core fields win over this browser's draft
function cmApply(n){ const c = SHAREDC[n]; if (!c || !c.f) return; CORE.forEach(k => { if (c.f[k] !== undefined && c.f[k] !== '') state[k] = c.f[k]; }); }
const cmManaged = n => !!SHAREDC[n];
function cmLockForm(){ const m = cmManaged($('preset').value); ['keyword', 'deadline', 'name', 'series'].forEach(k => { const el = $(k); if (!el) return; el.readOnly = m; el.title = m ? 'Shared with the team. Change it in the Call manager.' : ''; el.style.background = m ? '#f4f1ee' : ''; }); }

// ---------- the call's real dates ----------
function cmOpens(s){ const o = cmDay(s.opens), d = cmDay(s.deadline); if (o) return o; if (!d) return null; const x = new Date(d); x.setDate(x.getDate() - 30); return x; }
function cmStatus(s, archived){ const today = new Date(); today.setHours(0, 0, 0, 0); const d = cmDay(s.deadline), o = cmOpens(s);
  if (archived) return {k: 'arch', t: 'Archived'}; if (!d) return {k: 'warn', t: 'No deadline'};
  if (o && o > today) return {k: 'up', t: `Opens ${cmFmt(o)}`};
  const left = Math.round((d - today) / DAYMS); if (left >= 0) return {k: 'open', t: left === 0 ? 'Closes today' : `Open · ${left} day${left > 1 ? 's' : ''} left`};
  return {k: 'closed', t: `Closed ${cmFmt(d)}`}; }

// The month's posts spread over the call's real length. Returns [{left, i|s, title, kind}] (left = days before the deadline).
const ANCHORS = {'Launch': 'L', 'Halfway: the call at a glance': 15, 'Prepare your submission': 9, 'One week left': 7, '48 hours: last questions': 2, 'Last day': 0};
function callPlan(L){
  L = Math.max(7, Math.min(120, Math.round(L || 30))); const posts = monthPosts(), used = new Map(), out = [];
  const take = (left, item) => { used.set(left, item); out.push({left, ...item}); };
  posts.forEach((p, i) => { const a = ANCHORS[p.title]; if (a === undefined) return; const left = a === 'L' ? L : a; if (left <= L && !used.has(left)) take(left, {i, title: p.title, kind: p.kind}); });
  const free = posts.map((p, i) => ({p, i})).filter(x => ANCHORS[x.p.title] === undefined);
  free.forEach(({p, i}) => { const want = Math.round(3 + (p.left - 3) * (L - 4) / 27); let best = null;
    for (let k = 0; k <= L; k++) { for (const t of [want - k, want + k]) { if (t > 0 && t < L && !used.has(t)) { best = t; break; } } if (best !== null) break; }
    if (best !== null) take(best, {i, title: p.title, kind: p.kind}); });
  // no call goes more than 3 days without a feed post: fill long gaps with single graphics
  const fill = singlePosts().map((p, s) => ({p, s})).filter(x => /glance|theme|get published/i.test(x.p.title)); let f = 0;
  if (fill.length) { const days = [...used.keys()].sort((a, b) => b - a);
    for (let j = 0; j < days.length - 1; j++) { let a = days[j]; const b = days[j + 1]; while (a - b > 4) { a -= 3; const x = fill[f++ % fill.length]; take(a, {s: x.s, title: x.p.title, kind: 'Single graphic'}); } } }
  return out.sort((a, b) => b.left - a.left);
}
const cmLen = s => { const o = cmOpens(s), d = cmDay(s.deadline); return o && d ? Math.round((d - o) / DAYMS) : 30; };
function cmGap(plan){ const d = plan.map(x => x.left).sort((a, b) => b - a); let g = 0; for (let j = 0; j < d.length - 1; j++) g = Math.max(g, d[j] - d[j + 1]); return g; }

// ---------- hashtags per series (no more #101ArtBook on a magazine call) ----------
function tagsFor(s){ s = s || state; if (s.hashtags) return s.hashtags.trim();
  const t = `${s.series || ''} ${s.name || ''}`, yr = (cmDay(s.deadline) || new Date()).getFullYear();
  const set = ['#ArtsToHeartsProject', '#OpenCall', '#CallForArtists', '#CallForArtists' + yr];
  if (/magazine/i.test(t)) set.push('#ArtsToHeartsMagazine', '#ArtMagazine', '#GetPublished');
  else if (/101 art ?book/i.test(t)) set.push('#101ArtBook', '#ArtBook', '#GetPublished');
  else if (/wom[ae]n/i.test(t)) set.push('#WomenArtists', '#WomenInArt', '#ArtAward');
  else if (/of the year|award|prize/i.test(t)) set.push('#ArtAward', '#ArtCompetition', '#ArtistOpportunity');
  else set.push('#ArtistOpportunity', '#GetPublished');
  return set.join(' '); }

// ---------- the same call already in the studio? ----------
function cmClean(u){ try { const x = new URL(String(u || '').trim()); [...x.searchParams.keys()].filter(k => /^utm_|^fbclid$|^gclid$/i.test(k)).forEach(k => x.searchParams.delete(k)); x.hash = ''; return x.href.replace(/\?$/, ''); } catch { return String(u || '').trim(); } }
const cmNorm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
// every version of this call (e.g. Issue 16 and Issue 16 · Gallery): same series + name, or the same link
function cmMatches(f){ const key = cmNorm(`${f.series} ${f.name}`), link = cmClean(f.link);
  return cmAllCalls().filter(c => c.st.k !== 'arch' && (cmNorm(`${c.s.series} ${c.s.name}`) === key || (link && cmClean(c.s.link) === link))).map(c => c.id); }

// ---------- reading a call page ----------
const MONI = {jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11};
function cmDates(t){ const out = [], now = new Date(); const yr = (y, m, d) => { if (y) return +y; const c = new Date(now.getFullYear(), m, d); return c < new Date(now - 60 * DAYMS) ? now.getFullYear() + 1 : now.getFullYear(); };
  const mon = '(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?';
  let m; const r1 = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+of)?\\s+${mon},?\\s*(\\d{4})?`, 'gi'), r2 = new RegExp(`\\b${mon}\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s*(\\d{4})?`, 'gi'), r3 = /\b(20\d\d)-(\d\d)-(\d\d)\b/g;
  while ((m = r1.exec(t))) { const mo = MONI[m[2].slice(0, 3).toLowerCase()]; out.push({at: m.index, d: new Date(yr(m[3], mo, +m[1]), mo, +m[1])}); }
  while ((m = r2.exec(t))) { const mo = MONI[m[1].slice(0, 3).toLowerCase()]; out.push({at: m.index, d: new Date(yr(m[3], mo, +m[2]), mo, +m[2])}); }
  while ((m = r3.exec(t))) out.push({at: m.index, d: new Date(+m[1], +m[2] - 1, +m[3])});
  return out.filter(x => !isNaN(x.d) && x.d.getDate() > 0); }
function cmNear(t, dates, re){ let best = null; let m; const g = new RegExp(re.source, 'gi');
  while ((m = g.exec(t))) { const d = dates.filter(x => x.at >= m.index && x.at - m.index < 140).sort((a, b) => a.at - b.at)[0]; if (d) { best = d.d; break; } } return best; }
const isoOf = d => d ? isoD(d) : '';
function cmSentence(t, re){ const s = t.split(/(?<=[.!?])\s+|\n+/).find(x => re.test(x) && x.length < 260); return s ? s.trim() : ''; }
function cmParse(title, text, link){
  const t = String(text || ''), all = `${title || ''}\n${t}`, f = {link: link || ''};
  let name = String(title || '').split('\n')[0].replace(/\s*[|–—-]\s*(arts to hearts|ath).*$/i, '').replace(/^(open call( for artists)?|call for artists)\s*[:–—-]\s*/i, '').trim();
  const issue = /issue\s*(\d{1,3})/i.exec(all);
  if (/magazine/i.test(all.slice(0, 600)) && issue) { f.series = 'Arts to Hearts Magazine'; f.name = 'Issue ' + issue[1]; f.edition = issue[1]; f.style = 'magazine'; f.seriesNoun = 'issues'; }
  else if (/101 art ?book/i.test(all.slice(0, 800))) { f.series = '101 Art Book'; f.name = name.replace(/^101 art ?book\s*[:–—-]?\s*/i, '') || name; f.style = 'gallery'; const ed = /edition[ \t]*(?:no\.?[ \t]*)?(\d{1,3})\b(?![ \t]*(art|artists))/i.exec(all); if (ed) f.edition = ed[1]; }
  else { f.series = 'Arts to Hearts'; f.name = name; f.style = /wom[ae]n/i.test(name) ? 'editorial' : /award|of the year|prize/i.test(name) ? 'award' : 'gallery'; }
  const dates = cmDates(t);
  const dl = cmNear(t, dates, /deadline|closes?\b|close on|closing date|last date|submissions? (close|end)|due (by|on)|apply (by|before)/) || (dates.map(x => x.d).filter(d => d > new Date()).sort((a, b) => b - a)[0]);
  f.deadline = isoOf(dl);
  const op = cmNear(t, dates, /opens?\b|open from|launch(es|ed)?|starts?|now open/); if (op && dl && op < dl) f.opens = isoOf(op); else f.opens = isoD(new Date());
  const sel = /(\d{2,4})\s+(?:artists|places|spots|creatives)\b[^.\n]{0,50}?(?:selected|featured|published|chosen)/i.exec(t) || /select(?:ing|ed)?\s+(\d{2,4})\s+artists/i.exec(t) || /(\d{2,4})\s+selected artists/i.exec(t); if (sel) f.selected = sel[1];
  if (/free to (apply|enter|submit)|no (entry|application|submission) fee/i.test(t)) f.fee = 'free';
  else { const fee = /(?:fee|entry|application)[^.$\n]{0,40}\$\s?(\d+(?:\.\d{2})?)/i.exec(t) || /\$\s?(\d+(?:\.\d{2})?)\s*(?:usd\s*)?(?:entry|application|submission) fee/i.exec(t); if (fee) f.fee = '$' + fee[1]; }
  const prize = /\$\s?([\d,]{3,})\s*(?:usd\s*)?(?:cash\s*)?(?:award|prize|grant)/i.exec(t); if (prize) f.prize = '$' + prize[1];
  const jl = /guest curator|curated by|juror|juried by|jury|curator/i.exec(t); if (jl) { const jn = /^\s*(?:is\s+)?[:\-–]?\s*((?:[A-Z][\p{L}.'’-]+)(?:\s+[A-Z][\p{L}.'’-]+){1,3})/u.exec(t.slice(jl.index + jl[0].length)); if (jn && !/arts to hearts|will|the jury/i.test(jn[1])) f.jury = jn[1].trim(); }
  const theme = /theme\s*[:\-–]\s*["“]?([^\n"”]{3,80})/i.exec(t) || /theme[^.\n]{0,20}["“]([^"”]{3,70})["”]/i.exec(t); if (theme) f.theme = theme[1].replace(/[.,;]+$/, '').trim();
  const tl = cmSentence(t, /invite[sd]? artists|we are looking for|we invite|explore|celebrat/i) || cmSentence(t.replace(/theme\s*[:\-–][^\n]*/i, ''), /theme/i); if (tl) { f.themeLine = tl; f.themeIntro = tl; }
  const el = cmSentence(t, /18\+|aged 18|over 18|18 (years|and (over|above))|worldwide|all nationalities|open to (all )?artists/i); if (el) f.elig = el;
  f.who = /women artists?|woman artists?/i.test(all.slice(0, 1500)) ? 'women artists' : 'artists';
  const res = cmNear(t, dates, /results|announced|notified|notification/); if (res) f.results = cmFmt(res);
  const lines = t.split('\n').map(x => x.trim()); const h = lines.findIndex(x => /what (you|selected artists|winners?) (will )?(receive|get)|benefits|perks|selected artists receive/i.test(x) && x.length < 90);
  if (h >= 0) { const b = lines.slice(h + 1, h + 12).filter(x => x && x.length < 140 && !/^(apply|submit|deadline)/i.test(x)).slice(0, 6); if (b.length >= 2) f.benefits = b.map(x => x.replace(/^[•·\-–*\d.)\s]+/, '').replace(/:\s*/, ' | ')).map(x => x.includes('|') ? x : x + ' | ').join('\n'); }
  f.keyword = cmKeyword(f); f.colour = cmColour(f);
  return f; }
function cmKeyword(f, self){ const stop = /^(the|arts?|to|hearts?|book|edition|open|call|for|artists?|of|and|a|an|magazine|award|\d+)$/i;
  let k = f.style === 'magazine' && f.edition ? 'ISSUE' + f.edition : (String(f.name || '').split(/[^A-Za-z0-9]+/).find(w => w && !stop.test(w)) || 'APPLY').toUpperCase();
  const taken = cmAllCalls().filter(c => c.id !== self && c.st.k !== 'closed' && c.st.k !== 'arch').map(c => c.kw); if (taken.includes(k)) { const y = String((cmDay(f.deadline) || new Date()).getFullYear()).slice(2); k = k + y; } return k; }
function cmColour(f){ const used = cmAllCalls().filter(c => c.st.k === 'open' || c.st.k === 'up').map(c => String(c.s.colour).toLowerCase());
  return Object.values(COLOURS).find(c => !used.includes(c.toLowerCase())) || Object.values(COLOURS)[0]; }
// what a brand-new call starts from: the closest existing call of the same kind, without its theme, credits or pictures
function cmBase(f){ const t = `${f.series || ''} ${f.name || ''}`;
  const src = /magazine/i.test(t) ? PRESETS['Arts to Hearts Magazine Issue 16'] : /wom[ae]n/i.test(t) ? PRESETS['Woman Artist Award 2026'] : /of the year/i.test(t) ? PRESETS['Artist of the Year 2026'] : {};
  const keep = {...DEFAULTS, ...(src || {})};
  ['quote', 'submit', 'theme', 'themeWork', 'themeLine', 'themeIntro', 'kinds', 'juryLooks', 'credit', 'themeCredit', 'themeArts', 'poolCredits', 'artists', 'coverArtists', 'jury', 'results', 'pub', 'storyWork', 'storyAfter', 'magSlides', 'galTheme', 'coverStyle', 'noCredits', 'editionLabel', 'edition', 'credit'].forEach(k => keep[k] = '');   // empty, not deleted: DEFAULTS (Garden) would fill them back in
  ['magSlides', 'galTheme', 'coverStyle', 'noCredits'].forEach(k => delete keep[k]);
  // the call's own words from its page, never another call's theme
  if (f.themeLine) { keep.quote = f.themeLine; keep.submit = f.themeLine + ' Any medium. Original work only, no AI.'; keep.themeIntro = f.themeLine; }
  if (f.theme) keep.themeWork = 'work';
  keep.editionLabel = f.edition ? (/magazine/i.test(t) ? 'Issue ' + f.edition : 'Edition ' + f.edition) : '';
  keep.seriesNoun = /magazine/i.test(t) ? 'issues' : /101 art ?book/i.test(t) ? 'editions' : 'books';
  return {...keep, images: {}}; }

// ---------- every call, one list ----------
function cmAllCalls(){ const blank = n => /blank/i.test(n);
  return Object.keys(PRESETS).filter(n => !blank(n)).map(n => { let d = null; try { d = JSON.parse(localStorage.getItem(DKEY(n)) || 'null'); } catch {}
    const sh = SHAREDC[n]; const s = {...DEFAULTS, ...PRESETS[n], ...(d || {})}; if (sh && sh.f) CORE.forEach(k => { if (sh.f[k] !== undefined && sh.f[k] !== '') s[k] = sh.f[k]; });
    if (n === $('preset').value) CORE.forEach(k => { if (state[k] !== undefined) s[k] = state[k]; });
    return {id: n, s, sh, kw: String(s.keyword || '').toUpperCase(), st: cmStatus(s, sh && sh.archived)}; }); }

// ---------- the manager view ----------
function callMgrHTML(){
  if (!CM_LOADED) { cmLoad().then(() => { if ($('ptype').value === 'callmgr') render(); }); return '<section class="group"><p class="meta">Loading the calls…</p></section>'; }
  const calls = cmAllCalls(); const order = {open: 0, up: 1, warn: 2, closed: 3, arch: 4};
  calls.sort((a, b) => (order[a.st.k] - order[b.st.k]) || ((cmDay(a.s.deadline) || 0) - (cmDay(b.s.deadline) || 0)));
  const live = calls.filter(c => c.st.k === 'open' || c.st.k === 'up');
  const dupe = kw => live.filter(c => c.kw === kw).length > 1;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const row = c => { const plan = c.st.k === 'arch' ? [] : callPlan(cmLen(c.s)); const d = cmDay(c.s.deadline); const left = d ? Math.round((d - today) / DAYMS) : 99;
    const next = plan.filter(x => x.left <= left && x.left >= 0).slice(0, 3).map(x => { const dt = new Date(d); dt.setDate(dt.getDate() - x.left); return `${cmFmt(dt)} · ${esc(x.title)}`; });
    const warns = []; if (!c.kw) warns.push('No keyword'); if (dupe(c.kw)) warns.push(`“${esc(c.kw)}” is also used by ${esc(live.filter(x => x.kw === c.kw && x.id !== c.id).map(x => x.id).join(', '))}: if these are two versions of one call, archive the one you are not posting`);
    if (!c.s.link && c.st.k !== 'closed' && c.st.k !== 'arch') warns.push('No link to the call page'); if (c.st.k === 'closed' && left < -7) warns.push('Closed over a week ago: archive it');
    if (c.st.k !== 'arch' && cmGap(plan) > 4) warns.push(`A ${cmGap(plan)}-day gap without a post`);
    if (!c.sh && c.st.k !== 'closed' && c.st.k !== 'arch') warns.push('Not shared yet: press Edit, check, Save');
    return `<div class="cm-row cm-${c.st.k}"><span class="cal-dot" style="background:${esc(c.s.colour)}"></span>
      <div class="cm-main"><b>${esc(c.id)}</b> <span class="cm-chip cm-${c.st.k}">${esc(c.st.t)}</span><br>
        <small>${cmFmt(cmOpens(c.s))} → ${cmFmt(d)} · ${cmLen(c.s)} days · keyword <b class="cm-kw">${esc(c.kw || '—')}</b>${c.s.fee ? ' · fee ' + esc(c.s.fee) : ''}${c.s.link ? ` · <a href="${esc(c.s.link)}" target="_blank" rel="noopener">call page</a>` : ''}</small><br>
        <small class="cm-tags">${esc(tagsFor(c.s))}</small>
        ${next.length ? `<div class="cm-next">Next: ${next.join(' &nbsp;·&nbsp; ')}</div>` : ''}
        ${warns.length ? `<div class="cm-warn">${warns.join(' · ')}</div>` : ''}</div>
      <div class="cm-act"><button type="button" class="btn ghost" data-cm-edit="${esc(c.id)}">Edit</button><button type="button" class="btn ghost" data-cm-open="${esc(c.id)}">Open posts</button>
        <button type="button" class="btn ghost" data-cm-arch="${esc(c.id)}">${c.st.k === 'arch' ? 'Restore' : 'Archive'}</button></div></div>
      ${CM_EDIT === c.id ? cmForm(c.s, c.id) : ''}`; };
  const sec = (h, list) => list.length ? `<h3 class="cm-h">${h}</h3>${list.map(row).join('')}` : '';
  return `<section class="group cm"><div class="ghead"><h2>Call manager</h2><span class="ghr"><span class="cal-mode ${CM_MODE}">${CM_MODE === 'shared' ? 'Shared with the team' : 'Saved in this browser only'}</span></span></div>
    <p class="hint">Add a call once: paste its link, check the details, save. The keyword, hashtags and dates then stay the same in every post, and the posts are spread over the call's real dates on the Calendar.</p>
    <div class="cm-add"><div class="row2" style="align-items:end"><div class="f" style="flex:1"><label for="cmUrl">New call: link to the call page</label><input id="cmUrl" placeholder="https://submit.artstoheartsproject.com/…"></div><button type="button" class="btn" id="cmImport">Read the call</button></div>
      <details><summary>The link does not work? Paste the page instead</summary><p class="hint">Open the call page, press Ctrl+A then Ctrl+C, and paste it here.</p><textarea id="cmPaste" style="min-height:110px;width:100%"></textarea><button type="button" class="btn ghost" id="cmPasteGo">Read the pasted page</button></details>
      ${CM_MSG ? `<p class="hint cm-msg">${CM_MSG}</p>` : ''}
      ${CM_DRAFT ? cmForm(CM_DRAFT, null) : ''}</div>
    ${sec('Open and upcoming', calls.filter(c => ['open', 'up', 'warn'].includes(c.st.k)))}${sec('Closed', calls.filter(c => c.st.k === 'closed'))}${sec('Archived', calls.filter(c => c.st.k === 'arch'))}
  </section>`;
}
const CMF = [['link', 'Link to the call page'], ['series', 'Series'], ['name', 'Edition name'], ['keyword', 'Keyword (one per call)'], ['opens', 'Opens', 'date'], ['deadline', 'Deadline', 'date'], ['selected', 'Artists selected'], ['fee', 'Application fee'], ['prize', 'Winner award'], ['jury', 'Juror / curator'], ['results', 'Results date'], ['theme', 'Theme (short)'], ['themeLine', 'Theme, described', 'area'], ['elig', 'Who can apply', 'area'], ['hashtags', 'Hashtags (empty = automatic for the series)']];
function cmForm(s, id){ const v = k => esc(s[k] ?? '');
  return `<div class="cm-form" data-cm-form="${esc(id || '')}"><div class="cm-grid">${CMF.map(([k, l, ty]) => `<div class="f"><label>${l}</label>${ty === 'area' ? `<textarea data-cmf="${k}">${v(k)}</textarea>` : `<input data-cmf="${k}" ${ty === 'date' ? 'type="date"' : ''} value="${v(k)}"${k === 'hashtags' ? ` placeholder="${esc(tagsFor({...s, hashtags: ''}))}"` : ''}>`}</div>`).join('')}
    <div class="f"><label>Visual style</label><select data-cmf="style">${[['gallery', 'Gallery'], ['award', 'Award'], ['editorial', 'Editorial'], ['magazine', 'Magazine']].map(([k, l]) => `<option value="${k}" ${s.style === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
    ${s._text ? `<details><summary>Page text that was read</summary><pre class="cm-pre">${esc(String(s._text).slice(0, 4000))}</pre></details>` : ''}
    <div class="cm-btns"><button type="button" class="btn" data-cm-save="${esc(id || '')}">${id ? 'Save for the team' : s._match && s._match.length ? 'Update ' + (s._match.length > 1 ? 'both versions' : 'this call') : 'Add this call'}</button><button type="button" class="btn ghost" data-cm-cancel>Cancel</button></div></div>`; }
function cmReadForm(box){ const f = {}; box.querySelectorAll('[data-cmf]').forEach(el => f[el.dataset.cmf] = el.value.trim()); if (f.keyword) f.keyword = f.keyword.toUpperCase().replace(/[^A-Z0-9]/g, ''); return f; }
async function cmSave(id, f, extra = {}){ let who = ''; try { who = localStorage.getItem('athWho') || ''; } catch {}
  const prev = SHAREDC[id] || {}; const call = {id, link: f.link || prev.link || '', f: {...(prev.f || {}), ...f}, archived: extra.archived ?? !!prev.archived, isNew: extra.isNew ?? !!prev.isNew, by: who};
  SHAREDC[id] = {...call, updated: new Date().toISOString()};
  if (CM_MODE === 'shared') { try { const r = await fetch('api/calls', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({action: 'save', call})}); if (!r.ok) throw 0; const j = await r.json(); SHAREDC = {}; (j.calls || []).forEach(c => SHAREDC[c.id] = c); }
    catch { CM_MODE = 'local'; status('Could not reach the shared list. Saved in this browser for now.'); } }
  if (CM_MODE === 'local') { try { localStorage.setItem('athCalls', JSON.stringify(SHAREDC)); } catch {} }
  cmRegister(); }
async function cmImport(link, pasted){
  CM_MSG = 'Reading the call…'; render(); let title = '', text = pasted || '', images = [];
  if (!pasted) { try { const r = await fetch('api/calls', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({action: 'import', url: link})}); const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Could not read the page.'); title = j.title; text = j.text; images = j.images || []; }
    catch (e) { CM_MSG = esc(e.message || String(e)) + ' Paste the page below instead.'; CM_DRAFT = null; render(); return; } }
  else title = text.split('\n').find(x => x.trim().length > 3) || '';
  const f = cmParse(title, text, cmClean(link)); f._images = images.map(x => x.url); f._text = text;
  f._match = cmMatches(f); if (f._match.length) { const c0 = cmAllCalls().find(c => c.id === f._match[0]); if (c0 && c0.kw) f.keyword = c0.kw; }
  const miss = ['deadline', 'selected', 'fee', 'theme'].filter(k => !f[k]);
  CM_MSG = `${f._match.length ? `This call is already in the studio (${f._match.map(esc).join(', ')}). Saving updates its link, dates and details; its slides, pictures and look stay as they are. ` : ''}Read. Check the details below${miss.length ? `; not found on the page: ${miss.join(', ')}` : ''}. ${images.length ? images.length + ' pictures copied.' : ''}`; CM_DRAFT = f; render(); }
function wireCallMgr(){ const out = $('out');
  const go = $('cmImport'); if (go) go.onclick = () => { const u = $('cmUrl').value.trim(); if (!u) return; cmImport(u); };
  const pg = $('cmPasteGo'); if (pg) pg.onclick = () => { const t = $('cmPaste').value; if (t.trim().length < 50) return; cmImport(($('cmUrl').value || '').trim(), t); };
  out.querySelectorAll('[data-cm-edit]').forEach(b => b.onclick = () => { CM_EDIT = CM_EDIT === b.dataset.cmEdit ? null : b.dataset.cmEdit; render(); });
  out.querySelectorAll('[data-cm-cancel]').forEach(b => b.onclick = () => { CM_EDIT = null; CM_DRAFT = null; CM_MSG = ''; render(); });
  out.querySelectorAll('[data-cm-open]').forEach(b => b.onclick = async () => { $('preset').value = b.dataset.cmOpen; await $('preset').onchange(); $('ptype').value = '0'; render(); window.scrollTo({top: 0}); });
  out.querySelectorAll('[data-cm-arch]').forEach(b => b.onclick = async () => { const id = b.dataset.cmArch, c = cmAllCalls().find(x => x.id === id); const arch = !(SHAREDC[id] && SHAREDC[id].archived);
    const f = {}; CORE.forEach(k => { if (c && c.s[k] !== undefined) f[k] = c.s[k]; }); await cmSave(id, f, {archived: arch}); status(arch ? `"${id}" archived: off the calendar and the menu.` : `"${id}" is back.`); render(); });
  out.querySelectorAll('[data-cm-save]').forEach(b => b.onclick = async () => { const box = b.closest('.cm-form'), id0 = b.dataset.cmSave; const f = cmReadForm(box); if (f.link) f.link = cmClean(f.link);
    const match = !id0 && CM_DRAFT ? (CM_DRAFT._match || []).concat(cmMatches(f)).filter((x, i, a) => a.indexOf(x) === i) : [];
    if (!f.name || !f.deadline) { status('A call needs at least an edition name and a deadline.'); return; }
    if (!f.keyword) f.keyword = cmKeyword(f, id0);
    const clash = cmAllCalls().find(c => c.id !== id0 && !match.includes(c.id) && (c.st.k === 'open' || c.st.k === 'up') && c.kw === f.keyword); if (clash) { status(`The keyword “${f.keyword}” is already used by "${clash.id}". Pick another one.`); return; }
    if (id0) { await cmSave(id0, f); CM_EDIT = null; if ($('preset').value === id0) { await $('preset').onchange(); $('ptype').value = 'callmgr'; } status(`"${id0}" saved for the team.`); render(); return; }
    if (match.length) { const facts = {...f}; delete facts.style; delete facts.colour;   // each version keeps its own look
      for (const m of match) await cmSave(m, facts); CM_DRAFT = null; CM_MSG = '';
      if (match.includes($('preset').value)) { await $('preset').onchange(); $('ptype').value = 'callmgr'; } status(`Updated ${match.join(' and ')}.`); render(); return; }
    const d = CM_DRAFT || {}; const id = `${f.series === 'Arts to Hearts' ? '' : f.series + ' '}${f.name}`.trim();
    const full = {...f, colour: d.colour || cmColour(f), edition: d.edition || '', themeIntro: f.themeLine || '', who: d.who || 'artists', benefits: d.benefits || undefined};
    if (!full.benefits) delete full.benefits;
    const imgs = (d._images || []).slice(0, 10); full.images = imgs.length ? Object.fromEntries([['imgCover', imgs[0]], ...imgs.slice(1).map((u, j) => ['pool' + (j + 1), u])]) : {};
    if (PRESETS[id]) { status(`"${id}" already exists. Use Edit on it instead.`); return; }   // never overwrite a call's slides and pictures
    PRESETS[id] = {...cmBase(full), ...full}; await cmSave(id, full, {isNew: true}); CM_DRAFT = null; CM_MSG = ''; status(`"${id}" added. Open its posts to check the launch carousel.`); render(); }); }

// ---------- styles ----------
(() => { const st = document.createElement('style'); st.textContent = `
.cm .cm-add{background:#faf7f5;border-radius:12px;padding:14px 16px;margin:10px 0 18px}
.cm .row2{display:flex;gap:10px}.cm .cm-h{margin:18px 0 6px;font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.cm-row{display:flex;gap:10px;align-items:flex-start;padding:12px 0;border-top:1px solid #eee}.cm-row .cal-dot{margin-top:6px;flex:none}
.cm-main{flex:1;min-width:0;line-height:1.45}.cm-act{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.cm-chip{display:inline-block;font-size:12px;padding:2px 8px;border-radius:999px;background:#eee;margin-left:4px}
.cm-chip.cm-open{background:#FAD2E1;color:#6A0620}.cm-chip.cm-up{background:#e8eefc;color:#1d3d7a}.cm-chip.cm-closed,.cm-chip.cm-arch{background:#eee;color:#666}.cm-chip.cm-warn{background:#fde2d8;color:#8a2b0f}
.cm-kw{letter-spacing:.04em;color:#6A0620}.cm-tags{color:var(--muted)}.cm-next{font-size:13px;margin-top:4px}
.cm-warn{font-size:13px;margin-top:4px;color:#8a2b0f}.cm-msg{margin-top:8px}
.cm-form{background:#fff;border:1px solid #eadfd8;border-radius:12px;padding:14px;margin:6px 0 12px}
.cm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:4px 12px}.cm-grid textarea{min-height:60px}
.cm-btns{display:flex;gap:8px;margin-top:10px}.cm-pre{white-space:pre-wrap;font-size:12px;max-height:260px;overflow:auto;background:#faf7f5;padding:8px;border-radius:8px}
.cm-closed .cm-main,.cm-arch .cm-main{opacity:.7}`; document.head.appendChild(st); })();

cmLoad().then(async () => { let last = null; try { last = localStorage.getItem('athLastPreset'); } catch {}
  // reopen the call the page was on (new calls only exist once the shared list is in), with the team's core fields applied
  if (document.body.dataset.seg === 'calls' || !document.body.dataset.seg) { if (last && PRESETS[last]) $('preset').value = last; const keep = $('ptype').value; await $('preset').onchange(); if ([...$('ptype').options].some(o => o.value === keep)) { $('ptype').value = keep; render(); } }
  else { cmLockForm(); } });
