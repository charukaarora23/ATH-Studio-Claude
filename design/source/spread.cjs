// The open folder: inside of the front cover (left), spine, back cover with chapter tabs (right).
const { C, F, GRAIN, FIBRE, paperBg, frontPath, svg } = require('./lib.cjs');
const { header, mono, at } = require('./frames.cjs');

// Back cover body with tabs grown out of its right edge.
function rightTabsPath(w, h, tabs, d, r = 16) {
  const s = 18;
  let p = `M0 0 L${w - r} 0 Q${w} 0 ${w} ${r}`;
  for (const t of tabs) {
    const y = t.y, l = t.h;
    p += ` L${w} ${y - s} C${w} ${y - 6} ${w + d} ${y - 2} ${w + d} ${y + 12}`;
    p += ` L${w + d} ${y + l - 12} C${w + d} ${y + l + 2} ${w} ${y + l + 6} ${w} ${y + l + s}`;
  }
  p += ` L${w} ${h - r} Q${w} ${h} ${w - r} ${h} L0 ${h} Z`;
  return p;
}

const CHAPTERS = ['Purpose', 'Practice', 'The work', 'Background', 'Draft'];

const btn = (label, kind = 'primary', extra = '') => {
  const k = {
    primary: `background:${C.burgundy};color:${C.peony};`,
    secondary: `box-shadow:inset 0 0 0 1px rgba(106,6,32,.35);color:${C.burgundy};`,
    text: `color:${C.burgundy};padding:0 4px;`,
    onDark: `background:${C.peony};color:${C.burgundy};`,
  }[kind];
  return `<div data-group="Button / ${label.replace(/[^\w .]/g, '').trim() || 'Icon'}" style="display:inline-flex;align-items:center;gap:10px;height:44px;padding:0 22px;border-radius:999px;font:600 15px/1 ${F.ui};${k}${extra}">${label}</div>`;
};

/* o.active: chapter index (or -1), o.done: number of completed chapters,
   o.left: html on the inside cover, o.page: html of the top sheet, o.slips: pocket slips */
