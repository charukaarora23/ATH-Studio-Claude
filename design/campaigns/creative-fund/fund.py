"""ATH Creative Fund: launch carousel (10 slides, 1080 x 1350).

Usage: ATH_FONTS=<fonts folder> NP=<folder holding playwright> python3 design/campaigns/creative-fund/fund.py
Fonts: npm @fontsource/inter-tight and @fontsource/libre-baskerville unpacked as it/ and lb/ in ATH_FONTS.
Writes slides/*.jpg (full size, to post) and slides/web/*.jpg (720 px, for the brief).
"""
import os, re, subprocess, pathlib
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
LOGO = HERE.parents[1] / 'logo' / 'svg' / 'master' / 'logo-master_burgundy.svg'
FONTS = pathlib.Path(os.environ.get('ATH_FONTS', 'fonts')).resolve()
OUT = HERE / 'slides'

BURG, ROSE, PEONY, INK = '#6A0620', '#FFA1C2', '#FAD2E1', '#1C1310'
WHITE, BLACK, GREY, MUTED = '#FFFFFF', '#141111', '#F1EEEB', '#6E6461'

src = LOGO.read_text()
x, y, w, h = map(float, re.search(r'viewBox="([^"]+)"', src).group(1).split())
VB = f'{x+78:.2f} {y+78:.2f} {w-156:.2f} {h-156:.2f}'
G = re.search(r'<g fill="[^"]+">(.*?)</g>', src, re.S).group(1)
logo = lambda c, wd: f'<svg style="width:{wd}px;display:block" viewBox="{VB}" fill="{c}" aria-hidden="true">{G}</svg>'
ARROW = '<svg class="arw" viewBox="0 0 72 40" aria-hidden="true"><rect x="1.25" y="1.25" width="69.5" height="37.5" rx="18.75" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M22 20h28M42 12.5l8 7.5-8 7.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
N = 10


def frame(c, i, br=True):
    return (f'<div class="m tl" style="color:{c}">ATH Creative Fund</div><div class="m tr" style="color:{c}">{i:02d} / {N:02d}</div>'
            f'<div class="m bl" style="color:{c}">@artstoheartsproject</div>' + (f'<div class="m br" style="color:{c}">{ARROW}</div>' if br else ''))


S = []
add = lambda name, bg, body: S.append((name, f'<section id="{name}" class="s" style="background:{bg}">{body}</section>'))

add('01-cover', BURG, f'''<div class="m tl" style="color:{WHITE}">ATH Creative Fund</div><div class="m tr" style="color:{WHITE}">Save this</div>
<p class="fig" style="color:{WHITE};top:140px;font-size:440px">$500</p>
<h1 class="h" style="color:{WHITE};top:610px;font-size:104px">for one artist.<br>Every month.</h1>
<p class="serif" style="color:{PEONY};top:850px;font-size:72px"><i>No questions asked.</i></p>
<div class="swipe" style="color:{WHITE}"><span>Swipe to apply</span>{ARROW}</div>
<div class="m bl" style="color:{WHITE}">@artstoheartsproject</div>''')

add('02-why', WHITE, f'''{frame(INK, 2)}
<p class="serif" style="color:{INK};top:170px;font-size:64px">Most funding asks artists to prove they deserve it. Proposals, budgets, reports, waiting.</p>
<h2 class="h" style="color:{BURG};top:720px;font-size:104px">We would rather just fund the work.</h2>''')

rows = [('Paid to one artist', 'Chosen each month'), ('In US dollars', '$500, sent to you'), ('Spend it on anything', 'Materials, rent, a course, time'), ('No strings', 'No proposal, no report back')]
rr = ''.join(f'<div class="row"><span style="color:{WHITE}">{a}</span><span style="color:{ROSE}">{b}</span></div>' for a, b in rows)
add('03-what', BLACK, f'''{frame(WHITE, 3)}
<p class="fig" style="color:{WHITE};top:120px;font-size:300px">$500</p>
<div class="list" style="top:470px">{rr}</div>''')

