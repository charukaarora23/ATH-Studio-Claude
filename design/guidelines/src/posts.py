"""Render the example posts and print pieces used in the guides.

Usage: ATH_FONTS=<folder with FacultyGlyphic-Regular.ttf, Nord-Regular.otf, Nord-Medium.otf>
       python3 src/posts.py            (run from design/guidelines)
Writes src/posts.html, then img/*.png via Playwright (NP = folder holding the playwright package).
Fonts are not stored in the repo: Nord is licensed.
"""
import os, re, subprocess, pathlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
LOGO = ROOT.parent / 'logo' / 'svg'
FONTS = pathlib.Path(os.environ.get('ATH_FONTS', 'fonts')).resolve()

NIGHT, ROSE = '#52051A', '#FFA1C2'
BURG, CHILLI, PEONY, BALLET, CREAM, INK = '#6A0620', '#AA0003', '#FAD2E1', '#FFD6DE', '#F9EEE5', '#1C1310'


def logo(src, pad):
    """Return (tight viewBox, path markup) for a logo file, with its clear-space padding removed."""
    s = (LOGO / src).read_text()
    x, y, w, h = map(float, re.search(r'viewBox="([^"]+)"', s).group(1).split())
    inner = re.search(r'<g fill="[^"]+">(.*?)</g>', s, re.S).group(1)
    return f'{x+pad:.2f} {y+pad:.2f} {w-2*pad:.2f} {h-2*pad:.2f}', inner


L = {
    'name': logo('master/logo-master_burgundy.svg', 78),
    'full': logo('logo_burgundy.svg', 78),
    'mono': logo('monogram_burgundy.svg', 32),
    'bookshop': logo('descriptor/logo-bookshop_burgundy-on-cream.svg', 78),
}


def mark(key, color, width, extra=''):
    vb, inner = L[key]
    return f'<svg class="mark" style="width:{width}px;{extra}" viewBox="{vb}" fill="{color}" aria-hidden="true">{inner}</svg>'


CHEV_R = '<svg viewBox="0 0 24 24" width="40%" height="40%"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CHEV_L = '<svg viewBox="0 0 24 24" width="40%" height="40%"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def badge(bg, fg, size=150):
    return f'<span class="badge" style="width:{size}px;height:{size}px;background:{bg};color:{fg}">{CHEV_R}</span>'


def pill(text, bg, fg, ring, left_arrow=True):
    a = f'<span class="pc" style="border-color:{ring};color:{ring}">{CHEV_L}</span>' if left_arrow else ''
    return f'<span class="pill">{a}<span class="pt" style="background:{bg};color:{fg}">{text}</span></span>'


BOARDS = []


def board(name, w, h, bg, body):
    BOARDS.append((name, w, h))
    return f'<section id="{name}" class="ab" style="width:{w}px;height:{h}px;background:{bg}">{body}</section>'


html = []
# 1  Carousel cover: the reference look
html.append(board('post-hook', 1080, 1350, NIGHT, f'''
<h1 class="hl" style="color:{ROSE};font-size:128px">{badge(ROSE, NIGHT, 128)} What makes an open call worth entering?</h1>
<div class="foot c">{pill('Swipe to find out', ROSE, NIGHT, ROSE)}</div>'''))

# 2  Carousel inside slide
html.append(board('post-slide', 1080, 1350, NIGHT, f'''
<p class="lab" style="color:{ROSE}"><span class="num">1 / 5</span> · How to choose</p>
<h2 class="hl" style="color:{ROSE};font-size:112px;margin-top:64px">A real fee, a real deadline, and a book that gets&nbsp;printed.</h2>
<p class="body" style="color:{PEONY}">Check who reads the work, what you receive if you are selected, and when the book ships.</p>
<div class="foot r">{pill('Next', ROSE, NIGHT, ROSE, False)}</div>'''))

# 3  Open call announcement
html.append(board('post-open-call', 1080, 1350, NIGHT, f'''
<p class="lab" style="color:{ROSE}">Open call</p>
<h2 class="hl" style="color:{ROSE};font-size:150px;margin-top:56px">101 Art Book: Faces</h2>
<p class="body" style="color:{PEONY}">Selected artists are printed in the book and featured on our channels.</p>
<div class="foot sb">{mark('full', ROSE, 330)}{pill('Deadline 30 November', ROSE, NIGHT, ROSE, False)}</div>'''))

