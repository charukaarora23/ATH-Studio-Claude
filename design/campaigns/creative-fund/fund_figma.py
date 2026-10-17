"""ATH Creative Fund launch carousel in the ATH social system, built as self-contained HTML for Figma (html_to_figma).

The system comes from the references: ATH's own bio poster (giant cropped lowercase word, one Rose scribble line,
tilted paper card with a small Chilli label, a Chilli plane at the edge, outlined pills, round arrow buttons)
and the card-led carousels (hand-drawn circle around a key word, pill stacks, big figure with a small unit, ticket, book spines).
Fonts: Faculty Glyphic (headlines), Libre Baskerville (figures, italic voice), Nord (labels, capitals only, no digits).

Usage: ATH_FONTS=<fonts folder> NP=<playwright folder> python3 design/campaigns/creative-fund/fund_figma.py
Writes figma_carousel.html (embedded fonts and images, for Figma) and figma-slides/*.jpg (previews).
"""
import os, io, base64, subprocess, pathlib
from PIL import Image, ImageOps

HERE = pathlib.Path(__file__).resolve().parent
ART = HERE / 'art'
FONTS = pathlib.Path(os.environ.get('ATH_FONTS', 'fonts')).resolve()
OUT = HERE / 'figma-slides'
BURG, NIGHT, ROSE, PEONY, CREAM, INK, CHILLI, WHITE, BLACK = '#6A0620', '#52051A', '#FFA1C2', '#FAD2E1', '#F9EEE5', '#1C1310', '#AA0003', '#FFFFFF', '#141111'


def b64(path, mime):
    return f'data:{mime};base64,' + base64.b64encode(pathlib.Path(path).read_bytes()).decode()


def art(name, w, h, pos=(.5, .5), dark=0):
    """Artwork cropped to its frame with any darkening baked in, as a data URI."""
    im = ImageOps.fit(Image.open(ART / name).convert('RGB'), (w, h), Image.LANCZOS, centering=pos)
    if dark:
        im = Image.blend(im, Image.new('RGB', im.size, 0), dark)
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=86)
    return f'<img src="data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode()}" style="width:{w}px;height:{h}px">'


ARROW = '<svg width="34" height="34" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="{c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def arrow(c):
    return ARROW.replace('{c}', c)


def btn(bg, fg, size=96, extra=''):
    """Round arrow button."""
    return f'<div class="btn" style="background:{bg};width:{size}px;height:{size}px;{extra}">{arrow(fg)}</div>'


def label(text, c, extra=''):
    return f'<p class="lab" style="color:{c};{extra}">{text}</p>'


def top(left, right, c):
    """Top bar: Nord label left, Libre page number right."""
    return f'<p class="lab" style="color:{c};left:72px;top:64px">{left}</p><p class="no" style="color:{c}">{right}</p>'


def scribble(d, c=ROSE, w=14):
    return f'<svg class="scr" width="1080" height="1350" viewBox="0 0 1080 1350"><path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def ring(w, h, c=CHILLI, extra=''):
    """Hand-drawn circle around a word: two loose overlapping passes."""
    return (f'<svg class="ring" width="{w}" height="{h}" viewBox="0 0 200 100" preserveAspectRatio="none" style="{extra}">'
            f'<path d="M150 14 C100 2 22 10 8 46 C-4 80 70 96 120 92 C176 88 198 64 192 40 C186 18 140 8 96 10" fill="none" stroke="{c}" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>')


def strike(c=CHILLI):
    return f'<svg class="strike" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 6 C25 3 55 8 100 4" fill="none" stroke="{c}" stroke-width="7" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>'


S = []


def add(name, bg, body):
    S.append(f'<section class="s" data-name="{name}" style="background:{bg}">{body}</section>')


