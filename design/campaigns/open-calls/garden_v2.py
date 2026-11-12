"""Garden Edition launch v2: fewer words, one idea per slide, built to drive 'Comment GARDEN'.

Why: on @artstoheartsproject the posts that got the most comments (and so the most DMs) had
a keyword to comment, something free or a clear money hook, and very little text on the image:
  Comment GROW (free ebook) 591 · Creative Fund (Comment FUND, $500, free) 426 / 415 ·
  Woman Artist Award (identity call-out, Comment AWARD) 205 / 205 · Artist of the Year (no keyword) 25-114.
Usage: python3 garden_v2.py  -> slides-v2/*.png
"""
import json, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'slides-v2'
OUT.mkdir(exist_ok=True)
C = dict(deep='#0B3B36', mid='#025054', light='#D0D996', tint='#EEF0D6', paper='#FFFBF6', cream='#F9EEE5',
         ink='#1C1310', burgundy='#6A0620', night='#52051A', chilli='#AA0003', peony='#FAD2E1')
KW = 'GARDEN'
TOTAL = 7
LOGO = (HERE / 'art' / 'logo-open-calls.svg').read_text().replace('viewBox="-78.00 -156.47 750.45 302.01"', 'viewBox="-2 -84 600 156"')


def top(n, fg):
    return f'<header class="top" style="color:{fg}"><span class="logo">{LOGO}</span><span class="count">{n} / {TOTAL}</span></header>'


def foot(fg, text='Swipe'):
    return f'<footer class="foot" style="color:{fg}"><span>101 Art Book · Garden Edition</span><b>{text} →</b></footer>'


def kw(bg, fg, size=1):
    return f'<span class="kw" style="background:{bg};color:{fg};font-size:{30 * size}px">Comment <b>{KW}</b></span>'


def credit(t, fg):
    return f'<p class="credit" style="color:{fg}">{t}</p>'


CSS = f'''
@font-face{{font-family:"IS";src:url(fonts/InstrumentSerif-Regular.ttf)}}
@font-face{{font-family:"AB";src:url(fonts/ArchivoBlack-Regular.ttf)}}
.ab{{font-family:AB;text-transform:uppercase;letter-spacing:-.02em;line-height:.9}}
.kwbig{{display:flex;align-items:center;justify-content:space-between;border-radius:12px;padding:0 44px;height:150px}}
.kwbig b{{font:400 62px/1 AB;letter-spacing:.01em;white-space:nowrap}}
.kwbig span{{font:500 26px/1.25 Inter;text-align:right}}
@font-face{{font-family:"IS";font-style:italic;src:url(fonts/InstrumentSerif-Italic.ttf)}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased;background:#ccc}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;margin-bottom:30px}}
.bg{{position:absolute;inset:0;background-size:cover}}
.top{{position:absolute;left:72px;right:72px;top:60px;display:flex;justify-content:space-between;align-items:center;z-index:5}}
.logo svg{{height:54px;width:auto;display:block}}
.count{{font:500 24px/1 Inter;letter-spacing:.08em}}
.foot{{position:absolute;left:72px;right:72px;bottom:58px;display:flex;justify-content:space-between;font:500 24px/1 Inter;z-index:5}}
.foot b{{font-weight:600}}
.h{{font-family:IS;font-weight:400;letter-spacing:-.02em;line-height:.92}}
.h em{{font-style:italic}}
.sub{{font:400 36px/1.35 Inter}}
.kw{{display:inline-flex;align-items:center;gap:.4em;height:2.4em;padding:0 1.1em;border-radius:12px;font-family:Inter;font-weight:500}}
.kw b{{font-weight:700;letter-spacing:.06em}}
.credit{{position:absolute;right:28px;bottom:130px;writing-mode:vertical-rl;transform:rotate(180deg);font:italic 24px/1 IS;z-index:5;opacity:.9}}
.abs{{position:absolute;left:72px;right:72px}}
'''
S = []


def slide(name, bg, html):
    S.append((name, f'<section class="s" id="{name}" style="background:{bg}">{html}</section>'))


# 1 HOOK: identity call-out on the art, one promise, the keyword
slide('01-hook', C['deep'], f'''
<div class="bg" style="background-image:url(art/flower-portrait.jpg);background-position:50% 22%"></div>
<div class="bg" style="background:linear-gradient(180deg,rgba(11,59,54,.45) 0%,rgba(11,59,54,0) 18%,rgba(11,59,54,0) 48%,{C['deep']} 84%)"></div>
{top(1, C['paper'])}{credit('Artwork: Artist Name', C['paper'])}
<div class="abs" style="top:700px">
  <h1 class="h" style="color:{C['paper']};font-size:150px">Do you paint <em>flowers, leaves or gardens?</em></h1>
  <p class="sub" style="color:{C['light']};margin-top:30px">Your work could be in our next book.</p>
</div>
{foot(C['paper'])}''')

