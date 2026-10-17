"""ATH Creative Fund: launch carousel (three cover options + nine slides, 1080 x 1350).

Usage: ATH_FONTS=<fonts folder> NP=<folder holding playwright> python3 design/campaigns/creative-fund/fund.py
Fonts: npm @fontsource/inter-tight and @fontsource/libre-baskerville unpacked as it/ and lb/ in ATH_FONTS.
Stand-in artworks come from design/guidelines/src/stock (public domain).
Writes slides/*.jpg (full size, to post) and slides/web/*.jpg (720 px, for the brief).
"""
import os, re, subprocess, pathlib
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
STOCK = HERE.parents[1] / 'guidelines' / 'src' / 'stock'
LOGO = HERE.parents[1] / 'logo' / 'svg' / 'master' / 'logo-master_burgundy.svg'
FONTS = pathlib.Path(os.environ.get('ATH_FONTS', 'fonts')).resolve()
OUT = HERE / 'slides'

BURG, NIGHT, ROSE, PEONY, INK = '#6A0620', '#52051A', '#FFA1C2', '#FAD2E1', '#1C1310'
WHITE, BLACK, GREY, MUTED, CREAM = '#FFFFFF', '#141111', '#F1EEEB', '#6E6461', '#F9EEE5'

src = LOGO.read_text()
x, y, w, h = map(float, re.search(r'viewBox="([^"]+)"', src).group(1).split())
VB = f'{x+78:.2f} {y+78:.2f} {w-156:.2f} {h-156:.2f}'
G = re.search(r'<g fill="[^"]+">(.*?)</g>', src, re.S).group(1)


def logo(c, wd):
    return f'<svg style="width:{wd}px;display:block" viewBox="{VB}" fill="{c}" aria-hidden="true">{G}</svg>'


def img(name, pos='50% 50%'):
    return f'<img src="{(STOCK / name).as_uri()}" style="object-position:{pos}">'


ARROW = '<svg class="arw" viewBox="0 0 72 40" aria-hidden="true"><rect x="1.25" y="1.25" width="69.5" height="37.5" rx="18.75" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M22 20h28M42 12.5l8 7.5-8 7.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def badge(bg, fg):
    return f'<span class="badge" style="background:{bg};color:{fg}"><svg viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'


N = 10


def frame(c, i, br=True, bl='@artstoheartsproject'):
    return (f'<div class="m tl" style="color:{c}">ATH Creative Fund</div><div class="m tr" style="color:{c}">{i:02d} / {N:02d}</div>'
            f'<div class="m bl" style="color:{c}">{bl}</div>' + (f'<div class="m br" style="color:{c}">{ARROW}</div>' if br else ''))


S = []


def add(name, bg, body):
    S.append((name, f'<section id="{name}" class="s" style="background:{bg}">{body}</section>'))


# ---------------- Three cover options: the name is the hero ----------------
add('01a-cover-type', BURG, f'''<div style="position:absolute;left:72px;top:64px">{logo(WHITE, 250)}</div><div class="m tr" style="color:{WHITE}">Save this</div>
<h1 class="h" style="color:{WHITE};top:190px;font-size:150px;line-height:.92">{badge(ROSE, BURG)}ATH Creative Fund</h1>
<div style="position:absolute;left:72px;right:72px;top:700px;border-top:2px solid {WHITE}55"></div>
<p class="fig" style="color:{WHITE};top:740px;font-size:230px">$500</p>
<p class="h" style="color:{WHITE};top:770px;left:560px;font-size:56px;line-height:1.05">for one artist,<br>every month.</p>
<p class="serif" style="color:{PEONY};top:960px;font-size:64px"><i>No questions asked.</i></p>
<div class="m bl" style="color:{WHITE}">Swipe to apply</div><div class="m br" style="color:{WHITE}">{ARROW}</div>''')

add('01b-cover-art', NIGHT, f'''<div class="pic" style="inset:0">{img('woman_with_hat.jpg', '50% 32%')}</div>
<div class="veil" style="inset:0;background:#000;opacity:.36"></div>
<p class="cap c" style="color:{WHITE};top:64px">ARTS TO HEARTS PROJECT PRESENTS</p>
<p class="caps c" style="color:{WHITE};top:130px;font-size:132px">Creative Fund</p>
<p class="serif c" style="color:{WHITE};top:560px;font-size:84px;line-height:1.05">$500 for one artist,<br><i>every month</i></p>
<p class="cap" style="color:{WHITE};left:72px;top:860px">NO PROPOSAL</p><p class="cap" style="color:{WHITE};right:72px;left:auto;top:860px">NO REPORT</p>
<p class="caps c" style="color:{WHITE};top:1090px;font-size:96px">No questions asked</p>
<p class="cr" style="color:{WHITE};left:72px;bottom:56px">Henri Matisse, Woman with a Hat, 1905 · stand-in</p><div class="m br" style="color:{WHITE}">{ARROW}</div>''')