# 01 Cover: the name is the hero, as in the bio poster
add('01 Cover', BURG, f'''
<div class="plane" style="background:{CHILLI};left:-80px;right:-80px;top:1120px;height:400px;transform:rotate(-4deg)"></div>
{scribble('M1120 380 C1020 470 900 520 860 640 C820 760 940 820 1000 740 C1060 660 960 580 880 640 C800 700 820 860 900 940 C960 1000 1040 1010 1120 1000', ROSE)}
{label('THE ATH CREATIVE', PEONY, 'left:84px;top:96px')}
<p class="giant" style="color:{PEONY};left:-34px;top:96px">fund</p>
<p class="fg" style="color:{CREAM};left:72px;top:560px;font-size:86px;line-height:1">$500 to an artist.<br>Every month.<br>No questions asked.</p>
<div class="card" style="background:{PEONY};left:60px;top:900px;width:600px;height:330px;transform:rotate(-6deg)">
  {label('ALL WE NEED', CHILLI, 'left:44px;top:46px')}
  <p class="lb it" style="color:{BURG};left:44px;top:104px;font-size:56px;line-height:1.12">One piece<br>of your work.</p>
</div>
<div class="pill fill" style="background:{PEONY};color:{BURG};right:72px;top:1200px">Swipe {arrow(BURG)}</div>
<p class="no" style="color:{PEONY}">1 / 10</p>''')

# 02 Pain: the grant-world list, struck through
pains = ['Twelve-page grant forms', 'Budgets for unmade work', 'Statements for strangers', 'Reports on every dollar', 'Months waiting for a no']
pp = ''.join(f'<p class="pain"><span class="x">{t}{strike()}</span></p>' for t in pains)
add('02 Pain', CREAM, f'''{top('SOUND FAMILIAR', '2 / 10', CHILLI)}
<div class="pains" style="color:{INK}">{pp}</div>
<p class="lb it" style="color:{BURG};left:72px;top:880px;font-size:72px">There is a simpler way.</p>
{btn(CHILLI, WHITE, 120, "right:72px;top:1130px")}''')

# 03 Conviction: the painting carries it
add('03 Conviction', NIGHT, f'''<div class="pic">{art('night-bloom.jpg', 1080, 1350, (.5, .3), .25)}</div>
{top('WHAT WE BELIEVE', '3 / 10', CREAM)}
<p class="fg c" style="color:{CREAM};top:150px;font-size:100px;line-height:1">We would rather<br><span class="it">fund the work</span></p>
<p class="fg c" style="color:{CREAM};top:400px;font-size:44px;line-height:1.2">than make artists prove<br>they deserve it.</p>
<p class="cr" style="color:{CREAM}">Artwork: Artist Name</p>''')

# 04 Offer: Chilli, the figure and the pill stack
add('04 Offer', CHILLI, f'''{top('THE FUND', '4 / 10', PEONY)}
<p class="fig" style="color:{CREAM};left:58px;top:140px;font-size:380px">$500</p>
<p class="fg" style="color:{CREAM};left:72px;top:520px;font-size:72px;line-height:1">to one artist,<br>every month.</p>
<div class="stack" style="left:72px;top:760px">
  <div class="pill line" style="color:{CREAM};border-color:{CREAM}">No proposal</div>
  <div class="pill line it" style="color:{CREAM};border-color:{CREAM}">no report</div>
  <div class="pill line" style="color:{CREAM};border-color:{CREAM}">No strings</div>
  <div class="pill fill" style="background:{PEONY};color:{BURG}">Just your work {arrow(BURG)}</div>
</div>
<div class="card" style="background:{CREAM};right:64px;top:820px;width:330px;height:300px;transform:rotate(5deg)">
  {label('SPEND IT ON', CHILLI, 'left:34px;top:38px')}
  <p class="lb it" style="color:{BURG};left:34px;top:88px;font-size:40px;line-height:1.25">paint, rent,<br>a course,<br>or a week to rest.</p>
</div>''')

