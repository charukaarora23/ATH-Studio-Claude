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
  [...monthPosts(), ...singlePosts()].forEach(p => { try { VERB = verbFor(p.left); CURLEFT = p.left; ART_KEYS.push(...artKeys(p, artBuild(p))); } catch {} });
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
      <p class="a R" style="left:76px;right:80px;top:150px;font-size:76px;color:${g.fg}">${o.head || `${state.theme ? 'Theme: ' + TH() + '. ' : ''}What fits the theme.`}</p>
      ${items.map(([src,l],i) => { const x = i%2 ? 556 : 80, y = i<2 ? 360 : 780; return `${imgDiv(src, `left:${x}px;top:${y}px;width:444px;height:330px;border-radius:16px`, 'center 30%')}<p class="a" style="left:${x}px;top:${y+346}px;font-size:28px;font-weight:600;color:${g.fg}">${l}</p>`; }).join('')}`};
  },
  // every carousel closes on this: one headline, the date, one button
  cta(o = {}){
    const g = G[o.ground||'call']();
    const b = (g.bg === CREAM ? btnCTA(BURG, CREAM, CREAM) : btnCTA(CREAM, BURG, BURG)).replace('{TOP}', 760);
    const long = String(state.name).length > 16;
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr||'Submissions open')}
      <div class="a" style="left:70px;right:70px;top:150px;bottom:${1350 - 715}px;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:34px;text-align:center">
        <p class="H c" style="font-size:${Math.round((o.size||100) * (long ? .8 : 1))}px;color:${g.fg}">${o.head || `Apply to the<br>${GE()}.`}</p>
        <p class="c" style="font-size:34px;font-weight:600;letter-spacing:-.01em;color:${g.acc}">${CURLEFT === 0 ? `Closes tonight, ${dateLong()}` : `Closes ${dateLong()} · ${leftLabel()}`}</p></div>
      ${b}
      <p class="a c" style="left:0;right:0;top:930px;font-size:28px;color:${g.fg};opacity:.8">${ctaSub()}</p>`};
  },
  // scarcity: 101 places, one of them could be yours
  stakes(o = {}){
    const g = G[o.ground||'ink']();
    const nDots = Math.max(1, Math.min(150, Number(state.selected) || 101)); const dots = Array.from({length:nDots}, (_,i) => i === nDots - 1 ? `<div style="aspect-ratio:1;border-radius:50%;background:${g.acc};box-shadow:0 0 0 5px ${rgba(tint(state.colour),.25)}"></div>` : `<div style="aspect-ratio:1;border-radius:50%;border:2px solid ${g.line}"></div>`).join('');
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr || 'Selection')}
      <p class="a R" style="left:76px;right:80px;top:160px;font-size:76px;color:${g.fg}">${o.head || `${esc(state.selected)} places in the ${GE()}.`}</p>
      <div class="a" style="left:120px;right:120px;top:${o.top||420}px;display:grid;grid-template-columns:repeat(17,1fr);gap:10px">${dots}</div>
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
    if (o.from !== undefined) o.items = o.items.map((_, i) => { const a = PAST_ARTISTS()[o.from + i] || []; return {name: a[0] ? esc(a[0]) : '', meta: a[1] ? esc(isMag() ? noHandle(a[1]) : a[1]) : '', img: paImg(o.from + i)}; });
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
    return `<p class="a c cn" style="left:0;right:0;top:70px;color:${CREAM}">Arts to Hearts Project · ${esc(state.editionLabel || '')}</p>
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

// ---------- magazine style: a magazine cover. Artwork above, a solid call-colour band below ----------
// Arts to Hearts Magazine calls. The launch is its own 10-slide carousel (magLaunch); hooks and countdowns
// across the month use the same cover structure, so the whole month reads as one magazine.
const isMag = () => state.style === 'magazine';
// a contained artwork (never cropped) as a replaceable picture slot
const magArt = (key, src, style, pos) => `<div data-slot="${key}" class="a img" style="${style};background-image:url(${src || ''});background-size:contain;background-position:${pos || 'center'}"></div>`;
const MG = {
  band(o){ const C = state.colour, Tn = tint(C);
    return `${imgDiv(o.img || ART[0], 'left:0;right:0;top:0;height:860px', o.pos || 'center 28%')}
      <div class="a" style="left:0;right:0;top:0;height:170px;background:linear-gradient(180deg,rgba(20,14,12,.42),rgba(20,14,12,0))"></div>
      <div class="a" style="left:0;right:0;top:860px;bottom:0;background:${C}"></div>
      ${corners(WHITE, WHITE, o.tr || ('Issue ' + esc(state.edition)))}`; },
  hook(o){ const Tn = tint(state.colour);
    return {bg:state.colour, html:`${MG.band(o)}
      <div class="a" style="left:52px;right:52px;top:905px;display:flex;justify-content:space-between;align-items:center"><p class="lab" style="color:${Tn}">Open call · ${esc(state.editionLabel || '')}</p>${timer(false)}</div>
      <p class="a H" style="left:50px;right:52px;top:975px;font-size:${Math.min(o.size || 72, 74)}px;color:${WHITE}">${o.head}</p>`};
  },
  count(o){ const Tn = tint(state.colour); const big = String(o.big); const info = o.info || `to get your work into ${esc(state.bookName || state.series)}, ${esc(state.name)}. ${esc(state.selected)} places.`;
    // a short number sits on the right across the seam; a word ("One week") stays inside the band. The artwork credit keeps the bottom-left of the picture
    if (big.length > 2) return {bg:state.colour, html:`${MG.band(o)}
      <p class="a" style="left:48px;top:905px;font-size:150px;font-weight:600;letter-spacing:-.06em;line-height:.85;color:${WHITE}">${big}</p>
      <p class="a scr" style="right:52px;top:930px;text-align:right;font-size:64px;line-height:1;color:${Tn}">${esc(o.unit)}</p>
      <p class="a" style="left:52px;right:52px;top:1080px;font-size:32px;font-weight:500;line-height:1.3;letter-spacing:-.01em;color:${WHITE}">${info}</p>`};
    return {bg:state.colour, html:`${MG.band(o)}
      <p class="a" style="right:40px;top:650px;text-align:right;font-size:400px;font-weight:600;letter-spacing:-.07em;line-height:.8;color:${WHITE}">${big}</p>
      <p class="a scr" style="right:52px;top:1110px;text-align:right;font-size:64px;line-height:1;color:${Tn}">${esc(o.unit)}</p>
      <p class="a lab" style="left:52px;top:930px;color:${Tn}">Open call</p>
      <p class="a" style="left:52px;width:520px;top:975px;font-size:34px;font-weight:500;line-height:1.3;letter-spacing:-.01em;color:${WHITE}">${info}</p>`};
  },
};
{ const H0 = T.hook, C0 = T.count; T.hook = o => isMag() ? MG.hook(o) : H0(o); T.count = o => isMag() ? MG.count(o) : C0(o); }
// magazine wording for the shared month copy (written for books)
const magWords = t => !isMag() || typeof t !== 'string' ? t : t.replace(/\b[Tt]he(\s+|<br>)(?:(<span class="scr"[^>]*>Issue \d+<\/span>)|(Issue \d+)(?=\s*(?:[.,!?:;)]|$|<)))/g, (m, sep, sp, pl) => (sep === '<br>' ? '<br>' : '') + (sp || pl)).replace(/\bthe Issue (\d+)/g, 'Issue $1').replace(/juried hardcover book/g, 'juried magazine issue').replace(/hardcover book/g, 'magazine').replace(/\b([Tt])he book\b/g, '$1he magazine').replace(/juried book/g, 'juried magazine').replace(/our last books/g, 'our past issues').replace(/([Pp])ast editions/g, '$1ast issues').replace(/([Pp])ast edition\b/g, '$1ast issue').replace(/#101ArtBook/g, '#ArtsToHeartsMagazine').replace(/\bEdition (\d+) of a series\b/g, 'Issue $1 of a magazine');

// details without Instagram handles: 'Title · @handle' -> 'Title'
const noHandle = t => String(t || '').replace(/\s*[·|,]?\s*@[\w.]+/g, '').trim();
function magLaunch(){
  const C = state.colour, Tn = tint(C), S = [];
  const label = String(state.editionLabel || '4th anniversary issue').trim(); const sp = label.indexOf(' ');
  const big = sp > 0 ? label.slice(0, sp) : label, rest = sp > 0 ? label.slice(sp + 1) : '';
  const bm = big.match(/^(\d+)(st|nd|rd|th)$/i);
  const bigHtml = bm ? `${bm[1]}<span style="font-size:150px;letter-spacing:-.04em;vertical-align:top;line-height:1;position:relative;top:10px;margin-left:12px">${bm[2]}</span>` : esc(big);
  const pa = PAST_ARTISTS(), ca = COVER_ARTISTS();
  const coverCap = i => { const [n, e] = ca[i] || []; return n ? `<b style="font-weight:600">${esc(n)}</b> · <i class="ser">${esc(e || '')}</i>` : `<span class="gap">Cover artist</span>`; };
  const cvBox = (i, style, pos) => cvImg(i) ? magArt('cv' + (i + 1), cvImg(i), style, pos) : `<div data-slot="cv${i + 1}" class="a ph" style="${style};font-size:18px">Magazine cover</div>`;

  // 1 cover: artwork above, call-colour band, the anniversary across the seam.
  // No credit shows on this cover. The hidden credit line keeps its place: text edits are saved by position, so removing it would move saved edits onto other lines
  S.push({bg:C, html:`
    <div data-slot="imgCover" data-nolabel class="a img" style="left:0;right:0;top:0;height:880px;background-image:url(${state.images.imgCover || ''});background-position:center 28%"></div>
    <div class="a" style="left:0;right:0;top:0;height:160px;background:linear-gradient(180deg,rgba(20,14,12,.42),rgba(20,14,12,0))"></div>
    <div class="a" style="left:0;right:0;top:880px;bottom:0;background:${C}"></div>
    <p class="a cn" style="left:52px;top:48px;color:${WHITE}">Arts to Hearts Project</p><p class="a cn" style="right:52px;top:48px;color:${WHITE}">Issue ${esc(state.edition)}</p>
    <p class="a cn" style="right:46px;top:150px;writing-mode:vertical-rl;white-space:nowrap;color:${WHITE};text-shadow:0 1px 8px rgba(0,0,0,.35)">${pick('Four years in print', 'Four years of artists', 'Four years in print')}</p>
    ${state.credit ? `<p class="a" style="display:none">${esc(state.credit)}</p>` : ''}
    <p class="a" style="left:30px;top:690px;font-size:430px;font-weight:600;letter-spacing:-.07em;line-height:.8;color:${WHITE}">${bigHtml}</p>
    <p class="a scr" style="left:52px;top:1060px;width:470px;font-size:76px;line-height:.95;color:${Tn}">${esc(rest).replace(/ (\S+)$/, '<br>$1')}</p>
    <p class="a lab" style="left:560px;top:930px;color:${Tn}">Open call</p>
    <p class="a" style="left:560px;right:52px;top:972px;font-size:96px;font-weight:700;letter-spacing:-.01em;line-height:.9;text-transform:uppercase;color:${WHITE}">${esc(state.headline || 'Call for artists').replace(/ (\S+)$/, '<br>$1')}</p>
    <p class="a sub" style="left:560px;right:40px;top:1158px;font-size:28px;line-height:1.3;color:${WHITE}">${esc(state.coverLine)}</p>
    <p class="a cn" style="left:52px;bottom:48px;color:${WHITE}">${CMODE() ? `Link in bio · comment “${KW()}”` : `${VERB} “${KW()}”`}</p><p class="a cn" style="right:52px;bottom:48px;color:${WHITE}">Closes ${short()}</p>`});

  // 2 four years in print: the sixteenth is open
  S.push({bg:CREAM, html:`${corners(INK, BURG, 'Four years')}
    <p class="a R c" style="left:80px;right:80px;top:170px;font-size:84px;color:${INK}">Four years. ${esc(state.editions)} issues.<br>The <span style="color:${C};font-weight:600">${ordinal(state.edition)}</span> is open.</p>
    ${[3, 1, 0].map((ci, j) => cvBox(ci, `left:${64 + j * 325}px;width:302px;top:440px;height:440px`, 'center bottom')).join('')}
    ${[3, 1, 0].map((ci, j) => `<p class="a crd c" style="left:${64 + j * 325}px;width:302px;top:898px;font-size:19px;color:${INK}">${coverCap(ci)}</p>`).join('')}
    <p class="a c sub" style="left:120px;right:120px;top:1040px;font-size:28px;opacity:.75;color:${INK}">${esc(state.published)} artists published in ${esc(state.bookName || state.series)}.</p>`});

  // 3 past cover artists: four covers, two by two
  S.push({bg:INK, html:`${corners(WHITE, PEONY, 'On the cover')}
    <p class="a R c" style="left:80px;right:80px;top:130px;font-size:80px;color:${WHITE}">Past cover artists</p>
    <p class="a c sub" style="left:140px;right:140px;top:236px;font-size:28px;opacity:.75;color:${WHITE}">${pick('Their work became the face of the magazine.', 'Their art was chosen for the cover.', 'The artists behind our covers.')}</p>
    ${[0, 1, 2, 3].map(i => { const x = i % 2 ? 560 : 90, y = i < 2 ? 320 : 790; return cvBox(i, `left:${x}px;width:430px;top:${y}px;height:400px`, 'center') + `<p class="a c" style="left:${x}px;width:430px;top:${y + 410}px;font-size:22px;color:${WHITE}">${coverCap(i)}</p>`; }).join('')}`});

  // 4 published artists: six from a past issue
  S.push({bg:C, html:`${corners(WHITE, WHITE, 'From past issues')}
    <p class="a R c" style="left:80px;right:80px;top:130px;font-size:80px;color:${WHITE}">Published artists</p>
    <p class="a c sub" style="left:120px;right:120px;top:236px;font-size:28px;opacity:.85;color:${WHITE}">${pick('A few of the artists in our past issues.', 'Artists from our past issues.', 'Real artists. Real pages.')}</p>
    ${[0, 1, 2, 3, 4, 5].map(i => { const [n, e] = pa[i] || []; const x = 56 + (i % 3) * 332, y = i < 3 ? 320 : 790; const u = paImg(i);
      return (u ? magArt('pa' + (i + 1), u, `left:${x}px;width:304px;top:${y}px;height:350px`, 'center bottom') : `<div data-slot="pa${i + 1}" class="a ph" style="left:${x}px;width:304px;top:${y}px;height:350px;font-size:18px;color:${WHITE}">Their work</div>`)
        + (n ? `<p class="a" style="left:${x}px;width:304px;top:${y + 362}px;text-align:center;font-size:23px;font-weight:600;line-height:1.2;color:${WHITE}">${esc(n)}</p><p class="a" style="left:${x}px;width:304px;top:${y + 394}px;text-align:center;font-size:19px;line-height:1.3;opacity:.9;color:${WHITE}">${esc(noHandle(e))}</p>`
          : `<p class="a" style="left:${x}px;width:304px;top:${y + 362}px;font-size:19px;color:${WHITE}"><span class="gap">Artist name</span></p>`); }).join('')}`});

  // 5 the theme
  S.push({bg:C, html:`${corners(WHITE, WHITE, 'The theme')}
    <p class="a ser" style="left:52px;top:120px;width:600px;font-size:60px;line-height:1.08;letter-spacing:-.015em;color:${INK}">${esc(state.quote)}</p>
    ${magArt('imgTheme', state.images.imgTheme, 'left:240px;right:240px;top:330px;height:700px', 'center')}
    ${state.themeCredit ? `<p class="a c" style="left:0;right:0;top:1046px;font-size:17px;font-weight:500;opacity:.85;color:${WHITE}">${esc(state.themeCredit)}</p>` : ''}
    <p class="a lab" style="left:52px;top:1110px;color:${WHITE}">${esc(state.theme)}</p>
    <p class="a sub" style="left:52px;right:52px;top:1150px;font-size:28px;color:${WHITE}">${esc(state.submit)}</p>`});

  // 6 what you receive: one sentence, the gifts picked out
  const k = t => `<span style="font-weight:600;color:${Tn}">${t}</span>`;
  const ben = lines(state.benefits).slice(0, 4).map(l => l.split('|').map(x => x.trim()));
  const said = ben.map(([t, d], i) => `${k(esc(i ? t : t.charAt(0).toLowerCase() + t.slice(1)).replace(/-/g, '&#8209;'))}${d ? ' ' + esc(d) : ''}.`).join(' ');
  S.push({bg:C, html:`${corners(WHITE, WHITE, 'If selected')}
    <p class="a R" style="left:52px;right:52px;top:140px;font-size:64px;line-height:1.08;color:${WHITE}">Every selected artist gets ${said}</p>
    <div class="a" style="left:538px;top:860px;width:4px;height:150px;background:${WHITE}"></div>
    <div class="a" style="left:525px;top:990px;width:30px;height:30px;border-right:4px solid ${WHITE};border-bottom:4px solid ${WHITE};transform:rotate(45deg)"></div>
    <p class="a R c" style="left:52px;right:52px;top:1080px;font-size:56px;color:${WHITE}">${k('Apply now')}${state.fee ? ', from ' + esc(state.fee) : ''}.</p>`});

  // 7 the award, on a framed page
  S.push({bg:INK, html:`
    <div class="a" style="left:52px;right:52px;top:52px;bottom:52px;background:${CREAM}"></div>
    <p class="a cn" style="left:92px;top:88px;color:${INK}">Arts to Hearts Project</p>
    <p class="a cn" style="right:80px;top:88px;writing-mode:vertical-rl;white-space:nowrap;color:${INK}">Issue ${esc(state.edition)} · ${esc(label)}</p>
    ${cvBox(0, 'left:92px;top:150px;width:430px;height:570px', 'left top')}
    <p class="a crd" style="left:92px;top:730px;width:430px;font-size:17px;color:${INK}">${coverCap(0)}</p>
    <div class="a" style="left:570px;top:150px;right:140px;color:${INK}">
      <p class="R" style="font-size:64px">${pick('Three artists receive more.', 'Three artists go further.', 'Three artists receive more.')}</p>
      <p class="lab" style="margin-top:34px;color:${C}">Winner</p>
      <p class="sub" style="font-size:28px;margin-top:8px">The cash award and ${esc(state.prizeExtra)}.</p>
      <p class="lab" style="margin-top:28px;color:${C}">Two runners-up</p>
      <p class="sub" style="font-size:28px;margin-top:8px">${esc(state.runners)}</p></div>
    <p class="a" style="left:78px;top:800px;font-size:340px;font-weight:400;letter-spacing:-.07em;line-height:.85;color:${C}">${esc(state.prize)}</p>
    <p class="a cn" style="left:92px;bottom:88px;color:${BURG}">${CMODE() ? `Link in bio · comment “${KW()}”` : `${VERB} “${KW()}”`}</p><p class="a cn" style="right:92px;bottom:88px;color:${INK}">Closes ${short()}</p>`});

  // 8 the places and the dates
  const n = Math.min(Math.max(parseInt(state.selected, 10) || 100, 20), 120);
  S.push({bg:INK, html:`${corners(WHITE, PEONY, 'Selection')}
    <p class="a R c" style="left:80px;right:80px;top:200px;font-size:80px;color:${WHITE}">${esc(state.selected)} places, chosen by ${state.jury ? esc(state.jury) : 'the jury'}.</p>
    <div class="a" style="left:150px;right:150px;top:500px;display:grid;grid-template-columns:repeat(20,1fr);gap:10px">${Array.from({length: n}, (_, i) => `<span style="aspect-ratio:1;border-radius:50%;${i === n - 1 ? `background:${C}` : 'border:2px solid rgba(255,255,255,.35)'}"></span>`).join('')}</div>
    <p class="a ser" style="right:150px;top:${500 + Math.ceil(n / 20) * 50}px;font-size:30px;color:${C}">← yours?</p>
    <div class="a" style="left:80px;right:80px;top:900px;display:grid;grid-template-columns:repeat(3,1fr);border-top:2px solid rgba(255,255,255,.25);color:${WHITE}">
      <div style="padding:30px 20px 0 0"><p class="R" style="font-size:64px">${short()}</p><p class="sub" style="font-size:26px;margin-top:8px;opacity:.8">Submissions close</p></div>
      <div style="padding:30px 20px 0 28px;border-left:2px solid rgba(255,255,255,.25)"><p class="R" style="font-size:64px">3 weeks</p><p class="sub" style="font-size:26px;margin-top:8px;opacity:.8">Then results</p></div>
      <div style="padding:30px 0 0 28px;border-left:2px solid rgba(255,255,255,.25)"><p class="R" style="font-size:64px">${esc(state.fee || '')}</p><p class="sub" style="font-size:26px;margin-top:8px;opacity:.8">To enter one artwork</p></div></div>`});

  // 9 who can apply
  S.push({bg:CREAM, html:`${corners(INK, BURG, 'Who can apply')}
    <p class="a R c" style="left:80px;right:80px;top:370px;font-size:100px;line-height:1.12;color:${INK}">${pick('Your work deserves<br>the ', 'It is time for<br>your ', 'Step into<br>the ')}<span style="display:inline-block;background:${INK};color:${CREAM};border-radius:999px;padding:0 .28em .06em;line-height:1.05">spotlight.</span></p>
    <p class="a c sub" style="left:130px;right:130px;top:720px;color:${INK}">${esc(state.levels)}</p>
    <p class="a c sub" style="left:150px;right:150px;top:910px;font-size:26px;opacity:.75;color:${INK}">${esc(state.elig)}</p>`});

  // 10 end card
  const covers = [3, 2, 1, 0].map(i => cvImg(i)).filter(Boolean).map(u => `<img src="${u}" alt="" style="height:230px;display:block;box-shadow:0 18px 30px -16px rgba(0,0,0,.45)">`).join('');
  S.push({bg:C, html:`${corners(WHITE, WHITE, 'Submissions open')}
    <img class="a" src="brand/monogram-white.svg" alt="" style="left:508px;top:110px;width:64px">
    <p class="a H c" style="left:60px;right:60px;top:220px;font-size:108px;color:${WHITE}">${pick('Take your place<br>in ', 'Be in<br>', 'Your page in<br>')}Issue ${esc(state.edition)}.</p>
    <div class="a" style="left:60px;right:60px;top:480px;height:250px;display:flex;align-items:flex-end;justify-content:center;gap:16px">${covers}</div>
    <p class="a c" style="left:0;right:0;top:746px;font-family:'ATH Serif',serif;font-style:italic;font-size:19px;opacity:.85;color:${WHITE}">Past issues of ${esc(state.bookName || state.series)}</p>
    <div class="a" style="left:110px;right:110px;top:880px;height:124px;border-radius:999px;background:${CREAM};color:${BURG};display:flex;align-items:center;justify-content:space-between;padding:0 20px 0 56px">
      <span style="font-size:44px;font-weight:700;letter-spacing:-.02em">${ctaBtn()}</span>
      <span style="width:88px;height:88px;border-radius:50%;background:${BURG};color:${CREAM};display:inline-flex;align-items:center;justify-content:center"><svg width="36" height="16" viewBox="0 0 46 20"><path d="M2 10h40M33 2l9 8-9 8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>
    <p class="a c" style="left:0;right:0;top:1050px;font-size:28px;opacity:.9;color:${WHITE}">${ctaSub()}</p>
    <p class="a c" style="left:0;right:0;top:1100px;font-size:26px;opacity:.75;color:${WHITE}">artstoheartsproject.com</p>`});

  const titles = ['cover','four-years','cover-artists','published-artists','the-theme','what-you-receive','the-award','selection','who-can-apply','apply'];
  return S.map((x, i) => ({...x, title: titles[i]}));
}

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
function postVer(title){ const v = state.ver && state.ver[title]; if (v !== undefined) return v; return ({gallery:0, award:1, editorial:2, magazine:0})[state.style] || 0; }
const pick = (...opts) => opts[postVer(CURPOST) % opts.length];
// The feed schedule: every post is a carousel with enough slides to show what the call really offers.
// Countdown numbers and one-slide reminders live in SINGLE_POSTS (optional, outside the schedule).
const prepWork = () => state.themeWork === 'best work' ? 'best' : (state.theme || '').toLowerCase() + '-themed';
const distrib = () => esc(state.distribution || 'Amazon, Barnes & Noble and the ATH Shop');
function monthPosts(){ const name = GE(), sel = esc(state.selected); return [
 {left:30, title:'Launch', kind:'Carousel', slides:() => { const s = launch(); if (isMag()) return s; if (isAward() || isEd()) s[0] = {...(isEd() ? ED : AW).hook({img:state.images.imgCover, tr:esc(state.series), head: isEd() ? esc(state.headline || 'Call for artists') : `${esc(state.headline || 'Call for artists')}<br>${GE()}`, size: isEd() ? 112 : 120, sub:esc(state.coverLine)}), title:'cover'}; return s; }, caption:() => caption(), pin:() => pinned()},

 {left:28, title:'What you can submit', kind:'Carousel · theme', slides:() => [
   T.hook({img:EX.bloom, tr:'The theme', head:pick(`What you can submit to the ${name}.`, `What the jury wants to see.`, `Five kinds of work we are looking for.`), sub:pick(`Any medium. ${sel} artists will be published.`, `Any medium, original work only. ${sel} places.`, `Any medium. ${sel} places in the book.`)}),
   ...KINDS().slice(0,5).map((k,i) => T.num({img:[EX.dahlia, EX.meadow, EX.portrait, EX.palms, EX.field][i], n:String(i+1), head:esc(k[0]) + '.', text:esc(k[1] || ''), tr:'What you can submit', ground: i % 2 ? 'ink' : 'cream'})),
   T.cta({kicker:'Any medium · Original work only'}),
 ], caption:() => `What you can submit to the ${N()}.