# 2 THE OFFER: one sentence
slide('02-offer', C['paper'], f'''
{top(2, C['deep'])}
<div class="abs" style="top:330px">
  <h2 class="h" style="color:{C['deep']};font-size:300px;line-height:.82">101</h2>
  <h2 class="h" style="color:{C['deep']};font-size:118px;margin-top:20px">artists will be published in one <em>hardcover book.</em></h2>
  <p class="sub" style="color:{C['ink']};margin-top:44px">101 Art Book: Garden Edition. Open to artists worldwide.</p>
</div>
{foot(C['deep'])}''')

# 3 PICTURE IT: a book spread with an empty name slot
slide('03-page', C['deep'], f'''
{top(3, C['paper'])}
<h2 class="h abs" style="top:190px;color:{C['paper']};font-size:120px">This page could <em>be yours.</em></h2>
<div style="position:absolute;left:70px;right:70px;top:500px;height:640px;display:flex;transform:rotate(-2deg);box-shadow:0 40px 90px rgba(0,0,0,.45)">
  <div style="flex:1;background:{C['paper']};padding:44px;border-right:2px solid #E9DFD4">
    <div style="width:100%;height:100%;background:url(art/night-bloom.jpg) 50% 30%/cover"></div></div>
  <div style="flex:1;background:{C['paper']};padding:64px 50px;display:flex;flex-direction:column;justify-content:flex-end">
    <p style="font:600 18px/1 Inter;letter-spacing:.16em;text-transform:uppercase;color:{C['mid']}">Artist No. 042</p>
    <p class="h" style="font-size:76px;color:{C['ink']};margin-top:18px"><em>Your Name</em></p>
    <p style="font:400 24px/1.5 Inter;color:{C['ink']};margin-top:18px;opacity:.8">Title of your work, 2026<br>Oil on canvas · Your country</p>
  </div>
</div>
{foot(C['paper'])}''')

# 4 THE PRIZE: one number
slide('04-prize', C['burgundy'], f'''
{top(4, C['cream'])}
<div class="abs" style="top:300px">
  <p style="font:600 26px/1 Inter;letter-spacing:.16em;text-transform:uppercase;color:{C['peony']}">For the winner</p>
  <h2 class="h" style="color:{C['cream']};font-size:420px;line-height:.85;margin-top:30px">$500</h2>
  <h2 class="h" style="color:{C['cream']};font-size:104px;margin-top:20px">and a <em>4-page feature</em> in the book.</h2>
  <p class="sub" style="color:{C['peony']};margin-top:40px">Glass trophies for the top three.</p>
</div>
{foot(C['cream'])}''')

# 5 DOES MY WORK FIT: one line, art strip
slide('05-fit', C['light'], f'''
{top(5, C['deep'])}
<div class="abs" style="top:250px">
  <h2 class="h" style="color:{C['deep']};font-size:132px">Flowers. Trees. Butterflies. <em>Even the ones you imagine.</em></h2>
  <p class="sub" style="color:{C['deep']};margin-top:44px">Any medium. Abstract is welcome.<br>No art degree needed.</p>
</div>
<div style="position:absolute;left:0;right:0;bottom:150px;height:250px;background:url(art/ref-reid.jpg) 50% 60%/cover"></div>
{foot(C['deep'])}''')

# 6 THE ASK: show exactly what happens when you comment
bubble = lambda side, bg, fg, html: f'<div style="align-self:{side};max-width:760px;background:{bg};color:{fg};border-radius:36px;padding:28px 36px;font:400 32px/1.4 Inter">{html}</div>'
slide('06-comment', C['paper'], f'''
{top(6, C['deep'])}
<h2 class="h abs" style="top:190px;color:{C['deep']};font-size:132px">Want the details? <em>Just comment.</em></h2>
<div class="abs" style="top:560px;display:flex;flex-direction:column;gap:22px">
  <div style="display:flex;gap:22px;align-items:center">
    <div style="width:84px;height:84px;border-radius:50%;background:{C['light']}"></div>
    <p style="font:400 34px/1.3 Inter;color:{C['ink']}"><b style="font-weight:600">you</b>&nbsp;&nbsp;<span style="font-weight:700;letter-spacing:.04em">{KW}</span></p>
  </div>
  {bubble('flex-end', C['deep'], C['paper'], 'Here is everything for the Garden Edition 🌿<br>What to send, the deadline and your link to apply.')}
</div>
<div class="abs" style="top:1120px">{kw(C['burgundy'], C['cream'], 1.05)}</div>
{foot(C['deep'], 'One more')}''')

# 7 CLOSE: deadline + keyword, nothing else
slide('07-close', C['deep'], f'''
<div class="bg" style="background-image:url(art/night-bloom.jpg);background-position:50% 30%"></div>
<div class="bg" style="background:linear-gradient(180deg,rgba(11,59,54,.4),rgba(11,59,54,.05) 30%,{C['deep']} 70%)"></div>
{top(7, C['paper'])}{credit('Artwork: Artist Name', C['paper'])}
<div class="abs" style="top:800px">
  <p style="font:600 26px/1 Inter;letter-spacing:.16em;text-transform:uppercase;color:{C['light']}">Apply by 13 December 2026</p>
  <h2 class="h" style="color:{C['paper']};font-size:136px;margin-top:26px">Be one of <em>the 101.</em></h2>
  <div style="margin-top:44px">{kw(C['paper'], C['deep'], 1.1)}</div>
</div>
{foot(C['paper'], 'Link in bio')}''')


