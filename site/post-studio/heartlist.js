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
  // Cover: the first work, whole, with the series name under it
  cover(o){ return {bg: HL.white, html: `${hlBrand()}${ivMono('burgundy', 'right:52px;top:40px;width:96px;height:54px')}
    ${ivArt(o.img, 'left:72px;right:72px;top:130px;height:800px', 'arts0')}
    <div class="a" style="left:72px;right:72px;top:976px;display:flex;flex-direction:column;gap:18px">
      <p style="${T_MED};font-size:92px;line-height:1;letter-spacing:-.035em;color:${HL.ink}">The Heart List</p>
      <p style="${BASK};font-size:36px;line-height:1.34;color:${HL.ink}">${esc(o.sub)}</p></div>
    <p class="a" style="right:72px;bottom:60px;${T_MED};font-size:30px;color:${HL.burg}">Swipe to meet them &rarr;</p>`}; },
  // One work per slide: the artwork whole, the credit, one line in our voice
  work(o){ const w = o.w; return {bg: HL.white, html: `${hlBrand()}
    ${ivArt(o.img, 'left:72px;right:72px;top:120px;height:860px', o.slot)}
    <div class="a" style="left:72px;right:72px;top:1010px;bottom:56px;display:flex;flex-direction:column;gap:10px">
      ${hlCredit(w, true)}
      ${w.line ? `<p style="${BASK};font-size:${w.line.length > 90 ? 28 : 31}px;line-height:1.36;color:${HL.soft};margin-top:6px">${esc(w.line)}</p>` : ''}</div>`}; },
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
      ${o.call ? `<div style="width:240px;border-top:2px solid rgba(250,210,225,.35);margin:52px 0 38px"></div>
      <p style="${T_REG};font-size:30px;line-height:1.4;color:${HL.pink}">${esc(o.call)}</p>` : ''}</div>
    <p class="a c" style="left:0;right:0;bottom:96px;${T_REG};font-size:28px;color:${HL.pink}">artstoheartsproject.com</p>`}; },
  // Single post for a later week: one work, whole, "on our Heart List"
  single(o){ const w = o.w; return {bg: HL.white, html: `${hlBrand()}${ivMono('burgundy', 'right:52px;top:40px;width:96px;height:54px')}
    ${ivArt(o.img, 'left:72px;right:72px;top:130px;height:870px', o.slot)}
    <div class="a" style="left:72px;right:72px;top:1030px;display:flex;flex-direction:column;gap:10px">${hlCredit(w, false)}
      <p style="${T_MED};font-size:28px;color:${HL.burg};margin-top:10px">On our Heart List &rarr;</p></div>`}; },
};

// ---------- the form ----------
DCAT.heartlist = {name: 'The Heart List', marker: '//HEARTLIST', key: 'FEATURE', pack: true, groups: [
  ['The list', [
    {k: 'sub', label: 'Cover line under “The Heart List”', type: 'text', ph: 'Five paintings we couldn’t stop looking at this week.'},
    {k: 'works', label: 'The works, one per line: title | artist | @handle | one line about it', type: 'lines'},
    {k: 'arts', label: 'Artworks, in the same order as the list (never cropped)', type: 'imgs'}]],
  ['For artists (the end card)', [
    {k: 'key', label: 'Comment keyword (its DM sends how to get featured and the open call link)', type: 'text', ph: 'FEATURE'},
    {k: 'ctahead', label: 'End card: line above the keyword', type: 'text', ph: 'Want your work on next week’s list?'},
    {k: 'offer', label: 'End card: line under the keyword', type: 'text', ph: 'Comment the word and we’ll send you how to get featured.'},
    {k: 'call', label: 'Open call line (from the article, leave empty if none)', type: 'text', ph: 'The Artist of the Year Award 2026 is open until November 15.'}]],
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
    if (!w.handle) { const h = w.body.join(' ').match(/@[\w.]{3,}/); if (h) w.handle = h[0]; } });
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
  const n = h.works.length;
  return {sub: `${HL_NUM[n] || n} ${/painting/i.test(h.title) ? (n === 1 ? 'painting' : 'paintings') : (n === 1 ? 'artist' : 'artists')} we couldn’t stop looking at this week.`,
    works: h.works.map(w => [w.title, w.artist, w.handle, w.line].join(' | ')).join('\n'),
    key: 'FEATURE', ctahead: 'Want your work on next week’s list?', offer: 'Comment the word and we’ll send you how to get featured.', call: h.call, hook: '', tags: ''};
}

// ---------- the package ----------
DPACK.heartlist = p => {
  const f = p.f || {}, arts = [].concat((p.imgs || {}).arts || []);
  const works = dLines(f.works).map(x => ({title: x[0] || '', artist: x[1] || '', handle: (x[2] || '').trim(), line: x.slice(3).join(' | ').trim()})).filter(w => w.title || w.artist);
  const key = (f.key || 'FEATURE').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'FEATURE';
  const n = works.length, sub = f.sub || `${HL_NUM[n] || n} works we couldn’t stop looking at this week.`;
  const head = f.ctahead || 'Want your work on next week’s list?', offer = f.offer || 'Comment the word and we’ll send you how to get featured.';
  const S = [
    HLT.cover({sub, img: arts[0] || ''}),
    ...works.map((w, i) => HLT.work({w, img: arts[i] || '', slot: 'arts' + i})),
    ...(n > 1 ? [HLT.pick({works, imgs: arts})] : []),
    HLT.end({head, key, offer, call: f.call || ''}),
  ];
  const tags = ['#artstoheartsproject', '#heartlist', ...String(f.tags || '').split(/\s+/).filter(x => x.startsWith('#'))].slice(0, 5).join(' ');
  const handles = works.map(w => w.handle).filter(Boolean);
  const cap = `${f.hook || `The Heart List: ${sub.charAt(0).toLowerCase() + sub.slice(1)}`}\n\n${works.map(w => `${w.title} by ${w.artist}${w.handle ? ' ' + w.handle : ''}${w.line ? '\n' + w.line : ''}`).join('\n\n')}\n\nWhich one would you take home? Tell us below, then go give ${n > 1 ? 'them' : 'the artist'} a follow. Thirty seconds from you can carry an artist through a week of doubt.\n\nWant your work on next week's list? Comment ${key} and we'll send you how.${f.call ? ' ' + f.call : ''}\n\nThe full Heart List is on our website, link in bio.\n\n${tags}`.replace(/\n{3,}/g, '\n\n');
  const SINGLES = works.map((w, i) => ({...HLT.single({w, img: arts[i] || '', slot: 'arts' + i}), label: 'Single ' + (i + 1)}));
  const ST = [
    {...IV.story({dark: true, mono: true, label: 'The Heart List', text: 'Five works we couldn’t stop looking at this week'.replace('Five', HL_NUM[n] || n), sub: 'Swipe through, then tell us your favourite.', zone: 'Link sticker: the carousel'}), label: 'Story 1'},
    ...works.map((w, i) => ({...IV.story({img: arts[i] || '', slot: 'arts' + i, label: 'The Heart List', text: esc(w.title), sub: esc(`${w.artist}${w.handle ? ' ' + w.handle : ''}`), zone: 'Mention sticker: tag the artist'}), label: 'Story ' + (i + 2)})),
    {...IV.story({dark: true, label: 'Your turn', text: 'Which one would you take home?', sub: `Want your work on next week’s list? Comment ${esc(key)} on the post.`, zone: 'Poll or quiz sticker with the artists’ names'}), label: 'Story ' + (n + 2)},
  ];
  return [
    {title: `${p.date} · Heart List carousel`, meta: `${S.length} slides · tag ${handles.length} artist${handles.length === 1 ? '' : 's'} in the image · keyword ${key}`, slides: S.map((s, j) => ({...s, title: 'heartlist-' + (j + 1)})), cap, pin: `Want your work on next week's list? Comment ${key} and we'll send you how.`},
    ...(SINGLES.length ? [{title: `${p.date} · Heart List singles`, meta: `${SINGLES.length} single posts for later weeks, one artist each`, slides: SINGLES.map((s, j) => ({...s, title: 'heartlist-single-' + (j + 1)})), cap: works[0] ? `${works[0].title} by ${works[0].artist}${works[0].handle ? ' ' + works[0].handle : ''}\n\n${works[0].line}\n\nOn our Heart List this week. Go give ${'them'} a follow.\n\nWant your work on next week's list? Comment ${key} and we'll send you how.\n\n${tags}` : '', pin: ''}] : []),
    {title: `${p.date} · Heart List stories`, meta: 'Same day as the carousel · add the stickers in Instagram', slides: ST.map((s, j) => ({...s, title: 'heartlist-story-' + (j + 1)})), story: true},
  ];
};

// ---------- example: this week's list (5 Paintings on Our Heart List This Week) ----------
const HL_EXAMPLE = {cat: 'heartlist', f: {
  sub: 'Five paintings we couldn’t stop looking at this week.',
  works: 'Peace Offering | Denis D’Alesio | @denisdalesio | His paintings feel like bedtime stories for grown-ups.\nLearning | Ellen Akimoto | @ellenakimoto | Her whole page sits in this same quiet space between the real and the rendered.\nWeave – Shared Gravity XIX | Giuseppe Scarangelli | @giuseppe.scarangelli | His entangled figures are the kind you keep coming back to.\nNothing To Wear (The Chair) II | Austin Hayman | @austinhayman | His page is full of work this hushed and this carefully seen.\nWindy Portrait | Karolina Jabłońska | @karolina_jab | Every painting she makes is funny, tender and a little bit brave.',
  key: 'FEATURE', ctahead: 'Want your work on next week’s list?', offer: 'Comment the word and we’ll send you how to get featured.',
  call: 'The Artist of the Year Award 2026 is open until November 15.', hook: '', url: 'artstoheartsproject.com/5-paintings-on-our-heart-list-this-week-6', tags: '#contemporarypainting #figurativepainting'},
  imgs: {arts: ['art/examples/heartlist/peace.jpg', 'art/examples/heartlist/learning.jpg', 'art/examples/heartlist/weave.jpg']}};
