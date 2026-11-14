/* ATH Post Studio · THE HEART LIST (the weekly artists we discovered, from the website).
   Job: make finding new artists on our page a weekly habit, and a little fun.
   For the audience: five works worth stopping for, the artists tagged, a question to answer (which one would you take home?), five more next week.
   For artists (the lead): "Want your work on next week's list?" The comment keyword sends them how to get featured and the open call.
   Same system as the interviews and editorial: white ground, ink type, Burgundy accents, brand line top left, monogram on the cover and the end card.
   Artworks are never cropped. */

const HL = {white: '#FFFFFF', ink: '#1C1310', burg: '#6A0620', rose: '#FFA1C2', pink: '#FAD2E1', soft: 'rgba(28,19,16,.62)'};
const HL_NUM = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const hlBrand = (fg = HL.ink) => `<p class="a cn" style="left:52px;top:48px;color:${fg}">Arts to Hearts Project</p>`;
const hlCredit = (w, big) => `<p style="${BASK};font-style:italic;font-size:${big ? 46 : 40}px;line-height:1.18;color:${HL.ink}">${esc(w.title || 'Untitled')}</p>
  <p style="${T_MED};font-size:${big ? 32 : 28}px;line-height:1.3;color:${HL.ink}">${esc(w.artist || '')}${w.handle ? ` <span style="color:${HL.burg}">${esc(w.handle)}</span>` : ''}</p>`;

