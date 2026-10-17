"""Creative Fund launch v2 (the Figma 'Launch v2' page) as a live-text PDF for Canva import.

Same layouts, copy and colours as Figma. Fonts: Faculty Glyphic, Libre Baskerville (regular + italic).
Labels use Faculty Glyphic capitals, as the Figma Label style does until Nord is installed.
Images are pre-cropped and pre-shaded (Canva turns CSS opacity overlays into solid shapes).

Usage: ATH_FONTS=<fonts folder> NP=<playwright folder> python3 design/campaigns/creative-fund/fund_canva_v2.py
Writes canva-v2/*.jpg (previews) and canva/ATH-creative-fund-v2-editable.pdf.
"""
import os, subprocess, pathlib
from PIL import Image, ImageOps

HERE = pathlib.Path(__file__).resolve().parent
ART = HERE / 'art'
FONTS = pathlib.Path(os.environ.get('ATH_FONTS', 'fonts')).resolve()
OUT = HERE / 'canva-v2'
TMP = OUT / 'src'
TMP.mkdir(parents=True, exist_ok=True)
C = dict(Burgundy='#6A0620', Night='#52051A', Rose='#FFA1C2', Peony='#FAD2E1', Cream='#F9EEE5', Ink='#1C1310', Chilli='#AA0003', White='#FFFFFF', Black='#141111')


def art(name, w, h, pos=(.5, .5), dark=0):
    im = ImageOps.fit(Image.open(ART / name).convert('RGB'), (w * 2, h * 2), Image.LANCZOS, centering=pos)
    if dark:
        im = Image.blend(im, Image.new('RGB', im.size, 0), dark)
    p = TMP / f'{name[:-4]}-{w}x{h}-{int(dark * 100)}.jpg'
    im.save(p, quality=88)
    return f'<img src="{p.as_uri()}" style="left:0;top:0;width:{w}px;height:{h}px">'


def t(text, cls, col, x, y, extra=''):
    return f'<p class="{cls}" style="color:{C[col]};left:{x}px;top:{y}px;{extra}">{text}</p>'


def rule(y, col, op):
    # flat colour mixed with the background is done by the caller via `col`; op kept for readability
    return f'<div class="rule" style="top:{y}px;background:{col}"></div>'


def mix(a, b, k):
    """Colour a at strength k over background b, as a solid hex (no opacity in the PDF)."""
    a, b = [tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) for h in (C[a], C[b])]
    return '#' + ''.join(f'{round(x * k + y * (1 - k)):02X}' for x, y in zip(a, b))


def top(label, no, col):
    return t(label, 'lab', col, 96, 80) + f'<p class="no" style="color:{C[col]}">{no}</p>'


