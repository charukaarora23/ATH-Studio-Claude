"""ATH Creative Fund launch carousel in the ATH brand fonts, exported as a live-text PDF for Canva.

Fonts (the brand set): Faculty Glyphic (headlines), Libre Baskerville (figures, italic accents), Nord (small caps labels, words only).
Usage: ATH_FONTS=<fonts folder> NP=<playwright folder> python3 design/campaigns/creative-fund/fund_brand.py
Writes brand-slides/*.jpg (previews) and canva/ATH-creative-fund-carousel-editable.pdf (live text, for Canva import).
"""
import os, subprocess, pathlib, tempfile
from PIL import Image, ImageOps

HERE = pathlib.Path(__file__).resolve().parent
ART = HERE / 'art'
FONTS = pathlib.Path(os.environ.get('ATH_FONTS', 'fonts')).resolve()
OUT = HERE / 'brand-slides'
BURG, NIGHT, ROSE, PEONY, CREAM, INK = '#6A0620', '#52051A', '#FFA1C2', '#FAD2E1', '#F9EEE5', '#1C1310'
CHILLI, WHITE, BLACK = '#AA0003', '#FFFFFF', '#141111'

CHEV = '<svg viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'


TMP = pathlib.Path(tempfile.mkdtemp())


def img(name, w, h, pos=(.5, .5), dark=0):
    """Crop the artwork to the frame and bake any darkening in, so the PDF holds one plain picture per frame."""
    im = ImageOps.fit(Image.open(ART / name).convert('RGB'), (w * 2, h * 2), Image.LANCZOS, centering=pos)
    if dark:
        im = Image.blend(im, Image.new('RGB', im.size, 0), dark)
    out = TMP / f'{name[:-4]}-{w}x{h}-{int(dark * 100)}.jpg'
    im.save(out, quality=90)
    return f'<img src="{out.as_uri()}">'


def badge(bg, fg, extra=''):
    return f'<span class="badge" style="background:{bg};color:{fg};{extra}">{CHEV}</span>'


def pill(text, bg, fg, extra=''):
    return f'<div class="pill" style="{extra}"><span style="background:{bg};color:{fg}">{text}</span></div>'


def label(text, c, top=64, left=72, extra=''):
    return f'<p class="lab" style="color:{c};top:{top}px;left:{left}px;{extra}">{text}</p>'


def no(i, c):
    return f'<p class="no" style="color:{c}">{i} / 10</p>'


def credit(c):
    return f'<p class="cr" style="color:{c}">Artwork: Artist Name</p>'


S = []


def add(name, bg, body):
    S.append((name, f'<section id="{name}" class="s" style="background:{bg}">{body}</section>'))


# 1 Hook
add('01-hook', NIGHT, f'''<div class="pic" style="bottom:400px">{img('flower-portrait.jpg', 1080, 950, (.5, .25), .25)}</div>
<div class="blk" style="background:{CHILLI};top:950px"></div>
{label('ARTS TO HEARTS PROJECT', CREAM)}{no(1, CREAM)}
<p class="lb it" style="color:{CREAM};left:72px;top:140px;font-size:64px">The ATH</p>
<h1 class="fg" style="color:{CREAM};top:215px;font-size:220px;line-height:.86;letter-spacing:-0.035em">Creative<br>Fund</h1>
<p class="cr" style="color:{CREAM};bottom:430px">Artwork: Artist Name</p>
<p class="fg" style="color:{WHITE};top:1000px;font-size:84px;line-height:1">$500 to an artist.<br>No questions asked.</p>
<p class="lb it" style="color:{PEONY};left:72px;top:1205px;font-size:44px">Every month. Swipe to apply.</p>
{badge(CREAM, CHILLI, 'left:auto;right:72px;top:1180px;width:96px;height:96px')}''')

