/* ATH Post Studio · ATH EDITORIAL (art business guides from the website).
   Job: give artists something they can act on today, so they save, share and comment the keyword.
   The keyword's DM delivers the guide itself (value first), which puts them on the list. That is the lead.
   Same system as the interviews (grid, fonts, brand line, monogram first and last, Burgundy end card).
   Its own marks: a Cream ground, the question in the artist's own voice, and advice hung on real artworks like wall labels. */

const EDC = {cream: '#F9EEE5', ink: '#1C1310', burg: '#6A0620', soft: 'rgba(28,19,16,.6)', rule: 'rgba(28,19,16,.16)'};
const edBrand = (fg = EDC.ink) => `<p class="a cn" style="left:52px;top:48px;color:${fg}">Arts to Hearts Project</p>`;
const edFoot = (last) => `<p class="a" style="left:72px;bottom:60px;${T_REG};font-size:24px;color:${EDC.ink};opacity:.8">@artstoheartsproject</p>
  ${last ? '' : `<div class="a" style="right:72px;bottom:46px;width:56px;height:56px;border-radius:50%;background:${EDC.burg};display:flex;align-items:center;justify-content:center;${T_MED};font-size:28px;color:#FFFFFF">&rarr;</div>`}`;
const edSize = (t, big, mid, small) => t.length > 64 ? small : t.length > 38 ? mid : big;

