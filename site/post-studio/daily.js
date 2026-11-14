/* ATH Post Studio · DAILY POSTS for the main @artstoheartsproject account.
   Built from 61 days of real posts (15 Sep to 14 Nov 2026): 13 recurring formats, each a template.
   Fill a short form; the slides (1080 x 1350) and the caption come out in the house structure. */

// ---------- weekly schedule (IST first; PT in brackets) ----------
const SLOTS = [
  {id:'s1', ist:'12:30', pt:'23:00 PT, day before', note:'Lead slot: today’s first post'},
  {id:'s2', ist:'15:30', pt:'02:00 PT', note:'Reach slot: profiles and community'},
  {id:'s3', ist:'18:30', pt:'05:00 PT', note:'Books and products'},
  {id:'s4', ist:'23:30', pt:'10:00 PT', note:'Open calls and news'},
  {id:'s5', ist:'07:30', pt:'18:00 PT, next day', note:'New: US evening slot (currently empty)'},
];
const WEEK_PLAN = { // Mon..Sun → category per slot
  1: {s1:'interview', s2:'profile', s3:'book', s4:'opencall', s5:'reel'},
  2: {s1:'interview', s2:'community', s3:'guide', s4:'opencall', s5:'reel'},
  3: {s1:'interview', s2:'profile', s3:'book', s4:'opencall', s5:'reel'},
  4: {s1:'interview', s2:'editorial', s3:'book', s4:'news', s5:'reel'},
  5: {s1:'guide', s2:'quote', s3:'book', s4:'opencall', s5:'reel'},
  6: {s1:'history', s2:'prompt', s3:'book', s4:'opencall', s5:'reel'},
  0: {s1:'heartlist', s2:'quote', s5:'reel'},
};