CHEV = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M10 7l5 5-5 5" fill="none" stroke="{c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def swipe(label, ring, fill, fg):
    return (f'<div class="swipe"><span class="ring" style="border-color:{C[ring]}">{CHEV.replace("{c}", C[ring])}</span>'
            f'<span class="pill" style="background:{C[fill]};color:{C[fg]}">{label}</span></div>')


S = []


def add(bg, body):
    S.append(f'<section class="s" style="background:{C[bg]}">{body}</section>')


# 01 Cover
add('Burgundy', top('Arts to Hearts Project', 'No. 01', 'Peony') + rule(140, mix('Peony', 'Burgundy', .35), 0)
    + t('The ATH', 'fg', 'Cream', 96, 250, 'font-size:64px')
    + t('Creative<br>Fund', 'it', 'Cream', 88, 330, 'font-size:220px;line-height:.96;letter-spacing:-0.03em')
    + f'<div class="seal" style="left:690px;top:700px;width:300px;height:300px;background:{C["Chilli"]}">'
      f'<p class="lb" style="color:{C["Cream"]};top:78px;font-size:104px">$500</p>'
      f'<p class="lab c" style="color:{C["Peony"]};top:200px">Every month</p></div>'
    + rule(1080, mix('Peony', 'Burgundy', .35), 0)
    + t('One artist. Every month.<br>No questions asked.', 'fg', 'Cream', 96, 1130, 'font-size:40px;line-height:1.25')
    + swipe('Swipe', 'Peony', 'Peony', 'Burgundy'))

# 02 The difference
add('Cream', top('The difference', '2 / 10', 'Chilli')
    + t('No proposal.<br>No report.<br>No questions<br>asked.', 'fg', 'Burgundy', 96, 220, 'font-size:118px;line-height:.98;letter-spacing:-0.03em')
    + rule(860, mix('Burgundy', 'Cream', .2), 0)
    + t('Most grants make artists prove<br>they deserve it. We fund the work.', 'it', 'Ink', 96, 900, 'font-size:44px;line-height:1.2')
    + swipe('Swipe', 'Burgundy', 'Burgundy', 'Cream'))

# 03 Conviction
add('Night', f'<div class="pic">{art("night-bloom.jpg", 1080, 1350, (.5, .3), .22)}</div>' + top('What we believe', '3 / 10', 'Cream')
    + f'<p class="fg c" style="color:{C["Cream"]};top:170px;font-size:100px;line-height:1">We would rather<br><span class="iti">fund the work</span></p>'
    + f'<p class="fg c" style="color:{C["Cream"]};top:410px;font-size:40px">than make artists prove they deserve it.</p>'
    + t('Artwork: Artist Name', 'cr', 'Cream', 96, 1254))

# 04 Offer
add('White', top('The fund', '4 / 10', 'Chilli')
    + t('$500', 'lb', 'Chilli', 84, 170, 'font-size:380px;line-height:.9;letter-spacing:-0.06em')
    + t('to one artist,<br>every month.', 'fg', 'Burgundy', 96, 560, 'font-size:76px;line-height:1')
    + rule(820, mix('Burgundy', 'White', .15), 0)
    + t('Spend it on', 'lab', 'Chilli', 96, 860)
    + t('Paint. Rent. A course.<br>Or simply time to make.', 'it', 'Burgundy', 96, 910, 'font-size:56px;line-height:1.12')
    + swipe('Swipe', 'Burgundy', 'Burgundy', 'Cream'))

# 05 Who
add('Black', f'<div class="pic" style="height:430px">{art("weave-teal.jpg", 1080, 430)}</div>'
    + f'<p class="no chip" style="color:{C["Cream"]};background:{C["Black"]}">5 / 10</p>'
    + t('Who can apply', 'lab', 'Rose', 96, 500)
    + t('You do not need a degree,<br>a gallery or a following.', 'fg', 'Cream', 96, 550, 'font-size:70px;line-height:1.04')
    + t('Just work you made, in any medium.', 'it', 'Peony', 96, 760, 'font-size:44px')
    + t('Painting / Ceramics / Photography / Textile<br>Illustration / Sculpture / Writing / Digital', 'lab', 'Cream', 96, 880, 'line-height:1.9')
    + t('Artwork: Artist Name', 'cr', 'Cream', 96, 1254)
    + swipe('Swipe', 'Peony', 'Peony', 'Burgundy'))

# 06 Proof
rows = ''
y = 620
for k, v in [('In print', '101 Art Book, Women Artists on the Rise,<br>100 Emerging Artists, Art and Woman.'), ('Every issue', 'Arts to Hearts Magazine, made with<br>emerging artists.')]:
    rows += rule(y, mix('Burgundy', 'Peony', .2), 0) + t(k, 'lab', 'Chilli', 96, y + 36) + t(v, 'fg', 'Ink', 380, y + 28, 'font-size:32px;line-height:1.3')
    y += 170
add('Peony', top('Why ATH', '6 / 10', 'Chilli')
    + t('188', 'lb', 'Burgundy', 84, 160, 'font-size:300px;line-height:.9;letter-spacing:-0.06em')
    + t('K', 'lb', 'Chilli', 545, 190, 'font-size:150px;line-height:.9')
    + t('artists follow Arts to Hearts.', 'fg', 'Burgundy', 96, 470, 'font-size:56px')
    + rows + rule(y, mix('Burgundy', 'Peony', .2), 0)
    + t('Now, $500 in their hands.', 'it', 'Burgundy', 96, y + 56, 'font-size:56px')
    + swipe('Swipe', 'Burgundy', 'Burgundy', 'Cream'))

# 07 How
steps = ''
y = 200
for i, (a, b, ah) in enumerate([('Choose one piece<br>you made.', 'New or already shared.', 134), ('Post it on Instagram.', 'Mention @artstoheartsproject<br>and add #ATHCreativeFund.', 67), ('Comment FUND.', 'We will send you the link to apply.', 67)], 1):
    steps += (f'<div class="num" style="left:96px;top:{y + 6}px;background:{C["Chilli"]};color:{C["Cream"]}">{i}</div>'
              + t(a, 'fg', 'Cream', 190, y, 'font-size:64px;line-height:1.05') + t(b, 'fg', 'Peony', 190, y + ah + 16, 'font-size:32px;line-height:1.3'))
    y += ah + 170
add('Burgundy', top('How to apply', '7 / 10', 'Peony') + steps + swipe('Swipe', 'Peony', 'Peony', 'Burgundy'))

# 08 Dates
add('Chilli', top('Open now', '8 / 10', 'Peony')
    + t('15 October<br>to 15 November', 'fg', 'Cream', 96, 220, 'font-size:120px;line-height:.98;letter-spacing:-0.03em')
    + rule(560, mix('Peony', 'Chilli', .4), 0)
    + t('Then a new round, every month.', 'it', 'Peony', 96, 600, 'font-size:56px')
    + swipe('Swipe', 'Cream', 'Cream', 'Chilli'))

# 09 Checklist
TICK = f'<svg width="26" height="26" viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
items = ''
y = 330
for s in ['One piece you made', 'Posted publicly on Instagram', '@artstoheartsproject in the caption', '#ATHCreativeFund', 'Following @artstoheartsproject', 'Commented FUND and applied']:
    items += rule(y, mix('Burgundy', 'White', .12), 0) + f'<div class="tick" style="left:96px;top:{y + 30}px;background:{C["Chilli"]}">{TICK}</div>' + t(s, 'fg', 'Ink', 170, y + 32, 'font-size:42px')
    y += 110
add('White', top('Before you apply', '9 / 10', 'Chilli')
    + t('Save this checklist.', 'fg', 'Burgundy', 96, 170, 'font-size:76px')
    + items + rule(y, mix('Burgundy', 'White', .12), 0)
    + swipe('Swipe', 'Burgundy', 'Burgundy', 'Cream'))

# 10 CTA
add('Burgundy', top('Pass it on', '10 / 10', 'Peony')
    + t('Send this to<br>an artist who<br>needs $500.', 'it', 'Cream', 90, 200, 'font-size:118px;line-height:1;letter-spacing:-0.02em')
    + rule(820, mix('Peony', 'Burgundy', .35), 0)
    + t('Comment FUND and we will<br>send you the link to apply.', 'fg', 'Peony', 96, 860, 'font-size:40px;line-height:1.25')
    + f'<div class="seal" style="left:96px;top:1050px;width:220px;height:220px;background:{C["Chilli"]}"><p class="fg" style="color:{C["Cream"]};top:78px;font-size:56px;left:0;right:0;text-align:center">FUND</p></div>'
    + swipe('Comment FUND', 'Peony', 'Peony', 'Burgundy'))

CSS = f'''
@font-face{{font-family:"Faculty Glyphic";src:url("{(FONTS / 'FacultyGlyphic-Regular.ttf').as_uri()}")}}
@font-face{{font-family:"Libre Baskerville";font-style:normal;src:url("{(FONTS / 'lb/package/files/libre-baskerville-latin-400-normal.woff2').as_uri()}")}}
@font-face{{font-family:"Libre Baskerville";font-style:italic;src:url("{(FONTS / 'lb/package/files/libre-baskerville-latin-400-italic.woff2').as_uri()}")}}
@page{{size:1080px 1350px;margin:0}}
html,body{{margin:0;padding:0}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;page-break-after:always}}
.s p{{position:absolute;margin:0;white-space:nowrap}}
.pic{{position:absolute;left:0;top:0;width:1080px;height:1350px;overflow:hidden}}.pic img{{position:absolute;display:block}}
.fg{{font-family:"Faculty Glyphic";letter-spacing:-0.025em;line-height:1.05}}
.lb{{font-family:"Libre Baskerville"}}
.it,.iti{{font-family:"Libre Baskerville";font-style:italic;letter-spacing:-0.02em;line-height:1.15}}
.c{{left:0;right:0;text-align:center}}
.lab{{font:400 24px/1 "Faculty Glyphic";letter-spacing:.16em;text-transform:uppercase}}
.no{{right:96px;top:76px;font:400 28px/1 "Libre Baskerville"}}
.chip{{padding:10px 18px;border-radius:999px;right:78px;top:66px}}
.cr{{font:400 24px/1 "Faculty Glyphic"}}
.rule{{position:absolute;left:96px;width:888px;height:2px}}
.seal{{position:absolute;border-radius:50%;transform:rotate(-8deg)}}
.seal p{{left:0;right:0;text-align:center}}
.swipe{{position:absolute;right:96px;bottom:96px;display:flex;align-items:center}}
.ring{{width:72px;height:72px;border:2px solid;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-right:-10px}}
.pill{{font:400 34px/1 "Faculty Glyphic";letter-spacing:-0.01em;padding:21px 36px;border-radius:999px}}
.num{{position:absolute;width:64px;height:64px;border-radius:50%;font:400 32px/64px "Libre Baskerville";text-align:center}}
.tick{{position:absolute;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center}}
'''

TMP.mkdir(parents=True, exist_ok=True)
for f in OUT.glob('*.jpg'):
    f.unlink()
page = HERE / 'carousel_canva_v2.html'
page.write_text(f'<!doctype html><meta charset="utf-8"><style>{CSS}</style>' + ''.join(S))
(HERE / 'canva').mkdir(exist_ok=True)
js = HERE / 'canva_v2_shot.cjs'
js.write_text('''const {chromium}=require(process.env.NP+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350}});
await p.goto(process.argv[2]);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
const s=await p.$$('.s');for(let i=0;i<s.length;i++){await s[i].screenshot({path:process.argv[3]+'/'+String(i+1).padStart(2,'0')+'.png'});}
await p.pdf({path:process.argv[4],width:'1080px',height:'1350px',printBackground:true,margin:{top:0,right:0,bottom:0,left:0}});
await b.close()})();''')
subprocess.run(['node', str(js), page.as_uri(), str(OUT), str(HERE / 'canva' / 'ATH-creative-fund-v2-editable.pdf')], check=True)
for p in sorted(OUT.glob('*.png')):
    Image.open(p).convert('RGB').save(p.with_suffix('.jpg'), quality=88)
    p.unlink()
for p in TMP.glob('*'):
    p.unlink()
TMP.rmdir()
print(len(S))
