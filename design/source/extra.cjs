// Mobile frames, foundations, folder anatomy/states and motion storyboard.
const { C, F, GRAIN, FIBRE, paperBg, folder, THEMES, backPath, svg } = require('./lib.cjs');
const { mono, at, BIO_DOCS, ST_DOCS } = require('./frames.cjs');
const { btn, chip, fieldLabel, hint, ruled, exampleNote, CHAPTERS } = require('./spread.cjs');

const mHeader = (left, right) => `<div style="position:absolute;left:0;top:0;width:390px;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid rgba(106,6,32,.1)">${left}${right}</div>`;
const allDocs = [...BIO_DOCS.map((d) => ({ ...d, tag: 'Bio' })), ...ST_DOCS.map((d) => ({ ...d, tag: 'Stmt' }))];

function mStudio() {
  const f = (o) => folder({ w: 350, h: 224, frontTop: 86, ts: 32, tabW: 118, ...o, line: '' });
  return `${mHeader(`<div style="font:700 17px/1 ${F.statement};letter-spacing:-.03em;color:${C.burgundy}">Arts to Hearts</div>`, `<div style="display:flex;gap:8px;align-items:center"><div style="height:36px;padding:0 14px;border-radius:999px;box-shadow:inset 0 0 0 1px rgba(106,6,32,.22);display:flex;align-items:center;font:500 13px/1 ${F.ui};color:${C.burgundy}">Settings</div><div style="width:36px;height:36px;border-radius:50%;background:${C.burgundy};color:${C.peony};display:flex;align-items:center;justify-content:center;font:600 13px/1 ${F.ui}">SI</div></div>`)}
  ${at(20, 88, `<div style="${mono(11, C.chilli)}">My Studio</div><div style="margin-top:10px;width:350px;font:700 38px/0.98 ${F.statement};letter-spacing:-.045em;color:${C.burgundy}">Good afternoon, Sana.</div><div style="margin-top:12px;width:340px;font:400 17px/1.45 ${F.soft};color:${C.cocoa}">Open a folder to write. Every version you file stays inside.</div>`)}
  ${at(20, 262, f({ id: 'm1', theme: THEMES.bio, docs: BIO_DOCS, idx: '01', name: 'Bio', title: 'Artist bio', line: 'Who you are, where you work and what you make.', tabX: 30 }))}
  ${at(20, 436, f({ id: 'm2', theme: THEMES.statement, docs: ST_DOCS, idx: '02', name: 'Statement', title: 'Artist statement', line: 'Subjects, materials, process and why.', tabX: 116, tabW: 136 }))}
  ${at(20, 610, f({ id: 'm3', theme: THEMES.files, docs: allDocs, idx: '03', name: 'My files', title: 'My files', line: 'Search, reopen and export.', tabX: 200 }))}`;
}

// Mobile page: the back cover becomes a band of tabs; the active tab is the page's own tab.
function mTabs(active) {
  const gap = 4;
  return `<div style="position:absolute;left:0;top:60px;width:390px;height:58px;background:${C.burgundy800}"></div>
  <div style="position:absolute;left:12px;top:72px;display:flex;gap:${gap}px">${['Purpose', 'Practice', 'Work', 'Background', 'Draft'].map((c, i) => `<div style="flex:none;white-space:nowrap;padding:0 14px;height:46px;border-radius:12px 12px 0 0;display:flex;align-items:center;justify-content:center;${i === active ? `${paperBg}color:${C.burgundy};` : `color:rgba(250,210,225,.7);`}${mono(10, i === active ? C.burgundy : 'rgba(250,210,225,.72)')}">${String(i + 1).padStart(2, '0')} ${c}</div>`).join('')}</div>`;
}

