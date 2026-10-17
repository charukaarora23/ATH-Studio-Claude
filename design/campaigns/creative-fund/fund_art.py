"""ATH Creative Fund: launch carousel + monthly set, built on ATH artists' work in the reference style.

System: Night #52051A and Rose #FFA1C2 grounds, Cream type on artwork, Inter Tight set huge and tight,
one Libre Baskerville italic phrase, round arrow badge, swipe pill. Artwork full bleed or in clean blocks.

Usage: ATH_FONTS=<fonts folder> NP=<playwright folder> python3 design/campaigns/creative-fund/fund_art.py
Writes art-slides/*.jpg (full size) and art-slides/web/*.jpg (720 px).
"""
import os, subprocess, pathlib
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
ART = HERE / 'art'
FONTS = pathlib.Path(os.environ.get('ATH_FONTS', 'fonts')).resolve()
OUT = HERE / 'art-slides'
NIGHT, ROSE, CREAM, PEONY = '#52051A', '#FFA1C2', '#F9EEE5', '#FAD2E1'

CHEV = '<svg viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CHEVL = '<svg viewBox="0 0 24 24"><path d="M14.5 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def img(name, pos='50% 50%'):
    return f'<img src="{(ART / name).as_uri()}" style="object-position:{pos}">'


def badge(bg, fg, inner=CHEV):
    return f'<span class="badge" style="background:{bg};color:{fg}">{inner}</span>'


def pill(text, bg, fg, bottom=110):
    return f'<div class="pill" style="bottom:{bottom}px"><span class="pc" style="border-color:{bg};color:{bg}">{CHEVL}</span><span class="pt" style="background:{bg};color:{fg}">{text}</span></div>'


def credit(c, text='Artwork: Artist Name'):
    return f'<p class="cr" style="color:{c}">{text}</p>'


def num(c, i, n=10):
    return f'<p class="no" style="color:{c}">{i}/{n}</p>'


S = []


def add(name, bg, body, w=1080, h=1350):
    S.append((name, f'<section id="{name}" class="s" style="background:{bg};width:{w}px;height:{h}px">{body}</section>'))


# ---------------- Launch carousel ----------------
add('01-cover', NIGHT, f'''<div class="pic">{img('flower-portrait.jpg', '50% 30%')}</div><div class="grade" style="opacity:.28"></div>
<p class="top c" style="color:{CREAM}">ARTS TO HEARTS PROJECT</p>
<h1 class="h xl c" style="color:{CREAM};top:150px">ATH Creative&nbsp;Fund</h1>
<p class="h l" style="color:{CREAM};top:960px;left:72px;right:auto;width:860px;font-size:84px">$500 for one artist, every&nbsp;month.</p>
<p class="serif" style="color:{ROSE};left:72px;top:1160px"><i>No questions asked.</i></p>
{num(CREAM, 1)}{credit(CREAM)}''')

add('02-promise', NIGHT, f'''<h2 class="h xl" style="color:{ROSE};top:140px">{badge(ROSE, NIGHT)}No proposal. No report. No questions asked.</h2>
{num(ROSE, 2)}{pill('Swipe', ROSE, NIGHT)}''')

add('03-why', NIGHT, f'''<div class="pic">{img('night-bloom.jpg', '50% 30%')}</div><div class="grade" style="opacity:.18"></div>
<p class="h c" style="color:{CREAM};top:150px;font-size:96px;line-height:1">We would rather<br><span class="it">fund the work</span></p>
<p class="body c" style="color:{CREAM};top:390px">than make artists prove they deserve it.</p>
{num(CREAM, 3)}{credit(CREAM)}''')

add('04-money', ROSE, f'''<p class="fig" style="color:{NIGHT}">$500</p>
<p class="h m" style="color:{NIGHT};top:560px">to one artist, every month. Spend it on paint, rent, a course or time.</p>
{num(NIGHT, 4)}{pill('Swipe', NIGHT, ROSE)}''')

add('05-who', NIGHT, f'''<div class="pic" style="height:600px">{img('weave-teal.jpg')}</div><p class="no" style="color:{CREAM};background:{NIGHT};padding:10px 18px;border-radius:999px;top:52px">5/10</p>
<h2 class="h l" style="color:{ROSE};top:660px">Painters, potters, poets, photographers, printmakers.</h2>
<p class="serif" style="color:{CREAM};left:72px;top:1010px"><i>If you made it, it counts.</i></p>
{credit(CREAM)}''')

steps = ''.join(f'<div>{badge(ROSE, NIGHT, f"<b>{i}</b>")}{t}</div>' for i, t in [(1, 'Choose one piece you made'), (2, 'Post it on Instagram'), (3, 'Comment FUND to apply')])
add('06-steps', NIGHT, f'''<p class="lab" style="color:{PEONY}">How to apply</p><div class="steps" style="color:{ROSE}">{steps}</div>
{num(ROSE, 6)}{pill('Swipe', ROSE, NIGHT)}''')