# 4  Quote card, inverted
html.append(board('post-quote', 1080, 1350, ROSE, f'''
<div class="qm" style="color:{NIGHT}">“</div>
<h2 class="hl" style="color:{NIGHT};font-size:104px;margin-top:0">Seeing my painting on a real page made it feel finished.</h2>
<p class="lab" style="color:{NIGHT};margin-top:72px">Artist Name</p>
<p class="body" style="color:{NIGHT};margin-top:12px;font-size:34px">Featured in 101 Art Book: Dog</p>
<div class="foot r">{mark('mono', NIGHT, 120)}</div>'''))

# 5  Artist feature on cream
html.append(board('post-artist', 1080, 1350, CREAM, f'''
<p class="lab" style="color:{BURG}">Featured artist</p>
<div class="art" style="background:{PEONY};color:{BURG}"><span>The artwork, in full colour and uncropped</span></div>
<h2 class="hl" style="color:{BURG};font-size:96px;margin-top:48px">Artist Name</h2>
<p class="body" style="color:{INK};margin-top:16px;font-size:34px">Title of the work, 2026 · Oil on linen · 60 × 80 cm</p>
<div class="foot r">{mark('name', BURG, 280)}</div>'''))

# 6  Bookshop drop on chilli
html.append(board('post-bookshop', 1080, 1350, CHILLI, f'''
<p class="lab" style="color:{BALLET}">New on the shelf</p>
<h2 class="hl" style="color:{BALLET};font-size:140px;margin-top:56px">The Big Book of Dog Artists</h2>
<div class="foot sb">{mark('bookshop', BALLET, 330)}{pill('Shop the book', BALLET, CHILLI, BALLET, False)}</div>'''))

# 7  Story
html.append(board('story-event', 1080, 1920, NIGHT, f'''
<div style="height:170px"></div>
<p class="lab" style="color:{ROSE}">Reading · ATH Bookshop</p>
<h2 class="hl" style="color:{ROSE};font-size:160px;margin-top:56px">Artists read their&nbsp;pages</h2>
<p class="body" style="color:{PEONY}">Thursday 6 November · 7 pm GMT · Online</p>
<div class="foot sb" style="bottom:340px">{mark('full', ROSE, 330)}{pill('Save a seat', ROSE, NIGHT, ROSE, False)}</div>'''))

# 8  Poster, A3 at 4 px per mm
html.append(board('print-poster-a3', 1188, 1680, NIGHT, f'''
<div style="padding:12px 0 0">{mark('full', ROSE, 420)}</div>
<div style="margin-top:130px">{badge(ROSE, NIGHT, 150)}</div>
<h1 class="hl" style="color:{ROSE};font-size:250px;margin-top:40px">Open call</h1>
<h2 class="hl" style="color:{PEONY};font-size:118px;margin-top:24px">101 Art Book: Faces</h2>
<div class="facts" style="color:{ROSE}"><div><span class="lab">Deadline</span><b>30 November</b></div><div><span class="lab">Entry</span><b>From $35</b></div><div><span class="lab">Apply</span><b>artstoheartsproject.com</b></div></div>'''))

# 9  Postcard A6 landscape, cream side
html.append(board('print-postcard-a6', 1480, 1050, CREAM, f'''
<h2 class="hl" style="color:{BURG};font-size:132px;margin-top:40px;max-width:1080px">Thank you for being in the book.</h2>
<div class="foot sb">{mark('full', BURG, 420)}<p class="lab" style="color:{BURG}">artstoheartsproject.com</p></div>'''))

# 10  Highlight covers and avatar
covers = ''.join(f'<div class="hc" style="background:{bg}"><span class="lab" style="color:{fg}">{t}</span></div>' for t, bg, fg in [('Calls', NIGHT, ROSE), ('Books', CHILLI, BALLET), ('Artists', ROSE, NIGHT), ('Shop', CREAM, BURG)])
html.append(board('profile-set', 1500, 520, '#FDF8F3', f'''
<div class="prof"><div class="av" style="background:{NIGHT}">{mark('mono', ROSE, 190)}</div>{covers}</div>'''))

# 11  Type specimen: the three social faces, set by the real fonts
html.append(board('type-specimen', 1500, 760, NIGHT, f'''
<div class="spec">
<div><p class="lab" style="color:{PEONY};font-size:22px">Headlines · Faculty Glyphic</p><p class="hl" style="color:{ROSE};font-size:104px;margin-top:20px;white-space:nowrap">Aa Bb 101</p><p class="hl" style="color:{ROSE};font-size:46px;margin-top:16px">Sentence case, tight, left aligned.</p></div>
<div><p class="lab" style="color:{PEONY};font-size:22px">Labels · Nord</p><p style="font-family:NordM;color:{ROSE};font-size:48px;letter-spacing:0.16em;margin:52px 0 0;white-space:nowrap">OPEN CALL</p><p style="font-family:Nord;color:{ROSE};font-size:24px;letter-spacing:0.16em;margin:60px 0 0">CAPITALS ONLY, TRACKED</p></div>
<div><p class="lab" style="color:{PEONY};font-size:22px">Details · Inter</p><p style="font-family:Inter;font-weight:500;color:{ROSE};font-size:104px;margin:20px 0 0;letter-spacing:-0.02em;white-space:nowrap">30 Nov</p><p style="font-family:Inter;color:{PEONY};font-size:34px;margin:16px 0 0;line-height:1.35">Dates, prices, credits, captions and every number.</p></div>
</div>'''))