The jury wants to see ${state.themeWork || 'work'} of five kinds:
${KINDS().slice(0,5).map((k,i) => (i+1) + '. ' + k[0]).join('\n')}

Any medium. Original work only. ${SEL()} artists will be selected and published in a juried hardcover book.

${kwLine()}
${closeLn()}

Example artworks are shown for illustration. ${tags}`},

 {left:26, title:'Inside the book', kind:'Carousel · proof', slides:() => [
   T.hook({ground:'ink', img2: state.images.imgSpread || null, imgLabel:'Real photo needed<br>A spread from a past edition', size:72, tr:'Inside the book', head:pick('What a page in the book looks like.', 'Inside a past edition.', 'How selected artists appear in print.'), sub:pick(`Selected artists appear in the ${name} like this.`, 'Swipe through the pages.', `This is how the ${name} will look.`)}),
   T.photo({img:state.images.imgSpread, label:'Real photo needed<br>A spread from a past edition', tr:'Inside the book', head:'Every artist, credited.', sub:'Name, artwork title, medium and country, on the page.'}),
   T.photo({key:'phSpread2', img:null, label:'Real photo needed<br>A second spread', tr:'Inside the book', head:'Chosen by a jury.', sub:'Each edition is selected by a jury and laid out as one collection.', ground:'ink'}),
   T.photo({key:'phShelf', img:null, label:'Real photo needed<br>The book on a shelf or in a shop', tr:'Inside the book', head:'Sold worldwide.', sub:`Through ${distrib()}.`}),
   T.photo({key:'phHolding', img:null, label:'Real photo needed<br>An artist holding their copy', tr:'Inside the book', head:'A copy in your hands.', sub:'What artists tell us they keep coming back to.', ground:'ink'}),
   T.cta({kicker:'Your page in the next edition'}),
 ], caption:() => `What a page in the book looks like.