function mPage2() {
  return `${mHeader(`<div style="font:600 15px/1 ${F.ui};color:${C.burgundy}">← Artist bio</div>`, `<div style="${mono(10.5, C.cocoa)}">Page 2 of 4 · Notes 5</div>`)}
  ${mTabs(1)}
  <div style="position:absolute;left:0;top:118px;width:390px;height:726px;${paperBg}">
    <div style="position:absolute;left:18px;top:0;bottom:0;border-left:1.5px dotted rgba(170,0,3,.26)"></div>
    <div style="position:absolute;left:36px;right:22px;top:26px">
      <div style="${mono(10.5, C.chilli)}">02 · Practice</div>
      <div style="margin-top:12px;font:300 32px/1.06 ${F.soft};letter-spacing:-.02em;color:${C.burgundy}">How would you describe what you make?</div>
      <div style="margin-top:22px">${fieldLabel('Name as it should appear')}${ruled('Sana Iqbal')}</div>
      <div style="margin-top:20px">${fieldLabel('Medium or practice')}${hint('Plain words are best. Fragments are fine.')}${ruled('textiles, natural dye, large hangings', true)}${exampleNote('“Painter working in oil and found wood.”')}</div>
      <div style="margin-top:20px">${fieldLabel('Where you live or work', true)}${ruled('', false, 'City, region or country')}</div>
    </div>
  </div>
  <div style="position:absolute;left:0;bottom:0;width:390px;height:84px;background:rgba(251,246,239,.96);border-top:1px solid rgba(76,66,64,.14);display:flex;align-items:center;justify-content:space-between;padding:0 20px">${btn('←', 'secondary', 'width:44px;padding:0;justify-content:center')}<span style="font:500 14px/1 ${F.ui};color:${C.burgundy};text-decoration:underline;text-underline-offset:4px">Skip for now</span>${btn('Next page →')}</div>`;
}

function mReview() {
  return `${mHeader(`<div style="font:600 15px/1 ${F.ui};color:${C.burgundy}">← Artist bio</div>`, `<div style="${mono(10.5, C.cocoa)}">Draft · Facts 6</div>`)}
  <div style="position:absolute;left:0;top:60px;width:390px;height:58px;background:${C.burgundy800}"></div>
  <div style="position:absolute;left:12px;top:72px;width:366px;height:46px;border-radius:12px 12px 0 0;${paperBg}display:flex;align-items:center;justify-content:space-between;padding:0 16px;${mono(10, C.burgundy)}"><span>05 Draft</span><span style="color:${C.cocoa}">Third person</span></div>
  <div style="position:absolute;left:0;top:118px;width:390px;height:726px;${paperBg}">
    <div style="position:absolute;left:18px;top:0;bottom:0;border-left:1.5px dotted rgba(170,0,3,.26)"></div>
    <div style="position:absolute;left:36px;right:22px;top:24px">
      <div style="font:400 18px/1.56 ${F.soft};color:${C.ink}">Sana Iqbal is a textile artist who works with natural dye and large woven hangings. Her work returns to salt, coastlines and the kitchen of her grandmother’s house, where she first learned to dye cloth with onion skins and rust. She dyes each length by hand and leaves the uneven edges of the dye bath visible, so the colour records time spent in the water. Self-taught, she has developed her process through years of daily practice.</div>
      <div style="margin-top:18px;display:flex;justify-content:space-between;align-items:baseline"><span style="font:600 14px/1 ${F.ui};color:${C.ink}">104 of 150 words</span><span style="${mono(10, C.petrol)}">Fits</span></div>
      <div style="margin-top:8px;height:4px;border-radius:4px;background:rgba(76,66,64,.14)"><div style="width:69%;height:4px;border-radius:4px;background:${C.petrol}"></div></div>
      <div style="margin-top:16px;padding:12px 14px;border-radius:12px;box-shadow:inset 0 0 0 1px rgba(76,66,64,.18);display:flex;justify-content:space-between;align-items:center"><span style="font:600 14px/1 ${F.ui};color:${C.burgundy}">Facts used in this draft</span><span style="${mono(10, C.cocoa)}">6 · View</span></div>
    </div>
  </div>
  <div style="position:absolute;left:0;bottom:0;width:390px;height:84px;background:rgba(251,246,239,.96);border-top:1px solid rgba(76,66,64,.14);display:flex;align-items:center;gap:8px;padding:0 20px">${btn('Copy', 'secondary', 'padding:0 16px')}${btn('.txt', 'secondary', 'padding:0 16px')}<div style="flex:1"></div>${btn('File →')}</div>`;
}