function spread(o) {
  const W = 1280, H = 780;
  const LW = 604, SP = 22, RW = 596, TD = 40;
  const fh = H - 26; // front cover is shorter than the back, as in the closed folder
  const tabs = CHAPTERS.map((_, i) => ({ y: 92 + i * 128, h: 92 }));
  const rx = LW + SP;
  const pageL = 26, pageT = 26;

  const slips = (o.slips || []).map((s, i) => `
    <div style="position:absolute;left:${34 + i * 10}px;top:${i * 46}px;width:${LW - 120}px;height:120px;${paperBg}border-radius:3px;box-shadow:0 0 0 1px rgba(76,66,64,.14),0 2px 4px rgba(42,10,18,.12);transform:rotate(${[-0.6, 0.4, -0.2, 0.3][i % 4]}deg)">
      <div style="position:absolute;left:18px;top:13px;right:18px;display:flex;justify-content:space-between;align-items:baseline">
        <span style="font:500 16px/1.2 ${F.soft};color:${C.ink}">${s.title}</span>
        <span style="${mono(10, s.fresh ? C.chilli : C.cocoa)}">${s.meta}</span>
      </div>
    </div>`).join('');

  const tabLabels = CHAPTERS.map((c, i) => {
    const active = i === o.active, done = i < (o.done || 0);
    const col = active ? C.peony : done ? C.hotRose : 'rgba(250,210,225,.55)';
    return `<div style="position:absolute;left:${rx + RW}px;top:${tabs[i].y}px;width:${TD}px;height:${tabs[i].h}px;display:flex;align-items:center;justify-content:center">
      <div style="transform:rotate(90deg);white-space:nowrap;${mono(10, col)};letter-spacing:.12em">${String(i + 1).padStart(2, '0')} ${c}</div>
      ${active ? `<div style="position:absolute;right:7px;top:16px;bottom:16px;width:2px;border-radius:2px;background:${C.hotRose}"></div>` : ''}
    </div>`;
  }).join('');

  return `<div data-group="Open folder" style="position:absolute;left:80px;top:${o.top || 112}px;width:${W}px;height:${H}px">
    <div style="position:absolute;left:40px;right:60px;bottom:-10px;height:60px;border-radius:50%;box-shadow:0 34px 60px -14px rgba(42,10,18,.28)"></div>

    <!-- inside of the front cover -->
    <div data-group="Inside front cover" style="position:absolute;left:0;top:26px;width:${LW}px;height:${fh}px">
      ${svg(LW, fh, `<defs><linearGradient id="inL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#650520"/><stop offset=".86" stop-color="${C.burgundy}"/><stop offset="1" stop-color="${C.burgundy800}"/></linearGradient></defs>
        <g transform="translate(${LW} 0) scale(-1 1)"><path d="${frontPath(LW, fh, LW - 210, 110, 16, 14, 5, true)}" fill="url(#inL)"/></g>
        <path d="M24 ${fh - 14} L${LW - 18} ${fh - 14}" stroke="${C.peony}" stroke-opacity=".3" stroke-dasharray="5 4" stroke-linecap="round"/>`)}
      <div data-grain-prev=".6" style="position:absolute;inset:0;background:url(${GRAIN});opacity:.6;mix-blend-mode:overlay;border-radius:5px 0 0 14px;clip-path:inset(0 0 0 0 round 5px 0 0 14px)"></div>
      <div style="position:absolute;left:44px;top:44px;right:56px">${o.left || ''}</div>
      <!-- pocket: a folded flap of the same board, holding slips -->
      <div data-group="Pocket" style="position:absolute;left:0;right:0;bottom:0;height:${o.pocketH || 300}px">
        ${o.card ? `<div style="position:absolute;left:36px;width:${LW - 110}px;top:-${o.card.h}px;height:${o.card.h + 120}px;${paperBg}border-radius:3px;box-shadow:0 0 0 1px rgba(76,66,64,.14),0 2px 4px rgba(42,10,18,.14);transform:rotate(-.5deg)"><div style="position:absolute;left:30px;top:0;bottom:0;border-left:1.5px dotted rgba(170,0,3,.24)"></div><div style="position:absolute;left:52px;right:26px;top:22px">${o.card.html}</div></div>` : ''}
        <div style="position:absolute;left:0;right:0;top:-${(o.slips || []).length * 46 + 34}px;height:${(o.slips || []).length * 46 + 160}px">${slips}</div>
        ${svg(LW, o.pocketH || 300, `<defs><linearGradient id="pk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A1230"/><stop offset="1" stop-color="${C.burgundy700}"/></linearGradient></defs>
          <path d="M0 34 L${LW} 4 L${LW} ${(o.pocketH || 300) - 14} Q${LW} ${o.pocketH || 300} ${LW - 14} ${o.pocketH || 300} L14 ${o.pocketH || 300} Q0 ${o.pocketH || 300} 0 ${(o.pocketH || 300) - 14} Z" fill="url(#pk)"/>
          <path d="M0 34 L${LW} 4" stroke="${C.hotRose}" stroke-opacity=".5"/>
          <path d="M0 37 L${LW} 7" stroke="${C.burgundy900}" stroke-opacity=".6"/>
          <path d="M20 48 L${LW - 20} 20" stroke="${C.peony}" stroke-opacity=".28" stroke-dasharray="5 4"/>`)}
        <div style="position:absolute;left:44px;right:56px;bottom:40px">${o.pocket || ''}</div>
      </div>
    </div>

    <!-- spine with two creases -->
    <div style="position:absolute;left:${LW}px;top:0;width:${SP}px;height:${H}px;background:linear-gradient(90deg,#3A0614,${C.burgundy900} 30%,#4E0A1C 50%,${C.burgundy900} 70%,#3A0614)"></div>
    <div style="position:absolute;left:${LW + 7}px;top:0;width:1px;height:${H}px;background:rgba(255,161,194,.16)"></div>
    <div style="position:absolute;left:${LW + 14}px;top:0;width:1px;height:${H}px;background:rgba(255,161,194,.10)"></div>

    <!-- back cover with integrated chapter tabs -->
    <div data-group="Back cover with chapter tabs" style="position:absolute;left:${rx}px;top:0;width:${RW + TD}px;height:${H}px">
      ${svg(RW, H, `<defs><linearGradient id="inR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.burgundy900}"/><stop offset=".08" stop-color="${C.burgundy800}"/><stop offset="1" stop-color="#5A0A21"/></linearGradient></defs>
        <path d="${rightTabsPath(RW, H, tabs, TD)}" fill="url(#inR)"/>
        <path d="${rightTabsPath(RW, H, tabs, TD)}" fill="none" stroke="${C.hotRose}" stroke-opacity=".22"/>`)}
    </div>
    ${tabLabels}

    <!-- sheets under the active page -->
    <div style="position:absolute;left:${rx + pageL + 6}px;top:${pageT + 10}px;width:${RW - pageL * 2}px;height:${H - pageT * 2 - 6}px;${paperBg}border-radius:3px;box-shadow:0 0 0 1px rgba(76,66,64,.14);transform:rotate(.7deg)"></div>
    <div style="position:absolute;left:${rx + pageL + 2}px;top:${pageT + 4}px;width:${RW - pageL * 2}px;height:${H - pageT * 2 - 2}px;${paperBg}border-radius:3px;box-shadow:0 0 0 1px rgba(76,66,64,.14);transform:rotate(-.4deg)"></div>
    <!-- active page -->
    <div data-group="Page" style="position:absolute;left:${rx + pageL}px;top:${pageT}px;width:${RW - pageL * 2}px;height:${H - pageT * 2}px;${paperBg}border-radius:3px;box-shadow:0 0 0 1px rgba(76,66,64,.14),0 1px 2px rgba(42,10,18,.08),0 14px 28px -18px rgba(42,10,18,.35)">
      <div style="position:absolute;left:46px;top:0;bottom:0;border-left:1.5px dotted rgba(170,0,3,.26)"></div>
      <div style="position:absolute;left:70px;right:40px;top:40px;bottom:36px">${o.page || ''}</div>
    </div>
    ${o.overlay || ''}
  </div>`;
}