Every selected artist appears in print with their name, artwork title, medium and country, in a juried hardcover collection sold through ${state.distribution || 'Amazon, Barnes & Noble and the ATH Shop'}.

The ${N()} is open now, with ${SEL()} places.
${kwLine()}
${closeLn()}

${tags}`},

 {left:24, title:'Your questions, answered', kind:'Carousel · questions', slides:() => [
   T.hook({img:EX.meadow, pos:'center 40%', tr:'Your questions', head:pick(`Questions about the ${name}, answered.`, `What artists ask us most.`, `Before you apply: your questions.`), sub:pick('The seven questions we get most.', 'Seven straight answers.', 'Seven answers, in plain words.')}),
   T.qa({q:'I’m self-taught. Can I apply?', a:'Yes. No degree, gallery or exhibition history needed.', more:'The jury judges the work, not the CV.', ground:'call'}),
   T.qa({q:'I don’t live in the US.', a:`Open to ${esc(state.who || 'artists')} worldwide, 18 and over.`, more:'Past editions include artists from every continent.', ground:'cream'}),
   T.qa({q:'Is digital work accepted?', a:'Yes. Any medium, traditional or digital.', more:'Painting, photography, illustration, textile, sculpture, mixed media.', ground:'call'}),
   T.qa({q:'Can I submit AI-generated work?', a:'No. Original work only.', ground:'cream'}),
   T.qa({q:'Is there a fee?', a:`An application fee applies${state.fee ? ': ' + esc(state.fee) : ''}.`, more: state.fee ? '' : '<span class="gap">Add the fee wording in the form</span>'}),
   T.qa({q:'When will I hear back?', a:`Results: ${gap(state.results,'Date')}.`, ground:'call'}),
   T.qa({q:'Do I keep the rights to my work?', a:gap(state.rights,'Confirm the rights wording')}),
   T.cta({kicker:'Another question? Ask in the comments'}),
 ], caption:() => `Questions about the ${N()}, answered:

· Self-taught? Yes, welcome.
· Outside the US? Open worldwide, 18+.
· Digital work? Yes, any medium.
· AI-generated work? No, original work only.
· Fee? An application fee applies.

Anything else? Ask in the comments.
${kwLine()}
${closeLn()}

${tags}`},

 {left:21, title:'Published artists', kind:'Carousel · proof', slides:() => [
   T.hook({img:EX.portrait, tr:'Past editions', head:pick(`Artists from our past editions.`, `Published in our last books.`, `Some of the artists we have published.`), size:72, sub:`From our ${PAST().slice(0,3).join(', ')} editions.`}),
   T.grid({head:`Published in the ${esc(PAST()[0] || 'last edition')}${/edition|year|\d/i.test(PAST()[0]||'') ? '' : ' Edition'}`, items:[{},{},{},{}], from:6, tr:'Past editions'}),
   T.grid({head:`Published in the ${esc(PAST()[1] || PAST()[0] || 'last edition')}${/edition|year|\d/i.test(PAST()[1]||PAST()[0]||'') ? '' : ' Edition'}`, items:[{},{},{},{}], from:10, tr:'Past editions', ground:'ink'}),
   T.grid({head:`Published in the ${esc(PAST()[2] || PAST()[0] || 'last edition')}${/edition|year|\d/i.test(PAST()[2]||PAST()[0]||'') ? '' : ' Edition'}`, items:[{},{},{},{}], from:14, tr:'Past editions'}),
   T.quote({tr:'From past editions'}),
   T.cta({kicker:`The ${esc(state.name)} is open`}),
 ], caption:() => `Artists from our ${PAST().join(', ')} editions. Every artist is credited on the slides.

