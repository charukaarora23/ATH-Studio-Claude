"""Instagram slide system: covers, numbers, pointers, paragraphs, end card.

Usage (from design/guidelines):
  ATH_FONTS=<fonts folder> NP=<folder holding playwright> python3 src/slides.py
Needs in ATH_FONTS: it/package/files/inter-tight-latin-{400,500}-normal.woff2 (npm @fontsource/inter-tight)
and lb/package/files/libre-baskerville-latin-400-{normal,italic}.woff2 (npm @fontsource/libre-baskerville).
Stand-in images in src/stock are public-domain paintings (see src/stock/SOURCES.md).
"""
import os, re, subprocess, pathlib
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
STOCK = HERE / 'stock'
FONTS = pathlib.Path(os.environ.get('ATH_FONTS', 'fonts')).resolve()
OUT = ROOT / 'img' / 'slides'

NIGHT, ROSE, BURG, CHILLI = '#52051A', '#FFA1C2', '#6A0620', '#AA0003'
PEONY, BALLET, CREAM, PAPER, INK = '#FAD2E1', '#FFD6DE', '#F9EEE5', '#FDF8F3', '#1C1310'

src = (ROOT.parent / 'logo' / 'svg' / 'master' / 'logo-master_burgundy.svg').read_text()
x, y, w, h = map(float, re.search(r'viewBox="([^"]+)"', src).group(1).split())
LOGO_VB = f'{x+78:.2f} {y+78:.2f} {w-156:.2f} {h-156:.2f}'
LOGO_G = re.search(r'<g fill="[^"]+">(.*?)</g>', src, re.S).group(1)


def logo(color, width):
    return f'<svg style="width:{width}px;display:block" viewBox="{LOGO_VB}" fill="{color}" aria-hidden="true">{LOGO_G}</svg>'


def img(name, pos='50% 50%'):
    return f'<img src="{(STOCK / name).as_uri()}" style="object-position:{pos}">'


ARROW = '<svg class="arw" viewBox="0 0 72 40" aria-hidden="true"><rect x="1.25" y="1.25" width="69.5" height="37.5" rx="18.75" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M22 20h28M42 12.5l8 7.5-8 7.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
BADGE = '<span class="badge"><svg viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'


def corners(color, tl='', tr='', bl='@artstoheartsproject', br=ARROW, top=56, bottom=56):
    """The four-corner frame. Same size and place on every slide; this is what makes a carousel read as one set."""
    return (f'<div class="m tl" style="color:{color};top:{top}px">{tl}</div><div class="m tr" style="color:{color};top:{top}px">{tr}</div>'
            f'<div class="m bl" style="color:{color};bottom:{bottom}px">{bl}</div><div class="m br" style="color:{color};bottom:{bottom}px">{br}</div>')


S = []


def slide(name, bg, body, kind):
    S.append((name, kind))
    return f'<section id="{name}" class="s" style="background:{bg}">{body}</section>'


H = []
# ---------------- Covers ----------------
H.append(slide('cover-type', NIGHT, f'''
{corners(ROSE, 'Open calls', '01 / 07', br='')}
<h1 class="h xl" style="color:{ROSE};top:150px">{BADGE}How to choose an open call worth your entry&nbsp;fee</h1>
<div class="swipe" style="color:{ROSE}"><span>Swipe</span>{ARROW}</div>''', 'cover'))

H.append(slide('cover-image', CREAM, f'''
<div class="pic" style="height:780px">{img('starry_night.jpg', '50% 40%')}</div>
<p class="lbl" style="color:{BURG};position:absolute;left:72px;top:836px">Reading list · Six paintings</p><p class="lbl" style="color:{BURG};position:absolute;right:72px;top:836px">01 / 06</p>
<h1 class="h l" style="color:{BURG};top:880px;max-width:900px">That taught us how to paint the night</h1>
{corners(INK, bl='<span class="cr">Vincent van Gogh, The Starry Night, 1889</span>', tl='', tr='')}''', 'cover'))