const HLT = {
  // Cover, poster style: one line set like a film title (a serif line, then the big line), over the artwork or on solid Maroon.
  cover(o){ const solid = o.solid || !o.img, big = String(o.big || '').toUpperCase().trim();
    const words = big.length > 11 && big.includes(' ') ? splitHalf(big) : [big];
    const bs = Math.min(176, Math.floor(930 / (Math.max(...words.map(w => w.length), 1) * .64)));
    const fg = solid ? HL.rose : HL.white;
    return {bg: solid ? HL.burg : HL.ink, html: `${solid ? '' : `${ivArt(o.img, 'inset:0', 'arts0', 'cover')}<div class="a" style="inset:0;background:rgba(20,9,12,.38)"></div>`}
      <p class="a cn" style="left:52px;top:48px;color:${HL.pink}">Arts to Hearts Project</p>${ivMono('peony', 'right:52px;top:40px;width:96px;height:54px')}
      <div class="a" style="left:60px;right:60px;top:120px;bottom:130px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
        <p style="${T_MED};font-size:26px;letter-spacing:.24em;text-transform:uppercase;color:${solid ? HL.pink : HL.white}">The Heart List</p>
        <p style="${BASK};font-size:84px;line-height:1.05;letter-spacing:.01em;text-transform:uppercase;color:${fg};margin-top:34px">${esc(o.serif || '')}</p>
        <p style="${T_MED};font-size:${bs}px;line-height:.9;letter-spacing:-.03em;color:${fg};margin-top:10px">${words.map(esc).join('<br>')}</p>
        <p style="${T_REG};font-size:30px;line-height:1.4;letter-spacing:.06em;text-transform:uppercase;color:${solid ? HL.pink : HL.white};margin-top:40px">${esc(o.under || '')}</p></div>
      <p class="a c" style="left:0;right:0;bottom:64px;${T_MED};font-size:28px;color:${HL.pink}">Swipe &rarr;</p>`}; },
  // One work per slide: the artwork whole, the credit. In the "under" layout the line about it sits below, highlighted.
  work(o){ const w = o.w; return {bg: HL.white, html: `${hlBrand()}
    ${ivArt(o.img, `left:72px;right:72px;top:120px;height:${o.under ? 800 : 860}px`, o.slot)}
    <div class="a" style="left:72px;right:72px;top:${o.under ? 950 : 1010}px;bottom:56px;display:flex;flex-direction:column;gap:10px">
      ${hlCredit(w, !o.under)}
      ${o.under && w.hook ? `<p style="${BASK};font-size:${w.hook.length > 90 ? 30 : 34}px;line-height:1.36;color:${HL.burg};margin-top:10px">${mark(esc(w.hook))}</p>` : ''}</div>`}; },
  // The artist, on the next slide: the same highlighted paragraph as the editorial carousel
  about(o){ const w = o.w; return {bg: HL.white, html: `${hlBrand(HL.burg)}
    <div class="a" style="left:72px;right:72px;top:210px;bottom:300px">
      <p style="${BASK};font-size:${o.sz}px;line-height:1.3;color:${HL.burg}">${w.hook ? mark(esc(w.hook)) + ' ' : ''}${esc(w.about || '')}${w.line ? ' ' + esc(w.line) : ''}</p></div>
    <p class="a" style="left:72px;right:72px;top:1130px;${T_MED};font-size:34px;letter-spacing:-.01em;color:${HL.burg}">${esc(w.artist)}${w.handle ? ` <span style="${T_REG}">${esc(w.handle)}</span>` : ''}</p>`}; },
  // The question: all five side by side, so people answer in the comments and save the post
  pick(o){ const n = o.works.length, top = o.works.slice(0, 3), bot = o.works.slice(3, 6);
    const cell = (w, i) => `<div style="width:290px;display:flex;flex-direction:column;gap:10px;align-items:center">
        <div style="width:290px;height:${bot.length ? 300 : 420}px;background:${o.imgs[i] ? `url(${o.imgs[i]}) center/contain no-repeat` : '#F4EEEA'}"></div>
        <p style="${T_MED};font-size:22px;line-height:1.25;color:${HL.ink};text-align:center">${esc(w.handle || w.artist || '')}</p></div>`;
    return {bg: HL.white, html: `${hlBrand()}
      <p class="a" style="left:72px;right:72px;top:130px;${BASK};font-size:62px;line-height:1.24;color:${HL.ink}">Which one would you ${mark('take home?')}</p>
      <div class="a" style="left:72px;right:72px;top:${bot.length ? 340 : 400}px;display:flex;flex-direction:column;gap:34px">
        <div style="display:flex;justify-content:${top.length < 3 ? 'center' : 'space-between'};gap:33px">${top.map((w, i) => cell(w, i)).join('')}</div>
        ${bot.length ? `<div style="display:flex;justify-content:center;gap:33px">${bot.map((w, i) => cell(w, i + 3)).join('')}</div>` : ''}</div>
      <p class="a" style="left:72px;right:72px;top:1150px;${T_REG};font-size:32px;line-height:1.38;color:${HL.burg}">Tell us in the comments, then give ${n > 1 ? 'them' : 'the artist'} a follow. ${n > 1 ? HL_NUM[n] || n : 'One'} more ${n > 1 ? 'artists' : 'artist'} next week.</p>`}; },
  // End card: the invitation to artists (the lead), the open call if there is one
  end(o){ return {bg: HL.burg, html: `${ivMono('peony', 'left:430px;width:220px;top:150px;height:124px')}
    <div class="a" style="left:72px;right:72px;top:330px;bottom:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <p style="${BASK};font-size:48px;line-height:1.28;color:${HL.white}">${esc(o.head)}</p>
      <p style="${T_MED};font-size:${o.key.length > 8 ? 120 : 150}px;line-height:1;letter-spacing:-.04em;color:${HL.rose};margin-top:48px;display:flex;align-items:center">${arrowDot(HL.rose, HL.burg, 112)}${esc(o.key)}</p>
      <p style="${T_REG};font-size:34px;line-height:1.38;color:${HL.pink};margin-top:40px">${esc(o.offer)}</p>
      <div style="width:240px;border-top:2px solid rgba(250,210,225,.35);margin:52px 0 38px"></div>
      <p style="${T_REG};font-size:30px;line-height:1.4;color:${HL.pink}">Want your work on next week’s list?<br>${esc(o.call || 'Apply through the link in bio.')}</p></div>
    <p class="a c" style="left:0;right:0;bottom:96px;${T_REG};font-size:28px;color:${HL.pink}">artstoheartsproject.com</p>`}; },
  // Single post for a later week: one work, whole, "on our Heart List"
  single(o){ const w = o.w; return {bg: HL.white, html: `${hlBrand()}${ivMono('burgundy', 'right:52px;top:40px;width:96px;height:54px')}
    ${ivArt(o.img, 'left:72px;right:72px;top:130px;height:870px', o.slot)}
    <div class="a" style="left:72px;right:72px;top:1030px;display:flex;flex-direction:column;gap:10px">${hlCredit(w, false)}
      <p style="${T_MED};font-size:28px;color:${HL.burg};margin-top:10px">On our Heart List &rarr;</p></div>`}; },
};

