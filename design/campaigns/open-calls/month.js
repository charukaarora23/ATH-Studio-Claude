/* ATH Post Studio — the month around the launch.
   Loaded before the main script; every function here runs at render time,
   so it uses the helpers and state defined in post-studio.html. */

// dummy artwork for examples until real artists' work is added (credit before posting)
const EX = { portrait:'art/flower-portrait.jpg', bloom:'art/night-bloom.jpg', field:'art/call-garden.jpg', dahlia:'art/ref-dahlias.jpg', palms:'art/ref-palms.jpg', meadow:'art/ref-reid.jpg' };

// the post being built sets this (days before the deadline)
let CURLEFT = 30;
const dateLong = () => `${dl().getDate()} ${MONTHS_L[dl().getMonth()]}`;
const leftLabel = (l = CURLEFT) => l >= 14 && l % 7 === 0 ? `${l/7} weeks left` : l > 2 ? `${l} days left` : l === 2 ? '48 hours left' : l === 1 ? '24 hours left' : 'Closes tonight';
const callName = () => `${esc(state.series)}: ${esc(state.name)}`;

// a flip-clock style timer: the countdown on every cover
const timer = (dark) => { const l = CURLEFT; const n = l > 2 ? String(l) : l > 0 ? String(l*24) : '0'; const unit = l > 2 ? 'days left' : l > 0 ? 'hours left' : 'closes tonight';
  const box = d => `<span style="display:inline-flex;align-items:center;justify-content:center;width:62px;height:80px;border-radius:10px;background:${dark ? INK : WHITE};color:${dark ? WHITE : INK};font-size:52px;font-weight:600;letter-spacing:-.03em;box-shadow:inset 0 -40px 0 rgba(0,0,0,.08)">${d}</span>`;
  return `<span style="display:inline-flex;align-items:center;gap:6px">${l > 0 ? n.split('').map(box).join('') : ''}<span class="cn" style="margin-left:10px;font-size:18px;color:${dark ? INK : WHITE};line-height:1.2">${unit.replace(' ','<br>')}</span></span>`; };
// the open-call tag, styled as an action
const callBtn = () => `<span style="display:inline-flex;align-items:center;gap:16px;height:64px;padding:0 10px 0 28px;border-radius:999px;background:${state.colour};color:${WHITE}">
  <span class="cn" style="font-size:19px">Open call · ${esc(state.name)}</span>
  <span style="width:46px;height:46px;border-radius:50%;background:${WHITE};color:${state.colour};display:inline-flex;align-items:center;justify-content:center"><svg width="22" height="10" viewBox="0 0 46 20"><path d="M2 10h40M33 2l9 8-9 8" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span>`;
const ART = ['art/flower-portrait.jpg','art/night-bloom.jpg','art/call-garden.jpg','art/ref-reid.jpg','art/ref-dahlias.jpg'];
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