media = ['Painting', 'Drawing', 'Photography', 'Illustration', 'Sculpture', 'Ceramics', 'Textiles', 'Printmaking', 'Digital', 'Writing', 'Collage', 'Mixed media']
chips = ''.join(f'<span class="chip">{m}</span>' for m in media)
add('04-who', WHITE, f'''{frame(INK, 4)}
<h2 class="h" style="color:{INK};top:160px;font-size:96px">Who can apply</h2>
<div class="chips">{chips}</div>
<p class="serif" style="color:{BURG};top:1000px;font-size:60px"><i>If you made it, it counts.</i></p>''')


def step(n, name, title, body, extra=''):
    add(name, WHITE, f'''{frame(INK, n + 4)}
<p class="idx" style="color:{BURG}">Step {n} of 3</p>
<p class="fig" style="color:{BURG};top:190px;font-size:290px">{n}</p>
<h2 class="h" style="color:{INK};top:500px;font-size:88px">{title}</h2>
<p class="p" style="color:{INK};top:670px">{body}</p>{extra}''')


step(1, '05-step1', 'Choose your work', 'One piece that best represents your practice. New or already shared, as long as you made it.')
step(2, '06-step2', 'Share it on Instagram', 'Post it publicly between 15&nbsp;October and 15&nbsp;November.',
     f'''<div class="tags" style="top:820px"><span style="background:{GREY};color:{BURG}">@artstoheartsproject</span><span style="background:{GREY};color:{BURG}">#ATHCreativeFund</span></div>
<p class="small" style="color:{MUTED};top:1030px;font-size:30px">Mention us in the caption, add the hashtag and follow us so you see our message if you are chosen. Writers: post a photo of the page or a simple text graphic.</p>''')
step(3, '07-step3', 'Apply on our site', 'Send the link to your post, your work sample and a few lines about your practice, in your own words.',
     f'<p class="small" style="color:{BURG};top:880px;font-size:40px;font-weight:500">Link in our bio</p>')

add('08-dates', BLACK, f'''{frame(WHITE, 8)}
<h2 class="h" style="color:{WHITE};top:160px;font-size:96px">Dates</h2>
<div class="list" style="top:360px">
<div class="row big"><span style="color:{WHITE}">Opens</span><span style="color:{WHITE}">15 Oct</span></div>
<div class="row big"><span style="color:{WHITE}">Closes</span><span style="color:{ROSE}">15 Nov</span></div>
<div class="row big"><span style="color:{WHITE}">Artist chosen</span><span style="color:{WHITE}">TBC</span></div></div>
<p class="p" style="color:#CFC8C4;top:1060px">Then a new round, every month.</p>''')

checks = ['One piece of work you made', 'Posted publicly on Instagram', '@artstoheartsproject in the caption', '#ATHCreativeFund added', 'Following @artstoheartsproject', 'Form sent with your post link']
cc = ''.join(f'<div class="ck"><span class="bx" style="color:{BURG}">{TICK}</span><span>{c}</span></div>' for c in checks)
add('09-checklist', WHITE, f'''{frame(INK, 9)}
<h2 class="h" style="color:{INK};top:160px;font-size:96px">Before you apply</h2>
<div class="checks">{cc}</div>
<p class="serif" style="color:{BURG};top:1090px;font-size:52px"><i>Save this so you don't miss a step.</i></p>''')

add('10-share', BURG, f'''<div class="m tr" style="color:{WHITE}">10 / 10</div>
<h2 class="h" style="color:{WHITE};top:170px;font-size:112px">Know an artist who needs $500?</h2>
<p class="serif" style="color:{PEONY};top:560px;font-size:64px"><i>Send this to them.</i></p>
<div style="position:absolute;left:72px;top:1000px">{logo(WHITE, 420)}</div>
<p class="p" style="color:{PEONY};top:1130px">Apply: link in our bio</p>''')

