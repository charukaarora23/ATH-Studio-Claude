"""Calibration set: Garden posts in the structure of the Foremark / Better Future references,
in ATH colours (Peony = the peach, Chilli = the orange, Ink = the black).
Big regular-weight grotesk numerals, a few words of small text, one tiny label, wordmark in a corner.
Texture: soft folded light on Peony, grain on the flats. No counters, no stickers.
Usage: python3 calibrate.py -> calibrate/*.png
"""
import json, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'calibrate'
OUT.mkdir(exist_ok=True)
PEONY, CHILLI, INK, CREAM = '#F7C9C4', '#AA0003', '#1E1714', '#F9ECE5'
LOGO = (HERE / 'art' / 'logo-open-calls.svg').read_text().replace('viewBox="-78.00 -156.47 750.45 302.01"', 'viewBox="-2 -84 600 156"')

# folded-light texture on peony, like the Foremark peach posts
FOLD = (f'radial-gradient(70% 55% at 112% 18%, rgba(255,255,255,.0) 55%, rgba(255,255,255,.55) 62%, rgba(255,255,255,0) 72%),'
        f'radial-gradient(90% 75% at 118% 32%, rgba(222,110,95,0) 58%, rgba(222,110,95,.28) 66%, rgba(222,110,95,0) 78%),'
        f'radial-gradient(120% 100% at 125% 45%, rgba(255,255,255,0) 60%, rgba(255,255,255,.4) 68%, rgba(255,255,255,0) 80%),'
        f'linear-gradient(160deg, #F9D3CC, {PEONY})')

CSS = '''
@font-face{font-family:G;src:url(fonts/ath/HankenGrotesk.woff2);font-weight:100 900}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#ddd;-webkit-font-smoothing:antialiased}
.s{position:relative;width:1080px;height:1350px;overflow:hidden;margin-bottom:30px;font-family:G}
.a{position:absolute}
.grain{position:absolute;inset:0;background:url(art/grain.png);mix-blend-mode:overlay;opacity:.16;pointer-events:none}
.big{font-weight:500;letter-spacing:-.065em;line-height:.8}
.h{font-weight:500;letter-spacing:-.045em;line-height:.95}
.p{font-weight:400;font-size:27px;line-height:1.3;letter-spacing:-.01em}
.lab{font-weight:400;font-size:24px;letter-spacing:-.01em}
.logo svg{height:46px;width:auto;display:block}
'''
S = []


def post(name, bg, html, grain=True):
    S.append((name, f'<section class="s" id="{name}" style="background:{bg}">{html}{"<div class=grain></div>" if grain else ""}</section>'))


def corner(c, label, right='logo', pos='top'):
    y = 'top:64px' if pos == 'top' else 'bottom:64px'
    r = f'<div class="a logo" style="right:64px;{y};color:{c}">{LOGO}</div>' if right == 'logo' else f'<p class="a lab" style="right:64px;{y};color:{c}">{right}</p>'
    return f'<p class="a lab" style="left:64px;{y};color:{c}">{label}</p>{r}'


# 1 · the number (like +27%)
post('1-number', CHILLI, f'''
<p class="a big" style="left:34px;top:40px;font-size:640px;color:{INK}">101</p>
<p class="a p" style="left:64px;top:690px;width:430px;color:{CREAM}">Artists will be selected for the Garden Edition, our sixteenth juried book. Submissions close 13 December.</p>
<p class="a lab" style="right:64px;top:770px;color:{CREAM}">Open call</p>
<div class="a" style="left:0;right:0;bottom:0;height:470px;background:url(art/call-garden.jpg) 50% 45%/cover"></div>
''')

# 2 · the statement (like Market Rewards Clarity)
post('2-statement', PEONY, f'''
<div class="a" style="inset:0;background:{FOLD}"></div>
<h2 class="a h" style="left:60px;top:90px;font-size:150px;color:{INK}">Your work,<br>in print.</h2>
<div class="a" style="left:64px;top:430px;width:420px;border-top:2px solid {INK}"></div>
<p class="a p" style="left:64px;top:458px;width:420px;color:{INK}">101 artists. One hardcover book, sold on Amazon and Barnes &amp; Noble. Submissions for the Garden Edition close 13 December.</p>
{corner(INK, 'Open call', pos='bottom')}
''')

# 3 · the bars (like $900K / $1.8M)
post('3-bars', PEONY, f'''
<h2 class="a h" style="left:60px;top:80px;font-size:96px;color:{INK}">A growing<br>collection</h2>
<div class="a" style="left:64px;top:300px;width:400px;border-top:2px solid {INK}"></div>
<p class="a p" style="left:64px;top:326px;width:400px;color:{INK}">1,300+ artists published across fifteen editions since 2023. The sixteenth is open now.</p>
<div class="a" style="left:64px;bottom:64px;width:430px;height:420px;background:{INK};padding:34px"><p class="h" style="font-size:96px;color:{PEONY}">15</p><p class="p" style="color:{PEONY};margin-top:10px">editions in print</p></div>
<div class="a" style="right:64px;bottom:64px;width:430px;height:860px;background:{CHILLI};padding:34px"><p class="h" style="font-size:96px;color:{PEONY}">16th</p><p class="p" style="color:{PEONY};margin-top:10px">Garden Edition, open until 13 December</p></div>
''')

# 4 · the photo with a panel (like Strategy is a Choise)
post('4-photo', PEONY, f'''
<div class="a" style="left:0;right:0;top:0;height:900px;background:url(art/call-women.jpg) 50% 40%/cover"></div>
<div class="a logo" style="left:64px;top:960px;color:{INK}">{LOGO}</div>
<h2 class="a h" style="left:500px;right:64px;top:950px;font-size:84px;color:{INK}">Be one of<br>the <span style="border-bottom:7px solid {CHILLI}">101</span></h2>
<p class="a lab" style="left:64px;bottom:64px;color:{INK}">Garden Edition · closes 13 December</p>
''', grain=False)

# 5 · the countdown (like 2.4K)
post('5-countdown', INK, f'''
{corner(CREAM, 'Garden Edition', right='Open call')}
<p class="a big" style="left:40px;top:230px;font-size:600px;color:{CREAM}">30<span style="font-size:200px;color:{CHILLI};letter-spacing:-.04em;margin-left:14px">days</span></p>
<div class="a" style="left:64px;top:860px;display:flex;align-items:center;gap:26px">
  <span style="display:inline-flex;align-items:center;justify-content:center;width:110px;height:62px;border:2.5px solid {CHILLI};border-radius:999px;color:{CHILLI}"><svg width="44" height="24" viewBox="0 0 44 24"><path d="M2 12h38M30 3l10 9-10 9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
  <span class="h" style="font-size:64px;color:{CREAM}">to submit</span></div>
<p class="a p" style="left:64px;top:1000px;width:620px;color:{CREAM};opacity:.85">Submissions for the Garden Edition close <span style="color:{PEONY}">13 December</span>. One original artwork is all it takes. Link in bio.</p>
''')

(HERE / 'calibrate.html').write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(h for _, h in S)}</body></html>')
(HERE / '.shot14.cjs').write_text(f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1080,height:1350}}}});
await p.goto('file://{HERE}/calibrate.html');await p.evaluate(()=>document.fonts.ready);
for(const id of {json.dumps([n for n, _ in S])}){{await p.locator('[id="'+id+'"]').screenshot({{path:'{OUT}/'+id+'.png'}});}}await b.close();}})();""")
subprocess.run(['node', str(HERE / '.shot14.cjs')], check=True, cwd='/tmp')
print('rendered', len(S))