// Look: bold, conversational, editorial. Five devices, alternated so no two slides in a row look the same:
// big Rose type on Night · a Burgundy card over an artwork · marker highlights in a serif paragraph ·
// the ticket card · highlight boxes on a Chilli ground. Brand palette and the two brand typefaces only.
// Three colours only: White, Maroon (Burgundy) and Pink. Pink is the highlight. Full Maroon only on the cover and the end card.
const EP = {white: '#FFFFFF', burg: '#6A0620', rose: '#FFA1C2', pink: '#FAD2E1'};
const mark = (t, bg = EP.pink) => `<span style="background:${bg};-webkit-box-decoration-break:clone;box-decoration-break:clone;padding:0 .12em;border-radius:4px">${t}</span>`;
const hl = (text, phrase, bg) => { const t = esc(text); const p = esc(phrase || ''); return p && t.includes(p) ? t.replace(p, mark(p, bg)) : t; };
const edCorner = (fg) => `<p class="a cn" style="left:52px;top:48px;color:${fg}">Arts to Hearts Project</p>`;
const edHandle = (fg, op = .8) => `<p class="a" style="left:72px;bottom:60px;${T_REG};font-size:24px;color:${fg};opacity:${op}">@artstoheartsproject</p>`;
const arrowDot = (bg, fg, size = 150) => `<span style="display:inline-flex;vertical-align:.08em;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:${bg};margin-right:.18em"><svg width="${size * .34}" height="${size * .34}" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="${fg}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
const swipePill = (bg, fg) => `<div class="a" style="left:0;right:0;bottom:120px;display:flex;justify-content:center"><div style="display:flex;align-items:center"><span style="width:84px;height:84px;border-radius:50%;border:2px solid ${bg};display:flex;align-items:center;justify-content:center;margin-right:-10px"><svg width="30" height="30" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="${bg}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span style="height:84px;padding:0 44px;border-radius:999px;background:${bg};color:${fg};display:flex;align-items:center;${T_MED};font-size:36px">Swipe to find out</span></div></div>`;
const splitHalf = t => { const w = String(t).split(' '); const k = Math.ceil(w.length / 2); return [w.slice(0, k).join(' '), w.slice(k).join(' ')]; };
const EDT = {
  // Cover A: the question, huge, Rose on Night, opened by the round arrow
  coverHook(o){ const q = o.q; const sz = q.length > 44 ? 100 : q.length > 30 ? 118 : 136;
    return {bg: EP.burg, html: `${ivMono('peony', 'right:52px;top:36px;width:112px;height:63px')}
      <div class="a" style="left:72px;right:72px;top:190px;display:flex;flex-direction:column;gap:56px">
        <p style="${T_MED};font-size:${sz}px;line-height:1.02;letter-spacing:-.035em;color:${EP.rose}">${arrowDot(EP.rose, EP.burg, Math.round(sz * 1.05))}${esc(q)}</p>
        ${o.why ? `<p style="${BASK};font-size:${o.why.length > 170 ? 38 : 44}px;line-height:1.36;color:${EP.pink}">${esc(o.why)}</p>` : ''}</div>
      ${swipePill(EP.rose, EP.burg)}`}; },
  // Cover B: a Burgundy card over the artwork, the question split above and below a small line
  coverCard(o){ const [a, b] = splitHalf(o.q); const sz = o.q.length > 40 ? 70 : 84;
    return {bg: EP.burg, html: `${ivArt(o.img, 'inset:0', o.slot, 'cover')}${ivMono('white', 'right:52px;top:36px;width:112px;height:63px')}
      <div class="a" style="left:130px;right:130px;top:170px;bottom:190px;border-radius:34px;background:${EP.burg};display:flex;flex-direction:column;justify-content:space-between;align-items:center;text-align:center;padding:64px 48px">
        <p style="${T_MED};font-size:${sz}px;line-height:.98;letter-spacing:-.02em;text-transform:uppercase;color:${EP.pink}">${esc(a)}</p>
        <p style="${T_REG};font-size:36px;line-height:1.4;color:${EP.pink};max-width:640px">${esc(o.sub)}</p>
        <p style="${T_MED};font-size:${sz}px;line-height:.98;letter-spacing:-.02em;text-transform:uppercase;color:${EP.pink}">${esc(b)}</p></div>`}; },
  // The problem, as a serif paragraph with the sharpest phrase marked
  open(o){ return {bg: EP.white, html: `${edCorner(EP.burg)}
    <p class="a" style="left:72px;right:72px;top:210px;${BASK};font-size:${o.text.length > 200 ? 60 : 68}px;line-height:1.28;color:${EP.burg}">${hl(o.text, o.mark)}</p>${edHandle(EP.burg)}`}; },
  // Advice as a marked paragraph: the advice itself is highlighted inside the sentence that explains it
  adviceMark(o){ const text = `${o.title}. ${o.how || ''}`.trim(); return {bg: EP.white, html: `${o.first ? ivMono('burgundy', 'right:52px;top:36px;width:112px;height:63px') : edCorner(EP.burg)}
    <div class="a" style="left:72px;right:72px;top:250px;display:flex;flex-direction:column;gap:34px">
      ${o.label ? `<p style="${T_MED};font-size:28px;letter-spacing:.12em;text-transform:uppercase;line-height:1.4;color:${EP.burg}">${esc(o.label)}</p>` : ''}
      <p style="${BASK};font-size:${text.length > 170 ? 60 : 70}px;line-height:1.26;color:${EP.burg}">${hl(text, o.title + '.')}</p></div>${edHandle(EP.burg)}`}; },
  // Advice on a Burgundy card over an artwork, the advice split above and below the how
  adviceCard(o){ if (!o.img) return EDT.adviceMark(o); const [a, b] = splitHalf(o.title); const sz = o.title.length > 34 ? 62 : 74;
    return {bg: EP.burg, html: `${ivArt(o.img, 'inset:0', o.slot, 'cover')}
      <div class="a" style="left:130px;right:130px;top:170px;bottom:210px;border-radius:34px;background:${EP.burg};display:flex;flex-direction:column;justify-content:space-between;align-items:center;text-align:center;padding:60px 48px">
        <p style="${T_MED};font-size:${sz}px;line-height:.98;letter-spacing:-.02em;text-transform:uppercase;color:${EP.pink}">${esc(a)}</p>
        <p style="${T_REG};font-size:36px;line-height:1.4;color:${EP.pink};max-width:640px">${esc(o.how || '')}</p>
        <p style="${T_MED};font-size:${sz}px;line-height:.98;letter-spacing:-.02em;text-transform:uppercase;color:${EP.pink}">${esc(b)}</p></div>
      ${o.credit ? `<p class="a" style="left:130px;right:130px;bottom:120px;${T_REG};font-size:22px;color:#FFFFFF;text-shadow:0 1px 6px rgba(0,0,0,.6)">${edLabelCredit(o.credit)}</p>` : ''}`}; },
  // The habit to drop: highlight boxes on Chilli, the habit struck through
  instead(o){ const box = t => `<span style="background:${EP.pink};-webkit-box-decoration-break:clone;box-decoration-break:clone;padding:2px 12px">${t}</span>`;
    return {bg: EP.white, html: `${edCorner(EP.burg)}
      <p class="a" style="left:72px;right:72px;top:210px;${BASK};font-style:italic;font-size:${o.bad.length > 50 ? 58 : 66}px;line-height:1.3;color:${EP.burg};opacity:.55"><s style="text-decoration-thickness:4px">&ldquo;${esc(o.bad)}&rdquo;</s></p>
      <p class="a" style="left:72px;right:72px;top:620px;${T_MED};font-size:${o.good.length > 80 ? 62 : 72}px;line-height:1.2;letter-spacing:-.03em;color:${EP.burg}">${box(esc(o.good))}</p>${edHandle(EP.burg)}`}; },
  // The short version on a ticket: notches, corner labels, one phrase picked out in white
  short(o){ return {bg: EP.white, html: `<div class="a" style="left:52px;right:52px;top:110px;bottom:110px;border-radius:40px;background:${EP.pink}"></div>
      <div class="a" style="left:470px;width:140px;top:40px;height:140px;border-radius:50%;background:${EP.white}"></div><div class="a" style="left:470px;width:140px;bottom:40px;height:140px;border-radius:50%;background:${EP.white}"></div>
      <p class="a cn" style="left:112px;top:170px;color:${EP.burg}">The short version</p><p class="a cn" style="right:112px;top:170px;color:${EP.burg}">Save this</p>
      <p class="a" style="left:112px;right:112px;top:260px;${BASK};font-size:${o.text.length > 200 ? 54 : 62}px;line-height:1.26;color:${EP.burg}">${hl(o.text, o.pick, EP.white)}</p>
      <p class="a" style="left:112px;bottom:170px;${T_REG};font-size:24px;color:${EP.burg}">@artstoheartsproject</p><p class="a" style="right:112px;bottom:170px;${T_REG};font-size:24px;color:${EP.burg}">artstoheartsproject.com</p>`}; },
  // The ask: the keyword is the headline
  cta(o){ return {bg: EP.white, html: `${edCorner(EP.burg)}
    <p class="a" style="left:72px;right:72px;top:210px;${BASK};font-size:60px;line-height:1.24;color:${EP.burg}">${hl(o.head, o.head)}</p>
    <p class="a" style="left:72px;right:72px;top:520px;${T_MED};font-size:${o.key.length > 8 ? 150 : 180}px;line-height:1;letter-spacing:-.04em;color:${EP.burg}">${arrowDot(EP.burg, EP.white, 150)}${esc(o.key)}</p>
    <p class="a" style="left:72px;right:72px;top:780px;${T_REG};font-size:38px;line-height:1.35;color:${EP.burg}">Comment the word and we’ll send it to you.</p>
    <p class="a" style="left:72px;right:72px;bottom:130px;${T_REG};font-size:28px;line-height:1.4;color:${EP.burg};opacity:.8">${esc(o.offer)}</p>${edHandle(EP.burg)}`}; },
  end(o){ return {bg: EP.burg, html: `${ivMono('peony', 'left:390px;width:300px;top:170px;height:170px')}
    <div class="a" style="left:72px;right:72px;top:430px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:22px">
      <p style="${BASK};font-size:48px;line-height:1.26;color:${EP.pink}">${esc(o.head)}</p>
      <p style="${T_MED};font-size:${o.key.length > 8 ? 140 : 170}px;line-height:1;letter-spacing:-.04em;color:${EP.rose};margin-top:20px">${arrowDot(EP.rose, EP.burg, 130)}${esc(o.key)}</p>
      <p style="${T_REG};font-size:36px;line-height:1.35;color:${EP.pink};margin-top:6px">${esc(o.offer)}</p></div>
    <p class="a c" style="left:0;right:0;bottom:96px;${T_REG};font-size:28px;color:${EP.pink}">artstoheartsproject.com</p>`}; },
};
const edLabelCredit = c => { const [who, t, y] = (c || []).map(x => String(x || '').trim()); return who ? `${esc(who)}${t ? `, <i style="${BASK};font-style:italic">${esc(t)}</i>` : ''}${y ? ', ' + esc(y) : ''}` : ''; };


