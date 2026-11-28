// Open-call covers in the approved Open Call System (design/campaigns/open-calls: deadlines-v2.html,
// ATH-open-call-system.html, ATH-open-call-playbook.html). One frame on every cover:
//   [ bracket label ] top left · closing date top right · call name in Instrument Serif italic (call accent)
//   artwork in a rounded frame (24px) · one device · the keyword button (12px corners, not a pill) · Open Calls logo · LINK IN BIO →
// Countdowns are the approved deadline card (Ink, big serif number, "days left", "to apply to ..."); last day is the
// approved last-call card without the circle sticker (user: no circle badges). Value posts use the same frame on
// cream or peony with a headline that has one serif italic phrase. No split pages, no artwork grids, no gradients.
// Only slide 1 of each month post is replaced; old cover text edits are cleared once (cvMigrate, flag cv3).

let CV_LOGO = '';
fetch('brand/opencalls-logo.svg').then(r => r.ok ? r.text() : '').then(t => { CV_LOGO = t.replace(/role="img"/, 'role="img" style="height:42px;width:auto;display:block"'); }).catch(() => {});
const CV_INK = '#1C1310', CV_CREAM = '#F9EEE5';
const cvAccent = () => { const t = `${state.series || ''} ${state.name || ''}`; return /garden/i.test(t) ? '#D0D996' : /of the year/i.test(t) ? '#FFF3B2' : /wom[ae]n/i.test(t) ? '#FFA1C2' : '#FAD2E1'; };
const cvName = () => /magazine/i.test(state.series || '') && /^issue\s/i.test(state.name || '') ? `Magazine ${esc(state.name)}` : esc(state.name || '');
const cvKey = () => `${(typeof CMODE === 'function' && CMODE()) || VERB === 'COMMENT' ? 'Comment' : 'DM'} <b>${KW()}</b> <svg width="22" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8h19M14 2l7 6-7 6"/></svg>`;
const cvDate = () => `Closes ${short()}`;
// the frame every cover shares
function cvFrame({bg, fg, lab, labCol, title = true, img, imgTop = 240, imgH = 500, body, btnBg, btnFg}){
  const t = cvName(), tsize = t.length > 20 ? 78 : 96;
  return {bg, html:`<p class="a" style="left:72px;top:64px;font:600 21px/1 'ATH Tight',Inter,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:${labCol}">[&nbsp;&nbsp;${lab}&nbsp;&nbsp;]</p>
    <p class="a" style="right:72px;top:64px;font:500 21px/1 'ATH Tight',Inter,sans-serif;color:${fg}">${cvDate()}</p>
    ${title ? `<h2 class="a" style="left:68px;right:72px;top:118px;font-family:IS,Georgia,serif;font-style:italic;font-weight:400;letter-spacing:-.02em;line-height:.9;font-size:${tsize}px;color:${labCol}">${t}</h2>` : ''}
    ${img ? `<div data-nolabel class="a img" style="left:72px;right:72px;top:${imgTop}px;height:${imgH}px;border-radius:24px;background-image:url(${img});background-position:50% 35%"></div>` : ''}
    ${body}
    <div class="a" style="left:72px;top:1090px"><span style="display:inline-flex;align-items:center;gap:14px;height:84px;padding:0 32px;border-radius:12px;font:500 30px/1 'ATH Tight',Inter,sans-serif;white-space:nowrap;background:${btnBg};color:${btnFg}">${cvKey().replace('<b>', '<b style="font-weight:700;letter-spacing:.05em">')}</span></div>
    <div class="a" style="left:72px;bottom:62px;color:${fg}">${CV_LOGO || `<p style="font:500 30px/1 'ATH Tight';color:${fg}">arts <i style="font-family:IS">to</i> hearts</p>`}</div>
    <p class="a" style="right:72px;bottom:70px;font:600 20px/1 'ATH Tight',Inter,sans-serif;letter-spacing:.12em;color:${fg}">LINK IN BIO →</p>`}; }