add('01c-cover-split', WHITE, f'''<div class="pic" style="top:0;height:620px">{img('starry_night.jpg', '50% 45%')}</div>
<span class="chip" style="background:{WHITE};color:{INK};left:72px;top:56px">New · Every month</span>
<h1 class="h" style="color:{BURG};top:670px;font-size:130px;line-height:.92">ATH Creative Fund</h1>
<p class="h" style="color:{INK};top:930px;font-size:64px;line-height:1.05">$500 for one artist. No questions asked.</p>
<div class="m bl" style="color:{INK}">Swipe to apply</div><div class="m br" style="color:{INK}">{ARROW}</div>''')

# ---------------- The carousel ----------------
add('02-why', ROSE, f'''{frame(NIGHT, 2)}
<p class="serif" style="color:{NIGHT};top:170px;font-size:66px">Most funding asks artists to prove they deserve it. Proposals, budgets, reports, waiting.</p>
<h2 class="h" style="color:{NIGHT};top:740px;font-size:110px">We would rather <span class="serifi">just fund the work.</span></h2>''')

rows = [('Paid to one artist', 'Chosen each month'), ('In US dollars', '$500, sent to you'), ('Spend it on anything', 'Materials, rent, a course, time'), ('No strings', 'No proposal, no report back')]
rr = ''.join(f'<div class="row"><span style="color:{WHITE}">{a}</span><span style="color:{ROSE}">{b}</span></div>' for a, b in rows)
add('03-what', BLACK, f'''{frame(WHITE, 3)}
<p class="fig" style="color:{WHITE};top:120px;font-size:300px">$500</p>
<p class="serif" style="color:{ROSE};top:420px;left:700px;right:72px;font-size:48px"><i>every month</i></p>
<div class="list" style="top:520px">{rr}</div>''')

tiles = [('starry_night.jpg', '50% 40%', 'Painting'), ('wave.jpg', '25% 50%', 'Printmaking'), ('udnie.jpg', '50% 50%', 'Abstract'),
         ('the_scream.jpg', '50% 60%', 'Drawing and pastel'), ('woman_with_hat.jpg', '50% 30%', 'Portraits')]
tt = ''.join(f'<div class="tile"><div class="ti">{img(f, p)}</div><span>{l}</span></div>' for f, p, l in tiles)
tt += f'<div class="tile"><div class="ti" style="background:{CREAM};display:flex;align-items:center;padding:28px;box-sizing:border-box"><p style="margin:0;font:italic 400 34px/1.2 LB;color:{BURG}">“A poem counts too.”</p></div><span>Writing</span></div>'
add('04-who', WHITE, f'''{frame(INK, 4)}
<h2 class="h" style="color:{INK};top:150px;font-size:88px">Who can apply</h2>
<div class="tgrid">{tt}</div>
<p class="serif" style="color:{BURG};top:1110px;font-size:52px"><i>If you made it, it counts.</i></p>''')

add('05-step1', WHITE, f'''{frame(INK, 5)}
<p class="idx" style="color:{BURG}">Step 1 of 3</p>
<div class="pic fit" style="left:72px;right:72px;top:210px;height:560px;background:{GREY}">{img('starry_night.jpg')}</div>
<h2 class="h" style="color:{INK};top:820px;font-size:88px">{badge(BURG, WHITE)}Choose your work</h2>
<p class="p" style="color:{INK};top:950px">One piece that best represents your practice. New or already shared, as long as you made it.</p>''')

post = f'''<div class="phone">
<div class="ph-top"><span class="av"></span><b>yourname</b></div>
<div class="ph-img">{img('wave.jpg', '30% 50%')}</div>
<div class="ph-cap"><b>yourname</b> My new print, made this autumn. <span style="color:#1d4ed8">@artstoheartsproject</span> <span style="color:#1d4ed8">#ATHCreativeFund</span></div></div>'''
add('06-step2', GREY, f'''{frame(INK, 6)}
<p class="idx" style="color:{BURG}">Step 2 of 3</p>
<h2 class="h" style="color:{INK};top:200px;font-size:80px">Share it on Instagram</h2>
<p class="small" style="color:{INK};top:310px;font-size:34px">Post it publicly between 15&nbsp;October and 15&nbsp;November.</p>
{post}
<div class="notes"><p><b>Mention</b>@artstoheartsproject in the caption</p><p><b>Add</b>#ATHCreativeFund</p><p><b>Follow</b>us, so you see our message if you are chosen</p><p><b>Writers</b>post a photo of the page or a simple text graphic</p></div>''')