// The one layout: a small label (the reader's question), the line large, one short line under it.
EDT.plainSlide = o => { const dark = o.dark, bg = dark ? EP.burg : EP.white, fg = dark ? EP.pink : EP.burg, big = dark ? '#F9EEE5' : EP.burg;
  const sz = o.title.length > 60 ? 76 : o.title.length > 38 ? 90 : 104;
  return {bg, html: `${o.first ? ivMono(dark ? 'peony' : 'burgundy', 'right:52px;top:36px;width:112px;height:63px') : edCorner(fg)}
    <div class="a" style="left:72px;right:72px;top:250px;display:flex;flex-direction:column;gap:34px">
      <p style="${T_MED};font-size:28px;letter-spacing:.12em;text-transform:uppercase;line-height:1.4;color:${fg}">${esc(o.label)}</p>
      ${o.struck ? `<p style="${BASK};font-style:italic;font-size:46px;line-height:1.3;color:${big};opacity:.5"><s>&ldquo;${esc(o.struck)}&rdquo;</s></p>` : ''}
      <p style="${T_MED};font-size:${sz}px;line-height:.98;letter-spacing:-.035em;color:${big}">${esc(o.title)}</p>
      ${o.how ? `<p style="${T_REG};font-size:38px;line-height:1.4;color:${fg}">${esc(o.how)}</p>` : ''}</div>
    ${o.last ? '' : edHandle(fg)}`}; };

