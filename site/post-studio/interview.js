/* ATH Post Studio · ARTIST INTERVIEW, a category of its own.
   Job: introduce the artist with the respect the article gives them, send people to the full conversation,
   and hand the artist something they will reshare (their audience becomes ours).
   One article in → main carousel + quote cards + stories + artist share kit + captions.
   Look: Arts to Hearts social guide (Night and Rose, Inter Tight + Libre Baskerville, four corners). Artworks are never cropped. */

// ---------- article parser: paste the article text, fields fill themselves ----------
// Artwork credit lines, in the two styles our articles use:
//   Title / 2025 / 24×30 / Acrylic on canvas      and      “Title”, 2025, 16×20″, oil on canvas
const CAP_SLASH = /^\s*(.+?)\s+\/\s+((?:19|20)\d{2})\s+\/\s+([^/]+?)\s+\/\s+(.+?)\s*$/;
const CAP_COMMA = /^\s*[“"‘']\s*(.+?)\s*[”"’'],?\s+((?:19|20)\d{2})\s*,\s*([\d.,]+\s*[×xX]\s*[\d.,]+\s*(?:″|"|”|in\.?|inch(?:es)?|cm)?)\s*,\s*(.+?)\s*$/;
const parseCap = l => { const m = String(l).match(CAP_SLASH) || String(l).match(CAP_COMMA); return m ? [m[1].trim(), m[2], m[3].trim().replace(/[″”"]$/, ' in'), m[4].trim()] : null; };
window.isCaption = l => !!parseCap(l);
function parseInterview(raw){
  const junk = l => /^\d{1,2}\/\d{1,2}\/\d{4}|^https?:\/\/|^\d+\/\d+$|minute read$|^(WEBSITE|INSTAGRAM|Leave a Reply|You must be logged in|Shares?|SHARE|PIN IT)/i.test(l.trim());
  const all = String(raw || '').replace(/\r/g, '').replace(/(\p{L})-\n(\p{Ll})/gu, '$1-$2').split('\n');
  const seen = {}; all.forEach(l => { const k = l.trim(); if (k) seen[k] = (seen[k] || 0) + 1; });
  const kept = all.filter(l => !junk(l) && !(l.trim() && seen[l.trim()] >= 3));   // page headers repeat on every page
  const lines = []; kept.forEach(l => { const prev = lines[lines.length - 1];   // a credit that wrapped onto a second line
    if (prev !== undefined && /^\s*[“"‘']/.test(prev) && /(19|20)\d{2}\s*,/.test(prev) && /,\s*$|\band$|\bon$|\b(and|of|with)\s*$/.test(prev.trim()) && /^\s*[a-z]/.test(l)) lines[lines.length - 1] = prev.trim() + ' ' + l.trim(); else lines.push(l); });
  const text = lines.join('\n');
  const caps = [...new Set(lines.map(parseCap).filter(Boolean).map(c => c.join(' | ')))];
  const capRe = { test: l => !!parseCap(l) };
  const qa = []; const parts = text.split(/\n(?=\s*Q\d+[.,:)])/);
  parts.slice(1).forEach(b => { const flat = b.replace(/^\s*Q\d+[.,:)]\s*/, '').split('\n').filter(l => !capRe.test(l)).join('\n');
    const qi = flat.indexOf('?'); if (qi < 0) return;
    const q = flat.slice(0, qi + 1).replace(/\s+/g, ' ').trim();
    const a = flat.slice(qi + 1).split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(p => p && !/^(As our conversation|Follow )/.test(p));
    qa.push({q, a: a.slice(0, 3).join('\n\n')}); });
  const pre = (parts[0] || '').split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const title = (pre[0] || '').length < 140 ? pre[0] : '';
  const intro = pre.filter(p => p.length > 120).slice(0, 2).join(' ');
  const recog = (text.replace(/\s+/g, ' ').match(/selected for exhibitions at ([^.]+)\./i) || [])[1] || '';
  const venues = recog ? recog.split(/,\s*(?:and\s+)?|\s+and\s+/).map(v => v.trim().replace(/^the\s+/i, '').replace(/\s+in\s+([^,]+)$/, ', $1')).filter(v => v && !/^multiple/i.test(v)) : [];
  return {title, intro, caps, qa, venues, pre};
}
const qaText = qa => qa.map(x => `Q: ${x.q}\nA: ${x.a}`).join('\n\n');
const qaParse = s => String(s || '').split(/\n\s*\n(?=Q:)/).map(b => { const m = b.match(/^Q:\s*([\s\S]*?)\nA:\s*([\s\S]*)$/); return m ? {q: m[1].trim(), a: m[2].trim()} : null; }).filter(Boolean);
const excerpt = (s, n = 330) => { s = String(s || '').replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; const cut = s.slice(0, n); const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! ')); return (end > n * .5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…'); };

// ---------- the form (shown in the sidebar, grouped like the open-call form) ----------
DCAT.interview = {name:'Artist interview', marker:'//INTERVIEW', key:'INTERVIEW', pack:true, groups:[
  ['Cover', [
    {k:'cover', label:'Cover in use (both are shown, hide the one you skip)', type:'select', options:[['full', 'A: full image, the work fills the slide'], ['framed', 'A: framed, the work whole on white']]},
    {k:'headline', label:'Headline: the tension that makes someone stop', type:'text', ph:'PQHAÜS paints what we never say out loud.'},
    {k:'name', label:'Artist name', type:'text'}, {k:'handle', label:'Instagram handle', type:'text', ph:'@pqhaus'}]],
  ['The artist', [
    {k:'intro', label:'Standfirst: the artist as a story, 2 sentences, under 250 characters', type:'area'},
    {k:'based', label:'Based in', type:'text'}, {k:'medium', label:'Medium', type:'text'},
    {k:'studio', label:'Portraits or studio photos: 1 on page 2', type:'imgs'}]],
  ['The work', [
    {k:'arts', label:'Artworks in order: 1 cover · 2 page 3 · 3 page 5 · the rest go to stories', type:'imgs'},
    {k:'caps', label:'Credits, same order: Title | Year | Size | Medium', type:'lines'},
    {k:'extra', label:'Extra artwork slides (from artwork 4 on)', type:'select', options:[['2', 'Up to 2'], ['0', 'None'], ['1', '1'], ['all', 'All of them']]}]],
  ['Their words', [
    {k:'quotes', label:'Their exact words, one per line: 1 on page 3 · 2 on page 5 · all become quote cards', type:'lines'},
    {k:'pick', label:'Answers to cut off mid-story (question numbers)', type:'text', ph:'9, 4'},
    {k:'kicks', label:'Label above each cut-off answer, same order', type:'lines'},
    {k:'qa', label:'Questions and answers', type:'qa'}]],
  ['Last pages and caption', [
    {k:'inside', label:'Page “We also asked”: 3 questions from the interview, one per line (empty = picked for you)', type:'lines'},
    {k:'ctahead', label:'End card line', type:'text', ph:'The full interview is on our website.'},
    {k:'invite', label:'End card invitation (leave empty to hide)', type:'text', ph:'Want to be our next interview? Apply through the link in bio.'},
    {k:'hook', label:'Caption first line', type:'text'},
    {k:'key', label:'Comment keyword', type:'text', ph:'INTERVIEW'},
    {k:'url', label:'Article link', type:'text'},
    {k:'tags', label:'Hashtags (up to 5 in total)', type:'text', ph:'#narrativeart #cinematicart'}]],
]};
DCAT.interview.fields = DCAT.interview.groups.flatMap(g => g[1]);

// ---------- Arts to Hearts social look (design/guidelines: social and graphics) ----------
// White surface for the whole carousel so the artwork leads. Ink for reading, Burgundy only for the signature:
// the cover headline, the badge, one label, the logo. No pink on the carousel.
// Inter Tight for headlines and corners, Libre Baskerville for paragraphs and quotes. Four fixed corners. Artworks never cropped.
const B = {ground:'#FFFFFF', ink:'#1C1310', burg:'#6A0620', soft:'rgba(28,19,16,.6)', rule:'rgba(28,19,16,.14)'};
const T_MED = "font-family:'ATH Tight',sans-serif;font-weight:500";
const T_REG = "font-family:'ATH Tight',sans-serif;font-weight:400";
const BASK = "font-family:'ATH Bask',serif;font-weight:400";
const pad2 = n => String(n).padStart(2, '0');
const ivArt = (src, style, slot, fit) => src ? `<div class="a img" data-slot="${slot}" style="${style};background-image:url(${src});background-position:center;${fit === 'cover' ? '' : 'background-size:contain;background-repeat:no-repeat'}"></div>` : `<div class="a ph" data-slot="${slot}" style="${style};color:${B.ink}">Add the image in the sidebar</div>`;
// Same brand line as the open-call posts. No slide numbers.
const ATH_MARK = 'brand/heart.svg';   // the heart: drop the file at this path and every end card picks it up
const MARK_OK = {v: false};   // the monogram now carries recall; the heart slot stays off
const MONO = c => `brand/monogram-${c}.svg`;   // ATH / PROJECT monogram (logo suite, panel 06)
const ivMono = (c, style) => `<div class="a" style="${style};background:url(${MONO(c)}) center/contain no-repeat"></div>`;
const ivCorners = (o, fg = B.ink, acc = B.burg) => `${o.mono ? ivMono(fg === B.ink ? 'burgundy' : 'white', 'right:52px;top:36px;width:112px;height:63px') : `<p class="a cn" style="left:52px;top:48px;color:${fg}">Arts to Hearts Project</p>`}
  <p class="a" style="left:72px;bottom:60px;${T_REG};font-size:24px;color:${fg};opacity:.8">@artstoheartsproject</p>
  ${o.last ? '' : `<div class="a" style="right:72px;bottom:46px;width:56px;height:56px;border-radius:50%;background:${acc};display:flex;align-items:center;justify-content:center;${T_MED};font-size:28px;color:#FFFFFF">&rarr;</div>`}`;
const ivCredit = (name, c) => { const [t, y, sz, m] = (c || []).map(x => String(x || '').trim()); return t ? `${esc(name)}, <i style="${BASK};font-style:italic">${esc(t)}</i>${y ? ', ' + esc(y) : ''}${[m, sz].filter(Boolean).length ? ' · ' + [m, sz].filter(Boolean).map(x => esc(x.toLowerCase())).join(' · ') : ''}` : ''; };
const IV = {
  // Cover A, full image: the work fills the slide, evenly darkened a little so white type reads. Cover B, framed: the work whole, on white.
  cover(o){ const h = o.head, sz = h.length > 56 ? 76 : h.length > 40 ? 88 : 100;
    if (o.full) return {bg:B.ink, html:`${ivArt(o.img, 'inset:0', o.slot, 'cover')}<div class="a" style="inset:0;background:rgba(20,9,12,.3)"></div>${ivCorners(o, '#FFFFFF', B.burg)}
      <div class="a" style="left:72px;right:72px;bottom:140px;display:flex;flex-direction:column;gap:22px">
        <p class="cn" style="color:#FFFFFF">Artist Interview</p>
        <p style="${T_MED};font-size:${sz}px;line-height:.96;letter-spacing:-.035em;color:#FFFFFF">${esc(h)}</p>
        <p style="${T_REG};font-size:30px;color:#FFFFFF;margin-top:8px">An interview with ${esc(o.name)}${o.meta ? ' · ' + esc(o.meta) : ''}</p></div>`};
    return {bg:B.ground, html:`${ivCorners(o)}${ivArt(o.img, 'left:72px;right:72px;top:130px;height:640px', o.slot)}
    <p class="a cn" style="left:72px;top:800px;color:${B.burg}">Artist Interview</p>
    <p class="a" style="left:72px;right:72px;top:846px;${T_MED};font-size:${sz}px;line-height:.96;letter-spacing:-.035em;color:${B.ink}">${esc(h)}</p>
    <p class="a" style="left:72px;right:72px;bottom:140px;${T_REG};font-size:32px;line-height:1.3;color:${B.ink}">An interview with ${esc(o.name)}${o.meta ? ' · ' + esc(o.meta) : ''}</p>`}; },
  standfirst(o){ const t = String(o.text || ''); return {bg:B.ground, html:`${ivCorners(o)}${ivArt(o.img, 'left:72px;right:72px;top:130px;height:560px', o.slot, 'cover')}
    <p class="a" style="left:72px;right:72px;top:742px;${BASK};font-size:${t.length > 210 ? 40 : 44}px;line-height:1.32;color:${B.ink}">${esc(t)}</p>`}; },
  work(o){ const q = o.line || ''; const top = o.flip;
    return {bg:B.ground, html:`${ivCorners(o)}${q ? `<p class="a" style="left:72px;right:72px;${top ? 'top:130px' : 'top:812px'};${BASK};font-size:${q.length > 120 ? 40 : 46}px;line-height:1.22;color:${B.ink}">&ldquo;${esc(q)}&rdquo;</p>` : ''}
    ${ivArt(o.img, `left:72px;right:72px;top:${top && q ? 400 : 130}px;height:${q ? 640 : 960}px`, o.slot)}
    <p class="a" style="left:72px;right:72px;${top || !q ? 'top:1120px' : 'top:1150px'};${T_REG};font-size:24px;line-height:1.35;color:${B.soft}">${ivCredit(o.name, o.cap)}</p>`}; },
  tease(o){ return {bg:B.ground, html:`${ivCorners(o)}
    <p class="a" style="left:72px;right:72px;top:170px;${T_MED};font-size:26px;letter-spacing:.12em;text-transform:uppercase;line-height:1.4;color:${B.burg}">${esc(o.kick)}</p>
    <p class="a" style="left:72px;right:72px;top:${170 + Math.ceil(o.kick.length / 44) * 37 + 34}px;${BASK};font-size:${o.text.length > 210 ? 52 : 58}px;line-height:1.24;color:${B.ink}">&ldquo;${esc(o.text)}&rdquo;</p>
    <p class="a" style="left:72px;right:72px;top:1110px;${T_MED};font-size:36px;letter-spacing:-.02em;color:${B.burg}">Continued in the interview &rarr;</p>`}; },
  // Page 6: three more questions we asked, word for word, so it is clear what is waiting in the article.
  list(o){ return {bg:B.ground, html:`${ivCorners(o)}
    <p class="a" style="left:72px;right:72px;top:170px;${T_MED};font-size:26px;letter-spacing:.12em;text-transform:uppercase;color:${B.burg}">We also asked</p>
    <div class="a" style="left:72px;right:72px;top:236px">${o.items.slice(0, 3).map(v => `<p style="${BASK};font-style:italic;font-size:${o.items.join('').length > 210 ? 40 : 46}px;line-height:1.28;color:${B.ink};padding:26px 0;border-top:1px solid ${B.rule}">${esc(v)}</p>`).join('')}</div>
    <p class="a" style="left:72px;right:72px;top:1030px;${T_REG};font-size:34px;line-height:1.35;color:${B.ink}">Read the answers: comment <span style="${T_MED};color:${B.burg}">${esc(o.key)}</span> and we&rsquo;ll send you the link, or tap the link in bio.</p>`}; },
  // Optional: one artwork given the whole slide, with its credit. Only shown when there are artworks to spare.
  plate(o){ return {bg:B.ground, html:`${ivCorners(o)}${ivArt(o.img, 'left:72px;right:72px;top:130px;height:960px', o.slot)}
    <p class="a" style="left:72px;right:72px;top:1130px;${T_REG};font-size:26px;line-height:1.35;color:${B.ink}">${ivCredit(o.name, o.cap)}</p>`}; },
  // End card: the one Burgundy moment of the carousel, so the feed remembers who made it.
  end(o){ return {bg:B.burg, html:`${ivMono('peony', 'left:390px;width:300px;top:250px;height:170px')}${o.mark ? `<div class="a" data-mark style="left:470px;width:140px;top:300px;height:140px;background:url(${ATH_MARK}) center/contain no-repeat"></div>` : ''}
    <p class="a c" style="left:110px;right:110px;top:520px;${BASK};font-size:44px;line-height:1.3;color:#F9EEE5">${esc(o.line)}</p>
    ${o.invite ? `<div class="a" style="left:300px;right:300px;top:860px;border-top:1px solid rgba(250,210,225,.35)"></div><p class="a c" style="left:120px;right:120px;top:900px;${T_REG};font-size:32px;line-height:1.4;color:#FAD2E1">${esc(o.invite)}</p>` : ''}
    <p class="a c" style="left:0;right:0;bottom:96px;${T_REG};font-size:28px;color:#FAD2E1">artstoheartsproject.com</p>`}; },
  // Quote cards are singles posted in later weeks: Burgundy ground so the feed remembers who they are from.
  quoteCard(o){ return {bg:B.burg, html:`<p class="a cn" style="left:52px;top:48px;color:#FAD2E1">Arts to Hearts Project</p>
    <p class="a" style="left:72px;right:72px;top:250px;${BASK};font-size:${o.text.length > 140 ? 58 : o.text.length > 90 ? 66 : 76}px;line-height:1.2;color:#F9EEE5">&ldquo;${esc(o.text)}&rdquo;</p>
    <p class="a" style="left:72px;bottom:60px;${T_MED};font-size:30px;color:#FAD2E1"><span style="${T_REG}">From our interview with </span>${esc(o.name)}${o.handle ? ` <span style="${T_REG}">${esc(o.handle)}</span>` : ''}</p>`}; },
  // Stories: label, text and line below stack in one column and shrink to fit, so long names or titles never collide.
  story(o){ const dark = o.dark || o.full, bg = o.full ? B.ink : o.dark ? B.burg : B.ground, fg = dark ? '#F9EEE5' : B.ink, acc = o.full ? '#FFFFFF' : o.dark ? '#FAD2E1' : B.burg;
    const art = o.img && !o.full; const plain = String(o.text).replace(/<[^>]+>|&[a-z]+;/g, '');
    const size = o.serif ? (plain.length > 230 ? 50 : plain.length > 150 ? 56 : o.size || 64) : (plain.length > 60 ? 70 : plain.length > 36 ? 84 : o.size || 96);
    const box = art ? 'top:1050px' : o.full ? 'bottom:520px' : 'top:380px';
    return {h:1920, bg, html:`${o.full ? `${ivArt(o.img, 'inset:0', o.slot, 'cover')}<div class="a" style="inset:0;background:rgba(20,9,12,.32)"></div>` : ''}
    ${o.mono ? ivMono(o.full ? 'white' : dark ? 'peony' : 'burgundy', 'right:64px;top:238px;width:112px;height:63px') : `<p class="a cn" style="left:64px;top:250px;color:${dark ? '#FAD2E1' : B.ink}">Arts to Hearts Project</p>`}
    ${art ? ivArt(o.img, 'left:72px;right:72px;top:340px;height:670px', o.slot) : ''}
    <div class="a" style="left:72px;right:72px;${box};display:flex;flex-direction:column;gap:20px">
      <p style="${T_MED};font-size:28px;letter-spacing:.12em;text-transform:uppercase;line-height:1.4;color:${acc}">${esc(o.label)}</p>
      <p style="${o.serif ? BASK + `;font-size:${size}px;line-height:1.22` : T_MED + `;font-size:${size}px;line-height:.98;letter-spacing:-.035em`};color:${fg}">${o.text}</p>
      ${o.sub ? `<p style="${T_REG};font-size:36px;line-height:1.35;color:${fg};margin-top:6px">${o.sub}</p>` : ''}</div>
    ${o.zone ? `<div class="a" style="left:150px;right:150px;top:1490px;height:86px;border:2px dashed ${fg};border-radius:24px;opacity:.5;display:flex;align-items:center;justify-content:center;${T_MED};font-size:24px;color:${fg}">${o.zone}</div>` : ''}`}; },
};

// ---------- copy helpers: work from the article when no one has written the copy ----------
const sentences = t => (String(t).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["”’]?/g) || []).map(s => s.trim());
const openLoop = a => { const t = String(a).replace(/\s+/g, ' ').trim(); let o = ''; for (const x of sentences(t)) { if ((o + ' ' + x).length > 230 && o) break; o = (o + ' ' + x).trim(); } return o.length < t.length ? o.replace(/[.,;:]$/, '') + '…' : o; };
const kickOf = q => { const m = q.match(/^In (.+?), you/); if (m) return `On “${m[1]}”`; const st = sentences(q).filter(s => !s.endsWith('?'))[0]; if (st && st.length <= 70) return st.replace(/\.$/, ''); let core = q.split('?')[0]; const c = core.lastIndexOf(', '); if (c > 0 && core.length - c > 25 && /^(how|what|why|has|have|does|do|is|are|can|would|where|when|who|which)\b/i.test(core.slice(c + 2))) core = core.slice(c + 2); core = core.charAt(0).toUpperCase() + core.slice(1); return core.length <= 64 ? core + '?' : ''; };
function nameFromTitle(t, body){ if (body) { const words = String(t || '').replace(/[’']s\b/g, '').split(/[\s,:—–-]+/); const runs = [];
    for (let i = 0; i < words.length; i++) for (let k = 1; k <= 3 && i + k <= words.length; k++) { const run = words.slice(i, i + k); if (!run.every(w => /^[A-ZÀ-Þ][\p{L}'’.]+$/u.test(w)) || (i === 0 && k === 1 && /^(In|The|A|An|How|Why|When|What|Meet)$/.test(run[0]))) continue; const ph = run.join(' '); const n = body.split(ph).length - 1; runs.push({ph, n, k}); }
    const two = runs.filter(r => r.k >= 2 && r.n >= 2).sort((a, b) => b.n - a.n)[0]; if (two) return two.ph; const one = runs.filter(r => r.n >= 5 && r.ph.length >= 3 && !/^(In|The|His|Her|Their|Our|We|You|Your|They|She|He|It|This|That|What|When|Why|How|Who|And|But|For|With|From|Art|Arts|Hearts|Project|Oil|Paintings?|Stories|Story|Work|Artist|Interview)$/i.test(r.ph)).sort((a, b) => b.n - a.n)[0]; if (one) return one.ph; }
  return nameFromTitleOld(t); }
function nameFromTitleOld(t){ t = String(t || '').replace(/[’']s\b/, ''); const m = t.match(/^(.+?)\s+(?:Uses|Explores|Talks|on|Discusses|Shares|Reflects|Paints|Creates|Turns|Finds|Brings|Captures|Invites|Examines|and|is|:|—|–|-)\s/); return (m ? m[1] : t.split(/[:—–]/)[0]).trim().slice(0, 40); }
// Pick copy from the article by rules (used when Claude is not connected).
function autoStructure(r, title){
  const qa = r.qa || [];
  const cand = []; qa.forEach((x, i) => sentences(x.a).forEach(s => { if (s.length < 55 || s.length > 160) return; let sc = 0;
    if (/^I\b/.test(s)) sc += 3; else if (/\bI\b/.test(s)) sc += 1; if (/\b(want|hope|think|love|believe|feel|need|rather)\b/i.test(s)) sc += 2; if (/\b(my work|paint|painting|image|canvas|viewers?)\b/i.test(s)) sc += 2; if (/^(Because|And|But|So|That|This|It|They|There|Yes|No|Sometimes)\b/.test(s)) sc -= 3; cand.push({s, i, sc}); }));
  cand.sort((a, b) => b.sc - a.sc || a.s.length - b.s.length); const quotes = [], used = new Set();
  for (const c of cand) { if (quotes.length >= 3) break; if (used.has(c.i)) continue; used.add(c.i); quotes.push(c.s); }
  const story = qa.map((x, i) => { const head = sentences(x.a).slice(0, 2).join(' '); let sc = 0; (head.match(/\b(began|started|grew up|growing up|when I was|in high school|friend|remember|years ago|first time|once|my (mother|father|family|grandmother))\b/gi) || []).forEach(() => sc += 2); (head.match(/\bI [a-z]+ed\b/g) || []).forEach(() => sc += 1); return {n: i + 1, sc}; }).sort((a, b) => b.sc - a.sc);
  const picks = story.slice(0, 2).map(x => x.n).sort((a, b) => a - b);
  const rest = qa.map((x, i) => ({x, i})).filter(o => !picks.includes(o.i + 1)).sort((a, b) => b.x.a.length - a.x.a.length).slice(0, 3).sort((a, b) => a.i - b.i);
  const name = nameFromTitle(title || r.title, (r.pre || []).join(' ') + ' ' + (r.qa || []).map(x => x.q).join(' '));
  const pre = (r.pre || []).filter(p => p.length > 120); const flat = pre.join(' ');
  const based = ((flat.match(/\bbased in (?:the )?([A-Z][^,.;]+?)(?= and | where | with | who |[,.;])/) || [])[1] || '').trim();
  const medium = ((flat.match(/\bworks? (?:primarily )?in ([a-z ]+? on [a-z]+|oils?|watercolou?r|acrylics?|charcoal|ceramics|photography|textiles?)\b/i) || [])[1] || '').trim();
  const about = pre.find(p => name && p.includes(name) && /\b(is an?|based in|works? (?:in|across)|paints?)\b/.test(p) && !/^(At|Our) Arts to Hearts/i.test(p)) || pre.find(p => /\bbased in\b|\bthe artist behind\b/i.test(p)) || pre.find(p => name && p.includes(name)) || pre.find(p => !/Arts to Hearts/i.test(p)) || r.intro || '';
  const t0 = String(title || r.title || '').replace(/[’']s\s+(Uses|Explores|Paints|Creates|Turns|Finds|Brings|Captures|Blends|Makes)\b/, ' $1').replace(/\s+/g, ' ').trim();
  const fromName = name && t0.includes(name) ? t0.slice(t0.indexOf(name)) : '';
  const titleHook = (fromName.length >= 25 && fromName.length <= 80 ? fromName : t0.length <= 80 ? t0 : '').replace(/[.:]$/, '');
  const q0 = quotes.slice().sort((a, b) => a.length - b.length)[0] || '';
  const head = titleHook ? null : q0;
  const first = (name || '').split(' ')[0];
  const kk = picks.map(n => kickOf(qa[n - 1].q) || `In ${first}’s words`);
  return {kicks: kk, name, based, medium: medium ? medium.charAt(0).toUpperCase() + medium.slice(1) : '', headline: titleHook || (head ? `“${head.replace(/\.$/, '')}”` : ''), standfirst: excerpt(sentences(about).slice(0, 2).join(' '), 250), quotes, picks, inside: rest.map(o => { const c = sentences(o.x.q).filter(x => x.endsWith('?')).pop() || o.x.q; return c.length > 110 ? excerpt(c, 104) : c; }), ctahead: 'The full interview is on our website.', hook: '', handle: ''};
}
// Sort imported images into artworks (in credit order) and portraits.
function assignImages(images, caps, roles){
  const titles = caps.map(c => (c[0] || '').toLowerCase().trim()).filter(Boolean);
  const arts = [], studio = []; const byTitle = {};
  images.forEach((im, i) => { const role = roles && roles[i]; if (role === 'skip') return;
    const hay = ((im.cap || '') + ' ' + (im.alt || '')).toLowerCase(); const ti = titles.findIndex(t => t.length > 2 && hay.includes(t));
    if (ti >= 0 && byTitle[ti] === undefined) { byTitle[ti] = im.url; return; }
    if (role === 'art' || (!role && parseCap(im.cap || ''))) arts.push(im.url); else if (im.alt !== 'cover' || role === 'portrait') studio.push(im); });
  // an artwork whose caption could not be tied to it: match the size in its credit (20×24) to the image's shape
  titles.forEach((t, i) => { if (byTitle[i] !== undefined) return; const m = String((caps[i] || [])[2] || '').match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)/); if (!m) return;
    const r = (+m[1]) / (+m[2]); const k = studio.findIndex(im => im.w && im.h && (Math.abs(im.w / im.h - r) < .04 || Math.abs(im.h / im.w - r) < .04));
    if (k >= 0) { byTitle[i] = studio[k].url; studio.splice(k, 1); } });
  return {arts: [...titles.map((t, i) => byTitle[i]).filter(Boolean), ...arts], studio: studio.map(im => im.url || im)};
}

// ---------- the package ----------
DPACK = window.DPACK || {};
DPACK.interview = p => {
  let f = p.f || {}; const I = p.imgs || {}; const arts = [].concat(I.arts || []), studio = [].concat(I.studio || []);
  const caps = dLines(f.caps), quotes = dLines(f.quotes).map(x => x.join(' | ')), qa = qaParse(f.qa);
  const badName = n => !n || n.split(/\s+/).length > 4 || /[,:]/.test(n) || /^(In|The|How|Why|When|Meet)\b/.test(n);
  const name = badName(f.name) ? 'Artist name' : f.name, handle = f.handle || '', key = (f.key || 'INTERVIEW').toUpperCase();
  const BOILER = /^(At|Our) (Arts to Hearts|Best of the Art World)|our mission is|Best of the Art World editorial/i;
  if (BOILER.test(f.intro || '')) f = {...f, intro: ''};
  const head = f.headline || 'Add a headline in the sidebar';
  const meta = [f.based].filter(Boolean).join('');
  const picks = String(f.pick || '').split(/[,\s]+/).map(Number).filter(n => n >= 1 && n <= qa.length);
  const chosen = (picks.length ? picks : qa.map((x, i) => i + 1).filter(i => qa[i - 1].a.length > 180).slice(0, 1)).slice(0, 2);
  const kicks = dLines(f.kicks).map(x => x.join(' | '));
  const teases = chosen.map((n, i) => ({kick: kicks[i] || kickOf(qa[n - 1].q) || `In ${name.split(' ')[0]}’s words`, text: openLoop(qa[n - 1].a)}));
  const inside = dLines(f.inside).map(x => x.join(' | ')).filter(Boolean);
  const shortQ = q => { const c = sentences(q).filter(x => x.endsWith('?')).pop() || q; return c.length > 110 ? excerpt(c, 104) : c; };
  const items = inside.length ? inside : qa.map((x, i) => ({x, i})).filter(o => !chosen.includes(o.i + 1)).sort((a, b) => b.x.a.length - a.x.a.length).slice(0, 3).sort((a, b) => a.i - b.i).map(o => shortQ(o.x.q));
  const at = k => ({img: arts[k] || '', slot: 'arts' + k});
  const coverFull = (f.cover || 'full') === 'full';
  const extraN = f.extra === 'all' ? 99 : f.extra === undefined || f.extra === '' ? 2 : +f.extra;
  const extras = arts.slice(3, 3 + extraN).map((u, i) => IV.plate({img: u, slot: 'arts' + (i + 3), cap: caps[i + 3], name}));
  const T = 7, S = [
    {...IV.cover({...at(0), head, name, meta, full: coverFull, mono: true}), label: 'Cover A (in use)'},
    {...IV.cover({...at(0), head, name, meta, full: !coverFull, mono: true}), label: 'Cover B: hide the one you skip'},
    IV.standfirst({img: studio[0], slot: 'studio0', text: f.intro ? excerpt(f.intro, 250) : 'Add a two-sentence intro about the artist in the sidebar, under The artist.', n: 2, t: T}),
    IV.work({...at(1), cap: caps[1], line: quotes[0], name, n: 3, t: T}),
    IV.tease({...(teases[0] || {kick: 'From the interview', text: 'Pick an answer to cut off in the sidebar.'}), n: 4, t: T}),
    IV.work({...at(2), cap: caps[2], line: quotes[1], name, flip: true, n: 5, t: T}),
    ...extras,
    IV.list({items, key, n: 6, t: T}),
    IV.end({line: f.ctahead || `The full interview with ${name} is on our website.`, mark: MARK_OK.v, invite: f.invite === undefined ? 'Want to be our next interview? Apply through the link in bio.' : f.invite, last: true}),
  ];
  const tags = ['#artstoheartsproject', '#artistinterview', ...String(f.tags || '').split(/\s+/).filter(x => x.startsWith('#'))].slice(0, 5).join(' ');
  const hook = f.hook || head;
  const capMain = `${hook} ${handle}\n\n${f.intro || ''}\n\n${teases[0] ? `${teases[0].kick}:\n"${teases[0].text}"\n\n` : ''}${items.length ? `In the full interview:\n${items.map(x => '— ' + x).join('\n')}\n\n` : ''}Comment ${key} and we'll send you the link, or read it at artstoheartsproject.com (link in bio).\n\n${f.invite !== '' ? 'Want to be our next interview? Apply through the link in bio.\n\n' : ''}${caps[0] && caps[0][0] ? `Cover: ${name}, ${caps[0][0]}${caps[0][1] ? ', ' + caps[0][1] : ''}\n\n` : ''}${tags}`.replace(/\n{3,}/g, '\n\n');
  const QC = quotes.map((q, i) => IV.quoteCard({text: q, name, handle, i}));
  const capQuote = `"${quotes[0] || ''}"\n\n${name} ${handle}, from our interview. Comment ${key} and we'll send you the full conversation.\n\n${tags}`;
  const t2 = teases[1] || teases[0];
  const hd = esc(head);
  const ST = [
    {...IV.story({...at(0), mono: true, full: coverFull, label: 'New interview', text: hd, size: head.length > 50 ? 76 : 92, sub: `An interview with ${esc(name)}`, subTop: 1385, zone: 'Link sticker: the interview'}), label: 'Story 1 · A'},
    {...IV.story({...at(0), mono: true, full: !coverFull, label: 'New interview', text: hd, size: head.length > 50 ? 76 : 92, sub: `An interview with ${esc(name)}`, subTop: 1385, zone: 'Link sticker: the interview'}), label: 'Story 1 · B (hide one)'},
    {...IV.story({dark: true, label: t2 ? t2.kick : 'From the interview', text: `&ldquo;${esc(t2 ? t2.text : head)}&rdquo;`, serif: true, size: 62, zone: 'Link sticker: read the rest'}), label: 'Story 2'},
    {...IV.story({...at(3), label: 'In their words', text: `&ldquo;${esc(quotes[2] || quotes[0] || '')}&rdquo;`, serif: true, size: 50, zone: 'Question sticker: what do you see?'}), label: 'Story 3'},
  ];
  const KIT = [IV.story({...at(0), mono: true, full: true, label: 'Featured in Arts to Hearts Project', text: esc(name), size: 110, sub: 'Read the interview at artstoheartsproject.com', subTop: 1310, zone: 'Mention @artstoheartsproject'})];
  const dm = `Hi ${name.split(' ')[0]}, your interview is live on Arts to Hearts Project and on our Instagram today. We made this story frame for you: share it and tag @artstoheartsproject and we'll reshare it to our community. Thank you for the conversation.`;
  return [
    {title: `${p.date} · Interview carousel`, meta: `${S.length - 1} slides plus a second cover to choose from · keyword ${key}`, slides: S.map((s, j) => ({...s, title: 'interview-' + (j + 1)})), cap: capMain, pin: `Comment ${key} and we'll send you the full interview.`},
    ...(QC.length ? [{title: `${p.date} · Interview quote cards`, meta: `${QC.length} singles · post one in a later week to bring people back`, slides: QC.map((s, j) => ({...s, title: 'quote-card-' + (j + 1), label: 'Quote card ' + (j + 1)})), cap: capQuote, pin: ''}] : []),
    {title: `${p.date} · Interview stories`, meta: '3 frames, with two options for the first · same day as the carousel · add the stickers in Instagram', slides: ST.map((s, j) => ({...s, title: 'interview-story-' + (j + 1)})), story: true},
    {title: `${p.date} · Artist share kit`, meta: 'Send this frame to the artist so they reshare it: their audience reaches us', slides: KIT.map((s, j) => ({...s, title: 'artist-share-' + (j + 1), label: 'For the artist'})), story: true, cap: dm, pin: ''},
  ];
};

// ---------- worked example: PQHAÜS (the article gives no pronouns, so the copy uses the name) ----------
const IV_EXAMPLE = {cat:'interview', f:{
  headline:'PQHAÜS paints what we never say out loud.', name:'PQHAÜS', handle:'@pqhaus', based:'San Francisco Bay Area', medium:'Acrylic on canvas',
  intro:'As a teenager, PQ wrote his own endings for films that left him hanging. Now he paints scenes that feel like stills from a film you can’t stop thinking about, with titles that read like something someone finally admits out loud.',
  caps:'No help is coming | 2026 | 20×20 inch | Acrylic on canvas\nI was the elephant in the room | 2025 | 24×30 | Acrylic on canvas\nI am not a bad person | 2026 | 20×24 inch | Acrylic on canvas\n2903 miles | 2025 | 30×40 | Acrylic on canvas\n31 years old | 2024 | 24×30 | Acrylic on canvas',
  quotes:'By the time I decide to paint something, the image is usually already in my head in 4K.\nI think people connect with my work because they recognize something they might hesitate to share themselves.\nI want viewers to feel that some part of the painting belongs to them, without having to arrive at the same conclusion as me.',
  pick:'9, 4', kicks:'The friend behind “We Are Always Here for You”\nWhy he never finishes the story',
  inside:'What makes difficult memories meaningful over time?\nHow does your art respond to the way people relate to one another today?\nHas exhibiting changed how your work connects with people?',
  invite:'Want to be our next interview? Apply through the link in bio.', cover:'full',
  ctahead:'The full interview with PQHAÜS is on our website.', hook:'PQHAÜS paints what we never say out loud.', key:'INTERVIEW', url:'artstoheartsproject.com', tags:'#narrativeart #cinematicart #acrylicpainting',
  qa:"Q: For someone discovering your work for the first time, how would you introduce yourself and your creative practice?\nA: I’m a person who loves art and has always needed it. Growing up, I turned to music, visual art, and poetry because they made me feel less alone. Sometimes someone I had never met could describe something I hadn’t been able to explain to the people closest to me. That shaped my understanding of what art can do. My practice comes from that experience. I create paintings that feel like scenes from a larger story, often exploring things people recognize in themselves but rarely say out loud. The setting, figures, and titles give those feelings a form without explaining every part of\n\nthem. I have something of my own to say, but I’m also interested in what the person looking recognizes in it. They bring a life I know nothing about, and that becomes part of how the work is understood.\n\nQ: The name PQHAÜS is built around the idea of a space where people can pause and feel less alone. What led you to develop this concept?\nA: I’ve been interested in Bauhaus since I was young, particularly its founding idea of bringing art, craft, and architecture together. Its connection to the Gesamtkunstwerk, or “total work of art,” interests me because different disciplines contribute to one complete experience. That influenced how I imagined my own “haus.” In my paintings, the setting, figures, objects, and words work together to build a narrative that feels almost like a short film on canvas. The house also has a personal meaning.\n\nI want people to enter my work and feel there is room for them, for their memories and their own interpretations. I built the space, but I don’t decide what each person finds there.\n\nQ: Your work explores stories people leave unspoken. How do you find those stories and decide which ones to tell?\nA: I watch a lot of films and read across different subjects, so inspiration can come from almost anywhere. But most of the themes I explore begin in conversations with people. Sometimes a passing comment stays with me longer than the conversation itself. I find myself thinking about why someone said it, or why I recognized something of myself in it. That is usually how I choose what to explore. I need to understand what draws me to a story and what I can honestly bring to it. My own experience gives me a starting point, but I try to notice when I’m projecting my feelings onto someone whose experience may be very different. Empathy and boundaries matter equally to me. Connecting with someone’s story doesn’t mean every part of it is mine to tell. I can explore a feeling that a conversation brought up without exposing the private circumstances behind it. I want to give that feeling a form while respecting the person who helped me understand it.\n\nQ: You deliberately don’t resolve the feelings in your work. Why is leaving things unresolved so important to you?\nA: I love films that leave me wondering how the characters’ lives continue. In high school, I wrote my own scenes after the endings of films like Little Miss\n\nSunshine, The Perks of Being a Wallflower, and The Truman Show. They were just for myself. I wanted those people to stay in my life a little longer. That experience shapes how I approach my paintings. I leave things unresolved so the viewer can imagine what happens beyond the moment I’ve painted. I’m interested in what happens when their interpretation takes them somewhere I couldn’t have planned.\n\nQ: Your scenes feel carefully constructed, almost like stills from a film. How do you develop a setting before you begin to paint?\nA: I’ve been a Photoshop geek since middle school. I taught myself through years of making digital collages, and I still sometimes build references by piecing together individual visual elements. These days, though, I usually begin with my own sketch without using specific references.\n\nBy the time I decide to paint something, the image is usually already in my head in 4K. The challenge is figuring out how to make it exist outside my mind. That process is honestly the most enjoyable part for me.\n\nQ: Your titles often read like the beginnings of personal conversations. How do you find the language that accompanies your work?\nA: Some titles come from conversations with friends or strangers. A sentence stays with me, and I find myself returning to it long after the conversation is over. I sometimes write it down, but the ones that affect me most tend to stay in my memory without any effort. Sometimes it takes a while to understand why those particular words mattered to me. Others take shape once I know what I want to explore. The words may come first and give the painting its direction, or I may find them while writing through an idea. Writing helps me get specific about a feeling that initially seemed difficult to name. I want the title to have a reason to exist alongside the image. It might suggest something the person in the painting cannot say, or introduce a thought that changes how you look at the scene. I’m drawn to language that feels like something someone might finally admit in a conversation, once they stop worrying about how it sounds.\n\nQ: Your paintings often leave viewers with questions rather than answers. Why is it important to make space for difficult feelings without resolving them?\nA: Because even when we face the same issue, we don’t experience it in the same way. We bring different histories and circumstances to it, and what helps one\n\nperson may mean very little to another. I want to acknowledge those differences rather than assume I have an answer for everyone. I don’t want to decide what someone should take away from a painting before they’ve had a chance to respond to it. Their memories, feelings, and questions affect what they notice and what stays with them, including things I may never have intended. Leaving something unresolved is part of respecting that.\n\nI want viewers to feel that some part of the painting belongs to them, without having to arrive at the same conclusion as me.\n\nQ: You work primarily with acrylic on canvas. What makes this medium right for the stories and emotions you explore?\nA: I’ve worked with oil, watercolor, pencil, and charcoal, but acrylic suits the way I think and work. It dries quickly, which allows me to build layers, make changes, and see the painting progress without long interruptions. I usually have a clear image in mind, so I value being able to respond immediately when something doesn’t feel right. I can paint over an area and keep working until the color, composition, and atmosphere match what I’m trying to express. That flexibility helps me stay involved in the scene as it develops.\n\nQ: In We Are Always Here for You, you explore the gap between offering support and feeling supported. What inspired this idea?\nA: The painting began with a friend I care about deeply. He is a good person, but surviving his circumstances sometimes asks him to become someone he never wanted to be. I think of it as forcing a cat to become a tiger just to survive the wilderness. His friends and I could see what he was going through. We wanted to listen and make sure he knew we were there.\n\nBut sometimes, our eagerness to help made him feel like a patient. At a time when he was beginning to feel better, our concern kept reminding him that we still saw someone who needed help. That stayed with me because the care was sincere, but it wasn’t always reaching him the way we intended. I began to question how we offer support and whether we leave enough room for someone to tell us what they actually need. Sometimes you want to know that people will catch you if you fall. You don’t want every interaction to remind you that they’re expecting you to.\n\nQ: In The Summer We Barely Afforded, you reflect on memory and limited means. What makes difficult memories meaningful over time?\nA: Because being able to look back means we made it beyond that point. There were times when I couldn’t see much past what I was going through. Now I can remember those days from a place I didn’t yet know I would reach. That matters to me. It doesn’t mean the hardship itself was good or that I would want to repeat it. But over time, I can see more than what was missing. I can recognize the patience it took to keep going and the things I still managed to enjoy when I had very little. I return to those memories because they help me understand where I am now and where I want to go. Some of what feels ordinary today would have meant a great deal to me then.\n\nQ: Your work explores what often remains hidden behind polished appearances. How do you see your art responding to the way people relate to one another today?\nA: I would rather someone dislike me for who I am than love a version of me I have to keep pretending to be. That carries into my work. I don’t want to make a feeling more presentable just because it will be easier for people to look at. Social media gives us a lot of control over how we appear, but that can make it difficult to admit anything that interrupts the image we’ve built. My paintings give those feelings somewhere to exist. They can be uncomfortable, awkward, or even ugly. Those qualities are part of what I want to show.\n\nI think people connect with my work because they recognize something they might hesitate to share themselves. There is beauty in that recognition, even when what we’re looking at isn’t necessarily beautiful.\n\nQ: Has exhibiting your work changed how you understand its ability to connect with people from different backgrounds?\nA: Yes. Exhibiting has made me think more about what people can connect with beyond the image itself. In person, you can see the brushstrokes, the texture, and the small decisions that went into making the painting. To me, those are traces of the artist’s thinking. Someone stood in front of that canvas and worked through every part of it. Online, a painting appears among countless other images. In an exhibition, there is more room to stay with it and notice something you might otherwise pass over. Its scale and physical presence become part of the story. People bring different backgrounds and experiences to that encounter. They may notice something I barely thought about or interpret a scene differently from how I intended. I value that. The painting gives us something to meet around without requiring us to have lived the same life.\n\nQ: What do you hope viewers feel when they first encounter your work, and after they spend more time with it?\nA: In the first few seconds, I want them to trust their own reaction. If they feel sad, find something funny, or even get angry, I want them to have that response without wondering whether it’s the correct one. If they stay, I hope they become curious about why they reacted that way. What caught their attention? Did it remind them of something? Does the feeling change the longer they look? I have my own reasons for making a painting, but those don’t determine what someone else has to experience. We each see it through the life we’ve lived.\n\nI’m interested in giving people enough space to follow their own perception,\n\neven when it takes them somewhere entirely different from me.\n\nQ: Has creating work around grief, vulnerability, and belonging changed how you understand these experiences in your own life?\nA: Yes. My art practice has helped me understand how much we share and how privately we carry it. Grief and vulnerability are part of being human, yet we often keep them to ourselves because there is so much pressure to be happy or show that we’re doing well. I consider myself a happy person. I love being joyful, but I think I would be miserable if happiness were the only feeling I allowed myself. It would mean constantly editing my response to my own life. If I lost someone, felt disappointed, or was hurt by something, I would have to pretend it didn’t affect me just to maintain that happiness. I don’t want to feel obligated to be okay with everything that happens to me. Sadness lets me acknowledge what matters to me, what I miss, and what I wish had been different. I need room to feel those things without treating them as a failure or something I have to immediately fix. Otherwise, even happiness would begin to feel like a responsibility. Working with these feelings has also made me more attentive to other people. My own sadness helps me understand that there may be things happening in someone’s life that I cannot see. That is where empathy begins for me, and where belonging becomes possible. We don’t have to hide everything difficult about ourselves to be part of each other’s lives.\n\nQ: If someone encounters your work during a difficult time, what would you hope they take away from it?\nA: I hope they feel they can acknowledge what they’re going through without having to make it sound better than it is. Sometimes something hurts, and accepting that it happened, that it cannot be undone, is the hardest part. I want my work to give people space to feel that and still remain curious about their lives. When you’re in pain, it can be difficult to imagine anything beyond it. You don’t yet know what will make you laugh again, who you’ll meet, or what will become important to you. Life can be beautiful and ugly, sometimes within the\n\nsame day. I don’t think we have to reconcile all of that before we can keep living. There is still something we haven’t experienced. I hope my work leaves someone willing to find out what that is.\n\nThat grief and vulnerability and the particular loneliness of modern life are not failures of character or weakness to be overcome. They are part of being human. And art that acknowledges that, without trying to fix it or explain it away, gives people something that very little else can the experience of being genuinely, completely met."},
  imgs:{arts:['art/examples/pqhaus/art-no-help-is-coming.jpg', 'art/examples/pqhaus/art-i-was-the-elephant-in-the-room.jpg', 'art/examples/pqhaus/art-i-am-not-a-bad-person.jpg', 'art/examples/pqhaus/art-2903-miles.jpg', 'art/examples/pqhaus/art-31-years-old.jpg'],
    studio:['art/examples/pqhaus/studio-2.jpg', 'art/examples/pqhaus/studio-3.jpg', 'art/examples/pqhaus/studio-4.jpg']}};
