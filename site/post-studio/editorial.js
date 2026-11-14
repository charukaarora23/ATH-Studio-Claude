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

// Concept: advice hung like a show. Every piece of advice is set as the wall label of a real artwork by an ATH artist,
// so the post stops people with the work, gives them one thing to do, and credits the artist (who reshares it).
const edLabelCredit = c => { const [who, t, y] = (c || []).map(x => String(x || '').trim()); return who ? `${esc(who)}${t ? `, <i style="${BASK};font-style:italic">${esc(t)}</i>` : ''}${y ? ', ' + esc(y) : ''}` : ''; };
const EDT = {
  // Cover A: the artwork fills the slide, the question in the artist's own voice
  coverArt(o){ return {bg: EDC.ink, html: `${ivArt(o.img, 'inset:0', o.slot, 'cover')}<div class="a" style="inset:0;background:rgba(20,9,12,.34)"></div>${ivMono('white', 'right:52px;top:36px;width:112px;height:63px')}
    <div class="a" style="left:72px;right:72px;bottom:150px;display:flex;flex-direction:column;gap:24px">
      <p class="cn" style="color:#FFFFFF">ATH Editorial</p>
      <p style="${BASK};font-size:${o.q.length > 46 ? 70 : 84}px;line-height:1.12;color:#FFFFFF">&ldquo;${esc(o.q)}&rdquo;</p>
      <p style="${T_REG};font-size:32px;line-height:1.35;color:#FFFFFF">${esc(o.sub)}</p></div>
    <p class="a" style="left:72px;bottom:60px;${T_REG};font-size:24px;color:#FFFFFF;opacity:.85">@artstoheartsproject</p>`}; },
  // Cover B: the question set large on Cream, the work small beside it
  coverType(o){ return {bg: EDC.cream, html: `${ivMono('burgundy', 'right:52px;top:36px;width:112px;height:63px')}
    <div class="a" style="left:72px;right:72px;top:230px;display:flex;flex-direction:column;gap:30px">
      <p class="cn" style="color:${EDC.burg}">ATH Editorial</p>
      <p style="${BASK};font-size:${o.q.length > 46 ? 86 : 104}px;line-height:1.08;color:${EDC.ink}">&ldquo;${esc(o.q)}&rdquo;</p>
      <p style="${T_REG};font-size:32px;line-height:1.35;color:${EDC.ink}">${esc(o.sub)}</p></div>
    ${o.img ? ivArt(o.img, 'right:72px;bottom:130px;width:300px;height:300px', o.slot) : ''}
    <p class="a" style="left:72px;bottom:60px;${T_REG};font-size:24px;color:${EDC.ink};opacity:.8">@artstoheartsproject</p>`}; },
  // The opening: the problem in plain words, no label
  open(o){ return {bg: EDC.cream, html: `${edBrand()}
    <p class="a" style="left:72px;right:72px;top:230px;${BASK};font-size:${o.text.length > 200 ? 54 : 62}px;line-height:1.28;color:${EDC.ink}">${esc(o.text)}</p>
    <p class="a" style="left:72px;right:72px;bottom:150px;${T_MED};font-size:32px;color:${EDC.burg}">Here is what we tell them &rarr;</p>${edFoot()}`}; },
  // A piece of advice as the label of a work: the work whole on Cream, the label set under it
  label(o){ if (!o.img) return EDT.plain(o); return {bg: EDC.cream, html: `${edBrand()}${ivArt(o.img, 'left:72px;right:72px;top:120px;height:700px', o.slot)}
    <div class="a" style="left:72px;right:72px;top:860px;display:flex;flex-direction:column;gap:16px">
      <p style="${T_MED};font-size:${o.title.length > 34 ? 52 : 60}px;line-height:1.02;letter-spacing:-.025em;color:${EDC.ink}">${esc(o.title)}</p>
      ${o.how ? `<p style="${BASK};font-size:${o.how.length > 130 ? 30 : 34}px;line-height:1.38;color:${EDC.ink}">${esc(o.how)}</p>` : ''}
      ${o.credit ? `<p style="${T_REG};font-size:22px;line-height:1.35;color:${EDC.soft};margin-top:4px">Shown: ${edLabelCredit(o.credit)}</p>` : ''}</div>${edFoot()}`}; },
  // When there is no artwork for a piece of advice: the advice alone, set like a pull quote
  plain(o){ return {bg: EDC.cream, html: `${edBrand()}
    <div class="a" style="left:72px;right:72px;top:250px;display:flex;flex-direction:column;gap:34px">
      <p style="${T_MED};font-size:${o.title.length > 34 ? 82 : 96}px;line-height:.98;letter-spacing:-.035em;color:${EDC.ink}">${esc(o.title)}</p>
      ${o.how ? `<p style="${BASK};font-size:44px;line-height:1.34;color:${EDC.ink}">${esc(o.how)}</p>` : ''}</div>${edFoot()}`}; },
  // The habit to drop, struck through, and what to do instead
  instead(o){ return {bg: EDC.cream, html: `${edBrand()}
    <div class="a" style="left:72px;right:72px;top:220px;display:flex;flex-direction:column;gap:44px">
      <p style="${BASK};font-style:italic;font-size:${o.bad.length > 90 ? 50 : 60}px;line-height:1.25;color:rgba(28,19,16,.45);text-decoration:line-through;text-decoration-color:${EDC.burg};text-decoration-thickness:4px">&ldquo;${esc(o.bad)}&rdquo;</p>
      <p style="${T_MED};font-size:${o.good.length > 90 ? 52 : 62}px;line-height:1.06;letter-spacing:-.025em;color:${EDC.ink}">${esc(o.good)}</p></div>${edFoot()}`}; },
  // The whole guide in one sentence you could say to a friend
  short(o){ return {bg: EDC.cream, html: `${edBrand()}
    <p class="a" style="left:72px;top:200px;${T_MED};font-size:26px;letter-spacing:.12em;text-transform:uppercase;color:${EDC.burg}">The short version</p>
    <p class="a" style="left:72px;right:72px;top:270px;${BASK};font-size:${o.text.length > 220 ? 50 : 58}px;line-height:1.3;color:${EDC.ink}">${esc(o.text)}</p>
    <p class="a" style="left:72px;right:72px;bottom:150px;${T_REG};font-size:30px;color:${EDC.ink}">Save this for the next time someone asks.</p>${edFoot()}`}; },
  cta(o){ return {bg: EDC.cream, html: `${edBrand()}
    <div class="a" style="left:72px;right:72px;top:240px;display:flex;flex-direction:column;gap:16px">
      <p style="${BASK};font-size:58px;line-height:1.24;color:${EDC.ink}">${esc(o.head)}</p>
      <p style="${BASK};font-style:italic;font-size:54px;color:${EDC.ink};margin-top:70px">Comment</p>
      <p style="${T_MED};font-size:${o.key.length > 8 ? 150 : 190}px;line-height:.9;letter-spacing:-.05em;color:${EDC.burg}">${esc(o.key)}</p>
      <p style="${T_REG};font-size:32px;line-height:1.4;color:${EDC.ink};margin-top:30px">${esc(o.offer)}</p></div>${edFoot()}`}; },
  end(o){ return {bg: EDC.burg, html: `${ivMono('peony', 'left:390px;width:300px;top:250px;height:170px')}
    <p class="a c" style="left:110px;right:110px;top:520px;${BASK};font-size:44px;line-height:1.3;color:#F9EEE5">${esc(o.line)}</p>
    ${o.invite ? `<div class="a" style="left:300px;right:300px;top:860px;border-top:1px solid rgba(250,210,225,.35)"></div><p class="a c" style="left:120px;right:120px;top:900px;${T_REG};font-size:32px;line-height:1.4;color:#FAD2E1">${esc(o.invite)}</p>` : ''}
    <p class="a c" style="left:0;right:0;bottom:96px;${T_REG};font-size:28px;color:#FAD2E1">artstoheartsproject.com</p>`}; },
};

