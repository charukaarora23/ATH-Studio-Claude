"""Garden Edition launch, built from the ATH brand guidelines v24 (Vercel).
Voices: Statement = Nord Bold (Hanken Grotesk is the brand's named fallback), Soft = Newsreader,
Curate = DM Mono. Max three fonts per piece. Tonal type pairs only. Details from section 05:
cream mat, spec tags, hairline table, arch window, real objects (pass), ellipse button,
one Orange spark on a light ground. Gradients (Heartbeat, Blush Dusk, Golden Hour) always with grain.
No slide counters. Every slide carries the deadline line in DM Mono.
Usage: python3 garden_launch_v2.py -> launch-v2/*.png
"""
import json, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'launch-v2'
OUT.mkdir(exist_ok=True)

# ATH v24 palette
BURG, CHILLI, PEONY, BALLET, HOTROSE = '#6A0620', '#AA0003', '#FAD2E1', '#FFD6DE', '#FFA1C2'
LEMON, PIST, SKY, PETROL, ORANGE = '#FFF3B2', '#D0D996', '#B7D9FF', '#025054', '#DD4E28'
CREAM, SAND, COCOA, INK, PAPER = '#F9ECE5', '#EAD6CB', '#4C4240', '#2A0A12', '#FBF6EF'
DEADLINE, LEFT = '13.12', 30

HEARTBEAT = f'radial-gradient(60% 50% at 50% 55%, {HOTROSE} 0%, {CHILLI} 38%, {BURG} 70%, #4A0416 100%)'
BLUSH = f'radial-gradient(70% 60% at 30% 25%, {HOTROSE} 0%, transparent 60%), radial-gradient(80% 70% at 75% 80%, {PEONY} 0%, transparent 70%), {SKY}'
GOLDEN = f'radial-gradient(70% 60% at 70% 30%, {LEMON} 0%, transparent 65%), radial-gradient(80% 70% at 20% 85%, {PEONY} 0%, transparent 70%), {BALLET}'

CSS = f'''
@font-face{{font-family:Nord;src:url(fonts/ath/HankenGrotesk.woff2);font-weight:100 900}}
@font-face{{font-family:News;src:url(fonts/ath/Newsreader.woff2);font-weight:200 800}}
@font-face{{font-family:News;font-style:italic;src:url(fonts/ath/Newsreader-Italic.woff2);font-weight:200 800}}
@font-face{{font-family:Mono;src:url(fonts/ath/DMMono.woff2);font-weight:400}}
@font-face{{font-family:Mono;src:url(fonts/ath/DMMono-Medium.woff2);font-weight:500}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{background:#888;-webkit-font-smoothing:antialiased}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;margin-bottom:30px}}
.a{{position:absolute}}
.grain{{position:absolute;inset:0;background:url(art/grain.png);mix-blend-mode:soft-light;opacity:.45;pointer-events:none}}
.st{{font-family:Nord;font-weight:700;letter-spacing:-.045em;line-height:.92}}
.camp{{font-family:Nord;font-weight:800;letter-spacing:-.03em;line-height:.86;text-transform:uppercase}}
.soft{{font-family:News;font-weight:300;letter-spacing:-.02em;line-height:1.02}}
.soft em,.it{{font-style:italic}}
.read{{font-family:News;font-weight:400;font-size:32px;line-height:1.42}}
.mono{{font-family:Mono;font-size:21px;letter-spacing:.08em;text-transform:uppercase;line-height:1.4}}
.tag{{display:inline-flex;align-items:center;height:46px;padding:0 20px;border:1.5px solid;border-radius:999px;font-family:Mono;font-size:18px;letter-spacing:.08em;text-transform:uppercase}}
.foot{{position:absolute;left:86px;right:86px;bottom:78px;display:flex;justify-content:space-between}}
.ellipse{{display:inline-flex;align-items:center;justify-content:center;height:92px;padding:0 54px;border:2px solid;border-radius:50%;font-family:Nord;font-weight:600;font-size:28px;letter-spacing:-.01em}}
'''
S = []


def foot(c, right='Link in bio'):
    return f'<div class="foot mono" style="color:{c}"><span>Vol. 16 · Garden · {LEFT} days left · Deadline {DEADLINE}</span><span>{right}</span></div>'


def tags(c, *t):
    return '<div class="a" style="left:86px;top:86px;display:flex;gap:10px">' + ''.join(f'<span class="tag" style="color:{c};border-color:{c}">{x}</span>' for x in t) + '</div>'


def slide(name, bg, html):
    S.append((name, f'<section class="s" id="{name}" style="background:{bg}">{html}</section>'))