post = f'''<div class="phone"><div class="ph-top"><span class="av"></span><b>yourname</b></div>
<div class="ph-img">{img('stripes.jpg')}</div>
<div class="ph-cap"><b>yourname</b> New work for the fund. <span>@artstoheartsproject #ATHCreativeFund</span></div></div>'''
add('07-post', ROSE, f'''<h2 class="h l" style="color:{NIGHT};top:120px;font-size:96px">Post it like this</h2>
{post}
<div class="side" style="color:{NIGHT}"><p><b>Mention</b>@artstoheartsproject</p><p><b>Add</b>#ATHCreativeFund</p><p><b>Follow</b>us to hear if you are chosen</p><p><b>Between</b>15 Oct and 15 Nov</p></div>
{num(NIGHT, 7)}''')

add('08-dates', NIGHT, f'''<p class="lab" style="color:{PEONY}">Open now</p>
<h2 class="h xl" style="color:{ROSE};top:210px">15 October to 15&nbsp;November</h2>
<p class="serif" style="color:{CREAM};left:72px;top:820px"><i>Then a new round, every month.</i></p>
{num(ROSE, 8)}{pill('Swipe', ROSE, NIGHT)}''')

checks = ['One piece you made', 'Posted on Instagram', '@artstoheartsproject in the caption', '#ATHCreativeFund', 'Following us', 'Commented FUND and applied']
cc = ''.join(f'<div class="ck"><span class="bx">✓</span>{c}</div>' for c in checks)
add('09-save', ROSE, f'''<p class="lab" style="color:{NIGHT}">Save this</p><div class="checks" style="color:{NIGHT}">{cc}</div>{num(NIGHT, 9)}''')

add('10-send', NIGHT, f'''<div class="pic" style="top:auto;bottom:0;height:420px">{img('stripes.jpg', '50% 50%')}</div>
<h2 class="h xl" style="color:{ROSE};top:140px">{badge(ROSE, NIGHT)}Send this to an artist who needs&nbsp;$500.</h2>
{num(ROSE, 10)}{pill('Comment FUND for the link', ROSE, NIGHT, 500)}''')

# ---------------- Monthly set: ways to keep it going ----------------
add('m1-story', NIGHT, f'''<div class="pic">{img('flower-portrait.jpg', '50% 30%')}</div><div class="grade" style="opacity:.3"></div>
<p class="top c" style="color:{CREAM};top:260px">ARTS TO HEARTS PROJECT</p>
<h1 class="h xl c" style="color:{CREAM};top:330px">ATH Creative&nbsp;Fund</h1>
<p class="h l c" style="color:{CREAM};top:1250px;font-size:88px">$500 for one artist, every month.</p>
<div class="sticker" style="top:1500px">Link sticker here</div>''', 1080, 1920)

add('m2-reminder', NIGHT, f'''<div class="pic" style="height:640px">{img('weave-teal.jpg', '50% 30%')}</div>
<p class="fig" style="color:{ROSE};top:690px;font-size:330px">7 days</p>
<p class="h m" style="color:{CREAM};top:1000px">left to enter the ATH Creative Fund.</p>
{credit(CREAM)}''')

add('m3-lastcall', NIGHT, f'''<div class="pic">{img('night-bloom.jpg', '50% 40%')}</div><div class="grade" style="opacity:.2"></div>
<p class="top c" style="color:{CREAM}">ATH CREATIVE FUND</p>
<h1 class="h c" style="color:{ROSE};top:180px;font-size:200px;line-height:.9">Last call</h1>
<p class="h c" style="color:{CREAM};top:430px;font-size:56px">Entries close tonight, 15 November.</p>
{credit(CREAM)}''')

add('m4-winner', NIGHT, f'''<div class="pic" style="height:900px">{img('flower-portrait.jpg', '50% 25%')}</div>
<p class="lab" style="color:{CREAM};top:60px">ATH Creative Fund · November</p>
<h2 class="h l" style="color:{ROSE};top:950px;font-size:88px">This month's $500 goes to <span class="it">Artist Name.</span></h2>
{credit(CREAM)}''')

add('m5-entry', ROSE, f'''<div class="pic" style="left:150px;right:150px;top:150px;height:780px">{img('stripes.jpg')}</div>
<p class="lab" style="color:{NIGHT};top:60px">Entries we love</p>
<h2 class="h m" style="color:{NIGHT};top:990px">@artistname, for #ATHCreativeFund</h2>
<p class="body" style="color:{NIGHT};left:72px;top:1190px">Enter by 15 November. Comment FUND.</p>''')