# 2 Pain
pains = ['Twelve-page grant forms.', 'Budgets for work you<br>have not made yet.', 'Artist statements<br>written for strangers.', 'Months of waiting for a no.']
pp = ''.join(f'<p>{t}</p>' for t in pains)
add('02-pain', WHITE, f'''{label('SOUND FAMILIAR', CHILLI)}{no(2, CHILLI)}<div class="pains" style="color:{INK}">{pp}</div><p class="lb it" style="color:{CHILLI};left:72px;top:1120px;font-size:60px">There is a simpler way.</p>''')

# 3 Conviction (kept)
add('03-conviction', NIGHT, f'''<div class="pic">{img('night-bloom.jpg', 1080, 1350, (.5, .3), .2)}</div>
{no(3, CREAM)}
<h2 class="fg c" style="color:{CREAM};top:140px;font-size:96px;line-height:1">We would rather<br><span class="it-lb">fund the work</span></h2>
<p class="fg c" style="color:{CREAM};top:390px;font-size:42px;line-height:1.2">than make artists prove<br>they deserve it.</p>{credit(CREAM)}''')

# 4 The offer
rows = ''.join(f'<div class="row"><span class="nord">{a}</span><span class="lb it">{b}</span></div>' for a, b in [('NO PROPOSAL', 'Just your work.'), ('NO REPORT', 'Spend it as you need.'), ('NO STRINGS', 'It is yours.')])
add('04-offer', CHILLI, f'''{label('THE FUND', PEONY)}{no(4, PEONY)}
<p class="fig" style="color:{CREAM}">$500</p>
<p class="fg" style="color:{CREAM};top:520px;font-size:72px;left:72px">to one artist,<br>every month.</p>
<div class="rows" style="color:{CREAM}">{rows}</div>
<p class="fg" style="color:{PEONY};top:1150px;font-size:40px;left:72px;right:72px">Paint, rent, a course, or a week to rest.<br>You decide.</p>''')

# 5 Social proof
books = ['101 Art Book', 'Women Artists on the Rise', '100 Emerging Artists', 'Art and Woman', 'Arts to Hearts Magazine']
bb = ''.join(f'<span>{b}</span>' for b in books)
add('05-proof', CREAM, f'''{label('WHY ATH', BURG)}{no(5, BURG)}
<p class="fig" style="color:{BURG};top:140px;font-size:230px">188,000</p>
<p class="fg" style="color:{INK};top:400px;font-size:64px;left:72px;right:72px">artists follow Arts to Hearts.</p>
<p class="fg" style="color:{INK};top:600px;font-size:38px;left:72px;right:72px;line-height:1.3">For years we have put emerging artists<br>in print, in our books and magazine.</p>
<div class="books" style="color:{BURG}">{bb}</div>
<p class="lb it" style="color:{BURG};left:72px;top:1130px;font-size:58px">Now we are putting money<br>in their hands.</p>''')

# 6 Who can apply
grid = ''.join(f'<div>{img(f, 462, 304, p)}</div>' for f, p in [('flower-portrait.jpg', (.5, .28)), ('weave-teal.jpg', (.5, .5)), ('stripes.jpg', (.5, .5)), ('night-bloom.jpg', (.5, .35))])
add('06-who', WHITE, f'''<div class="g4">{grid}</div>{no(6, BURG)}
<h2 class="fg" style="color:{BURG};top:790px;font-size:96px">If you make it,<br>you can apply.</h2>
<p class="nord-list" style="color:{CHILLI}">PAINTING / ILLUSTRATION / PHOTOGRAPHY<br>SCULPTURE / TEXTILE / CERAMICS<br>DIGITAL / WRITING</p>
<p class="cr" style="color:{INK}">Artworks: Artist Name, Artist Name, Artist Name, Artist Name</p>''')