# 1 COVER · Petrol duotone in a cream mat, arch window, campaign words
slide('01-cover', SAND, f'''
<div class="a" style="inset:28px;border-radius:28px;background:{PETROL};overflow:hidden">
  <div class="a" style="right:60px;top:150px;width:430px;height:600px;border-radius:215px 215px 12px 12px;background:url(art/call-garden.jpg) 50% 35%/cover"></div>
  <p class="mono a" style="right:60px;top:770px;width:430px;color:{PEONY};font-size:16px">Artist Name · Title · Oil · City</p>
</div>
{tags(PEONY, 'Open call', 'Vol. 16')}
<p class="camp a" style="left:84px;top:330px;font-size:170px;color:{PIST}">Open<br>call</p>
<p class="soft a" style="left:86px;width:470px;top:690px;font-size:56px;color:{PEONY}"><em>Garden Edition.</em> A juried book of 101 artists.</p>
<div class="a" style="left:86px;top:1000px"><span class="ellipse" style="color:{PIST};border-color:{PIST}">Submit work</span></div>
{foot(PEONY)}
''')

# 2 THE SERIES · cream, Swiss list: big numeral, quiet list
eds = ['Floral', 'Animal', 'Portrait', 'Nature', 'Abstract', 'Landscape', 'Collage', 'Food', 'Photography', 'Dog', 'Pattern', 'Colors', 'Faces', 'Texture', 'Nature II']
rows = ''.join(f'<div style="display:flex;justify-content:space-between;padding:9px 0;border-top:1px solid {SAND}"><span>{i + 1:02d}</span><span>{e}</span></div>' for i, e in enumerate(eds))
slide('02-series', CREAM, f'''
{tags(BURG, 'The series')}
<p class="st a" style="left:80px;top:200px;font-size:170px;color:{BURG}">1,300+</p>
<p class="soft a" style="left:86px;width:440px;top:400px;font-size:52px;color:{BURG}">artists published since 2023, in <em>fifteen editions.</em></p>
<div class="mono a" style="left:640px;right:86px;top:190px;font-size:18px;color:{COCOA}">{rows}
  <div style="display:flex;justify-content:space-between;padding:12px 10px;margin-top:6px;background:{PIST};color:{PETROL}"><span>16</span><span>Garden · now open</span></div></div>
<p class="read a" style="left:86px;width:440px;top:760px;color:{COCOA}">Cover artists have included Ian Davenport and Tana Gaxiola. Every edition is sold on Amazon and Barnes &amp; Noble.</p>
{foot(COCOA)}
''')

# 3 THE THEME · Blush Dusk with grain, one soft quote, arrow sign-off
slide('03-theme', SKY, f'''
<div class="a" style="inset:0;background:{BLUSH}"></div><div class="grain"></div>
{tags(BURG, 'The theme')}
<p class="soft a" style="left:110px;right:110px;top:380px;font-size:88px;text-align:center;color:{BURG}"><em>A garden is more than a place where things grow.</em></p>
<p class="read a" style="left:180px;right:180px;top:720px;text-align:center;color:{BURG}">A single flower, the shape of a leaf, an overgrown landscape, or a world that exists only in memory. Show us yours.</p>
{foot(BURG, 'From the brief')}
''')

# 4 SELECTION · cream, hairline table, curator in a cream mat
table = [('Jury', 'Led by our guest curator'), ('Looking for', 'Originality, a considered reading of the theme, quality of the work'),
         ('Selected', '101 artists'), ('Results', 'Within three weeks of 13 December'), ('Medium', 'All media, original work only')]
trs = ''.join(f'<div style="display:grid;grid-template-columns:220px 1fr;gap:20px;padding:22px 0;border-top:1px solid {SAND}"><span class="mono" style="color:{CHILLI};font-size:18px">{a}</span><span class="read" style="font-size:30px;line-height:1.3;color:{INK}">{b}</span></div>' for a, b in table)
slide('04-selection', CREAM, f'''
{tags(BURG, 'Selection')}
<p class="st a" style="left:82px;top:190px;font-size:100px;color:{BURG}">How work is<br>selected.</p>
<div class="a" style="right:86px;top:180px;width:250px;height:310px;border-radius:12px;background:{SAND};padding:14px"><div style="width:100%;height:100%;background:#D9C3B8;display:flex;align-items:center;justify-content:center"><span class="mono" style="font-size:14px;color:{COCOA};text-align:center">Curator<br>portrait</span></div></div>
<div class="a" style="left:86px;right:86px;top:540px;border-bottom:1px solid {SAND}">{trs}</div>
{foot(COCOA)}
''')

# 5 INSIDE THE EDITION · burgundy (Evening), real objects in mats
slide('05-inside', BURG, f'''
{tags(PEONY, 'Inside the edition')}
<p class="soft a" style="left:86px;right:86px;top:180px;font-size:84px;color:{PEONY}">More than a <em>catalogue.</em></p>
<div class="a" style="left:86px;right:86px;top:350px;display:grid;grid-template-columns:1fr 1fr;gap:22px">
  <div style="background:{SAND};border-radius:20px;padding:20px"><div style="height:420px;background:url(art/call-women.jpg) 50% 40%/cover;border-radius:6px"></div><p class="mono" style="color:{COCOA};font-size:15px;margin-top:14px">Women Artists on the Rise · Hardcover</p></div>
  <div style="background:{SAND};border-radius:20px;padding:20px"><div style="height:420px;background:url(art/call-aoty.jpg) 45% 50%/cover;border-radius:6px"></div><p class="mono" style="color:{COCOA};font-size:15px;margin-top:14px">Artists of the Year 2025 · Hardcover</p></div>
</div>
<p class="read a" style="left:86px;right:140px;top:930px;color:{PEONY}">Interviews with the guest curator, collectors, galleries and the cover artist, alongside the 101. A premium hardcover with gold-foil detailing.</p>
{foot(PEONY)}
''')