// ---------- grounds ----------
const G = {
  ink:   () => ({bg:INK,   fg:WHITE, acc:tint(state.colour), dm:PEONY, line:'rgba(255,255,255,.2)'}),
  cream: () => ({bg:CREAM, fg:INK,   acc:state.colour,       dm:BURG,  line:'rgba(20,9,12,.18)'}),
  call:  () => ({bg:state.colour, fg:WHITE, acc:tint(state.colour), dm:PEONY, line:'rgba(255,255,255,.25)'}),
};
const imgDiv = (src, style, pos='center') => `<div class="a img" style="${style};background-image:url(${src});background-position:${pos}"></div>`;
const slot = (src, label, style, col) => src ? imgDiv(src, style + ';border-radius:18px') : `<div class="a ph" style="${style};color:${col}">${label}</div>`;
const btnCTA = (bg, fg, ring) => `<div class="a" style="left:110px;right:110px;top:{TOP}px;height:120px;border-radius:999px;background:${bg};color:${fg};display:flex;align-items:center;justify-content:space-between;padding:0 20px 0 54px">
  <span style="font-size:42px;font-weight:700;letter-spacing:-.02em">${VERB} “${KW()}” to apply</span>
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
  num(o){
    const g = G[o.ground||'cream']();
    if (o.img !== undefined) {
      return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr)}${slot(o.img, o.imgLabel||'Example artwork', 'left:80px;right:80px;top:150px;height:560px', g.fg)}
        <p class="a" style="left:72px;top:760px;font-size:120px;font-weight:400;letter-spacing:-.06em;line-height:.85;color:${g.acc}">${esc(o.n)}</p>
        <p class="a R" style="left:260px;right:80px;top:766px;font-size:60px;color:${g.fg}">${o.head}</p>
        <p class="a sub" style="left:260px;right:100px;top:910px;color:${g.fg};opacity:.8">${o.text}</p>`};
    }
    const band = g.bg === state.colour ? INK : state.colour, bandFg = tint(state.colour);
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr)}
      <div class="a" style="left:80px;right:80px;top:140px;height:500px;border-radius:24px;background:${band};overflow:hidden">
        <p class="a" style="left:50px;bottom:30px;font-size:300px;font-weight:400;letter-spacing:-.07em;line-height:.8;color:${bandFg}">${esc(o.n)}</p>
        <div class="a" style="right:60px;top:50%;transform:translateY(-50%)">${o.icon ? icon(o.icon, bandFg, 260) : ''}</div></div>
      <p class="a R" style="left:76px;right:80px;top:700px;font-size:84px;color:${g.fg}">${o.head}</p>
      <p class="a sub" style="left:80px;right:100px;top:${o.textTop||900}px;color:${g.fg};opacity:.85;font-size:36px">${o.text}</p>`};
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
      ${o.more ? `<p class="a sub" style="left:80px;right:120px;top:${(o.aTop||700)+(o.moreGap||250)}px;color:${g.fg};opacity:.75">${o.more}</p>` : ''}`};
  },
  // a photo slot with a caption
  photo(o){
    const g = G[o.ground||'cream']();
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr)}
      ${slot(o.img, o.label, 'left:80px;right:80px;top:150px;height:700px', g.fg)}
      <p class="a R" style="left:76px;right:80px;top:900px;font-size:${o.size||68}px;color:${g.fg}">${o.head}</p>
      ${o.sub ? `<p class="a sub" style="left:80px;right:140px;top:${o.subTop||1010}px;color:${g.fg};opacity:.8">${o.sub}</p>` : ''}`};
  },
  // four artworks with credits
  grid(o){
    const g = G[o.ground||'cream']();
    const cell = (it,i) => { const x = i%2 ? 556 : 80, y = i<2 ? 260 : 760;
      return `${slot(it.img, 'Artwork', `left:${x}px;top:${y}px;width:444px;height:380px`, g.fg)}
        <p class="a" style="left:${x}px;top:${y+398}px;font-size:26px;font-weight:600;color:${g.fg}">${gap(it.name,'Artist name')}</p>
        <p class="a" style="left:${x}px;top:${y+438}px;font-size:22px;opacity:.7;color:${g.fg}">${gap(it.meta,'Title · Country')}</p>`; };
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr)}
      <p class="a R" style="left:76px;right:80px;top:140px;font-size:64px;color:${g.fg}">${o.head}</p>
      ${o.items.map(cell).join('')}`};
  },
  // a checklist
  check(o){
    const g = G[o.ground||'cream']();
    const rows = o.items.map(t => `<div style="display:flex;align-items:center;gap:30px;padding:30px 0;border-top:2px solid ${g.line}"><span style="width:52px;height:52px;border:3px solid ${g.acc};border-radius:12px;flex:none"></span><span style="font-size:44px;font-weight:500;letter-spacing:-.02em">${t}</span></div>`).join('');
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr)}
      <p class="a R" style="left:76px;right:80px;top:200px;font-size:92px;color:${g.fg}">${o.head}</p>
      <div class="a" style="left:80px;right:80px;top:${o.top||470}px;border-bottom:2px solid ${g.line};color:${g.fg}">${rows}</div>
      ${o.foot ? `<p class="a sub" style="left:80px;right:120px;top:1110px;color:${g.fg};opacity:.75">${o.foot}</p>` : ''}`};
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
    const strip = (fg, acc) => `
      <div class="a" style="left:80px;right:80px;top:1150px;display:flex;justify-content:space-between;align-items:center;padding-top:22px;border-top:2px solid ${fg === WHITE ? 'rgba(255,255,255,.3)' : 'rgba(20,9,12,.2)'}">
        <span style="font-size:28px;font-weight:600;color:${fg}">Closes ${dateLong()}</span>
        <span style="font-size:28px;font-weight:700;color:${acc}">${VERB} “${KW()}” to apply</span></div>`;
    if (o.img) return {bg:INK, html:`${imgDiv(o.img,'inset:0',o.pos||'center 30%')}
      <div class="a" style="inset:0;background:linear-gradient(180deg,rgba(20,9,12,.45) 0%,rgba(20,9,12,0) 18%,rgba(20,9,12,0) 34%,rgba(20,9,12,.82) 58%,rgba(20,9,12,.95) 100%)"></div>
      ${corners(WHITE, PEONY, o.tr)}
      <div class="a" style="left:80px;right:80px;top:620px;display:flex;justify-content:space-between;align-items:center">${callBtn()}${timer(false)}</div>
      <p class="a H" style="left:76px;right:80px;top:740px;font-size:${o.size||88}px;color:${WHITE}">${o.head}</p>
      ${o.sub ? `<p class="a sub" style="left:80px;right:140px;top:${o.subTop||1030}px;color:${WHITE};opacity:.9">${o.sub}</p>` : ''}
      ${strip(WHITE, tint(state.colour))}`};
    const g = G[o.ground||'ink']();
    const pic = o.img2 !== undefined ? slot(o.img2, o.imgLabel || 'Real photo needed', 'left:80px;right:80px;top:140px;height:440px', g.fg)
      : imgDiv(o.art || ART[0], 'left:80px;right:80px;top:140px;height:440px;border-radius:18px', o.artPos || 'center 30%');
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr)}${pic}
      <div class="a" style="left:80px;right:80px;top:620px;display:flex;justify-content:space-between;align-items:center">${callBtn()}${timer(g.bg === CREAM)}</div>
      <p class="a H" style="left:76px;right:80px;top:740px;font-size:${o.size||80}px;color:${g.fg}">${o.head}</p>
      ${o.sub ? `<p class="a sub" style="left:80px;right:140px;top:${o.subTop||1030}px;color:${g.fg};opacity:.85">${o.sub}</p>` : ''}
      ${strip(g.fg, g.acc)}`};
  },
  // after every countdown: what the deadline is for
  value(o = {}){
    const g = G[o.ground||'ink']();
    const rows = [['book','Published in print','A juried hardcover book of ' + esc(state.selected) + ' artists'],['check','Certificate of Recognition','For your CV and grant applications'],['eye','Seen worldwide','Amazon, Barnes &amp; Noble and the ATH Shop'],['people','Introduced','To collectors, galleries and curators']];
    return {bg:g.bg, html:`${corners(g.fg, g.dm, 'What you’re applying for')}
      ${imgDiv(o.art || ART[2], 'left:80px;right:80px;top:140px;height:300px;border-radius:18px', 'center 40%')}
      <p class="a R" style="left:76px;right:80px;top:490px;font-size:72px;color:${g.fg}">What you’re applying for.</p>
      <div class="a" style="left:80px;right:80px;top:620px">${rows.map(([ic,t,d]) => `<div style="display:flex;align-items:center;gap:28px;padding:20px 0;border-top:2px solid ${g.line}">
        ${icon(ic, g.acc, 64)}<div><p style="font-size:36px;font-weight:600;letter-spacing:-.02em;color:${g.fg}">${t}</p><p style="font-size:26px;margin-top:4px;color:${g.fg};opacity:.75">${d}</p></div></div>`).join('')}</div>`};
  },
  // every carousel closes on this: the same clear action
  cta(o = {}){
    const g = G[o.ground||'call']();
    const b = (g.bg === CREAM ? btnCTA(BURG, CREAM, CREAM) : btnCTA(CREAM, BURG, BURG)).replace('{TOP}', 800);
    return {bg:g.bg, html:`${corners(g.fg, g.dm, o.tr||'Submissions open')}
      ${o.kicker ? `<p class="a c lab" style="left:0;right:0;top:230px;color:${g.acc}">${o.kicker}</p>` : ''}
      <p class="a H c" style="left:60px;right:60px;top:290px;font-size:96px;color:${g.fg}">Apply to the<br>${esc(state.name)}.</p>
      <p class="a c sub" style="left:140px;right:140px;top:540px;color:${g.fg};opacity:.92">${o.sub || `Get published in a juried hardcover book of ${esc(state.selected)} artists.`}</p>
      <div class="a" style="left:0;right:0;top:680px;display:flex;justify-content:center"><span class="cn" style="display:inline-flex;align-items:center;height:56px;padding:0 28px;border-radius:999px;background:${g.bg === CREAM ? INK : tint(state.colour)};color:${g.bg === CREAM ? CREAM : INK};font-size:22px">Closes ${dateLong()} · ${leftLabel()}</span></div>
      ${b}
      <p class="a c" style="left:0;right:0;top:970px;font-size:30px;color:${g.fg};opacity:.92">or apply via the link in bio</p>
      <p class="a c" style="left:0;right:0;top:1022px;font-size:28px;color:${g.fg};opacity:.75">artstoheartsproject.com</p>`};
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
        <p class="sub" style="margin-top:12px;color:${INK}">The ${esc(state.name)} is open until ${dateLong()}.<br>${VERB} “${KW()}” to apply.</p></div>`};
  },
};

// ---------- countdown singles: a different idea at every milestone ----------
const CD = {
  weeks(left){ const g = G.cream(); const n = left; const d0 = new Date(dl()); d0.setDate(d0.getDate() - left);
    const cells = Array.from({length:n+1}, (_,i) => { const d = new Date(d0); d.setDate(d.getDate()+i); const last = i === n;
      return `<div style="height:120px;border-radius:12px;${last ? `background:${state.colour};color:${WHITE}` : `border:2px solid rgba(20,9,12,.18);color:${INK}`};display:flex;align-items:center;justify-content:center;font-size:44px;font-weight:500">${d.getDate()}</div>`; }).join('');
    return {bg:g.bg, html:`${corners(INK, BURG, 'Two weeks left')}
      <div class="a" style="left:80px;top:180px"><span class="cn" style="display:inline-flex;align-items:center;height:48px;padding:0 24px;background:${INK};color:${CREAM};border-radius:999px">Open call · ${callName()}</span></div>
      <p class="a H" style="left:76px;right:80px;top:270px;font-size:120px;color:${INK}">Two weeks left<br>to apply.</p>
      <p class="a sub" style="left:80px;right:120px;top:540px;color:${INK}">To the ${esc(state.series)}: ${esc(state.name)}. ${esc(state.selected)} artists will be published.</p>
      <div class="a" style="left:80px;right:80px;top:680px;display:grid;grid-template-columns:repeat(8,1fr);gap:10px">${cells}</div>
      <p class="a lab" style="right:80px;top:930px;color:${state.colour}">${dateLong()}: submissions close</p>
      ${btnCTA(BURG, CREAM, CREAM).replace('{TOP}', 1020)}`}; },
  hours(h, ground){ const g = G[ground](); const rows = h > 24 ? 2 : 1;
    const ticks = Array.from({length:h}, () => `<div style="height:${rows === 2 ? 70 : 110}px;border-radius:4px;background:${g.acc}"></div>`).join('');
    return {bg:g.bg, html:`${corners(g.fg, g.dm, h + ' hours left')}
      <div class="a" style="left:80px;top:180px"><span class="cn" style="display:inline-flex;align-items:center;height:48px;padding:0 24px;background:${g.bg === CREAM ? INK : tint(state.colour)};color:${g.bg === CREAM ? CREAM : INK};border-radius:999px">Open call · ${callName()}</span></div>
      <p class="a" style="left:60px;top:270px;font-size:440px;font-weight:400;letter-spacing:-.07em;line-height:.85;color:${g.fg}">${h}</p>
      <p class="a R" style="left:80px;top:650px;font-size:70px;color:${g.fg}">hours left to apply to the ${esc(state.name)}.</p>
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
      <p class="a sub" style="left:80px;right:200px;top:400px;color:${INK};opacity:.8">Submissions for the ${esc(state.series)}: ${esc(state.name)} close ${dateLong()}. ${esc(state.selected)} artists will be published.</p>
      <div class="a" style="left:80px;right:80px;top:620px;display:flex;gap:6px">${bars}</div>
      <p class="a" style="left:72px;top:800px;font-size:260px;font-weight:400;letter-spacing:-.07em;line-height:.85;color:${state.colour}">${left}</p>
      <p class="a R" style="left:420px;top:880px;font-size:64px;color:${INK}">days left<br>to submit</p>
      ${btnCTA(BURG, CREAM, CREAM).replace('{TOP}', 1080)}`}; },
  big(left, ground = 'call'){ const g = G[ground]();
    return {bg:g.bg, html:`${corners(g.fg, g.dm, left + ' days left')}
      <p class="a c" style="left:0;right:0;top:170px;font-size:600px;font-weight:400;letter-spacing:-.08em;line-height:.85;color:${g.fg}">${left}</p>
      <p class="a c R" style="left:0;right:0;top:720px;font-size:80px;color:${g.fg}">days left to submit to the</p>
      <p class="a c scr" style="left:0;right:0;top:830px;font-size:84px;color:${g.acc}">${esc(state.series)}: ${esc(state.name)}</p>
      ${(g.bg === CREAM ? btnCTA(BURG, CREAM, CREAM) : btnCTA(CREAM, BURG, BURG)).replace('{TOP}', 1020)}`}; },
  week(left){ const g = G.ink(); const d0 = new Date(dl()); d0.setDate(d0.getDate() - left);
    const days = Array.from({length:left+1}, (_,i) => { const d = new Date(d0); d.setDate(d.getDate()+i); const last = i === left;
      return `<div style="flex:1;height:200px;border-radius:14px;${last ? `background:${tint(state.colour)};color:${INK}` : `border:2px solid rgba(255,255,255,.3);color:${WHITE}`};display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-size:22px;font-weight:700;letter-spacing:.1em">${['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()]}</span><span style="font-size:56px;font-weight:500;margin-top:8px">${d.getDate()}</span></div>`; }).join('');
    return {bg:g.bg, html:`${corners(WHITE, PEONY, 'One week')}
      <p class="a R" style="left:76px;right:80px;top:230px;font-size:130px;color:${WHITE}">One week left.</p>
      <p class="a sub" style="left:80px;right:160px;top:430px;color:${WHITE};opacity:.9">Seven days to apply to the ${esc(state.series)}: ${esc(state.name)}. ${esc(state.selected)} artists will be published.</p>
      <div class="a" style="left:80px;right:80px;top:640px;display:flex;gap:10px">${days}</div>
      <p class="a lab" style="right:80px;top:870px;color:${tint(state.colour)}">Submissions close ↑</p>
      ${btnCTA(CREAM, BURG, BURG).replace('{TOP}', 1010)}`}; },
  shelf(left){ const g = G.cream();
    const sp = [[PEONY,300],[BURG,340],[INK,310],[CREAM,330]].map(([c,h]) => `<div style="width:90px;height:${h}px;background:${c};border-radius:3px 3px 0 0;box-shadow:inset 0 0 0 2px rgba(20,9,12,.12)"></div>`).join('');
    return {bg:g.bg, html:`${corners(INK, BURG, left + ' days left')}
      <p class="a R c" style="left:80px;right:80px;top:220px;font-size:96px;color:${INK}">${left} days to take your place<br>in the ${esc(state.name)}.</p>
      <div class="a" style="left:240px;right:240px;top:540px;height:360px;display:flex;align-items:flex-end;justify-content:center;gap:12px;border-bottom:6px solid ${INK}">${sp}
        <div style="width:130px;height:350px;border:3px dashed ${state.colour};border-bottom:none;border-radius:3px 3px 0 0;background:${rgba(tint(state.colour),.45)};position:relative">${spineLab(state.name, state.colour, 28)}</div></div>
      ${btnCTA(BURG, CREAM, CREAM).replace('{TOP}', 1010)}`}; },
  three(left){ const g = G.ink();
    return {bg:g.bg, html:`${corners(WHITE, PEONY, 'Three days')}
      <div class="a" style="left:80px;right:80px;top:200px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
        ${[3,2,1].map((n,i) => `<div style="height:520px;border-radius:24px;${i===0 ? `background:${tint(state.colour)};color:${INK}` : `border:2px solid rgba(255,255,255,.25);color:rgba(255,255,255,.4)`};display:flex;align-items:center;justify-content:center;font-size:300px;letter-spacing:-.06em">${n}</div>`).join('')}</div>
      <p class="a R c" style="left:80px;right:80px;top:770px;font-size:70px;color:${WHITE}">Three days left to apply to<br>the ${esc(state.name)}.</p>
      ${btnCTA(CREAM, BURG, BURG).replace('{TOP}', 1010)}`}; },
  tomorrow(){ const g = G.call();
    return {bg:g.bg, html:`${corners(WHITE, PEONY, 'Closes tomorrow')}
      <p class="a H c" style="left:60px;right:60px;top:320px;font-size:190px;color:${WHITE}">Closes<br>tomorrow.</p>
      <p class="a c sub" style="left:140px;right:140px;top:760px;color:${WHITE}">Submissions for the ${esc(state.name)} close ${dl().getDate()} ${MONTHS_L[dl().getMonth()]}.</p>
      ${btnCTA(CREAM, BURG, BURG).replace('{TOP}', 940)}`}; },
  tonight(){ const CH = '#AA0003';
    return {bg:CH, html:`${corners(WHITE, PEONY, 'Final day')}
      <div class="a" style="left:0;right:0;top:220px;display:flex;justify-content:center"><span class="cn" style="display:inline-flex;align-items:center;height:48px;padding:0 24px;background:${CREAM};color:${CH};border-radius:999px">Open call · ${callName()}</span></div>
      <p class="a H c" style="left:60px;right:60px;top:320px;font-size:150px;color:${WHITE}">Final hours.<br>Closes tonight.</p>
      <p class="a c sub" style="left:140px;right:140px;top:700px;color:${WHITE}">This is the last call to be considered for the ${esc(state.name)}.</p>
      ${btnCTA(CREAM, CH, CH).replace('{TOP}', 940)}`}; },
};

// ---------- the month: built on each other, from attention to urgency ----------
const tags = '#ArtsToHeartsProject #OpenCall #CallForArtists #101ArtBook';
const kwLine = () => `${VERB === 'COMMENT' ? 'Comment' : 'DM us'} "${(state.keyword||'KEYWORD').toUpperCase()}"${VERB === 'COMMENT' ? ' below' : ''} for the full brief, or apply via the link in bio.`;
const closeLn = () => `Submissions close ${dl().getDate()} ${MONTHS_L[dl().getMonth()]}.`;
const N = () => state.name, S = () => state.series, SEL = () => state.selected;

function monthPosts(){ const name = esc(state.name), sel = esc(state.selected); return [
 {left:30, title:'Launch', kind:'Carousel', slides:() => launch(), caption:() => caption(), pin:() => pinned()},

 {left:28, title:'What you can submit', kind:'Carousel · theme', slides:() => [
   T.hook({img:EX.bloom, tr:'The theme', head:`What can you submit to the ${name}?`, sub:`Five kinds of work the jury wants to see. ${sel} will be published.`}),
   T.num({img:EX.dahlia, n:'1', head:'A single bloom.', text:`Close looking counts. One flower or leaf, made with care, is eligible for the ${name}.`, tr:'What you can submit'}),
   T.num({img:EX.meadow, n:'2', head:'A landscape.', text:'Fields, hedgerows, the view from a window you grew up with.', tr:'What you can submit', ground:'ink'}),
   T.num({img:EX.portrait, n:'3', head:'People and nature.', text:'Figures and faces intertwined with the growing world.', tr:'What you can submit'}),
   T.num({img:EX.palms, n:'4', head:'Abstract growth.', text:'Colour, rhythm and form that feel alive, without a single petal.', tr:'What you can submit', ground:'ink'}),
   T.num({img:EX.field, n:'5', head:'A garden remembered.', text:'An imagined or remembered place. Memory is a garden too.', tr:'What you can submit'}),
   T.cta({kicker:'Any medium · Original work only', sub:`If your work fits one of these, it belongs in the running for the ${name}.`}),
 ], caption:() => `What can you submit to the ${N()}?

The jury is looking for five kinds of garden work:
1. A single bloom
2. A landscape
3. People and nature
4. Abstract growth
5. A garden remembered or imagined

Any medium. Original work only. ${SEL()} artists will be selected and published in a juried hardcover book.

${kwLine()}
${closeLn()}

Example artworks are shown for illustration. ${tags}`},

 {left:26, title:'Your work on this shelf', kind:'Single · proof', slides:() => [
   T.hook({ground:'cream', img2: state.images.imgBooks || null, imgLabel:'Real photo needed<br>The books together', size:76, tr:'The collection', head:`Your work could be on this shelf.`, sub:`${esc(state.editions)} editions. ${esc(state.published)} artists published. The ${name} is next, with ${sel} places.`, }),
 ], caption:() => `Your work could be on this shelf.

${state.editions} editions of the ${S()} since ${state.since}, with ${state.published} artists published. The ${N()} is next, and it has ${SEL()} places.

${kwLine()}
${closeLn()}

${tags}`},

 {left:24, title:'Inside the book', kind:'Carousel · proof', slides:() => [
   T.hook({ground:'ink', img2: state.images.imgSpread || null, imgLabel:'Real photo needed<br>A spread from a past edition', size:72, tr:'Inside the book', head:'This is what being published with us looks like.', sub:`Selected artists appear in the ${name} exactly like this.`}),
   T.photo({img:state.images.imgSpread, label:'Real photo needed<br>A spread from a past edition', tr:'Inside the book', head:'Every artist, in print.', sub:'Name, artwork title, medium and country, on the page.'}),
   T.photo({img:null, label:'Real photo needed<br>A second spread', tr:'Inside the book', head:'Juried and curated.', sub:'Each edition is selected by a jury and laid out as one collection.', ground:'ink'}),
   T.photo({img:null, label:'Real photo needed<br>The book on a shelf or in a shop', tr:'Inside the book', head:'Sold worldwide.', sub:'Through Amazon, Barnes & Noble and the ATH Shop.'}),
   T.photo({img:null, label:'Real photo needed<br>An artist holding their copy', tr:'Inside the book', head:'Introduced beyond the feed.', sub:'Each book is shared with collectors, galleries and curators.', ground:'ink'}),
   T.cta({kicker:'Your page could be next'}),
 ], caption:() => `This is what being published with Arts to Hearts looks like.

Every selected artist appears in print with their name, artwork title, medium and country, in a juried hardcover collection sold worldwide and shared with collectors, galleries and curators.

The ${N()} is open now, with ${SEL()} places.
${kwLine()}
${closeLn()}

${tags}`},

 {left:22, title:'Your questions, answered', kind:'Carousel · doubts', slides:() => [
   T.hook({img:EX.meadow, pos:'center 40%', tr:'Your questions', head:`Thinking of applying to the ${name}? Read this first.`, sub:'The seven questions artists ask us most, answered.'}),
   T.qa({q:'I’m self-taught. Can I apply?', a:'Yes. No degree, gallery or exhibition history needed.', ground:'call'}),
   T.qa({q:'I don’t live in the US.', a:'Open to artists worldwide, 18 and over.', ground:'cream'}),
   T.qa({q:'Is digital work accepted?', a:'Yes. Any medium, traditional or digital.', ground:'call'}),
   T.qa({q:'Can I submit AI-generated work?', a:'No. Original work only.', ground:'cream'}),
   T.qa({q:'Is there a fee?', a:`An application fee applies${state.fee ? ': ' + esc(state.fee) : ''}.`, more: state.fee ? '' : '<span class="gap">Add the fee wording in the form</span>'}),
   T.qa({q:'When will I hear back?', a:`Results: ${gap(state.results,'Date')}.`, ground:'call'}),
   T.qa({q:'Do I keep the rights to my work?', a:'<span class="gap">Confirm the rights wording</span>'}),
   T.cta({kicker:'Still have a question? DM us'}),
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

 {left:20, title:'Garden artworks we love', kind:'Carousel · for art lovers + artists', slides:() => [
   T.hook({img:EX.portrait, tr:'From past editions', head:'Garden artworks from our Nature, Floral and Landscape editions.', size:76, sub:`The ${name} is open for the next ones.`}),
   T.grid({head:'From the Floral Edition', items:[{},{},{},{}], tr:'From past editions'}),
   T.grid({head:'From the Nature Edition', items:[{},{},{},{}], tr:'From past editions', ground:'call'}),
   T.grid({head:'From the Landscape Edition', items:[{},{},{},{}], tr:'From past editions'}),
   T.ctaList({head:'Want the full list?', sub:'All twelve garden artworks, every artist credited and linked.', button:'COMMENT “GARDENLIST”'}),
 ], caption:() => `Garden artworks from our Nature, Floral and Landscape editions of the ${S()}.

Every artist is credited on the slides. Comment "GARDENLIST" and we'll send you all twelve, with links to each artist.

Are you an artist? The ${N()} is open until ${dl().getDate()} ${MONTHS_L[dl().getMonth()]}. ${kwLine()}

[Credit every artist here: Name · @handle]
#ArtsToHeartsProject #ArtCollectors #EmergingArtists #OpenCall`},

 {left:18, title:'Photograph your art for print', kind:'Carousel · education', slides:() => [
   T.hook({img:EX.dahlia, pos:'center 40%', tr:'For your submission', head:`Applying to the ${name}? Photograph your work like this.`, sub:'Five steps that help the jury see your work properly. Save this.'}),
   T.num({icon:'sun', n:'01', head:'Use daylight.', text:'Near a window, out of direct sun. Avoid flash and yellow indoor light.', tr:'Photo tips'}),
   T.num({icon:'level', n:'02', head:'Shoot straight on.', text:'Camera parallel to the work, centred, so nothing looks tilted or stretched.', tr:'Photo tips', ground:'ink'}),
   T.num({icon:'crop', n:'03', head:'Fill the frame.', text:'Crop to the artwork only. No walls, easels or hands.', tr:'Photo tips'}),
   T.num({icon:'drop', n:'04', head:'Keep true colour.', text:'No filters. Compare the photo to the artwork before you send it.', tr:'Photo tips', ground:'ink'}),
   T.num({icon:'grid', n:'05', head:'Send it large.', text:'Use the highest resolution your camera allows. Print needs detail.', tr:'Photo tips'}),
   T.cta({kicker:'Photo ready? Submit it'}),
 ], caption:() => `Applying to the ${N()}? Photograph your artwork like this:

1. Daylight, near a window, no flash
2. Straight on, centred
3. Crop to the artwork only
4. True colour, no filters
5. The highest resolution you have

Save this for your submission.
${kwLine()}
${closeLn()}

${tags}`},

 {left:15, title:'15 days left · halfway', kind:'Carousel · countdown', slides:() => [CD.half(15), T.value(), T.cta()], caption:() => `Halfway. 15 days left to submit to the ${N()}.

${SEL()} artists will be selected and published in a juried hardcover book.
${kwLine()}
${closeLn()}

${tags}`},

 {left:14, title:'2 weeks left', kind:'Carousel · countdown', slides:() => [CD.weeks(14), T.value({ground:'call', art:ART[1]}), T.cta()], caption:() => `Two weeks left to submit to the ${N()}.

Choose one original artwork, photograph it in daylight, and submit.
${kwLine()}
${closeLn()}

${tags}`},

 {left:13, title:'From submission to print', kind:'Carousel · artist story', slides:() => [
   T.hook({ground:'cream', art:ART[4], tr:'An artist’s story', head:'From one submission to a page in print.', sub:`How a past artist got published, and why the ${name} could be your turn.`}),
   T.quote({tr:'An artist’s story'}),
   T.photo({img:null, label:'Real photo needed<br>The artwork they submitted', tr:'An artist’s story', head:'The work they sent.', sub:'<span class="gap">Title, medium, and why they chose it</span>'}),
   T.photo({img:null, label:'Real photo needed<br>Their page in the book', tr:'An artist’s story', head:'The page it became.', sub:'<span class="gap">Edition and what happened next</span>', ground:'ink'}),
   T.cta({kicker:'Your story could start here'}),
 ], caption:() => `From one submission to a page in print.

[Artist name] submitted [artwork] to the [Edition]. Here is the page it became, and what happened next, in their words.

The ${N()} is open now.
${kwLine()}
${closeLn()}

${tags}`},

 {left:12, title:'12 days left · how selection works', kind:'Carousel · trust', slides:() => [
   T.hook({ground:'call', art:ART[1], artPos:'center 40%', tr:'Selection', head:`How ${sel} artists are selected for the ${name}.`, sub:'What happens to your submission, step by step.'}),
   T.num({icon:'eye', n:'01', head:'Every entry is reviewed.', text:`Each eligible submission is seen by ${state.jury ? esc(state.jury) : 'the jury'}.`, tr:'Selection'}),
   T.num({icon:'target', n:'02', head:'What the jury looks for.', text:'Originality, a considered reading of the theme, and the quality of the work.', tr:'Selection', ground:'ink'}),
   T.num({icon:'people', n:'03', head:`${sel} are selected.`, text:'Chosen to work together as one collection, not ranked.', tr:'Selection'}),
   T.num({icon:'book', n:'04', head:'Results, then print.', text:`Results ${gap(state.results,'date')}. The book is published ${gap(state.pub,'month')}.`, tr:'Selection', ground:'ink'}),
   T.cta({kicker:'Send your best work'}),
 ], caption:() => `How ${SEL()} artists are selected for the ${N()}.

Every eligible submission is reviewed. The jury looks for originality, a considered reading of the theme, and the quality of the work. ${SEL()} artists are selected to work together as one collection.

12 days left.
${kwLine()}
${closeLn()}

${tags}`},

 {left:10, title:'10 days left', kind:'Carousel · countdown', slides:() => [CD.big(10), T.value(), T.cta({ground:'cream'})], caption:() => `10 days left to submit to the ${N()}.

${kwLine()}
${closeLn()}

${tags}`},

 {left:9, title:'Apply in 10 minutes', kind:'Carousel · ease', slides:() => [
   T.hook({ground:'call', art:ART[2], tr:'Before you submit', head:`Apply to the ${name} in ten minutes.`, sub:'Everything you need, in one checklist.'}),
   T.check({head:'Your checklist.', tr:'Before you submit', items:['One original artwork','A clear photo in daylight','Title, medium and size','Your name and country','Submit through the link in bio'], foot:'It takes about ten minutes.'}),
   T.cta({kicker:'Ten minutes. One artwork.'}),
 ], caption:() => `Apply to the ${N()} in ten minutes. You need:

☐ One original artwork
☐ A clear photo in daylight
☐ Title, medium and size
☐ Your name and country

${kwLine()}
${closeLn()}

${tags}`},

 {left:8, title:'Bring the garden home', kind:'Carousel · for collectors + artists', slides:() => [
   T.hook({img:EX.field, tr:'From the ATH Shop', head:'The books our artists are published in.', size:88, sub:`Shop the collection, or apply to be in the ${name}.`}),
   T.photo({img:null, label:'Real photo needed<br>The Nature Edition', tr:'From the ATH Shop', head:'The Nature Edition.', sub:'101 artists and their relationship with the natural world.'}),
   T.photo({img:null, label:'Real photo needed<br>The Floral Edition', tr:'From the ATH Shop', head:'The Floral Edition.', sub:'<span class="gap">One line about this edition</span>', ground:'ink'}),
   T.ctaList({head:'Shop the collection.', sub:'Every edition is a gallery you can hold.', button:'Shop · link in bio', tr:'From the ATH Shop'}),
 ], caption:() => `The books our artists are published in.

The Nature Edition and the Floral Edition bring together artists from around the world and their relationship with the natural world. Shop them through the link in bio or at artstoheartsproject.com.

Are you an artist? The ${N()} is open. ${kwLine()}
${closeLn()}

#ArtsToHeartsProject #ArtBooks #ArtCollectors #OpenCall`},

 {left:7, title:'One week left', kind:'Carousel · countdown', slides:() => [CD.week(7), T.value({ground:'call', art:ART[3]}), T.cta()], caption:() => `One week left to submit to the ${N()}.

Seven days to choose your artwork, photograph it and submit.
${kwLine()}
${closeLn()}

${tags}`},

 {left:6, title:'Five mistakes to avoid', kind:'Carousel · education', slides:() => [
   T.hook({ground:'cream', art:ART[3], tr:'Before you submit', head:`Five mistakes that cost artists a place in the ${name}.`, sub:'Six days left to get it right.'}),
   T.num({icon:'blur', n:'01', head:'A blurry or tilted photo.', text:'The jury can only judge what they can see.', tr:'Avoid this', ground:'ink'}),
   T.num({icon:'filter', n:'02', head:'Filters and editing.', text:'If the colours are wrong, the work is misread.', tr:'Avoid this'}),
   T.num({icon:'target', n:'03', head:'Ignoring the theme.', text:'Show us your reading of it, however personal.', tr:'Avoid this', ground:'ink'}),
   T.num({icon:'star', n:'04', head:'Sending your second-best piece.', text:'One artwork. Make it the one you are proudest of.', tr:'Avoid this'}),
   T.num({icon:'clock', n:'05', head:'Waiting for the last day.', text:'Submit early and get it off your list.', tr:'Avoid this', ground:'ink'}),
   T.cta({kicker:'Six days left'}),
 ], caption:() => `Five mistakes that cost artists a place in the ${N()}:

1. A blurry or tilted photo
2. Filters and editing
3. Ignoring the theme
4. Sending your second-best piece
5. Waiting for the last day

${kwLine()}
${closeLn()}

${tags}`},

 {left:5, title:'5 days left', kind:'Carousel · countdown', slides:() => [CD.shelf(5), T.value({art:ART[4]}), T.cta()], caption:() => `5 days to take your place in the ${N()}.

${kwLine()}
${closeLn()}

${tags}`},

 {left:4, title:'Why artists apply', kind:'Carousel · motivation', slides:() => [
   T.hook({ground:'ink', art:ART[0], artPos:'center 15%', tr:'Why artists apply', head:`Why artists send their work to the ${esc(state.series)}.`, sub:'Four days left to join them.'}),
   T.num({icon:'book', n:'01', head:'A credit that lasts.', text:'A published book for your CV, website and grant applications.', tr:'Why artists apply'}),
   T.num({icon:'eye', n:'02', head:'Seen beyond the feed.', text:'A book shared with collectors, galleries and curators.', tr:'Why artists apply', ground:'ink'}),
   T.num({icon:'people', n:'03', head:'Part of a collection.', text:`One of ${sel} artists, around one idea, from around the world.`, tr:'Why artists apply'}),
   T.quote({tr:'Why artists apply'}),
   T.cta({kicker:'Four days left'}),
 ], caption:() => `Why artists send their work to the ${S()}:

A credit that lasts. Being seen beyond the feed. Being part of a collection of ${SEL()} artists from around the world.

Four days left to submit to the ${N()}.
${kwLine()}

${tags}`},

 {left:3, title:'3 days left', kind:'Carousel · countdown', slides:() => [CD.three(3), T.value({ground:'call', art:ART[0]}), T.cta({ground:'cream'})], caption:() => `3 days left to submit to the ${N()}.

${kwLine()}
${closeLn()}

${tags}`},

 {left:2, title:'48 hours left', kind:'Carousel · countdown', slides:() => [CD.hours(48, 'call'), T.value({art:ART[2]}), T.cta()], caption:() => `48 hours left to submit to the ${N()}.

${kwLine()}
${closeLn()}

${tags}`},

 {left:2, title:'Last questions', kind:'Carousel · doubts', slides:() => [
   T.hook({ground:'ink', art:ART[1], tr:'Last questions', head:`48 hours left. Your last questions, answered.`, sub:`Before the ${name} closes.`}),
   T.qa({q:'Can I submit more than one artwork?', a:'<span class="gap">Confirm the rule</span>', ground:'cream', tr:'Last questions'}),
   T.qa({q:'How long does it take?', a:'About ten minutes.', tr:'Last questions'}),
   T.qa({q:'What happens after I submit?', a:`The jury reviews every entry. Results ${gap(state.results,'date')}.`, ground:'cream', tr:'Last questions'}),
   T.cta({kicker:'48 hours left'}),
 ], caption:() => `48 hours left. Your last questions before the ${N()} closes:

· How long does it take? About ten minutes.
· What happens after? The jury reviews every entry.

${kwLine()}

${tags}`},

 {left:1, title:'24 hours left', kind:'Carousel · countdown', slides:() => [CD.hours(24, 'ink'), T.value({ground:'call', art:ART[1]}), T.cta({ground:'cream'})], caption:() => `24 hours left to submit to the ${N()}.

Submissions close ${dl().getDate()} ${MONTHS_L[dl().getMonth()]}.
${kwLine()}

${tags}`},

 {left:0, title:'Last day', kind:'Single · countdown', slides:() => [CD.lastDay()], caption:() => `Last day to submit to the ${N()}.

Tomorrow the jury begins selecting ${SEL()} artists. Make sure your work is one of the submissions they see.
${kwLine()}

${tags}`},

 {left:0, title:'Final hours', kind:'Single · last call', slides:() => [CD.tonight()], caption:() => `Final hours. The ${N()} closes tonight.

${kwLine()}

${tags}`},
];}

// ---------- stories (1080 x 1920) ----------
function storyFrame(o){
  const g = o.ground ? G[o.ground]() : {bg:INK, fg:WHITE, acc:tint(state.colour)};
  const zone = o.zone ? `<div class="a" style="left:140px;right:140px;top:${o.zoneTop||1260}px;height:${o.zoneH||200}px;border:3px dashed ${g.fg};border-radius:28px;opacity:.55;display:flex;align-items:center;justify-content:center;text-align:center;font-size:26px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:${g.fg}">${o.zone}</div>` : '';
  return {h:1920, bg:g.bg, html:`
    ${o.img ? imgDiv(o.img,'inset:0',o.pos||'center 30%') + `<div class="a" style="inset:0;background:linear-gradient(180deg,rgba(20,9,12,.55) 0%,rgba(20,9,12,0) 22%,rgba(20,9,12,0) 45%,rgba(20,9,12,.85) 72%,rgba(20,9,12,.95) 100%)"></div>` : ''}
    <p class="a cn" style="left:64px;top:250px;color:${g.fg}">Arts to Hearts</p><p class="a cn" style="right:64px;top:250px;color:${g.fg}">${esc(o.tr||state.name)}</p>
    ${o.kicker ? `<p class="a lab" style="left:80px;top:${o.top||820}px;color:${g.acc}">${esc(o.kicker)}</p>` : ''}
    <p class="a H" style="left:76px;right:80px;top:${(o.top||820)+50}px;font-size:${o.size||110}px;color:${g.fg}">${o.head}</p>
    ${o.sub ? `<p class="a sub" style="left:80px;right:120px;top:${o.subTop||((o.top||820)+330)}px;color:${g.fg};opacity:.9">${o.sub}</p>` : ''}
    ${zone}`};
}
function stories(){ const kw = KW(); return [
  {phase:'Launch day', frames:[
    storyFrame({img:state.images.imgCover, pos:'center 10%', kicker:'Open call · Edition ' + state.edition, head:`The ${esc(state.name)} is open.`, sub:`${esc(SEL())} artists will be published.`, top:1000, zone:'Add link sticker: Apply', zoneTop:1500}),
    storyFrame({ground:'call', kicker:'New edition', head:`${esc(SEL())} places.<br>Will you apply?`, top:500, zone:'Add poll: Yes, I’m in / Thinking about it', zoneTop:1100}),
    storyFrame({ground:'cream', kicker:'How to start', head:`DM “${kw}”<br>for the full brief.`, top:500, zone:'Add countdown sticker: closes ' + short(), zoneTop:1100}),
  ]},
  {phase:'Mid-month', frames:[
    storyFrame({img:state.images.imgTheme, pos:'center 40%', kicker:'The theme', head:'Does your work fit?', sub:'A bloom, a landscape, a memory. Most garden work does.', top:1000, zone:'Add quiz sticker', zoneTop:1520}),
    storyFrame({ground:'ink', kicker:'Ask us', head:'What’s stopping you from applying?', top:500, zone:'Add question box', zoneTop:1100}),
    storyFrame({ground:'cream', kicker:'Photo tip', head:'Shoot in daylight, straight on, no filters.', sub:'Print needs true colour.', top:500, subTop:930, zone:'Add link sticker: Apply', zoneTop:1250}),
  ]},
  {phase:'Final week', frames:[
    storyFrame({ground:'ink', kicker:'One week', head:'7 days left.', size:180, top:520, zone:'Add countdown sticker', zoneTop:1100}),
    storyFrame({ground:'call', kicker:'Three days', head:'3 days left.', size:180, top:520, zone:'Add link sticker: Apply', zoneTop:1100}),
    storyFrame({ground:'cream', kicker:'Closes tomorrow', head:`Last chance:<br>${VERB} “${kw}”.`, top:520, zone:'Add countdown sticker', zoneTop:1100}),
    Object.assign(storyFrame({ground:'ink', kicker:'Final day', head:'Closes tonight.', size:170, top:520, zone:'Add link sticker: Apply now', zoneTop:1100}), {bg:'#AA0003'}),
  ]},
]; }