// ---------- the form ----------
DCAT.heartlist = {name: 'The Heart List', marker: '//HEARTLIST', key: 'HEART', pack: true, groups: [
  ['Cover', [
    {k: 'cover', label: 'Cover', type: 'select', options: [['image', 'The first artwork, full bleed'], ['solid', 'Solid Maroon']]},
    {k: 'serif', label: 'Serif line (small, above)', type: 'text', ph: 'Your next'},
    {k: 'big', label: 'Big line', type: 'text', ph: 'Favourite artist'},
    {k: 'under', label: 'Line under it', type: 'text', ph: 'Is one swipe away'}]],
  ['The list', [
    {k: 'layout', label: 'About each artist', type: 'select', options: [['pair', 'On its own slide after the artwork'], ['under', 'Under the artwork, smaller']]},
    {k: 'works', label: 'The works, one per line: title | artist | @handle | closing line | what the work does | one line about the artist', type: 'lines'},
    {k: 'arts', label: 'Artworks, in the same order as the list (never cropped, except the full-bleed cover)', type: 'imgs'}]],
  ['The end card', [
    {k: 'key', label: 'Comment keyword (its DM sends the full Heart List article)', type: 'text', ph: 'HEART'},
    {k: 'ctahead', label: 'Line above the keyword', type: 'text', ph: 'Read more about every artist and their work on our website.'},
    {k: 'offer', label: 'Line under the keyword', type: 'text', ph: 'Comment the word and we’ll send you the full Heart List.'},
    {k: 'call', label: 'For artists: the open call line (from the article)', type: 'text', ph: 'The Artist of the Year Award 2026 is open until November 15.'}]],
  ['Caption', [
    {k: 'hook', label: 'Caption first line', type: 'text'},
    {k: 'url', label: 'Article link', type: 'text'},
    {k: 'tags', label: 'Hashtags (up to 5 in total)', type: 'text', ph: '#contemporarypainting #artistsoninstagram'}]],
]};
DCAT.heartlist.fields = DCAT.heartlist.groups.flatMap(g => g[1]);