# 05 Proof: 188K and the books, as spines
books = [('101 Art Book', BURG, CREAM, 400), ('Women Artists on the Rise', PEONY, BURG, 470), ('100 Emerging Artists', CHILLI, CREAM, 440), ('Art and Woman', BLACK, CREAM, 380), ('Arts to Hearts Magazine', ROSE, BURG, 460)]
sp = ''.join(f'<div class="spine" style="background:{bg};height:{h}px"><p style="color:{fg};width:{h - 60}px">{t}</p></div>' for t, bg, fg, h in books)
add('05 Proof', WHITE, f'''{top('WHY ATH', '5 / 10', CHILLI)}
<p class="fig" style="color:{BURG};left:62px;top:120px;font-size:300px">188<span style="color:{CHILLI};font-size:150px;vertical-align:top;position:relative;top:34px">K</span></p>
<p class="fg" style="color:{INK};left:72px;top:420px;font-size:56px;line-height:1.05">artists follow<br>Arts to Hearts.</p>
<p class="lb it" style="color:{BURG};left:72px;top:600px;font-size:40px;line-height:1.25">Years of putting emerging<br>artists in print.<br>Now, money in their hands.</p>
<div class="shelf" style="right:60px;bottom:120px">{sp}</div>
<div class="plane" style="background:{BURG};left:0;right:0;top:1230px;height:120px"></div>
{label('OUR BOOKS AND MAGAZINE', CREAM, 'left:72px;top:1280px')}''')

# 06 Who can apply: chips, as in the bio poster, and two works on paper cards
media = ['painting', 'illustration', 'photography', 'sculpture', 'textile', 'ceramics', 'digital', 'writing', 'printmaking', 'collage']
chips = ''.join(f'<div class="chip" style="color:{BURG};border-color:{BURG}">{m}</div>' for m in media)
add('06 Who', PEONY, f'''{top('WHO CAN APPLY', '6 / 10', CHILLI)}
<p class="fg" style="color:{BURG};left:72px;top:150px;font-size:112px;line-height:1">If you <span class="ringed">make{ring(300, 150, CHILLI, 'left:-34px;top:-10px')}</span> it,<br>you can apply.</p>
<div class="chips" style="left:72px;top:440px;width:940px">{chips}</div>
<div class="photo" style="left:90px;top:820px;transform:rotate(-5deg)">{art('flower-portrait.jpg', 300, 380, (.5, .25))}</div>
<div class="photo" style="left:420px;top:860px;transform:rotate(3deg)">{art('weave-teal.jpg', 300, 300)}</div>
<div class="photo" style="left:730px;top:810px;transform:rotate(-2deg)">{art('stripes.jpg', 260, 300)}</div>
<p class="cr" style="color:{BURG}">Artworks: Artist Name, Artist Name, Artist Name</p>''')

# 07 How: three notes, one per step
steps = [('01', 'CHOOSE', 'Pick one piece you made.', 'New or already shared.', CREAM, -2.5),
         ('02', 'POST', 'Share it on Instagram.', 'Mention @artstoheartsproject<br>and add #ATHCreativeFund.', PEONY, 1.5),
         ('03', 'APPLY', 'Comment FUND.', 'We will send you the link.', WHITE, -1.5)]
notes = ''.join(f'''<div class="note" style="background:{bg};top:{170 + i * 360}px;transform:rotate({r}deg)">
  <p class="lb it n" style="color:{CHILLI}">{n}</p>{label(k, CHILLI, 'left:200px;top:52px')}
  <p class="fg" style="color:{BURG};left:200px;top:100px;font-size:60px">{t}</p>
  <p class="fg" style="color:{INK};left:200px;top:180px;font-size:34px;line-height:1.3">{d}</p></div>''' for i, (n, k, t, d, bg, r) in enumerate(steps))
add('07 How', BURG, f'''{top('HOW TO APPLY', '7 / 10', PEONY)}{notes}''')

# 08 Reassurance: a DM thread, questions out, answers back
qa = [('Is there a fee?', 'No. It is free to enter.'), ('Who owns my work?', 'You do. Always.'), ('What do I do with the money?', 'Whatever your practice needs.'), ('Do I need a big following?', 'No. We look at the work.')]
th = ''.join(f'<div class="q" style="color:{CREAM};border-color:{CREAM}">{q}</div><div class="a" style="background:{PEONY};color:{BURG}">{a}</div>' for q, a in qa)
add('08 Catch', BLACK, f'''{top('IS THERE A CATCH', '8 / 10', ROSE)}<div class="thread">{th}</div>''')