# 7 How it works
steps = [('Choose one piece<br>you made.', 'New or already shared.'), ('Post it on Instagram.', 'Mention @artstoheartsproject<br>and add #ATHCreativeFund.'), ('Comment FUND.', 'We will send you the link to apply.')]
ss = ''.join(f'<div class="st"><span class="lb it n" style="color:{CHILLI}">{i + 1}</span><div><p class="fg t">{a}</p><p class="fg d">{b}</p></div></div>' for i, (a, b) in enumerate(steps))
add('07-how', CREAM, f'''{label('HOW IT WORKS', BURG)}{no(7, BURG)}<div class="steps" style="color:{BURG}">{ss}</div>''')

# 8 Reassurance
qa = ''.join(f'<div class="qa"><p class="fg q">{q}</p><p class="lb it a">{a}</p></div>' for q, a in [('Is there a fee?', 'No. It is free to enter.'), ('Who owns my work?', 'You do. Always.'), ('What do I have to do<br>with the money?', 'Whatever your practice needs.')])
add('08-catch', BLACK, f'''{label('IS THERE A CATCH', ROSE)}{no(8, ROSE)}<div class="qas" style="color:{CREAM}">{qa}</div>''')

# 9 Urgency
add('09-dates', BURG, f'''{label('OPEN NOW', PEONY)}{no(9, PEONY)}
<h2 class="fg" style="color:{CREAM};top:150px;font-size:150px;line-height:.95">Entries close<br>15 November.</h2>
<p class="lb it" style="color:{PEONY};left:72px;top:720px;font-size:60px">Then a new round, every month.</p>
<p class="fg" style="color:{CREAM};left:72px;top:1120px;font-size:56px">Comment FUND to apply.</p>''')

# 10 Call to action
add('10-cta', CREAM, f'''<div class="pic" style="top:auto;bottom:0;height:420px">{img('stripes.jpg', 1080, 420)}</div>{no(10, BURG)}
{label('ONE LAST STEP', BURG)}
<h2 class="fg" style="color:{BURG};top:150px;font-size:170px;line-height:.95">Comment<br>FUND</h2>{badge(CHILLI, WHITE)}
<p class="fg" style="color:{INK};top:520px;font-size:56px">and we will send you the link.</p>
<p class="lb it" style="color:{BURG};left:72px;top:660px;font-size:54px">Know an artist who needs this?<br>Send it to them.</p>
<p class="cr" style="color:{INK};bottom:440px">Artwork: Artist Name</p>''')

