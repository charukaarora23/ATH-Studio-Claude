"""ATH open-call social system (fixed). One palette, one type pairing, one frame, a fixed set of slide devices.
Calls differ only by artwork and words, never by colour.

Evidence it is built on:
- References (13): every one uses a fixed 3-colour palette (one dark, one hot accent, one soft light) across all
  posts, a big grotesk, a serif italic accent, rounded frames, pills with arrows, tiny bracket labels,
  big-number slides and one device per slide (receipt, chat, list, stat). Two of them are ink + orange + peach.
- Ads (last 90 days): "Calling All Female/Women Artists" = lowest cost per application (Rs 212-273, CTR up to 12.9%).
  "Few Days to Apply" CTR 12.4%. "Nominate Yourself" Rs 415-982. "POV You're an Artist" Rs 3,005.
- Instagram: keyword + free/money posts got the most comments: GROW 591, FUND 426, AWARD 205.
Usage: python3 garden_v5.py -> slides-v5/*.png
"""
import json, math, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'slides-v5'
OUT.mkdir(exist_ok=True)

# ---- FIXED TOKENS (never change per call) ----
INK, ORANGE, PEONY, CREAM = '#1C1310', '#DD4E28', '#FAD2E1', '#F9EEE5'
LOGO = (HERE / 'art' / 'logo-open-calls.svg').read_text().replace('viewBox="-78.00 -156.47 750.45 302.01"', 'viewBox="-2 -84 600 156"')
ARR = '<svg viewBox="0 0 24 24" width="{s}" height="{s}"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
STAR = '<svg viewBox="0 0 100 100" width="{s}" height="{s}"><path fill="currentColor" d="' + ' '.join(
    ('M' if i == 0 else 'L') + f'{50 + (48 if i % 2 == 0 else 30) * math.cos(math.pi * i / 12):.1f} {50 + (48 if i % 2 == 0 else 30) * math.sin(math.pi * i / 12):.1f}'
    for i in range(24)) + 'Z"/></svg>'

# ---- PER CALL (the only thing that changes) ----
CALL = dict(kw='GARDEN', series='101 Art Book · Garden Edition', deadline='13 Dec 2026',
            hook='Calling all artists who paint <em>nature.</em>', art='night-bloom.jpg', art_pos='50% 30%')


def arr(s=30):
    return ARR.replace('{s}', str(s))


def star(s):
    return STAR.replace('{s}', str(s))


def frame(fg, label, right='Swipe', accent=None):
    """Same on every slide: bracket label top-left, series top-right, logo bottom-left, arrow pill bottom-right."""
    return (f'<p class="lab" style="color:{accent or fg}">[&nbsp;&nbsp;{label}&nbsp;&nbsp;]</p>'
            f'<p class="ser" style="color:{fg}">{CALL["series"]}</p>'
            f'<div class="brand" style="color:{fg}">{LOGO}</div>'
            f'<span class="pill fr" style="color:{fg};border-color:{fg}">{right} {arr(26)}</span>')


def kwpill(bg, fg, size=34):
    return f'<span class="kw" style="background:{bg};color:{fg};font-size:{size}px">Comment <b>{CALL["kw"]}</b> {arr(size + 4)}</span>'


CSS = '''
@font-face{font-family:IS;font-style:italic;src:url(fonts/InstrumentSerif-Italic.ttf)}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#999;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.s{position:relative;width:1080px;height:1350px;overflow:hidden;margin-bottom:30px}
.a{position:absolute}
.lab{position:absolute;left:72px;top:72px;font:600 21px/1 Inter;letter-spacing:.18em;text-transform:uppercase}
.ser{position:absolute;right:72px;top:72px;font:500 21px/1 Inter;letter-spacing:.02em}
.brand{position:absolute;left:72px;bottom:70px}.brand svg{height:44px;width:auto;display:block}
.pill{display:inline-flex;align-items:center;gap:12px;height:60px;padding:0 26px;border:2px solid;border-radius:999px;font:600 21px/1 Inter;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
.fr{position:absolute;right:72px;bottom:62px}
.kw{display:inline-flex;align-items:center;gap:16px;height:2.9em;padding:0 1.15em;border-radius:999px;font-family:Inter;font-weight:500;white-space:nowrap}
.kw b{font-weight:700;letter-spacing:.05em}
.g{font-family:"Inter Display",Inter,sans-serif;font-weight:500;letter-spacing:-.045em;line-height:.95}
.g em,.it{font-family:IS;font-style:italic;font-weight:400;letter-spacing:-.01em}
.body{font:400 34px/1.42 Inter}
'''
S = []


