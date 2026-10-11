// Bundles app/ into one self-contained HTML page (fonts and textures as data URIs) for hosted
// previews where only a single file can load. Usage: node app/tools/bundle.cjs <out.html>
const fs = require('fs'); const path = require('path');
const root = path.join(__dirname, '..'); const rd = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const uri = (p, type) => `data:${type};base64,${fs.readFileSync(path.join(root, p)).toString('base64')}`;
const fonts = rd('assets/fonts.css').replace(/url\("fonts\/([^"]+)"\)/g, (_, f) => `url("${uri('assets/fonts/' + f, 'font/woff2')}")`);
const css = rd('css/studio.css');
const html = rd('index.html');
const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('<script src')).trim();
const js = ['vendor/three.min.js', 'js/logic.js', 'js/service.js', 'js/sound.js', 'js/scene3d.js', 'js/app.js'].map(rd).join('\n');
const out = `<title>My Studio</title>
<script>window.STUDIO_PREVIEW = true; try { var t = (JSON.parse(localStorage.getItem('ath-studio-v2')) || {}).prefs || {}; document.documentElement.dataset.theme = t.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch (e) { document.documentElement.dataset.theme = 'light'; }</script>
<style>${fonts}\n${css}</style>
${body}
<script>${js}</script>
`;
fs.writeFileSync(process.argv[2], out); console.log(process.argv[2], (out.length / 1024 | 0) + 'KB');
