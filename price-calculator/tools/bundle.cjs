// Bundles price-calculator/ into one self-contained HTML page for hosted previews.
// Usage: node price-calculator/tools/bundle.cjs build/price-calculator.html
const fs = require('fs'); const path = require('path');
const root = path.join(__dirname, '..'); const rd = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const html = rd('index.html');
const js = ['js/logic.js', 'js/pricing.js', 'js/store.js', 'js/mail.js', 'js/app.js'].map(rd).join('\n');
const out = html
  .replace('<link rel="stylesheet" href="css/calculator.css">', () => `<style>\n${rd('css/calculator.css')}</style>`)
  .replace(/<script src="js\/[^"]+"><\/script>\n?/g, '')
  .replace('</body>', () => `<script>\n${js}</script>\n</body>`);
fs.writeFileSync(process.argv[2], out); console.log(process.argv[2], (out.length / 1024 | 0) + 'KB');