The ${N()} open call has ${SEL()} places.
${kwLine()}
${closeLn()}

[Credit every artist here: Name · @handle]
${tags}`},

 {left:18, title:'Photograph your art for print', kind:'Carousel · education', slides:() => [
   T.hook({img:EX.dahlia, pos:'center 40%', tr:'For your submission', head:pick(`How to photograph your work for the ${name}.`, `Five photo steps before you submit.`, `Photograph your work like this.`), sub:pick('Five steps that help the jury see your work properly.', 'Save this for your submission.', 'Five steps, any phone.')}),
   T.num({icon:'sun', n:'01', head:'Use daylight.', text:'Near a window, out of direct sun. Avoid flash and yellow indoor light.', tr:'Photo tips'}),
   T.num({icon:'level', n:'02', head:'Shoot straight on.', text:'Camera parallel to the work, centred, so nothing looks tilted or stretched.', tr:'Photo tips', ground:'ink'}),
   T.num({icon:'crop', n:'03', head:'Fill the frame.', text:'Crop to the artwork only. No walls, easels or hands.', tr:'Photo tips'}),
   T.num({icon:'drop', n:'04', head:'Keep true colour.', text:'No filters. Compare the photo to the artwork before you send it.', tr:'Photo tips', ground:'ink'}),
   T.num({icon:'grid', n:'05', head:'Send it large.', text:'Use the highest resolution you have. Print needs detail.', tr:'Photo tips'}),
   T.cta({kicker:'Photos ready? Submit them'}),
 ], caption:() => `How to photograph your artworks for the ${N()}:

1. Daylight, near a window, no flash
2. Straight on, centred
3. Crop to the artwork only
4. True colour, no filters
5. The highest resolution you have

Save this for your submission.
${kwLine()}
${closeLn()}

${tags}`},

 {left:15, title:'Halfway: the call at a glance', kind:'Carousel · the brief', slides:() => [
   T.count({img:ART[1], pos:'center 40%', big:'15', unit:'days left', tr:'Halfway', info:`Halfway to the deadline. Everything about the ${name}, in one post.`}),
   T.brief(),
   T.themeRecap(),
   T.howto(),
   T.next(),
   T.cta({kicker:'15 days left'}),
 ], caption:() => `Halfway. 15 days left to apply to the ${N()} open call.

The call, the theme, how to apply and what happens after you submit, all in this post.

How to apply:
1. ${kwLine()}
2. Prepare your ${prepWork()} artworks
3. Submit by ${dateLong()}

${tags}`},

 {left:13, title:'From submission to print', kind:'Carousel · artist story', slides:() => [
   T.hook({img:ART[4], pos:'center 40%', tr:'An artist’s story', head:pick(`From submission to print.`, `How one artist got into the book.`, `One entry, one printed page.`), size:76, sub:'How one past artist went from submission to a published page.'}),
   T.quote({tr:'An artist’s story'}),
   T.photo({key:'phStoryWork', img:null, label:'Real photo needed<br>The artwork they submitted', tr:'An artist’s story', head:'The work they sent.', sub:gap(state.storyWork,'Title, medium, and why they chose it')}),
   T.photo({key:'phStoryPage', img:null, label:'Real photo needed<br>Their page in the book', tr:'An artist’s story', head:'The page it became.', sub:gap(state.storyAfter,'Edition and what happened next'), ground:'ink'}),
   T.howto(),
   T.cta({kicker:'Submissions are open'}),
 ], caption:() => `From submission to print.

[Artist name] submitted [artwork] to the [Edition]. Here is the page it became, and what happened next, in their words.

The ${N()} open call is open now, with ${SEL()} places.
${kwLine()}
${closeLn()}

${tags}`},

 {left:11, title:'How selection works', kind:'Carousel · trust', slides:() => [
   T.hook({img:ART[1], pos:'center 40%', tr:'Selection', head:pick(`How ${sel} artists are selected for the ${name}.`, `How the jury chooses ${sel} artists.`, `How selection works.`), sub:'What happens to your submission, step by step.'}),
   T.num({icon:'eye', n:'01', head:'Every entry is reviewed.', text:`Each eligible submission is seen by ${state.jury ? esc(state.jury) : 'the jury'}, in full.`, tr:'Selection'}),
   T.num({icon:'target', n:'02', head:'What the jury looks for.', text:esc(state.juryLooks || ''), tr:'Selection', ground:'ink'}),
   T.num({icon:'people', n:'03', head:`${sel} are selected.`, text:'Chosen to work together as one collection, not ranked against each other.', tr:'Selection'}),
   T.next({ground:'ink'}),
   T.cta({kicker:'Send your strongest work'}),
 ], caption:() => `How ${SEL()} artists are selected for the ${N()}.

Every eligible submission is reviewed. The jury looks for: ${state.juryLooks} ${SEL()} artists are selected to work together as one collection.

${kwLine()}
${closeLn()}

${tags}`},

 {left:9, title:'Prepare your submission', kind:'Carousel · checklist', slides:() => [
   T.count({img:ART[2], pos:'center 40%', big:'9', unit:'days left', info:`What to get ready for the ${name}. Save this.`}),
   T.check({head:'Prepare your artworks.', tr:'Before you submit', items:[`Choose your strongest ${state.themeWork === 'best work' ? '' : (state.theme || '').toLowerCase() + '-themed '}works`,'Photograph each one in daylight, straight on','Note title, medium and size for each','Add your name and country','Submit through your link or the link in bio'], top:420, foot:'Most artists finish in about ten minutes.'}),
   T.brief({head:'What you need to know.'}),
   T.howto(),
   T.next(),
   T.cta({kicker:'9 days left'}),
 ], caption:() => `9 days left. What to get ready for the ${N()}:

☐ Choose your strongest ${state.themeWork === 'best work' ? '' : (state.theme || '').toLowerCase() + '-themed '}works
☐ Photograph each one in daylight
☐ Note title, medium and size
☐ Add your name and country

Most artists finish in about ten minutes.
${kwLine()}
${closeLn()}

${tags}`},

 {left:7, title:'One week left', kind:'Carousel · countdown', slides:() => [
   T.count({img:ART[4], pos:'center 40%', big:'One week', bigSize:200, bigTop:400, unit:'left', unitTop:640, info:`One week to apply. ${sel} places, juried.`}),
   T.themeRecap({head:`${state.theme ? 'Theme: ' + TH() + '. ' : ''}What fits.`}),
   T.stakes({head:`${sel} places in the ${name}.`}),
   T.howto(),
   T.next(),
   T.cta({kicker:'7 days left'}),
 ], caption:() => `One week left to apply to the ${N()} open call.

${SEL()} places. What fits the theme, how to apply and what happens next are in this post.
${kwLine()}
${closeLn()}

