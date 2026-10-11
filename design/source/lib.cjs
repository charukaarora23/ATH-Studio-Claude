// Shared tokens, textures and the folder construction used by every frame.
const fs = require('fs');
const path = require('path');

const GRAIN = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'grain.b64'), 'utf8');
const FIBRE = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'fibre.b64'), 'utf8');

// ATH v24 tokens (verified against the brand guide). Derived values are marked.
const C = {
  burgundy: '#6A0620', burgundy700: '#5D071D', burgundy800: '#50081A', burgundy900: '#440818', burgundy300: '#B9858C', burgundy100: '#E4CAC7',
  chilli: '#AA0003', peony: '#FAD2E1', ballet: '#FFD6DE', hotRose: '#FFA1C2', lemon: '#FFF3B2',
  pistachio: '#D0D996', coolBlue: '#B7D9FF', petrol: '#025054', petrol700: '#0A4247', petrol800: '#12343A', orange: '#DD4E28',
  cream: '#F9ECE5', paper: '#FBF6EF', sand: '#EAD6CB', cocoa: '#4C4240', cocoa300: '#ABA09B', cocoa100: '#DFD3CC', ink: '#2A0A12',
};

const F = {
  statement: "'Hanken Grotesk', sans-serif", // Nord fallback (provisional)
  ui: "'Hanken Grotesk', sans-serif",        // Proxima Nova stand-in (provisional)
  soft: "'Newsreader', Georgia, serif",
  mono: "'DM Mono', ui-monospace, monospace",
};

// Back cover with the tab grown out of the board: one continuous outline, S-curve shoulders.
function backPath(w, h, tabX, tabW, th, r = 14) {
  const s = 18; // shoulder run
  return [
    `M0 ${th + r}`, `Q0 ${th} ${r} ${th}`,
    `L${tabX - s} ${th}`,
    `C${tabX - 6} ${th} ${tabX - 2} 0 ${tabX + 12} 0`,
    `L${tabX + tabW - 12} 0`,
    `C${tabX + tabW + 2} 0 ${tabX + tabW + 6} ${th} ${tabX + tabW + s} ${th}`,
    `L${w - r} ${th}`, `Q${w} ${th} ${w} ${th + r}`,
    `L${w} ${h - r}`, `Q${w} ${h} ${w - r} ${h}`,
    `L${r} ${h}`, `Q0 ${h} 0 ${h - r}`, 'Z',
  ].join(' ');
}

// Front cover with a shallow thumb cut, so the papers read as reachable.
function frontPath(w, h, cutX, cutW, depth, r = 14, rt = 5, sq = false) {
  return [
    sq ? 'M0 0' : `M0 ${rt}`, sq ? '' : `Q0 0 ${rt} 0`,
    `L${cutX} 0`,
    `C${cutX + cutW * 0.28} 0 ${cutX + cutW * 0.22} ${depth} ${cutX + cutW / 2} ${depth}`,
    `C${cutX + cutW * 0.78} ${depth} ${cutX + cutW * 0.72} 0 ${cutX + cutW} 0`,
    `L${w - rt} 0`, `Q${w} 0 ${w} ${rt}`,
    `L${w} ${h - r}`, `Q${w} ${h} ${w - r} ${h}`,
    sq ? `L0 ${h}` : `L${r} ${h}`, sq ? '' : `Q0 ${h} 0 ${h - r}`, 'Z',
  ].join(' ');
}

function svg(w, h, inner, style = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position:absolute;left:0;top:0;overflow:visible;${style}">${inner}</svg>`;
}

const paperBg = `background-color:${C.paper};background-image:url(${FIBRE}),url(${GRAIN});background-size:192px,192px;`;

/* Closed folder.
   theme: {front, frontLight, frontDark, back, edge, ink, sub, stitch}
   docs: saved documents in this folder (drives sheet count, version tabs and the count label). */