CSS = f'''
@font-face{{font-family:IT;font-weight:400;src:url("{(FONTS/'it/package/files/inter-tight-latin-400-normal.woff2').as_uri()}")}}
@font-face{{font-family:IT;font-weight:500;src:url("{(FONTS/'it/package/files/inter-tight-latin-500-normal.woff2').as_uri()}")}}
@font-face{{font-family:LB;font-style:italic;src:url("{(FONTS/'lb/package/files/libre-baskerville-latin-400-italic.woff2').as_uri()}")}}
body{{margin:0;background:#777;display:flex;flex-wrap:wrap;gap:40px;padding:40px}}
.s{{position:relative;overflow:hidden;font-family:IT;font-weight:500;-webkit-font-smoothing:antialiased}}
.pic{{position:absolute;inset:0;overflow:hidden}}.pic img{{width:100%;height:100%;object-fit:cover;display:block}}
.grade{{position:absolute;inset:0;background:#000}}
.h{{position:absolute;left:72px;right:72px;margin:0;letter-spacing:-0.04em;text-wrap:balance;font-weight:500;z-index:2}}
.c{{left:48px!important;right:48px!important;text-align:center}}
.xl{{font-size:150px;line-height:.92}}.l{{font-size:104px;line-height:.96}}.m{{font-size:72px;line-height:1.04;letter-spacing:-0.03em}}
.it{{font-family:LB;font-style:italic;font-weight:400;letter-spacing:-0.035em}}
.serif{{position:absolute;margin:0;font:italic 400 60px/1.15 LB;letter-spacing:-0.025em;z-index:2}}
.body{{position:absolute;margin:0;font:400 40px/1.35 IT;letter-spacing:-0.01em;z-index:2}}
.top{{position:absolute;top:64px;margin:0;font:500 28px/1 IT;letter-spacing:.16em;z-index:2}}
.lab{{position:absolute;left:72px;top:140px;margin:0;font:500 40px/1 IT;letter-spacing:-0.01em;z-index:2}}
.no{{position:absolute;right:72px;top:64px;margin:0;font:500 28px/1 IT;z-index:2}}
.cr{{position:absolute;left:72px;bottom:56px;margin:0;font:400 24px/1 IT;z-index:2;opacity:.9}}
.badge{{display:inline-flex;width:.72em;height:.72em;border-radius:50%;align-items:center;justify-content:center;vertical-align:baseline;transform:translateY(.03em);margin-right:.14em}}
.badge svg{{width:44%;height:44%}}.badge b{{font-size:.5em;line-height:1}}
.fig{{position:absolute;left:60px;top:130px;margin:0;font-size:400px;line-height:.85;letter-spacing:-0.075em;z-index:2}}
.steps{{position:absolute;left:72px;right:72px;top:260px;display:grid;gap:60px;font-size:96px;line-height:1;letter-spacing:-0.04em}}
.pill{{position:absolute;left:0;right:0;display:flex;justify-content:center;align-items:center;z-index:2}}
.pc{{width:96px;height:96px;border:2px solid;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-right:-16px;z-index:1}}
.pc svg{{width:40%;height:40%}}
.pt{{font-size:42px;letter-spacing:-0.01em;padding:24px 46px;border-radius:999px;white-space:nowrap}}
.phone{{position:absolute;left:72px;top:290px;width:560px;background:#fff;border-radius:28px;overflow:hidden}}
.ph-top{{display:flex;align-items:center;gap:14px;padding:18px 22px;font:500 26px/1 IT;color:#1C1310}}
.av{{width:42px;height:42px;border-radius:50%;background:{PEONY}}}
.ph-img{{height:560px}}.ph-img img{{width:100%;height:100%;object-fit:cover;display:block}}
.ph-cap{{padding:18px 22px 26px;font:400 25px/1.35 IT;color:#1C1310}}.ph-cap span{{color:{NIGHT};font-weight:500}}
.side{{position:absolute;left:680px;right:72px;top:300px;display:grid;gap:34px}}
.side p{{margin:0;font:400 32px/1.25 IT;border-top:2px solid {NIGHT}40;padding-top:16px}}
.side b{{display:block;font:500 36px/1.1 IT;letter-spacing:-0.02em;margin-bottom:6px}}
.checks{{position:absolute;left:72px;right:72px;top:240px}}
.ck{{display:flex;gap:30px;align-items:center;border-top:2px solid {NIGHT}40;padding:34px 0;font-size:58px;line-height:1.05;letter-spacing:-0.035em}}
.bx{{flex:0 0 66px;height:66px;border-radius:50%;background:{NIGHT};color:{ROSE};display:inline-flex;align-items:center;justify-content:center;font-size:36px}}
.sticker{{position:absolute;left:290px;width:500px;padding:30px;border:3px dashed {CREAM};border-radius:20px;text-align:center;color:{CREAM};font:500 34px/1 IT;z-index:2}}
'''
OUT.mkdir(exist_ok=True)
(OUT / 'web').mkdir(exist_ok=True)
for f in list(OUT.glob('*.jpg')) + list((OUT / 'web').glob('*.jpg')):
    f.unlink()
page = HERE / 'carousel_art.html'
page.write_text(f'<!doctype html><meta charset="utf-8"><style>{CSS}</style>' + ''.join(b for _, b in S))
subprocess.run(['node', str(HERE / 'shot.cjs'), page.as_uri(), str(OUT)] + [n for n, _ in S], check=True)
for n, _ in S:
    p = OUT / f'{n}.png'
    im = Image.open(p).convert('RGB')
    im.save(OUT / f'{n}.jpg', quality=92)
    im.resize((720, round(im.height * 720 / im.width)), Image.LANCZOS).save(OUT / 'web' / f'{n}.jpg', quality=86)
    p.unlink()
print(len(S))