${tags}`},

 {left:6, title:'Five mistakes to avoid', kind:'Carousel · education', slides:() => [
   T.hook({img:ART[0], pos:'center 30%', tr:'Before you submit', head:pick(`Five mistakes we see in submissions.`, `Check these five things before you submit.`, `Five things that weaken a submission.`), size:76, sub:'Easy to fix before the deadline.'}),
   T.num({icon:'blur', n:'01', head:'A blurry or tilted photo.', text:'The jury can only judge what they can see.', tr:'Avoid this', ground:'ink'}),
   T.num({icon:'filter', n:'02', head:'Filters and editing.', text:'If the colours are wrong, the work is misread.', tr:'Avoid this'}),
   T.num({icon:'target', n:'03', head: state.themeWork === 'best work' ? 'A body of work without focus.' : 'Ignoring the theme.', text:state.theme && state.themeWork !== 'best work' ? `Show us your reading of the ${(state.theme||'').toLowerCase()} theme, however personal.` : 'Send work that shows your own voice clearly.', tr:'Avoid this', ground:'ink'}),
   T.num({icon:'star', n:'04', head:'Holding back your best work.', text:'Send the pieces you are proudest of.', tr:'Avoid this'}),
   T.num({icon:'clock', n:'05', head:'Waiting for the last day.', text:'Last-minute uploads lead to mistakes. Give yourself time to check.', tr:'Avoid this', ground:'ink'}),
   T.cta({kicker:'6 days left'}),
 ], caption:() => `Five mistakes we see in submissions:

1. A blurry or tilted photo
2. Filters and editing
3. Ignoring the theme
4. Holding back your best work
5. Waiting for the last day

${kwLine()}
${closeLn()}

${tags}`},

 {left:4, title:'Why artists apply', kind:'Carousel · value', slides:() => [
   T.hook({img:ART[0], pos:'center 15%', tr:'Why artists apply', head:pick(`What being published in the ${name} gives you.`, `Why artists apply.`, `What a juried book gives you.`), size:72, sub:'Four reasons, from the artists we publish.'}),
   T.num({icon:'book', n:'01', head:'A credit chosen by a jury.', text:'Curators, residencies and grant panels read a juried publication as a judgement made by someone else.', tr:'Why artists apply'}),
   T.num({icon:'eye', n:'02', head:'Your work in print, worldwide.', text:`Sold through ${distrib()}.`, tr:'Why artists apply', ground:'ink'}),
   T.num({icon:'people', n:'03', head:'Seen beyond your feed.', text:'Each edition is shared with collectors, galleries and curators through our network.', tr:'Why artists apply'}),
   T.num({icon:'star', n:'04', head:'Part of a collection.', text:`Shown alongside ${Number(state.selected) - 1 || 100} other artists responding to the same theme.`, tr:'Why artists apply', ground:'ink'}),
   T.quote({tr:'Why artists apply'}),
   T.cta({kicker:'4 days left'}),
 ], caption:() => `What being published in the ${N()} gives you:

· A credit chosen by a jury, which curators and grant panels recognise
· Your work in print, sold worldwide
· Shared with collectors, galleries and curators
· Part of a collection of artists responding to the same theme

Four days left.
${kwLine()}

${tags}`},

 {left:2, title:'48 hours: last questions', kind:'Carousel · questions', slides:() => [
   T.count({img:ART[3], big:'48', unit:'hours left', info:'Your last questions about the open call, answered.'}),
   T.qa({q:'Is it too late to apply?', a:`No. Submissions are open until ${dateLong()}.`, more: CMODE() ? ctaSentence() : `${VERB} “${KW()}” and we’ll send you the brief and your link.`, ground:'cream', tr:'Last questions'}),
   T.qa({q:'How long does it take?', a:'About ten minutes.', more:'Have your photos, titles, medium and sizes ready, then submit through the link in bio.', tr:'Last questions', ground:'call'}),
   T.qa({q:'Will my work really be seen?', a:'Every eligible entry is reviewed by the jury.', more:'Selected work is published and sold worldwide.', ground:'ink', tr:'Last questions'}),
   T.qa({q:'Can I submit more than one artwork?', a:gap(state.multiArt,'Confirm the rule'), more:'Choose the works that best represent you.', ground:'cream', tr:'Last questions'}),
   T.cta({kicker:'48 hours left'}),
 ], caption:() => `48 hours left. Your last questions about the ${N()} open call:

· Too late? No, submissions are open until ${dateLong()}.
· How long does it take? About ten minutes.
· Will my work be seen? Every eligible entry is reviewed by the jury.

${kwLine()}

${tags}`},

 {left:0, title:'Last day', kind:'Carousel · last call', slides:() => [
   T.urgent({head:pick('Last<br>day.', 'Final<br>day.', 'Closes<br>tonight.'), sub:'Submissions close at midnight tonight.', tr:'Last day'}),
   T.brief(),
   T.themeRecap(),
   T.howto(),
   T.next(),
   T.cta({head:'Apply today.'}),
 ], caption:() => `Last day to apply to the ${N()} open call.

Submissions close at midnight tonight. ${SEL()} artists will be selected and published in a juried hardcover book.
${kwLine()}