function folder(o) {
  const { w = 392, h = 344, tabX = 44, tabW = 132, th = 34, frontTop = 118, theme, docs = [], idx, name, title, line, id = '', ts = 46, ring = false, lift = 0 } = o;
  const fh = h - frontTop;
  const cutX = w - 150, cutW = 96;
  const sheets = Math.max(1, Math.min(docs.length, 4));
  let sheetHtml = '';
  // sheets, back to front; each saved version owns a sheet and a small tab
  for (let i = 0; i < sheets; i++) {
    const d = docs.slice(-sheets)[i];
    const inset = 16 + i * 2;
    const top = th + 22 + i * 7 - lift * (0.6 + i * 0.25);
    const rot = [-0.9, 0.5, -0.35, 0.2][i];
    const dx = [3, -2, 1, 0][i];
    const tabLeft = 40 + i * 74;
    sheetHtml += `<div data-group="Sheet ${i + 1}${d ? ' / ' + d.title : ' / blank'}" style="position:absolute;left:${inset + dx}px;right:${inset - dx}px;top:${top}px;height:${h - top - 10}px;${paperBg}border-radius:3px;box-shadow:0 0 0 1px rgba(76,66,64,.12),0 1px 2px rgba(42,10,18,.06);transform:rotate(${rot}deg);">
      ${d ? `<div style="position:absolute;left:${tabLeft - inset}px;top:-15px;height:16px;padding:0 9px;${paperBg}border-radius:5px 5px 0 0;box-shadow:0 -1px 0 0 rgba(76,66,64,.10),1px 0 0 0 rgba(76,66,64,.08),-1px 0 0 0 rgba(76,66,64,.08);font:500 9px/16px ${F.mono};letter-spacing:.08em;color:${C.cocoa};">${d.tag || 'V' + (docs.length - (sheets - 1 - i))}</div>` : ''}
      <div style="position:absolute;left:22px;top:0;bottom:0;border-left:1px dotted rgba(170,0,3,.28)"></div>
      ${i === sheets - 1 && d ? `<div style="position:absolute;left:34px;top:12px;right:16px;font:400 9.5px/1.3 ${F.mono};letter-spacing:.06em;color:${C.cocoa};text-transform:uppercase;white-space:nowrap;overflow:hidden">${d.title} · ${d.words} words</div>
      <div style="position:absolute;left:34px;top:31px;width:62%;height:1px;background:rgba(76,66,64,.18)"></div>
      <div style="position:absolute;left:34px;top:41px;width:48%;height:1px;background:rgba(76,66,64,.14)"></div>
      <div style="position:absolute;left:34px;top:51px;width:56%;height:1px;background:rgba(76,66,64,.12)"></div>` : ''}
      ${!d ? `<div style="position:absolute;left:34px;top:13px;font:400 9.5px/1.3 ${F.mono};letter-spacing:.06em;color:${C.cocoa300};text-transform:uppercase">Blank page</div>` : ''}
    </div>`;
  }
  const count = docs.length;
  const last = docs[docs.length - 1];
  return `<div class="folder" data-group="Folder / ${title}" id="${id}" style="position:relative;width:${w}px;height:${h}px;">
    <div style="position:absolute;left:18px;right:18px;bottom:-6px;height:40px;border-radius:50%;box-shadow:0 26px 40px -10px rgba(42,10,18,.22);"></div>
    ${ring ? svg(w, h + 3, `<path d="${backPath(w, h + 3, tabX, tabW, th)}" fill="none" stroke="#FFA1C2" stroke-width="10" stroke-linejoin="round"/>`) : ''}
    ${svg(w, h, `<defs><linearGradient id="bk${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${theme.backLight}"/><stop offset="1" stop-color="${theme.back}"/></linearGradient></defs>
      <path d="${backPath(w, h, tabX, tabW, th)}" fill="url(#bk${id})"/>
      <path d="${backPath(w, h, tabX, tabW, th)}" fill="none" stroke="${theme.rim}" stroke-opacity=".35" stroke-width="1"/>`)}
    <div data-grain-prev=".5" style="position:absolute;left:0;top:0;width:${w}px;height:${h}px;border-radius:14px;background:url(${GRAIN});opacity:.5;mix-blend-mode:overlay;clip-path:path('${backPath(w, h, tabX, tabW, th)}')"></div>
    <div style="position:absolute;left:${tabX + 10}px;top:9px;width:${tabW - 20}px;text-align:center;font:500 10px/16px ${F.mono};letter-spacing:.1em;color:${theme.tabInk};text-transform:uppercase">${idx} ${name}</div>
    ${sheetHtml}
    <div style="position:absolute;left:0;top:${frontTop + 3}px;width:${w}px;height:${fh}px;">${svg(w, fh, `<path d="${frontPath(w, fh, cutX, cutW, 15)}" fill="${theme.edge}"/>`)}</div>
    <div data-group="Front cover" style="position:absolute;left:0;top:${frontTop}px;width:${w}px;height:${fh}px;">
      ${svg(w, fh, `<defs><linearGradient id="fr${id}" x1="0" y1="0" x2=".9" y2="1"><stop offset="0" stop-color="${theme.frontLight}"/><stop offset=".55" stop-color="${theme.front}"/><stop offset="1" stop-color="${theme.frontDark}"/></linearGradient></defs>
        <path d="${frontPath(w, fh, cutX, cutW, 15)}" fill="url(#fr${id})"/>
        <path d="M6 1.5 L${cutX} 1.5" stroke="${theme.rim}" stroke-opacity=".55" stroke-width="1"/>
        <path d="M${cutX + cutW} 1.5 L${w - 6} 1.5" stroke="${theme.rim}" stroke-opacity=".55" stroke-width="1"/>
        <path d="M14 ${fh - 11} L${w - 14} ${fh - 11}" stroke="${theme.stitch}" stroke-opacity=".38" stroke-width="1" stroke-dasharray="5 4" stroke-linecap="round"/>`)}
      <div data-grain-prev=".55" style="position:absolute;inset:0;background:url(${GRAIN});opacity:.55;mix-blend-mode:overlay;clip-path:path('${frontPath(w, fh, cutX, cutW, 15)}')"></div>
      <div style="position:absolute;left:28px;top:30px;font:400 11px/1.2 ${F.mono};letter-spacing:.08em;text-transform:uppercase;color:${theme.sub}">${count} ${count === 1 ? 'version' : 'versions'} filed${h < 240 && last ? ' · last ' + last.date : ''}</div>
      <div style="position:absolute;left:26px;top:52px;font:700 ${ts}px/0.95 ${F.statement};letter-spacing:-0.045em;color:${theme.ink}">${title}</div>
      <div style="position:absolute;left:28px;top:${52 + ts * 0.95 + 16}px;width:${w - 120}px;font:400 16px/1.4 ${F.soft};color:${theme.ink}">${line}</div>
      ${h < 240 ? '' : `<div style="position:absolute;left:28px;bottom:26px;right:28px;display:flex;justify-content:space-between;font:400 10.5px/1.2 ${F.mono};letter-spacing:.08em;text-transform:uppercase;color:${theme.sub}"><span>${last ? 'Last filed ' + last.date : 'Nothing filed yet'}</span><span>Open folder</span></div>`}
    </div>
  </div>`;
}

const THEMES = {
  bio: { front: C.burgundy, frontLight: '#7B1430', frontDark: C.burgundy700, back: C.burgundy800, backLight: '#5E0B22', edge: C.burgundy900, rim: C.hotRose, stitch: C.peony, ink: C.peony, sub: C.hotRose, tabInk: C.peony },
  statement: { front: C.petrol, frontLight: '#0B5F62', frontDark: C.petrol700, back: C.petrol800, backLight: '#0D3F44', edge: '#0B2A2F', rim: C.pistachio, stitch: C.pistachio, ink: C.pistachio, sub: C.peony, tabInk: C.pistachio },
  files: { front: C.sand, frontLight: '#F0E0D7', frontDark: '#E2CBBF', back: C.burgundy100, backLight: '#EAD3D0', edge: '#D5BBB0', rim: '#FFFFFF', stitch: C.burgundy, ink: C.burgundy, sub: C.chilli, tabInk: C.burgundy },
};

module.exports = { C, F, GRAIN, FIBRE, paperBg, folder, THEMES, backPath, frontPath, svg };
