/* ATH Post Studio · ATH EDITORIAL (art business guides from the website).
   Job: give artists something they can act on today, so they save, share and comment the keyword.
   The keyword's DM delivers the guide itself (value first), which puts them on the list. That is the lead.
   Same system as the interviews (grid, fonts, brand line, monogram first and last, Burgundy end card).
   Its own marks: a Cream ground instead of White, big Burgundy step numbers, the "ATH Editorial" series line. */

const EDC = {cream: '#F9EEE5', ink: '#1C1310', burg: '#6A0620', soft: 'rgba(28,19,16,.6)', rule: 'rgba(28,19,16,.16)'};
const edBrand = (fg = EDC.ink) => `<p class="a cn" style="left:52px;top:48px;color:${fg}">Arts to Hearts Project</p>`;
const edFoot = (last) => `<p class="a" style="left:72px;bottom:60px;${T_REG};font-size:24px;color:${EDC.ink};opacity:.8">@artstoheartsproject</p>
  ${last ? '' : `<div class="a" style="right:72px;bottom:46px;width:56px;height:56px;border-radius:50%;background:${EDC.burg};display:flex;align-items:center;justify-content:center;${T_MED};font-size:28px;color:#FFFFFF">&rarr;</div>`}`;
const edSize = (t, big, mid, small) => t.length > 64 ? small : t.length > 38 ? mid : big;

