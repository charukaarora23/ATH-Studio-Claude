"""Garden Edition launch v4, in the founder's reference style (modular agency social system):
three colours per call, condensed capitals, pills, and one device per slide
(receipt, big stat, IN/OUT list, chat, search bar, hand-drawn circle).
Every slide leads to one action: Comment GARDEN.
Usage: python3 garden_v4.py -> slides-v4/*.png
"""
import json, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'slides-v4'
OUT.mkdir(exist_ok=True)
# Call colour set: dark, accent, light (+ chilli as the one hot accent)
D, A, L, M, INK, HOT = '#0B3B36', '#D0D996', '#F6F3E7', '#025054', '#13221F', '#C8341C'
KW = 'GARDEN'
LOGO = (HERE / 'art' / 'logo-open-calls.svg').read_text().replace('viewBox="-78.00 -156.47 750.45 302.01"', 'viewBox="-2 -84 600 156"')
ARR = '<svg viewBox="0 0 24 24" width="{s}" height="{s}"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
STAR = '<svg viewBox="0 0 100 100" width="{s}" height="{s}"><path fill="currentColor" d="' + ' '.join(
    ('M' if i == 0 else 'L') + f'{50 + (48 if i % 2 == 0 else 30) * __import__("math").cos(__import__("math").pi * i / 12):.1f} {50 + (48 if i % 2 == 0 else 30) * __import__("math").sin(__import__("math").pi * i / 12):.1f}'
    for i in range(24)) + 'Z"/></svg>'


def arr(s=30):
    return ARR.replace('{s}', str(s))


def star(s=160):
    return STAR.replace('{s}', str(s))


def label(t, c):
    return f'<p class="lab" style="color:{c}">[&nbsp;&nbsp;{t}&nbsp;&nbsp;]</p>'


def pill(t, fg, bg='transparent', border=None, big=False):
    b = border or fg
    return f'<span class="pill{" big" if big else ""}" style="color:{fg};background:{bg};border-color:{b}">{t}</span>'


def frame(fg, right='Swipe'):
    return (f'<div class="brand" style="color:{fg}">{LOGO}</div>'
            f'<div class="fr">{pill(right + " " + arr(26), fg)}</div>')


CSS = '''
@font-face{font-family:IS;font-style:italic;src:url(fonts/InstrumentSerif-Italic.ttf)}
@font-face{font-family:AN;src:url(fonts/Anton-Regular.ttf)}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#999;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.s{position:relative;width:1080px;height:1350px;overflow:hidden;margin-bottom:30px}
.lab{position:absolute;left:72px;top:72px;font:600 20px/1 Inter;letter-spacing:.18em;text-transform:uppercase}
.brand{position:absolute;left:72px;bottom:70px}
.brand svg{height:44px;width:auto;display:block}
.fr{position:absolute;right:72px;bottom:66px}
.pill{display:inline-flex;align-items:center;gap:12px;height:62px;padding:0 28px;border:2px solid;border-radius:999px;font:600 22px/1 Inter;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
.pill.big{height:96px;padding:0 40px;font-size:34px;letter-spacing:.06em}
.an{font-family:AN;font-weight:400;text-transform:uppercase;line-height:.9;letter-spacing:.005em}
.it{font-family:IS;font-style:italic;font-weight:400}
.abs{position:absolute}
'''
S = []


def slide(name, bg, html):
    S.append((name, f'<section class="s" id="{name}" style="background:{bg}">{html}</section>'))


# 1 COVER: hook word + offer, interlocked with the art
slide('01-cover', D, f'''
{label('101 Art Book · No. 16', A)}
<div class="abs" style="right:72px;top:56px">{pill('<i style="width:12px;height:12px;border-radius:50%;background:' + D + ';display:block"></i> Open call', D, A, A)}</div>
<h1 class="an abs" style="left:66px;top:170px;color:{A};font-size:208px">Get<br>published</h1>
<div class="abs" style="left:72px;top:600px;width:470px;font:500 34px/1.35 Inter;color:{L}">in a hardcover art book, beside 100 artists from around the world.</div>
<div class="abs" style="left:600px;right:72px;top:560px;height:480px;border-radius:24px;background:url(art/night-bloom.jpg) 50% 30%/cover"></div>
<p class="an abs" style="right:72px;top:1000px;color:{A};font-size:150px;text-align:right">+ win $500</p>
<div class="abs" style="left:72px;top:860px">{pill('Comment ' + KW + ' ' + arr(30), D, L, L, big=True)}</div>
{frame(L)}
''')