// ---------- the form ----------
DCAT.editorial = {name: 'ATH Editorial', marker: '//EDITORIAL', key: 'GUIDE', pack: true, groups: [
  ['The question', [
    {k: 'question', label: 'The question, in an artist’s own words (the small label on every slide)', type: 'text', ph: 'How should I price my art?'}]],
  ['The advice', [
    {k: 'steps', label: 'Advice, one per line: the advice as a sentence | one line on how', type: 'lines'},
    {k: 'why', label: 'The problem, said plainly (used in the caption)', type: 'area'}]],
  ['Instead of (the last slide before the end card)', [
    {k: 'bad', label: 'The habit artists should drop, in their words (struck through)', type: 'text', ph: 'I’ll price it lower so it sells.'},
    {k: 'good', label: 'What to do instead', type: 'text', ph: 'Price it so the next one can sell for more.'}]],
  ['The action', [
    {k: 'key', label: 'Comment keyword (its DM must send the guide, not a submission pitch)', type: 'text', ph: 'GUIDE'},
    {k: 'ctahead', label: 'End card: line above the keyword', type: 'text', ph: 'Want the whole guide?'},
    {k: 'offer', label: 'End card: line under the keyword', type: 'text', ph: 'Comment the word and we’ll send it to you.'}]],
  ['Caption', [
    {k: 'hook', label: 'Caption first line', type: 'text'},
    {k: 'url', label: 'Article link', type: 'text'},
    {k: 'tags', label: 'Hashtags (up to 5 in total)', type: 'text', ph: '#artbusiness #artistadvice'}]],
]};
DCAT.editorial.fields = DCAT.editorial.groups.flatMap(g => g[1]);