const EDT = {
  // Cover A: type only, the step count as the big Burgundy mark
  coverType(o){ const h = o.head; return {bg: EDC.cream, html: `${ivMono('burgundy', 'right:52px;top:36px;width:112px;height:63px')}
    <div class="a" style="left:72px;right:72px;top:250px;display:flex;flex-direction:column;gap:26px">
      <p class="cn" style="color:${EDC.burg}">ATH Editorial</p>
      <p style="${T_MED};font-size:${edSize(h, 116, 98, 80)}px;line-height:.96;letter-spacing:-.035em;color:${EDC.ink}">${esc(h)}</p>
      <p style="${T_REG};font-size:32px;line-height:1.35;color:${EDC.ink}">${esc(o.sub)}</p></div>
    ${o.count ? `<p class="a" style="right:64px;bottom:40px;${T_MED};font-size:440px;line-height:.8;letter-spacing:-.06em;color:${EDC.burg}">${o.count}</p>` : ''}
    <p class="a" style="left:72px;bottom:60px;${T_REG};font-size:24px;color:${EDC.ink};opacity:.8">@artstoheartsproject</p>`}; },
  // Cover B: an image on Cream, then the headline
  coverImage(o){ const h = o.head; return {bg: EDC.cream, html: `${ivMono('burgundy', 'right:52px;top:36px;width:112px;height:63px')}${ivArt(o.img, 'left:72px;right:72px;top:130px;height:600px', o.slot, 'cover')}
    <div class="a" style="left:72px;right:72px;top:776px;display:flex;flex-direction:column;gap:22px">
      <p class="cn" style="color:${EDC.burg}">ATH Editorial</p>
      <p style="${T_MED};font-size:${edSize(h, 92, 80, 68)}px;line-height:.96;letter-spacing:-.035em;color:${EDC.ink}">${esc(h)}</p>
      <p style="${T_REG};font-size:30px;color:${EDC.ink}">${esc(o.sub)}</p></div>${edFoot()}`}; },
  why(o){ return {bg: EDC.cream, html: `${edBrand()}
    <div class="a" style="left:72px;right:72px;top:200px;display:flex;flex-direction:column;gap:30px">
      <p style="${T_MED};font-size:26px;letter-spacing:.12em;text-transform:uppercase;color:${EDC.burg}">Why it matters</p>
      <p style="${BASK};font-size:${o.text.length > 200 ? 48 : 56}px;line-height:1.26;color:${EDC.ink}">${esc(o.text)}</p></div>${edFoot()}`}; },
  step(o){ return {bg: EDC.cream, html: `${edBrand()}
    <p class="a" style="left:60px;top:140px;${T_MED};font-size:280px;line-height:.82;letter-spacing:-.06em;color:${EDC.burg}">${String(o.n).padStart(2, '0')}</p>
    <div class="a" style="left:72px;right:72px;top:470px;display:flex;flex-direction:column;gap:28px">
      <p style="${T_MED};font-size:${edSize(o.title, 76, 64, 54)}px;line-height:1;letter-spacing:-.03em;color:${EDC.ink}">${esc(o.title)}</p>
      ${o.how ? `<p style="${BASK};font-size:${o.how.length > 150 ? 36 : 40}px;line-height:1.36;color:${EDC.ink}">${esc(o.how)}</p>` : ''}
      ${o.more ? `<p style="${T_MED};font-size:32px;color:${EDC.burg};margin-top:10px">${esc(o.more)} &rarr;</p>` : ''}</div>${edFoot()}`}; },
  save(o){ return {bg: EDC.cream, html: `${edBrand()}
    <div class="a" style="left:72px;right:72px;top:180px;display:flex;flex-direction:column;gap:0">
      <p style="${T_MED};font-size:26px;letter-spacing:.12em;text-transform:uppercase;color:${EDC.burg};margin-bottom:30px">Save this for later</p>
      ${o.items.map(t => `<div style="display:flex;gap:26px;align-items:flex-start;padding:24px 0;border-top:1px solid ${EDC.rule}"><span style="flex:none;width:34px;height:34px;border:2.5px solid ${EDC.ink};border-radius:6px;margin-top:6px"></span><span style="${T_MED};font-size:${o.items.length > 5 ? 36 : 42}px;line-height:1.12;letter-spacing:-.02em;color:${EDC.ink}">${esc(t)}</span></div>`).join('')}</div>
    <p class="a" style="left:72px;right:72px;bottom:130px;${T_REG};font-size:30px;color:${EDC.ink}">Tap save, so it is here when you need it.</p>${edFoot()}`}; },
  avoid(o){ return {bg: EDC.cream, html: `${edBrand()}
    <div class="a" style="left:72px;right:72px;top:200px;display:flex;flex-direction:column;gap:30px">
      <p style="${T_MED};font-size:26px;letter-spacing:.12em;text-transform:uppercase;color:${EDC.burg}">The mistake to avoid</p>
      <p style="${BASK};font-size:${o.text.length > 180 ? 48 : 56}px;line-height:1.26;color:${EDC.ink}">${esc(o.text)}</p></div>${edFoot()}`}; },
  // The action slide: the keyword is the biggest thing on it
  cta(o){ return {bg: EDC.cream, html: `${edBrand()}
    <div class="a" style="left:72px;right:72px;top:220px;display:flex;flex-direction:column;gap:18px">
      <p style="${T_MED};font-size:26px;letter-spacing:.12em;text-transform:uppercase;color:${EDC.burg}">The full guide</p>
      <p style="${T_MED};font-size:72px;line-height:1;letter-spacing:-.03em;color:${EDC.ink};margin-top:12px">${esc(o.head)}</p>
      <p style="${BASK};font-style:italic;font-size:56px;color:${EDC.ink};margin-top:60px">Comment</p>
      <p style="${T_MED};font-size:${o.key.length > 8 ? 150 : 190}px;line-height:.9;letter-spacing:-.05em;color:${EDC.burg}">${esc(o.key)}</p>
      <p style="${T_REG};font-size:32px;line-height:1.4;color:${EDC.ink};margin-top:30px">${esc(o.offer)}</p></div>${edFoot()}`}; },
  end(o){ return {bg: EDC.burg, html: `${ivMono('peony', 'left:390px;width:300px;top:250px;height:170px')}
    <p class="a c" style="left:110px;right:110px;top:520px;${BASK};font-size:44px;line-height:1.3;color:#F9EEE5">${esc(o.line)}</p>
    ${o.invite ? `<div class="a" style="left:300px;right:300px;top:860px;border-top:1px solid rgba(250,210,225,.35)"></div><p class="a c" style="left:120px;right:120px;top:900px;${T_REG};font-size:32px;line-height:1.4;color:#FAD2E1">${esc(o.invite)}</p>` : ''}
    <p class="a c" style="left:0;right:0;bottom:96px;${T_REG};font-size:28px;color:#FAD2E1">artstoheartsproject.com</p>`}; },
  // Single tip cards for later weeks: one step, savable on its own
  tip(o){ return {bg: EDC.cream, html: `${edBrand()}
    <p class="a" style="left:72px;top:170px;${T_MED};font-size:26px;letter-spacing:.12em;text-transform:uppercase;color:${EDC.burg}">Tip ${o.n} of ${o.of}</p>
    <div class="a" style="left:72px;right:72px;top:250px;display:flex;flex-direction:column;gap:30px">
      <p style="${T_MED};font-size:${edSize(o.title, 96, 80, 64)}px;line-height:.98;letter-spacing:-.035em;color:${EDC.ink}">${esc(o.title)}</p>
      ${o.how ? `<p style="${BASK};font-size:42px;line-height:1.34;color:${EDC.ink}">${esc(o.how)}</p>` : ''}</div>
    <p class="a" style="left:72px;right:72px;bottom:60px;${T_REG};font-size:26px;color:${EDC.ink}">From the ATH Editorial guide: <i style="${BASK};font-style:italic">${esc(o.guide)}</i></p>`}; },
};

