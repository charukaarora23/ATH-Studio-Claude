/* ATH Post Studio — the month around the launch.
   Loaded before the main script; every function here runs at render time,
   so it uses the helpers and state defined in post-studio.html. */

// dummy artwork for examples until real artists' work is added (credit before posting)


// the post being built sets this (days before the deadline)
let CURLEFT = 30;
const dateLong = () => `${dl().getDate()} ${MONTHS_L[dl().getMonth()]}`;
const leftLabel = (l = CURLEFT) => l >= 14 && l % 7 === 0 ? `${l/7} weeks left` : l > 2 ? `${l} days left` : l === 2 ? '48 hours left' : l === 1 ? '24 hours left' : 'Closes tonight';
const GE = () => `<span class="scr" style="font-size:1.14em;letter-spacing:0;font-weight:400">${esc(state.name)}</span>`;
const TH = () => esc(state.theme || ''), TW = () => esc(state.themeWork || 'work');
const KINDS = () => String(state.kinds || '').split('\n').map(l => l.split('|').map(x => x.trim())).filter(k => k[0]);
const PAST = () => String(state.pastEds || '').split(',').map(x => x.trim()).filter(Boolean);
const themeTag = () => state.theme ? `Theme: ${TH()}. ` : '';
const callName = () => `${esc(state.series)}: ${GE()}`;

// a flip-clock style timer: the countdown on every cover
const timer = (dark) => { const l = CURLEFT; const label = l > 2 ? `${l} days left` : l > 0 ? `${l*24} hours left` : 'Closes tonight';
  const bg = isAwardStyle() ? tint(state.colour) : state.colour, fg = isAwardStyle() ? INK : WHITE;
  return `<span class="cn" style="display:inline-flex;align-items:center;gap:12px;height:50px;padding:0 24px;border-radius:999px;background:${bg};color:${fg};font-size:20px;letter-spacing:.12em"><span style="width:10px;height:10px;border-radius:50%;background:${fg}"></span>${label}</span>`; };
const isAwardStyle = () => state.style === 'award';
// the open-call tag, styled as an action
const callBtn = () => `<span style="display:inline-flex;align-items:center;gap:16px;height:64px;padding:0 10px 0 28px;border-radius:999px;background:${state.colour};color:${WHITE}">
  <span class="cn" style="font-size:19px">Open call · ${esc(state.name)}</span>
  <span style="width:46px;height:46px;border-radius:50%;background:${WHITE};color:${state.colour};display:inline-flex;align-items:center;justify-content:center"><svg width="22" height="10" viewBox="0 0 46 20"><path d="M2 10h40M33 2l9 8-9 8" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span>`;
// ---------- month artworks: every photo spot in the month gets its own artwork, never repeated ----------
// Each post's n-th image read is a numbered slot ("post title#n"). Slots are filled, in posting order, by
// the uploaded month artworks (state.images.pool1, pool2, ...). Empty slots borrow a sample (each sample once),
// then show a dashed "Artwork N" placeholder.
const SAMPLE_ART = ['art/call-garden.jpg','art/ref-reid.jpg','art/ref-dahlias.jpg','art/night-bloom.jpg','art/ref-palms.jpg','art/flower-portrait.jpg'];
let ART_CTX = null, ART_ORDER = {}, ART_KEYS = [];
// while a post is built every image read returns a token; only tokens that end up on a slide get a slot
function artNext(){ return ART_CTX ? 'ARTSLOT' + (ART_CTX.n++) + 'X' : SAMPLE_ART[0]; }
function artBuild(p){ CURPOST = p.title; ART_CTX = {n:0}; let slides; try { slides = p.slides(); } finally { ART_CTX = null; } return slides; }
function artKeys(p, slides){ const ks = []; slides.forEach(s => String(s.html || '').replace(/ARTSLOT(\d+)X/g, (m, n) => { const k = p.title + '#' + n; if (!ks.includes(k)) ks.push(k); return m; })); return ks; }
function artFill(p, slides){ return slides.map(s => { if (!s.html) return s; const idx = n => ART_ORDER[p.title + '#' + n];
  let h = s.html.replace(/style="([^"]*?)url\(ARTSLOT(\d+)X\)/g, (m, pre, n) => `data-slot="pool${idx(n) + 1}" style="${pre}url(${artFor(idx(n))})`);
  h = h.replace(/ARTSLOT(\d+)X/g, (m, n) => artFor(idx(n))); return {...s, html: h}; }); }
function artFor(i){
  if (i === undefined) return SAMPLE_ART[0];
  const up = state.images['pool' + (i + 1)]; if (up) return up;
  const used = new Set([state.images.imgCover, state.images.imgTheme]);
  const samples = SAMPLE_ART.filter(s => !used.has(s));
  let k = 0; for (let j = 0; j < i; j++) if (!state.images['pool' + (j + 1)]) k++;
  return samples[k] || artPlaceholder(i);
}
function artPlaceholder(i){
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect width="1080" height="1350" fill="#2b2124"/><rect x="40" y="40" width="1000" height="1270" rx="24" fill="none" stroke="#f9ece5" stroke-opacity=".5" stroke-width="4" stroke-dasharray="18 14"/><text x="540" y="380" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="54" fill="#f9ece5" fill-opacity=".75" letter-spacing="6">ARTWORK ${i + 1}</text><text x="540" y="450" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#f9ece5" fill-opacity=".55">Add it under Month artworks</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29');
}
// walk the whole month once to number the slots (stable, whatever post is being shown)
function artPlan(){
  const v = VERB, l = CURLEFT; ART_KEYS = [];
  monthPosts().forEach(p => { try { VERB = verbFor(p.left); CURLEFT = p.left; ART_KEYS.push(...artKeys(p, artBuild(p))); } catch {} });
  VERB = v; CURLEFT = l; ART_ORDER = {}; ART_KEYS.forEach((k, i) => ART_ORDER[k] = i); return ART_KEYS;
}
const ART = new Proxy([], { get(t, k){ return (typeof k === 'string' && /^\d+$/.test(k)) ? artNext() : t[k]; } });
const EX = new Proxy({}, { get(){ return artNext(); } });
// simple line icons for teaching slides
const ICON = {
  sun:'<circle cx="60" cy="60" r="22"/><path d="M60 14v14M60 92v14M14 60h14M92 60h14M27 27l10 10M83 83l10 10M27 93l10-10M83 37l10-10"/>',
  level:'<rect x="18" y="30" width="84" height="60" rx="6"/><path d="M8 60h104M60 20v80"/>',
  crop:'<path d="M30 10v80h80M10 30h80v80"/>',
  drop:'<path d="M60 14C44 40 34 56 34 72a26 26 0 0 0 52 0c0-16-10-32-26-58z"/>',
  grid:'<rect x="16" y="16" width="88" height="88" rx="6"/><path d="M45 16v88M75 16v88M16 45h88M16 75h88"/>',
  blur:'<circle cx="60" cy="60" r="34" stroke-dasharray="6 8"/><circle cx="60" cy="60" r="14"/>',
  filter:'<circle cx="46" cy="50" r="26"/><circle cx="74" cy="50" r="26"/><circle cx="60" cy="74" r="26"/>',
  target:'<circle cx="60" cy="60" r="40"/><circle cx="60" cy="60" r="22"/><circle cx="60" cy="60" r="5"/>',
  star:'<path d="M60 14l13 30 32 3-24 21 7 32-28-17-28 17 7-32-24-21 32-3z"/>',
  clock:'<circle cx="60" cy="60" r="42"/><path d="M60 32v30l20 12"/>',
  book:'<path d="M14 26c18-6 32-6 46 4 14-10 28-10 46-4v70c-18-6-32-6-46 4-14-10-28-10-46-4z"/><path d="M60 30v70"/>',
  eye:'<path d="M10 60s18-30 50-30 50 30 50 30-18 30-50 30S10 60 10 60z"/><circle cx="60" cy="60" r="14"/>',
  people:'<circle cx="42" cy="44" r="14"/><circle cx="80" cy="48" r="11"/><path d="M16 96c4-20 16-30 26-30s22 10 26 30M66 92c3-14 10-22 18-22s14 8 18 22"/>',
  check:'<rect x="16" y="16" width="88" height="88" rx="14"/><path d="M36 62l16 16 32-34"/>',
};
const icon = (k, c, size=220) => `<svg width="${size}" height="${size}" viewBox="0 0 120 120" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${ICON[k]||''}</svg>`;

// big OPEN CALL label: the keyword artists scan for
const OPENCALL = (c, center) => `<p style="font-size:38px;font-weight:800;letter-spacing:.16em;line-height:1;color:${c};${center ? 'text-align:center' : ''}">OPEN CALL</p>`;
// the action: keyword + time left in one button
const actionBtn = (top, chilli) => { const fg = chilli ? '#AA0003' : BURG;
  return `<div class="a" style="left:80px;right:80px;top:${top}px;height:108px;border-radius:999px;background:${CREAM};color:${fg};display:flex;align-items:center;justify-content:space-between;padding:0 14px 0 46px;box-shadow:0 14px 30px -12px rgba(0,0,0,.45)">
    <span style="font-size:38px;font-weight:800;letter-spacing:-.02em">${ctaBtn()}</span>
    <span style="display:flex;align-items:center;gap:18px"><span class="cn" style="font-size:19px;color:${fg}">${leftLabel()}</span>
    <span style="width:80px;height:80px;border-radius:50%;background:${fg};color:${CREAM};display:inline-flex;align-items:center;justify-content:center"><svg width="32" height="14" viewBox="0 0 46 20"><path d="M2 10h40M33 2l9 8-9 8" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span></div>`; };

// covers: a quiet action line instead of a big button
const coverCTA = (top, fg, acc) => `<div class="a" style="left:80px;right:80px;top:${top}px;display:flex;justify-content:space-between;align-items:center;padding-top:24px;border-top:1.5px solid ${rgba(fg === INK ? '#14090C' : '#FFFFFF', .35)}">
  <span style="font-size:28px;font-weight:500;color:${fg};opacity:.85">Closes ${dateLong()}</span>
  <span style="font-size:30px;font-weight:700;letter-spacing:-.01em;color:${acc}">${ctaQuiet()}&nbsp;&rarr;</span></div>`;

// ---------- grounds ----------
const G = {
  ink:   () => ({bg:INK,   fg:WHITE, acc:tint(state.colour), dm:PEONY, line:'rgba(255,255,255,.2)'}),
  cream: () => ({bg:CREAM, fg:INK,   acc:state.colour,       dm:BURG,  line:'rgba(20,9,12,.18)'}),
  call:  () => ({bg:state.colour, fg:WHITE, acc:tint(state.colour), dm:PEONY, line:'rgba(255,255,255,.25)'}),
};
const imgDiv = (src, style, pos='center') => `<div class="a img" style="${style};background-image:url(${src});background-position:${pos}"></div>`;
const slot = (src, label, style, col) => src ? imgDiv(src, style + ';border-radius:18px') : `<div class="a ph" style="${style};color:${col}">${label}</div>`;
const btnCTA = (bg, fg, ring) => `<div class="a" style="left:110px;right:110px;top:{TOP}px;height:120px;border-radius:999px;background:${bg};color:${fg};display:flex;align-items:center;justify-content:space-between;padding:0 20px 0 54px">
  <span style="font-size:42px;font-weight:700;letter-spacing:-.02em">${ctaBtn()}</span>
  <span style="width:84px;height:84px;border-radius:50%;background:${ring};color:${bg};display:inline-flex;align-items:center;justify-content:center"><svg width="34" height="16" viewBox="0 0 46 20"><path d="M2 10h40M33 2l9 8-9 8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>`;

