const { C, F, GRAIN, FIBRE, paperBg, folder, THEMES, backPath, svg } = require('./lib.cjs');

const desk = (color = C.cream) => `background-color:${color};background-image:url(${GRAIN});background-size:192px;`;
const mono = (size = 11, color = C.cocoa, extra = '') => `font:400 ${size}px/1.3 ${F.mono};letter-spacing:.08em;text-transform:uppercase;color:${color};${extra}`;
const at = (x, y, inner, extra = '') => `<div style="position:absolute;left:${x}px;top:${y}px;${extra}">${inner}</div>`;

// Sample data for design review only. Not user facts.
const BIO_DOCS = [
  { title: 'Website, long', words: 212, date: '02.09.2026' },
  { title: 'Open call, 100 words', words: 97, date: '21.09.2026' },
  { title: 'Gallery application', words: 148, date: '08.10.2026' },
];
const ST_DOCS = [{ title: 'Salt Rooms series', words: 286, date: '30.09.2026' }];

function header(active = 'studio', w = 1440) {
  const pill = (label, value, on) => `<div style="display:flex;align-items:center;gap:8px;height:36px;padding:0 14px;border-radius:999px;box-shadow:inset 0 0 0 1px rgba(106,6,32,.22);font:500 13px/1 ${F.ui};color:${C.burgundy}">${label}<span style="${mono(10, on ? C.chilli : C.cocoa)}">${value}</span></div>`;
  return `<div data-group="Header" style="position:absolute;left:0;top:0;width:${w}px;height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 80px;border-bottom:1px solid rgba(106,6,32,.1)">
    <div style="display:flex;align-items:center;gap:14px">
      <div style="font:700 19px/1 ${F.statement};letter-spacing:-.03em;color:${C.burgundy}">Arts to Hearts</div>
      <div style="width:1px;height:18px;background:rgba(106,6,32,.25)"></div>
      <div style="font:500 14px/1 ${F.ui};color:${C.cocoa}">My Studio</div>
      <div style="${mono(9, C.cocoa300)};margin-left:6px;padding:4px 7px;border-radius:4px;box-shadow:inset 0 0 0 1px rgba(76,66,64,.2)">Logo pending</div>
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      ${pill('Studio sounds', 'Off', false)}${pill('Motion', 'On', true)}${pill('Canvas', 'Cream', false)}
      <div style="width:36px;height:36px;border-radius:50%;background:${C.burgundy};color:${C.peony};display:flex;align-items:center;justify-content:center;font:600 13px/1 ${F.ui};margin-left:6px">SI</div>
    </div>
  </div>`;
}

function studioHome() {
  const row = (t, f, wds, d, last) => `<div style="display:grid;grid-template-columns:1fr 200px 120px 160px 120px;align-items:center;height:56px;border-bottom:1px solid rgba(106,6,32,.12);font:400 17px/1 ${F.soft};color:${C.ink}">
      <span>${t}</span><span style="${mono(11, C.cocoa)}">${f}</span><span style="${mono(11, C.cocoa)}">${wds} words</span><span style="${mono(11, C.cocoa)}">${d}</span><span style="font:600 13px/1 ${F.ui};color:${C.burgundy};text-align:right">Open →</span></div>`;
  return `${header()}
  ${at(80, 132, `<div style="${mono(12, C.chilli)}">My Studio · Tuesday 11 October</div>`)}
  ${at(78, 158, `<div style="font:700 64px/0.95 ${F.statement};letter-spacing:-.045em;color:${C.burgundy}">Good afternoon, Sana.</div>`)}
  ${at(860, 162, `<div style="width:500px;font:400 19px/1.5 ${F.soft};color:${C.cocoa}">Open a folder to write a bio or an artist statement. Every version you file stays in its folder, ready to reopen.</div>`)}
  ${at(80, 300, folder({ id: 'f1', theme: THEMES.bio, docs: BIO_DOCS, idx: '01', name: 'Bio', title: 'Artist bio', line: 'Who you are, where you work and what you make.', tabX: 44 }))}
  ${at(524, 300, folder({ id: 'f2', theme: THEMES.statement, docs: ST_DOCS, idx: '02', name: 'Statement', title: 'Artist statement', line: 'The work itself: subjects, materials, process and why.', tabX: 132, tabW: 150 }))}
  ${at(968, 300, folder({ id: 'f3', theme: THEMES.files, docs: [...BIO_DOCS.map(d => ({ ...d, tag: 'Bio' })), ...ST_DOCS.map(d => ({ ...d, tag: 'Stmt' }))], idx: '03', name: 'My files', title: 'My files', line: 'Every filed document. Search, reopen and export.', tabX: 236, tabW: 132 }))}
  ${at(80, 730, `<div style="width:1280px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;padding-bottom:14px;border-bottom:1px solid rgba(106,6,32,.3)"><span style="font:700 28px/1 ${F.statement};letter-spacing:-.035em;color:${C.burgundy}">Recently filed</span><span style="${mono(11, C.cocoa)}">Saved on this device · Sample data</span></div>
    ${row('Gallery application', 'Artist bio · V3', 148, '08.10.2026')}
    ${row('Salt Rooms series', 'Statement · V1', 286, '30.09.2026')}
    ${row('Open call, 100 words', 'Artist bio · V2', 97, '21.09.2026')}
  </div>`)}`;
}

module.exports = { studioHome, header, desk, mono, at, BIO_DOCS, ST_DOCS };