// ---------- the 13 formats ----------
// field types: text · area · img · imgs (several) · lines ("a | b | c" one per line)
const DCAT = {
  interview: {name:'Artist interview', marker:'//INTERVIEW', key:'INTERVIEW', ground:'ink', fields:[
    {k:'name', label:'Artist name', type:'text'}, {k:'handle', label:'Instagram handle', type:'text', ph:'@handle'},
    {k:'meta', label:'Based in · medium', type:'text', ph:'San Francisco · acrylic on canvas'},
    {k:'bio', label:'Bio (3 to 4 lines)', type:'area'}, {k:'feature', label:'Featured in', type:'text', ph:'Best of the Art World'},
    {k:'q', label:'Question', type:'area'}, {k:'a', label:'Answer', type:'area'},
    {k:'cover', label:'Cover artwork', type:'img'}, {k:'works', label:'More artworks (up to 4)', type:'imgs'}, {k:'portrait', label:'Portrait (optional)', type:'img'}]},
  profile: {name:'Famous-figure profile', marker:'', key:'NEWSLETTER', ground:'cream', fields:[
    {k:'name', label:'Name', type:'text', ph:'Maya Angelou'}, {k:'years', label:'Years · role', type:'text', ph:'1928 to 2014 · poet and memoirist'},
    {k:'bio', label:'Short bio (2 to 3 lines)', type:'area'}, {k:'lessons', label:'Lessons for artists: Title | text', type:'lines'},
    {k:'quote', label:'Their quote', type:'area'}, {k:'cover', label:'Portrait or image (check rights)', type:'img'}]},
  community: {name:'Community / newsletter', marker:'', key:'NEWSLETTER', ground:'call', fields:[
    {k:'title', label:'Headline', type:'text', ph:'Launching artists to the world'}, {k:'points', label:'What members get: Title | text', type:'lines'},
    {k:'cover', label:'Cover image', type:'img'}]},
  book: {name:'Book: meet the featured artists', marker:'', key:'SHOP', ground:'cream', fields:[
    {k:'book', label:'Book name', type:'text', ph:'101 Art Book: Colors'}, {k:'line', label:'One line about the book', type:'text', ph:'101 artists. One hardcover book.'},
    {k:'artists', label:'Artists: Name | @handle | country', type:'lines'}, {k:'cover', label:'Book photo', type:'img'}, {k:'works', label:'Artist works, in the same order', type:'imgs'},
    {k:'key', label:'Comment keyword', type:'text', ph:'COLORS'}]},
  guide: {name:'Guide / collecting / business', marker:'//GUIDE', key:'FINDMORE', ground:'cream', fields:[
    {k:'series', label:'Series', type:'text', ph:'GUIDE · THE ART OF COLLECTING · THE ART BUSINESS'}, {k:'title', label:'Title', type:'text'},
    {k:'myth', label:'Myth (what everyone thinks)', type:'text'}, {k:'truth', label:'The truth', type:'text'},
    {k:'points', label:'Points: Title | text', type:'lines'}, {k:'cover', label:'Cover image (optional)', type:'img'}]},
  editorial: {name:'Editorial', marker:'//EDITORIAL', key:'FINDMORE', ground:'ink', fields:[
    {k:'title', label:'Title', type:'text'}, {k:'dek', label:'Standfirst (one line)', type:'text'},
    {k:'points', label:'Sections: Title | text', type:'lines'}, {k:'cover', label:'Cover image', type:'img'}]},
  heartlist: {name:'Heartlist (weekly)', marker:'//HEARTLIST', key:'FINDMORE', ground:'peony', fields:[
    {k:'title', label:'Title', type:'text', ph:'5 artists we can’t stop looking at'}, {k:'artists', label:'Artists: Name | @handle | one line', type:'lines'},
    {k:'works', label:'Their works, in the same order', type:'imgs'}]},
  history: {name:'Art history', marker:'//ART HISTORY', key:'FINDMORE', ground:'ink', fields:[
    {k:'title', label:'Title', type:'text'}, {k:'era', label:'Artist · year', type:'text'},
    {k:'facts', label:'Facts: Title | text', type:'lines'}, {k:'cover', label:'Artwork image', type:'img'}]},
  news: {name:'Art news', marker:'//ART NEWS', key:'FINDMORE', ground:'cream', fields:[
    {k:'title', label:'Title', type:'text', ph:'This week in art'}, {k:'items', label:'Stories: Headline | one line | source', type:'lines'}, {k:'cover', label:'Cover image (optional)', type:'img'}]},
  quote: {name:'Quote / advice', marker:'', key:'', ground:'cream', fields:[
    {k:'quote', label:'Quote', type:'area'}, {k:'author', label:'Author', type:'text'}, {k:'credit', label:'Shared via (handle, if reposting)', type:'text'}]},
  prompt: {name:'Engagement prompt', marker:'', key:'', ground:'peony', fields:[
    {k:'title', label:'Prompt', type:'text', ph:'Drop a “hi” if you’re an emerging artist'}, {k:'sub', label:'Second line', type:'text'}]},
  opencall: {name:'Open call', marker:'//OPEN CALL', link:'feed', fields:[]},
  reel: {name:'Featured-artist reel', marker:'//FEATURED ARTIST', link:'reels', fields:[]},
};

// ---------- slide builders (brand palette; one look per series, same frame) ----------
const DG = {
  ink: {bg:INK, fg:WHITE, acc:PEONY}, cream: {bg:CREAM, fg:INK, acc:BURG}, call: {bg:BURG, fg:WHITE, acc:PEONY}, peony: {bg:PEONY, fg:INK, acc:BURG},
};
const dLines = s => String(s || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => l.split('|').map(x => x.trim()));
const dImg = (src, style, slot) => src ? `<div class="a img" data-slot="${slot}" style="${style};background-image:url(${src});background-position:center"></div>` : `<div class="a ph" data-slot="${slot}" style="${style}">Add image in the form</div>`;
const dFrame = (g, label, last) => `<p class="a cn" style="left:56px;top:52px;color:${g.fg}">Arts to Hearts Project</p><p class="a cn" style="right:56px;top:52px;color:${g.acc}">${esc(label || '')}</p>
  <p class="a cn" style="left:56px;bottom:52px;color:${g.fg};opacity:.8">@artstoheartsproject</p><p class="a cn" style="right:56px;bottom:52px;color:${g.fg};opacity:.8">${last ? 'Link in bio' : 'Swipe &rarr;'}</p>`;
