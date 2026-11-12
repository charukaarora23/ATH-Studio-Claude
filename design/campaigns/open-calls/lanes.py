"""Three lanes for three concurrent calls. Each lane = its own ATH ground colour + its own layout,
so calls can't be confused even at thumbnail size. A call keeps its lane for all 30 days;
when it closes, the lane passes to the next new call.
Lane 1 Ink · split | Lane 2 Sky · big number + art band | Lane 3 Peony · centred arch
Usage: python3 lanes.py -> lanes/*.png
"""
import json, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'lanes'
OUT.mkdir(exist_ok=True)
BURG, PEONY, CREAM, CHILLI, INK, SKY = '#6A0620', '#FAD2E1', '#F9EEE5', '#AA0003', '#1C1310', '#B7D9FF'
LOGO = (HERE / 'art' / 'logo-open-calls.svg').read_text().replace('viewBox="-78.00 -156.47 750.45 302.01"', 'viewBox="-2 -84 600 156"')
ARR = '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'

CALLS = {
    'aoty': dict(lane=1, name='Artist of the Year', img='call-aoty.jpg', pos='44% 50%', date='16 Nov', kw='NOMINATE'),
    'garden': dict(lane=2, name='Garden Edition', img='call-garden.jpg', pos='50% 40%', date='13 Dec', kw='GARDEN'),
    'women': dict(lane=3, name='Woman Artist Award', img='call-women.jpg', pos='50% 30%', date='30 Nov', kw='AWARD'),
}

CSS = '''
@font-face{font-family:IS;src:url(fonts/InstrumentSerif-Regular.ttf)}
@font-face{font-family:IS;font-style:italic;src:url(fonts/InstrumentSerif-Italic.ttf)}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#999;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.s{position:relative;width:1080px;height:1350px;overflow:hidden;margin-bottom:30px}
.a{position:absolute}
.lab{font:600 20px/1 Inter;letter-spacing:.18em;text-transform:uppercase}
.g{font-family:IS,Georgia,serif;font-weight:400;letter-spacing:-.02em;line-height:.9}
.g em,.it{font-family:IS;font-style:italic;font-weight:400}
.btn{display:inline-flex;align-items:center;gap:14px;height:80px;padding:0 30px;border-radius:12px;font:500 28px/1 Inter;white-space:nowrap}
.btn b{font-weight:700;letter-spacing:.05em}
.logo svg{height:40px;width:auto;display:block}
'''


def sticker(x, y):
    return (f'<div class="a" style="left:{x}px;top:{y}px;width:180px;height:180px;border-radius:50%;background:{CHILLI};color:{CREAM};display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-10deg)">'
            f'<b style="font:italic 400 56px/.9 IS">Last</b><span style="font:600 16px/1.2 Inter;letter-spacing:.14em;margin-top:6px">CALL</span></div>')


def btn(c, bg, fg):
    return f'<span class="btn" style="background:{bg};color:{fg}">Comment <b>{c["kw"]}</b> {ARR}</span>'


def lane1(c, days):  # INK · split
    last = days == 0
    big = (f'<p class="g" style="font-size:150px;color:{CREAM}">Closes <em style="color:{PEONY}">tonight.</em></p>' if last else
           f'<p class="g" style="font-size:380px;color:{CREAM}">{days}</p><p class="it" style="font-size:96px;color:{PEONY};margin-top:-10px">days left</p>')
    return f'''<div class="a" style="left:0;top:0;bottom:0;width:470px;background:url(art/{c['img']}) {c['pos']}/auto 100% no-repeat #EDEBE8"></div>
<div class="a" style="left:530px;right:64px;top:70px;bottom:64px;display:flex;flex-direction:column">
  <p class="lab" style="color:{PEONY}">[ {'Last call' if last else 'Deadline'} ]</p>
  <p class="g" style="font-size:78px;color:{CREAM};margin-top:34px">{c['name']}</p>
  <div style="margin-top:auto">{big}</div>
  <p style="font:400 26px/1.3 Inter;color:{CREAM};opacity:.8;margin:26px 0 30px">Closes {c['date']} · Open worldwide</p>
  {btn(c, CREAM, BURG)}
  <div class="logo" style="color:{CREAM};margin-top:48px">{LOGO}</div>
</div>{sticker(830, 260) if last else ''}'''