# 2 BIG STAT
slide('02-stat', L, f'''
{label('The book', D)}
<div class="abs" style="right:72px;top:64px;color:{HOT}">{star(110)}</div>
<p class="abs" style="left:58px;top:250px;font:500 470px/1 Inter;letter-spacing:-.06em;color:{INK}">101</p>
<div class="abs" style="left:72px;top:800px;display:flex;align-items:center;gap:24px;color:{D}">
  <span style="display:inline-flex;align-items:center;justify-content:center;width:96px;height:58px;border:2px solid {D};border-radius:999px">{arr(34)}</span>
  <span class="it" style="font-size:84px">artists</span></div>
<p class="abs" style="left:72px;top:930px;width:860px;font:400 38px/1.4 Inter;color:{INK}">will be published in <b style="font-weight:600">101 Art Book: Garden Edition</b>, our sixteenth hardcover book. Yours could be one of them.</p>
{frame(D)}
''')

# 3 RECEIPT: what you get
rows = [('Your artwork', 'Printed in hardcover'), ('Certificate', 'Official recognition'),
        ('Social features', '190,000+ followers'), ('Email feature', '100,000+ readers'),
        ('Sold at', 'Amazon · Barnes & Noble')]
rh = ''.join(f'<div style="display:flex;justify-content:space-between;padding:14px 0"><span>{a}</span><span style="color:{M};font-weight:600">{b}</span></div>' for a, b in rows)
bars = ''.join(f'<i style="display:inline-block;width:{w}px;height:90px;background:{INK};margin-right:{g}px"></i>' for w, g in
               [(4, 6), (8, 4), (3, 7), (6, 3), (10, 5), (3, 4), (5, 8), (9, 3), (3, 6), (7, 4), (4, 5), (10, 3), (3, 7), (6, 4), (8, 6), (3, 3), (5, 7), (9, 4), (4, 5), (7, 3), (3, 6), (10, 4), (5, 0)])
slide('03-receipt', D, f'''
{label('If selected', A)}
<div class="abs" style="left:150px;right:150px;top:150px;height:1080px;background:{L};
  -webkit-mask:radial-gradient(circle 14px at 50% 0,transparent 98%,#000) 0 0/36px 100% repeat-x;padding:90px 64px 0;color:{INK}">
  <div style="color:{D};display:flex;justify-content:center">{LOGO.replace('<svg', '<svg style="height:62px;width:auto"')}</div>
  <p style="text-align:center;font:600 24px/1 Inter;letter-spacing:.16em;margin:44px 0 0;padding:28px 0;border-top:2px dashed #9AA;border-bottom:2px dashed #9AA">WHAT YOU GET IF SELECTED</p>
  <div style="font:400 28px/1.3 Inter;padding:18px 0;border-bottom:2px dashed #9AA">{rh}</div>
  <div style="display:flex;justify-content:space-between;font:600 30px/1.3 Inter;padding:30px 0;border-bottom:2px dashed #9AA"><span>Total</span><span style="color:{M}">Your name in print</span></div>
  <div style="text-align:center;margin-top:46px">{bars}</div>
  <p style="text-align:center;font:500 20px/1 Inter;letter-spacing:.2em;margin-top:16px">COMMENT {KW}</p>
</div>
''')

# 4 PRIZE
slide('04-prize', A, f'''
{label('Awards', D)}
<div class="abs" style="right:72px;top:560px;width:250px;height:250px;color:{HOT};transform:rotate(12deg)">{star(250)}<p style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 30px/1 Inter;letter-spacing:.12em;color:{L}">WINNER</p></div>
<p class="an abs" style="left:64px;top:190px;color:{D};font-size:420px">$500</p>
<p class="an abs" style="left:72px;top:590px;color:{D};font-size:120px">cash award</p>
<div class="abs" style="left:72px;right:72px;top:820px;display:flex;flex-wrap:wrap;gap:14px">
  {pill('+ 4-page feature', D)}{pill('+ Glass trophy', D)}{pill('+ Artsy listing', D)}</div>
<p class="abs" style="left:72px;top:1000px;width:820px;font:400 32px/1.45 Inter;color:{D}">Two runners-up get a 2-page feature and a trophy too.</p>
{frame(D)}
''')