// ---------- form pieces ----------
const chip = (label, on) => `<div data-group="Chip / ${label}${on ? ' / selected' : ''}" style="flex:none;white-space:nowrap;display:inline-flex;align-items:center;height:36px;padding:0 15px;border-radius:999px;font:500 14px/1 ${F.ui};${on ? `background:${C.burgundy};color:${C.peony};` : `box-shadow:inset 0 0 0 1px rgba(106,6,32,.28);color:${C.burgundy};`}">${label}</div>`;
const fieldLabel = (t, opt) => `<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px"><span style="font:600 15px/1.2 ${F.ui};color:${C.ink}">${t}</span>${opt ? `<span style="${mono(10, C.cocoa)}">Optional</span>` : ''}</div>`;
const hint = (t) => `<div style="font:400 15px/1.4 ${F.soft};color:${C.cocoa};margin-bottom:10px">${t}</div>`;
const ruled = (value, focus, ph) => `<div style="position:relative;height:44px;border-bottom:1px solid rgba(76,66,64,.35);font:400 20px/44px ${F.soft};color:${value ? C.ink : C.cocoa300};${focus ? `box-shadow:0 0 0 3px ${C.hotRose};border-radius:12px;border-bottom-color:transparent;padding:0 12px;margin:0 -12px;` : ''}">${value || ph || ''}${focus ? `<span style="display:inline-block;width:1.5px;height:24px;background:${C.ink};vertical-align:-5px;margin-left:1px"></span>` : ''}</div>`;
const pageHead = (n, of, eyebrow, q) => `
  <div style="display:flex;justify-content:space-between;${mono(11, C.chilli)}"><span>${eyebrow}</span><span style="color:${C.cocoa}">Page ${n} of ${of}</span></div>
  <div style="margin-top:18px;font:300 40px/1.04 ${F.soft};letter-spacing:-.02em;color:${C.burgundy}">${q}</div>`;
const pageFoot = (back, next, skip) => `<div style="position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:space-between">
  <div>${back ? btn('← Back', 'secondary') : ''}</div>
  <div style="display:flex;align-items:center;gap:18px">${skip ? `<span style="font:500 14px/1 ${F.ui};color:${C.burgundy};text-decoration:underline;text-underline-offset:4px">Skip for now</span>` : ''}${btn(next + ' →')}</div></div>`;
const exampleNote = (t) => `<div style="margin-top:12px;padding:10px 14px;border-radius:12px;background:rgba(255,243,178,.55);box-shadow:inset 0 0 0 1px rgba(76,66,64,.12)"><div style="${mono(9.5, C.cocoa)}">Fictional example · not added to your notes</div><div style="margin-top:4px;font:italic 400 15px/1.4 ${F.soft};color:${C.cocoa}">${t}</div></div>`;

const leftTitle = (eyebrow, title, line) => `<div style="${mono(11, C.hotRose)}">${eyebrow}</div>
  <div style="margin-top:14px;font:700 52px/0.95 ${F.statement};letter-spacing:-.045em;color:${C.peony}">${title}</div>
  ${line ? `<div style="margin-top:16px;width:440px;font:400 17px/1.45 ${F.soft};color:${C.peony}">${line}</div>` : ''}`;

module.exports = { spread, btn, chip, fieldLabel, hint, ruled, pageHead, pageFoot, exampleNote, leftTitle, CHAPTERS, rightTabsPath };