# ---- COVER v3: loud call-out, offer and keyword on the cover (what GROW / FUND / AWARD posts did) ----
def kwbar(bg, fg, sub):
    return f'<div class="kwbig" style="background:{bg};color:{fg}"><b>Comment {KW}</b><span style="color:{sub}">We\'ll DM you<br>everything</span></div>'

def seal(top_, bottom, x, y, r=-10):
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:250px;height:250px;border-radius:50%;background:{C["chilli"]};color:{C["cream"]};'
            f'display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate({r}deg);z-index:6;text-align:center">'
            f'<b style="font:400 84px/.9 AB">{top_}</b><span style="font:600 20px/1.2 Inter;letter-spacing:.12em;text-transform:uppercase;margin-top:8px">{bottom}</span></div>')

slide('01a-callout', C['deep'], f"""
<div class="bg" style="height:700px;background-image:url(art/flower-portrait.jpg);background-position:50% 18%"></div>
<div class="bg" style="top:560px;height:140px;background:linear-gradient(180deg,rgba(11,59,54,0),{C['deep']})"></div>
{top(1, C['paper'])}{seal('$500', 'cash award', 770, 330)}
<div class="abs" style="top:690px">
  <p style="font:700 26px/1 Inter;letter-spacing:.16em;color:{C['light']}">OPEN CALL · 101 ART BOOK</p>
  <h1 class="ab" style="color:{C['paper']};font-size:96px;margin-top:22px">Calling all artists who paint nature</h1>
  <p class="h" style="color:{C['light']};font-size:62px;margin-top:20px"><em>Get published in our Garden Edition.</em></p>
</div>
<div class="abs" style="top:1130px">{kwbar(C['light'], C['deep'], C['mid'])}</div>
""")

slide('01b-offer', C['deep'], f"""
<div class="bg" style="background-image:url(art/night-bloom.jpg);background-position:50% 30%"></div>
<div class="bg" style="background:linear-gradient(180deg,rgba(11,59,54,.92) 0%,rgba(11,59,54,.55) 45%,rgba(11,59,54,.2) 62%,{C['deep']} 86%)"></div>
{top(1, C['paper'])}
<div class="abs" style="top:190px">
  <p style="font:700 26px/1 Inter;letter-spacing:.16em;color:{C['light']}">ARTISTS, THIS IS YOUR CALL</p>
  <h1 class="ab" style="color:{C['paper']};font-size:150px;margin-top:24px">Get<br>published</h1>
  <p class="h" style="color:{C['paper']};font-size:74px;margin-top:22px">in a hardcover art book <em>+ win $500</em></p>
</div>
<div class="abs" style="top:1050px">
  <p style="font:600 28px/1 Inter;color:{C['light']};margin-bottom:26px">Garden Edition · Open worldwide · Apply by 13 Dec</p>
  {kwbar(C['paper'], C['deep'], C['mid'])}
</div>
""")

slide('01c-keyword', C['light'], f"""
{top(1, C['deep'])}
<div style="position:absolute;right:72px;top:170px;width:420px;height:520px;border-radius:24px;background:url(art/flower-portrait.jpg) 50% 15%/cover;transform:rotate(4deg);box-shadow:0 30px 60px rgba(11,59,54,.35)"></div>
{seal('101', 'artists', 470, 560, -8)}
<div class="abs" style="top:190px;right:520px">
  <p style="font:700 24px/1.3 Inter;letter-spacing:.14em;color:{C['mid']}">NEW OPEN CALL</p>
  <h1 class="ab" style="color:{C['deep']};font-size:112px;margin-top:22px">Your art in our next book</h1>
</div>
<div class="abs" style="top:860px">
  <h2 class="ab" style="color:{C['deep']};font-size:150px">Comment<br>“{KW}”</h2>
  <p class="sub" style="color:{C['deep']};margin-top:26px">We'll DM you how to apply. <b style="font-weight:600">$500 for the winner.</b></p>
</div>
""")

(HERE / 'slides-v2.html').write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(h for _, h in S)}</body></html>')
js = f'''const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1080,height:1350}}}});
await p.goto('file://{HERE}/slides-v2.html');await p.evaluate(()=>document.fonts.ready);
for(const id of {json.dumps([n for n, _ in S])}){{await p.locator('[id="'+id+'"]').screenshot({{path:'{OUT}/'+id+'.png'}});}}await b.close();}})();'''
(HERE / '.shot.cjs').write_text(js)
subprocess.run(['node', str(HERE / '.shot.cjs')], check=True, cwd='/tmp')
print('rendered', len(S))