def slide(name, bg, html):
    S.append((name, f'<section class="s" id="{name}" style="background:{bg}">{html}</section>'))


# 1 COVER (ink): proven hook "Calling all ... artists", art in a frame, offer, keyword pill
slide('01-cover', INK, f'''
{frame(CREAM, 'Open call', accent=ORANGE)}
<h1 class="g a" style="left:68px;right:72px;top:150px;font-size:118px;color:{CREAM}">{CALL['hook'].replace('<em>', f'<em style="color:{ORANGE}">')}</h1>
<div class="a" style="left:72px;right:72px;top:470px;height:470px;border-radius:28px;background:url(art/{CALL['art']}) {CALL['art_pos']}/cover"></div>
<p class="a" style="left:72px;top:975px;font:500 36px/1.35 Inter;color:{CREAM}">Get published in a hardcover book. <span style="color:{PEONY}">Win $500.</span></p>
<div class="a" style="left:72px;top:1065px">{kwpill(ORANGE, INK)}</div>
<p class="a" style="right:72px;top:1095px;font:500 24px/1 Inter;color:{CREAM};opacity:.8">Apply by {CALL['deadline']}</p>
''')

# 2 STAT (orange)
slide('02-stat', ORANGE, f'''
{frame(INK, 'The book')}
<p class="g a" style="left:46px;top:150px;font-size:520px;color:{INK}">101</p>
<div class="a" style="left:72px;right:72px;top:730px;border-top:3px solid {INK}"></div>
<p class="g a" style="left:72px;right:72px;top:770px;font-size:84px;color:{INK}">artists will be published in <em>one hardcover book.</em></p>
<p class="body a" style="left:72px;right:200px;top:1010px;color:{INK}">Yours could be one of them. Open to artists worldwide.</p>
''')

# 3 RECEIPT (peony): the value, line by line
rows = [('Your artwork', 'Printed in hardcover'), ('Certificate', 'Official recognition'), ('Social features', '190,000+ followers'),
        ('Email feature', '100,000+ readers'), ('Sold at', 'Amazon · Barnes & Noble')]
rh = ''.join(f'<div style="display:flex;justify-content:space-between;padding:13px 0"><span>{a}</span><b style="font-weight:600">{b}</b></div>' for a, b in rows)
bars = ''.join(f'<i style="display:inline-block;width:{w}px;height:84px;background:{INK};margin-right:{g}px"></i>' for w, g in
               [(4, 6), (8, 4), (3, 7), (6, 3), (10, 5), (3, 4), (5, 8), (9, 3), (3, 6), (7, 4), (4, 5), (10, 3), (3, 7), (6, 4), (8, 6), (3, 3), (5, 7), (9, 4), (4, 5), (7, 3), (3, 6), (10, 4), (5, 0)])