// ---------- Foundations ----------
function foundations() {
  const sw = (name, hex, role, dark) => `<div data-group="Swatch / ${name}" style="width:196px"><div style="height:96px;border-radius:12px;background:${hex};box-shadow:inset 0 0 0 1px rgba(76,66,64,.12);display:flex;align-items:flex-end;padding:12px;font:700 22px/1 ${F.statement};letter-spacing:-.03em;color:${dark ? C.peony : C.burgundy}">Aa</div><div style="margin-top:10px;font:600 14px/1.2 ${F.ui};color:${C.ink}">${name}</div><div style="${mono(10, C.cocoa)};margin-top:4px">${hex}</div><div style="margin-top:6px;font:400 14px/1.35 ${F.soft};color:${C.cocoa}">${role}</div></div>`;
  const typeRow = (role, spec, sample, style, flag) => `<div style="display:grid;grid-template-columns:200px 300px 1fr;gap:24px;align-items:center;padding:16px 0;border-bottom:1px solid rgba(106,6,32,.14)"><div><div style="font:600 14px/1.2 ${F.ui};color:${C.ink}">${role}</div>${flag ? `<div style="margin-top:6px;display:inline-block;padding:3px 7px;border-radius:4px;background:${C.lemon};${mono(9, C.cocoa)}">${flag}</div>` : ''}</div><div style="${mono(10.5, C.cocoa)};line-height:1.6">${spec}</div><div style="${style};color:${C.burgundy}">${sample}</div></div>`;
  const canvas = (name, bg, note) => `<div data-group="Canvas / ${name}" style="width:300px"><div style="height:160px;border-radius:20px;${bg};box-shadow:inset 0 0 0 1px rgba(76,66,64,.14);position:relative;overflow:hidden">${name.startsWith('Blush') ? svg(300, 160, `<defs><radialGradient id="bd1" cx=".2" cy=".1" r=".75"><stop offset="0" stop-color="${C.coolBlue}"/><stop offset="1" stop-color="${C.coolBlue}" stop-opacity="0"/></radialGradient><radialGradient id="bd2" cx=".85" cy=".9" r=".6"><stop offset="0" stop-color="${C.hotRose}"/><stop offset="1" stop-color="${C.hotRose}" stop-opacity="0"/></radialGradient></defs><rect width="300" height="160" rx="20" fill="url(#bd1)"/><rect width="300" height="160" rx="20" fill="url(#bd2)"/>`) : ''}
    <div style="position:absolute;left:90px;top:44px;width:120px;height:90px;border-radius:8px;background:${C.burgundy}"></div><div style="position:absolute;left:100px;top:34px;width:44px;height:16px;border-radius:6px 6px 0 0;background:${C.burgundy800}"></div></div>
    <div style="margin-top:10px;font:600 14px/1.2 ${F.ui};color:${C.ink}">${name}</div><div style="margin-top:4px;font:400 14px/1.35 ${F.soft};color:${C.cocoa}">${note}</div></div>`;
  return `
  ${at(80, 72, `<div style="${mono(12, C.chilli)}">00 · Foundations · ATH v24 mapping</div><div style="margin-top:12px;font:700 56px/0.95 ${F.statement};letter-spacing:-.045em;color:${C.burgundy}">Studio materials</div><div style="margin-top:14px;width:760px;font:400 18px/1.5 ${F.soft};color:${C.cocoa}">Tokens come from the ATH v24 guide. Values marked provisional are stand-ins or derived shades that need approval before production.</div>`)}
  ${at(80, 290, `<div style="${mono(11, C.cocoa)};margin-bottom:16px">Folder boards · one primary leads, Petrol names the statement series</div><div style="display:flex;gap:20px">
    ${sw('Burgundy', C.burgundy, 'Bio folder, primary buttons, headings', true)}${sw('Burgundy 800', C.burgundy800, 'Back covers, spine. Guide shade.', true)}${sw('Petrol', C.petrol, 'Statement folder, success and filed marks', true)}${sw('Blush Sand', C.sand, 'My files folder, dividers')}${sw('Paper', C.paper, 'Every sheet and card')}${sw('Cream', C.cream, 'Default desk')}</div>`)}
  ${at(80, 560, `<div style="display:flex;gap:20px">${sw('Peony', C.peony, 'Type on Burgundy (9.3:1)')}${sw('Pistachio', C.pistachio, 'Type on Petrol')}${sw('Hot Rose', C.hotRose, 'Focus ring 3px, small labels on Burgundy')}${sw('Chilli', C.chilli, 'Eyebrows on Paper, error text', true)}${sw('Cocoa', C.cocoa, 'Body text on Paper (8.4:1)', true)}${sw('Lemon', C.lemon, 'Fictional example notes, highlights')}</div>`)}
  ${at(80, 840, `<div style="width:1280px"><div style="${mono(11, C.cocoa)};margin-bottom:6px">Type roles · three voices per screen</div>
    ${typeRow('Statement', 'Nord Bold · 64/40 · −4.5%<br>Web: Hanken Grotesk 700', 'Artist bio', `font:700 44px/1 ${F.statement};letter-spacing:-.045em`, 'Provisional: Nord licence')}
    ${typeRow('Interface', 'Proxima Nova 600 · 13–16px<br>Web: Hanken Grotesk 500/600', 'File this version', `font:600 18px/1 ${F.ui}`, 'Provisional: Proxima via Adobe')}
    ${typeRow('Soft · questions', 'Newsreader Light · 40/32 · −2%', 'How would you describe what you make?', `font:300 32px/1.1 ${F.soft};letter-spacing:-.02em`)}
    ${typeRow('Reading · drafts', 'Newsreader 400 · 19.5/1.58', 'She dyes each length by hand.', `font:400 19.5px/1.5 ${F.soft};color:${C.ink}`)}
    ${typeRow('Curate · facts', 'DM Mono 400 · 10–12px · caps +8%', 'FILED 11.10.2026 · V4', `font:400 13px/1 ${F.mono};letter-spacing:.08em`)}</div>`)}
  ${at(80, 1300, `<div style="${mono(11, C.cocoa)};margin-bottom:16px">Desk canvas · one per session, chosen in Canvas</div><div style="display:flex;gap:24px">
    ${canvas('Cream desk · default', `background-color:${C.cream};background-image:url(${GRAIN})`, 'Guide: Cream replaces white as page ground.')}
    ${canvas('Paper white', `background-color:${C.paper};background-image:url(${GRAIN})`, 'Quietest option. Folders carry all colour.')}
    ${canvas('Blush Dusk, slow drift', `background:${C.peony}`, 'Guide gradient with grain. 40s drift; paused by Motion off and reduced motion. No body text on it.')}
    <div style="width:330px;font:400 15px/1.5 ${F.soft};color:${C.cocoa}"><div style="font:600 14px/1.2 ${F.ui};color:${C.ink};margin-bottom:8px">Interface rules carried over</div>Radius 4 tags · 12 inputs · 20 cards · pill buttons. Spacing on a 4px base. Focus ring 3px Hot Rose on every control. Body 17px minimum, 4.5:1 contrast. Motion 240ms ease-out for interface; object motion below.</div></div>`)}`;
}