H.append(slide('cover-panel', NIGHT, f'''
<div class="pic" style="inset:0">{img('the_scream.jpg', '50% 30%')}</div>
<div class="panel" style="background:{ROSE};left:72px;bottom:72px;width:760px">
<div style="display:flex;justify-content:space-between"><p class="lbl" style="color:{NIGHT}">Open call · Deadline 30 November</p><p class="lbl" style="color:{NIGHT}">01 / 05</p></div>
<h1 class="h m" style="color:{NIGHT};position:static;margin-top:28px">Paint the feeling, not the face.</h1>
<div style="display:flex;justify-content:space-between;align-items:center;margin-top:40px;color:{NIGHT}"><span class="cr" style="color:{NIGHT}">Edvard Munch, The Scream, 1893</span>{ARROW}</div>
</div>''', 'cover'))

H.append(slide('cover-serif', CREAM, f'''
{corners(BURG, 'Bookshop', '01 / 08', br='')}
<p class="lbl" style="color:{BURG};position:absolute;left:0;right:0;top:470px;text-align:center">October</p>
<h1 class="serifh" style="color:{BURG}">The month<br>in books</h1>
<div class="swipe" style="color:{BURG}"><span>Swipe to see more</span>{ARROW}</div>''', 'cover'))

H.append(slide('cover-split', CHILLI, f'''
<div class="pic" style="top:675px;height:675px">{img('wave.jpg', '50% 50%')}</div>
{corners(BALLET, 'Open call', '01 / 06', bl='', br='')}
<h1 class="h xxl" style="color:{BALLET};top:150px">Open call</h1>
<p class="sub" style="color:{BALLET};position:absolute;left:72px;top:500px">101 Art Book: Waves · Deadline 30 Nov</p>
<div class="m" style="color:{BALLET};left:72px;top:610px"><span class="cr" style="color:{BALLET}">Katsushika Hokusai, The Great Wave, c. 1831</span></div><div class="m" style="color:{BALLET};right:72px;top:600px">{ARROW}</div>''', 'cover'))

# ---------------- Numbers ----------------
H.append(slide('num-hero', NIGHT, f'''
{corners(ROSE, 'In numbers', '02 / 07')}
<p class="fig" style="color:{ROSE};top:120px">101</p>
<p class="h s" style="color:{ROSE};top:660px;max-width:760px">artists in every 101 Art Book. One full page each.</p>''', 'number'))

rows = [('Artists published', '1,240'), ('Books printed', '14'), ('Countries', '62'), ('First time in print', '58%')]
rr = ''.join(f'<div class="kn" style="border-color:rgba(106,6,32,.25)"><span class="kl" style="color:{INK}">→&nbsp;{a}</span><span class="kv" style="color:{BURG}">{b}</span></div>' for a, b in rows)
H.append(slide('num-list', CREAM, f'''
{corners(BURG, 'The year so far', '03 / 07')}
<h2 class="h s" style="color:{BURG};top:150px">Key numbers</h2>
<div style="position:absolute;left:72px;right:72px;top:290px">{rr}</div>''', 'number'))

panels = [('101', 'Artists per book'), ('8.5 × 8.5', 'Inches, hardback'), ('$35', 'Entry per artwork')]
pp = ''.join(f'<div class="np" style="background:{PEONY}"><span class="nv" style="color:{BURG}">{v}</span><span class="nl" style="color:{BURG}">{l}</span></div>' for v, l in panels)
H.append(slide('num-panels', PAPER, f'''
{corners(BURG, '101 Art Book: Faces', '04 / 07')}
<h2 class="h m" style="color:{BURG};top:150px;max-width:760px">The book at a glance</h2>
<div style="position:absolute;left:72px;right:72px;bottom:150px;display:grid;gap:16px">{pp}</div>''', 'number'))

H.append(slide('num-split', ROSE, f'''
<div style="position:absolute;left:0;right:0;bottom:0;height:675px;background:{NIGHT}"></div>
<div class="m tl" style="color:{NIGHT};top:56px">How it works</div><div class="m tr" style="color:{NIGHT};top:56px">05 / 07</div>
<p class="fig2" style="color:{NIGHT};top:130px">$35</p><p class="lbl" style="color:{NIGHT};position:absolute;right:72px;top:560px">Entry, per artwork</p>
<p class="fig2" style="color:{ROSE};top:805px">30.11</p><p class="lbl" style="color:{ROSE};position:absolute;right:72px;top:1235px">Deadline</p>
''', 'number'))