def lane2(c, days):  # SKY · giant number + art band
    last = days == 0
    big = (f'<p class="g a" style="left:62px;right:64px;top:150px;font-size:230px;color:{BURG}">Closes <em>tonight.</em></p>' if last else
           f'<p class="g a" style="left:50px;top:120px;font-size:500px;color:{BURG}">{days}</p>'
           f'<p class="it a" style="left:{100 + 270 * len(str(days))}px;top:380px;font-size:120px;color:{BURG}">days left</p>')
    return f'''<p class="lab a" style="left:72px;top:70px;color:{BURG}">[ {'Last call' if last else 'Deadline'} ]</p>
<p class="a" style="right:72px;top:70px;font:500 21px/1 Inter;color:{BURG}">Closes {c['date']}</p>
{big}
<p class="g a" style="left:72px;right:72px;top:600px;font-size:80px;color:{BURG}">to apply to <em>{c['name']}.</em></p>
<div class="a" style="left:72px;top:735px">{btn(c, BURG, CREAM)}</div>
<div class="a logo" style="right:72px;top:755px;color:{BURG}">{LOGO}</div>
<div class="a" style="left:0;right:0;bottom:0;height:470px;background:url(art/{c['img']}) {c['pos']}/cover"></div>{sticker(830, 130) if last else ''}'''


def lane3(c, days):  # PEONY · centred arch
    last = days == 0
    big = (f'<p class="g" style="font-size:120px;color:{BURG}">Closes <em>tonight.</em></p>' if last else
           f'<p class="g" style="font-size:130px;color:{BURG}">{days} <em>days left</em></p>')
    return f'''<div class="a" style="left:0;right:0;top:66px;display:flex;flex-direction:column;align-items:center;text-align:center">
  <p class="lab" style="color:{BURG}">[ {'Last call' if last else 'Deadline'} · Closes {c['date']} ]</p>
  <p class="g" style="font-size:84px;color:{BURG};margin-top:28px"><em>{c['name']}</em></p>
  <div style="width:560px;height:560px;margin-top:32px;border-radius:280px 280px 0 0;background:url(art/{c['img']}) {c['pos']}/cover"></div>
  <div style="margin-top:34px">{big}</div>
  <div style="margin-top:34px">{btn(c, BURG, CREAM)}</div>
</div>
<div class="a logo" style="left:50%;transform:translateX(-50%);bottom:56px;color:{BURG}">{LOGO}</div>{sticker(60, 600) if last else ''}'''


LANES = {1: (INK, lane1), 2: (SKY, lane2), 3: (PEONY, lane3)}
S = []
for cid, c in CALLS.items():
    for days in (3, 0):
        bg, fn = LANES[c['lane']]
        S.append((f'{cid}-{days}', f'<section class="s" id="{cid}-{days}" style="background:{bg}">{fn(c, days)}</section>'))

(HERE / 'lanes.html').write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(h for _, h in S)}</body></html>')
(HERE / '.shot10.cjs').write_text(f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1080,height:1350}}}});
await p.goto('file://{HERE}/lanes.html');await p.evaluate(()=>document.fonts.ready);
for(const id of {json.dumps([n for n, _ in S])}){{await p.locator('[id="'+id+'"]').screenshot({{path:'{OUT}/'+id+'.png'}});}}await b.close();}})();""")
subprocess.run(['node', str(HERE / '.shot10.cjs')], check=True, cwd='/tmp')
print('rendered', len(S))