const dShade = `<div class="a" style="inset:0;background:linear-gradient(180deg,rgba(20,9,12,.5) 0%,rgba(20,9,12,0) 22%,rgba(20,9,12,0) 50%,rgba(20,9,12,.82) 80%,rgba(20,9,12,.92) 100%)"></div>`;
const D = {
  cover(p, o){ const g = DG[o.ground || 'ink']; const img = o.img;
    if (img) return {bg:INK, html:`${dImg(img, 'inset:0', o.slot || 'cover')}${dShade}${dFrame(DG.ink, o.label)}
      ${o.tag ? `<p class="a" style="left:80px;top:${o.top || 900}px;display:inline-block;background:${PEONY};color:${INK};font-weight:800;font-size:24px;letter-spacing:.16em;padding:10px 18px;border-radius:999px">${esc(o.tag)}</p>` : ''}
      <p class="a H" style="left:76px;right:80px;top:${(o.top || 900) + 70}px;font-size:${o.size || 92}px;color:${WHITE}">${o.title}</p>
      ${o.sub ? `<p class="a sub" style="left:80px;right:100px;top:${(o.top || 900) + 70 + (o.size || 92) * 1.15 * (o.lines || 1) + 24}px;font-size:32px;color:${WHITE};opacity:.9">${o.sub}</p>` : ''}`};
    return {bg:g.bg, html:`${dFrame(g, o.label)}${o.tag ? `<p class="a" style="left:80px;top:360px;display:inline-block;background:${g.acc};color:${g.bg};font-weight:800;font-size:24px;letter-spacing:.16em;padding:10px 18px;border-radius:999px">${esc(o.tag)}</p>` : ''}
      <p class="a H" style="left:76px;right:80px;top:440px;font-size:${o.size || 110}px;color:${g.fg}">${o.title}</p>${o.sub ? `<p class="a sub" style="left:80px;right:120px;top:${o.subTop || 900}px;font-size:36px;color:${g.fg};opacity:.85">${o.sub}</p>` : ''}`}; },
  text(o){ const g = DG[o.ground || 'cream'];
    return {bg:g.bg, html:`${dFrame(g, o.label)}${o.kicker ? `<p class="a lab" style="left:80px;top:220px;color:${g.acc}">${esc(o.kicker)}</p>` : ''}
      <p class="a H" style="left:76px;right:80px;top:270px;font-size:${o.size || 76}px;color:${g.fg}">${o.title}</p>
      <p class="a sub" style="left:80px;right:100px;top:${o.bodyTop || 600}px;font-size:${o.bodySize || 38}px;line-height:1.45;color:${g.fg};opacity:.9">${o.body}</p>`}; },
  point(o){ const g = DG[o.ground || 'ink'];
    return {bg:g.bg, html:`${dFrame(g, o.label)}<p class="a" style="left:76px;top:200px;font-size:220px;font-weight:300;letter-spacing:-.04em;line-height:1;color:${g.acc}">${o.n}</p>
      <p class="a H" style="left:76px;right:80px;top:500px;font-size:${o.size || 80}px;color:${g.fg}">${o.title}</p>
      <p class="a sub" style="left:80px;right:100px;top:${o.bodyTop || 800}px;font-size:38px;line-height:1.45;color:${g.fg};opacity:.88">${o.body}</p>`}; },
  quote(o){ const g = DG[o.ground || 'cream'];
    return {bg:g.bg, html:`${dFrame(g, o.label, o.last)}<p class="a ser" style="left:80px;top:160px;font-size:260px;line-height:1;color:${g.acc}">“</p>
      <p class="a ser" style="left:80px;right:80px;top:420px;font-size:${o.size || 72}px;line-height:1.18;color:${g.fg}">${o.text}</p>
      <p class="a" style="left:80px;right:80px;top:${o.byTop || 1080}px;font-size:34px;font-weight:600;color:${g.fg}">${o.by}</p>${o.credit ? `<p class="a" style="left:80px;top:${(o.byTop || 1080) + 52}px;font-size:26px;opacity:.65;color:${g.fg}">${o.credit}</p>` : ''}`}; },
  item(o){ const g = DG[o.ground || 'cream'];
    return {bg:g.bg, html:`${dFrame(g, o.label)}${dImg(o.img, 'left:80px;right:80px;top:150px;height:820px;border-radius:14px', o.slot)}
      <p class="a" style="left:80px;top:1010px;font-size:26px;font-weight:700;letter-spacing:.12em;color:${g.acc}">${o.n || ''}</p>
      <p class="a" style="left:80px;right:80px;top:1050px;font-size:52px;font-weight:600;letter-spacing:-.01em;color:${g.fg}">${o.title}</p>
      <p class="a" style="left:80px;right:80px;top:1124px;font-size:30px;opacity:.75;color:${g.fg}">${o.sub || ''}</p>`}; },
  grid(o){ const g = DG[o.ground || 'ink']; const imgs = (o.imgs || []).slice(0, 4); const n = Math.max(1, imgs.length);
    const cells = imgs.map((src, i) => { const two = n > 1; const col = two ? i % 2 : 0, row = n > 2 ? Math.floor(i / 2) : 0; const w = two && !(n === 3 && i === 2) ? 450 : 920, h = n > 2 ? 470 : 960;
      return dImg(src, `left:${80 + col * 470}px;top:${170 + row * 490}px;width:${w}px;height:${h}px;border-radius:12px`, o.slot + i); }).join('');
    return {bg:g.bg, html:`${dFrame(g, o.label)}${cells}${o.caption ? `<p class="a" style="left:80px;right:80px;top:1170px;font-size:30px;color:${g.fg};opacity:.8">${o.caption}</p>` : ''}`}; },
  cta(o){ const g = DG[o.ground || 'call'];
    return {bg:g.bg, html:`${dFrame(g, o.label, true)}<p class="a H c" style="left:70px;right:70px;top:420px;font-size:${o.size || 96}px;color:${g.fg}">${o.title}</p>
      ${o.key ? `<div class="a" style="left:150px;right:150px;top:760px;height:120px;border-radius:999px;background:${g.fg};color:${g.bg};display:flex;align-items:center;justify-content:center;font-size:44px;font-weight:700">Comment “${esc(o.key)}”</div>` : ''}
      <p class="a c" style="left:0;right:0;top:${o.key ? 930 : 780}px;font-size:34px;color:${g.fg};opacity:.9">${o.sub || 'Link in bio · artstoheartsproject.com'}</p>`}; },
};