# 09 Urgency: the entry ticket
add('09 Dates', CREAM, f'''{top('OPEN NOW', '9 / 10', CHILLI)}
<div class="ticket" style="background:{CHILLI}">
  <span class="notch" style="background:{CREAM};left:-40px"></span><span class="notch" style="background:{CREAM};right:-40px"></span>
  {label('ENTRY / ROUND ONE', PEONY, 'left:64px;top:60px')}
  <p class="fg" style="color:{CREAM};left:64px;top:130px;font-size:120px;line-height:.95">Entries close<br>15 November</p>
  <div class="perf" style="border-color:{PEONY}"></div>
  <p class="lb" style="color:{PEONY};left:64px;top:470px;font-size:40px">15 Oct to 15 Nov</p>
  <p class="lb it" style="color:{CREAM};left:64px;top:530px;font-size:40px">Free to enter</p>
</div>
<p class="lb it" style="color:{BURG};left:72px;top:1010px;font-size:60px;line-height:1.15">Then a new round,<br>every month.</p>
{btn(CHILLI, WHITE, 104, 'right:72px;top:1050px')}''')

# 10 CTA: echoes the cover
add('10 CTA', BURG, f'''
<div class="plane" style="background:{CHILLI};left:-80px;right:-80px;top:1150px;height:400px;transform:rotate(3deg)"></div>
{scribble('M-40 980 C120 900 260 960 300 1060 C340 1160 220 1220 160 1140 C100 1060 260 940 420 980 C560 1016 620 1120 760 1110', ROSE)}
{label('ONE LAST STEP', PEONY, 'left:84px;top:96px')}
<p class="giant" style="color:{PEONY};left:-30px;top:110px;font-size:400px">apply</p>
<div class="card" style="background:{PEONY};left:150px;top:520px;width:800px;height:400px;transform:rotate(-4deg)">
  {label('COMMENT', CHILLI, 'left:56px;top:56px')}
  <p class="fg" style="color:{BURG};left:52px;top:100px;font-size:190px;line-height:1">FUND</p>
  <p class="lb it" style="color:{BURG};left:56px;top:300px;font-size:44px">and we will send you the link.</p>
</div>
<div class="pill fill" style="background:{CREAM};color:{BURG};left:72px;top:1190px">Send this to an artist {arrow(BURG)}</div>
<p class="no" style="color:{PEONY}">10 / 10</p>''')