// ---------- the form ----------
DCAT.editorial = {name: 'ATH Editorial', marker: '//EDITORIAL', key: 'GUIDE', pack: true, groups: [
  ['Cover', [
    {k: 'cover', label: 'Cover in use (both are shown, hide the one you skip)', type: 'select', options: [['type', 'A: type and the big step number, on Cream'], ['image', 'A: image on top']]},
    {k: 'headline', label: 'Headline: the result the reader gets', type: 'text', ph: 'How to price your art with confidence'},
    {k: 'sub', label: 'Line under the headline', type: 'text', ph: 'A guide for artists'},
    {k: 'imgs', label: 'Image for the image cover (optional)', type: 'imgs'}]],
  ['The guide', [
    {k: 'why', label: 'Why it matters: the problem, in one or two sentences', type: 'area'},
    {k: 'steps', label: 'Steps, one per line: Step title | how to do it, in one sentence', type: 'lines'},
    {k: 'avoid', label: 'The mistake to avoid (optional)', type: 'area'}]],
  ['The action', [
    {k: 'key', label: 'Comment keyword (its DM must send the guide, not a submission pitch)', type: 'text', ph: 'GUIDE'},
    {k: 'ctahead', label: 'Line above the keyword', type: 'text', ph: 'Get the full guide in your DMs.'},
    {k: 'offer', label: 'What they get when they comment', type: 'text', ph: 'We’ll send you the full guide and the checklist. Or read it at artstoheartsproject.com, link in bio.'},
    {k: 'endline', label: 'End card line', type: 'text', ph: 'New guides for artists every week.'},
    {k: 'invite', label: 'End card invitation (leave empty to hide)', type: 'text', ph: 'Follow @artstoheartsproject for the next one.'}]],
  ['Stories and caption', [
    {k: 'poll', label: 'Story poll question', type: 'text', ph: 'Which one is harder for you?'},
    {k: 'ask', label: 'Story question box', type: 'text', ph: 'Ask us anything about pricing'},
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
// Turn the parsed guide (and Claude's copy, if connected) into the form fields
function editorialFields(e, ai){
  const c = {...(ai || {})}; const steps = (c.steps && c.steps.length ? c.steps : e.steps);
  return {headline: c.headline || (e.title.length <= 80 ? e.title : e.title.split(/[:—–]/)[0]), sub: c.sub || `A guide for artists${steps.length ? ' · ' + steps.length + ' steps' : ''}`,
    why: c.why || e.why, steps: steps.map(s => `${s.title} | ${s.how || ''}`).join('\n'), avoid: c.avoid || e.avoid,
    key: 'GUIDE', ctahead: 'Get the full guide in your DMs.', offer: 'We’ll send you the full guide and the checklist. Or read it at artstoheartsproject.com, link in bio.',
    endline: 'New guides for artists every week.', invite: 'Follow @artstoheartsproject for the next one.',
    poll: c.poll || 'Which one is harder for you?', ask: c.ask || '', hook: c.hook || ''};
}

// ---------- the package ----------
DPACK.editorial = p => {
  const f = p.f || {}, imgs = [].concat((p.imgs || {}).imgs || []);
  const steps = dLines(f.steps).map(x => ({title: x[0] || '', how: x.slice(1).join(' | ')})).filter(s => s.title);
  const key = (f.key || 'GUIDE').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'GUIDE';
  const head = f.headline || 'Add a headline in the sidebar', sub = f.sub || 'A guide for artists';
  const coverType = (f.cover || 'type') === 'type';
  const shown = steps.slice(0, 5), rest = steps.length - shown.length;
  const A = EDT.coverType({head, sub, count: steps.length || ''}), Bc = EDT.coverImage({head, sub, img: imgs[0] || '', slot: 'imgs0'});
  const S = [
    {...(coverType ? A : Bc), label: 'Cover A (in use)'}, {...(coverType ? Bc : A), label: 'Cover B: hide the one you skip'},
    ...(f.why ? [EDT.why({text: f.why})] : []),
    ...shown.map((s, i) => EDT.step({n: i + 1, title: s.title, how: s.how, more: rest && i === shown.length - 1 ? `${rest} more step${rest > 1 ? 's' : ''} in the full guide` : ''})),
    ...(steps.length ? [EDT.save({items: steps.map(s => s.title)})] : []),
    ...(f.avoid ? [EDT.avoid({text: f.avoid})] : []),
    EDT.cta({head: f.ctahead || 'Get the full guide in your DMs.', key, offer: f.offer || 'We’ll send you the full guide and the checklist. Or read it at artstoheartsproject.com, link in bio.'}),
    EDT.end({line: f.endline || 'New guides for artists every week.', invite: f.invite === undefined ? 'Follow @artstoheartsproject for the next one.' : f.invite}),
  ];
  const tags = ['#artstoheartsproject', '#artbusiness', ...String(f.tags || '').split(/\s+/).filter(x => x.startsWith('#'))].slice(0, 5).join(' ');
  const cap = `${f.hook || head}\n\n${f.why || ''}\n\n${steps.map((s, i) => `${i + 1}. ${s.title}${s.how ? ' — ' + s.how : ''}`).join('\n')}\n\nComment ${key} and we'll send you the full guide and the checklist. Save this so you have it when you need it.\n\n${tags}`.replace(/\n{3,}/g, '\n\n');
  const TIPS = steps.slice(0, 6).map((s, i) => EDT.tip({n: i + 1, of: steps.length, title: s.title, how: s.how, guide: head}));
  const tipCap = s => `${s.title}.\n\n${s.how}\n\nOne tip from our guide "${head}". Comment ${key} and we'll send you the whole thing.\n\n${tags}`;
  const ST = [
    {...IV.story({cream: true, mono: true, label: 'ATH Editorial', text: esc(head), sub: esc(sub), subTop: 0, zone: 'Link sticker: read the guide'}), label: 'Story 1'},
    ...(steps.length > 1 ? [{...IV.story({cream: true, label: f.poll || 'Which one is harder for you?', text: `${esc(steps[0].title)}<br><span style="opacity:.45">or</span><br>${esc(steps[1].title)}`, zone: `Poll sticker: ${esc(steps[0].title.slice(0, 24))} / ${esc(steps[1].title.slice(0, 24))}`}), label: 'Story 2 · poll'}] : []),
    ...(steps.length ? [{...IV.story({dark: true, label: `Step 1 of ${steps.length}`, text: `${esc(steps[0].title)}`, sub: esc(steps[0].how || ''), zone: 'Link sticker: the full guide'}), label: 'Story 3'}] : []),
    {...IV.story({cream: true, label: 'Your turn', text: esc(f.ask || `Ask us anything about this`), zone: 'Question sticker'}), label: 'Story 4 · question box'},
  ];
  return [
    {title: `${p.date} · Editorial carousel`, meta: `${S.length - 1} slides plus a second cover to choose from · keyword ${key}`, slides: S.map((s, j) => ({...s, title: 'editorial-' + (j + 1)})), cap, pin: `Comment ${key} and we'll send you the full guide.`},
    ...(TIPS.length ? [{title: `${p.date} · Editorial tip cards`, meta: `${TIPS.length} singles · post one in a later week, each sends people back to the guide`, slides: TIPS.map((s, j) => ({...s, title: 'tip-' + (j + 1), label: 'Tip card ' + (j + 1)})), cap: tipCap(steps[0]), pin: ''}] : []),
    {title: `${p.date} · Editorial stories`, meta: 'Same day as the carousel · add the stickers in Instagram', slides: ST.map((s, j) => ({...s, title: 'editorial-story-' + (j + 1)})), story: true},
  ];
};

// ---------- example: a pricing guide, so the section never opens empty ----------
const ED_EXAMPLE = {cat: 'editorial', f: {
  cover: 'type', headline: 'How to price your art with confidence', sub: 'A guide for artists · 5 steps',
  why: 'Most artists price by gut feeling, then second-guess every sale. A clear, repeatable method makes pricing calm, and buyers trust a price you can explain.',
  steps: 'Know your real costs | Add up materials, framing and the hours you put in before you set any number.\nPick one formula and keep it | Price by size, for example width plus height times a set rate, so every work in a series makes sense next to the others.\nLook at artists like you | Compare with artists at your stage, size and medium, not with famous names or with hobby sellers.\nKeep one price everywhere | Your studio, your website and a gallery should all show the same price, or buyers stop trusting it.\nRaise prices as you sell | When a series sells out or you get a waiting list, move your rate up by 10 to 20 percent.',
  avoid: 'Never drop a price to close one sale. The buyers who paid full price notice, and it is hard to go back up.',
  key: 'GUIDE', ctahead: 'Get the full guide in your DMs.', offer: 'We’ll send you the full guide and the pricing checklist. Or read it at artstoheartsproject.com, link in bio.',
  endline: 'New guides for artists every week.', invite: 'Follow @artstoheartsproject for the next one.', poll: 'Which one is harder for you?', ask: 'Ask us anything about pricing your work', hook: 'How to price your art with confidence, in 5 steps.', tags: '#pricingart #artistadvice'},
  imgs: {imgs: ['art/flower-portrait.jpg']}};