form = f'''<div class="form">
<div class="f-head">ATH Creative Fund · Application</div>
<label>Link to your Instagram post</label><div class="f-in">instagram.com/p/…</div>
<label>Your work sample</label><div class="f-in f-up">Upload image</div>
<label>A few lines about your practice</label><div class="f-in f-ta">In your own words</div>
<div class="f-btn">Submit application</div></div>'''
add('07-step3', WHITE, f'''{frame(INK, 7)}
<p class="idx" style="color:{BURG}">Step 3 of 3</p>
<h2 class="h" style="color:{INK};top:200px;font-size:80px">Apply on our site</h2>
<p class="small" style="color:{BURG};top:310px;font-size:36px;font-weight:500">Link in our bio</p>
{form}''')

add('08-dates', BLACK, f'''{frame(WHITE, 8)}
<h2 class="h" style="color:{WHITE};top:160px;font-size:96px">Dates</h2>
<div class="list" style="top:360px">
<div class="row big"><span style="color:{WHITE}">Opens</span><span style="color:{WHITE}">15 Oct</span></div>
<div class="row big"><span style="color:{WHITE}">Closes</span><span style="color:{ROSE}">15 Nov</span></div>
<div class="row big"><span style="color:{WHITE}">Artist chosen</span><span style="color:{WHITE}">TBC</span></div></div>
<p class="serif" style="color:{ROSE};top:1040px;font-size:52px"><i>Then a new round, every month.</i></p>''')

checks = ['One piece of work you made', 'Posted publicly on Instagram', '@artstoheartsproject in the caption', '#ATHCreativeFund added', 'Following @artstoheartsproject', 'Form sent with your post link']
cc = ''.join(f'<div class="ck"><span class="bx" style="color:{BURG}">{TICK}</span><span>{c}</span></div>' for c in checks)
add('09-checklist', WHITE, f'''{frame(INK, 9)}
<h2 class="h" style="color:{INK};top:160px;font-size:96px">Before you apply</h2>
<div class="checks">{cc}</div>
<p class="serif" style="color:{BURG};top:1090px;font-size:52px"><i>Save this so you don't miss a step.</i></p>''')

add('10-share', BURG, f'''<div class="m tl" style="color:{WHITE}">ATH Creative Fund</div><div class="m tr" style="color:{WHITE}">10 / 10</div>
<h2 class="h" style="color:{WHITE};top:170px;font-size:112px">{badge(ROSE, BURG)}Know an artist who needs $500?</h2>
<p class="serif" style="color:{PEONY};top:600px;font-size:72px"><i>Send this to them.</i></p>
<div style="position:absolute;left:72px;top:980px">{logo(WHITE, 460)}</div>
<p class="small" style="color:{PEONY};top:1130px;font-size:36px">Apply: link in our bio</p>''')