slide('03-receipt', PEONY, f'''
{frame(INK, 'If selected')}
<div class="a" style="left:150px;right:150px;top:150px;height:1050px;background:{CREAM};color:{INK};padding:84px 62px 0;
  -webkit-mask:radial-gradient(circle 14px at 50% 0,transparent 98%,#000) 0 0/36px 100% repeat-x">
  <div style="display:flex;justify-content:center">{LOGO.replace('<svg', '<svg style="height:58px;width:auto"')}</div>
  <p style="text-align:center;font:600 23px/1 Inter;letter-spacing:.16em;margin-top:40px;padding:26px 0;border-top:2px dashed #B9A79F;border-bottom:2px dashed #B9A79F">WHAT YOU GET</p>
  <div style="font:400 27px/1.3 Inter;padding:16px 0;border-bottom:2px dashed #B9A79F">{rh}</div>
  <div style="display:flex;justify-content:space-between;font:600 30px/1.3 Inter;padding:28px 0;border-bottom:2px dashed #B9A79F"><span>Total</span><span style="color:{ORANGE}">Your name in print</span></div>
  <div style="text-align:center;margin-top:44px">{bars}</div>
  <p style="text-align:center;font:600 19px/1 Inter;letter-spacing:.2em;margin-top:16px">COMMENT {CALL['kw']}</p>
</div>
''')

# 4 PRIZE (ink)
slide('04-prize', INK, f'''
{frame(CREAM, 'Awards', accent=ORANGE)}
<div class="a" style="right:72px;top:930px;width:200px;height:200px;color:{ORANGE};transform:rotate(12deg)">{star(200)}<p style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 26px/1 Inter;letter-spacing:.12em;color:{INK}">WINNER</p></div>
<p class="g a" style="left:52px;top:160px;font-size:400px;color:{CREAM}">$500</p>
<p class="g a" style="left:72px;top:560px;font-size:96px;color:{CREAM}">cash award <em style="color:{PEONY}">for the winner.</em></p>
<div class="a" style="left:72px;right:72px;top:820px;display:flex;flex-wrap:wrap;gap:14px">
  {''.join(f'<span class="pill" style="color:{CREAM};border-color:{CREAM}">{t}</span>' for t in ['+ 4-page feature', '+ Glass trophy', '+ Artsy listing'])}</div>
<p class="body a" style="left:72px;right:330px;top:960px;color:{CREAM};opacity:.85">Two runners-up get a 2-page feature and a trophy too.</p>
''')


# 5 IN / OUT (cream notebook)
def box(t):
    return f'<p style="display:flex;align-items:center;gap:22px;font:400 34px/1 Inter;color:{INK};padding:15px 0"><i style="width:30px;height:30px;border:2.5px solid {INK};border-radius:50%;display:block"></i>{t}</p>'


slide('05-inout', CREAM, f'''
<div class="a" style="inset:0;background:repeating-linear-gradient(180deg,transparent 0 67px,#EBDCD2 67px 69px)"></div>
<div class="a" style="left:150px;top:130px;bottom:150px;width:3px;background:{ORANGE}"></div>
{frame(INK, 'The theme')}
<h2 class="g a" style="left:190px;right:72px;top:150px;font-size:104px;color:{INK}">Does my work <em>count?</em></h2>
<div class="a" style="left:190px;top:400px">
  <span style="background:{PEONY};color:{INK};font:700 23px/1 Inter;letter-spacing:.12em;padding:12px 18px;border-radius:6px">IN</span>
  <div style="margin-top:16px">{''.join(box(t) for t in ['Flowers and plants', 'Trees and forests', 'Butterflies and birds', 'Landscapes', 'Abstract or imagined nature', 'Any medium, any style'])}</div>
  <span style="display:inline-block;margin-top:34px;background:{ORANGE};color:{CREAM};font:700 23px/1 Inter;letter-spacing:.12em;padding:12px 18px;border-radius:6px">OUT</span>
  <div style="margin-top:16px">{box('AI-generated work')}</div>
</div>
''')


# 6 CHAT (peony)
def q(t):
    return f'<div style="align-self:flex-end;background:{INK};color:{CREAM};border-radius:30px 30px 6px 30px;padding:24px 32px;font:400 32px/1.35 Inter;max-width:720px">{t}</div>'


def a_(t):
    return f'<div style="align-self:flex-start;background:{CREAM};color:{INK};border-radius:30px 30px 30px 6px;padding:24px 32px;font:400 32px/1.35 Inter;max-width:720px">{t}</div>'