// ---------- feed templates (1080 x 1350) ----------
const T = {
  // opening slide: on artwork, or on a ground
  title(o){
    if (o.img) return {bg:INK, html:`${imgDiv(o.img,'inset:0',o.pos||'center 30%')}
      <div class="a" style="inset:0;background:linear-gradient(180deg,rgba(20,9,12,.45) 0%,rgba(20,9,12,0) 20%,rgba(20,9,12,0) 42%,rgba(20,9,12,.8) 70%,rgba(20,9,12,.92) 100%)"></div>
      ${corners(WHITE, PEONY, o.tr)}
      ${o.kicker ? `<div class="a" style="left:80px;top:${o.top||800}px"><span class="cn" style="display:inline-flex;align-items:center;height:46px;padding:0 24px;background:${tint(state.colour)};color:${INK};border-radius:999px">${esc(o.kicker)}</span></div>` : ''}
      <p class="a H" style="left:76px;right:80px;top:${(o.top||800)+76}px;font-size:${o.size||96}px;color:${WHITE}">${o.head}</p>
      ${o.sub ? `<p class="a sub" style="left:80px;right:140px;top:${(o.top||800)+(o.subGap||300)}px;color:${WHITE};opacity:.9">${o.sub}</p>` : ''}`};
    const g = G[o.ground||'ink']();
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr)}
      ${o.kicker ? `<p class="a lab" style="left:80px;top:300px;color:${g.acc}">${esc(o.kicker)}</p>` : ''}
      <p class="a R" style="left:76px;right:80px;top:350px;font-size:${o.size||104}px;color:${g.fg}">${o.head}</p>
      ${o.sub ? `<p class="a sub" style="left:80px;right:160px;top:${o.subTop||820}px;color:${g.fg};opacity:.85">${o.sub}</p>` : ''}`};
  },
  // numbered point, optional artwork slot
  // numbered point: big numeral in the call colour, a line icon in a ring, no filled blocks
  num(o){
    const g = G[o.ground||'cream']();
    if (o.img !== undefined) {
      return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr)}${slot(o.img, o.imgLabel||'Example artwork', 'left:80px;right:80px;top:150px;height:560px', g.fg)}
        <p class="a" style="left:72px;top:760px;font-size:120px;font-weight:400;letter-spacing:-.06em;line-height:.85;color:${g.acc}">${esc(o.n)}</p>
        <p class="a R" style="left:260px;right:80px;top:766px;font-size:72px;color:${g.fg}">${o.head}</p>
        <p class="a sub" style="left:260px;right:100px;top:910px;color:${g.fg};opacity:.8">${o.text}</p>`};
    }
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr)}
      <p class="a" style="left:66px;top:170px;font-size:300px;font-weight:400;letter-spacing:-.07em;line-height:.8;color:${g.acc}">${esc(o.n)}</p>
      ${o.icon ? `<div class="a" style="right:80px;top:170px;width:240px;height:240px;border-radius:50%;border:2px solid ${g.line};display:flex;align-items:center;justify-content:center">${icon(o.icon, g.acc, 140)}</div>` : ''}
      <div class="a" style="left:80px;right:80px;top:520px;border-top:2px solid ${g.line}"></div>
      <p class="a R" style="left:76px;right:80px;top:580px;font-size:84px;color:${g.fg}">${o.head}</p>
      <p class="a sub" style="left:80px;right:110px;top:${o.textTop||800}px;color:${g.fg};opacity:.85;font-size:36px">${o.text}</p>`};
  },
  // countdown cover: artwork, the open call, one big number, what it is for
  count(o){
    const tone = o.tone || 'ink';
    const shade = tone === 'green' ? `linear-gradient(180deg,${rgba(state.colour,.55)} 0%,${rgba(state.colour,.25)} 30%,${rgba(state.colour,.9)} 60%,${state.colour} 100%)`
      : tone === 'chilli' ? 'linear-gradient(180deg,rgba(120,0,2,.6) 0%,rgba(120,0,2,.3) 30%,rgba(150,0,3,.92) 60%,#AA0003 100%)'
      : 'linear-gradient(180deg,rgba(20,9,12,.6) 0%,rgba(20,9,12,.3) 30%,rgba(20,9,12,.88) 58%,rgba(20,9,12,.97) 100%)';
    const acc = tone === 'ink' ? tint(state.colour) : CREAM;
    const big = String(o.big), size = big.length <= 2 ? 300 : big.length <= 8 ? 150 : 120;
    return {bg:INK, html:`${imgDiv(o.img || ART[0], 'inset:0', o.pos || 'center 25%')}
      <div class="a" style="inset:0;background:${shade}"></div>
      ${corners(WHITE, PEONY, o.tr || leftLabel())}
      <div class="a" style="left:0;right:0;top:150px">${OPENCALL(acc, true)}</div>
      <p class="a c scr" style="left:0;right:0;top:205px;font-size:58px;color:${WHITE}">${esc(state.name)}</p>
      <p class="a c" style="left:0;right:0;top:${big.length <= 2 ? 350 : 400}px;font-size:${size}px;font-weight:700;letter-spacing:-.06em;line-height:.85;color:${WHITE}">${big}</p>
      <p class="a c" style="left:0;right:0;top:620px;font-size:48px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:${acc}">${esc(o.unit)}</p>
      <p class="a c" style="left:120px;right:120px;top:760px;font-size:38px;font-weight:500;letter-spacing:-.015em;color:${WHITE}">${o.info || `to get your work into a juried hardcover book of ${esc(state.selected)} artists.`}</p>
      ${coverCTA(1140, WHITE, acc)}`};
  },
  // the whole open call on one page
  brief(o = {}){
    const g = G[o.ground||'cream']();
    const rows = [['The call', `${esc(state.series)}: ${GE()} · ${esc(state.editionLabel || ('Edition ' + state.edition))}`], ['Theme', state.themeLine ? esc(state.themeLine) : TH()], ['Who', esc(state.elig || '')], ['Selected', `${esc(state.selected)} artists, chosen by ${state.jury ? esc(state.jury) : 'the jury'}`], ['You receive', lines(state.benefits).map(l => esc(l.split('|')[0].trim())).join(', ')], ['Deadline', `${dateLong()}`], ['Apply', CMODE() ? `Link in bio, or comment “${KW()}” for the link` : `${VERB} “${KW()}”, or the link in bio`]];
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr || 'The open call')}
      <p class="a R" style="left:76px;right:80px;top:150px;font-size:76px;color:${g.fg}">${o.head || `The ${GE()}, at a glance.`}</p>
      <div class="a" style="left:80px;right:80px;top:${o.top||340}px;border-bottom:2px solid ${g.line}">${rows.map(([k,v]) => `<div style="display:grid;grid-template-columns:230px 1fr;gap:20px;padding:20px 0;border-top:2px solid ${g.line}"><span class="lab" style="color:${g.acc};padding-top:6px">${k}</span><span style="font-size:31px;line-height:1.35;color:${g.fg}">${v}</span></div>`).join('')}</div>`};
  },
  // what happens after submitting
  next(o = {}){
    const g = G[o.ground||'cream']();
    const steps = [[dateLong(), 'Submissions close'], ['Review', 'The jury reviews every eligible entry'], [state.results ? esc(state.results) : '<span class="gap">Date</span>', `${esc(state.selected)} selected artists are announced`], [state.pub ? esc(state.pub) : '<span class="gap">Month</span>', `The ${GE()} is published`]];
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr || 'What happens next')}
      <p class="a R" style="left:76px;right:80px;top:170px;font-size:84px;color:${g.fg}">${o.head || 'What happens after you submit.'}</p>
      <div class="a" style="left:110px;top:470px;bottom:250px;border-left:3px solid ${g.line}"></div>
      <div class="a" style="left:80px;right:80px;top:440px;display:flex;flex-direction:column;gap:58px">${steps.map(([d,t],i) => `<div style="display:flex;gap:44px;align-items:flex-start"><span style="width:62px;height:62px;border-radius:50%;flex:none;background:${i===0 ? g.acc : g.bg};border:3px solid ${g.acc}"></span><div><p class="lab" style="color:${g.acc}">${d}</p><p style="font-size:40px;font-weight:500;letter-spacing:-.02em;margin-top:8px;color:${g.fg}">${t}</p></div></div>`).join('')}</div>`};
  },
  // the theme, recapped visually
  themeRecap(o = {}){
    const g = G[o.ground||'ink']();
    const imgs = [ART[0], ART[1], ART[2], ART[3]]; const items = KINDS().slice(0,4).map((k,i) => [imgs[i], esc(k[0])]);
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr || 'The theme')}
      <p class="a R" style="left:76px;right:80px;top:150px;font-size:76px;color:${g.fg}">${o.head || `${state.theme ? 'Theme: ' + TH() + '. ' : ''}All of this counts.`}</p>
      ${items.map(([src,l],i) => { const x = i%2 ? 556 : 80, y = i<2 ? 360 : 780; return `${imgDiv(src, `left:${x}px;top:${y}px;width:444px;height:330px;border-radius:16px`, 'center 30%')}<p class="a" style="left:${x}px;top:${y+346}px;font-size:28px;font-weight:600;color:${g.fg}">${l}</p>`; }).join('')}`};
  },
  // every carousel closes on this: one headline, the date, one button
  cta(o = {}){
    const g = G[o.ground||'call']();
    const b = (g.bg === CREAM ? btnCTA(BURG, CREAM, CREAM) : btnCTA(CREAM, BURG, BURG)).replace('{TOP}', 760);
    const long = String(state.name).length > 16;
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr||'Submissions open')}
      <p class="a H c" style="left:70px;right:70px;top:${long ? 300 : 330}px;font-size:${Math.round((o.size||100) * (long ? .8 : 1))}px;color:${g.fg}">${o.head || `Apply to the<br>${GE()}.`}</p>
      <p class="a c" style="left:0;right:0;top:620px;font-size:34px;font-weight:600;letter-spacing:-.01em;color:${g.acc}">${CURLEFT === 0 ? `Closes tonight, ${dateLong()}` : `Closes ${dateLong()} · ${leftLabel()}`}</p>
      ${b}
      <p class="a c" style="left:0;right:0;top:930px;font-size:28px;color:${g.fg};opacity:.8">${ctaSub()}</p>`};
  },
  // scarcity: 101 places, one of them could be yours
  stakes(o = {}){
    const g = G[o.ground||'ink']();
    const nDots = Math.max(1, Math.min(150, Number(state.selected) || 101)); const dots = Array.from({length:nDots}, (_,i) => i === nDots - 1 ? `<div style="aspect-ratio:1;border-radius:50%;background:${g.acc};box-shadow:0 0 0 5px ${rgba(tint(state.colour),.25)}"></div>` : `<div style="aspect-ratio:1;border-radius:50%;border:2px solid ${g.line}"></div>`).join('');
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr || 'Selection')}
      <p class="a R" style="left:76px;right:80px;top:160px;font-size:76px;color:${g.fg}">${o.head || `${esc(state.selected)} places in the ${GE()}.`}</p>
      <div class="a" style="left:120px;right:120px;top:${o.top||420}px;display:grid;grid-template-columns:repeat(17,1fr);gap:10px">${dots}
        <p style="grid-column:12/18;font-family:'ATH Script',serif;font-style:italic;font-size:36px;color:${g.acc};align-self:center;padding-left:6px">&larr; yours?</p></div>
      <p class="a sub" style="left:80px;right:100px;top:${o.subTop||870}px;color:${g.fg};opacity:.9">${o.sub || 'Every eligible submission is reviewed. Selected artists are published, sold worldwide and introduced to collectors, galleries and curators.'}</p>`};
  },
  // how to apply, in three moves
  howto(o = {}){
    const g = G[o.ground||'cream']();
    const steps = [(CMODE() ? ['01', 'Tap the link in bio', `Or comment “${KW()}” and we’ll send you the link.`] : ['01', `${VERB} “${KW()}”`, 'We send you the full brief and your submission link.']), ['02', 'Prepare your artworks', `${state.theme && state.themeWork !== 'best work' ? 'On theme, p' : 'P'}hotographed in daylight, with title, medium and size.`], ['03', `Submit by ${dateLong()}`, 'Through your link or the link in bio. About ten minutes.']];
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr || 'How to apply')}
      <p class="a R" style="left:76px;right:80px;top:160px;font-size:80px;color:${g.fg}">${o.head || `Apply to the ${GE()} in three steps.`}</p>
      <div class="a" style="left:80px;right:80px;top:470px;border-bottom:2px solid ${g.line}">${steps.map(([n,t,d]) => `<div style="display:grid;grid-template-columns:140px 1fr;padding:34px 0;border-top:2px solid ${g.line}"><p style="font-size:84px;letter-spacing:-.06em;line-height:.9;color:${g.acc}">${n}</p><div><p style="font-size:44px;font-weight:600;letter-spacing:-.02em;color:${g.fg}">${t}</p><p style="font-size:29px;line-height:1.4;margin-top:8px;color:${g.fg};opacity:.8">${d}</p></div></div>`).join('')}</div>`};
  },
  // a question and its answer
  qa(o){
    const g = G[o.ground||'ink']();
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr||'Your questions')}
      <p class="a ser" style="left:70px;top:110px;font-size:300px;line-height:1;color:${g.acc};opacity:.9">“</p>
      <p class="a lab" style="left:80px;top:300px;color:${g.acc}">You asked</p>
      <p class="a ser" style="left:76px;right:80px;top:350px;font-size:76px;line-height:1.1;color:${g.fg}">“${esc(o.q)}”</p>
      <div class="a" style="left:80px;right:80px;top:${o.aTop||700}px;border-top:2px solid ${g.line}"></div>
      <p class="a R" style="left:76px;right:80px;top:${(o.aTop||700)+50}px;font-size:${o.aSize||64}px;color:${g.fg}">${o.a}</p>
      ${o.more ? `<p class="a sub" style="left:80px;right:120px;top:${(o.aTop||700)+(o.moreGap||200)}px;color:${g.fg};opacity:.75">${o.more}</p>` : ''}`};
  },
  // a photo slot with a caption
  photo(o){
    const g = G[o.ground||'cream']();
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr)}
      ${slot(o.img || (o.key && state.images[o.key]), o.label, 'left:80px;right:80px;top:150px;height:700px', g.fg).replace('<div class="a', `<div data-slot="${o.key || ''}" class="a`)}
      <p class="a R" style="left:76px;right:80px;top:900px;font-size:${o.size||68}px;color:${g.fg}">${o.head}</p>
      ${o.sub ? `<p class="a sub" style="left:80px;right:140px;top:${o.subTop||1010}px;color:${g.fg};opacity:.8">${o.sub}</p>` : ''}`};
  },
  // four artworks with credits
  grid(o){
    const g = G[o.ground||'cream']();
    if (o.from !== undefined) o.items = o.items.map((_, i) => { const a = PAST_ARTISTS()[o.from + i] || []; return {name: a[0] ? esc(a[0]) : '', meta: a[1] ? esc(a[1]) : '', img: paImg(o.from + i)}; });
    const cell = (it,i) => { const x = i%2 ? 556 : 80, y = i<2 ? 260 : 760;
      return `${slot(it.img, 'Artwork', `left:${x}px;top:${y}px;width:444px;height:380px`, g.fg).replace('<div class="a', `<div data-slot="${o.from !== undefined ? 'pa' + (o.from + i + 1) : ''}" class="a`)}
        <p class="a" style="left:${x}px;top:${y+398}px;font-size:26px;font-weight:600;color:${g.fg}">${gap(it.name,'Artist name')}</p>
        <p class="a" style="left:${x}px;top:${y+438}px;font-size:22px;opacity:.7;color:${g.fg}">${gap(it.meta,'Title · Country')}</p>`; };
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr)}
      <p class="a R" style="left:76px;right:80px;top:140px;font-size:${String(o.head).replace(/<[^>]+>/g,"").length > 34 ? 58 : 72}px;color:${g.fg}">${o.head}</p>
      ${o.items.map(cell).join('')}`};
  },
  // a checklist
  check(o){
    const g = G[o.ground||'cream']();
    const rows = o.items.map(t => `<div style="display:flex;align-items:center;gap:30px;padding:30px 0;border-top:2px solid ${g.line}"><span style="width:52px;height:52px;border:3px solid ${g.acc};border-radius:12px;flex:none"></span><span style="font-size:44px;font-weight:500;letter-spacing:-.02em">${t}</span></div>`).join('');
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr)}
      <p class="a R" style="left:76px;right:80px;top:200px;font-size:92px;color:${g.fg}">${o.head}</p>
      <div class="a" style="left:80px;right:80px;top:${o.top||470}px;border-bottom:2px solid ${g.line};color:${g.fg}">${rows}</div>
      ${o.foot ? `<p class="a sub" style="left:80px;right:120px;top:1170px;color:${g.fg};opacity:.75">${o.foot}</p>` : ''}`};
  },
  // a past artist's words
  quote(o){
    const g = G[o.ground||'ink']();
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr||'From past editions')}
      ${slot(o.img, 'Their artwork', 'left:80px;top:170px;width:360px;height:450px', g.fg)}
      <p class="a" style="left:480px;top:500px;font-size:32px;font-weight:600;color:${g.fg}">${gap(o.name,'Artist name')}</p>
      <p class="a" style="left:480px;top:550px;font-size:24px;opacity:.7;color:${g.fg}">${gap(o.role,'Edition · Country')}</p>
      <p class="a ser" style="left:76px;right:80px;top:700px;font-size:64px;line-height:1.12;color:${g.fg}">“${gap(o.q,'One real line, in their words')}”</p>`};
  },
  // closing slide of every carousel: one clear action
  // every carousel opens on this: what it is, why it matters, when it closes, how to act
  hook(o){
    const shrink = String(state.name).length > 16 && String(o.head).includes(esc(state.name)) ? .86 : 1;
    const head = (fg, acc, timerDark) => `
      <div class="a" style="left:80px;right:80px;top:600px;display:flex;justify-content:space-between;align-items:center">${OPENCALL(acc)}${timer(timerDark)}</div>
      <p class="a H" style="left:76px;right:80px;top:680px;font-size:${Math.round((o.size||84) * shrink)}px;color:${fg}">${o.head}</p>
      ${o.sub ? `<p class="a sub" style="left:80px;right:140px;top:${o.subTop||970}px;font-size:29px;color:${fg};opacity:.9">${o.sub}</p>` : ''}
      ${coverCTA(1140, fg, acc)}`;
    if (o.img) return {bg:INK, html:`${imgDiv(o.img,'inset:0',o.pos||'center 30%')}
      <div class="a" style="inset:0;background:linear-gradient(180deg,rgba(20,9,12,.45) 0%,rgba(20,9,12,0) 16%,rgba(20,9,12,0) 30%,rgba(20,9,12,.85) 52%,rgba(20,9,12,.96) 100%)"></div>
      ${corners(WHITE, PEONY, o.tr)}${head(WHITE, tint(state.colour), false)}`};
    const g = G[o.ground||'ink']();
    const pic = o.img2 !== undefined ? slot(o.img2, o.imgLabel || 'Real photo needed', 'left:80px;right:80px;top:130px;height:430px', g.fg)
      : imgDiv(o.art || ART[0], 'left:80px;right:80px;top:130px;height:430px;border-radius:18px', o.artPos || 'center 30%');
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr)}${pic}${head(g.fg, g.acc, g.bg === CREAM)}`};
  },
  // after every countdown: what the deadline is for
  value(o = {}){
    const g = G[o.ground||'ink']();
    const ics = ['book','check','eye','people']; const rows = lines(state.benefits).slice(0,4).map((l,i) => { const [t,d] = l.split('|').map(x => x.trim()); return [ics[i], esc(t), esc(d || '')]; });
    return {bg:g.bg, html:`${corners(g.fg, g.dm, 'What you’re applying for')}
      ${imgDiv(o.art || ART[2], 'left:80px;right:80px;top:140px;height:300px;border-radius:18px', 'center 40%')}
      <p class="a R" style="left:76px;right:80px;top:490px;font-size:72px;color:${g.fg}">What you’re applying for.</p>
      <div class="a" style="left:80px;right:80px;top:620px">${rows.map(([ic,t,d]) => `<div style="display:flex;align-items:center;gap:28px;padding:20px 0;border-top:2px solid ${g.line}">
        ${icon(ic, g.acc, 64)}<div><p style="font-size:36px;font-weight:600;letter-spacing:-.02em;color:${g.fg}">${t}</p><p style="font-size:26px;margin-top:4px;color:${g.fg};opacity:.75">${d}</p></div></div>`).join('')}</div>`};
  },
  // collector posts: one keyword for art lovers, and the call for artists underneath
  ctaList(o){
    const g = G.cream();
    return {bg:g.bg, html:`${corners(INK, BURG, o.tr||'For art lovers')}
      <p class="a R c" style="left:80px;right:80px;top:230px;font-size:88px;color:${INK}">${o.head}</p>
      <p class="a c sub" style="left:150px;right:150px;top:500px;color:${INK};opacity:.85">${o.sub}</p>
      <div class="a" style="left:110px;right:110px;top:660px;height:116px;border-radius:999px;background:${BURG};color:${CREAM};display:flex;align-items:center;justify-content:center"><span style="font-size:40px;font-weight:700;letter-spacing:-.02em">${o.button}</span></div>
      <div class="a" style="left:110px;right:110px;top:880px;border-top:2px solid rgba(20,9,12,.18);padding-top:36px;text-align:center">
        <p class="lab" style="color:${state.colour}">Are you an artist?</p>
        <p class="sub" style="margin-top:12px;color:${INK}">The ${GE()} is open until ${dateLong()}.<br>${ctaSentence()}</p></div>`};
  },
};


// ---------- per-call visual identity ----------
// 'gallery' (default): full-bleed artwork, grotesk numerals, open layouts.
// 'award': a certificate world. Gold double frame on every slide, framed artwork,
// serif numerals, medallion countdowns, deep ink-brown grounds.
const AWARD_BG = '#1C130B';
const isAward = () => state.style === 'award';
const G0 = {...G};
G.call = () => isAward() ? ({bg:AWARD_BG, fg:CREAM, acc:tint(state.colour), dm:PEONY, line:'rgba(249,236,229,.18)'}) : G0.call();
G.ink  = () => isAward() ? ({bg:INK, fg:CREAM, acc:tint(state.colour), dm:PEONY, line:'rgba(249,236,229,.18)'}) : G0.ink();

const gold = () => tint(state.colour);
const frame = (c) => `<div class="a" style="inset:26px;border:2px solid ${c};pointer-events:none"></div><div class="a" style="inset:36px;border:1px solid ${c};opacity:.45;pointer-events:none"></div>`;
const laurel = (c, w=520) => `<svg class="a" style="left:50%;top:${'{TOP}'}px;transform:translateX(-50%)" width="${w}" height="${w}" viewBox="0 0 200 200" fill="none" stroke="${c}" stroke-width="1.3">
  <circle cx="100" cy="100" r="92"/><circle cx="100" cy="100" r="84" stroke-dasharray="2 4"/>
  ${''}${[].map ? '' : Array.from({length:9}, (_,i) => { const a = (200 + i*14) * Math.PI/180, x = 100 + 70*Math.cos(a), y = 100 + 70*Math.sin(a); return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="9" ry="4" transform="rotate(${(200 + i*14 + 60).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }).join('')}
  ${[].map ? '' : Array.from({length:9}, (_,i) => { const a = (340 - i*14) * Math.PI/180, x = 100 + 70*Math.cos(a), y = 100 + 70*Math.sin(a); return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="9" ry="4" transform="rotate(${(340 - i*14 - 60).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }).join('')}
</svg>`;
const framedArt = (src, style, pos) => `<div class="a" style="${style};background:#F4EBDD;padding:22px;box-shadow:0 30px 50px -20px rgba(0,0,0,.6);outline:2px solid ${gold()};outline-offset:10px">
  <div class="img" style="width:100%;height:100%;background-image:url(${src});background-size:cover;background-position:${pos || 'center 30%'}"></div></div>`;
const serifNum = (n, size, c) => `<span style="font-family:'ATH Serif',serif;font-style:italic;font-weight:400;font-size:${size}px;line-height:.85;letter-spacing:-.03em;color:${c}">${n}</span>`;
const strip = (fg, acc) => `<div class="a" style="left:90px;right:90px;top:1140px;display:flex;justify-content:space-between;align-items:center;padding-top:22px;border-top:1px solid ${acc}">
  <span style="font-size:27px;font-weight:600;color:${fg}">Closes ${dateLong()}</span><span style="font-size:27px;font-weight:700;color:${acc}">${ctaQuiet()}</span></div>`;
const awardTag = () => `<span class="cn" style="display:inline-flex;align-items:center;height:52px;padding:0 26px;border:1.5px solid ${gold()};color:${gold()};border-radius:999px;font-size:18px">Open call · ${esc(state.name)}</span>`;

const AW = {
  hook(o){ const c = gold();
    return {bg:AWARD_BG, html:`${imgDiv(o.img || o.art || ART[0], 'left:40px;right:40px;top:40px;bottom:40px', o.pos || o.artPos || 'center 30%')}
      <div class="a" style="left:40px;right:40px;top:40px;bottom:40px;background:linear-gradient(180deg,rgba(28,19,11,.5) 0%,rgba(28,19,11,0) 18%,rgba(28,19,11,0) 30%,rgba(28,19,11,.9) 52%,#1C130B 100%)"></div>
      ${frame(c)}${corners(CREAM, PEONY, o.tr)}
      <div class="a" style="left:90px;right:90px;top:600px;display:flex;justify-content:space-between;align-items:center">${OPENCALL(c)}${timer(false)}</div>
      <p class="a H" style="left:86px;right:90px;top:680px;font-size:${Math.max(88, Math.round((o.size||88) * (String(state.name).length > 16 && String(o.head).includes(esc(state.name)) ? .86 : 1)))}px;color:${CREAM}">${o.head}</p>
      ${o.sub ? `<p class="a sub" style="left:90px;right:150px;top:990px;font-size:32px;color:${CREAM};opacity:.9">${o.sub}</p>` : ''}
      ${coverCTA(1140, CREAM, c)}`};
  },
  count(o){ const c = gold(); const chilli = o.tone === 'chilli'; const bg = chilli ? '#5A0A0A' : AWARD_BG;
    const big = String(o.big), size = big.length <= 2 ? 300 : big.length <= 8 ? 150 : 120;
    return {bg, html:`${imgDiv(o.img || ART[0], 'left:40px;right:40px;top:40px;bottom:40px', o.pos || 'center 30%')}
      <div class="a" style="left:40px;right:40px;top:40px;bottom:40px;background:${chilli ? 'rgba(90,10,10,.9)' : 'rgba(28,19,11,.86)'}"></div>
      ${frame(c)}${corners(CREAM, PEONY, o.tr || leftLabel())}
      <div class="a" style="left:0;right:0;top:150px">${OPENCALL(c, true)}</div>
      <p class="a c scr" style="left:0;right:0;top:205px;font-size:58px;color:${CREAM}">${esc(state.name)}</p>
      <p class="a c" style="left:0;right:0;top:${big.length <= 2 ? 350 : 400}px;font-size:${size}px;font-weight:700;letter-spacing:-.05em;line-height:.85;color:${CREAM}">${big}</p>
      <p class="a c" style="left:0;right:0;top:620px;font-size:48px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:${c}">${esc(o.unit)}</p>
      <div class="a" style="left:380px;right:380px;top:710px;border-top:2px solid ${c}"></div>
      <p class="a c" style="left:120px;right:120px;top:760px;font-size:38px;font-weight:500;letter-spacing:-.015em;color:${CREAM}">${o.info || `to get your work into a juried hardcover book of ${esc(state.selected)} artists.`}</p>
      ${coverCTA(1140, CREAM, c)}`};
  },
};
// final day: one message, nothing else
T.urgent = (o) => { const award = isAward(); const bg = o.chilli ? '#AA0003' : (award ? AWARD_BG : INK); const acc = o.chilli ? CREAM : tint(state.colour);
  const btn = actionBtn(1060, o.chilli);
  return {bg, html:`${award ? frame(gold()) : ''}${corners(CREAM, PEONY, o.tr || 'Final day')}
    <div class="a" style="left:0;right:0;top:200px">${OPENCALL(acc, true)}</div><p class="a c scr" style="left:0;right:0;top:255px;font-size:56px;color:${CREAM}">${esc(state.name)}</p>
    <p class="a c" style="left:40px;right:40px;top:380px;font-size:${o.size||190}px;font-weight:700;letter-spacing:-.055em;line-height:.88;color:${CREAM}">${o.head}</p>
    <p class="a c" style="left:120px;right:120px;top:${o.subTop||800}px;font-size:40px;font-weight:500;letter-spacing:-.015em;color:${CREAM}">${o.sub}</p>
    ${btn}`};
};
// ---------- editorial style: magazine split layouts ----------
const isEd = () => state.style === 'editorial';
const ED_PAPER = '#F7E9EC';
const G1 = {...G};
G.cream = () => isEd() ? ({bg:ED_PAPER, fg:INK, acc:state.colour, dm:BURG, line:'rgba(20,9,12,.16)'}) : G1.cream();
G.ink   = () => isEd() ? ({bg:mix(state.colour, '#000000', .55), fg:CREAM, acc:tint(state.colour), dm:PEONY, line:'rgba(249,236,229,.2)'}) : G1.ink();
const ED = {
  // magazine cover: full-bleed portrait, masthead across the top, cover lines at the bottom
  mast(){ const acc = tint(state.colour);
    return `<p class="a c cn" style="left:0;right:0;top:70px;color:${CREAM};font-size:19px;letter-spacing:.32em;opacity:.85">Arts to Hearts Project · ${esc(state.editionLabel || '')}</p>
      <p class="a c scr" style="left:40px;right:40px;top:104px;font-size:${String(state.name).length > 18 ? 96 : 112}px;line-height:1;white-space:nowrap;color:${CREAM};text-shadow:0 4px 30px rgba(0,0,0,.35)">${esc(state.name)}</p>
      <div class="a" style="left:80px;right:80px;top:244px;border-top:2px solid ${acc}"></div>`; },
  shade(){ return `<div class="a" style="inset:0;background:linear-gradient(180deg,${rgba(mix(state.colour,'#000000',.5),.75)} 0%,rgba(0,0,0,.05) 30%,rgba(0,0,0,0) 45%,${rgba(mix(state.colour,'#000000',.5),.9)} 72%,${mix(state.colour,'#000000',.55)} 100%)"></div>`; },
  hook(o){ const acc = tint(state.colour);
    return {bg:INK, html:`${imgDiv(o.img || o.art || ART[0], 'inset:0', o.pos || o.artPos || 'center 22%')}${ED.shade()}
      ${ED.mast()}
      <div class="a" style="left:80px;right:80px;top:${o.top || 850}px;display:flex;justify-content:space-between;align-items:center">${OPENCALL(acc)}${timer(false)}</div>
      <p class="a H" style="left:76px;right:80px;top:${(o.top || 850) + 76}px;font-size:${Math.round((o.size||80)*.8)}px;color:${CREAM}">${o.head}</p>
      ${coverCTA(1180, CREAM, acc)}`};
  },
  count(o){ const acc = tint(state.colour); const chilli = o.tone === 'chilli';
    const big = String(o.big), size = big.length <= 2 ? 300 : big.length <= 8 ? 140 : 110;
    return {bg:INK, html:`${imgDiv(o.img || ART[0], 'inset:0', o.pos || 'center 22%')}${ED.shade()}
      ${chilli ? '<div class="a" style="inset:0;background:rgba(170,0,3,.55)"></div>' : ''}
      ${ED.mast()}
      <p class="a scr" style="left:70px;top:${big.length <= 2 ? 760 : 840}px;font-size:${size}px;line-height:.85;color:${CREAM}">${big}</p>
      <p class="a" style="left:${big.length <= 2 ? 470 : 80}px;top:${big.length <= 2 ? 870 : 980}px;font-size:46px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:${chilli ? CREAM : acc}">${esc(o.unit)}</p>
      <p class="a" style="left:${big.length <= 2 ? 470 : 80}px;right:80px;top:${big.length <= 2 ? 940 : 1050}px;font-size:30px;line-height:1.3;color:${CREAM};opacity:.9">to apply · ${esc(state.selected)} places</p>
      ${coverCTA(1180, CREAM, chilli ? CREAM : acc)}`};
  },
};

const T0 = {...T};
T.hook = o => isAward() ? AW.hook(o) : isEd() ? ED.hook(o) : T0.hook(o);
T.count = o => isAward() ? AW.count(o) : isEd() ? ED.count(o) : T0.count(o);
T.num = o => { const s = T0.num(o); if (!isAward() || o.img !== undefined) return s;
  s.html = s.html.replace(/<p class="a" style="left:66px;top:170px;font-size:300px;font-weight:400;letter-spacing:-\.07em;line-height:\.8;color:([^"]+)">([^<]*)<\/p>/, (m, col, n) => `<p class="a" style="left:66px;top:150px">${serifNum(n, 300, col)}</p>`); return s; };
// every slide in the award style sits inside the gold certificate frame
const decorate = (s) => (isAward() && !s.html.includes('inset:26px;border:2px')) ? {...s, html: frame(gold()) + s.html} : s;

// ---------- countdown singles: a different idea at every milestone ----------
const CD = {
  weeks(left){ const g = G.cream(); const n = left; const d0 = new Date(dl()); d0.setDate(d0.getDate() - left);
    const cells = Array.from({length:n+1}, (_,i) => { const d = new Date(d0); d.setDate(d.getDate()+i); const last = i === n;
      return `<div style="height:120px;border-radius:12px;${last ? `background:${state.colour};color:${WHITE}` : `border:2px solid rgba(20,9,12,.18);color:${INK}`};display:flex;align-items:center;justify-content:center;font-size:44px;font-weight:500">${d.getDate()}</div>`; }).join('');
    return {bg:g.bg, html:`${corners(INK, BURG, 'Two weeks left')}
      <div class="a" style="left:80px;top:180px"><span class="cn" style="display:inline-flex;align-items:center;height:48px;padding:0 24px;background:${INK};color:${CREAM};border-radius:999px">Open call · ${callName()}</span></div>
      <p class="a H" style="left:76px;right:80px;top:270px;font-size:120px;color:${INK}">Two weeks left<br>to apply.</p>
      <p class="a sub" style="left:80px;right:120px;top:540px;color:${INK}">To the ${esc(state.series)}: ${GE()}. ${esc(state.selected)} artists will be published.</p>
      <div class="a" style="left:80px;right:80px;top:680px;display:grid;grid-template-columns:repeat(8,1fr);gap:10px">${cells}</div>
      <p class="a lab" style="right:80px;top:930px;color:${state.colour}">${dateLong()}: submissions close</p>
      ${btnCTA(BURG, CREAM, CREAM).replace('{TOP}', 1020)}`}; },
  hours(h, ground){ const g = G[ground](); const rows = h > 24 ? 2 : 1;
    const ticks = Array.from({length:h}, () => `<div style="height:${rows === 2 ? 70 : 110}px;border-radius:4px;background:${g.acc}"></div>`).join('');
    return {bg:g.bg, html:`${corners(g.fg, g.dm, h + ' hours left')}
      <div class="a" style="left:80px;top:180px"><span class="cn" style="display:inline-flex;align-items:center;height:48px;padding:0 24px;background:${g.bg === CREAM ? INK : tint(state.colour)};color:${g.bg === CREAM ? CREAM : INK};border-radius:999px">Open call · ${callName()}</span></div>
      <p class="a" style="left:60px;top:270px;font-size:440px;font-weight:400;letter-spacing:-.07em;line-height:.85;color:${g.fg}">${h}</p>
      <p class="a R" style="left:80px;top:650px;font-size:70px;color:${g.fg}">hours left to apply to the ${GE()}.</p>
      <div class="a" style="left:80px;right:80px;top:870px;display:grid;grid-template-columns:repeat(24,1fr);gap:6px">${ticks}</div>
      ${(g.bg === CREAM ? btnCTA(BURG, CREAM, CREAM) : btnCTA(CREAM, BURG, BURG)).replace('{TOP}', rows === 2 ? 1030 : 1000)}`}; },
  lastDay(){ const g = G.call();
    return {bg:g.bg, html:`${corners(WHITE, PEONY, 'Last day')}
      <div class="a" style="left:0;right:0;top:220px;display:flex;justify-content:center"><span class="cn" style="display:inline-flex;align-items:center;height:48px;padding:0 24px;background:${tint(state.colour)};color:${INK};border-radius:999px">Open call · ${callName()}</span></div>
      <p class="a H c" style="left:60px;right:60px;top:320px;font-size:180px;color:${WHITE}">Last day<br>to submit.</p>
      <p class="a c sub" style="left:140px;right:140px;top:760px;color:${WHITE}">Submissions close tonight. Tomorrow the jury begins selecting ${esc(state.selected)} artists.</p>
      ${btnCTA(CREAM, BURG, BURG).replace('{TOP}', 940)}`}; },

  half(left){ const g = G.cream(); const total = 30, done = total - left;
    const bars = Array.from({length:total}, (_,i) => `<div style="flex:1;height:120px;border-radius:4px;background:${i < done ? state.colour : 'rgba(20,9,12,.1)'}"></div>`).join('');
    return {bg:g.bg, html:`${corners(INK, BURG, 'Halfway')}
      <p class="a R" style="left:76px;right:80px;top:200px;font-size:84px;color:${INK}">Halfway to the deadline.</p>
      <p class="a sub" style="left:80px;right:200px;top:400px;color:${INK};opacity:.8">Submissions for the ${esc(state.series)}: ${GE()} close ${dateLong()}. ${esc(state.selected)} artists will be published.</p>
      <div class="a" style="left:80px;right:80px;top:620px;display:flex;gap:6px">${bars}</div>
      <p class="a" style="left:72px;top:800px;font-size:260px;font-weight:400;letter-spacing:-.07em;line-height:.85;color:${state.colour}">${left}</p>
      <p class="a R" style="left:420px;top:880px;font-size:64px;color:${INK}">days left<br>to submit</p>
      ${btnCTA(BURG, CREAM, CREAM).replace('{TOP}', 1080)}`}; },
  big(left, ground = 'call'){ const g = G[ground]();
    return {bg:g.bg, html:`${corners(g.fg, g.dm, left + ' days left')}
      <p class="a c" style="left:0;right:0;top:170px;font-size:600px;font-weight:400;letter-spacing:-.08em;line-height:.85;color:${g.fg}">${left}</p>
      <p class="a c R" style="left:0;right:0;top:720px;font-size:80px;color:${g.fg}">days left to submit to the</p>
      <p class="a c scr" style="left:0;right:0;top:830px;font-size:84px;color:${g.acc}">${esc(state.series)}: ${GE()}</p>
      ${(g.bg === CREAM ? btnCTA(BURG, CREAM, CREAM) : btnCTA(CREAM, BURG, BURG)).replace('{TOP}', 1020)}`}; },
  week(left){ const g = G.ink(); const d0 = new Date(dl()); d0.setDate(d0.getDate() - left);
    const days = Array.from({length:left+1}, (_,i) => { const d = new Date(d0); d.setDate(d.getDate()+i); const last = i === left;
      return `<div style="flex:1;height:200px;border-radius:14px;${last ? `background:${tint(state.colour)};color:${INK}` : `border:2px solid rgba(255,255,255,.3);color:${WHITE}`};display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-size:22px;font-weight:700;letter-spacing:.1em">${['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()]}</span><span style="font-size:56px;font-weight:500;margin-top:8px">${d.getDate()}</span></div>`; }).join('');
    return {bg:g.bg, html:`${corners(WHITE, PEONY, 'One week')}
      <p class="a R" style="left:76px;right:80px;top:230px;font-size:130px;color:${WHITE}">One week left.</p>
      <p class="a sub" style="left:80px;right:160px;top:430px;color:${WHITE};opacity:.9">Seven days to apply to the ${esc(state.series)}: ${GE()}. ${esc(state.selected)} artists will be published.</p>
      <div class="a" style="left:80px;right:80px;top:640px;display:flex;gap:10px">${days}</div>
      <p class="a lab" style="right:80px;top:870px;color:${tint(state.colour)}">Submissions close ↑</p>
      ${btnCTA(CREAM, BURG, BURG).replace('{TOP}', 1010)}`}; },
  shelf(left){ const g = G.cream();
    const sp = [[PEONY,300],[BURG,340],[INK,310],[CREAM,330]].map(([c,h]) => `<div style="width:90px;height:${h}px;background:${c};border-radius:3px 3px 0 0;box-shadow:inset 0 0 0 2px rgba(20,9,12,.12)"></div>`).join('');
    return {bg:g.bg, html:`${corners(INK, BURG, left + ' days left')}
      <p class="a R c" style="left:80px;right:80px;top:220px;font-size:96px;color:${INK}">${left} days to take your place<br>in the ${GE()}.</p>
      <div class="a" style="left:240px;right:240px;top:540px;height:360px;display:flex;align-items:flex-end;justify-content:center;gap:12px;border-bottom:6px solid ${INK}">${sp}
        <div style="width:130px;height:350px;border:3px dashed ${state.colour};border-bottom:none;border-radius:3px 3px 0 0;background:${rgba(tint(state.colour),.45)};position:relative">${spineLab(state.name, state.colour, 28)}</div></div>
      ${btnCTA(BURG, CREAM, CREAM).replace('{TOP}', 1010)}`}; },
  three(left){ const g = G.ink();
    return {bg:g.bg, html:`${corners(WHITE, PEONY, 'Three days')}
      <div class="a" style="left:80px;right:80px;top:200px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
        ${[3,2,1].map((n,i) => `<div style="height:520px;border-radius:24px;${i===0 ? `background:${tint(state.colour)};color:${INK}` : `border:2px solid rgba(255,255,255,.25);color:rgba(255,255,255,.4)`};display:flex;align-items:center;justify-content:center;font-size:300px;letter-spacing:-.06em">${n}</div>`).join('')}</div>
      <p class="a R c" style="left:80px;right:80px;top:770px;font-size:70px;color:${WHITE}">Three days left to apply to<br>the ${GE()}.</p>
      ${btnCTA(CREAM, BURG, BURG).replace('{TOP}', 1010)}`}; },
  tomorrow(){ const g = G.call();
    return {bg:g.bg, html:`${corners(WHITE, PEONY, 'Closes tomorrow')}
      <p class="a H c" style="left:60px;right:60px;top:320px;font-size:190px;color:${WHITE}">Closes<br>tomorrow.</p>
      <p class="a c sub" style="left:140px;right:140px;top:760px;color:${WHITE}">Submissions for the ${GE()} close ${dl().getDate()} ${MONTHS_L[dl().getMonth()]}.</p>
      ${btnCTA(CREAM, BURG, BURG).replace('{TOP}', 940)}`}; },
  tonight(){ const CH = '#AA0003';
    return {bg:CH, html:`${corners(WHITE, PEONY, 'Final day')}
      <div class="a" style="left:0;right:0;top:220px;display:flex;justify-content:center"><span class="cn" style="display:inline-flex;align-items:center;height:48px;padding:0 24px;background:${CREAM};color:${CH};border-radius:999px">Open call · ${callName()}</span></div>
      <p class="a H c" style="left:60px;right:60px;top:320px;font-size:150px;color:${WHITE}">Final hours.<br>Closes tonight.</p>
      <p class="a c sub" style="left:140px;right:140px;top:700px;color:${WHITE}">This is the last call to be considered for the ${GE()}.</p>
      ${btnCTA(CREAM, CH, CH).replace('{TOP}', 940)}`}; },
};

// ---------- the month: built on each other, from attention to urgency ----------
const tags = '#ArtsToHeartsProject #OpenCall #CallForArtists #101ArtBook';
// calls to action. "comment" mode (DM automation off): link in bio first, comment the keyword for the link
const CMODE = () => (state.ctaMode || 'comment') === 'comment';
const ctaBtn = () => CMODE() ? 'Apply via link in bio' : `${VERB} “${KW()}” to apply`;
const ctaSub = () => CMODE() ? `or comment “${KW()}” for the link` : 'or apply via link in bio';
const ctaQuiet = () => CMODE() ? `Link in bio · comment “${KW()}”` : `${VERB} “${KW()}” to apply`;
const ctaSentence = () => CMODE() ? `Apply via the link in bio, or comment “${KW()}” for the link.` : `${VERB} “${KW()}” to apply.`;
const kwLine = () => CMODE() ? `Apply via the link in bio, or comment "${(state.keyword||'KEYWORD').toUpperCase()}" below and we'll send you the link.` : `${VERB === 'COMMENT' ? 'Comment' : 'DM us'} "${(state.keyword||'KEYWORD').toUpperCase()}"${VERB === 'COMMENT' ? ' below' : ''} for the full brief, or apply via the link in bio.`;
const closeLn = () => `Submissions close ${dl().getDate()} ${MONTHS_L[dl().getMonth()]}.`;
const N = () => state.name, S = () => state.series, SEL = () => state.selected;

// ---------- versions: each call starts on its own wording (A, B or C) so calls never repeat; switch per post ----------
let CURPOST = '';
function postVer(title){ const v = state.ver && state.ver[title]; if (v !== undefined) return v; return ({gallery:0, award:1, editorial:2})[state.style] || 0; }
const pick = (...opts) => opts[postVer(CURPOST) % opts.length];
function monthPosts(){ const name = GE(), sel = esc(state.selected); return [
 {left:30, title:'Launch', kind:'Carousel', slides:() => { const s = launch(); if (isAward() || isEd()) s[0] = {...(isEd() ? ED : AW).hook({img:state.images.imgCover, tr:esc(state.series), head: isEd() ? esc(state.headline || 'Call for artists') : `${esc(state.headline || 'Call for artists')}<br>${GE()}`, size: isEd() ? 112 : 120, sub:esc(state.coverLine)}), title:'cover'}; return s; }, caption:() => caption(), pin:() => pinned()},

 {left:28, title:'What you can submit', kind:'Carousel · theme', slides:() => [
   T.hook({img:EX.bloom, tr:'The theme', head:pick(`What can you submit to the ${name}?`, `What can you submit?`, `Five ways to get in.`), sub:pick(`Five kinds of ${TW()} the jury wants to see. ${sel} will be published.`, `Any medium. ${sel} places. See what fits.`, `Find yours, then apply. ${sel} places.`)}),
   ...KINDS().slice(0,5).map((k,i) => T.num({img:[EX.dahlia, EX.meadow, EX.portrait, EX.palms, EX.field][i], n:String(i+1), head:esc(k[0]) + '.', text:esc(k[1] || ''), tr:'What you can submit', ground: i % 2 ? 'ink' : 'cream'})),
   T.cta({kicker:'Any medium · Original work only', sub:pick(`If your work fits one of these, it belongs in the running for the ${name}.`, `Found yours? Apply now.`, `One of these is you? Apply.`)}),
 ], caption:() => `What can you submit to the ${N()}?

The jury wants to see ${state.themeWork || 'work'} of five kinds:
${KINDS().slice(0,5).map((k,i) => (i+1) + '. ' + k[0]).join('\n')}

Any medium. Original work only. ${SEL()} artists will be selected and published in a juried hardcover book.

${kwLine()}
${closeLn()}

Example artworks are shown for illustration. ${tags}`},

 {left:26, title:'Get published', kind:'Single · proof', slides:() => [
   T.hook({ground:'cream', img2: state.images.imgBooks || null, imgLabel:'Real photo needed<br>The books together', size:84, tr:'The collection', head:pick(`Get published in the ${name}.`, `Get your work in print.`, `Be one of ${sel}.`), sub:pick(`Join ${esc(state.published)} artists in print. ${sel} places.`, `${sel} places in a juried hardcover book.`, `A juried hardcover book. ${sel} places.`)}),
 ], caption:() => `Get published in the ${N()}.

Join ${state.published} artists already in print across ${state.editions} editions of the ${S()}. ${SEL()} places, juried.

${kwLine()}
${closeLn()}

${tags}`},

 {left:24, title:'Inside the book', kind:'Carousel · proof', slides:() => [
   T.hook({ground:'ink', img2: state.images.imgSpread || null, imgLabel:'Real photo needed<br>A spread from a past edition', size:72, tr:'Inside the book', head:pick('This is what being published with us looks like.', 'Your work could be on this page.', 'This could be your page.'), sub:pick(`Selected artists appear in the ${name} exactly like this.`, `This is how selected artists appear.`, `Every selected artist, printed like this.`)}),
   T.photo({img:state.images.imgSpread, label:'Real photo needed<br>A spread from a past edition', tr:'Inside the book', head:pick('Every artist, in print.', 'Your name on the page.', 'Credited, page by page.'), sub:pick('Name, artwork title, medium and country, on the page.', 'Each work is credited with title, medium and country.', 'Your work, your name, your country, in print.')}),
   T.photo({key:'phSpread2', img:null, label:'Real photo needed<br>A second spread', tr:'Inside the book', head:pick('Juried and curated.', 'Chosen by a jury.', 'Curated as one collection.'), sub:pick('Each edition is selected by a jury and laid out as one collection.', 'A jury selects the work and shapes the book.', 'Every page is chosen to sit with the others.'), ground:'ink'}),
   T.photo({key:'phShelf', img:null, label:'Real photo needed<br>The book on a shelf or in a shop', tr:'Inside the book', head:'Seen worldwide.', sub:`Through ${esc(state.distribution || 'Amazon, Barnes & Noble and the ATH Shop')}.`}),
   T.photo({key:'phHolding', img:null, label:'Real photo needed<br>An artist holding their copy', tr:'Inside the book', head:pick('Introduced beyond the feed.', 'Seen by the art world.', 'Shared where it matters.'), sub:pick('Each book is shared with collectors, galleries and curators.', 'Collectors, galleries and curators receive the book.', 'The book goes to collectors, galleries and curators.'), ground:'ink'}),
   T.cta({kicker:pick('Your page could be next', 'Your page is waiting', 'Claim your page')}),
 ], caption:() => `This is what being published with Arts to Hearts looks like.

Every selected artist appears in print with their name, artwork title, medium and country, in a juried hardcover collection sold worldwide and shared with collectors, galleries and curators.

The ${N()} is open now, with ${SEL()} places.
${kwLine()}
${closeLn()}

${tags}`},

 {left:22, title:'Your questions, answered', kind:'Carousel · doubts', slides:() => [
   T.hook({img:EX.meadow, pos:'center 40%', tr:'Your questions', head:pick(`Thinking of applying to the ${name}? Read this first.`, `Your questions, answered.`, `7 answers before you apply.`), sub:pick('The seven questions artists ask us most, answered.', 'What artists ask us most.', 'Swipe, then apply.')}),
   T.qa({q:'I’m self-taught. Can I apply?', a:'Yes. No degree, gallery or exhibition history needed.', more:'The jury judges the work, not the CV.', ground:'call'}),
   T.qa({q:'I don’t live in the US.', a:`Open to ${esc(state.who || 'artists')} worldwide, 18 and over.`, more:'Past editions include artists from every continent.', ground:'cream'}),
   T.qa({q:'Is digital work accepted?', a:'Yes. Any medium, traditional or digital.', more:'Painting, photography, illustration, textile, sculpture, mixed media.', ground:'call'}),
   T.qa({q:'Can I submit AI-generated work?', a:'No. Original work only.', ground:'cream'}),
   T.qa({q:'Is there a fee?', a:`An application fee applies${state.fee ? ': ' + esc(state.fee) : ''}.`, more: state.fee ? '' : '<span class="gap">Add the fee wording in the form</span>'}),
   T.qa({q:'When will I hear back?', a:`Results: ${gap(state.results,'Date')}.`, ground:'call'}),
   T.qa({q:'Do I keep the rights to my work?', a:gap(state.rights,'Confirm the rights wording')}),
   T.cta({kicker:pick('Still have a question? DM us', 'Questions? Ask in the comments', 'Ask us in the comments')}),
 ], caption:() => `Thinking of applying to the ${N()}? The questions artists ask us most:

· Self-taught? Yes, welcome.
· Outside the US? Open worldwide, 18+.
· Digital work? Yes, any medium.
· AI-generated work? No, original work only.
· Fee? An application fee applies.

Anything else? Ask in the comments.
${kwLine()}
${closeLn()}

${tags}`},

 {left:20, title:'Published artists', kind:'Carousel · proof', slides:() => [
   T.hook({img:EX.portrait, tr:'Past editions', head:pick(`Their work is in print. Yours could be next, in the ${name}.`, `They got published. You’re next.`, `Their work is in print. Yours next.`), size:72, sub:`Artists we published in our ${PAST().slice(0,3).join(', ')} editions.`}),
   T.grid({head:`Published in the ${esc(PAST()[0] || 'last edition')}${/edition|year|\d/i.test(PAST()[0]||'') ? '' : ' Edition'}`, items:[{},{},{},{}], from:6, tr:'Past editions'}),
   T.grid({head:`Published in the ${esc(PAST()[1] || PAST()[0] || 'last edition')}${/edition|year|\d/i.test(PAST()[1]||PAST()[0]||'') ? '' : ' Edition'}`, items:[{},{},{},{}], from:10, tr:'Past editions', ground:'ink'}),
   T.grid({head:`Published in the ${esc(PAST()[2] || PAST()[0] || 'last edition')}${/edition|year|\d/i.test(PAST()[2]||PAST()[0]||'') ? '' : ' Edition'}`, items:[{},{},{},{}], from:14, tr:'Past editions'}),
   T.cta({kicker:pick('Your work could be next', 'Join them in print', 'Be in the next book')}),
 ], caption:() => `Their work is in print. Yours could be next, in the ${N()}.

These artists were published in our ${PAST().join(', ')} editions. Every artist is credited on the slides.

The ${N()} open call has ${SEL()} places.
${kwLine()}
${closeLn()}

[Credit every artist here: Name · @handle]
${tags}`},
 {left:18, title:'Photograph your art for print', kind:'Carousel · education', slides:() => [
   T.hook({img:EX.dahlia, pos:'center 40%', tr:'For your submission', head:pick(`Applying to the ${name}? Photograph your work like this.`, `5 photo tips before you submit.`, `Shoot your work like this.`), sub:pick('Five steps that help the jury see your work properly. Save this.', 'Better photos, stronger entry. Save this.', 'Save this before you submit.')}),
   T.num({icon:'sun', n:'01', head:pick('Use daylight.', 'Find soft light.', 'Light it naturally.'), text:pick('Near a window, out of direct sun. Avoid flash and yellow indoor light.', 'Shoot by a window on a bright day. No flash.', 'Daylight shows true colour. Indoor bulbs turn it yellow.'), tr:'Photo tips'}),
   T.num({icon:'level', n:'02', head:pick('Shoot straight on.', 'Keep it square.', 'Face the work.'), text:pick('Camera parallel to the work, centred, so nothing looks tilted or stretched.', 'Hold the camera level and centred so the edges stay straight.', 'Stand square to the work so nothing looks warped.'), tr:'Photo tips', ground:'ink'}),
   T.num({icon:'crop', n:'03', head:pick('Fill the frame.', 'Crop it clean.', 'Only the artwork.'), text:pick('Crop to the artwork only. No walls, easels or hands.', 'Crop out the wall, the easel and your hands.', 'Let the work fill the whole photo.'), tr:'Photo tips'}),
   T.num({icon:'drop', n:'04', head:pick('Keep true colour.', 'Skip the filters.', 'Match the real thing.'), text:pick('No filters. Compare the photo to the artwork before you send it.', 'Filters change your colours. Leave them off.', 'Hold the photo next to the work. Do they match?'), tr:'Photo tips', ground:'ink'}),
   T.num({icon:'grid', n:'05', head:pick('Send it large.', 'Go full resolution.', 'Big files print better.'), text:pick('Use the highest resolution your camera allows. Print needs detail.', 'Send the original file, not a screenshot.', 'Print needs detail. Send the largest file you have.'), tr:'Photo tips'}),
   T.cta({kicker:pick('Photos ready? Submit them', 'Photos ready? Submit now', 'Shot it? Submit it')}),
 ], caption:() => `Applying to the ${N()}? Photograph your artworks like this:

1. Daylight, near a window, no flash
2. Straight on, centred
3. Crop to the artwork only
4. True colour, no filters
5. The highest resolution you have

Save this for your submission.
${kwLine()}
${closeLn()}

${tags}`},

 {left:15, title:'15 days left', kind:'Carousel · countdown', slides:() => [
   T.count({img:ART[1], pos:'center 40%', big:'15', unit:'days left', tr:'Halfway', info:pick(`Halfway to the deadline. ${sel} artists will be published in a juried hardcover book.`, `Halfway. ${sel} places still open.`, `15 days. ${sel} places.`)}),
   T.value(),
   T.stakes(),
   T.howto(),
   T.cta({kicker:'15 days left', head:pick(`Start your submission<br>to the ${name}.`, `Halfway there.<br>Start today.`, `15 days left.<br>Apply now.`)}),
 ], caption:() => `Halfway. 15 days left to apply to the ${N()} open call.

${SEL()} places. Every eligible submission is reviewed, and selected artists are published, sold worldwide and introduced to collectors, galleries and curators.

How to apply:
1. ${kwLine()}
2. Prepare your ${state.themeWork === 'best work' ? 'best' : (state.theme || '').toLowerCase() + '-themed'} artworks
3. Submit by ${dl().getDate()} ${MONTHS_L[dl().getMonth()]}

${tags}`},
 {left:14, title:'2 weeks left', kind:'Carousel · countdown', slides:() => [
   T.count({img:ART[3], big:'2', unit:'weeks left'}),
   T.themeRecap(), T.cta({ground:'cream'}),
 ], caption:() => `Two weeks left to apply to the ${N()} open call.

${themeTag()}${KINDS().slice(0,4).map(k => k[0]).join(', ')}: all of it counts.
${kwLine()}
${closeLn()}

${tags}`},

 {left:13, title:'From submission to print', kind:'Carousel · artist story', slides:() => [
   T.hook({img:ART[4], pos:'center 40%', tr:'An artist’s story', head:pick(`Submit to the ${name} and see your work in print.`, `From submission to print.`, `One entry. One printed page.`), size:76, sub:pick('How one past artist went from submission to a published page.', 'One artist’s path into the book.', 'See how it happened.')}),
   T.quote({tr:'An artist’s story'}),
   T.photo({key:'phStoryWork', img:null, label:'Real photo needed<br>The artwork they submitted', tr:'An artist’s story', head:'The work they sent.', sub:gap(state.storyWork,'Title, medium, and why they chose it')}),
   T.photo({key:'phStoryPage', img:null, label:'Real photo needed<br>Their page in the book', tr:'An artist’s story', head:'The page it became.', sub:gap(state.storyAfter,'Edition and what happened next'), ground:'ink'}),
   T.howto(),
   T.cta({kicker:pick('Your page could be next', 'Your turn', 'Start yours today')}),
 ], caption:() => `Submit to the ${N()} and see your work in print.

[Artist name] submitted [artwork] to the [Edition]. Here is the page it became, and what happened next, in their words.

The ${N()} open call is open now, with ${SEL()} places.
${kwLine()}
${closeLn()}

${tags}`},
 {left:12, title:'How selection works', kind:'Carousel · trust', slides:() => [
   T.hook({img:ART[1], pos:'center 40%', tr:'Selection', head:pick(`How ${sel} artists are selected for the ${name}.`, `How the jury picks ${sel} artists.`, `How selection works.`), sub:pick('What happens to your submission, step by step.', 'From entry to book, in 3 steps.', '3 steps from entry to print.')}),
   T.num({icon:'eye', n:'01', head:pick('Every entry is reviewed.', 'Your entry is seen.', 'Nothing is skipped.'), text:`Each eligible submission is seen by ${state.jury ? esc(state.jury) : 'the jury'}, in full.`, tr:'Selection'}),
   T.num({icon:'target', n:'02', head:pick('What the jury looks for.', 'What stands out to the jury.', 'What the jury wants to see.'), text:esc(state.juryLooks || ''), tr:'Selection', ground:'ink'}),
   T.num({icon:'people', n:'03', head:`${sel} are selected.`, text:'Chosen to work together as one collection, not ranked against each other.', tr:'Selection'}),
   T.next({ground:'ink'}),
   T.cta({kicker:pick('Send your best work', 'Send your strongest work', 'Send your best')}),
 ], caption:() => `How ${SEL()} artists are selected for the ${N()}.

Every eligible submission is reviewed. The jury looks for: ${state.juryLooks} ${SEL()} artists are selected to work together as one collection.

12 days left.
${kwLine()}
${closeLn()}

${tags}`},

 {left:10, title:'10 days left', kind:'Carousel · countdown', slides:() => [
   T.count({img:ART[0], pos:'center 15%', big:'10', unit:'days left'}),
   T.value({ground:'call', art:ART[2]}), T.cta({ground:'cream', head:pick(`Your place in the<br>${name} is open.`, `10 days to claim<br>your place.`, `Claim your<br>place now.`)}),
 ], caption:() => `10 days left to apply to the ${N()} open call.

${SEL()} artists will be published in a juried hardcover book, sold worldwide and shared with collectors, galleries and curators.
${kwLine()}
${closeLn()}

${tags}`},

 {left:9, title:'Prepare your artworks', kind:'Carousel · ease + urgency', slides:() => [
   T.count({img:ART[2], pos:'center 40%', big:'9', unit:'days to prepare', line:`your submission to the ${esc(state.name)}`, info:pick('Everything you need is in this post. Save it and start today.', 'Save this checklist. Start today.', 'Start now. Submit early.')}),
   T.check({head:'Prepare your artworks.', tr:'Before you submit', items:[`Choose your strongest ${state.themeWork === 'best work' ? '' : (state.theme || '').toLowerCase() + '-themed '}works`,'Photograph each one in daylight, straight on','Note title, medium and size for each','Add your name and country','Submit through your link or the link in bio'], top:420, foot:'Most artists finish in about ten minutes.'}),
   T.howto(),
   T.value({ground:'cream', art:ART[0]}),
   T.cta({kicker:'9 days left', head:pick(`Submit to the<br>${name} today.`, `Get it done<br>this week.`, `9 days.<br>Start today.`)}),
 ], caption:() => `9 days to prepare your submission to the ${N()}.

☐ Choose your strongest ${state.themeWork === 'best work' ? '' : (state.theme || '').toLowerCase() + '-themed '}works
☐ Photograph each one in daylight
☐ Note title, medium and size
☐ Add your name and country

Most artists finish in about ten minutes. Don't leave it to the last day.
${kwLine()}
${closeLn()}

${tags}`},
 {left:8, title:'Next on the shelf', kind:'Carousel · proof', slides:() => [
   T.hook({img:ART[3], tr:'The collection', head:pick(`Get your work on our shelf: the ${name} is open.`, `Your book could be next on our shelf.`, `Get your work on our shelf.`), size:76, sub:pick(`${sel} artists will join the next book in the series.`, `${sel} artists. One new book.`, `${sel} places in the next edition.`)}),
   T.photo({key:'phPast1', img:null, label:`Real photo needed<br>${esc(PAST()[0] || 'A past edition')}`, tr:'The collection', head:`${esc(PAST()[0] || 'A past edition')}: published.`, size:64, subTop:1080, sub:`Seen through ${esc(state.distribution || 'Amazon, Barnes & Noble and the ATH Shop')}.`}),
   T.photo({key:'phPast2', img:null, label:`Real photo needed<br>${esc(PAST()[1] || PAST()[0] || 'Another past edition')}`, tr:'The collection', head:`${esc(PAST()[1] || PAST()[0] || 'Another past edition')}: published.`, size:64, subTop:1080, sub:'Shared with collectors, galleries and curators.', ground:'ink'}),
   T.value({ground:'cream', art:ART[4]}),
   T.cta({kicker:pick('Be in the next one', 'Join the next book', 'Claim your spot')}),
 ], caption:() => `Get your work on our shelf: the ${N()} is open.

Our past editions (${PAST().join(', ')}) put their artists in print and in front of collectors, galleries and curators. The ${N()} is next, with ${SEL()} places.

${kwLine()}
${closeLn()}

${tags}`},
 {left:7, title:'One week left', kind:'Carousel · countdown', slides:() => [
   T.count({img:ART[4], pos:'center 40%', big:'One week', bigSize:200, bigTop:400, unit:'left', unitTop:640, info:pick(`One week to put your ${TW()} in print. ${sel} places, juried, worldwide.`, `7 days. ${sel} places.`, `Final week to apply.`)}),
   T.stakes({head:pick(`One week. ${sel} places.`, `${sel} places. 7 days.`, `7 days to apply.`)}),
   T.next(),
   T.cta({kicker:'7 days left', head:pick(`Your ${TW()},<br>in print.`, `One week<br>to apply.`, `Apply<br>this week.`), sub:`Apply to the ${name} open call before ${dateLong()}.`}),
 ], caption:() => `One week left to apply to the ${N()} open call.

${SEL()} places. Seven days to prepare your artworks and submit. Your work could be in the next book in the series.
${kwLine()}
${closeLn()}

${tags}`},
 {left:6, title:'Five mistakes to avoid', kind:'Carousel · education', slides:() => [
   T.hook({img:ART[0], pos:'center 30%', tr:'Before you submit', head:pick(`Applying to the ${name}? Avoid these 5 mistakes.`, `5 mistakes to avoid.`, `Don’t make these 5 mistakes.`), size:76, sub:pick('Six days left to get your submission right. Save this.', 'Check yours before you submit. Save this.', '6 days to get it right. Save this.')}),
   T.num({icon:'blur', n:'01', head:pick('A blurry or tilted photo.', 'A poor photo.', 'Photos that hide the work.'), text:pick('The jury can only judge what they can see.', 'If it is blurry, the jury cannot see your skill.', 'A sharp, straight photo lets the work speak.'), tr:'Avoid this', ground:'ink'}),
   T.num({icon:'filter', n:'02', head:pick('Filters and editing.', 'Changing the colours.', 'Heavy editing.'), text:pick('If the colours are wrong, the work is misread.', 'The jury needs to see the work as it is.', 'Edits can make the work look like something else.'), tr:'Avoid this'}),
   T.num({icon:'target', n:'03', head: state.themeWork === 'best work' ? 'A body of work without focus.' : 'Ignoring the theme.', text:state.theme && state.themeWork !== 'best work' ? `Show us your reading of the ${(state.theme||'').toLowerCase()} theme, however personal.` : 'Send work that shows your own voice clearly.', tr:'Avoid this', ground:'ink'}),
   T.num({icon:'star', n:'04', head:pick('Holding back your best work.', 'Sending safe work.', 'Second-best pieces.'), text:pick('Send the pieces you are proudest of.', 'Lead with the work you love most.', 'Your strongest piece is the one to send.'), tr:'Avoid this'}),
   T.num({icon:'clock', n:'05', head:pick('Waiting for the last day.', 'Leaving it too late.', 'Rushing at the deadline.'), text:pick('Submit early and get it off your list.', 'Last-minute uploads lead to mistakes.', 'Give yourself time to check everything.'), tr:'Avoid this', ground:'ink'}),
   T.cta({kicker:pick('Six days left', '6 days to fix it', '6 days to apply')}),
 ], caption:() => `Applying to the ${N()}? Avoid these 5 mistakes:

1. A blurry or tilted photo
2. Filters and editing
3. Ignoring the theme
4. Holding back your best work
5. Waiting for the last day

${kwLine()}
${closeLn()}

${tags}`},
 {left:5, title:'5 days left', kind:'Carousel · countdown', slides:() => [
   T.count({img:ART[2], pos:'center 40%', big:'5', unit:'days left', info:pick(`Five days to get your ${TW()} into the ${GE()}.`, `5 days. ${sel} places.`, `5 days to submit.`)}),
   T.howto({ground:'ink'}),
   T.cta({kicker:pick('5 days left', '5 days to go', 'Apply this week')}),
 ], caption:() => `5 days left to apply to the ${N()} open call.

1. ${kwLine()}
2. Prepare your ${state.themeWork === 'best work' ? 'best' : (state.theme || '').toLowerCase() + '-themed'} artworks
3. Submit by ${dl().getDate()} ${MONTHS_L[dl().getMonth()]}

${tags}`},
 {left:4, title:'Why artists apply', kind:'Carousel · motivation', slides:() => [
   T.hook({img:ART[0], pos:'center 15%', tr:'Why artists apply', head:pick(`What getting published in the ${name} does for your career.`, `Why artists apply.`, `What a juried book does for you.`), size:72, sub:pick('Four days left to apply to the open call.', '4 reasons. 4 days left.', '4 days left to apply.')}),
   T.num({icon:'book', n:'01', head:pick('An independent signal of quality.', 'Proof someone chose your work.', 'A credit that carries weight.'), text:'A juried publication is a judgement made by someone else. Curators, residencies and grant panels read it that way.', tr:'Why artists apply'}),
   T.num({icon:'eye', n:'02', head:pick('Your work travels beyond your feed.', 'Seen far beyond Instagram.', 'Your work reaches new places.'), text:`Your work reaches people through ${esc(state.distribution || 'Amazon, Barnes & Noble and the ATH Shop')}, worldwide.`, tr:'Why artists apply', ground:'ink'}),
   T.num({icon:'people', n:'03', head:pick('One book, many first introductions.', 'Introduced to people who buy art.', 'New doors, one book.'), text:'Each edition is introduced to collectors, galleries and curators through our network.', tr:'Why artists apply'}),
   T.num({icon:'star', n:'04', head:pick('Read in context, not in a scroll.', 'Seen slowly, on paper.', 'Part of a collection, not a feed.'), text:`Shown alongside ${Number(state.selected) - 1 || 100} other artists responding to the same theme, your work becomes part of a conversation.`, tr:'Why artists apply', ground:'ink'}),
   T.quote({tr:'Why artists apply'}),
   T.cta({kicker:pick('Four days left', '4 days to apply', 'Apply in 4 days')}),
 ], caption:() => `What getting published in the ${N()} does for your career:

· An independent signal of quality that curators and grant panels recognise
· Your work sold worldwide, beyond your feed
· Introductions to collectors, galleries and curators
· Your work read in context, alongside artists responding to the same theme

Four days left.
${kwLine()}

${tags}`},
 {left:3, title:'3 days left', kind:'Carousel · countdown', slides:() => [
   T.count({img:ART[1], pos:'center 40%', big:'3', unit:'days left', info:pick(`Three days to take one of ${sel} places in the next book.`, `3 days. ${sel} places.`, `Your last 3 days.`)}),
   T.stakes({head:pick(`${sel} places. Three days.`, `3 days. ${sel} places.`, `The final 3 days.`)}),
   T.quote({tr:'From past editions'}),
   T.cta({kicker:'3 days left', head:pick(`Take your place in the<br>${name}.`, `3 days<br>to apply.`, `Don’t<br>miss it.`), size:84, sub:pick('Submissions close in three days. Most artists finish in about ten minutes.', 'Closes in 3 days. About 10 minutes to apply.', '3 days left. 10 minutes to apply.')}),
 ], caption:() => `3 days left to apply to the ${N()} open call.

${SEL()} places in the next book. Most artists finish their submission in about ten minutes.
${kwLine()}
${closeLn()}

${tags}`},
 {left:2, title:'48 hours: last questions', kind:'Carousel · countdown + doubts', slides:() => [
   T.count({img:ART[3], big:'48', unit:'hours left', info:pick('Your last questions about the open call, answered inside.', 'Last questions, answered.', '2 days left. Answers inside.')}),
   T.qa({q:'Is it too late to apply?', a:`No. Submissions are open until ${dateLong()}.`, more: CMODE() ? ctaSentence() : `${VERB} “${KW()}” and we’ll send you the brief and your link straight away.`, ground:'cream', tr:'Last questions'}),
   T.qa({q:'How long does it take?', a:'About ten minutes.', more:'Have your photos, titles, medium and sizes ready, then submit through the link in bio.', tr:'Last questions', ground:'call'}),
   T.qa({q:'Will my work really be seen?', a:'Every eligible entry is reviewed by the jury.', more:'Selected work is published, sold worldwide and shared with collectors, galleries and curators.', ground:'ink', tr:'Last questions'}),
   T.qa({q:'Can I submit more than one artwork?', a:gap(state.multiArt,'Confirm the rule'), more:'Choose the works that best represent you.', ground:'cream', tr:'Last questions'}),
   T.cta({kicker:pick('48 hours left', '2 days to apply', 'Last 48 hours')}),
 ], caption:() => `48 hours left. Your last questions about the ${N()} open call:

· Too late? No, submissions are open until ${dl().getDate()} ${MONTHS_L[dl().getMonth()]}.
· How long does it take? About ten minutes.
· Will my work be seen? Every eligible entry is reviewed by the jury.

${kwLine()}

${tags}`},

 {left:1, title:'24 hours left', kind:'Carousel · countdown', slides:() => [
   T.count({img:ART[0], pos:'center 15%', big:'24', unit:'hours left', info:pick('Submissions close tomorrow. This is your reminder.', 'Closes tomorrow.', '1 day left.')}),
   T.brief({head:pick('Everything you need, in one place.', 'Your last-day checklist.', 'All you need to submit.')}),
   T.cta({head:pick(`24 hours to apply.`, `Closes tomorrow.`, `1 day left.`)}),
 ], caption:() => `24 hours left to apply to the ${N()} open call.

Everything you need is in this post. ${kwLine()}

${tags}`},

 {left:0, title:'Last day', kind:'Carousel · last call', slides:() => [
   T.urgent({head:pick('Last<br>day.', 'Final<br>day.', 'Closes<br>tonight.'), sub:pick('Submissions close at midnight tonight.', 'The open call closes tonight.', 'Last chance to submit.'), tr:'Last day'}),
   T.brief(),
   T.cta({head:pick('Apply today.', 'Submit today.', 'Apply now.')}),
 ], caption:() => `Last day to apply to the ${N()} open call.

Submissions close at midnight tonight. ${SEL()} artists will be selected and published in a juried hardcover book.
${kwLine()}

${tags}`},

 {left:0, title:'Final hours', kind:'Single · last call', slides:() => [
   T.urgent({chilli:true, head:pick('Closes<br>tonight.', 'Final<br>hours.', 'Last<br>call.'), sub:pick('Final hours to submit. The jury starts tomorrow.', 'Hours left to submit.', 'Submit now.'), tr:'Final hours'}),
 ], caption:() => `Final hours. The ${N()} open call closes at midnight tonight.

${kwLine()}

${tags}`},
];}

// ---------- stories (1080 x 1920) ----------
function storyFrame(o){
  const g = o.ground ? G[o.ground]() : {bg:INK, fg:WHITE, acc:tint(state.colour)};
  const zone = o.zone ? `<div class="a" style="left:140px;right:140px;top:${o.zoneTop||1260}px;height:${o.zoneH||200}px;border:3px dashed ${g.fg};border-radius:28px;opacity:.55;display:flex;align-items:center;justify-content:center;text-align:center;font-size:26px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:${g.fg}">${o.zone}</div>` : '';
  return {h:1920, bg:g.bg, html:`
    ${o.img ? imgDiv(o.img,'inset:0',o.pos||'center 30%') + `<div class="a" style="inset:0;background:linear-gradient(180deg,rgba(20,9,12,.55) 0%,rgba(20,9,12,0) 22%,rgba(20,9,12,0) 45%,rgba(20,9,12,.85) 72%,rgba(20,9,12,.95) 100%)"></div>` : ''}
    <p class="a cn" style="left:64px;top:250px;color:${g.fg}">Arts to Hearts Project</p><p class="a cn" style="right:64px;top:250px;color:${g.fg}">${esc(o.tr||state.name)}</p>
    ${o.kicker ? `<p class="a lab" style="left:80px;top:${o.top||820}px;color:${g.acc}">${esc(o.kicker)}</p>` : ''}
    <p class="a H" style="left:76px;right:80px;top:${(o.top||820)+50}px;font-size:${o.size||110}px;color:${g.fg}">${o.head}</p>
    ${o.sub ? `<p class="a sub" style="left:80px;right:120px;top:${o.subTop||((o.top||820)+330)}px;color:${g.fg};opacity:.9">${o.sub}</p>` : ''}
    ${zone}`};
}
// ---------- REELS: photoshoot-led, calm and premium; the end card does the selling ----------
// Each beat is a 1080x1920 frame: a full-bleed photo (slot "rl<reel><beat>") with a few words on top.
const daysToGo = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return Math.max(0, Math.round((dl() - t) / 864e5)); };
const rlPhoto = (k) => state.images[k] || '';
function rlPh(i){ const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><rect width="1080" height="1920" fill="#2b2124"/><rect x="60" y="60" width="960" height="1800" rx="28" fill="none" stroke="#f9ece5" stroke-opacity=".45" stroke-width="4" stroke-dasharray="18 14"/><text x="540" y="560" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="50" fill="#f9ece5" fill-opacity=".75" letter-spacing="6">PHOTOSHOOT ${i}</text><text x="540" y="630" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#f9ece5" fill-opacity=".55">Click or drop a photo from a past edition</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29'); }
function reelBeat(o){ const k = o.key; const src = rlPhoto(k) || rlPh(o.n);
  const shade = `<div class="a" style="inset:0;background:linear-gradient(180deg,rgba(20,9,12,.55) 0%,rgba(20,9,12,0) 24%,rgba(20,9,12,0) 52%,rgba(20,9,12,.78) 78%,rgba(20,9,12,.9) 100%)"></div>`;
  const kick = o.kicker ? `<p class="a lab" style="left:90px;right:90px;top:${o.top - 70}px;color:${tint(state.colour)}">${o.kicker}</p>` : '';
  const html = `<div data-slot="${k}" class="a img" style="inset:0;background-image:url(${src});background-position:center"></div>${shade}
    <p class="a cn" style="left:64px;top:250px;color:${WHITE}">Arts to Hearts Project</p>
    ${kick}<p class="a H" style="left:86px;right:90px;top:${o.top}px;font-size:${o.size || 96}px;color:${WHITE}">${o.text}</p>
    ${o.sub ? `<p class="a sub" style="left:90px;right:120px;top:${o.subTop || o.top + 300}px;font-size:40px;color:${WHITE};opacity:.92">${o.sub}</p>` : ''}`;
  return {h:1920, bg:INK, html, dur:o.dur || 2.6, photoKey:k};
}
function reelEnd(n){ const g = G.call();
  return {h:1920, bg:g.bg, dur:3.4, html:`<p class="a cn" style="left:64px;top:250px;color:${g.fg}">Arts to Hearts Project</p>
    <p class="a lab" style="left:0;right:0;top:620px;text-align:center;color:${g.acc}">Open call · closes ${dateLong()}</p>
    <p class="a c scr" style="left:40px;right:40px;top:680px;font-size:${String(state.name).length > 18 ? 110 : 140}px;line-height:1;color:${g.fg}">${esc(state.name)}</p>
    <div class="a" style="left:130px;right:130px;top:1060px;height:130px;border-radius:999px;background:${CREAM};color:${BURG};display:flex;align-items:center;justify-content:center;font-size:46px;font-weight:700;letter-spacing:-.02em">${CMODE() ? 'Apply via link in bio' : esc(VERB) + ' “' + KW() + '” to apply'}</div>
    <p class="a c" style="left:0;right:0;top:1230px;font-size:36px;color:${g.fg};opacity:.9">${CMODE() ? `or comment “${KW()}” for the link` : 'or apply via link in bio'}</p>`}; }
const REELS = [
  {id:'R1', name:'Open the book', goal:'Brand + conversion', len:'15 s', audio:'Calm instrumental. Add a soft page-turn sound on each cut.',
   tip:'Post on a weekday evening. Use the first beat as the cover.', beats: () => [
    reelBeat({key:'rl1a', n:1, kicker:'Open call · ' + esc(state.editionLabel || ''), text:'Your work could be in here.', top:1240}),
    reelBeat({key:'rl1b', n:2, text:'A juried hardcover book.', top:1300}),
    reelBeat({key:'rl1c', n:3, text:`${esc(SEL())} artists. Printed and sold worldwide.`, top:1240, size:88}),
    reelBeat({key:'rl1d', n:4, text:'Every page credited to its artist.', top:1240, size:88}),
    reelEnd()],
   caption: () => `Your work could be in here. ${SEL()} artists will be published in the ${N()}, a juried hardcover book sold worldwide.\n\n${kwLine()}\n${closeLn()}\n\n${tags}`},
  {id:'R2', name:'After you hit submit', goal:'Trust: shows the process', len:'16 s', audio:'Minimal piano or ambient. Cut on the beat.',
   tip:'Pin a comment answering the most common question.', beats: () => [
    reelBeat({key:'rl2a', n:1, text:'What happens after you hit submit?', top:1240}),
    reelBeat({key:'rl2b', n:2, kicker:'Step 1', text:'The jury reviews every eligible entry.', top:1240, size:88}),
    reelBeat({key:'rl2c', n:3, kicker:'Step 2', text:`${esc(SEL())} artists are selected.`, top:1300}),
    reelBeat({key:'rl2d', n:4, kicker:'Step 3', text:'Their work is printed in a hardcover book.', top:1240, size:88}),
    reelEnd()],
   caption: () => `What happens after you submit to the ${N()}? The jury reviews every eligible entry, ${SEL()} artists are selected, and their work is printed in a hardcover book.\n\n${kwLine()}\n${closeLn()}\n\n${tags}`},
  {id:'R3', name:'Holding their copy', goal:'Proof: a real published artist', len:'12 s', audio:'Warm acoustic. Let the photo breathe.',
   tip:'Tag the artist and ask them to share it to their story.', beats: () => { const a = PAST_ARTISTS()[0] || []; return [
    reelBeat({key:'rl3a', n:1, text:'From an Instagram post to a printed page.', top:1240, size:88}),
    reelBeat({key:'rl3b', n:2, text:`“${gap('', 'One real line from the artist')}”`, sub:`${gap(a[0], 'Artist name')} · ${gap(a[1], 'Edition')}`, top:1200, size:80, subTop:1560}),
    reelEnd()]; },
   caption: () => `From an Instagram post to a printed page. Your work could be next in the ${N()}.\n\n${kwLine()}\n${closeLn()}\n\n${tags}`},
  {id:'R4', name:'Days left', goal:'Urgency without shouting', len:'10 s', audio:'Upbeat but clean. Fast cuts.',
   tip:'Re-post this in the final week with the new number.', beats: () => [
    reelBeat({key:'rl4a', n:1, text:`${daysToGo()} days left.`, top:1200, size:150, dur:2.2}),
    reelBeat({key:'rl4b', n:2, text:`${esc(SEL())} places.`, top:1300, size:120, dur:2.2}),
    reelBeat({key:'rl4c', n:3, text:'One hardcover book.', top:1300, size:110, dur:2.2}),
    reelEnd()],
   caption: () => `${daysToGo()} days left to apply to the ${N()}. ${SEL()} places in a juried hardcover book.\n\n${kwLine()}\n${closeLn()}\n\n${tags}`},
  {id:'R5', name:'POV: you find your page', goal:'Desire: the moment of being published', len:'12 s', audio:'Trending soft audio. Slow zoom on the page.',
   tip:'Use your best close-up of an open spread for the first beat.', beats: () => [
    reelBeat({key:'rl5a', n:1, kicker:'POV', text:'You open the book and find your work.', top:1240, size:88}),
    reelBeat({key:'rl5b', n:2, text:'Your name. Your title. Your page.', top:1240, size:88}),
    reelBeat({key:'rl5c', n:3, text:'It starts with one submission.', top:1240, size:88}),
    reelEnd()],
   caption: () => `POV: you open the book and find your work. It starts with one submission to the ${N()}.\n\n${kwLine()}\n${closeLn()}\n\n${tags}`},
  {id:'R6', name:'3 reasons to submit', goal:'Value: why it is worth it', len:'15 s', audio:'Clean beat. One reason per cut.',
   tip:'Save-worthy: ask people to save it for later.', beats: () => [
    reelBeat({key:'rl6a', n:1, text:'3 reasons artists submit.', top:1300}),
    reelBeat({key:'rl6b', n:2, kicker:'1', text:'A juried credit for your CV.', top:1300}),
    reelBeat({key:'rl6c', n:3, kicker:'2', text:'Your work in print, sold worldwide.', top:1240, size:88}),
    reelBeat({key:'rl6d', n:4, kicker:'3', text:'Seen by collectors, galleries and curators.', top:1240, size:88}),
    reelEnd()],
   caption: () => `3 reasons artists submit to the ${N()}: a juried credit for your CV, your work in print sold worldwide, and a book seen by collectors, galleries and curators.\n\n${kwLine()}\n${closeLn()}\n\nSave this for later.\n\n${tags}`},
];

// ---------- COPY BANK: tested alternatives for key lines. No AI calls: variety and suggestions come from here ----------
// Tokens: {S} artists selected · {D} deadline · {K} keyword · {W} who · {NG} edition name in the script font (auto-variety only)
const COPY = {
  coverline: ['Get published in a juried hardcover book of {S} artists.', 'Be one of {S} artists in a juried hardcover book.', '{S} artists. One hardcover book. Will yours be in it?', 'Your work, in a hardcover book with {S} artists.'],
  inprint: ['Your work, in print.', 'See your work in print.', 'Your name in a hardcover book.', 'Printed, bound, yours.'],
  receive: ['What selected artists receive', 'What you get if selected', 'If you are selected'],
  howto: ['How to apply', 'Apply in three steps', 'Three steps to apply'],
  swipe: ['Swipe through today’s post.', 'New on the feed today.', 'Today’s post is up.', 'Don’t miss today’s post.'],
  e2sub: ['to apply to the {NG}. {S} artists will be published.', 'until the {NG} closes. Make them count.', 'to get your work into the {NG}.', 'to claim one of {S} places in the {NG}.'],
  quizq: ['Which of these can you submit?', 'Does your work fit the theme?', 'Quick quiz: what can you submit?'],
  thisthat: ['Which would you submit?', 'Which one would you send in?', 'Pick the one you’d submit.'],
  q_ask: ['Anything you want to know before you apply?', 'What’s stopping you from applying?', 'Ask us anything about the open call.', 'Got a question before you submit?'],
  published: ['Published. Your turn.', 'Their work is in print. Yours could be next.', 'Next edition, it could be you.'],
  insidebook: ['Juried. Printed. Sold worldwide.', 'A real hardcover book, sold worldwide.', 'Printed, bound and on shelves worldwide.'],
  tip1: ['Photograph your work in daylight, straight on.', 'Shoot your work in soft daylight, no flash.', 'Crop out the background. Let the work fill the frame.', 'Shoot straight on so the edges stay square.'],
  tipsub: ['No filters. Print needs true colour.', 'True colour matters in print.', 'Clear photos help the jury see your work.', 'A sharp photo is half the submission.'],
  ready: ['How ready is your submission?', 'How close are you to submitting?', 'Where are you with your submission?'],
  oneweek: ['One week left.', 'Seven days left.', 'The final week.'],
  h48: ['48 hours left.', 'Two days left.', 'Just 48 hours.'],
  lastchance: ['Last chance.', 'It closes tomorrow.', 'One day left.'],
  tonight: ['Closes tonight.', 'Final day.', 'Today is the day.'],
  hours: ['Hours left to apply.', 'Final hours.', 'It closes in a few hours.'],
  beforesubmit: ['Before you submit:', 'Your final checklist:', 'Ready to submit? Check:'],
  thanks: ['Thank you to every artist who applied.', 'Submissions are closed. Thank you for every entry.', 'That’s a wrap. Thank you to every artist who applied.'],
  pubartists: ['Published artists', 'Artists in our books', 'From our past editions'],
  pubsub: ['A few of the artists in our books.', 'Artists from our past editions.', 'Real artists. Real pages.'],
  covers: ['Past cover artists', 'On the cover', 'Our cover artists'],
  coverssub: ['Their work became the face of the book.', 'Their art was chosen for the cover.', 'The artists behind our covers.'],
  ctasub: ['or comment “{K}” for the link', 'or comment “{K}” and we’ll send it', 'comment “{K}” for the link'],
  ctabtn: ['Apply via link in bio', 'Apply now · link in bio', 'Submit via link in bio'],
  willapply: ['Will you apply?', 'Are you in?', 'Is this your year?'],
  spotlight: ['Emerging, mid-career or established.', 'Every stage of your career is welcome.', 'New or established, your work belongs here.'],
};
const fillCopy = (s, html) => s.replace(/\{S\}/g, esc(state.selected || '')).replace(/\{D\}/g, dateLong()).replace(/\{K\}/g, KW()).replace(/\{W\}/g, esc(state.who || 'artists')).replace(/\{NG\}/g, html ? GE() : esc(state.name || ''));
// auto variety: the same template rotates its wording by day
const V = (id, seed) => { const a = COPY[id]; return fillCopy(a[Math.abs(seed | 0) % a.length], true); };
// suggestions: if a text on a slide matches a line in the bank, offer the other versions
const normT = t => String(t).replace(/[​\s]+/g, ' ').trim().toLowerCase();
function copyAlternatives(text){ const n = normT(text); if (!n) return null;
  for (const [id, list] of Object.entries(COPY)) { if (list.some(v => v.includes('{NG}'))) continue; const filled = list.map(v => fillCopy(v, false).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'));
    const i = filled.findIndex(f => normT(f) === n); if (i >= 0) return {id, list: filled, idx: i}; }
  return null; }

// ---------- STORIES: a template library, a day-by-day sequence for this call, and one plan across all calls ----------
// Every day ends on a link sticker. Stories carry the link sticker, so they are the shortest path to applying.
const stImg = (k, fb) => state.images[k] || fb;
const stDiv = (k, fb, style, pos) => `<div data-slot="${k}" class="a img" style="${style};background-image:url(${stImg(k, fb)});background-position:${pos || 'center'}"></div>`;
const stPh = (k, label, style, col) => state.images[k] ? stDiv(k, '', style + ';border-radius:22px') : `<div data-slot="${k}" class="a ph" style="${style};color:${col}">${label}</div>`;
const zoneAt = (label, top, h, col) => `<div class="a" style="left:140px;right:140px;top:${top}px;height:${h || 190}px;border:3px dashed ${col};border-radius:28px;opacity:.55;display:flex;align-items:center;justify-content:center;text-align:center;font-size:30px;font-weight:600;line-height:1.35;padding:0 30px;color:${col}">${label}</div>`;
const stTop = (fg, tr) => `<p class="a cn" style="left:64px;top:250px;color:${fg}">Arts to Hearts Project</p><p class="a cn" style="right:64px;top:250px;color:${fg}">${esc(tr || state.name)}</p>`;
const LINK = 'Link sticker: Apply';
const CHILLI = '#AA0003';
function sFrame(ground, html, bg){ const g = G[ground](); return decorate({h:1920, bg: bg || g.bg, html}); }
const STORY_T = {
  L1: {phase:'Launch day', name:'It’s open', sticker:LINK, make: () => storyFrame({img:state.images.imgCover, pos:'center 10%', kicker:'Open call · ' + (state.editionLabel || 'Edition ' + state.edition), head:`The ${GE()} is open.`, sub:`${esc(SEL())} artists will be published. Closes ${dateLong()}.`, top:1000, zone:LINK, zoneTop:1500})},
  L2: {phase:'Launch day', name:'What you get', sticker:'none', make: (sd = 0) => { const g = G.cream(); const rows = lines(state.benefits).slice(0, 4).map(l => l.split('|').map(x => x.trim()));
    return sFrame('cream', `${stTop(g.fg, 'If selected')}<p class="a lab" style="left:80px;top:430px;color:${g.acc}">What selected artists receive</p>
      <p class="a H" style="left:76px;right:80px;top:480px;font-size:96px;color:${g.fg}">${V('inprint', sd)}</p>
      <div class="a" style="left:80px;right:80px;top:760px;color:${g.fg}">${rows.map(([t, d]) => `<div style="padding:30px 0;border-top:2px solid ${g.line}"><p style="font-size:44px;font-weight:600;letter-spacing:-.01em">${esc(t)}</p>${d ? `<p style="font-size:30px;opacity:.7;margin-top:8px">${esc(d)}</p>` : ''}</div>`).join('')}</div>`); }},
  L3: {phase:'Launch day', name:'Will you apply?', sticker:'Poll: Yes, I’m in / Thinking about it', make: () => storyFrame({ground:'call', kicker:'New edition', head:`${esc(SEL())} places.<br>Will you apply?`, top:560, zone:'Poll sticker:<br>Yes, I’m in / Thinking about it', zoneTop:1120})},
  L4: {phase:'Launch day', name:'How to apply', sticker:LINK + ' + countdown', make: (sd = 0) => { const g = G.ink();
    const steps = CMODE() ? [['Tap the link sticker', `Or comment “${KW()}” on our latest post for the link.`], ['Choose your best work', `Your strongest ${esc(state.themeWork === 'best work' ? 'work' : (state.theme || 'work').toLowerCase())}, photographed in daylight.`], ['Submit by ' + dateLong(), 'It takes about ten minutes.']]
      : [[`DM “${KW()}”`, 'We send you the brief and your link.'], ['Choose your best work', 'Photographed in daylight, straight on.'], ['Submit by ' + dateLong(), 'It takes about ten minutes.']];
    return sFrame('ink', `${stTop(g.fg, 'How to apply')}<p class="a H" style="left:76px;right:80px;top:420px;font-size:100px;color:${g.fg}">${V('howto', sd)}</p>
      <div class="a" style="left:80px;right:80px;top:640px;color:${g.fg}">${steps.map(([t, d], i) => `<div style="display:flex;gap:34px;padding:30px 0;border-top:2px solid ${g.line}"><span style="font-size:60px;font-weight:300;color:${g.acc};width:70px;flex:none">${i + 1}</span><div><p style="font-size:44px;font-weight:600">${t}</p><p style="font-size:30px;opacity:.7;margin-top:8px;line-height:1.35">${d}</p></div></div>`).join('')}</div>
      ${zoneAt('Link sticker: Apply<br>Countdown sticker: closes ' + short(), 1390, 210, g.fg)}`); }},
  E1: {phase:'Every day', name:'Share today’s post', sticker:'The shared post, then ' + LINK, make: (sd = 0) => { const g = G.cream();
    return sFrame('cream', `${stTop(g.fg, 'New post')}<p class="a lab" style="left:80px;top:400px;color:${g.acc}">New on the feed</p><p class="a H" style="left:76px;right:80px;top:450px;font-size:88px;color:${g.fg}">${V('swipe', sd)}</p>
      ${zoneAt('Share today’s feed post here<br>(paper plane on the post → Add to story)', 700, 760, g.fg)}${zoneAt(LINK, 1500, 130, g.fg)}`); }},
  E2: {phase:'Every day', name:'Days left', sticker:LINK + ' + countdown', make: (n = 21) => { const ground = n % 2 ? 'ink' : 'call'; const g = G[ground]();
    return sFrame(ground, `${stTop(g.fg, leftLabel(n))}<p class="a" style="left:70px;top:430px;font-size:420px;font-weight:300;letter-spacing:-.05em;line-height:1;color:${g.fg}">${n}</p>
      <p class="a" style="left:80px;top:900px;font-size:72px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;color:${g.acc}">${n === 1 ? 'day left' : 'days left'}</p>
      <p class="a sub" style="left:80px;right:120px;top:1000px;font-size:40px;color:${g.fg}">${V('e2sub', n)}</p>
      ${zoneAt('Link sticker: Apply<br>Countdown sticker', 1300, 200, g.fg)}`); }},
  E3: {phase:'Every day', name:'Theme quiz', sticker:'Quiz', make: (sd = 0) => { const k = KINDS().slice(0, 3).map(x => x[0]);
    return storyFrame({img:state.images.imgTheme, pos:'center 40%', kicker:'Quiz', head:V('quizq', sd), sub:`${k.join(', ')}: the answer is all of them.`, top:960, subTop:1260, zone:`Quiz sticker: ${k.join(' / ')} / All of them`, zoneTop:1420}); }},
  E4: {phase:'Every day', name:'This or that', sticker:'Poll: Left / Right', make: (sd = 0) => { const g = G.cream();
    return sFrame('cream', `${stTop(g.fg, 'This or that')}<p class="a H" style="left:76px;right:80px;top:400px;font-size:90px;color:${g.fg}">${V('thisthat', sd)}</p>
      ${stDiv('st4a', SAMPLE_ART[1], 'left:80px;top:680px;width:450px;height:600px;border-radius:22px', 'center 30%')}${stDiv('st4b', SAMPLE_ART[2], 'left:550px;top:680px;width:450px;height:600px;border-radius:22px', 'center 30%')}
      ${zoneAt('Poll sticker: Left / Right', 1330, 150, g.fg)}`); }},
  E5: {phase:'Every day', name:'Ask us', sticker:'Question box', make: (sd = 0) => storyFrame({ground:'call', kicker:'Ask us', head:V('q_ask', sd), top:520, zone:'Question box sticker:<br>Ask about the open call', zoneTop:1120, zoneH:260})},
  E6: {phase:'Every day', name:'You asked', sticker:LINK, make: () => { const g = G.ink();
    return sFrame('ink', `${stTop(g.fg, 'You asked')}<p class="a lab" style="left:80px;top:430px;color:${g.acc}">You asked</p>
      <p class="a ser" style="left:80px;right:80px;top:490px;font-size:80px;line-height:1.1;color:${g.fg}">“Do I keep the rights to my work?”</p>
      <p class="a sub" style="left:80px;right:100px;top:820px;font-size:44px;line-height:1.35;color:${g.fg}">${gap(state.rights, 'Confirm the rights wording')}</p>${zoneAt(LINK, 1400, 150, g.fg)}`); }},
  E7: {phase:'Every day', name:'Published artist', sticker:LINK, make: (sd = 0) => { const g = G.ink(); const a = PAST_ARTISTS()[0] || [];
    return sFrame('ink', `${stTop(g.fg, 'Published artist')}${paImg(0) ? `<div data-slot="pa1" class="a img" style="left:80px;right:80px;top:380px;height:760px;border-radius:22px;background-image:url(${paImg(0)});background-position:center"></div>` : `<div data-slot="pa1" class="a ph" style="left:80px;right:80px;top:380px;height:760px;color:${g.fg}">Their work</div>`}
      <p class="a" style="left:80px;top:1180px;font-size:48px;font-weight:600;color:${g.fg}">${gap(a[0], 'Artist name')}</p><p class="a" style="left:80px;top:1250px;font-size:32px;opacity:.7;color:${g.fg}">${gap(a[1], 'Edition · Country')}</p>
      <p class="a ser" style="left:80px;right:80px;top:1320px;font-size:46px;color:${g.acc}">${V('published', sd)}</p>${zoneAt(LINK, 1430, 130, g.fg)}`); }},
  E8: {phase:'Every day', name:'Inside the book', sticker:LINK, make: (sd = 0) => { const g = G.cream();
    return sFrame('cream', `${stTop(g.fg, 'Inside the book')}${stPh('imgSpread', 'Real photo needed<br>An open spread of the book', 'left:80px;right:80px;top:380px;height:820px', g.fg)}
      <p class="a H" style="left:76px;right:80px;top:1240px;font-size:80px;color:${g.fg}">${V('insidebook', sd)}</p>${zoneAt(LINK, 1450, 120, g.fg)}`); }},
  E9: {phase:'Every day', name:'Submission tip', sticker:LINK, make: (sd = 0) => storyFrame({ground:'cream', kicker:'Submission tip', head:V('tip1', sd), sub:V('tipsub', sd), top:520, subTop:1010, zone:LINK, zoneTop:1250})},
  E10:{phase:'Every day', name:'How ready are you?', sticker:'Slider', make: (sd = 0) => storyFrame({ground:'call', kicker:'Check in', head:V('ready', sd), top:560, zone:'Slider sticker', zoneTop:1120})},
  F1: {phase:'Final week', name:'One week left', sticker:LINK + ' + countdown', make: () => storyFrame({ground:'ink', kicker:'One week', head:'One week left.', sub:`Seven days to submit to the ${GE()}.`, size:150, top:520, subTop:900, zone:'Link sticker: Apply<br>Countdown sticker', zoneTop:1150})},
  F2: {phase:'Final week', name:'Checklist', sticker:LINK, make: () => { const g = G.cream(); const items = ['Your strongest work chosen', 'Photographed in daylight', 'Titles, medium and sizes ready'];
    return sFrame('cream', `${stTop(g.fg, '3 days left')}<p class="a lab" style="left:80px;top:430px;color:${g.acc}">3 days left</p><p class="a H" style="left:76px;right:80px;top:480px;font-size:96px;color:${g.fg}">Before you submit:</p>
      <div class="a" style="left:80px;right:80px;top:700px;color:${g.fg}">${items.map(t => `<div style="display:flex;align-items:center;gap:30px;padding:32px 0;border-top:2px solid ${g.line}"><span style="width:56px;height:56px;border:3px solid ${g.acc};border-radius:12px;flex:none"></span><span style="font-size:44px;font-weight:500">${t}</span></div>`).join('')}</div>${zoneAt(LINK, 1300, 150, g.fg)}`); }},
  F3: {phase:'Final week', name:'48 hours', sticker:LINK, make: () => storyFrame({ground:'call', kicker:'48 hours', head:'48 hours left.', sub:`Submissions close ${dateLong()}.`, size:160, top:520, subTop:900, zone:LINK, zoneTop:1150})},
  F4: {phase:'Final week', name:'Closes tomorrow', sticker:LINK + ' + countdown', make: () => storyFrame({ground:'ink', kicker:'Closes tomorrow', head:'Last chance.', sub:`Submissions close tomorrow, ${dateLong()}.`, size:160, top:520, subTop:900, zone:'Link sticker: Apply<br>Countdown sticker', zoneTop:1150})},
  F5: {phase:'Final week', name:'Closes tonight', sticker:LINK, make: () => Object.assign(storyFrame({ground:'ink', kicker:'Final day', head:'Closes tonight.', size:170, top:560, zone:'Link sticker: Apply now', zoneTop:1100}), {bg:CHILLI})},
  F6: {phase:'Final week', name:'Final hours', sticker:LINK, make: () => Object.assign(storyFrame({ground:'ink', kicker:'Final hours', head:'Hours left to apply.', sub:`The ${GE()} closes tonight.`, size:140, top:560, subTop:900, zone:'Link sticker: Apply now', zoneTop:1120}), {bg:CHILLI})},
  F7: {phase:'After close', name:'Thank you', sticker:'none', make: () => storyFrame({ground:'cream', kicker:'Submissions closed', head:'Thank you to every artist who applied.', sub:`Results: ${gap(state.results, 'Date')}.`, top:560, subTop:1000})},
  H1: {phase:'Highlight cover', name:'Highlight cover', sticker:'Use as the highlight cover', make: () => { const g = G.call();
    return sFrame('call', `<div class="a" style="left:240px;top:660px;width:600px;height:600px;border-radius:50%;border:4px solid ${g.acc};display:flex;align-items:center;justify-content:center;text-align:center"><span style="font-size:${KW().length > 7 ? 70 : 90}px;font-weight:700;letter-spacing:.04em;color:${g.fg}">${KW()}</span></div>`); }},
};
// which templates go out on a given day for a call with `left` days to go (-1 = the day after it closes)
const STORY_ROTATION = ['E3', 'E5', 'E4', 'E7', 'E9', 'E6', 'E8', 'E10'];
function storyDay(left, postDays){
  if (left === 30) return ['L1', 'L2', 'L3', 'L4'];
  if (left === -1) return ['F7'];
  if (left < -1 || left > 30) return [];
  const out = []; if (postDays.has(left)) out.push('E1');
  const end = {7:['F1'], 3:['F2', 'E2'], 2:['F3'], 1:['F4'], 0:['F5', 'F6']}[left];
  if (end) return out.concat(end);
  out.push(STORY_ROTATION[(30 - left) % STORY_ROTATION.length], 'E2');
  return out;
}
const storyMake = (id, left) => { const t = STORY_T[id]; const f = t.make(left); return {...f, title: id.toLowerCase() + '-' + t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, ''), label: id + ' · ' + t.name}; };
// kept for older callers
function stories(){ const phases = {}; Object.entries(STORY_T).forEach(([id]) => { const t = STORY_T[id]; (phases[t.phase] = phases[t.phase] || []).push(storyMake(id, 21)); });
  return Object.entries(phases).map(([phase, frames]) => ({phase, frames})); }