// ---------- read a guide article: title, the problem, the steps (its section headings) ----------
function parseEditorial(raw, headings, title){
  const all = String(raw || '').replace(/\r/g, '').replace(/(\p{L})-\n(\p{Ll})/gu, '$1-$2').split('\n');
  const seen = {}; all.forEach(l => { const k = l.trim(); if (k) seen[k] = (seen[k] || 0) + 1; });
  const junk = l => /^\d{1,2}\/\d{1,2}\/\d{4}|^https?:\/\/|minute read$|^(Leave a Reply|Share|SHARE|PIN IT|You must be logged in)/i.test(l.trim()) || (l.trim() && seen[l.trim()] >= 3);
  const lines = all.filter(l => !junk(l)); const H = new Set((headings || []).map(h => h.trim()));
  const STOP = /^(conclusion|final thoughts|in conclusion|wrapping up|faq|frequently asked|related|about the author|table of contents|share this|leave a reply|the latest)/i;
  const BOIL = /^(At|Our) (Arts to Hearts|Best of the Art World)|our mission is/i;
  const cleanT = String(title || '').replace(/\s*[|–-]\s*Arts to Hearts.*$/i, '').trim();
  const isHead = l => { const t = l.trim(); return t && t !== cleanT && !(cleanT && cleanT.includes(t)) && (H.has(t) || /^(step\s*)?\d{1,2}[.):]\s+\S/i.test(t)) && t.length < 120; };
  const intro = [], sections = []; let cur = null, buf = [], stopped = false;
  const flush = () => { const paras = buf.join('\n').split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean); if (cur) cur.body = paras; else intro.push(...paras); buf = []; };
  for (const l of lines) { if (stopped) break; if (isHead(l)) { flush(); const t = l.trim(); if (STOP.test(t.replace(/^\d+[.):]\s*/, ''))) { stopped = true; cur = null; break; } cur = {h: t, body: []}; sections.push(cur); } else buf.push(l); }
  if (!stopped) flush();
  const sent = t => (String(t).match(/[^.!?]+[.!?]+["”’]?/g) || [String(t)]).map(s => s.trim());
  const firstSay = (paras, max) => { let o = ''; for (const s of sent((paras || []).join(' '))) { if ((o + ' ' + s).length > max && o) break; o = (o + ' ' + s).trim(); } return o; };
  const steps = sections.filter(s => (s.body || []).join(' ').length > 40).map(s => ({title: s.h.replace(/^(step\s*)?\d{1,2}[.):]\s*/i, '').replace(/[:.]$/, '').trim(), how: firstSay(s.body, 150)})).slice(0, 7);
  const introParas = intro.filter(p => p.length > 80 && !BOIL.test(p) && p !== cleanT);
  const why = firstSay(introParas.slice(0, 2), 220);
  const all2 = sections.flatMap(s => s.body || []).join(' ');
  const avoid = (sent(all2).find(s => /\b(mistake|avoid|never|don['’]t|do not)\b/i.test(s) && s.length > 40 && s.length < 200) || '');
  return {title: cleanT, why, steps, avoid};
}
// "How to Price Your Art" → "How do I price my art?"
// Title Case titles become sentence case first
function askOf(t){ t = String(t || '').trim().replace(/[.:]$/, ''); const w = t.split(' '); if (w.filter(x => /^[A-Z]/.test(x)).length > w.length * .6) t = w.map((x, i) => i === 0 || /^[A-Z]{2,}$|^I$/.test(x) ? x : x.toLowerCase()).join(' ');
   const m = t.match(/^How to (.+)$/i);
  if (m) return ('How do I ' + m[1].charAt(0).toLowerCase() + m[1].slice(1)).replace(/\byour\b/gi, 'my').replace(/\byou\b/gi, 'I').replace(/\s+/g, ' ') + '?';
  return t; }
function editorialFields(e, ai){
  const c = {...(ai || {})}; const steps = (c.steps && c.steps.length ? c.steps : e.steps);
  const short = c.short || (steps.length ? steps.map((s, i) => (i === 0 ? s.title : s.title.charAt(0).toLowerCase() + s.title.slice(1))).join(', ').replace(/, ([^,]*)$/, ', and $1') + '.' : '');
  return {cover: 'hook', question: c.question || askOf(e.title), sub: c.sub || 'What we tell artists who ask us this',
    why: c.why || e.why, steps: steps.map(s => `${s.title} | ${s.how || ''}`).join('\n'), bad: c.bad || '', good: c.good || e.avoid || '', short,
    key: 'GUIDE', ctahead: 'Want the whole guide?', offer: 'Comment the word and we’ll send it to you.',
    endline: 'New guides for artists every week.', invite: 'Follow @artstoheartsproject for the next one.', ask: c.ask || '', hook: c.hook || ''};
}

// ---------- the package ----------
DPACK.editorial = p => {
  const f = p.f || {}, imgs = [].concat((p.imgs || {}).imgs || []), credits = dLines(f.credits);
  const steps = dLines(f.steps).map(x => ({title: x[0] || '', how: x.slice(1).join(' | ')})).filter(s => s.title);
  const key = (f.key || 'GUIDE').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'GUIDE';
  const q = (f.question || f.headline || 'Add the question in the sidebar').replace(/^“|”$/g, ''), sub = f.sub || 'What we tell artists who ask us this';
  const artCover = (f.cover || 'hook') === 'hook';
  const A = EDT.coverHook({q, sub}), Bc = EDT.coverCard({q, sub, img: imgs[0] || '', slot: 'imgs0'});
  const advice = (s, i) => (i % 2 ? EDT.adviceMark : EDT.adviceCard)({title: s.title, how: s.how, img: imgs[i + 1] || '', slot: 'imgs' + (i + 1), credit: credits[i + 1]});
  const head = f.ctahead || 'Want the whole guide?', offer = f.offer || 'Comment the word and we’ll send it to you.';
  const label = q;
  const S = [
    ...steps.slice(0, 6).map((st, i) => (i % 2 === 0 ? EDT.plainSlide : EDT.adviceMark)({label, title: st.title, how: st.how, dark: true, first: i === 0})),
    ...(f.good ? [EDT.plainSlide({label: 'Instead of', struck: f.bad || 'I’ll work it out later.', title: f.good, dark: steps.slice(0, 6).length % 2 === 0})] : []),
    EDT.end({head, key, offer}),
  ];
  const tags = ['#artstoheartsproject', '#artbusiness', ...String(f.tags || '').split(/\s+/).filter(x => x.startsWith('#'))].slice(0, 5).join(' ');
  const who = [...new Set(credits.map(c => c[0]).filter(Boolean))].join(', ');
  const cap = `${f.hook || q}\n\n${f.why || ''}\n\n${steps.map(s => `${s.title}.${s.how ? ' ' + s.how : ''}`).join('\n\n')}\n\n${f.short ? 'The short version: ' + f.short + '\n\n' : ''}Comment ${key} and we'll send you the whole guide.${who ? `\n\nWorks shown: ${who}.` : ''}\n\n${tags}`.replace(/\n{3,}/g, '\n\n');
  const SINGLES = steps.slice(0, 6).map((st, i) => ({...(i % 2 === 0 ? EDT.plainSlide : EDT.adviceMark)({label, title: st.title, how: st.how, dark: true, first: true}), label: 'Single ' + (i + 1)}));
  const ST = steps.slice(0, 3).map((st, i) => ({...IV.story({dark: i % 2 === 0, mono: i === 0, label: q, text: esc(st.title), sub: esc(st.how || ''), zone: i === 2 ? 'Question sticker' : 'Link sticker: the whole guide'}), label: 'Story ' + (i + 1)}));
  return [
    {title: `${p.date} · Editorial carousel`, meta: `${S.length} slides · keyword ${key}`, slides: S.map((s, j) => ({...s, title: 'editorial-' + (j + 1)})), cap, pin: `Comment ${key} and we'll send you the whole guide.`},
    ...(SINGLES.length ? [{title: `${p.date} · Editorial singles`, meta: `${SINGLES.length} single posts for later weeks, one piece of advice each, all sending people back to the guide`, slides: SINGLES.map((s, j) => ({...s, title: 'single-' + (j + 1)})), cap: steps[0] ? `${steps[0].title}.\n\n${steps[0].how}\n\nFrom our guide "${q}". Comment ${key} and we'll send you the whole thing.\n\n${tags}` : '', pin: ''}] : []),
    {title: `${p.date} · Editorial stories`, meta: 'Same day as the carousel · add the stickers in Instagram', slides: ST.map((s, j) => ({...s, title: 'editorial-story-' + (j + 1)})), story: true},
  ];
};

// ---------- example: advice hung on works by PQHAÜS, an artist we featured ----------
const ED_EXAMPLE = {cat: 'editorial', f: {
  cover: 'hook', question: 'How should I price my art?', sub: 'What we tell artists who ask us this',
  why: 'Most artists guess, then second-guess every sale. Here is how to land on a number you can explain, and stick to it.',
  steps: 'Know what a piece really costs you | Add up materials, framing and your hours before you think about any number.\nPick one way of pricing and keep it | Price by size, so every work in a series makes sense next to the others.\nCompare yourself with artists like you | Look at artists at your stage, size and medium, not at famous names or hobby sellers.\nShow one price everywhere | Your studio, your website and a gallery should all say the same thing, or buyers stop trusting it.\nRaise your prices when you sell out | A waiting list is your sign to move up 10 to 20 percent.',
  credits: 'PQHAÜS | No help is coming | 2026\nPQHAÜS | I was the elephant in the room | 2025\nPQHAÜS | I am not a bad person | 2026\nPQHAÜS | 2903 miles | 2025\nPQHAÜS | 31 years old | 2024\nPQHAÜS | No help is coming | 2026',
  whymark: 'Buyers trust a price you can explain', pick: 'show one price everywhere', bad: 'I’ll drop the price a little so it sells.', good: 'Hold the price. The buyers who paid it are watching, and it is hard to go back up.',
  short: 'Know your costs, pick one way of pricing and keep it, compare yourself with artists like you, show one price everywhere, and raise it when you sell out.',
  key: 'GUIDE', ctahead: 'Want the whole guide?', offer: 'Comment the word and we’ll send it to you.',
  endline: 'New guides for artists every week.', invite: 'Follow @artstoheartsproject for the next one.', ask: 'What do you find hardest about pricing?', hook: 'How should I price my art? The question we get most, answered.', tags: '#pricingart #artistadvice'},
  imgs: {imgs: ['art/examples/pqhaus/art-no-help-is-coming.jpg', 'art/examples/pqhaus/art-i-was-the-elephant-in-the-room.jpg', 'art/examples/pqhaus/art-i-am-not-a-bad-person.jpg', 'art/examples/pqhaus/art-2903-miles.jpg', 'art/examples/pqhaus/art-31-years-old.jpg', 'art/examples/pqhaus/art-no-help-is-coming.jpg']}};