# ---------------- Pointers ----------------
pts = ['Who is on the jury', 'What you get if selected', 'When the book ships', 'Where it will be sold', 'What past books look like']
pl = ''.join(f'<div class="pt" style="border-color:rgba(106,6,32,.25)"><span class="pi" style="color:{CHILLI}">{i+1:02d}</span><span class="pv" style="color:{INK}">{t}</span></div>' for i, t in enumerate(pts))
H.append(slide('point-list', CREAM, f'''
{corners(BURG, 'Before you apply', '02 / 07')}
<h2 class="h m" style="color:{BURG};top:150px">Five things to check</h2>
<div style="position:absolute;left:72px;right:72px;top:360px">{pl}</div>''', 'pointer'))

H.append(slide('point-single', NIGHT, f'''
{corners(ROSE, 'Before you apply', '03 / 07')}
<p class="idx" style="color:{ROSE};top:150px">01</p>
<h2 class="h l" style="color:{ROSE};top:300px;max-width:900px">Read who sits on the jury.</h2>
<p class="p" style="color:{PEONY};top:620px">A named jury of working artists and editors is a good sign. A call that won't say who picks the work is not.</p>''', 'pointer'))

H.append(slide('point-image', CREAM, f'''
<div class="pic" style="height:640px">{img('shipwreck.jpg', '50% 55%')}</div>
<p class="idx" style="color:{CHILLI};top:700px">03</p><p class="lbl" style="color:{BURG};position:absolute;right:72px;top:700px">Before you apply · 04 / 07</p>
<h2 class="h m" style="color:{BURG};top:770px;max-width:900px">Look at the last book they printed.</h2>
<p class="p" style="color:{INK};top:1000px;font-size:32px">Paper, colour and how each artist is credited tell you how your work will be treated.</p>
{corners(INK, bl='<span class="cr">J. M. W. Turner, The Shipwreck, 1805</span>', tl='', tr='')}''', 'pointer'))

# ---------------- Paragraphs ----------------
H.append(slide('para-serif', ROSE, f'''
{corners(NIGHT, 'A note from the studio', '05 / 07')}
<p class="serifp" style="color:{NIGHT};top:250px">Share the work before it feels finished. Most artists in our books applied with a painting they <i>almost didn't send.</i></p>''', 'paragraph'))

H.append(slide('para-editorial', PAPER, f'''
{corners(BURG, 'Why we print', '06 / 07')}
<h2 class="h m" style="color:{BURG};top:150px;max-width:860px">A page you can hold changes how you see your work.</h2>
<div class="cols" style="top:560px">
<p class="serifq" style="color:{BURG}"><i>“It stopped being a file on my phone.”</i></p>
<p class="pc" style="color:{INK}">Every 101 Art Book gives each artist one full page, with their name, title and medium printed under the work. Books go to the artists, to collectors and to the shelves of our bookshop, where people find work they would never meet online.</p>
</div>''', 'paragraph'))

H.append(slide('para-image', NIGHT, f'''
<div class="pic" style="left:72px;top:140px;width:440px;height:440px">{img('udnie.jpg', '50% 50%')}</div>
{corners(ROSE, 'Artist story', '04 / 06')}
<p class="cr" style="color:{PEONY};position:absolute;left:72px;top:600px">Francis Picabia, Udnie, 1913</p>
<p class="serifp" style="color:{ROSE};top:700px;font-size:56px">“I almost didn't apply. Now three collectors have my page bookmarked.”</p>
<p class="lbl" style="color:{PEONY};position:absolute;left:72px;top:1130px">Artist Name · 101 Art Book: Dog</p>''', 'paragraph'))

# ---------------- End ----------------
H.append(slide('end-card', NIGHT, f'''
{corners(ROSE, '', '07 / 07', bl='', br='')}
<div style="position:absolute;left:0;right:0;top:500px;display:flex;justify-content:center">{logo(ROSE, 560)}</div>
<p class="sub" style="color:{PEONY};position:absolute;left:0;right:0;top:760px;text-align:center">artstoheartsproject.com</p>
<div class="swipe" style="color:{ROSE}"><span>Save this for your next open call</span></div>''', 'end'))