slide('06-chat', PEONY, f'''
{frame(INK, 'Questions')}
<h2 class="g a" style="left:68px;top:150px;font-size:120px;color:{INK}">Is this <em>for me?</em></h2>
<div class="a" style="left:72px;right:72px;top:350px;display:flex;flex-direction:column;gap:18px">
  {q("I'm self-taught. Can I apply?")}{a_('Yes. No degree or gallery needed.')}
  {q('I live outside the US.')}{a_("It's open to artists worldwide, 18+.")}
  {q('How do I apply?')}{a_(f"Comment <b>{CALL['kw']}</b> and we'll DM you everything.")}
</div>
''')

# 7 CTA (orange): search bar + circled keyword
slide('07-cta', ORANGE, f'''
{frame(INK, 'Apply', right='Link in bio')}
<div class="a" style="left:72px;right:72px;top:160px;height:96px;border:2px solid {INK};border-radius:999px;display:flex;align-items:center;gap:22px;padding:0 36px;color:{INK};font:500 32px/1 Inter">
  <svg viewBox="0 0 24 24" width="36" height="36"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
  open call for artists, garden edition</div>
<p class="g a" style="left:62px;top:390px;font-size:220px;color:{INK}">Comment</p>
<p class="g a" style="left:62px;top:600px;font-size:220px;color:{CREAM}">{CALL['kw']}</p>
<svg class="a" style="left:22px;top:575px" width="960" height="300" viewBox="0 0 960 300"><path d="M60 160 C 40 50, 470 10, 760 34 C 975 52, 970 235, 690 268 C 430 300, 70 280, 48 185 C 38 140, 120 86, 240 72" fill="none" stroke="{INK}" stroke-width="5" stroke-linecap="round"/></svg>
<p class="it a" style="left:72px;top:900px;font-size:60px;color:{INK}">We'll DM you the brief and your link to apply.</p>
<p class="a" style="left:72px;top:1020px;font:600 22px/1 Inter;letter-spacing:.14em;color:{INK}">DEADLINE {CALL['deadline'].upper()} · WORLDWIDE · 18+</p>
''')

# SECOND CALL, same system: proves calls change only words and art
CALL2 = dict(CALL, kw='AWARD', series='Woman Artist Award · 7th Edition', deadline='30 Nov 2026',
             hook='Calling all <em>women artists.</em>', art='flower-portrait.jpg', art_pos='50% 18%')
_c = CALL
CALL = CALL2
slide('w-cover', INK, f'''
{frame(CREAM, 'Open call', accent=ORANGE)}
<h1 class="g a" style="left:68px;right:72px;top:150px;font-size:118px;color:{CREAM}">{CALL['hook'].replace('<em>', f'<em style="color:{ORANGE}">')}</h1>
<div class="a" style="left:72px;right:72px;top:470px;height:470px;border-radius:28px;background:url(art/{CALL['art']}) {CALL['art_pos']}/cover"></div>
<p class="a" style="left:72px;top:975px;font:500 36px/1.35 Inter;color:{CREAM}">Get published in a hardcover book. <span style="color:{PEONY}">Win $500.</span></p>
<div class="a" style="left:72px;top:1065px">{kwpill(ORANGE, INK)}</div>
<p class="a" style="right:72px;top:1095px;font:500 24px/1 Inter;color:{CREAM};opacity:.8">Apply by {CALL['deadline']}</p>
''')
CALL = _c

(HERE / 'slides-v5.html').write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(h for _, h in S)}</body></html>')
(HERE / '.shot6.cjs').write_text(f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1080,height:1350}}}});
await p.goto('file://{HERE}/slides-v5.html');await p.evaluate(()=>document.fonts.ready);
for(const id of {json.dumps([n for n, _ in S])}){{await p.locator('[id="'+id+'"]').screenshot({{path:'{OUT}/'+id+'.png'}});}}await b.close();}})();""")
subprocess.run(['node', str(HERE / '.shot6.cjs')], check=True, cwd='/tmp')
print('rendered', len(S))
