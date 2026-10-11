const { chromium } = require(process.env.NP + '/playwright');
(async () => {
  const [,, file, out, w, h, textOut] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w || 1440, height: +h || 900 } });
  await p.goto('file://' + file, { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  if (textOut) require('fs').writeFileSync(textOut, await p.evaluate(() => document.body.innerText));
  if (out) await p.screenshot({ path: out, fullPage: false });
  await b.close();
})();