# ---------------- Story and print, same system ----------------
def sized(name, w, h, bg, body):
    S.append((name, 'extra'))
    return f'<section id="{name}" class="s" style="background:{bg};width:{w}px;height:{h}px">{body}</section>'

H.append(sized('story-event', 1080, 1920, NIGHT, f'''
<div class="m tl" style="color:{ROSE};top:250px">Reading · ATH Bookshop</div><div class="m tr" style="color:{ROSE};top:250px">Online</div>
<h1 class="h xl" style="color:{ROSE};top:330px">Artists read their own pages</h1>
<div class="pic" style="left:72px;right:72px;top:860px;height:560px">{img('starry_night.jpg', '50% 45%')}</div>
<p class="sub" style="color:{PEONY};position:absolute;left:72px;top:1450px">Thursday 6 November · 7 pm GMT</p>
<div class="m bl" style="color:{ROSE};bottom:360px">Tap to save a seat</div><div class="m br" style="color:{ROSE};bottom:352px">{ARROW}</div>'''))

H.append(sized('print-poster-a3', 1188, 1680, NIGHT, f'''
<div style="position:absolute;left:72px;top:72px">{logo(ROSE, 300)}</div><div class="m tr" style="color:{ROSE};top:84px">101 Art Book</div>
<h1 class="h xxl" style="color:{ROSE};top:300px;font-size:250px">Open call</h1>
<p class="sub" style="color:{PEONY};position:absolute;left:72px;top:760px;font-size:56px;letter-spacing:-0.02em">Faces, portraits, self-portraits.</p>
<div class="pic" style="left:72px;right:72px;top:880px;height:460px">{img('the_scream.jpg', '50% 62%')}</div>
<div class="facts" style="color:{ROSE}"><div><span>Deadline</span><b>30 November</b></div><div><span>Entry</span><b>From $35</b></div><div><span>Apply</span><b>artstoheartsproject.com</b></div></div>'''))

H.append(sized('print-postcard-a6', 1480, 1050, CREAM, f'''
<div class="pic" style="left:auto;right:0;width:560px;height:1050px">{img('wave.jpg', '62% 50%')}</div>
<h2 class="h l" style="color:{BURG};top:96px;right:640px">Thank you for being in the book.</h2>
<div style="position:absolute;left:72px;bottom:80px">{logo(BURG, 300)}</div>'''))

