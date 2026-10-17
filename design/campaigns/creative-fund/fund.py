"""ATH Creative Fund: launch carousel, built on one idea: the cheque.

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
PAPER, PAPER2, RULE = '#F9EEE5', '#F1E2D6', '#D9C2B4'

src = LOGO.read_text()
x, y, w, h = map(float, re.search(r'viewBox="([^"]+)"', src).group(1).split())
VB = f'{x+78:.2f} {y+78:.2f} {w-156:.2f} {h-156:.2f}'
G = re.search(r'<g fill="[^"]+">(.*?)</g>', src, re.S).group(1)


def logo(c, wd):
    return f'<svg style="width:{wd}px;display:block" viewBox="{VB}" fill="{c}" aria-hidden="true">{G}</svg>'


ARROW = '<svg class="arw" viewBox="0 0 72 40" aria-hidden="true"><rect x="1.25" y="1.25" width="69.5" height="37.5" rx="18.75" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M22 20h28M42 12.5l8 7.5-8 7.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def badge(bg, fg):
    return f'<span class="badge" style="background:{bg};color:{fg}"><svg viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'


N = 10


def stub(i, ground, ink):
    """The cheque stub: a perforated band closing every slide. It is the thread through the carousel."""
    return (f'<div class="stub" style="color:{ink};border-top-color:{ink}55">'
            f'<span>ATH Creative Fund</span><span class="no">No. {i:03d} · {i:02d}/{N:02d}</span>'
            f'<span>{ARROW if i < N else "@artstoheartsproject"}</span></div>')


def cheque(payee='An artist like you', blank=False, extra=''):
    pay = '<span class="blank"></span>' if blank else f'<span class="hand">{payee}</span>'
    return f'''<div class="chq" {extra}>
<div class="c-top"><div class="c-logo">{logo(BURG, 250)}<span>Creative Fund</span></div><div class="c-no">No. 001<br><span>Date: every month</span></div></div>
<div class="c-line"><label>Pay to the order of</label>{pay}<div class="c-amt">$500.00</div></div>
<div class="c-line"><span class="hand">Five hundred US dollars</span><label class="r">Dollars</label></div>
<div class="c-foot"><div><label>Memo</label><span class="hand">No questions asked.</span></div><div class="c-sig"><span class="hand sig">Arts to Hearts</span><label>Arts to Hearts Project</label></div></div>
<div class="c-micr">⑆ 0001 ⑆ 500 00 ⑈ ATH CREATIVE FUND ⑈</div></div>'''


S = []


def add(name, bg, body):
    S.append((name, f'<section id="{name}" class="s" style="background:{bg}">{body}</section>'))


# 01 Cover
add('01-cover', BURG, f'''<div style="position:absolute;left:72px;top:64px">{logo(PAPER, 230)}</div><div class="m tr" style="color:{PAPER}">Save this</div>
<h1 class="h" style="color:{PAPER};top:170px;font-size:132px;line-height:.92">{badge(ROSE, BURG)}ATH Creative&nbsp;Fund</h1>
<div style="position:absolute;left:54px;top:500px;transform:rotate(-3deg)">{cheque()}</div>
<p class="h" style="color:{PAPER};top:1000px;font-size:58px;line-height:1.05">$500 to one artist, every month.</p>
<p class="serif" style="color:{ROSE};top:1075px;font-size:46px"><i>Free to enter. Comment FUND for the link.</i></p>
{stub(1, BURG, PAPER)}''')

# 02 Conviction
add('02-why', PAPER, f'''<div class="m tl" style="color:{INK}">Why we are doing this</div>
<p class="serif" style="color:{INK};top:170px;font-size:64px">Most funding asks artists to prove they deserve it. Proposals, budgets, reports, waiting.</p>
<h2 class="h" style="color:{BURG};top:660px;font-size:120px;line-height:.95">So we are writing <span class="serifi">the cheque.</span></h2>
{stub(2, PAPER, INK)}''')

# 03 What you get: the cheque, annotated
add('03-what', PAPER, f'''<div class="m tl" style="color:{INK}">What you get</div>
<div style="position:absolute;left:70px;top:330px">{cheque()}</div>
<div class="note" style="left:72px;top:150px"><b>One artist</b>chosen every month</div>
<div class="note" style="left:640px;top:150px"><b>$500 in US dollars</b>sent to you</div>
<div class="note" style="left:72px;top:850px"><b>Spend it on anything</b>paint, rent, a course, time</div>
<div class="note" style="left:640px;top:850px"><b>No strings</b>no proposal, no report back</div>
<svg class="lead" viewBox="0 0 1080 1350"><path d="M150 268 V 445" /><path d="M900 268 V 455" /><path d="M300 845 V 690" /><path d="M820 845 V 700" /></svg>
{stub(3, PAPER, INK)}''')

# 04 Who can apply: typographic, no borrowed images
words = [('Painters,', 0), ('potters,', 1), ('poets,', 0), ('photographers,', 1), ('printmakers,', 0), ('illustrators,', 1), ('sculptors,', 0), ('weavers,', 1), ('writers,', 0), ('collage artists', 1), ('and you.', 2)]
ww = ''.join(f'<span class="{["sw", "si", "sy"][k]}">{t}</span> ' for t, k in words)
add('04-who', BURG, f'''<div class="m tl" style="color:{PAPER}">Who can apply</div>
<p class="poem" style="color:{PAPER}">{ww}</p>
<p class="serif" style="color:{ROSE};top:1010px;font-size:56px"><i>If you made it, it counts.</i></p>
{stub(4, BURG, PAPER)}''')


def step(n, name, title, body, art):
    add(name, PAPER, f'''<div class="m tl" style="color:{INK}">How to apply</div><div class="m tr" style="color:{BURG}">Step {n} of 3</div>
<p class="num" style="color:{BURG}">{n}</p>
<h2 class="h" style="color:{INK};top:170px;left:300px;font-size:80px">{title}</h2>
<p class="p" style="color:{INK};top:350px;left:300px;right:72px">{body}</p>
{art}{stub(n + 4, PAPER, INK)}''')


work = f'<div class="work" style="left:300px;top:640px;width:500px;height:500px"><span>your work</span></div>'
step(1, '05-step1', 'Choose your work', 'One piece that best represents your practice. New or already shared, as long as you made it.', work)

post = f'''<div class="phone"><div class="ph-top"><span class="av"></span><b>yourname</b></div>
<div class="work" style="position:relative;height:360px;border-radius:0"><span>your work</span></div>
<div class="ph-cap"><b>yourname</b> New work for the fund. <span style="color:{BURG};font-weight:500">@artstoheartsproject #ATHCreativeFund</span></div></div>'''
step(2, '06-step2', 'Post it on Instagram', 'Publicly, between 15&nbsp;October and 15&nbsp;November. Mention <b>@artstoheartsproject</b> in the caption, add <b>#ATHCreativeFund</b> and follow us.', post)

form = f'''<div class="form"><label>Link to your Instagram post</label><div class="f-in">instagram.com/p/…</div>
<label>Your work sample</label><div class="f-in" style="text-align:center;border-style:dashed">Upload</div>
<label>A few lines about your practice</label><div class="f-in" style="height:70px"></div>
<div class="f-btn">Submit</div></div>'''
step(3, '07-step3', 'Apply on our site', 'Comment <b>FUND</b> and we will send you the link. Add your post link, the work and a few lines in your own words.', form)

# 08 Dates
add('08-dates', BURG, f'''<div class="m tl" style="color:{PAPER}">Dates</div>
<div class="tl-row" style="color:{PAPER}">
<div><span class="d">15</span><span class="mth">October</span><span class="lb">Opens</span></div>
<div class="line"></div>
<div><span class="d" style="color:{ROSE}">15</span><span class="mth">November</span><span class="lb">Closes</span></div></div>
<p class="h" style="color:{PAPER};top:820px;font-size:64px">Artist announced: TBC</p>
<p class="serif" style="color:{ROSE};top:920px;font-size:56px"><i>Then a new cheque, every month.</i></p>
{stub(8, BURG, PAPER)}''')

# 09 Checklist
checks = ['One piece of work you made', 'Posted publicly on Instagram', '@artstoheartsproject in the caption', '#ATHCreativeFund added', 'Following @artstoheartsproject', 'Form sent with your post link']
cc = ''.join(f'<div class="ck"><span class="bx">{TICK}</span><span>{c}</span></div>' for c in checks)
add('09-checklist', PAPER, f'''<div class="m tl" style="color:{INK}">Before you apply</div><div class="m tr" style="color:{BURG}">Save this</div>
<div class="checks">{cc}</div>
{stub(9, PAPER, INK)}''')

# 10 The send: the payee line is blank
add('10-share', BURG, f'''<h2 class="h" style="color:{PAPER};top:120px;font-size:100px">{badge(ROSE, BURG)}Whose name belongs on this&nbsp;cheque?</h2>
<div style="position:absolute;left:70px;top:470px;transform:rotate(2deg)">{cheque(blank=True)}</div>
<p class="serif" style="color:{ROSE};top:990px;font-size:62px"><i>Send this to them.</i></p>
<p class="h" style="color:{PAPER};top:1080px;font-size:44px">Comment FUND for the link.</p>
{stub(10, BURG, PAPER)}''')

CSS = f'''
@font-face{{font-family:IT;font-weight:400;src:url("{(FONTS/'it/package/files/inter-tight-latin-400-normal.woff2').as_uri()}")}}
@font-face{{font-family:IT;font-weight:500;src:url("{(FONTS/'it/package/files/inter-tight-latin-500-normal.woff2').as_uri()}")}}
@font-face{{font-family:LB;font-style:normal;src:url("{(FONTS/'lb/package/files/libre-baskerville-latin-400-normal.woff2').as_uri()}")}}
@font-face{{font-family:LB;font-style:italic;src:url("{(FONTS/'lb/package/files/libre-baskerville-latin-400-italic.woff2').as_uri()}")}}
body{{margin:0;background:#777;display:flex;flex-wrap:wrap;gap:40px;padding:40px}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;font-family:IT;-webkit-font-smoothing:antialiased}}
.m{{position:absolute;font:500 30px/1.2 IT;letter-spacing:-.005em;display:flex;align-items:center;z-index:3}}
.tl{{left:72px;top:60px}}.tr{{right:72px;top:60px}}
.arw{{width:88px;height:49px;display:block}}
.h{{position:absolute;left:72px;right:72px;margin:0;font-weight:500;line-height:.98;letter-spacing:-0.035em;text-wrap:balance;z-index:2}}
.h b,.p b{{font-weight:500}}
.serif{{position:absolute;left:72px;right:96px;margin:0;font:400 64px/1.2 LB;letter-spacing:-0.02em;text-wrap:pretty;z-index:2}}
.serifi{{font-family:LB;font-style:italic;font-weight:400;letter-spacing:-0.03em}}
.badge{{display:inline-flex;width:.72em;height:.72em;border-radius:50%;align-items:center;justify-content:center;vertical-align:baseline;transform:translateY(.02em);margin-right:.16em}}
.badge svg{{width:46%;height:46%}}
.stub{{position:absolute;left:0;right:0;bottom:0;height:128px;border-top:3px dotted;display:flex;align-items:center;justify-content:space-between;padding:0 72px;box-sizing:border-box;font:500 30px/1 IT;z-index:3}}
.stub .no{{font-variant-numeric:tabular-nums;opacity:.75}}
.p{{position:absolute;margin:0;font:400 40px/1.36 IT;letter-spacing:-0.01em}}
/* The cheque */
.chq{{width:940px;height:440px;box-sizing:border-box;padding:34px 40px;background:{PAPER};background-image:repeating-linear-gradient(135deg,#6A06200d 0 2px,transparent 2px 9px);border:2px solid {BURG};outline:10px solid {PAPER};box-shadow:0 30px 60px -30px rgba(0,0,0,.55);color:{INK};position:relative}}
.c-top{{display:flex;justify-content:space-between;align-items:flex-start}}
.c-logo span{{display:block;font:500 22px/1 IT;letter-spacing:.14em;text-transform:uppercase;color:{BURG};margin-top:10px}}
.c-no{{text-align:right;font:500 24px/1.3 IT;color:{BURG}}}.c-no span{{font-weight:400;color:{INK}}}
.c-line{{display:flex;align-items:flex-end;gap:18px;margin-top:30px;border-bottom:2px solid {BURG}66;padding-bottom:6px}}
.chq label{{font:500 18px/1 IT;letter-spacing:.12em;text-transform:uppercase;color:{BURG};white-space:nowrap;padding-bottom:8px}}
.chq label.r{{margin-left:auto}}
.hand{{font:italic 400 40px/1 LB;letter-spacing:-0.02em;color:{INK}}}
.blank{{flex:1;height:40px}}
.c-amt{{margin-left:auto;border:2px solid {BURG};padding:8px 18px;font:500 44px/1 IT;letter-spacing:-0.03em;color:{BURG};background:{PAPER}}}
.c-foot{{display:flex;justify-content:space-between;align-items:flex-end;margin-top:34px;gap:30px}}
.c-foot>div{{display:flex;flex-direction:column;gap:8px}}
.c-foot .hand{{font-size:34px}}
.c-sig{{align-items:flex-end;border-top:2px solid {BURG}66;padding-top:8px;min-width:330px}}
.c-sig .sig{{font-size:46px;color:{BURG};margin-top:-56px}}
.c-micr{{position:absolute;left:40px;bottom:14px;font:500 18px/1 IT;letter-spacing:.2em;color:{BURG}99}}
/* Notes on slide 3 */
.note{{position:absolute;width:368px;font:400 34px/1.25 IT;color:{INK};z-index:2}}
.note b{{display:block;font:500 40px/1.1 IT;letter-spacing:-0.02em;color:{BURG};margin-bottom:6px}}
.lead{{position:absolute;inset:0;width:1080px;height:1350px;z-index:1}}
.lead path{{fill:none;stroke:{BURG};stroke-width:2.5;stroke-dasharray:6 8}}
/* Who can apply */
.poem{{position:absolute;left:72px;right:72px;top:150px;margin:0;font-size:96px;line-height:1.02;letter-spacing:-0.035em;text-wrap:balance}}
.sw{{font-family:IT;font-weight:500}}
.si{{font-family:LB;font-style:italic;font-weight:400;font-size:.94em}}
.sy{{font-family:IT;font-weight:500;color:{ROSE}}}
/* Steps */
.num{{position:absolute;left:56px;top:110px;margin:0;font:500 300px/.85 IT;letter-spacing:-0.07em}}
.work{{position:absolute;background:{PAPER2};border:2px solid {BURG};display:flex;align-items:center;justify-content:center;box-sizing:border-box}}
.work span{{font:italic 400 44px/1 LB;color:{BURG}}}
.phone{{position:absolute;left:300px;top:600px;width:470px;background:#fff;border-radius:26px;overflow:hidden;border:2px solid {RULE}}}
.ph-top{{display:flex;align-items:center;gap:14px;padding:18px 22px;font:500 24px/1 IT;color:{INK}}}
.av{{width:40px;height:40px;border-radius:50%;background:{PAPER2}}}
.ph-cap{{padding:18px 22px 24px;font:400 24px/1.35 IT;color:{INK}}}
.form{{position:absolute;left:300px;right:72px;top:600px;background:#fff;border:2px solid {RULE};border-radius:24px;padding:34px}}
.form label{{display:block;font:500 28px/1.2 IT;color:{INK};margin:16px 0 10px}}
.f-in{{border:2px solid {RULE};border-radius:12px;padding:16px 20px;font:400 26px/1 IT;color:#9A908C}}
.f-btn{{margin-top:26px;background:{BURG};color:{PAPER};border-radius:12px;padding:22px;text-align:center;font:500 30px/1 IT}}
/* Dates */
.tl-row{{position:absolute;left:72px;right:72px;top:220px;display:flex;align-items:center;gap:40px}}
.tl-row>div:not(.line){{display:flex;flex-direction:column}}
.tl-row .d{{font:500 300px/.85 IT;letter-spacing:-0.07em}}
.tl-row .mth{{font:500 52px/1.1 IT;letter-spacing:-0.02em;margin-top:10px}}
.tl-row .lb{{font:400 32px/1.2 IT;opacity:.8;margin-top:8px}}
.tl-row .line{{flex:1;height:0;border-top:3px dotted currentColor;margin-top:-120px}}
/* Checklist */
.checks{{position:absolute;left:72px;right:72px;top:170px}}
.ck{{display:flex;gap:30px;align-items:center;border-top:2px dotted {BURG}66;padding:34px 0;font:500 52px/1.1 IT;letter-spacing:-0.025em;color:{INK}}}
.bx{{flex:0 0 64px;height:64px;border:3px solid {BURG};color:{BURG};border-radius:12px;display:inline-flex;align-items:center;justify-content:center}}
.bx svg{{width:38px;height:38px}}
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
