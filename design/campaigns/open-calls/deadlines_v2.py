"""Deadline posts v2: each call must be recognisable at thumbnail size.
The call's artwork is the hero, the call name sits in the headline in the call's own ATH colour,
the number comes second. Frame, type, ink/burgundy grounds and the action button stay fixed.
Usage: python3 deadlines_v2.py -> deadlines-v2/*.png
"""
import json, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'deadlines-v2'
OUT.mkdir(exist_ok=True)
BURG, PEONY, CREAM, CHILLI, INK = '#6A0620', '#FAD2E1', '#F9EEE5', '#AA0003', '#1C1310'
LOGO = (HERE / 'art' / 'logo-open-calls.svg').read_text().replace('viewBox="-78.00 -156.47 750.45 302.01"', 'viewBox="-2 -84 600 156"')
ARR = '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'

# Each call owns one ATH supporting colour for its whole life.
CALLS = {
    'aoty': dict(name='Artist of the Year', img='call-aoty.jpg', pos='50% 30%', date='16 Nov', kw='NOMINATE', colour='#FFF3B2'),   # lemon
    'women': dict(name='Woman Artist Award', img='call-women.jpg', pos='50% 35%', date='30 Nov', kw='AWARD', colour='#FFA1C2'),    # hot rose
    'garden': dict(name='Garden Edition', img='call-garden.jpg', pos='50% 35%', date='13 Dec', kw='GARDEN', colour='#D0D996'),     # pistachio
}

CSS = '''
@font-face{font-family:IS;src:url(fonts/InstrumentSerif-Regular.ttf)}
@font-face{font-family:IS;font-style:italic;src:url(fonts/InstrumentSerif-Italic.ttf)}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#999;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.s{position:relative;width:1080px;height:1350px;overflow:hidden;margin-bottom:30px}
.a{position:absolute}
.lab{position:absolute;left:72px;top:64px;font:600 21px/1 Inter;letter-spacing:.18em;text-transform:uppercase}
.ser{position:absolute;right:72px;top:64px;font:500 21px/1 Inter}
.brand{position:absolute;left:72px;bottom:62px}.brand svg{height:42px;width:auto;display:block}
.g{font-family:IS,Georgia,serif;font-weight:400;letter-spacing:-.02em;line-height:.9}
.g em{font-style:italic}
.btn{display:inline-flex;align-items:center;gap:14px;height:84px;padding:0 32px;border-radius:12px;font:500 30px/1 Inter;white-space:nowrap}
.btn b{font-weight:700;letter-spacing:.05em}
.tag{display:inline-block;font:700 19px/1 Inter;letter-spacing:.12em;padding:11px 14px;border-radius:12px}
'''
S = []


def deadline(cid, days, ground=INK, label='Deadline'):
    c = CALLS[cid]
    word = 'Closes tonight' if days == 0 else ('Closes tomorrow' if days == 1 else None)
    num = '' if word else f'<p class="g a" style="left:62px;top:770px;font-size:300px;color:{CREAM}">{days}</p>'
    lines = (f'<p class="g a" style="left:72px;right:72px;top:790px;font-size:150px;color:{CREAM}">{word.split()[0]} <em style="color:{c["colour"]}">{word.split()[1]}.</em></p>'
             if word else
             f'<div class="a" style="left:{110 + 165 * len(str(days))}px;right:72px;top:820px">'
             f'<p class="g" style="font-size:110px;color:{CREAM}"><em>days left</em></p>'
             f'<p style="font:400 30px/1.3 Inter;color:{CREAM};opacity:.85;margin-top:14px">to apply to {c["name"]}</p></div>')
    sticker = (f'<div class="a" style="right:96px;top:1030px;width:190px;height:190px;border-radius:50%;background:{CHILLI};color:{CREAM};display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-10deg);z-index:3">'
               f'<b style="font:italic 400 60px/.9 IS">Last</b><span style="font:600 17px/1.2 Inter;letter-spacing:.14em;margin-top:6px">CALL</span></div>') if days == 0 else ''
    S.append((f'{cid}-{days}', f'''<section class="s" id="{cid}-{days}" style="background:{ground}">
<p class="lab" style="color:{c['colour']}">[&nbsp;&nbsp;{'Last call' if days == 0 else label}&nbsp;&nbsp;]</p><p class="ser" style="color:{CREAM}">Closes {c['date']}</p>
<h2 class="g a" style="left:68px;right:72px;top:118px;font-size:96px;color:{c['colour']}"><em>{c['name']}</em></h2>
<div class="a" style="left:72px;right:72px;top:240px;height:500px;border-radius:24px;background:url(art/{c['img']}) {c['pos']}/cover"></div>
{sticker}{num}{lines}
<div class="a" style="left:72px;top:1090px">{f'<span class="btn" style="background:{CREAM};color:{BURG}">Comment <b>{c["kw"]}</b> {ARR}</span>'}</div>
<div class="brand" style="color:{CREAM}">{LOGO}</div>
<p class="a" style="right:72px;bottom:70px;font:600 20px/1 Inter;letter-spacing:.12em;color:{CREAM}">LINK IN BIO →</p>
</section>'''))


# The confusion test: all three calls at the same stage
for cid in CALLS:
    deadline(cid, 3)
# Garden's escalation in the new layout
deadline('garden', 10, ground=BURG)
deadline('garden', 7)
deadline('garden', 1)
deadline('garden', 0)

(HERE / 'deadlines-v2.html').write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(h for _, h in S)}</body></html>')
(HERE / '.shot9.cjs').write_text(f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1080,height:1350}}}});
await p.goto('file://{HERE}/deadlines-v2.html');await p.evaluate(()=>document.fonts.ready);
for(const id of {json.dumps([n for n, _ in S])}){{await p.locator('[id="'+id+'"]').screenshot({{path:'{OUT}/'+id+'.png'}});}}await b.close();}})();""")
subprocess.run(['node', str(HERE / '.shot9.cjs')], check=True, cwd='/tmp')
print('rendered', len(S))