${tags}`},
];}

// Optional single graphics: not in the schedule, use them on any day as extra posts.
function singlePosts(){ const name = GE(), sel = esc(state.selected); return [
 {left:26, title:'Get published', kind:'Single', slides:() => [T.hook({ground:'cream', img2: state.images.imgBooks || null, imgLabel:'Real photo needed<br>The books together', size:84, tr:'The collection', head:`Get published in the ${name}.`, sub:`${sel} places in a juried hardcover book.`})],
  caption:() => `Get published in the ${N()}.\n\nJoin ${state.published} artists already in print across ${state.editions} editions of the ${S()}. ${SEL()} places, juried.\n\n${kwLine()}\n${closeLn()}\n\n${tags}`},
 {left:20, title:'At a glance', kind:'Single', slides:() => [T.brief()], caption:() => `The ${N()} open call, at a glance.\n\n${kwLine()}\n${closeLn()}\n\n${tags}`},
 {left:16, title:'The theme', kind:'Single', slides:() => [T.themeRecap()], caption:() => `${themeTag()}${KINDS().slice(0,4).map(k => k[0]).join(', ')}.\n\n${kwLine()}\n${closeLn()}\n\n${tags}`},
 ...[[14, '2', 'weeks left'], [10, '10', 'days left'], [5, '5', 'days left'], [3, '3', 'days left'], [1, '24', 'hours left']].map(([left, big, unit]) => ({left, title:`${big} ${unit}`, kind:'Single · countdown', slides:() => [T.count({img:ART[left % 5], pos:'center 30%', big, unit})],
  caption:() => `${big} ${unit} to apply to the ${N()} open call. ${SEL()} places.\n\n${kwLine()}\n${closeLn()}\n\n${tags}`})),
 {left:0, title:'Final hours', kind:'Single · last call', slides:() => [T.urgent({chilli:true, head:'Closes<br>tonight.', sub:'Final hours to submit.', tr:'Final hours'})],
  caption:() => `Final hours. The ${N()} open call closes at midnight tonight.\n\n${kwLine()}\n\n${tags}`},
];}

// ---------- stories (1080 x 1920) ----------
function storyFrame(o){
  const g = o.ground ? G[o.ground]() : {bg:INK, fg:WHITE, acc:tint(state.colour)};
  const zone = o.zone ? `<div class="a zone" style="left:140px;right:140px;top:${o.zoneTop||1260}px;height:${o.zoneH||200}px;border:3px dashed ${g.fg};border-radius:28px;opacity:.55;display:flex;align-items:center;justify-content:center;text-align:center;font-size:26px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:${g.fg}">${o.zone}</div>` : '';
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
function rlPh(i){ const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><rect width="1080" height="1920" fill="#2b2124"/><rect x="60" y="60" width="960" height="1800" rx="28" fill="none" stroke="#f9ece5" stroke-opacity=".45" stroke-width="4" stroke-dasharray="18 14"/><text x="540" y="560" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="50" fill="#f9ece5" fill-opacity=".75" letter-spacing="6">PHOTO OR VIDEO ${i}</text><text x="540" y="630" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#f9ece5" fill-opacity=".55">Click or drop a clip or photo</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29'); }
function reelBeat(o){ const k = o.key; const src = rlPhoto(k) || rlPh(o.n);
  const shade = `<div class="a" style="inset:0;background:linear-gradient(180deg,rgba(20,9,12,.55) 0%,rgba(20,9,12,0) 24%,rgba(20,9,12,0) 52%,rgba(20,9,12,.78) 78%,rgba(20,9,12,.9) 100%)"></div>`;
  const kick = o.kicker ? `<p class="a lab" style="left:90px;right:90px;top:${o.top - 70}px;color:${tint(state.colour)}">${o.kicker}</p>` : '';
  const html = `<div data-slot="${k}" class="a img" style="inset:0;background-image:url(${src});background-position:center"></div>${shade}
    <p class="a cn" style="left:64px;top:250px;color:${WHITE}">Arts to Hearts Project</p>
    ${kick}<p class="a H" style="left:86px;right:90px;top:${o.top}px;font-size:${o.size || 96}px;color:${WHITE}">${o.text}</p>
    ${o.sub ? `<p class="a sub" style="left:90px;right:120px;top:${o.subTop || o.top + 300}px;font-size:40px;color:${WHITE};opacity:.92">${o.sub}</p>` : ''}`;
  const v = (state.vids || {})[k]; const d = (state.durs || {})[k] ?? (v ? Math.min(5, Math.max(1, +(((v.len || 4) - (v.start || 0)) / (v.speed || 1)).toFixed(1))) : (o.dur || 2.6));
  return {h:1920, bg:INK, html, dur:d, photoKey:k, isVideo: !!v};
}
function reelEnd(n){ const g = G.call();
  return {h:1920, bg:g.bg, dur:(state.durs || {}).end ?? 3.4, html:`<p class="a cn" style="left:64px;top:250px;color:${g.fg}">Arts to Hearts Project</p>
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
  {id:'R7', name:'Flip through the book', goal:'Show the real product', len:'12 s', audio:'Use the real page-turn sound: switch Clip sound on.', tip:'Film the flip in one steady shot, daylight, hands only.', video:true, beats: () => [
    reelBeat({key:'rl7a', n:1, text:'Flip through a past edition.', top:1300, size:88, dur:4}),
    reelBeat({key:'rl7b', n:2, text:'Every page, a different artist.', top:1300, size:88, dur:3}),
    reelBeat({key:'rl7c', n:3, text:'Yours could be next.', top:1300, dur:3}),
    reelEnd()],
   caption: () => `Flip through a past edition. Every page, a different artist. Yours could be next in the ${N()}.\n\n${kwLine()}\n${closeLn()}\n\n${tags}`},
  {id:'R8', name:'Unboxing the book', goal:'Desire: the physical object', len:'12 s', audio:'Soft ASMR: keep Clip sound on for the unboxing.', tip:'Open the box slowly. End on the cover in your hands.', video:true, beats: () => [
    reelBeat({key:'rl8a', n:1, kicker:'Unboxing', text:'Our latest edition just arrived.', top:1300, size:88, dur:3.5}),
    reelBeat({key:'rl8b', n:2, text:'Hardcover. Juried. Real.', top:1300, dur:3}),
    reelBeat({key:'rl8c', n:3, text:'This could hold your work.', top:1300, size:88, dur:3}),
    reelEnd()],
   caption: () => `Our latest edition just arrived. The next one could hold your work: the ${N()} is open.\n\n${kwLine()}\n${closeLn()}\n\n${tags}`},
  {id:'R9', name:'From studio to page', goal:'Story: an artist’s work in print', len:'12 s', audio:'Calm, then lift at the reveal.', tip:'Clip 1: the artist working. Clip 2: their page in the book.', video:true, beats: () => [
    reelBeat({key:'rl9a', n:1, text:'It started in the studio.', top:1300, size:88, dur:3.5}),
    reelBeat({key:'rl9b', n:2, text:'It ended up here.', top:1300, dur:3.5}),
    reelBeat({key:'rl9c', n:3, text:'Your turn.', top:1300, size:120, dur:2.5}),
    reelEnd()],
   caption: () => `It started in the studio. It ended up in print. Your turn: the ${N()} is open.\n\n${kwLine()}\n${closeLn()}\n\n${tags}`},
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
const zoneAt = (label, top, h, col) => `<div class="a zone" style="left:140px;right:140px;top:${top}px;height:${h || 190}px;border:3px dashed ${col};border-radius:28px;opacity:.55;display:flex;align-items:center;justify-content:center;text-align:center;font-size:30px;font-weight:600;line-height:1.35;padding:0 30px;color:${col}">${label}</div>`;
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


// magazine calls: the shared month copy, reworded for a magazine issue
{ const MP0 = monthPosts, SP0 = singlePosts;
  const wrap = ps => !isMag() ? ps : ps.map(p => ({...p, title: magWords(p.title),
    slides: () => p.slides().map(x => x && x.html ? {...x, html: magWords(x.html)} : x),
    ...(p.caption ? {caption: () => magWords(p.caption())} : {})}));
  monthPosts = function(){ return wrap(MP0()); };
  singlePosts = function(){ return wrap(SP0()); }; }
