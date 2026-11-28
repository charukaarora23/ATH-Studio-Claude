// Campaign covers for the open-call month (Nov 2026, after the Instagram review).
// Every post's first slide has one job and one action:
//   urgency posts  -> CV.count: Burgundy, giant countdown, a bar of the call's days (how much is gone), real published work as proof
//   value posts    -> CV.hook:  the artwork big, a solid Ink panel with a hook that gives a reason to act (no gradients)
//   last day       -> CV.last
// and all end on the same full-width Pink keyword band, so the keyword is the action on every cover.
// The month posts keep their own slides; only slide 1 is replaced (monthPosts is wrapped below).
// Saved text edits on the old covers are cleared once (cvMigrate), because the new covers have different text.

const CV_FULL = () => /magazine/i.test(state.series || '') ? `${esc(state.series)}, ${esc(state.name)}` : state.series && !/^arts to hearts$/i.test(state.series) ? `the ${esc(state.series)}: ${esc(state.name)}` : `the ${esc(state.name)}`;
const cvVerb = () => (typeof CMODE === 'function' && CMODE()) || VERB === 'COMMENT' ? 'Comment' : 'DM';
const cvTop = (fg, tr) => `<p class="a cn" style="left:52px;top:48px;color:${fg}">Arts to Hearts Project</p><p class="a cn" style="right:52px;top:48px;color:${fg}">${esc(tr || '')}</p>`;
// the action: one band, full width, the keyword large
const cvBand = (sub) => `<div class="a" style="left:0;right:0;bottom:0;height:178px;background:${PEONY};display:flex;align-items:center;justify-content:space-between;padding:0 64px">
  <span style="display:flex;align-items:baseline;gap:20px;color:${BURG}"><span style="font-size:40px;font-weight:500;letter-spacing:-.02em">${cvVerb()}</span><span style="font-size:76px;font-weight:700;letter-spacing:-.03em">${KW()}</span></span>
  <span style="text-align:right;color:${BURG};font-size:27px;font-weight:500;line-height:1.3">${sub || `we’ll send you the link<br>closes ${dateLong()}`}</span></div>`;
// how much of the call is gone, one cell per day
function cvBar(left, fg){ const L = Math.max(7, Math.min(45, typeof cmLen === 'function' ? cmLen(state) : 30)); const gone = Math.max(0, Math.min(L, L - left));
  const o = typeof cmOpens === 'function' ? cmOpens(state) : null; const op = o ? `${o.getDate()} ${MONTHS[o.getMonth()]}` : '';
  return `<div class="a" style="left:80px;right:80px;top:{TOP}px;display:flex;gap:6px">${Array.from({length: L}, (_, i) => `<span style="flex:1;height:34px;border-radius:5px;${i < gone ? `background:${ROSE_C}` : `border:2px solid ${fg === WHITE ? 'rgba(255,255,255,.45)' : 'rgba(20,9,12,.3)'}`}"></span>`).join('')}</div>
  <div class="a" style="left:80px;right:80px;top:calc({TOP}px + 52px);display:flex;justify-content:space-between;font-size:24px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${fg};opacity:.85"><span>${op ? 'Opened ' + op : ''}</span><span style="color:${PEONY};opacity:1">Closes ${dateLong()}</span></div>`; }
const ROSE_C = '#FFA1C2';
// real published work as proof: whole artworks on white cards, never cropped
function cvProof(top){ const pa = [1, 2, 3, 4].map(i => state.images['pa' + i]).filter(Boolean); const use = pa.length >= 3 ? pa.slice(0, 4) : [ART[0], ART[1], ART[2], ART[3]].filter(Boolean);
  const cap = pa.length >= 3 && PAST()[0] ? `Published in ${esc(PAST()[0])}. Yours could be next.` : '';
  return `<div class="a" style="left:80px;right:80px;top:${top}px;display:grid;grid-template-columns:repeat(${use.length},1fr);gap:18px">${use.map(u => `<div style="background:#fff;border-radius:10px;padding:12px;height:230px"><div data-nolabel class="img" style="width:100%;height:100%;background-image:url(${u});background-size:contain;background-repeat:no-repeat;background-position:center"></div></div>`).join('')}</div>
  ${cap ? `<p class="a ser" style="left:80px;right:80px;top:${top + 262}px;font-size:30px;color:${WHITE};opacity:.9">${cap}</p>` : ''}`; }