// ---------- per-format slides and captions ----------
const fv = (p, k) => (p.f || {})[k] || '';
const fi = (p, k) => (p.imgs || {})[k] || '';
const fis = (p, k) => [].concat((p.imgs || {})[k] || []);
const ph = (v, label) => v ? esc(v) : `<span class="gap">${esc(label)}</span>`;
const firstSentence = s => (String(s || '').match(/^.*?[.!?](\s|$)/) || [String(s || '')])[0].trim();
const DSLIDES = {
  interview: p => { const works = fis(p, 'works'); const q = fv(p, 'q'), a = fv(p, 'a');
    return [D.cover(p, {img: fi(p, 'cover'), slot:'cover', label:'Artist interview', tag:'//INTERVIEW', title: ph(fv(p, 'name'), 'Artist name'), sub: a ? '“' + esc(firstSentence(a)) + '”' : ph('', 'Pull quote comes from the answer'), size:96}),
      D.text({ground:'cream', label:'The artist', kicker: fv(p, 'meta') || 'Based in · medium', title: ph(fv(p, 'name'), 'Artist name'), body: ph(fv(p, 'bio'), 'Bio') + (fv(p, 'feature') ? `<br><br><i>Featured in ${esc(fv(p, 'feature'))}.</i>` : ''), bodyTop: 520}),
      D.quote({ground:'ink', label:'In their words', text: ph(q, 'Question'), by: '', size: q.length > 110 ? 56 : 68, byTop: 1100}),
      D.text({ground:'ink', label:'In their words', kicker:'Answer', title:'', body: ph(a, 'Answer'), bodyTop: 260, bodySize: a.length > 420 ? 34 : 40}),
      ...(works.length ? [D.grid({ground:'ink', label:'The work', imgs: works, slot:'works'})] : []),
      D.cta({ground:'call', label:'Read the full interview', title:'Read the full interview', key: fv(p, 'key') || 'INTERVIEW', sub:'On artstoheartsproject.com · link in bio'})]; },
  profile: p => { const L = dLines(fv(p, 'lessons'));
    return [D.cover(p, {img: fi(p, 'cover'), slot:'cover', label:'Artists who changed everything', title: ph(fv(p, 'name'), 'Name'), sub: ph(fv(p, 'years'), 'Years · role'), size:110}),
      D.text({ground:'cream', label:'Their story', kicker: fv(p, 'years'), title: ph(fv(p, 'name'), 'Name'), body: ph(fv(p, 'bio'), 'Short bio'), bodyTop: 560}),
      ...L.slice(0, 4).map(([t, b], i) => D.point({ground: i % 2 ? 'cream' : 'ink', label:'Lessons for artists', n: String(i + 1).padStart(2, '0'), title: esc(t || ''), body: esc(b || '')})),
      ...(fv(p, 'quote') ? [D.quote({ground:'cream', label:'In their words', text: esc(fv(p, 'quote')), by: esc(fv(p, 'name'))})] : []),
      D.cta({ground:'call', label:'Join us', title:'Stories like this, every week.', key:'NEWSLETTER', sub:'Free newsletter · link in bio'})]; },
  community: p => { const L = dLines(fv(p, 'points'));
    return [D.cover(p, {img: fi(p, 'cover'), slot:'cover', ground:'call', label:'Our community', title: ph(fv(p, 'title'), 'Headline'), size:104}),
      ...L.slice(0, 4).map(([t, b], i) => D.point({ground: i % 2 ? 'cream' : 'ink', label:'What you get', n: String(i + 1).padStart(2, '0'), title: esc(t || ''), body: esc(b || '')})),
      D.cta({ground:'call', label:'Join us', title:'Join the community.', key:'NEWSLETTER', sub:'Free newsletter · link in bio'})]; },
  book: p => { const A = dLines(fv(p, 'artists')), W = fis(p, 'works'); const key = (fv(p, 'key') || 'SHOP').toUpperCase();
    return [D.cover(p, {img: fi(p, 'cover'), slot:'cover', ground:'cream', label:'Meet the featured artists', tag:'FEATURED ARTISTS', title: ph(fv(p, 'book'), 'Book name'), sub: esc(fv(p, 'line') || ''), size:96}),
      ...A.slice(0, 8).map(([n, h, c], i) => D.item({ground: i % 2 ? 'ink' : 'cream', label: fv(p, 'book'), img: W[i], slot:'works' + i, n: 'Featured artist', title: esc(n || ''), sub: [h, c].filter(Boolean).map(esc).join(' · ')})),
      D.cta({ground:'call', label: fv(p, 'book'), title:'Get your copy.', key, sub:'Hardcover · link in bio'})]; },
  guide: p => { const L = dLines(fv(p, 'points')); const series = (fv(p, 'series') || 'GUIDE').toUpperCase();
    return [D.cover(p, {img: fi(p, 'cover'), slot:'cover', ground:'cream', label:series, tag:'//' + series, title: ph(fv(p, 'title'), 'Title'), size:100}),
      ...(fv(p, 'myth') ? [D.text({ground:'ink', label:series, kicker:'Everyone thinks', title: esc(fv(p, 'myth')), body: fv(p, 'truth') ? '<b>The truth?</b> ' + esc(fv(p, 'truth')) : '', bodyTop: 760})] : []),
      ...L.slice(0, 6).map(([t, b], i) => D.point({ground: i % 2 ? 'ink' : 'cream', label:series, n: String(i + 1).padStart(2, '0'), title: esc(t || ''), body: esc(b || '')})),
      D.cta({ground:'call', label:series, title:'Want the full guide?', key:'FINDMORE', sub:'Save this · link in bio'})]; },
  editorial: p => { const L = dLines(fv(p, 'points'));
    return [D.cover(p, {img: fi(p, 'cover'), slot:'cover', label:'ATH Editorial', tag:'//EDITORIAL', title: ph(fv(p, 'title'), 'Title'), sub: esc(fv(p, 'dek') || ''), size:92}),
      ...L.slice(0, 6).map(([t, b], i) => D.text({ground: i % 2 ? 'ink' : 'cream', label:'ATH Editorial', kicker: String(i + 1).padStart(2, '0'), title: esc(t || ''), body: esc(b || ''), bodyTop: 640})),
      D.cta({ground:'call', label:'ATH Editorial', title:'Read more on our site.', key:'FINDMORE'})]; },
  heartlist: p => { const A = dLines(fv(p, 'artists')), W = fis(p, 'works');
    return [D.cover(p, {ground:'peony', label:'This week’s Heartlist', tag:'//HEARTLIST', title: ph(fv(p, 'title'), 'Title'), size:104}),
      ...A.slice(0, 8).map(([n, h, l], i) => D.item({ground: i % 2 ? 'ink' : 'cream', label:'Heartlist', img: W[i], slot:'works' + i, n: String(i + 1).padStart(2, '0'), title: esc(n || ''), sub: [h, l].filter(Boolean).map(esc).join(' · ')})),
      D.cta({ground:'call', label:'Heartlist', title:'Want to be on next week’s list?', key:'FINDMORE', size:84})]; },
  history: p => { const L = dLines(fv(p, 'facts'));
    return [D.cover(p, {img: fi(p, 'cover'), slot:'cover', label:'Art history', tag:'//ART HISTORY', title: ph(fv(p, 'title'), 'Title'), sub: esc(fv(p, 'era') || ''), size:96}),
      ...L.slice(0, 5).map(([t, b], i) => D.point({ground: i % 2 ? 'cream' : 'ink', label:'Art history', n: String(i + 1).padStart(2, '0'), title: esc(t || ''), body: esc(b || '')})),
      D.cta({ground:'call', label:'Art history', title:'More stories like this.', key:'FINDMORE'})]; },
  news: p => { const L = dLines(fv(p, 'items'));
    return [D.cover(p, {img: fi(p, 'cover'), slot:'cover', ground:'cream', label:'Art news', tag:'//ART NEWS', title: ph(fv(p, 'title'), 'Title'), size:104}),
      ...L.slice(0, 5).map(([h, l, s], i) => D.text({ground: i % 2 ? 'ink' : 'cream', label:'Art news', kicker: s ? 'Source: ' + esc(s) : String(i + 1).padStart(2, '0'), title: esc(h || ''), body: esc(l || ''), bodyTop: 660})),
      D.cta({ground:'call', label:'Art news', title:'What did we miss?', key:'FINDMORE', sub:'Tell us in the comments'})]; },
  quote: p => [D.quote({ground:'cream', label:'', last:true, text: ph(fv(p, 'quote'), 'Quote'), by: esc(fv(p, 'author') || ''), credit: fv(p, 'credit') ? 'Shared via ' + esc(fv(p, 'credit')) : '', size: fv(p, 'quote').length > 140 ? 58 : 72})],
  prompt: p => [Object.assign(D.cover(p, {ground:'peony', label:'Say hi', title: ph(fv(p, 'title'), 'Prompt'), sub: esc(fv(p, 'sub') || ''), size:100}), {})],
};
const DCAPTION = {
  interview: p => `//INTERVIEW\n\n${fv(p, 'name')}\n\n${fv(p, 'bio')}${fv(p, 'feature') ? ` They are featured in our ${fv(p, 'feature')}.` : ''}\n\nQ: ${fv(p, 'q')}\n\nA: ${fv(p, 'a')}\n\nRead the full interview on Arts to Hearts Project online → www.artstoheartsproject.com\n\nArtist Interview:\n${fv(p, 'name')} ${fv(p, 'handle')}\n\nComment '${fv(p, 'key') || 'INTERVIEW'}' below and we'll send you the link.\n.\n.\n.\n#artstoheartsproject #emergingartists #artist #art #artistinterview`,
  profile: p => `${fv(p, 'name')} (${fv(p, 'years')})\n\n${fv(p, 'bio')}\n\n${dLines(fv(p, 'lessons')).map(([t, b], i) => `${i + 1}. ${t}${b ? ': ' + b : ''}`).join('\n')}\n\nWant stories like this every week? Comment 'NEWSLETTER' and we'll send you the sign-up link.\n.\n.\n.\n#artstoheartsproject #artistinspiration #arthistory #artworld #creativelife`,
  community: p => `${fv(p, 'title')}\n\nA space made for artists and art lovers who believe there's always more to discover, create, and connect with.\n\n${dLines(fv(p, 'points')).map(([t, b]) => `→ ${t}${b ? ': ' + b : ''}`).join('\n')}\n\nComment 'NEWSLETTER' and we'll send you the sign-up link, or find it in our bio.\n.\n.\n.\n#artstoheartsproject #artstohearts #athcommunity #artworld #ArtInspiration`,
  book: p => `Meet the featured artists of ${fv(p, 'book')}.\n\n${fv(p, 'line')}\n\n${dLines(fv(p, 'artists')).map(([n, h]) => `${n} ${h || ''}`.trim()).join('\n')}\n\nComment '${(fv(p, 'key') || 'SHOP').toUpperCase()}' to get the link to your copy.\n.\n.\n.\n#artstoheartsproject #artbook #featuredartists #contemporaryart #emergingartists`,
  guide: p => `//${(fv(p, 'series') || 'GUIDE').toUpperCase()}\n\n${fv(p, 'title')}\n\n${fv(p, 'myth') ? `Everyone thinks ${fv(p, 'myth').replace(/\.$/, '')}. The truth? ${fv(p, 'truth')}\n\n` : ''}${dLines(fv(p, 'points')).map(([t, b], i) => `${i + 1}. ${t}${b ? ': ' + b : ''}`).join('\n')}\n\nSave this for later. Comment 'FINDMORE' below for the full guide.\n.\n.\n.\n#artstoheartsproject #artbusiness #artcollecting #artistsupport #artworld`,
  editorial: p => `//EDITORIAL\n\n${fv(p, 'title')}\n\n${fv(p, 'dek')}\n\n${dLines(fv(p, 'points')).map(([t, b]) => `${t}${b ? ': ' + b : ''}`).join('\n\n')}\n\nComment 'FINDMORE' below and we'll send you the full piece.\n.\n.\n.\n#artstoheartsproject #artworld #contemporaryart #arteditorial`,
  heartlist: p => `//HEARTLIST\n\n${fv(p, 'title')}\n\n${dLines(fv(p, 'artists')).map(([n, h, l], i) => `${i + 1}. ${n} ${h || ''}${l ? ': ' + l : ''}`.trim()).join('\n')}\n\nWant to be on next week's list? Comment 'FINDMORE' below.\n.\n.\n.\n#artstoheartsproject #heartlist #emergingartists #contemporaryart`,
  history: p => `//ART HISTORY\n\n${fv(p, 'title')}${fv(p, 'era') ? ` (${fv(p, 'era')})` : ''}\n\n${dLines(fv(p, 'facts')).map(([t, b], i) => `${i + 1}. ${t}${b ? ': ' + b : ''}`).join('\n')}\n\nComment 'FINDMORE' below for more stories like this.\n.\n.\n.\n#artstoheartsproject #arthistory #artlovers #artworld`,
  news: p => `//ART NEWS\n\n${fv(p, 'title')}\n\n${dLines(fv(p, 'items')).map(([h, l, s]) => `→ ${h}${l ? ': ' + l : ''}${s ? ` (${s})` : ''}`).join('\n')}\n\nWhat did we miss? Tell us in the comments, or comment 'FINDMORE' for the links.\n.\n.\n.\n#artstoheartsproject #artnews #artworld`,
  quote: p => `"${fv(p, 'quote')}"\n\n${fv(p, 'author')}${fv(p, 'credit') ? `\n\nShared via ${fv(p, 'credit')}` : ''}\n\nSave this for the days you need it.\n.\n.\n.\n#artstoheartsproject #artistquotes #creativelife #artmotivation`,
  prompt: p => `${fv(p, 'title')}\n\n${fv(p, 'sub')}\n\nWe read every comment.\n.\n.\n.\n#artstoheartsproject #emergingartists #artistcommunity`,
};