CSS = f'''
@font-face{{font-family:IT;font-weight:400;src:url("{(FONTS/'it/package/files/inter-tight-latin-400-normal.woff2').as_uri()}")}}
@font-face{{font-family:IT;font-weight:500;src:url("{(FONTS/'it/package/files/inter-tight-latin-500-normal.woff2').as_uri()}")}}
@font-face{{font-family:LB;font-style:normal;src:url("{(FONTS/'lb/package/files/libre-baskerville-latin-400-normal.woff2').as_uri()}")}}
@font-face{{font-family:LB;font-style:italic;src:url("{(FONTS/'lb/package/files/libre-baskerville-latin-400-italic.woff2').as_uri()}")}}
body{{margin:0;background:#777;display:flex;flex-wrap:wrap;gap:40px;padding:40px}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;font-family:IT;-webkit-font-smoothing:antialiased}}
.m{{position:absolute;font:500 30px/1.2 IT;letter-spacing:-.005em;display:flex;align-items:center;z-index:3}}
.tl{{left:72px;top:60px}}.tr{{right:72px;top:60px}}.bl{{left:72px;bottom:60px}}.br{{right:72px;bottom:60px}}
.arw{{width:88px;height:49px;display:block}}
.h{{position:absolute;left:72px;right:72px;margin:0;font-weight:500;line-height:.98;letter-spacing:-0.035em;text-wrap:balance;z-index:2}}
.fig{{position:absolute;left:56px;margin:0;font:500 520px/.85 IT;letter-spacing:-0.07em;z-index:2}}
.serif{{position:absolute;left:72px;right:96px;margin:0;font:400 64px/1.2 LB;letter-spacing:-0.02em;text-wrap:pretty;z-index:2}}
.serifi{{font-family:LB;font-style:italic;font-weight:400;letter-spacing:-0.03em}}
.badge{{display:inline-flex;width:.72em;height:.72em;border-radius:50%;align-items:center;justify-content:center;vertical-align:baseline;transform:translateY(.02em);margin-right:.16em}}
.badge svg{{width:46%;height:46%}}
.c{{left:0!important;right:0!important;text-align:center}}
.cap{{position:absolute;margin:0;font:500 30px/1 IT;letter-spacing:.06em;z-index:2}}
.caps{{position:absolute;margin:0;font:500 128px/.92 IT;letter-spacing:-0.035em;text-transform:uppercase;z-index:2}}
.cr{{position:absolute;margin:0;font:400 24px/1.3 IT;z-index:3}}
.pic{{position:absolute;left:0;right:0;top:0;overflow:hidden}}
.pic img{{width:100%;height:100%;object-fit:cover;display:block}}
.pic.fit img{{object-fit:contain}}
.veil{{position:absolute;z-index:1}}
.chip{{position:absolute;z-index:3;font:500 30px/1 IT;padding:18px 26px;border-radius:999px}}
.list{{position:absolute;left:72px;right:72px}}
.row{{display:flex;justify-content:space-between;gap:32px;border-top:2px solid #ffffff33;padding:30px 0;font:500 42px/1.15 IT;letter-spacing:-0.015em}}
.row span:last-child{{text-align:right}}
.row.big{{font-size:72px;letter-spacing:-0.03em;padding:40px 0}}
.idx{{position:absolute;left:72px;top:140px;margin:0;font:500 32px/1 IT}}
.p{{position:absolute;left:72px;right:120px;margin:0;font:400 42px/1.35 IT;letter-spacing:-0.01em}}
.small{{position:absolute;left:72px;right:120px;margin:0;font:400 32px/1.4 IT}}
.tgrid{{position:absolute;left:72px;right:72px;top:290px;display:grid;grid-template-columns:repeat(3,1fr);gap:28px 24px}}
.tile .ti{{height:300px;overflow:hidden}}.tile .ti img{{width:100%;height:100%;object-fit:cover;display:block}}
.tile span{{display:block;margin-top:14px;font:500 30px/1.2 IT;color:{INK};letter-spacing:-0.01em}}
.phone{{position:absolute;left:72px;top:400px;width:560px;background:{WHITE};border-radius:28px;overflow:hidden;box-shadow:0 30px 60px -30px rgba(0,0,0,.35)}}
.ph-top{{display:flex;align-items:center;gap:16px;padding:20px 24px;font:500 26px/1 IT;color:{INK}}}
.av{{width:44px;height:44px;border-radius:50%;background:{GREY}}}
.ph-img{{height:560px}}.ph-img img{{width:100%;height:100%;object-fit:cover;display:block}}
.ph-cap{{padding:20px 24px 28px;font:400 25px/1.35 IT;color:{INK}}}
.notes{{position:absolute;left:672px;right:72px;top:420px;display:grid;gap:30px}}
.notes p{{margin:0;font:400 30px/1.3 IT;color:{INK};border-top:2px solid {INK}1f;padding-top:16px}}
.notes b{{display:block;font:500 30px/1.2 IT;color:{BURG};margin-bottom:6px}}
.form{{position:absolute;left:72px;right:72px;top:400px;background:{GREY};border-radius:28px;padding:44px}}
.f-head{{font:500 30px/1 IT;color:{MUTED};margin-bottom:28px}}
.form label{{display:block;font:500 32px/1.2 IT;color:{INK};margin:22px 0 12px}}
.f-in{{background:{WHITE};border:2px solid #DDD6D1;border-radius:14px;padding:22px 24px;font:400 30px/1 IT;color:#9A908C}}
.f-up{{border-style:dashed;text-align:center}}
.f-ta{{height:90px}}
.f-btn{{margin-top:34px;background:{BURG};color:{WHITE};border-radius:14px;padding:26px;text-align:center;font:500 34px/1 IT}}
.checks{{position:absolute;left:72px;right:72px;top:330px;display:grid}}
.ck{{display:flex;gap:28px;align-items:center;border-top:2px solid {INK}1f;padding:28px 0;font:500 46px/1.15 IT;letter-spacing:-0.02em;color:{INK}}}
.bx{{flex:0 0 56px;height:56px;border:3px solid currentColor;border-radius:12px;display:inline-flex;align-items:center;justify-content:center}}
.bx svg{{width:34px;height:34px}}
'''

OUT.mkdir(exist_ok=True)
(OUT / 'web').mkdir(exist_ok=True)
for old in list(OUT.glob('*.jpg')) + list((OUT / 'web').glob('*.jpg')):
    old.unlink()
page = HERE / 'carousel.html'
page.write_text(f'<!doctype html><meta charset="utf-8"><style>{CSS}</style>' + ''.join(b for _, b in S))
shot = HERE / 'shot.cjs'
shot.write_text('''const {chromium}=require(process.env.NP+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1200}});
await p.goto(process.argv[2]);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(900);
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