// ---------- Folder anatomy and states ----------
function anatomy() {
  const callout = (x1, y1, x2, y2, label, side = 'right') => `<div style="position:absolute;left:${Math.min(x1, x2)}px;top:${y1}px;width:${Math.abs(x2 - x1)}px;height:1px;background:${C.burgundy}"></div>
    <div style="position:absolute;left:${x1 - 3}px;top:${y1 - 3}px;width:7px;height:7px;border-radius:50%;background:${C.burgundy}"></div>
    <div style="position:absolute;left:${side === 'right' ? x2 + 12 : x2 - 232}px;top:${y1 - 9}px;width:220px;${side === 'left' ? 'text-align:right;' : ''}font:400 15px/1.3 ${F.soft};color:${C.ink}">${label}</div>`;
  const st = (x, label, inner, note) => at(x, 640, `<div style="${mono(10.5, C.chilli)}">${label}</div><div style="position:relative;margin-top:18px;width:300px;height:262px">${inner}</div><div style="margin-top:12px;width:290px;font:400 14.5px/1.4 ${F.soft};color:${C.cocoa}">${note}</div>`);
  const small = (o) => folder({ w: 300, h: 262, frontTop: 92, ts: 34, tabW: 110, th: 30, ...o });
  const many = Array.from({ length: 12 }, (_, i) => ({ title: 'Version ' + (i + 1), words: 120, date: '01.10.2026' }));
  return `
  ${at(80, 72, `<div style="${mono(12, C.chilli)}">00 · Construction</div><div style="margin-top:12px;font:700 56px/0.95 ${F.statement};letter-spacing:-.045em;color:${C.burgundy}">Folder anatomy and states</div>`)}
  ${at(420, 200, folder({ id: 'an', theme: THEMES.bio, docs: BIO_DOCS, idx: '01', name: 'Bio', title: 'Artist bio', line: 'Who you are, where you work and what you make.' }))}
  ${callout(470, 216, 280, 216, 'Tab grows out of the back cover. One outline, S-curve shoulders, no seam.', 'left')}
  ${callout(470, 262, 280, 262, 'Version tabs: one per filed document, up to four, then a count.', 'left')}
  ${callout(800, 276, 860, 276, 'Paper sheets with fibre and grain, dotted margin, slight misalignment.')}
  ${callout(700, 334, 860, 334, 'Thumb cut in the front cover shows the papers are reachable.')}
  ${callout(500, 420, 280, 420, 'Front cover: top-left light, rim highlight on the fold edge.', 'left')}
  ${callout(780, 532, 860, 532, 'Stitch line: 1px dash at 38%. Edge strip 3px below = board thickness.')}
  ${callout(500, 548, 280, 548, 'Shadow: one soft ambient contact shadow. No hard offsets.', 'left')}
  ${st(80, 'Rest', small({ id: 's1', theme: THEMES.bio, docs: BIO_DOCS, idx: '01', name: 'Bio', title: 'Artist bio', line: '' }), 'Count, tabs and last date come from saved documents only.')}
  ${st(420, 'Hover and focus', small({ id: 's2', theme: THEMES.bio, docs: BIO_DOCS, idx: '01', name: 'Bio', title: 'Artist bio', line: '', ring: true, lift: 10 }), 'Sheets rise 6–10px. Keyboard focus draws the 3px Hot Rose ring around the whole silhouette.')}
  ${st(760, 'Empty', small({ id: 's3', theme: THEMES.statement, docs: [], idx: '02', name: 'Statement', title: 'Statement', line: '' }), 'One blank page, no tabs. Label reads 0 versions filed, Nothing filed yet.')}
  ${st(1100, 'Many versions', small({ id: 's4', theme: THEMES.files, docs: many, idx: '03', name: 'My files', title: 'My files', line: '' }).replace(/>V9<|>V10<|>V11<|>V12</, (m) => m), 'Four newest tabs shown. Overflow is stated in the count, never as decoration.')}`;
}