CSS = f'''
@font-face{{font-family:"Faculty Glyphic";src:url("{b64(FONTS / 'FacultyGlyphic-Regular.ttf', 'font/ttf')}")}}
@font-face{{font-family:"Libre Baskerville";font-style:normal;src:url("{b64(FONTS / 'lb/package/files/libre-baskerville-latin-400-normal.woff2', 'font/woff2')}")}}
@font-face{{font-family:"Libre Baskerville";font-style:italic;src:url("{b64(FONTS / 'lb/package/files/libre-baskerville-latin-400-italic.woff2', 'font/woff2')}")}}
@font-face{{font-family:"Nord";src:url("{b64(FONTS / 'Nord-Medium.otf', 'font/otf')}")}}
html,body{{margin:0;padding:0;background:#ddd}}
body{{display:flex;flex-wrap:wrap;gap:80px;padding:80px;width:{5 * 1080 + 4 * 80}px}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;flex:none}}
.s p{{margin:0;white-space:nowrap}}
.pic{{position:absolute;inset:0}}.pic img{{display:block}}
.lab{{position:absolute;font:400 24px/1 "Nord";letter-spacing:.16em}}
.no{{position:absolute;right:72px;top:62px;font:400 28px/1 "Libre Baskerville"}}
.fg{{position:absolute;font-family:"Faculty Glyphic";letter-spacing:-0.025em;line-height:1.05}}
.c{{left:0;right:0;text-align:center}}
.lb{{position:absolute;font-family:"Libre Baskerville";letter-spacing:-0.02em;line-height:1.15}}
.it{{font-family:"Libre Baskerville";font-style:italic}}
.giant{{position:absolute;font:400 470px/1 "Faculty Glyphic";letter-spacing:-0.05em}}
.fig{{position:absolute;font-family:"Libre Baskerville";line-height:.9;letter-spacing:-0.06em}}
.cr{{position:absolute;left:72px;bottom:56px;font:400 24px/1 "Faculty Glyphic"}}
.plane{{position:absolute}}
.scr{{position:absolute;left:0;top:0}}
.card{{position:absolute}}
.card .lab,.card .lb,.card .fg{{position:absolute}}
.btn{{position:absolute;border-radius:50%;display:flex;align-items:center;justify-content:center}}
.pill{{position:absolute;display:flex;align-items:center;gap:14px;font:400 40px/1 "Faculty Glyphic";padding:24px 40px;border-radius:999px;white-space:nowrap}}
.pill svg{{width:34px;height:34px}}
.stack{{position:absolute;display:flex;flex-direction:column;align-items:flex-start;gap:16px}}
.stack .pill{{position:static}}
.line{{border:2.5px solid;padding:21px 38px}}
.pill.it{{font-family:"Libre Baskerville";font-style:italic;font-size:38px}}
.pains{{position:absolute;left:72px;right:72px;top:170px}}
.pain{{padding:30px 0;border-top:2px solid {INK}22;font:400 70px/1.05 "Faculty Glyphic";letter-spacing:-0.025em}}
.x{{position:relative;display:inline-block}}
.strike{{position:absolute;left:-8px;right:-8px;width:calc(100% + 16px);height:16px;bottom:22px}}
.pain .x br+*{{}}
.ringed{{position:relative;display:inline-block}}
.ring{{position:absolute}}
.chips{{position:absolute;display:flex;flex-wrap:wrap;gap:16px}}
.chip{{font:400 38px/1 "Faculty Glyphic";padding:20px 34px;border:2.5px solid;border-radius:999px}}
.photo{{position:absolute;background:{WHITE};padding:14px 14px 50px}}.photo img{{display:block}}
.shelf{{position:absolute;display:flex;align-items:flex-end;gap:10px}}
.spine{{position:relative;width:86px}}
.spine p{{position:absolute;left:50%;bottom:30px;transform-origin:0 0;transform:rotate(-90deg) translateY(-50%);font:400 27px/1 "Faculty Glyphic";letter-spacing:-0.01em}}
.note{{position:absolute;left:72px;right:72px;height:300px;border-radius:8px}}
.note .n{{position:absolute;left:40px;top:50px;font-size:100px;line-height:1}}
.thread{{position:absolute;left:72px;right:72px;top:170px;display:flex;flex-direction:column;gap:22px}}
.q{{align-self:flex-start;font:400 46px/1.1 "Faculty Glyphic";padding:26px 40px;border:2.5px solid;border-radius:48px 48px 48px 10px}}
.a{{align-self:flex-end;font:italic 400 42px/1.15 "Libre Baskerville";padding:28px 40px;border-radius:48px 48px 10px 48px;margin-bottom:22px}}
.ticket{{position:absolute;left:72px;right:72px;top:170px;height:660px;border-radius:28px}}
.notch{{position:absolute;top:400px;width:80px;height:80px;border-radius:50%}}
.perf{{position:absolute;left:64px;right:64px;top:440px;border-top:3px dashed}}
'''

OUT.mkdir(exist_ok=True)
page = HERE / 'figma_carousel.html'
page.write_text(f'<!doctype html><html><head><meta charset="utf-8"><title>ATH Creative Fund carousel</title><style>{CSS}</style></head><body>' + ''.join(S) + '</body></html>')
js = HERE / 'figma_shot.cjs'
js.write_text('''const {chromium}=require(process.env.NP+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1400}});
await p.goto(process.argv[2]);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
const s=await p.$$('.s');for(let i=0;i<s.length;i++){await s[i].screenshot({path:process.argv[3]+'/'+String(i+1).padStart(2,'0')+'.png'});}
await b.close()})();''')
subprocess.run(['node', str(js), page.as_uri(), str(OUT)], check=True)
for p in sorted(OUT.glob('*.png')):
    Image.open(p).convert('RGB').save(p.with_suffix('.jpg'), quality=88)
    p.unlink()
print(len(S), round(page.stat().st_size / 1e6, 1), 'MB')