const CV = {
  count(o){ const left = o.left; const big = esc(o.big), unit = esc(o.unit);
    return {bg:BURG, html:`${cvTop(WHITE, o.tr)}
      <p class="a lab" style="left:80px;top:150px;color:${PEONY}">Open call · ${CV_FULL().replace(/^the /, '')}</p>
      <p class="a" style="left:66px;top:190px;font-size:${big.length > 2 ? 300 : 380}px;font-weight:700;letter-spacing:-.07em;line-height:.9;color:${WHITE}">${big}</p>
      <p class="a" style="left:${big.length > 2 ? 620 : big.length === 2 ? 520 : 330}px;top:${big.length > 2 ? 250 : 290}px;font-size:76px;font-weight:700;letter-spacing:-.03em;line-height:.95;text-transform:uppercase;color:${PEONY}">${unit.replace(' ', '<br>')}</p>
      <p class="a H" style="left:80px;right:80px;top:560px;font-size:52px;color:${WHITE}">${o.line}</p>
      ${cvBar(left, WHITE).replace(/\{TOP\}/g, 720)}
      ${cvProof(860)}
      ${cvBand()}`}; },
  hook(o){ return {bg:INK, html:`<div class="a img" style="left:0;right:0;top:0;height:720px;background-image:url(${o.img || ART[0]});background-position:${o.pos || 'center 35%'}"></div>
      ${cvTop(WHITE, o.tr)}
      <div class="a" style="left:0;right:0;top:720px;bottom:0;background:${INK}"></div>
      <p class="a lab" style="left:80px;right:80px;top:780px;color:${PEONY}">${o.kicker}</p>
      <p class="a H" style="left:76px;right:80px;top:826px;font-size:${o.size || 72}px;color:${WHITE}">${o.head}</p>
      <p class="a" style="left:80px;right:80px;top:1086px;font-size:30px;font-weight:500;color:${WHITE};opacity:.8">${typeof offerLine === 'function' ? offerLine() : ''}</p>
      ${cvBand(o.bandSub)}`}; },
  last(o){ return {bg:BURG, html:`${cvTop(WHITE, 'Last day')}
      <p class="a lab" style="left:80px;top:150px;color:${PEONY}">Open call · ${CV_FULL().replace(/^the /, '')}</p>
      <p class="a" style="left:70px;right:80px;top:200px;font-size:190px;font-weight:700;letter-spacing:-.06em;line-height:.9;color:${WHITE}">Closes<br>tonight.</p>
      <p class="a H" style="left:80px;right:80px;top:600px;font-size:52px;color:${WHITE}">Midnight is your last chance to get into ${/^issue\s/i.test(state.name || '') ? esc(state.name) : CV_FULL()}.</p>
      ${cvBar(0, WHITE).replace(/\{TOP\}/g, 760)}
      ${cvProof(880)}
      ${cvBand(`we’ll send you the link<br>closes at midnight`)}`}; },
};

// what each post's cover is for, and what it says (the slides after it stay as they are)
const CV_PLAN = {
  'What you can submit':          {hook:1, kicker:'Before you apply', head:'Does your work fit? Here’s exactly what the jury wants.'},
  'Inside the book':              {hook:1, kicker:'Picture this', head:'This could be your page.'},
  'Your questions, answered':     {hook:1, kicker:'Never exhibited? Self-taught?', head:'You can still be selected. Here’s how.'},
  'Published artists':            {hook:1, kicker:'They applied too', head:'Now their work is in print. Your turn.'},
  'Photograph your art for print':{hook:1, kicker:'Save this before you submit', head:'Your phone is enough. Shoot your work like this.'},
  'Halfway: the call at a glance':{count:1, big:'15', unit:'days left', line:() => `Half the time is gone. Your place in ${CV_FULL()} is still open.`},
  'From submission to print':     {hook:1, kicker:'One artist’s story', head:'One submission. One printed page.'},
  'How selection works':          {hook:1, kicker:'Every entry is seen', head:'What makes the jury say yes.'},
  'Prepare your submission':      {count:1, big:'9', unit:'days left', line:() => `Choose your work this weekend. Here’s what to get ready.`},
  'One week left':                {count:1, big:'7', unit:'days left', line:() => `${esc(state.selected)} places in ${CV_FULL()}. One week to claim yours.`},
  'Five mistakes to avoid':       {hook:1, kicker:'Don’t lose your place', head:'Good work gets passed over for these five reasons.'},
  'Why artists apply':            {hook:1, kicker:'What it does for you', head:'A juried credit opens the next door.'},
  '48 hours: last questions':     {count:1, big:'48', unit:'hours left', line:() => `Then the jury starts. Your last questions, answered.`},
  'Last day':                     {last:1},
};

// wrap the month: the first slide of each planned post becomes its campaign cover
(() => { const base = monthPosts;
  monthPosts = function(){ return base().map(p => { const c = CV_PLAN[p.title]; if (!c) return p;
    return {...p, slides: () => { const s = p.slides(); if (!s.length) return s; const old = s[0];
      const left = typeof planLeft === 'function' ? planLeft(base().findIndex(x => x.title === p.title), p) : p.left;
      const img = (old.html.match(/background-image:url\(([^)]+)\)/) || [])[1];   // keep the artwork the post already had
      s[0] = {...(c.count ? CV.count({...c, left, line: c.line(), tr: p.title === 'Halfway: the call at a glance' ? 'Halfway' : leftLabel(left)}) : c.last ? CV.last({}) : CV.hook({...c, img, tr: (old.html.match(/class="a cn" style="right:52px;top:48px[^>]*>([^<]*)</) || [])[1] || ''})), title: old.title || 'cover', cv: 1};
      return s; }}; }); };
})();

// the old covers' saved text edits would land on the wrong lines of the new covers: clear them once per call
function cvMigrate(){ if (state.cv2) return; const titles = Object.keys(CV_PLAN);
  ['texts', 'moves', 'pos'].forEach(k => { const o = state[k]; if (!o) return; Object.keys(o).forEach(key => { if (titles.some(t => key.includes('|' + t + '|0|') || key.startsWith(t + '|0|'))) delete o[key]; }); });
  state.cv2 = 1; }
