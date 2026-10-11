// Builds design.html: one <section class="frame"> per Figma frame.
const fs = require('fs');
const path = require('path');
const { C, F, GRAIN, paperBg, folder, THEMES } = require('./lib.cjs');
const frames = require('./index.cjs');

const css = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#d9d2cc;padding:60px;display:flex;flex-direction:column;gap:80px;align-items:flex-start;-webkit-font-smoothing:antialiased}
.frame{position:relative;overflow:hidden;flex:none}
.label{font:400 13px/1 ${F.mono};color:#4C4240;margin-bottom:-64px;letter-spacing:.06em}
button{font:inherit;border:0;background:none;color:inherit}
`;

const fontsCss = fs.readFileSync(path.join(__dirname, process.argv.includes('--embed') ? 'fonts.embedded.css' : 'fonts.css'), 'utf8');
const embedFonts = process.argv.includes('--embed');
let html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ATH My Studio design board</title>
<style>${fontsCss}${css}</style></head><body>`;
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
for (const fr of frames.list) {
  if (only.length && !only.some((o) => fr.name.startsWith(o))) continue;
  html += `<div class="label">${fr.name}</div><section class="frame" data-name="${fr.name}" style="width:${fr.w}px;height:${fr.h}px;${fr.bg}">${fr.html}</section>`;
}
html += '</body></html>';
fs.writeFileSync(path.join(__dirname, process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'design.html'), html);
console.log('frames', frames.list.length, 'bytes', html.length);
