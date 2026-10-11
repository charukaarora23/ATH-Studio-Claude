// Screenshot each .frame in design.html into out dir.
const { chromium } = require(process.env.NP + '/playwright');
(async () => {
  const [,, file, outDir, only] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + file); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  const frames = await p.$$('section.frame');
  for (let i = 0; i < frames.length; i++) {
    const n = await frames[i].getAttribute('data-name');
    if (only && !n.startsWith(only)) continue;
    await frames[i].screenshot({ path: `${outDir}/${n.replace(/[^a-z0-9]+/gi, '_')}.png` });
    console.log('shot', n);
  }
  await b.close();
})();