# 6 FOR SELECTED ARTISTS · cream, the pass as a real object, then the benefits
ben = ['Publication credit for your CV and grants', 'Certificate of Recognition', 'Amazon, Barnes & Noble and bookstores', 'Introduction to collectors and galleries', 'Promotion to 190,000+ followers']
slide('06-pass', CREAM, f'''
{tags(BURG, 'If selected')}
<div class="a" style="left:180px;right:180px;top:180px;height:470px;background:{PAPER};border-radius:20px;box-shadow:0 24px 50px rgba(42,10,18,.16);overflow:hidden;transform:rotate(-2.5deg)">
  <div style="height:120px;background:{PETROL};display:flex;align-items:center;justify-content:space-between;padding:0 36px"><span class="mono" style="color:{PIST};font-size:18px">Artwork pass</span><span class="mono" style="color:{PIST};font-size:18px">No. ___ / 101</span></div>
  <div style="padding:36px">
    <p class="st" style="font-size:66px;color:{BURG}">Your Name</p>
    <p class="soft" style="font-size:40px;color:{BURG};margin-top:10px"><em>Title of your work</em></p>
    <p class="mono" style="font-size:17px;color:{COCOA};margin-top:28px">Medium · City · 2026</p>
    <p class="mono" style="font-size:17px;color:{CHILLI};margin-top:8px">101 Art Book · Garden Edition</p>
  </div>
</div>
<div class="a" style="left:86px;right:86px;top:760px">
  {''.join(f'<p class="read" style="font-size:30px;padding:13px 0;border-top:1px solid {SAND};color:{INK}">{b}</p>' for b in ben)}
</div>
{foot(COCOA)}
''')

# 7 RECOGNITION · Golden Hour with grain, the Winners voice
slide('07-recognition', BALLET, f'''
<div class="a" style="inset:0;background:{GOLDEN}"></div><div class="grain"></div>
{tags(CHILLI, 'Recognition')}
<p class="st a" style="left:76px;top:200px;font-size:300px;color:{CHILLI}">$500</p>
<p class="soft a" style="left:86px;right:86px;top:520px;font-size:62px;color:{BURG}">and a <em>4-page feature</em> for the winner, chosen by the jury.</p>
<div class="a" style="left:86px;right:86px;top:780px;color:{BURG}">
  {''.join(f'<div style="display:grid;grid-template-columns:300px 1fr;padding:20px 0;border-top:1px solid rgba(106,6,32,.25)"><span class="mono" style="font-size:18px">{a}</span><span class="read" style="font-size:28px;line-height:1.3">{b}</span></div>' for a, b in [('Winner', '$500 · 4-page feature · glass trophy · Artsy listing'), ('Two runners-up', '2-page feature · glass trophy · Artsy listing')])}
</div>
{foot(BURG)}
''')

# 8 SUBMIT · cream, numerals, the one Orange spark
slide('08-submit', CREAM, f'''
{tags(BURG, 'Submit')}
<p class="mono a" style="left:86px;top:300px;color:{CHILLI}">Submission deadline</p>
<p class="st a" style="left:74px;top:340px;font-size:330px;color:{BURG}">13.12</p>
<p class="soft a" style="left:86px;right:200px;top:700px;font-size:54px;color:{BURG}">One original artwork. <em>Open to artists worldwide,</em> 18+, all media.</p>
<div class="a" style="left:86px;top:930px;display:flex;align-items:center;gap:34px">
  <span style="display:inline-flex;align-items:center;gap:16px;height:96px;padding:0 44px;border-radius:999px;background:{ORANGE};color:{CREAM};font-family:Nord;font-weight:600;font-size:30px">Submit · link in bio →</span>
  <span class="read" style="font-size:28px;color:{COCOA}">or DM us “GARDEN”<br>for the brief</span>
</div>
{foot(COCOA)}
''')

(HERE / 'launch-v2.html').write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(h for _, h in S)}</body></html>')
(HERE / '.shot13.cjs').write_text(f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1080,height:1350}}}});
await p.goto('file://{HERE}/launch-v2.html');await p.evaluate(()=>document.fonts.ready);
for(const id of {json.dumps([n for n, _ in S])}){{await p.locator('[id="'+id+'"]').screenshot({{path:'{OUT}/'+id+'.png'}});}}await b.close();}})();""")
subprocess.run(['node', str(HERE / '.shot13.cjs')], check=True, cwd='/tmp')
print('rendered', len(S))