CSS = f'''
@font-face{{font-family:"Faculty Glyphic";src:url("{(FONTS/'FacultyGlyphic-Regular.ttf').as_uri()}")}}
@font-face{{font-family:"Libre Baskerville";font-style:normal;src:url("{(FONTS/'lb/package/files/libre-baskerville-latin-400-normal.woff2').as_uri()}")}}
@font-face{{font-family:"Libre Baskerville";font-style:italic;src:url("{(FONTS/'lb/package/files/libre-baskerville-latin-400-italic.woff2').as_uri()}")}}
@font-face{{font-family:"Nord";src:url("{(FONTS/'Nord-Medium.otf').as_uri()}")}}
@page{{size:1080px 1350px;margin:0}}
html,body{{margin:0;padding:0}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;page-break-after:always;-webkit-font-smoothing:antialiased}}
.pic{{position:absolute;inset:0;overflow:hidden}}
.blk{{position:absolute;left:0;right:0;bottom:0}}.pic img{{width:100%;height:100%;object-fit:cover;display:block}}
.fg{{position:absolute;margin:0;font-family:"Faculty Glyphic";font-weight:400;letter-spacing:-0.02em;line-height:1.02;white-space:nowrap;left:72px;right:72px}}
.c{{text-align:center;left:60px!important;right:60px!important}}
.lb{{position:absolute;margin:0;font-family:"Libre Baskerville";letter-spacing:-0.02em;line-height:1.15;white-space:nowrap}}
.it,.it-lb{{font-family:"Libre Baskerville";font-style:italic}}
.lab{{position:absolute;margin:0;font:400 26px/1 "Nord";letter-spacing:.16em}}
.no{{position:absolute;right:72px;top:64px;margin:0;font:400 28px/1 "Libre Baskerville"}}
.cr{{position:absolute;left:72px;bottom:56px;margin:0;font:400 24px/1 "Faculty Glyphic";opacity:.9}}
.badge{{position:absolute;left:560px;top:345px;display:flex;width:130px;height:130px;border-radius:50%;align-items:center;justify-content:center}}
.badge svg{{width:46%;height:46%}}
.pill{{position:absolute;left:72px;bottom:96px}}
.pill span{{display:inline-block;font:400 40px/1 "Faculty Glyphic";padding:24px 44px;border-radius:999px}}
.pains{{position:absolute;left:72px;right:72px;top:170px}}
.pains p{{margin:0;padding:36px 0;border-top:2px solid {BURG}33;font:400 72px/1.05 "Faculty Glyphic";letter-spacing:-0.025em;white-space:nowrap}}
.fig{{position:absolute;left:66px;top:120px;margin:0;font:400 360px/.9 "Libre Baskerville";letter-spacing:-0.06em}}
.rows{{position:absolute;left:72px;right:72px;top:700px}}
.row{{display:flex;justify-content:space-between;align-items:baseline;padding:30px 0;border-top:2px solid {PEONY}55}}
.nord{{font:400 32px/1 "Nord";letter-spacing:.16em}}
.row .lb{{position:static;font-size:44px}}
.books{{position:absolute;left:72px;right:72px;top:760px;display:flex;flex-wrap:wrap;gap:14px}}
.books span{{font:italic 400 30px/1 "Libre Baskerville";padding:16px 24px;border:2px solid currentColor;border-radius:999px}}
.g4{{position:absolute;left:72px;right:72px;top:130px;height:620px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:12px}}
.g4 div{{overflow:hidden}}.g4 img{{width:100%;height:100%;object-fit:cover;display:block}}
.nord-list{{position:absolute;left:72px;right:72px;top:1060px;margin:0;font:400 26px/1.9 "Nord";white-space:nowrap;letter-spacing:.14em}}
.steps{{position:absolute;left:72px;right:72px;top:170px;display:grid;gap:0}}
.st{{display:grid;grid-template-columns:150px 1fr;gap:20px;padding:44px 0;border-top:2px solid {BURG}33}}
.st .n{{position:static;font-size:150px;line-height:.8}}
.st .t{{position:static;font-size:66px;margin:0}}
.st .d{{position:static;font-size:36px;line-height:1.3;color:{INK};margin:16px 0 0}}
.qas{{position:absolute;left:72px;right:72px;top:170px}}
.qa{{padding:48px 0;border-top:2px solid {PEONY}44}}
.qa .q{{position:static;font-size:64px;margin:0}}
.qa .a{{position:static;font-size:52px;color:{ROSE};margin:18px 0 0}}
'''

OUT.mkdir(exist_ok=True)
for f in OUT.glob('*.jpg'):
    f.unlink()
page = HERE / 'carousel_brand.html'
page.write_text(f'<!doctype html><meta charset="utf-8"><style>{CSS}</style>' + ''.join(b for _, b in S))
(HERE / 'canva').mkdir(exist_ok=True)
js = HERE / 'brand_shot.cjs'
js.write_text('''const {chromium}=require(process.env.NP+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350}});
await p.goto(process.argv[2]);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(900);
for(const id of process.argv.slice(5)){await p.locator('[id="'+id+'"]').screenshot({path:process.argv[3]+'/'+id+'.png'});}
await p.pdf({path:process.argv[4],width:'1080px',height:'1350px',printBackground:true,margin:{top:0,right:0,bottom:0,left:0}});
await b.close()})();''')
subprocess.run(['node', str(js), page.as_uri(), str(OUT), str(HERE / 'canva' / 'ATH-creative-fund-carousel-editable.pdf')] + [n for n, _ in S], check=True)
for n, _ in S:
    p = OUT / f'{n}.png'
    Image.open(p).convert('RGB').save(OUT / f'{n}.jpg', quality=90)
    p.unlink()
print(len(S))
