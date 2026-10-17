"""Instagram slide system: covers, image covers, numbers, pointers, paragraphs, end card, plus story and print.

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

# Core
NIGHT, ROSE, BURG, CHILLI = '#52051A', '#FFA1C2', '#6A0620', '#AA0003'
PEONY, CREAM, PAPER, INK = '#FAD2E1', '#F9EEE5', '#FDF8F3', '#1C1310'
# Secondary, from the earlier ATH system
SKY, LEMON, PIST, PETROL = '#B7D9FF', '#FFF3B2', '#D0D996', '#025054'
# Neutrals do most of the surface work
WHITE, BLACK, GREY = '#FFFFFF', '#141111', '#F1EEEB'

src = (ROOT.parent / 'logo' / 'svg' / 'master' / 'logo-master_burgundy.svg').read_text()
x, y, w, h = map(float, re.search(r'viewBox="([^"]+)"', src).group(1).split())
LOGO_VB = f'{x+78:.2f} {y+78:.2f} {w-156:.2f} {h-156:.2f}'
LOGO_G = re.search(r'<g fill="[^"]+">(.*?)</g>', src, re.S).group(1)


def logo(color, width):
    return f'<svg style="width:{width}px;display:block" viewBox="{LOGO_VB}" fill="{color}" aria-hidden="true">{LOGO_G}</svg>'


def img(name, pos='50% 50%'):
    return f'<img src="{(STOCK / name).as_uri()}" style="object-position:{pos}">'


ARROW = '<svg class="arw" viewBox="0 0 72 40" aria-hidden="true"><rect x="1.25" y="1.25" width="69.5" height="37.5" rx="18.75" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M22 20h28M42 12.5l8 7.5-8 7.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def badge(bg, fg):
    return f'<span class="badge" style="background:{bg};color:{fg}"><svg viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'


def top(color, tl='', tr=''):
    return f'<div class="m tl" style="color:{color}">{tl}</div><div class="m tr" style="color:{color}">{tr}</div>'


def bottom(color, bl='@artstoheartsproject', br=ARROW):
    return f'<div class="m bl" style="color:{color}">{bl}</div><div class="m br" style="color:{color}">{br}</div>'


def credit(text, color):
    return f'<span class="cr" style="color:{color}">{text}</span>'


S, H = [], []


def slide(name, bg, body, w=1080, hgt=1350):
    S.append(name)
    H.append(f'<section id="{name}" class="s" style="background:{bg};width:{w}px;height:{hgt}px">{body}</section>')


# ---------------- Type covers ----------------
slide('cover-type', NIGHT, f'''{top(ROSE, 'Open calls', '01 / 07')}
<h1 class="h xl" style="color:{ROSE};top:160px">{badge(ROSE, NIGHT)}How to choose an open call worth your entry&nbsp;fee</h1>
<div class="swipe" style="color:{ROSE}"><span>Swipe</span>{ARROW}</div>{bottom(ROSE, br='')}''')

slide('cover-type-white', WHITE, f'''{top(INK, 'Open calls', '01 / 06')}
<h1 class="h xl" style="color:{INK};top:160px">{badge(BURG, WHITE)}What jurors actually look&nbsp;for</h1>
<div class="swipe" style="color:{INK}"><span>Swipe</span>{ARROW}</div>{bottom(INK, br='')}''')

slide('cover-type-black', BLACK, f'''{top(WHITE, 'First time?', '01 / 05')}
<h1 class="h xl" style="color:{WHITE};top:160px">{badge(ROSE, BLACK)}Your first open call, <span style="color:{ROSE}">step by&nbsp;step</span></h1>
<div class="swipe" style="color:{WHITE}"><span>Swipe</span>{ARROW}</div>{bottom(WHITE, br='')}''')

# ---------------- Text over images ----------------
slide('img-scrim', NIGHT, f'''<div class="pic" style="inset:0">{img('wave.jpg', '22% 50%')}</div>
<div class="veil" style="top:0;height:300px;background:linear-gradient({NIGHT}cc,{NIGHT}00)"></div>
<div class="veil" style="bottom:0;height:780px;background:linear-gradient({NIGHT}00,{NIGHT}f2 55%)"></div>
{top(CREAM, 'Open call · Faces', '01 / 05')}
<h1 class="h l" style="color:{CREAM};top:760px">Paint the feeling, not the face.</h1>
<div class="facts2" style="color:{CREAM};top:1010px"><div><span>Deadline</span><b>30 November</b></div><div><span>Entry</span><b>From $35</b></div></div>
{bottom(CREAM, credit('Katsushika Hokusai, The Great Wave, c. 1831', CREAM))}''')

slide('img-band', WHITE, f'''<div class="pic" style="height:840px">{img('starry_night.jpg', '50% 50%')}</div>
<div class="veil" style="top:0;height:260px;background:linear-gradient(#00000066,#0000)"></div>
{top(CREAM, '101 Art Book: Faces', '01 / 06')}
<span class="chip" style="background:{BURG};color:{WHITE};left:72px;top:884px">Open call</span><p class="lbl" style="color:{INK};top:900px;left:290px">Faces, portraits, self-portraits</p>
<h1 class="h l" style="color:{BURG};top:960px;font-size:96px;white-space:nowrap">Enter by 30 November</h1>
<p class="sub" style="color:{INK};top:1090px">From $35 per artwork · artstoheartsproject.com</p>
{bottom(INK, credit('Vincent van Gogh, The Starry Night, 1889', INK))}''')

slide('img-frame', WHITE, f'''{top(INK, 'Reading list', '02 / 07')}
<div class="pic" style="left:72px;right:72px;top:150px;height:760px;border-radius:24px">{img('woman_with_hat.jpg', '50% 30%')}</div>
<span class="chip" style="background:{WHITE};color:{INK};left:104px;top:182px">Matisse, 1905</span>
<h2 class="h m" style="color:{INK};top:960px">Woman with a Hat, and the colour that shocked&nbsp;Paris</h2>
{bottom(INK)}''')

slide('img-giant', WHITE, f'''<div class="pic" style="top:560px;bottom:0">{img('the_scream.jpg', '50% 72%')}</div>
<div class="veil" style="bottom:0;height:260px;background:linear-gradient({NIGHT}00,{NIGHT}cc)"></div>
{top(BURG, 'Open call', '01 / 06')}
<h1 class="h xxl" style="color:{BURG};top:300px">Open call</h1>
{bottom(CREAM, credit('Edvard Munch, The Scream, 1893', CREAM))}''')


# ---------------- Text over images, from the second round of references ----------------
def word(t, left, topy, size, color, extra=''):
    return f'<span class="w" style="left:{left}px;top:{topy}px;font-size:{size}px;color:{color};{extra}">{t}</span>'

slide('img-stagger', NIGHT, f'''<div class="pic" style="inset:0">{img('shipwreck.jpg', '38% 50%')}</div>
{top(CREAM, 'Essay', '01 / 06')}
{word('The', 300, 200, 150, CREAM)}{word('Quiet', 470, 370, 150, CREAM)}{word('Art of', 72, 540, 150, CREAM)}{word('Applying', 330, 710, 150, CREAM)}
{bottom(CREAM, credit('J. M. W. Turner, The Shipwreck, 1805', CREAM))}''')

slide('img-around', NIGHT, f'''<div class="pic" style="inset:0">{img('the_scream.jpg', '50% 40%')}</div>
<div class="m tr" style="color:{NIGHT};background:{CREAM};padding:10px 22px;border-radius:999px;top:52px">1 / 6</div>
<p class="cap c" style="color:{CREAM};top:120px">(01)</p>
<p class="caps c" style="color:{CREAM};top:170px">Open call</p>
<p class="serifs c" style="color:{CREAM};top:640px">Faces, portraits,<br>self-portraits</p>
<p class="cap" style="color:{CREAM};left:72px;top:820px">$35 ENTRY</p><p class="cap" style="color:{CREAM};right:72px;top:820px;left:auto">HARDBACK</p>
<p class="cap c" style="color:{CREAM};top:1040px">(02)</p>
<p class="caps c" style="color:{CREAM};top:1090px">30 November</p>''')

slide('img-mixed', NIGHT, f'''<div class="pic" style="inset:0">{img('woman_with_hat.jpg', '50% 30%')}</div><div class="veil" style="inset:0;background:#000;opacity:0.32"></div>
<span class="tag" style="left:72px;top:60px;background:{CREAM}33;color:{CREAM}">SWIPE</span>
<div class="m tr" style="color:{CREAM};background:{NIGHT}99;padding:10px 22px;border-radius:999px;top:52px">1 / 9</div>
<p class="big" style="color:{CREAM};left:90px;top:400px">BOOKS<sup>OF</sup></p>
<p class="big" style="color:{CREAM};left:96px;top:600px"><sub>THE</sub>MONTH</p>
<div class="glass" style="left:560px;top:930px;width:448px"><b>NEW ON THE SHELF</b><span>Four books we can't put down this month.</span></div>
{bottom(CREAM, credit('Henri Matisse, Woman with a Hat, 1905', CREAM), '')}''')

slide('img-card', NIGHT, f'''<div class="pic" style="inset:0">{img('udnie.jpg', '50% 50%')}</div>
<div class="card" style="background:{PAPER}">
<p class="serifs c" style="color:{INK};top:90px;font-size:62px;white-space:nowrap">Artists, Books, Open Calls</p>
<p class="small c" style="color:{INK};top:180px">artstoheartsproject.com<br>@artstoheartsproject</p>
<p class="serifb" style="color:{INK}"><span class="inl">{logo(INK, 230)}</span> is a house for artists: a gallery, a studio, a bookshop, and open calls that end in a printed book with your name in it.</p>
</div>''')

slide('img-caption', NIGHT, f'''<div class="pic" style="inset:0">{img('wave.jpg', '78% 50%')}</div>
<p class="note" style="color:{NIGHT};top:560px">A FRIENDLY REMINDER THAT EVERY ARTIST IN OUR BOOKS APPLIED FOR THE FIRST TIME ONCE</p>
<p class="caps" style="color:{NIGHT};left:72px;top:150px;font-size:92px;line-height:.95;text-align:left;right:72px">Notes from a first-time exhibitor</p>
<p class="serifs" style="color:{NIGHT};left:72px;top:360px;font-size:40px;text-align:left"><i>this one is for you</i></p>''')

slide('img-serif-center', NIGHT, f'''<div class="pic" style="inset:0">{img('starry_night.jpg', '55% 50%')}</div><div class="veil" style="inset:0;background:#000;opacity:0.38"></div>
<p class="cap c" style="color:{CREAM};top:60px;font-size:26px">ARTS TO HEARTS</p>
<p class="serifs c" style="color:{CREAM};top:500px;font-size:92px;line-height:1;letter-spacing:-0.045em">Painters Make<br><i>Fearless</i> Publishers</p>
<p class="c" style="position:absolute;margin:0;color:{CREAM};font:400 32px/1.4 IT;z-index:2;top:740px">Some of the best books we print start<br>with an artist who almost didn't apply.</p>
<div class="m br" style="color:{NIGHT};background:{CREAM};border-radius:50%;width:64px;height:64px;justify-content:center;bottom:640px;right:28px"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>''')

slide('img-caps-accent', NIGHT, f'''<div class="pic" style="inset:0">{img('shipwreck.jpg', '60% 50%')}</div>
<p class="capl c" style="color:{LEMON};top:90px">A ONE-WEEK READING CIRCLE<br>WITH THE ATH EDITORS</p>
<p class="capl" style="color:{LEMON};left:72px;top:880px">FROM 6 NOVEMBER UNTIL 13 NOVEMBER</p>
<p class="caps" style="color:{LEMON};left:72px;top:950px;font-size:150px;line-height:.9;text-align:left">Read with<br>artists</p>
<p class="capl" style="color:{LEMON};left:72px;top:1240px;font-size:28px">LIMITED SPOTS<br>ARTSTOHEARTSPROJECT.COM</p>
<p class="capl" style="color:{LEMON};right:72px;top:1240px;font-size:28px;text-align:right">FOR ARTISTS<br>READY TO BE SEEN</p>''')

slide('img-edges', NIGHT, f'''<div class="pic" style="inset:0">{img('minotaur.jpg', '30% 50%')}</div><div class="veil" style="inset:0;background:#000;opacity:0.15"></div>
<p class="edge" style="color:{CREAM};left:56px;top:40px">THE</p><p class="edge" style="color:{CREAM};right:56px;top:40px">OPEN</p>
<p class="caps c" style="color:{CREAM};top:560px;font-size:110px;letter-spacing:-0.03em">30 NOVEMBER</p>
<p class="caps c" style="color:{CREAM};top:680px;font-size:56px;letter-spacing:-0.01em">MIDNIGHT GMT</p>
<p class="edge" style="color:{CREAM};right:56px;bottom:40px;top:auto">CALL</p>''')

slide('img-lockup', NIGHT, f'''<div class="pic" style="inset:0">{img('udnie.jpg', '50% 50%')}</div><div class="veil" style="inset:0;background:#000;opacity:0.45"></div>
<p class="cap" style="color:{CREAM};left:250px;top:560px;font-size:24px;letter-spacing:.14em">GALLERY</p><p class="cap" style="color:{CREAM};right:250px;left:auto;top:560px;font-size:24px;letter-spacing:.14em">BOOKSHOP</p>
<div style="position:absolute;left:0;right:0;top:600px;display:flex;justify-content:center;z-index:2">{logo(CREAM, 580)}</div>
<p class="c" style="position:absolute;margin:0;top:760px;color:{CREAM};font:500 26px/1.5 IT;letter-spacing:.12em;z-index:2">OPEN CALLS · BOOKS · A HOUSE FOR ARTISTS</p>
<p class="c" style="position:absolute;margin:0;bottom:90px;color:{CREAM};font:500 28px/1 IT;letter-spacing:.08em;z-index:2">@ARTSTOHEARTSPROJECT</p>''')

# ---------------- Numbers ----------------
slide('num-hero', BLACK, f'''{top(WHITE, 'In numbers', '02 / 07')}
<p class="fig" style="color:{WHITE};top:130px">101</p>
<p class="h s" style="color:{ROSE};top:670px;max-width:780px">artists in every 101 Art Book. One full page each.</p>{bottom(WHITE)}''')

rows = [('Artists published', '1,240'), ('Books printed', '14'), ('Countries', '62'), ('First time in print', '58%')]
rr = ''.join(f'<div class="kn" style="border-color:{INK}26"><span class="kl" style="color:{INK}">{a}</span><span class="kv" style="color:{CHILLI if i == 3 else INK}">{b}</span></div>' for i, (a, b) in enumerate(rows))
slide('num-list', WHITE, f'''{top(INK, 'The year so far', '03 / 07')}
<h2 class="h s" style="color:{INK};top:160px">Key numbers</h2>
<div style="position:absolute;left:72px;right:72px;top:290px">{rr}</div>{bottom(INK)}''')

panels = [('101', 'Artists per book'), ('8.5 × 8.5', 'Inches, hardback'), ('$35', 'Entry per artwork')]
pp = ''.join(f'<div class="np" style="background:{GREY}"><span class="nv" style="color:{BURG}">{v}</span><span class="nl" style="color:{INK}">{l}</span></div>' for v, l in panels)
slide('num-panels', WHITE, f'''{top(INK, '101 Art Book: Faces', '04 / 07')}
<h2 class="h m" style="color:{INK};top:160px;max-width:760px">The book at a glance</h2>
<div style="position:absolute;left:72px;right:72px;bottom:150px;display:grid;gap:16px">{pp}</div>{bottom(INK)}''')

slide('num-split', WHITE, f'''<div style="position:absolute;left:0;right:0;bottom:0;height:675px;background:{BURG}"></div>
{top(INK, 'How it works', '05 / 07')}
<p class="fig2" style="color:{INK};top:150px">$35</p><p class="lbl" style="color:{INK};right:72px;left:auto;top:560px">Entry, per artwork</p>
<p class="fig2" style="color:{WHITE};top:790px">30.11</p><p class="lbl" style="color:{WHITE};right:72px;left:auto;top:1220px">Deadline</p>''')

# ---------------- Pointers ----------------
pts = ['Who is on the jury', 'What you get if selected', 'When the book ships', 'Where it will be sold', 'What past books look like']
pl = ''.join(f'<div class="pt" style="border-color:{INK}26"><span class="pi" style="color:{BURG}">{i+1:02d}</span><span class="pv" style="color:{INK}">{t}</span></div>' for i, t in enumerate(pts))
slide('point-list', WHITE, f'''{top(INK, 'Before you apply', '02 / 07')}
<h2 class="h m" style="color:{BURG};top:160px">Five things to check</h2>
<div style="position:absolute;left:72px;right:72px;top:370px">{pl}</div>{bottom(INK)}''')

slide('point-single', BLACK, f'''{top(WHITE, 'Before you apply', '03 / 07')}
<p class="idx" style="color:{ROSE};top:170px">01</p>
<h2 class="h l" style="color:{WHITE};top:290px;max-width:900px">Read who sits on the jury.</h2>
<p class="p" style="color:#CFC8C4;top:620px">A named jury of working artists and editors is a good sign. A call that won't say who picks the work is not.</p>{bottom(WHITE)}''')

slide('point-image', WHITE, f'''<div class="pic" style="height:600px">{img('shipwreck.jpg', '50% 55%')}</div>
<p class="idx" style="color:{BURG};top:660px">03</p><p class="lbl" style="color:{INK};right:72px;left:auto;top:656px">04 / 07</p>
<h2 class="h m" style="color:{INK};top:730px;max-width:920px">Look at the last book they printed.</h2>
<p class="p" style="color:{INK};top:950px">Paper, colour and credits tell you how your work will be treated.</p>
{bottom(INK, credit('J. M. W. Turner, The Shipwreck, 1805', INK))}''')

# ---------------- Paragraphs ----------------
slide('para-serif', ROSE, f'''{top(NIGHT, 'A note from the studio', '05 / 07')}
<p class="serifp" style="color:{NIGHT};top:260px">Share the work before it feels finished. Most artists in our books applied with a painting they <i>almost didn't send.</i></p>{bottom(NIGHT)}''')

slide('para-editorial', WHITE, f'''{top(INK, 'Why we print', '06 / 07')}
<h2 class="h m" style="color:{BURG};top:160px;max-width:900px">A page you can hold changes how you see your work.</h2>
<div class="cols" style="top:560px">
<p class="serifq" style="color:{BURG}"><i>“It stopped being a file on my phone.”</i></p>
<p class="pc" style="color:{INK}">Every 101 Art Book gives each artist one full page, with their name, title and medium under the work. Books go to the artists, to collectors and to our bookshop.</p>
</div>{bottom(INK)}''')

slide('para-image', NIGHT, f'''{top(ROSE, 'Artist story', '04 / 06')}
<div class="pic" style="left:72px;top:160px;width:420px;height:420px">{img('udnie.jpg')}</div>
<p class="cr" style="color:{PEONY};position:absolute;left:72px;top:600px">Francis Picabia, Udnie, 1913</p>
<p class="serifp" style="color:{ROSE};top:690px;font-size:58px">“I almost didn't apply. Now three collectors have my page bookmarked.”</p>
<p class="lbl" style="color:{PEONY};top:1140px">Artist Name · 101 Art Book: Dog</p>{bottom(ROSE)}''')

# ---------------- End ----------------
slide('end-card', BURG, f'''{top(WHITE, '', '07 / 07')}
<div style="position:absolute;left:0;right:0;top:500px;display:flex;justify-content:center">{logo(WHITE, 600)}</div>
<p class="sub" style="color:{PEONY};left:0;right:0;top:780px;text-align:center">artstoheartsproject.com</p>
<div class="swipe" style="color:{WHITE}"><span>Save this for your next open call</span></div>''')

# ---------------- Story and print ----------------
slide('story-event', WHITE, f'''<div class="m tl" style="color:{INK};top:250px">Reading · ATH Bookshop</div><div class="m tr" style="color:{INK};top:250px">Online</div>
<h1 class="h xl" style="color:{BURG};top:330px">Artists read their own pages</h1>
<div class="pic" style="left:72px;right:72px;top:860px;height:560px">{img('starry_night.jpg', '50% 45%')}</div>
<p class="sub" style="color:{BURG};top:1460px">Thursday 6 November · 7 pm GMT</p>
<div class="m bl" style="color:{BURG};bottom:360px">Tap to save a seat</div><div class="m br" style="color:{BURG};bottom:352px">{ARROW}</div>''', 1080, 1920)

slide('print-poster-a3', NIGHT, f'''<div style="position:absolute;left:72px;top:72px">{logo(ROSE, 300)}</div><div class="m tr" style="color:{ROSE};top:84px">101 Art Book</div>
<h1 class="h xxl" style="color:{ROSE};top:300px;font-size:250px">Open call</h1>
<p class="sub" style="color:{PEONY};top:760px;font-size:56px;letter-spacing:-0.02em">Faces, portraits, self-portraits.</p>
<div class="pic" style="left:72px;right:72px;top:880px;height:460px">{img('the_scream.jpg', '50% 62%')}</div>
<div class="facts" style="color:{ROSE}"><div><span>Deadline</span><b>30 November</b></div><div><span>Entry</span><b>From $35</b></div><div><span>Apply</span><b>artstoheartsproject.com</b></div></div>''', 1188, 1680)

slide('print-postcard-a6', CREAM, f'''<div class="pic" style="left:auto;right:0;width:560px;height:1050px">{img('woman_with_hat.jpg', '50% 40%')}</div>
<h2 class="h l" style="color:{BURG};top:96px;right:640px">Thank you for being in the book.</h2>
<div style="position:absolute;left:72px;bottom:80px">{logo(BURG, 300)}</div>''', 1480, 1050)

CSS = '''
@font-face{font-family:IT;font-weight:400;src:url("IT400")}
@font-face{font-family:IT;font-weight:500;src:url("IT500")}
@font-face{font-family:LB;font-style:normal;src:url("LBN")}
@font-face{font-family:LB;font-style:italic;src:url("LBI")}
body{margin:0;background:#777;display:flex;flex-wrap:wrap;gap:40px;padding:40px}
.s{position:relative;overflow:hidden;font-family:IT;-webkit-font-smoothing:antialiased}
.m{position:absolute;font:500 30px/1.2 IT;letter-spacing:-.005em;display:flex;align-items:center;z-index:2}
.tl{left:72px;top:60px}.tr{right:72px;top:60px}.bl{left:72px;bottom:60px}.br{right:72px;bottom:60px}
.arw{width:88px;height:49px;display:block}
.cr{font:400 24px/1.3 IT;letter-spacing:0}
.h{position:absolute;left:72px;right:72px;margin:0;font-family:IT;font-weight:500;letter-spacing:-0.035em;text-wrap:balance;z-index:2}
.xxl{font-size:230px;line-height:.9;letter-spacing:-0.055em}
.xl{font-size:124px;line-height:.96}
.l{font-size:104px;line-height:.98}
.h.m{font-size:80px;line-height:1.02;letter-spacing:-0.03em}
.h.s{font-size:60px;line-height:1.08;letter-spacing:-0.025em}
.badge{display:inline-flex;width:.72em;height:.72em;border-radius:50%;align-items:center;justify-content:center;vertical-align:baseline;transform:translateY(.02em);margin-right:.16em}
.badge svg{width:46%;height:46%}
.swipe{position:absolute;left:0;right:0;bottom:170px;display:flex;justify-content:center;align-items:center;gap:20px;font:500 34px/1 IT;z-index:2}
.pic{position:absolute;left:0;right:0;top:0;overflow:hidden}
.pic img{width:100%;height:100%;object-fit:cover;display:block}
.veil{position:absolute;left:0;right:0;z-index:1}
.lbl{position:absolute;left:72px;margin:0;font:500 32px/1.2 IT;letter-spacing:-.005em;z-index:2}
.sub{position:absolute;left:72px;margin:0;font:400 40px/1.3 IT;letter-spacing:-0.01em;z-index:2}
.chip{position:absolute;z-index:2;font:500 30px/1 IT;padding:18px 26px;border-radius:999px}
.facts2{position:absolute;left:72px;right:72px;display:flex;gap:96px;z-index:2;border-top:2px solid currentColor;padding-top:28px}
.facts2 span{font:400 30px/1 IT;opacity:.85}.facts2 b{display:block;margin-top:12px;font:500 56px/1 IT;letter-spacing:-0.03em}
.serifc{position:absolute;left:96px;right:96px;top:420px;margin:0;text-align:center;font:400 72px/1.2 LB;letter-spacing:-0.02em;z-index:2;text-wrap:balance}
.fig{position:absolute;left:58px;margin:0;font:500 520px/.85 IT;letter-spacing:-0.07em}
.fig2{position:absolute;left:56px;margin:0;font:500 400px/.85 IT;letter-spacing:-0.065em}
.kn{display:flex;justify-content:space-between;align-items:flex-end;border-top:2px solid;padding:30px 0 26px}
.kl{font:500 34px/1.2 IT;padding-bottom:12px;letter-spacing:-0.01em}
.kv{font:500 136px/.82 IT;letter-spacing:-0.055em}
.np{display:flex;justify-content:space-between;align-items:center;padding:36px 44px;border-radius:24px}
.nv{font:500 132px/.85 IT;letter-spacing:-0.055em}
.nl{font:500 32px/1.2 IT;text-align:right;max-width:300px;letter-spacing:-0.01em}
.pt{display:flex;gap:40px;align-items:baseline;border-top:2px solid;padding:28px 0}
.pi{font:500 32px/1 IT;width:48px}
.pv{font:500 52px/1.1 IT;letter-spacing:-0.025em}
.idx{position:absolute;left:72px;margin:0;font:500 40px/1 IT}
.p{position:absolute;left:72px;right:160px;margin:0;font:400 40px/1.38 IT;letter-spacing:-0.01em}
.serifp{position:absolute;left:72px;right:96px;margin:0;font:400 74px/1.2 LB;letter-spacing:-0.02em}
.serifp i{font-style:italic}
.cols{position:absolute;left:72px;right:72px;display:grid;grid-template-columns:1fr 1.2fr;gap:56px}
.serifq{margin:0;font:400 52px/1.2 LB;letter-spacing:-0.015em}
.pc{margin:0;font:400 36px/1.42 IT;letter-spacing:-0.01em}
.facts{position:absolute;left:72px;right:72px;bottom:80px;display:grid;grid-template-columns:1fr .8fr 1.8fr;gap:32px;border-top:2px solid currentColor;padding-top:28px}
.facts span{font:500 28px/1 IT}.facts b{display:block;margin-top:14px;font:500 44px/1.05 IT;letter-spacing:-0.025em;white-space:nowrap}
.w{position:absolute;font-family:LB;line-height:1;letter-spacing:-0.035em;z-index:2;white-space:nowrap}
.c{left:0!important;right:0!important;text-align:center}
.cap{position:absolute;margin:0;font:500 30px/1 IT;letter-spacing:.02em;z-index:2}
.caps{position:absolute;margin:0;font:500 128px/.92 IT;letter-spacing:-0.035em;text-transform:uppercase;z-index:2}
.serifs{position:absolute;margin:0;font:400 54px/1.05 LB;letter-spacing:-0.03em;z-index:2}
.tag{position:absolute;z-index:2;font:600 28px/1 IT;letter-spacing:.06em;padding:14px 22px;border-radius:6px;backdrop-filter:blur(6px)}
.big{position:absolute;margin:0;font:700 186px/.85 IT;letter-spacing:-0.06em;z-index:2;white-space:nowrap}
.big sup{font-size:.36em;vertical-align:.95em;letter-spacing:-0.03em;margin-left:.06em}
.big sub{font-size:.36em;vertical-align:.02em;letter-spacing:-0.03em;margin-right:.06em}
.glass{position:absolute;z-index:2;padding:30px 32px;border-radius:12px;background:#F9EEE52e;backdrop-filter:blur(14px);color:#F9EEE5;border:1px solid #F9EEE555}
.glass b{display:block;font:600 34px/1.1 IT;letter-spacing:-.01em;padding-bottom:16px;border-bottom:1.5px solid #F9EEE577}
.glass span{display:block;font:400 28px/1.35 IT;margin-top:16px}
.card{position:absolute;left:96px;right:96px;top:96px;bottom:96px;z-index:2}
.small{position:absolute;margin:0;font:400 26px/1.4 IT}
.serifb{position:absolute;left:56px;right:56px;bottom:72px;margin:0;font:400 38px/1.25 LB;letter-spacing:-0.02em;text-align:center}
.inl{display:inline-block;vertical-align:-0.08em}
.capl{position:absolute;margin:0;font:500 38px/1.15 IT;letter-spacing:.005em;z-index:2}
.edge{position:absolute;margin:0;font:400 176px/.9 IT;letter-spacing:-0.035em;z-index:2}
.note{position:absolute;right:72px;top:150px;width:470px;margin:0;font:500 26px/1.25 IT;letter-spacing:.08em;text-align:justify;z-index:2}
'''
for k, f in [('IT400', 'it/package/files/inter-tight-latin-400-normal.woff2'), ('IT500', 'it/package/files/inter-tight-latin-500-normal.woff2'),
             ('LBN', 'lb/package/files/libre-baskerville-latin-400-normal.woff2'), ('LBI', 'lb/package/files/libre-baskerville-latin-400-italic.woff2')]:
    CSS = CSS.replace(f'"{k}"', '"' + (FONTS / f).as_uri() + '"')

OUT.mkdir(parents=True, exist_ok=True)
for old in OUT.glob('*.jpg'):
    old.unlink()
(HERE / 'slides.html').write_text(f'<!doctype html><meta charset="utf-8"><style>{CSS}</style>' + ''.join(H))
(HERE / 'shot.cjs').write_text('''
const {chromium}=require(process.env.NP+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1200}});
await p.goto(process.argv[2]);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(900);
for(const id of process.argv.slice(4)){await p.locator('#'+id).screenshot({path:process.argv[3]+'/'+id+'.png'});}
await b.close()})();
''')
subprocess.run(['node', str(HERE / 'shot.cjs'), (HERE / 'slides.html').as_uri(), str(OUT)] + S, check=True)
for n in S:
    p = OUT / f'{n}.png'
    im = Image.open(p).convert('RGB')
    im = im.resize((720, round(im.height * 720 / im.width)), Image.LANCZOS)
    im.save(OUT / f'{n}.jpg', quality=86, optimize=True, progressive=True)
    p.unlink()
print('slides', len(S))