CSS = f'''
@font-face{{font-family:IT;font-weight:400;src:url("{(FONTS/'it/package/files/inter-tight-latin-400-normal.woff2').as_uri()}")}}
@font-face{{font-family:IT;font-weight:500;src:url("{(FONTS/'it/package/files/inter-tight-latin-500-normal.woff2').as_uri()}")}}
@font-face{{font-family:LB;font-style:normal;src:url("{(FONTS/'lb/package/files/libre-baskerville-latin-400-normal.woff2').as_uri()}")}}
@font-face{{font-family:LB;font-style:italic;src:url("{(FONTS/'lb/package/files/libre-baskerville-latin-400-italic.woff2').as_uri()}")}}
body{{margin:0;background:#777;display:flex;flex-wrap:wrap;gap:40px;padding:40px}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;font-family:IT;-webkit-font-smoothing:antialiased}}
.m{{position:absolute;font:500 24px/1.2 IT;letter-spacing:.005em;display:flex;align-items:center}}
.tl{{left:72px}}.tr{{right:72px}}.bl{{left:72px}}.br{{right:72px}}
.arw{{width:72px;height:40px;display:block}}
.cr{{font:400 20px/1.3 IT;letter-spacing:.01em}}
.h{{position:absolute;left:72px;right:72px;margin:0;font-family:IT;font-weight:500;letter-spacing:-0.035em;text-wrap:balance}}
.xxl{{font-size:210px;line-height:.9;letter-spacing:-0.05em}}
.xl{{font-size:124px;line-height:.96}}
.l{{font-size:100px;line-height:.98}}
.m.h,.h.m{{font-size:76px;line-height:1.02;letter-spacing:-0.03em}}
.h.s{{font-size:56px;line-height:1.08;letter-spacing:-0.025em}}
.badge{{display:inline-flex;width:.72em;height:.72em;border-radius:50%;background:currentColor;align-items:center;justify-content:center;vertical-align:baseline;transform:translateY(.02em);margin-right:.16em}}
.badge svg{{width:46%;height:46%;color:{NIGHT}}}
.swipe{{position:absolute;left:0;right:0;bottom:150px;display:flex;justify-content:center;align-items:center;gap:18px;font:500 26px/1 IT}}
.pic{{position:absolute;left:0;right:0;top:0;overflow:hidden}}
.pic img{{width:100%;height:100%;object-fit:cover;display:block}}
.lbl{{margin:0;font:500 24px/1.2 IT;letter-spacing:.005em}}
.sub{{margin:0;font:400 34px/1.3 IT;letter-spacing:-0.01em}}
.panel{{position:absolute;padding:48px}}
.serifh{{position:absolute;left:0;right:0;top:540px;margin:0;text-align:center;font:400 128px/1.02 LB;letter-spacing:-0.025em}}
.fig{{position:absolute;left:58px;margin:0;font:500 520px/.85 IT;letter-spacing:-0.07em}}
.fig2{{position:absolute;left:56px;margin:0;font:500 400px/.85 IT;letter-spacing:-0.065em}}
.kn{{display:flex;justify-content:space-between;align-items:flex-end;border-top:2px solid;padding:30px 0 26px}}
.kl{{font:400 28px/1.2 IT;padding-bottom:12px}}
.kv{{font:500 136px/.82 IT;letter-spacing:-0.055em}}
.np{{display:flex;justify-content:space-between;align-items:center;padding:36px 44px;border-radius:24px}}
.nv{{font:500 132px/.85 IT;letter-spacing:-0.055em}}
.nl{{font:500 24px/1.25 IT;text-align:right;max-width:260px}}
.pt{{display:flex;gap:40px;align-items:baseline;border-top:2px solid;padding:30px 0}}
.pi{{font:500 26px/1 IT;width:40px}}
.pv{{font:500 46px/1.1 IT;letter-spacing:-0.02em}}
.idx{{position:absolute;left:72px;margin:0;font:500 30px/1 IT}}
.p{{position:absolute;left:72px;right:200px;margin:0;font:400 36px/1.42 IT;letter-spacing:-0.005em}}
.serifp{{position:absolute;left:72px;right:96px;margin:0;font:400 72px/1.2 LB;letter-spacing:-0.02em}}
.serifp i{{font-style:italic}}
.cols{{position:absolute;left:72px;right:72px;display:grid;grid-template-columns:1fr 1.25fr;gap:56px}}
.serifq{{margin:0;font:400 46px/1.22 LB;letter-spacing:-0.015em}}
.pc{{margin:0;font:400 30px/1.48 IT}}
.facts{{position:absolute;left:72px;right:72px;bottom:80px;display:grid;grid-template-columns:1fr .8fr 1.8fr;gap:32px;border-top:2px solid currentColor;padding-top:28px}}
.facts span{{font:500 24px/1 IT}}.facts b{{display:block;margin-top:14px;font:500 44px/1.05 IT;letter-spacing:-0.025em;white-space:nowrap}}
'''

OUT.mkdir(parents=True, exist_ok=True)
page = f'<!doctype html><meta charset="utf-8"><style>{CSS}</style>' + ''.join(H)
(HERE / 'slides.html').write_text(page)
(HERE / 'shot.cjs').write_text('''
const {chromium}=require(process.env.NP+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1200}});
await p.goto(process.argv[2]);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(900);
for(const id of process.argv.slice(4)){await p.locator('#'+id).screenshot({path:process.argv[3]+'/'+id+'.png'});}
await b.close()})();
''')
subprocess.run(['node', str(HERE / 'shot.cjs'), (HERE / 'slides.html').as_uri(), str(OUT)] + [n for n, _ in S], check=True)
for n, _ in S:
    p = OUT / f'{n}.png'
    im = Image.open(p).convert('RGB')
    im = im.resize((720, round(im.height * 720 / im.width)), Image.LANCZOS)
    im.save(OUT / f'{n}.jpg', quality=86, optimize=True, progressive=True)
    p.unlink()
print('slides', len(S))
