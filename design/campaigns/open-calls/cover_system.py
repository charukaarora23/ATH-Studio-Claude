"""ATH open-call cover template: one layout for every call, built for conversion.

Reading order (top to bottom) is the conversion path:
  1. Hook word chip (OPEN CALL / OPPORTUNITY / CALL FOR ARTISTS / LAST CALL): the words people scan for.
  2. The opportunity in one plain sentence.
  3. The artwork, framed, so any image looks clean.
  4. Three facts: money, what you get, deadline.
  5. One action: Comment KEYWORD.
Only the CALLS data changes per call. Usage: python3 cover_system.py -> covers/*.png
"""
import json, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'covers'
OUT.mkdir(exist_ok=True)
LOGO = (HERE / 'art' / 'logo-open-calls.svg').read_text().replace('viewBox="-78.00 -156.47 750.45 302.01"', 'viewBox="-2 -84 600 156"')

PAIRS = {
    'garden': dict(bg='#0B3B36', fg='#FFFBF6', chip='#D0D996', chipfg='#0B3B36', sub='#D0D996', line='rgba(208,217,150,.35)'),
    'women':  dict(bg='#52051A', fg='#F9EEE5', chip='#FAD2E1', chipfg='#52051A', sub='#FAD2E1', line='rgba(250,210,225,.3)'),
    'last':   dict(bg='#1C1310', fg='#F9EEE5', chip='#AA0003', chipfg='#F9EEE5', sub='#F9EEE5', line='rgba(249,238,229,.25)'),
}

CALLS = [
    dict(id='garden-open', pair='garden', hook='Open call', series='101 Art Book · Garden Edition',
         head='Get published in a <em>hardcover art book.</em>', art='night-bloom.jpg', pos='50% 32%',
         facts=[('$500', 'Cash award'), ('101', 'Artists in print'), ('13 Dec', 'Deadline')], kw='GARDEN'),
    dict(id='women-opportunity', pair='women', hook='Opportunity', series='Woman Artist Award · 7th Edition',
         head='Women artists: get published <em>and win $500.</em>', art='flower-portrait.jpg', pos='50% 22%',
         facts=[('$500', 'Main prize'), ('Book', 'Women Artists on the Rise'), ('30 Nov', 'Deadline')], kw='AWARD'),
    dict(id='garden-last', pair='last', hook='Last call', series='101 Art Book · Garden Edition',
         head='Final days to get into <em>the Garden Edition.</em>', art='flower-portrait.jpg', pos='50% 40%',
         facts=[('$500', 'Cash award'), ('101', 'Artists in print'), ('13 Dec', 'Closes')], kw='GARDEN'),
]


def cover(c):
    p = PAIRS[c['pair']]
    facts = ''.join(f'<div class="f" style="border-color:{p["line"]}"><b>{v}</b><span style="color:{p["sub"]}">{k}</span></div>' for v, k in c['facts'])
    return f'''<section class="s" id="{c['id']}" style="background:{p['bg']};color:{p['fg']}">
<header><span class="logo">{LOGO}</span><span class="series">{c['series']}</span></header>
<div class="hook"><span class="chip" style="background:{p['chip']};color:{p['chipfg']}">{c['hook']}</span></div>
<h1>{c['head']}</h1>
<div class="art" style="background-image:url(art/{c['art']});background-position:{c['pos']}"></div>
<div class="facts">{facts}</div>
<div class="cta" style="background:{p['fg']};color:{p['bg']}"><span>Comment <b>{c['kw']}</b> for details</span><span class="arr">→</span></div>
</section>'''


CSS = '''
@font-face{font-family:IS;src:url(fonts/InstrumentSerif-Regular.ttf)}
@font-face{font-family:IS;font-style:italic;src:url(fonts/InstrumentSerif-Italic.ttf)}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#ccc;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.s{position:relative;width:1080px;height:1350px;overflow:hidden;margin-bottom:30px;padding:64px 72px}
header{display:flex;justify-content:space-between;align-items:center;height:56px}
.logo svg{height:50px;width:auto;display:block}
.series{font:500 22px/1 Inter;letter-spacing:.04em;opacity:.85}
.hook{margin-top:64px}
.chip{display:inline-flex;align-items:center;height:84px;padding:0 34px;border-radius:12px;font:700 38px/1 Inter;letter-spacing:.16em;text-transform:uppercase}
h1{font:400 92px/1 IS;letter-spacing:-.015em;margin-top:30px;max-width:920px;text-wrap:balance}
h1 em{font-style:italic}
.art{position:absolute;left:72px;right:72px;top:560px;height:420px;border-radius:24px;background-size:cover}
.facts{position:absolute;left:72px;right:72px;top:1012px;display:flex}
.f{flex:1;padding:0 0 0 26px;border-left:2px solid;display:flex;flex-direction:column;gap:10px}
.f:first-child{padding-left:0;border-left:0}
.f b{font:400 64px/1 IS;letter-spacing:-.01em;white-space:nowrap}
.f span{font:500 21px/1.25 Inter;letter-spacing:.02em}
.cta{position:absolute;left:72px;right:72px;bottom:64px;height:112px;border-radius:12px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;font:500 34px/1 Inter}
.cta b{font-weight:700;letter-spacing:.06em}
.arr{font-size:40px}
'''

(HERE / 'covers.html').write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(cover(c) for c in CALLS)}</body></html>')
ids = [c['id'] for c in CALLS]
(HERE / '.shot3.cjs').write_text(f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1080,height:1350}}}});
await p.goto('file://{HERE}/covers.html');await p.evaluate(()=>document.fonts.ready);
for(const id of {json.dumps(ids)}){{await p.locator('[id="'+id+'"]').screenshot({{path:'{OUT}/'+id+'.png'}});}}await b.close();}})();""")
subprocess.run(['node', str(HERE / '.shot3.cjs')], check=True, cwd='/tmp')
print('rendered', len(ids))