// ---------- Motion storyboard ----------
function motion() {
  const row = (el, prop, start, dur, ease, rm) => `<div style="display:grid;grid-template-columns:230px 360px 90px 90px 220px 1fr;gap:16px;padding:11px 0;border-bottom:1px solid rgba(106,6,32,.14);font:400 15px/1.35 ${F.soft};color:${C.ink}"><span>${el}</span><span>${prop}</span><span style="${mono(11, C.cocoa)}">${start}</span><span style="${mono(11, C.cocoa)}">${dur}</span><span style="${mono(11, C.cocoa)}">${ease}</span><span style="color:${C.cocoa}">${rm}</span></div>`;
  const head = `<div style="display:grid;grid-template-columns:230px 360px 90px 90px 220px 1fr;gap:16px;padding:8px 0;border-bottom:1px solid rgba(106,6,32,.4);${mono(10, C.chilli)}"><span>Element</span><span>Change</span><span>Start</span><span>Length</span><span>Ease</span><span>Reduced motion</span></div>`;
  // schematic thumbnails: back board, papers, front board seen from above
  const box = (inner, label) => `<div data-group="Storyboard / ${label}" style="width:220px"><div style="position:relative;height:150px;border-radius:12px;background:rgba(234,214,203,.5);overflow:hidden">${inner}</div><div style="margin-top:8px;${mono(10, C.cocoa)}">${label}</div></div>`;
  const back = (x) => `<div style="position:absolute;left:${x}px;top:22px;width:100px;height:112px;border-radius:6px;background:${C.burgundy800}"></div><div style="position:absolute;left:${x + 12}px;top:14px;width:36px;height:12px;border-radius:5px 5px 0 0;background:${C.burgundy800}"></div>`;
  const paper = (x, up, lines) => `<div style="position:absolute;left:${x + 6}px;top:${32 - up}px;width:88px;height:96px;border-radius:2px;background:${C.paper};box-shadow:0 0 0 1px rgba(76,66,64,.18)">${lines ? '<div style="margin:16px 12px;height:3px;background:#B9858C;width:50px"></div><div style="margin:8px 12px;height:2px;background:#DFD3CC;width:62px"></div><div style="margin:8px 12px;height:2px;background:#DFD3CC;width:56px"></div>' : ''}</div>`;
  const front = (x, w, top = 52, h = 82) => `<div style="position:absolute;left:${x}px;top:${top}px;width:${w}px;height:${h}px;border-radius:5px;background:${C.burgundy};box-shadow:0 0 0 1px rgba(250,210,225,.2)"></div>`;
  const strip = [
    box(back(60) + paper(60, 0) + front(60, 100), '0ms · rest'),
    box(back(60) + paper(60, 8) + front(60, 100), '0–180ms · sheets rise 8px'),
    box(back(60) + paper(60, 8) + front(22, 38, 28, 106), '120–720ms · cover hinges left'),
    box(front(10, 98, 26, 108) + back(112) + paper(112, 0), '200–820ms · spread settles'),
    box(front(10, 98, 26, 108) + back(112) + paper(112, 0, true), '560–900ms · page content in'),
  ].join('');
  return `
  ${at(80, 72, `<div style="${mono(12, C.chilli)}">00 · Motion and sound</div><div style="margin-top:12px;font:700 56px/0.95 ${F.statement};letter-spacing:-.045em;color:${C.burgundy}">Movement follows the object</div><div style="margin-top:14px;width:820px;font:400 18px/1.5 ${F.soft};color:${C.cocoa}">One timeline per action, with overlapping starts. Inputs are usable as soon as the page is in place, and any click or key can interrupt a transition.</div>`)}
  ${at(80, 290, `<div style="${mono(11, C.cocoa)};margin-bottom:14px">A · Open folder · 900ms total</div><div style="display:flex;gap:24px">${strip}</div>`)}
  ${at(80, 520, `<div style="width:1280px">${head}
    ${row('Closed folder sheets', 'translateY 0 → −8px', '0', '180', 'power2.out', 'Skipped')}
    ${row('Front cover', 'rotateY 0 → −172° on left edge, perspective 1600px', '120', '600', 'expo.out (0.16,1,0.3,1)', 'Crossfade 160ms')}
    ${row('Spread', 'scale .94 → 1, folder moves to centre', '200', '620', 'expo.out', 'Instant')}
    ${row('Page content', 'y 16 → 0, opacity 0 → 1, stagger 60ms', '560', '340', 'power3.out', 'Instant')}
    ${row('Focus', 'Moves to the page heading', '900', '—', '—', 'Same')}</div>`)}
  ${at(80, 820, `<div style="width:1280px"><div style="${mono(11, C.cocoa)};margin-bottom:10px">B · Next page · 640ms · clipped inside the page stage</div>${head}
    ${row('Current page', 'x 0 → −24px, rotate 0 → −1.2°, then slides under the stack', '0', '420', 'power2.inOut', 'Crossfade 160ms')}
    ${row('Next page', 'revealed beneath, shadow from turning sheet fades', '120', '420', 'power2.out', 'Instant')}
    ${row('Chapter tab', 'marker slides to the new tab', '0', '300', 'power3.out', 'Instant')}
    ${row('Notes card', 'new note line writes in: clip 0 → 100%', '300', '340', 'power2.out', 'Instant')}</div>`)}
  ${at(80, 1120, `<div style="width:1280px"><div style="${mono(11, C.cocoa)};margin-bottom:10px">C · File this version · runs only after the save succeeds</div>${head}
    ${row('Filing slip', 'y 40 → 0 over the page', '0', '320', 'expo.out', 'Instant')}
    ${row('Draft sheet', 'scale 1 → .42, moves into the pocket, clipped by the pocket edge', 'save +0', '700', 'power3.inOut', 'Instant')}
    ${row('Pocket slip', 'new slip settles, date mark ink: opacity 0 → 1, scale 1.06 → 1', '+600', '260', 'power2.out', 'Fade 160ms')}
    ${row('Folder count', '3 → 4 versions filed, new V4 tab appears', '+700', '240', 'ease-out', 'Instant')}
    ${row('Sound (opt-in)', 'Paper slide at start, soft tap at contact. Off by default, volume and test in Settings.', '0 / +600', '—', '—', 'Unchanged')}</div>`)}`;
}

module.exports = { mStudio, mPage2, mReview, foundations, anatomy, motion };