CSS = f'''
@font-face{{font-family:IT;font-weight:400;src:url("{(FONTS/'it/package/files/inter-tight-latin-400-normal.woff2').as_uri()}")}}
@font-face{{font-family:IT;font-weight:500;src:url("{(FONTS/'it/package/files/inter-tight-latin-500-normal.woff2').as_uri()}")}}
@font-face{{font-family:LB;font-style:normal;src:url("{(FONTS/'lb/package/files/libre-baskerville-latin-400-normal.woff2').as_uri()}")}}
@font-face{{font-family:LB;font-style:italic;src:url("{(FONTS/'lb/package/files/libre-baskerville-latin-400-italic.woff2').as_uri()}")}}
body{{margin:0;background:#777;display:flex;flex-wrap:wrap;gap:40px;padding:40px}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;font-family:IT;-webkit-font-smoothing:antialiased}}
.m{{position:absolute;font:500 30px/1.2 IT;letter-spacing:-.005em;display:flex;align-items:center}}
.tl{{left:72px;top:60px}}.tr{{right:72px;top:60px}}.bl{{left:72px;bottom:60px}}.br{{right:72px;bottom:60px}}
.arw{{width:88px;height:49px;display:block}}
.h{{position:absolute;left:72px;right:72px;margin:0;font-weight:500;line-height:.98;letter-spacing:-0.035em;text-wrap:balance}}
.fig{{position:absolute;left:56px;margin:0;font:500 520px/.85 IT;letter-spacing:-0.07em}}
.serif{{position:absolute;left:72px;right:96px;margin:0;font:400 64px/1.2 LB;letter-spacing:-0.02em;text-wrap:pretty}}
.swipe{{position:absolute;left:0;right:0;bottom:170px;display:flex;justify-content:center;align-items:center;gap:20px;font:500 36px/1 IT}}
.list{{position:absolute;left:72px;right:72px}}
.row{{display:flex;justify-content:space-between;gap:32px;border-top:2px solid #ffffff33;padding:30px 0;font:500 42px/1.15 IT;letter-spacing:-0.015em}}
.row span:last-child{{text-align:right}}
.row.big{{font-size:72px;letter-spacing:-0.03em;padding:40px 0}}
.chips{{position:absolute;left:72px;right:72px;top:330px;display:flex;flex-wrap:wrap;gap:16px}}
.chip{{font:500 40px/1 IT;letter-spacing:-0.01em;padding:22px 32px;border-radius:999px;background:{GREY};color:{INK}}}
.idx{{position:absolute;left:72px;top:150px;margin:0;font:500 32px/1 IT}}
.p{{position:absolute;left:72px;right:120px;margin:0;font:400 44px/1.35 IT;letter-spacing:-0.01em}}
.small{{position:absolute;left:72px;right:120px;margin:0;font:400 32px/1.4 IT}}
.tags{{position:absolute;left:72px;right:72px;display:flex;flex-direction:column;gap:14px;align-items:flex-start}}
.tags span{{font:500 44px/1 IT;letter-spacing:-0.02em;padding:20px 28px;border-radius:14px}}
.checks{{position:absolute;left:72px;right:72px;top:330px;display:grid;gap:0}}
.ck{{display:flex;gap:28px;align-items:center;border-top:2px solid {INK}1f;padding:28px 0;font:500 46px/1.15 IT;letter-spacing:-0.02em;color:{INK}}}
.bx{{flex:0 0 56px;height:56px;border:3px solid currentColor;border-radius:12px;display:inline-flex;align-items:center;justify-content:center}}
.bx svg{{width:34px;height:34px}}
'''

OUT.mkdir(exist_ok=True)
(OUT / 'web').mkdir(exist_ok=True)
page = HERE / 'carousel.html'
page.write_text(f'<!doctype html><meta charset="utf-8"><style>{CSS}</style>' + ''.join(b for _, b in S))
shot = HERE / 'shot.cjs'
shot.write_text('''const {chromium}=require(process.env.NP+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1200}});
await p.goto(process.argv[2]);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
for(const id of process.argv.slice(4)){await p.locator('[id="'+id+'"]').screenshot({path:process.argv[3]+'/'+id+'.png'});}
await b.close()})();''')
subprocess.run(['node', str(shot), page.as_uri(), str(OUT)] + [n for n, _ in S], check=True)
for n, _ in S:
    p = OUT / f'{n}.png'
    im = Image.open(p).convert('RGB')
    im.save(OUT / f'{n}.jpg', quality=92, optimize=True)
    im.resize((720, 900), Image.LANCZOS).save(OUT / 'web' / f'{n}.jpg', quality=86, optimize=True)
    p.unlink()
print('slides', len(S))