FONTFACE = f'''
@font-face{{font-family:Faculty;src:url("{(FONTS/'FacultyGlyphic-Regular.ttf').as_uri()}")}}
@font-face{{font-family:Nord;src:url("{(FONTS/'Nord-Regular.otf').as_uri()}")}}
@font-face{{font-family:NordM;src:url("{(FONTS/'Nord-Medium.otf').as_uri()}")}}
'''
CSS = FONTFACE + '''
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap");
body{margin:0;background:#888;display:flex;flex-wrap:wrap;gap:40px;padding:40px}
.ab{position:relative;box-sizing:border-box;padding:110px 96px;overflow:hidden;font-family:Inter,sans-serif}
.hl{font-family:Faculty;font-weight:400;line-height:1.0;letter-spacing:-0.02em;margin:0;text-wrap:balance}
.badge{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;vertical-align:0.02em;margin-right:0.12em;transform:translateY(-0.06em)}
.lab{font-family:NordM;font-size:30px;letter-spacing:0.16em;text-transform:uppercase;margin:0}
.body{font-family:Inter;font-size:40px;line-height:1.35;margin:48px 0 0;max-width:820px}
.foot{position:absolute;left:96px;right:96px;bottom:110px;display:flex;align-items:center}
.foot.c{justify-content:center}.foot.r{justify-content:flex-end}.foot.sb{justify-content:space-between}
.pill{display:inline-flex;align-items:center}
.pc{width:96px;height:96px;border:2px solid;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-right:-14px;position:relative;z-index:1}
.pt{font-family:Inter;font-weight:500;font-size:40px;padding:22px 44px;border-radius:999px;white-space:nowrap}
.qm{font-family:Faculty;font-size:240px;line-height:1;height:150px}
.num{font-family:Inter;font-weight:500;letter-spacing:0.04em}
.art{margin-top:48px;height:640px;border-radius:4px;display:flex;align-items:flex-end;padding:32px;box-sizing:border-box;font-size:28px}
.facts{position:absolute;left:96px;right:96px;bottom:110px;display:grid;grid-template-columns:1.15fr .85fr 2fr;gap:32px;border-top:2px solid currentColor;padding-top:36px}
.facts b{display:block;font-family:Faculty;font-weight:400;font-size:40px;margin-top:14px;white-space:nowrap;letter-spacing:-0.01em}
.facts .lab{font-size:24px}
.ab#profile-set{padding:80px}
.prof{display:flex;gap:56px;align-items:center}
.av{width:340px;height:340px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.hc{width:220px;height:220px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 2px rgba(28,19,16,.08)}
.hc .lab{font-size:26px}
.ab#type-specimen{padding:80px}
.spec{display:grid;grid-template-columns:1.15fr 1fr 1fr;gap:56px}
.spec>div{border-top:2px solid rgba(255,161,194,.4);padding-top:28px}
'''

page = f'<!doctype html><meta charset="utf-8"><style>{CSS}</style>' + ''.join(html)
(HERE / 'posts.html').write_text(page)

SHOT = '''
const {chromium}=require(process.env.NP+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1200}});
await p.goto(process.argv[2]);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
for(const id of process.argv.slice(4)){await p.locator('#'+id).screenshot({path:process.argv[3]+'/'+id+'.png'});}
await b.close()})();
'''
(HERE / 'shot.cjs').write_text(SHOT)
out = ROOT / 'img'
out.mkdir(exist_ok=True)
subprocess.run(['node', str(HERE / 'shot.cjs'), (HERE / 'posts.html').as_uri(), str(out)] + [b[0] for b in BOARDS], check=True)

# Downscale for the web pages; keep the guides light
from PIL import Image
for name, w, h in BOARDS:
    p = out / f'{name}.png'
    im = Image.open(p).convert('RGB')
    tw = 720 if w <= 1188 else 960
    im = im.resize((tw, round(h * tw / w)), Image.LANCZOS)
    im.quantize(colors=96, method=Image.MEDIANCUT, dither=Image.NONE).save(p, optimize=True)
print('rendered', len(BOARDS))