// ---------- the framework, as found in 61 days of @artstoheartsproject (15 Sep to 14 Nov 2026) ----------
const DFRAME = [
  ['Artist interview', '//INTERVIEW', '4 a week, lead slot', '309 likes · 12 comments', 'Mid-table. Add “Comment INTERVIEW” to every one (only 8 of 35 had a keyword) and lead with the artwork.'],
  ['Famous-figure profile', 'name + bio', '2 a week', '3,096 · 19 (best 33,662)', 'Your biggest reach. It collected nothing: now ends on “Comment NEWSLETTER”. Check image rights.'],
  ['Community / newsletter', '“Launching Artists…”, “Join our Artist community”', '2.5 a week', '2,272 · 21', 'Strong reach, same boilerplate 19 times. Rotate the headline; keyword NEWSLETTER.'],
  ['Book: featured artists', '“Meet the Featured Artists of…”', '6 a week', '272 · 18', 'Highest volume, low likes. One artist per slide with their work beats a list.'],
  ['Guide / collecting / business', '//GUIDE, // THE ART OF COLLECTING', '1.4 a week', '498 · 33', 'Save-worthy. Myth → truth → steps works. Keyword FINDMORE.'],
  ['Editorial', '//EDITORIAL', '1 a week', '491 · 6', 'Low conversation: end on a question.'],
  ['Heartlist', '//HEARTLIST', 'weekly, Sunday', '636 · 11', 'Ask “Want to be on next week’s list?” to drive comments.'],
  ['Art history', '//ART HISTORY', '1 a week', '389 · 3', 'Lowest comments. Use a striking fact as the cover line.'],
  ['Art news', '//ART NEWS', '0.5 a week', '367 · 3', 'Weak. Keep to 3 stories and ask what we missed.'],
  ['Quote / advice', 'quote + “shared via @…”', '0.6 a week', '4,698 · 65', 'Top reach per post. Worth doing more often, with credit.'],
  ['Engagement prompt', '“Drop a hi…”', '0.7 a week', '553 · 605', 'Drives comments. Use before a launch.'],
  ['Open call', 'APPLY TO OUR OPEN CALL, //OPEN CALL', '6.7 a week', '404 · 101', 'Made in the open call studio. Single images underperform: use carousels. Rotate angles; repeats fatigue.'],
  ['Featured-artist reel', '✨ Featured Artist |', '0.8 a week', 'median 42, best 11,707', 'The face-and-work reel hit 11,707. Aim for one a day in the new US-evening slot.'],
];
const DFRAME_HTML = `<p><b>Schedule found:</b> about 4.2 posts a day, nearly all carousels; first post around 12:30 IST; Sundays almost empty; nothing in US evening time. The plan above keeps your slots and adds a 07:30 IST (18:00 PT) slot for reels.</p>
  <p><b>Biggest fix:</b> 111 of 259 posts had no comment keyword, including every profile and community post, your highest-reach formats. Every template here ends on a keyword.</p>
  <table><thead><tr><th>Format</th><th>Marker</th><th>How often</th><th>Avg likes · comments</th><th>What to do</th></tr></thead><tbody>${DFRAME.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
  <p class="hint">Numbers are likes and comments only; Instagram did not return reach, saves or story views.</p>`;