# 5 IN / OUT notebook
def box(t, c):
    return f'<p style="display:flex;align-items:center;gap:22px;font:400 34px/1 Inter;color:{c};padding:15px 0"><i style="width:30px;height:30px;border:2.5px solid {c};border-radius:50%;display:block"></i>{t}</p>'


ins = ['Flowers and plants', 'Trees and forests', 'Butterflies and birds', 'Landscapes', 'Abstract or imagined nature', 'Any medium, any style']
slide('05-inout', '#FBFAF2', f'''
<div class="abs" style="inset:0;background:repeating-linear-gradient(180deg,transparent 0 67px,#D6E3DC 67px 69px)"></div>
<div class="abs" style="left:150px;top:0;bottom:0;width:3px;background:{A}"></div>
<h2 class="an abs" style="left:190px;top:110px;color:{D};font-size:112px">Does my work count?</h2>
<div class="abs" style="left:190px;top:420px">
  <span style="background:{A};color:{D};font:700 24px/1 Inter;letter-spacing:.12em;padding:12px 18px;border-radius:6px">IN</span>
  <div style="margin-top:18px">{''.join(box(t, INK) for t in ins)}</div>
  <span style="display:inline-block;margin-top:36px;background:{HOT};color:{L};font:700 24px/1 Inter;letter-spacing:.12em;padding:12px 18px;border-radius:6px">OUT</span>
  <div style="margin-top:18px">{box('AI-generated work', INK)}</div>
</div>
{frame(D)}
''')

# 6 CHAT FAQ
def q(t):
    return f'<div style="align-self:flex-end;background:{D};color:{L};border-radius:30px 30px 6px 30px;padding:24px 32px;font:400 32px/1.35 Inter;max-width:720px">{t}</div>'


def a_(t):
    return f'<div style="align-self:flex-start;background:{A};color:{D};border-radius:30px 30px 30px 6px;padding:24px 32px;font:400 32px/1.35 Inter;max-width:720px">{t}</div>'


slide('06-chat', L, f'''
{label('Questions', D)}
<h2 class="an abs" style="left:72px;top:130px;color:{D};font-size:128px">Is this for me?</h2>
<div class="abs" style="left:72px;right:72px;top:330px;display:flex;flex-direction:column;gap:18px">
  {q("I'm self-taught. Can I apply?")}{a_('Yes. No degree or gallery needed.')}
  {q('I live outside the US.')}{a_("It's open to artists worldwide, 18+.")}
  {q('How do I apply?')}{a_(f'Comment <b>{KW}</b> and we\'ll DM you everything.')}
</div>
{frame(D)}
''')

# 7 CTA: search bar + circled keyword
slide('07-cta', D, f'''
<div class="abs" style="left:72px;right:72px;top:150px;height:96px;border:2px solid {A};border-radius:999px;display:flex;align-items:center;gap:22px;padding:0 36px;color:{A};font:500 32px/1 Inter">
  <svg viewBox="0 0 24 24" width="36" height="36"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
  open call for artists, garden edition</div>
<p class="an abs" style="left:66px;top:390px;color:{L};font-size:250px">Comment</p>
<p class="an abs" style="left:66px;top:620px;color:{A};font-size:250px">{KW}</p>
<svg class="abs" style="left:20px;top:590px" width="900" height="330" viewBox="0 0 900 330"><path d="M60 175 C 40 60, 420 18, 690 40 C 900 58, 905 250, 640 292 C 400 330, 70 300, 48 200 C 38 150, 120 96, 230 80" fill="none" stroke="{HOT}" stroke-width="6" stroke-linecap="round"/></svg>
<p class="it abs" style="left:72px;top:940px;font-size:58px;color:{L}">We'll DM you the brief and your link to apply.</p>
<p class="abs" style="left:72px;top:1060px;font:600 22px/1 Inter;letter-spacing:.14em;color:{A}">DEADLINE 13 DEC 2026 · WORLDWIDE · 18+</p>
{frame(L, 'Link in bio')}
''')

(HERE / 'slides-v4.html').write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(h for _, h in S)}</body></html>')
(HERE / '.shot4.cjs').write_text(f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1080,height:1350}}}});
await p.goto('file://{HERE}/slides-v4.html');await p.evaluate(()=>document.fonts.ready);
for(const id of {json.dumps([n for n, _ in S])}){{await p.locator('[id="'+id+'"]').screenshot({{path:'{OUT}/'+id+'.png'}});}}await b.close();}})();""")
subprocess.run(['node', str(HERE / '.shot4.cjs')], check=True, cwd='/tmp')
print('rendered', len(S))
