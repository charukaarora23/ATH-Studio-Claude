"""ATH Creative Fund launch carousel, set in the style of the founder's reference:
deep burgundy ground, huge tight pink type, round arrow badge, swipe pill. Type only.

Usage: ATH_FONTS=<fonts folder> NP=<playwright folder> python3 design/campaigns/creative-fund/fund_ref.py
"""
import os, subprocess, pathlib
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
FONTS = pathlib.Path(os.environ.get('ATH_FONTS', 'fonts')).resolve()
OUT = HERE / 'v-ref'
NIGHT, ROSE = '#52051A', '#FFA1C2'

CHEV = '<svg viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CHEVL = '<svg viewBox="0 0 24 24"><path d="M14.5 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def badge(bg, fg):
    return f'<span class="badge" style="background:{bg};color:{fg}">{CHEV}</span>'


def pill(text, bg, fg):
    return f'<div class="pill"><span class="pc" style="border-color:{bg};color:{bg}">{CHEVL}</span><span class="pt" style="background:{bg};color:{fg}">{text}</span></div>'


S = []
def add(name, bg, fg, body, cta=None):
    S.append((name, f'<section id="{name}" class="s" style="background:{bg};color:{fg}">{body}{pill(cta, fg, bg) if cta else ""}</section>'))

add('01-cover', NIGHT, ROSE, f'<h1 class="h xl">{badge(ROSE, NIGHT)}ATH Creative Fund</h1><p class="h l" style="top:610px">$500 for one artist, every month.</p>', 'Swipe to apply')
add('02-promise', NIGHT, ROSE, '<h2 class="h xl">No proposal. No report. No questions asked.</h2>', 'Swipe')
add('03-why', ROSE, NIGHT, '<h2 class="h l">We would rather fund the work than make artists prove they deserve it.</h2>', 'Swipe')
add('04-money', NIGHT, ROSE, '<p class="fig">$500</p><p class="h m" style="top:580px">to one artist, every month. Spend it on paint, rent, a course, time.</p>', 'Swipe')
add('05-steps', NIGHT, ROSE, f'<p class="lab">How to apply</p><div class="steps"><div>{badge(ROSE, NIGHT).replace(CHEV, "<b>1</b>")}Choose one piece you made</div><div>{badge(ROSE, NIGHT).replace(CHEV, "<b>2</b>")}Post it on Instagram</div><div>{badge(ROSE, NIGHT).replace(CHEV, "<b>3</b>")}Comment FUND to apply</div></div>', 'Swipe')
add('06-post', NIGHT, ROSE, '<h2 class="h l">In your caption</h2><div class="tags"><span>@artstoheartsproject</span><span>#ATHCreativeFund</span></div><p class="h s" style="top:900px">And follow us, so you see our message if you are chosen.</p>', 'Swipe')
add('07-dates', NIGHT, ROSE, '<p class="lab">Open now</p><h2 class="h xl" style="top:210px">15 October to 15 November</h2>', 'Swipe')
add('08-send', ROSE, NIGHT, f'<h2 class="h xl">{badge(NIGHT, ROSE)}Send this to an artist who needs $500.</h2>', 'Comment FUND for the link')

CSS = f'''
@font-face{{font-family:IT;font-weight:500;src:url("{(FONTS/'it/package/files/inter-tight-latin-500-normal.woff2').as_uri()}")}}
body{{margin:0;background:#777;display:flex;flex-wrap:wrap;gap:40px;padding:40px}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;font-family:IT;font-weight:500;-webkit-font-smoothing:antialiased}}
.h{{position:absolute;left:96px;right:96px;top:140px;margin:0;letter-spacing:-0.04em;text-wrap:balance;font-weight:500}}
.xl{{font-size:156px;line-height:.93}}
.l{{font-size:112px;line-height:.96}}
.m{{font-size:76px;line-height:1.02;letter-spacing:-0.03em}}
.s .h.s{{font-size:56px;line-height:1.1;letter-spacing:-0.025em;position:absolute}}
.badge{{display:inline-flex;width:.74em;height:.74em;border-radius:50%;align-items:center;justify-content:center;vertical-align:baseline;transform:translateY(.03em);margin-right:.14em}}
.badge svg{{width:44%;height:44%}}
.badge b{{font-size:.5em;line-height:1}}
.fig{{position:absolute;left:80px;top:150px;margin:0;font-size:400px;line-height:.85;letter-spacing:-0.075em}}
.lab{{position:absolute;left:96px;top:140px;margin:0;font-size:44px;letter-spacing:-0.01em;opacity:.85}}
.steps{{position:absolute;left:96px;right:96px;top:260px;display:grid;gap:56px;font-size:96px;line-height:1;letter-spacing:-0.04em}}
.steps .badge{{font-size:96px}}
.tags{{position:absolute;left:96px;right:96px;top:330px;display:grid;gap:22px;justify-items:start}}
.tags span{{font-size:84px;letter-spacing:-0.035em;line-height:1;padding:22px 34px;border-radius:999px;border:4px solid currentColor}}
.pill{{position:absolute;left:0;right:0;bottom:120px;display:flex;justify-content:center;align-items:center}}
.pc{{width:96px;height:96px;border:2px solid;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-right:-16px;z-index:1}}
.pc svg{{width:40%;height:40%}}
.pt{{font-size:42px;letter-spacing:-0.01em;padding:24px 46px;border-radius:999px;white-space:nowrap}}
'''
OUT.mkdir(exist_ok=True)
for f in OUT.glob('*.jpg'): f.unlink()
page = HERE / 'carousel_ref.html'
page.write_text(f'<!doctype html><meta charset="utf-8"><style>{CSS}</style>' + ''.join(b for _, b in S))
subprocess.run(['node', str(HERE / 'shot.cjs'), page.as_uri(), str(OUT)] + [n for n, _ in S], check=True)
for n, _ in S:
    p = OUT / f'{n}.png'; im = Image.open(p).convert('RGB'); im.save(OUT / f'{n}.jpg', quality=92); p.unlink()
print(len(S))