// ---------- read a Heart List article ----------
// Headings look like "1. Peace Offering by Denis D’Alesio @denisdalesio". Each section ends with a line like "Follow him. His paintings feel like bedtime stories for grown-ups."
const HL_HEAD = /^\s*(\d{1,2})\s*[.)]\s*(.+?)\s+by\s+(.+?)(?:\s+(@[\w.]+))?\s*$/i;
const HL_GO = /^(Follow (him|her|them)|Give (him|her|them) a follow|Go (find|follow|see|spend|look)\b|Find (him|her|them)\b|Stay a while|Check out)/i;
function parseHeartList(raw, images, title){
  const lines = String(raw || '').replace(/\r/g, '').split('\n').map(l => l.replace(/\s+/g, ' ').trim());
  // join a heading whose @handle wrapped onto the next line
  for (let i = 0; i < lines.length - 1; i++) if (HL_HEAD.test(lines[i]) && !/@[\w.]+\s*$/.test(lines[i]) && /^@[\w.]+$/.test(lines[i + 1])) { lines[i] += ' ' + lines[i + 1]; lines[i + 1] = ''; }
  const paras = []; let buf = [];
  const flush = () => { if (buf.length) paras.push(buf.join(' ').trim()); buf = []; };
  lines.forEach(l => { if (!l) return flush(); if (HL_HEAD.test(l) && l.length < 160) { flush(); paras.push(l); flush(); } else buf.push(l); }); flush();
  const works = []; const intro = []; let cur = null; const outro = [];
  for (const p of paras) { const m = p.match(HL_HEAD);
    if (m && p.length < 160) { cur = {n: +m[1], title: m[2].replace(/^[“"']|[”"']$/g, '').trim(), artist: m[3].trim(), handle: m[4] || '', body: [], close: ''}; works.push(cur); continue; }
    if (!cur) { intro.push(p); continue; }
    if (cur.close) { outro.push(p); continue; }
    const isCap = p.length < 160 && cur.handle && p.includes(cur.handle) && / by /.test(p); if (isCap) continue;
    if (HL_GO.test(p) || /^(His|Her|Their) (page|whole page|work|paintings?)\b/.test(p) && cur.body.length) { cur.close = p; continue; }
    cur.body.push(p); }
  const sent = t => (String(t).match(/[^.!?]+[.!?]+["”’]?/g) || [String(t)]).map(s => s.trim()).filter(Boolean);
  works.forEach(w => {
    const rest = sent(w.close).filter(s => !HL_GO.test(s)).join(' ');
    let line = rest;
    if (!line && w.body[0]) { const first = sent(w.body[0])[0] || ''; const m = first.match(/,\s*and\s+(it\s+.+)$/i); line = m ? m[1].charAt(0).toUpperCase() + m[1].slice(1) : ''; }
    w.line = line.replace(/,?\s+so (go|do) .+$/i, '.').replace(/\s+/g, ' ').trim();
    if (!w.handle) { const h = w.body.join(' ').match(/@[\w.]{3,}/); if (h) w.handle = h[0]; }
    // what the work does: "…, and it feels like a fairytale" → "Peace Offering feels like a fairytale"
    const ss = sent(w.body[0] || ''); let hook = '';
    const m1 = (ss[0] || '').match(/,\s*and\s+it\s+(.+)$/i);
    if (m1) hook = `${w.title} ${m1[1]}`; else if (/^It\s/.test(ss[1] || '')) hook = ss[1].replace(/^It\s/, w.title + ' '); else hook = ss[1] || ss[0] || '';
    w.hook = hook.replace(/\s+/g, ' ').trim();
    // who the artist is: the sentence that starts with their first name
    const first = (w.artist.split(/\s+/)[0] || '').replace(/[^\p{L}’'-]/gu, '');
    const ab = w.body.flatMap(sent).find(x => first && new RegExp('^' + first + '\\s+(is|was|works|paints|lives|blends)\\b').test(x)) || '';
    w.about = ab.replace(/\s+/g, ' ').trim(); });
  // the open call the article plugs at the end
  const all = paras.join('\n');
  const cp = paras.find(p => /(award|open call|prize|residency)/i.test(p) && /(open|until|deadline|closes|apply)/i.test(p) && p.length < 900) || '';
  const callName = (cp.match(/((?:The\s+)?[A-Z][\w’'&]*(?:\s+(?:of|the|for|and|in|[A-Z0-9][\w’'&]*)){0,7}\s+(?:Award|Prize|Open Call|Residency)(?:\s+\d{4})?)/) || [])[1] || '';
  const until = (cp.match(/(?:until|by|before|deadline:?|closes(?: on)?)\s+((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2})/i) || [])[1] || '';
  const call = callName ? `${/^The /.test(callName) ? '' : 'The '}${callName.trim()} is open${until ? ' until ' + until : ' now'}.` : '';
  // pictures: each work gets the image whose caption names it; otherwise the next unused one in order
  const used = new Set(); const fold = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9@]/g, '');
  const imgs = (images || []).filter(im => im && im.url && !(im.w && im.h && im.w / im.h > 2.4));
  works.forEach(w => { const keys = [w.handle, w.artist, w.title].map(fold).filter(k => k.length > 3);
    let k = imgs.findIndex((im, i) => !used.has(i) && keys.some(x => fold(im.cap + ' ' + im.alt).includes(x)));
    if (k >= 0) { used.add(k); w.img = imgs[k].url; } });
  works.forEach(w => { if (w.img) return; const k = imgs.findIndex((im, i) => !used.has(i) && !im.cap); if (k >= 0) { used.add(k); w.img = imgs[k].url; } });
  return {title: String(title || '').trim(), works, intro, outro, call, hasText: all.length > 0};
}
function heartlistFields(h){
  return {cover: 'image', serif: 'Your next', big: 'Favourite artist', under: 'Is one swipe away', layout: 'pair',
    works: h.works.map(w => [w.title, w.artist, w.handle, w.line, w.hook, w.about].join(' | ')).join('\n'),
    key: 'HEART', ctahead: 'Read more about every artist and their work on our website.', offer: 'Comment the word and we’ll send you the full Heart List.', call: h.call, hook: '', tags: ''};
}

// ---------- the package ----------
DPACK.heartlist = p => {
  const f = p.f || {}, arts = [].concat((p.imgs || {}).arts || []);
  const works = dLines(f.works).map(x => ({title: x[0] || '', artist: x[1] || '', handle: (x[2] || '').trim(), line: (x[3] || '').trim(), hook: (x[4] || '').trim(), about: (x[5] || '').trim()})).filter(w => w.title || w.artist);
  const key = (f.key || 'HEART').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'HEART';
  const n = works.length, sub = `${HL_NUM[n] || n} ${n === 1 ? 'artist' : 'artists'} we couldn’t stop looking at this week.`;
  const head = f.ctahead || 'Read more about every artist and their work on our website.', offer = f.offer || 'Comment the word and we’ll send you the full Heart List.';
  const under = f.layout === 'under';
  const longest = Math.max(0, ...works.map(w => (w.hook + ' ' + w.about + ' ' + w.line).length));
  const sz = longest > 320 ? 46 : longest > 240 ? 52 : 58;
  const S = [
    HLT.cover({solid: f.cover === 'solid', img: arts[0] || '', serif: f.serif === undefined ? 'Your next' : f.serif, big: f.big || 'Favourite artist', under: f.under === undefined ? 'Is one swipe away' : f.under}),
    ...works.flatMap((w, i) => [HLT.work({w, img: arts[i] || '', slot: 'arts' + i, under}), ...(!under && (w.hook || w.about || w.line) ? [HLT.about({w, sz})] : [])]),
    ...(n > 1 ? [HLT.pick({works, imgs: arts})] : []),
    HLT.end({head, key, offer, call: f.call || ''}),
  ];
  const tags = ['#artstoheartsproject', '#heartlist', ...String(f.tags || '').split(/\s+/).filter(x => x.startsWith('#'))].slice(0, 5).join(' ');
  const handles = works.map(w => w.handle).filter(Boolean);
  const cap = `${f.hook || `The Heart List: ${sub.charAt(0).toLowerCase() + sub.slice(1)}`}\n\n${works.map(w => `${w.title} by ${w.artist}${w.handle ? ' ' + w.handle : ''}${w.hook ? '\n' + w.hook : w.line ? '\n' + w.line : ''}`).join('\n\n')}\n\nWhich one would you take home? Tell us below, then go give ${n > 1 ? 'them' : 'the artist'} a follow. Thirty seconds from you can carry an artist through a week of doubt.\n\nComment ${key} and we'll send you the full Heart List, with more about every artist and their work. Or read it through the link in bio.\n\nWant your work on next week's list? ${f.call || 'Apply through the link in bio.'}\n\n${tags}`.replace(/\n{3,}/g, '\n\n');
  const SINGLES = works.map((w, i) => ({...HLT.single({w, img: arts[i] || '', slot: 'arts' + i}), label: 'Single ' + (i + 1)}));
  const ST = [
    {...IV.story({dark: true, mono: true, label: 'The Heart List', text: 'Five works we couldn’t stop looking at this week'.replace('Five', HL_NUM[n] || n), sub: 'Swipe through, then tell us your favourite.', zone: 'Link sticker: the carousel'}), label: 'Story 1'},
    ...works.map((w, i) => ({...IV.story({img: arts[i] || '', slot: 'arts' + i, label: 'The Heart List', text: esc(w.title), sub: esc(`${w.artist}${w.handle ? ' ' + w.handle : ''}`), zone: 'Mention sticker: tag the artist'}), label: 'Story ' + (i + 2)})),
    {...IV.story({dark: true, label: 'Your turn', text: 'Which one would you take home?', sub: `Comment ${esc(key)} on the post for the full Heart List.`, zone: 'Poll or quiz sticker with the artists’ names'}), label: 'Story ' + (n + 2)},
  ];
  return [
    {title: `${p.date} · Heart List carousel`, meta: `${S.length} slides · tag ${handles.length} artist${handles.length === 1 ? '' : 's'} in the image · keyword ${key}`, slides: S.map((s, j) => ({...s, title: 'heartlist-' + (j + 1)})), cap, pin: `Comment ${key} and we'll send you the full Heart List, with more about every artist.`},
    ...(SINGLES.length ? [{title: `${p.date} · Heart List singles`, meta: `${SINGLES.length} single posts for later weeks, one artist each`, slides: SINGLES.map((s, j) => ({...s, title: 'heartlist-single-' + (j + 1)})), cap: works[0] ? `${works[0].title} by ${works[0].artist}${works[0].handle ? ' ' + works[0].handle : ''}\n\n${works[0].line}\n\nOn our Heart List this week. Go give them a follow.\n\nComment ${key} and we'll send you the full Heart List.\n\n${tags}` : '', pin: ''}] : []),
    {title: `${p.date} · Heart List stories`, meta: 'Same day as the carousel · add the stickers in Instagram', slides: ST.map((s, j) => ({...s, title: 'heartlist-story-' + (j + 1)})), story: true},
  ];
};

// ---------- example: this week's list (5 Paintings on Our Heart List This Week) ----------
const HL_EXAMPLE = {cat: 'heartlist', f: {
  cover: 'image', serif: 'Your next', big: 'Favourite artist', under: 'Is one swipe away', layout: 'pair',
  works: [
    'Peace Offering | Denis D’Alesio | @denisdalesio | His paintings feel like bedtime stories for grown-ups. | Peace Offering feels like a fairytale no one has told you yet. | Denis is a painter working in a soft, surreal figurative register, building quiet mythologies one canvas at a time.',
    'Learning | Ellen Akimoto | @ellenakimoto | Her whole page sits in this same quiet space between the real and the rendered. | Learning makes you question what you are actually looking at. | Ellen is an American painter, born in California in 1988 and based in Leipzig, who blends painterly gesture with digital collage.',
    'Weave – Shared Gravity XIX | Giuseppe Scarangelli | @giuseppe.scarangelli | His entangled figures are the kind you keep coming back to. | Weave – Shared Gravity XIX is two bodies dissolving into one another in a storm of pink and blue. | Giuseppe is an Italian artist who works in mixed media, layering acrylics, oils, chalk and glue.',
    'Nothing To Wear (The Chair) II | Austin Hayman | @austinhayman | His page is full of work this hushed and this carefully seen. | A woman kneels in front of a mirror with an empty chair beside her, and nothing dramatic happens at all. | Austin is a self-taught American painter from Santa Monica, now based in Los Angeles.',
    'Windy Portrait | Karolina Jabłońska | @karolina_jab | Every painting she makes is funny, tender and a little bit brave. | Windy Portrait turns being caught out in the wind into something raw, funny and strangely vulnerable. | Karolina is a Polish painter based in Kraków, who trained at the city’s Academy of Fine Arts.'].join('\n'),
  key: 'HEART', ctahead: 'Read more about every artist and their work on our website.', offer: 'Comment the word and we’ll send you the full Heart List.',
  call: 'The Artist of the Year Award 2026 is open until November 15.', hook: '', url: 'artstoheartsproject.com/5-paintings-on-our-heart-list-this-week-6', tags: '#contemporarypainting #figurativepainting'},
  imgs: {arts: ['art/examples/heartlist/peace.jpg', 'art/examples/heartlist/learning.jpg', 'art/examples/heartlist/weave.jpg']}};
