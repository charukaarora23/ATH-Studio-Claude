"""Garden cover in the house style of the founder's own Garden carousel (painting full bleed,
serif italic line, giant condensed GARDEN), with the conversion hook added quietly at the bottom."""
import pathlib, subprocess
HERE = pathlib.Path(__file__).resolve().parent
LOGO = (HERE / 'art' / 'logo-open-calls.svg').read_text().replace('viewBox="-78.00 -156.47 750.45 302.01"', 'viewBox="-2 -84 600 156"')
html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:IS;font-style:italic;src:url(fonts/InstrumentSerif-Italic.ttf)}}
@font-face{{font-family:AN;src:url(fonts/Anton-Regular.ttf)}}
*{{margin:0;padding:0;box-sizing:border-box}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;font-family:Inter;color:#F6EEDC}}
.bg{{position:absolute;inset:0;background:url(art/flower-portrait.jpg) 50% 18%/cover}}
.sh{{position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,28,22,.55) 0%,rgba(12,28,22,.1) 30%,rgba(12,28,22,.15) 55%,rgba(12,28,22,.82) 100%)}}
.top{{position:absolute;left:96px;right:96px;top:84px;display:flex;justify-content:space-between;align-items:center;font:500 24px/1 Inter;letter-spacing:.06em}}
.top svg{{height:50px;width:auto;color:#F6EEDC}}
.line{{position:absolute;left:96px;top:250px;font:italic 64px/1.1 IS;max-width:860px}}
.g{{position:absolute;left:86px;top:830px;font:400 300px/1 AN;letter-spacing:.005em}}
.ed{{position:absolute;left:96px;top:1150px;font:500 26px/1 Inter;letter-spacing:.3em}}
.row{{position:absolute;left:96px;right:96px;bottom:84px;display:flex;justify-content:space-between;align-items:flex-end}}
.row p{{font:400 34px/1.3 Inter}} .row b{{font-weight:600}}
.kw{{border:2px solid #F6EEDC;border-radius:12px;padding:16px 26px;font:500 28px/1 Inter}}
.kw b{{letter-spacing:.08em}}
.cr{{position:absolute;right:30px;top:420px;writing-mode:vertical-rl;font:italic 22px/1 IS;opacity:.85}}
</style></head><body><section class="s" id="c">
<div class="bg"></div><div class="sh"></div>
<div class="top"><span>{LOGO}</span><span>101 ART BOOK · NO. 16</span></div>
<p class="line">Get published in our next book,<br>and win $500.</p>
<p class="cr">Artwork: Artist Name</p>
<p class="g">GARDEN</p><p class="ed">EDITION · OPEN WORLDWIDE</p>
<div class="row"><p>Apply by <b>13 Dec 2026</b></p><span class="kw">Comment <b>GARDEN</b></span></div>
</section></body></html>'''
(HERE / 'cover_house.html').write_text(html)
(HERE / '.shot2.cjs').write_text(f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1080,height:1350}}}});
await p.goto('file://{HERE}/cover_house.html');await p.evaluate(()=>document.fonts.ready);await p.locator('#c').screenshot({{path:'{HERE}/slides-v2/01-house.png'}});await b.close();}})();""")
subprocess.run(['node', str(HERE / '.shot2.cjs')], check=True, cwd='/tmp')