const CV = {
  // the approved deadline card
  count(o){ const acc = cvAccent(); const n = String(o.big);
    return cvFrame({bg:CV_INK, fg:CV_CREAM, lab:'Deadline', labCol:acc, img: state.images.imgCover || o.img, btnBg:CV_CREAM, btnFg:BURG,
      body:`<p class="a" style="left:62px;top:770px;font-family:IS,Georgia,serif;font-weight:400;line-height:.9;letter-spacing:-.02em;font-size:${n.length > 1 ? 260 : 300}px;color:${CV_CREAM}">${esc(n)}</p>
        <div class="a" style="left:${n.length > 1 ? 340 : 275}px;right:72px;top:820px"><p style="font-family:IS,Georgia,serif;font-style:italic;font-size:110px;line-height:.9;color:${CV_CREAM}">${esc(o.unit)}</p>
        <p style="font:400 30px/1.3 'ATH Tight',Inter,sans-serif;color:${CV_CREAM};opacity:.85;margin-top:14px">${o.line}</p></div>`}); },
  // the approved last-call card (no sticker)
  last(){ const acc = cvAccent();
    return cvFrame({bg:CV_INK, fg:CV_CREAM, lab:'Last call', labCol:acc, img: state.images.imgCover, btnBg:CV_CREAM, btnFg:BURG,
      body:`<p class="a" style="left:72px;right:72px;top:790px;font-family:IS,Georgia,serif;font-weight:400;line-height:.9;letter-spacing:-.02em;font-size:150px;color:${CV_CREAM}">Closes <em style="color:${acc}">tonight.</em></p>`}); },
  // value posts: same frame, light ground, one serif italic phrase in the headline
  hook(o){ const peony = o.ground === 'peony'; const bg = peony ? PEONY : CV_CREAM;
    return cvFrame({bg, fg:CV_INK, lab:o.label, labCol:BURG, title:false, img:o.img, imgTop:330, imgH:560, btnBg:BURG, btnFg:CV_CREAM,
      body:`<h2 class="a" style="left:70px;right:72px;top:118px;font:500 ${o.size || 84}px/1 'ATH Tight',Inter,sans-serif;letter-spacing:-.035em;color:${CV_INK}">${o.head.replace(/<em>/g, '<em style="font-family:IS,Georgia,serif;font-style:italic;font-weight:400;letter-spacing:-.01em">')}</h2>
        <p class="a" style="left:72px;right:72px;top:930px;font:400 32px/1.3 'ATH Tight',Inter,sans-serif;color:${CV_INK}">${o.sub || ''}</p>`}); },
};

const cvOffer = () => { const full = /magazine/i.test(state.series || '') ? `${esc(state.series)}, ${esc(state.name)}` : esc(state.name); return `Get published in ${full}.${state.prize ? ` Win ${esc(state.prize)}.` : ''}`; };
const cvTo = () => `to apply to ${/magazine/i.test(state.series || '') ? esc(state.series) + ', ' + esc(state.name) : esc(state.name)}`;
// each post: its cover's job (phase in the playbook) and words
const CV_PLAN = {
  'What you can submit':          {label:'Before you apply', head:'Does your work <em>fit?</em>', sub:() => `Here’s exactly what the jury wants to see. ${cvOffer()}`},
  'Inside the book':              {label:'Picture this', head:'This could be <em>your page.</em>', sub:() => cvOffer()},
  'Your questions, answered':     {label:'Your questions', ground:'peony', head:'Never exhibited? <em>You can still apply.</em>', size:76, sub:() => 'Straight answers to what artists ask us before they apply.'},
  'Published artists':            {label:'From past issues', head:'They applied. <em>Now they’re in print.</em>', size:76, sub:() => `${cvOffer()} Your turn.`},
  'Photograph your art for print':{label:'Save this', head:'Your phone <em>is enough.</em>', sub:() => 'Five steps to a photo the jury can judge properly.'},
  'Halfway: the call at a glance':{count:1, big:'15', unit:'days left', line:() => cvTo()},
  'From submission to print':     {label:'One artist’s story', head:'One submission. <em>One printed page.</em>', size:76, sub:() => cvOffer()},
  'How selection works':          {label:'Selection', ground:'peony', head:'What makes the jury <em>say yes.</em>', sub:() => 'Every eligible entry is reviewed. Here’s how.'},
  'Prepare your submission':      {count:1, big:'9', unit:'days left', line:() => cvTo()},
  'One week left':                {count:1, big:'7', unit:'days left', line:() => cvTo()},
  'Five mistakes to avoid':       {label:'Before you submit', head:'Don’t lose your place <em>over these.</em>', size:76, sub:() => 'Five things that cost good work its place. All easy to fix.'},
  'Why artists apply':            {label:'Why artists apply', ground:'peony', head:'What print does for <em>your next step.</em>', size:76, sub:() => cvOffer()},
  '48 hours: last questions':     {count:1, big:'48', unit:'hours left', line:() => cvTo()},
  'Last day':                     {last:1},
};

(() => { const base = monthPosts;
  monthPosts = function(){ const list = base(); return list.map(p => { const c = CV_PLAN[p.title]; if (!c) return p;
    return {...p, slides: () => { const s = p.slides(); if (!s.length) return s; const old = s[0];
      const img = (old.html.match(/background-image:url\(([^)]+)\)/) || [])[1];
      s[0] = {...(c.count ? CV.count({...c, line: c.line(), img}) : c.last ? CV.last() : CV.hook({...c, sub: c.sub(), img: img || state.images.imgCover})), title: old.title || 'cover', cv: 1};
      return s; }}; }); };
})();

function cvMigrate(){ if (state.cv3) return; const titles = Object.keys(CV_PLAN);
  ['texts', 'moves', 'pos'].forEach(k => { const o = state[k]; if (!o) return; Object.keys(o).forEach(key => { if (titles.some(t => key.includes('|' + t + '|0|') || key.startsWith(t + '|0|'))) delete o[key]; }); });
  state.cv3 = 1; }
