"""Woman Artist Award, two slides in the Foremark-style (Swiss) variant of the system:
peony + blood orange + ink, big grotesk, tiny corner labels, split photo panel, underlined keyword."""
import pathlib, subprocess, json
HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'slides-v4'
P, O, K = '#F9CDBF', '#E3501F', '#1C1A19'
LOGO = (HERE / 'art' / 'logo-open-calls.svg').read_text().replace('viewBox="-78.00 -156.47 750.45 302.01"', 'viewBox="-2 -84 600 156"')
CSS = '''*{margin:0;padding:0;box-sizing:border-box}body{background:#999;font-family:Inter;-webkit-font-smoothing:antialiased}
.s{position:relative;width:1080px;height:1350px;overflow:hidden;margin-bottom:30px}.a{position:absolute}
.lab{font:500 22px/1 Inter}.g{font-family:Inter;font-weight:500;letter-spacing:-.045em;line-height:.95}
.logo svg{height:46px;width:auto;display:block}.u{border-bottom:6px solid}'''
c1 = f'''<section class="s" id="w-01-cover" style="background:{P}">
<div class="a" style="left:0;right:0;top:0;height:720px;background:url(art/flower-portrait.jpg) 50% 20%/cover"></div>
<div class="a logo" style="left:64px;top:60px;color:#fff">{LOGO}</div><p class="a lab" style="right:64px;top:72px;color:#fff">Woman Artist Award · 7th</p>
<p class="a lab" style="left:64px;top:780px;color:{K}">Open call</p>
<h1 class="a g" style="left:60px;right:64px;top:820px;font-size:118px;color:{K}">Women artists:<br>get published and<br>win <span class="u" style="border-color:{O}">$500.</span></h1>
<div class="a" style="left:64px;right:64px;top:1180px;border-top:2px solid {K}"></div>
<p class="a" style="left:64px;top:1210px;font:500 30px/1.3 Inter;color:{K}">Comment <b style="font-weight:700;color:{O}">AWARD</b> for details</p>
<p class="a lab" style="right:64px;top:1220px;color:{K}">Deadline 30 Nov</p></section>'''
c2 = f'''<section class="s" id="w-02-stat" style="background:{O}">
<p class="a g" style="left:40px;top:30px;font-size:430px;color:{K}">$500</p>
<div class="a" style="left:64px;width:420px;top:560px;border-top:2px solid {K}"></div>
<p class="a" style="left:64px;top:590px;width:460px;font:400 30px/1.4 Inter;color:{K}">Main prize, plus engraved glass trophies for the top three and a feature in Women Artists on the Rise.</p>
<div class="a" style="left:0;right:0;bottom:0;height:470px;background:url(art/night-bloom.jpg) 50% 35%/cover"></div>
<p class="a lab" style="left:64px;top:500px;color:{K}">Awards</p>
<p class="a" style="right:64px;top:780px;font:700 22px/1 Inter;letter-spacing:.06em;color:{K}">COMMENT AWARD</p></section>'''
(HERE / 'women-v4.html').write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{c1}{c2}</body></html>')
ids = ['w-01-cover', 'w-02-stat']
(HERE / '.shot5.cjs').write_text(f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1080,height:1350}}}});
await p.goto('file://{HERE}/women-v4.html');await p.evaluate(()=>document.fonts.ready);
for(const id of {json.dumps(ids)}){{await p.locator('[id="'+id+'"]').screenshot({{path:'{OUT}/'+id+'.png'}});}}await b.close();}})();""")
subprocess.run(['node', str(HERE / '.shot5.cjs')], check=True, cwd='/tmp')