// ---------- the form ----------
DCAT.editorial = {name: 'ATH Editorial', marker: '//EDITORIAL', key: 'GUIDE', pack: true, groups: [
  ['Cover', [
    {k: 'cover', label: 'Cover in use (both are shown, hide the one you skip)', type: 'select', options: [['art', 'A: the artwork fills the slide'], ['type', 'A: the question on Cream']]},
    {k: 'question', label: 'The question, in an artist’s own words', type: 'text', ph: 'How should I price my art?'},
    {k: 'sub', label: 'Line under it', type: 'text', ph: 'What we tell artists who ask us this'}]],
  ['The advice', [
    {k: 'why', label: 'Opening: the problem, said plainly (no label on the slide)', type: 'area'},
    {k: 'steps', label: 'Advice, one per line: the advice as a sentence | one line on how', type: 'lines'},
    {k: 'imgs', label: 'Artworks to hang the advice on: 1 the cover, then one per piece of advice (from ATH artists)', type: 'imgs'},
    {k: 'credits', label: 'Their credits, same order: Artist | Title | Year', type: 'lines'}]],
  ['Instead of', [
    {k: 'bad', label: 'The habit artists should drop, in their words (struck through)', type: 'text', ph: 'I’ll price it lower so it sells.'},
    {k: 'good', label: 'What to do instead', type: 'text', ph: 'Price it so the next one can sell for more.'},
    {k: 'short', label: 'The short version: the whole guide in one sentence', type: 'area'}]],
  ['The action', [
    {k: 'key', label: 'Comment keyword (its DM must send the guide, not a submission pitch)', type: 'text', ph: 'GUIDE'},
    {k: 'ctahead', label: 'Line above the keyword', type: 'text', ph: 'Want the whole guide, with the examples?'},
    {k: 'offer', label: 'What they get', type: 'text', ph: 'We’ll send it to you in your DMs. Or read it at artstoheartsproject.com, link in bio.'},
    {k: 'endline', label: 'End card line', type: 'text', ph: 'New guides for artists every week.'},
    {k: 'invite', label: 'End card invitation (leave empty to hide)', type: 'text', ph: 'Follow @artstoheartsproject for the next one.'}]],
  ['Stories and caption', [
    {k: 'ask', label: 'Story question box', type: 'text', ph: 'What do you find hardest about pricing?'},
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
  return {cover: 'art', question: c.question || askOf(e.title), sub: c.sub || 'What we tell artists who ask us this',
    why: c.why || e.why, steps: steps.map(s => `${s.title} | ${s.how || ''}`).join('\n'), bad: c.bad || '', good: c.good || e.avoid || '', short,
    key: 'GUIDE', ctahead: 'Want the whole guide, with the examples?', offer: 'We’ll send it to you in your DMs. Or read it at artstoheartsproject.com, link in bio.',
    endline: 'New guides for artists every week.', invite: 'Follow @artstoheartsproject for the next one.', ask: c.ask || '', hook: c.hook || ''};
}

// ---------- the package ----------
DPACK.editorial = p => {
  const f = p.f || {}, imgs = [].concat((p.imgs || {}).imgs || []), credits = dLines(f.credits);
  const steps = dLines(f.steps).map(x => ({title: x[0] || '', how: x.slice(1).join(' | ')})).filter(s => s.title);
  const key = (f.key || 'GUIDE').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'GUIDE';
  const q = (f.question || f.headline || 'Add the question in the sidebar').replace(/^“|”$/g, ''), sub = f.sub || 'What we tell artists who ask us this';
  const artCover = (f.cover || 'art') === 'art';
  const A = EDT.coverArt({q, sub, img: imgs[0] || '', slot: 'imgs0'}), Bc = EDT.coverType({q, sub, img: imgs[0] || '', slot: 'imgs0'});
  const advice = (s, i) => EDT.label({title: s.title, how: s.how, img: imgs[i + 1] || '', slot: 'imgs' + (i + 1), credit: credits[i + 1]});
  const S = [
    {...(artCover ? A : Bc), label: 'Cover A (in use)'}, {...(artCover ? Bc : A), label: 'Cover B: hide the one you skip'},
    ...(f.why ? [EDT.open({text: f.why})] : []),
    ...steps.slice(0, 6).map(advice),
    ...(f.good ? [EDT.instead({bad: f.bad || 'I’ll work it out later.', good: f.good})] : []),
    ...(f.short ? [EDT.short({text: f.short})] : []),
    EDT.cta({head: f.ctahead || 'Want the whole guide, with the examples?', key, offer: f.offer || 'We’ll send it to you in your DMs. Or read it at artstoheartsproject.com, link in bio.'}),
    EDT.end({line: f.endline || 'New guides for artists every week.', invite: f.invite === undefined ? 'Follow @artstoheartsproject for the next one.' : f.invite}),
  ];
  const tags = ['#artstoheartsproject', '#artbusiness', ...String(f.tags || '').split(/\s+/).filter(x => x.startsWith('#'))].slice(0, 5).join(' ');
  const who = [...new Set(credits.map(c => c[0]).filter(Boolean))].join(', ');
  const cap = `${f.hook || q}\n\n${f.why || ''}\n\n${steps.map(s => `${s.title}.${s.how ? ' ' + s.how : ''}`).join('\n\n')}\n\n${f.short ? 'The short version: ' + f.short + '\n\n' : ''}Comment ${key} and we'll send you the whole guide.${who ? `\n\nWorks shown: ${who}.` : ''}\n\n${tags}`.replace(/\n{3,}/g, '\n\n');
  const SINGLES = steps.slice(0, 6).map((s, i) => ({...advice(s, i), label: 'Single ' + (i + 1)}));
  const ST = [
    {...IV.story({full: !!imgs[0], cream: !imgs[0], img: imgs[0], slot: 'imgs0', mono: true, label: 'ATH Editorial', text: `&ldquo;${esc(q)}&rdquo;`, serif: true, size: 72, sub: esc(sub), zone: 'Link sticker: read the guide'}), label: 'Story 1'},
    ...(f.good ? [{...IV.story({cream: true, label: 'Which one sounds like you?', text: `<span style="text-decoration:line-through;text-decoration-color:#6A0620;opacity:.5">&ldquo;${esc(f.bad || 'I’ll work it out later.')}&rdquo;</span><br><br>${esc(f.good)}`, serif: true, size: 56, zone: 'Poll sticker: Guilty / Not me'}), label: 'Story 2 · poll'}] : []),
    ...(steps.length ? [{...IV.story({dark: true, label: 'From the guide', text: esc(steps[0].title), sub: esc(steps[0].how || ''), zone: 'Link sticker: the whole guide'}), label: 'Story 3'}] : []),
    {...IV.story({cream: true, label: 'Your turn', text: esc(f.ask || 'What do you want to ask us about this?'), serif: true, size: 64, zone: 'Question sticker'}), label: 'Story 4 · question box'},
  ];
  return [
    {title: `${p.date} · Editorial carousel`, meta: `${S.length - 1} slides plus a second cover to choose from · keyword ${key}`, slides: S.map((s, j) => ({...s, title: 'editorial-' + (j + 1)})), cap, pin: `Comment ${key} and we'll send you the whole guide.`},
    ...(SINGLES.length ? [{title: `${p.date} · Editorial singles`, meta: `${SINGLES.length} single posts for later weeks: one piece of advice on one artwork, each sends people back to the guide`, slides: SINGLES.map((s, j) => ({...s, title: 'single-' + (j + 1)})), cap: steps[0] ? `${steps[0].title}.\n\n${steps[0].how}\n\nFrom our guide "${q}". Comment ${key} and we'll send you the whole thing.\n\n${tags}` : '', pin: ''}] : []),
    {title: `${p.date} · Editorial stories`, meta: 'Same day as the carousel · add the stickers in Instagram', slides: ST.map((s, j) => ({...s, title: 'editorial-story-' + (j + 1)})), story: true},
  ];
};

// ---------- example: advice hung on works by PQHAÜS, an artist we featured ----------
const ED_EXAMPLE = {cat: 'editorial', f: {
  cover: 'art', question: 'How should I price my art?', sub: 'What we tell artists who ask us this',
  why: 'Most artists price by gut feeling, then second-guess every sale. Buyers trust a price you can explain, and you sleep better when you can explain it.',
  steps: 'Know what a piece really costs you | Add up materials, framing and your hours before you think about any number.\nPick one way of pricing and keep it | Price by size, so every work in a series makes sense next to the others.\nCompare yourself with artists like you | Look at artists at your stage, size and medium, not at famous names or hobby sellers.\nShow one price everywhere | Your studio, your website and a gallery should all say the same thing, or buyers stop trusting it.\nRaise your prices when you sell out | A waiting list is your sign to move up 10 to 20 percent.',
  credits: 'PQHAÜS | No help is coming | 2026\nPQHAÜS | I was the elephant in the room | 2025\nPQHAÜS | I am not a bad person | 2026\nPQHAÜS | 2903 miles | 2025\nPQHAÜS | 31 years old | 2024\nPQHAÜS | No help is coming | 2026',
  bad: 'I’ll drop the price a little so it sells.', good: 'Hold the price. The buyers who paid it are watching, and it is hard to go back up.',
  short: 'Know your costs, pick one way of pricing and keep it, compare yourself with artists like you, show one price everywhere, and raise it when you sell out.',
  key: 'GUIDE', ctahead: 'Want the whole guide, with the examples?', offer: 'We’ll send it to you in your DMs. Or read it at artstoheartsproject.com, link in bio.',
  endline: 'New guides for artists every week.', invite: 'Follow @artstoheartsproject for the next one.', ask: 'What do you find hardest about pricing?', hook: 'How should I price my art? The question we get most, answered.', tags: '#pricingart #artistadvice'},
  imgs: {imgs: ['art/examples/pqhaus/art-no-help-is-coming.jpg', 'art/examples/pqhaus/art-i-was-the-elephant-in-the-room.jpg', 'art/examples/pqhaus/art-i-am-not-a-bad-person.jpg', 'art/examples/pqhaus/art-2903-miles.jpg', 'art/examples/pqhaus/art-31-years-old.jpg', 'art/examples/pqhaus/art-no-help-is-coming.jpg']}};
