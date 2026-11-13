"""Garden Edition launch carousel: a juried publication calling for submissions.
Design psychology: restraint, editorial type, framed and credited art, real objects, a fixed frame,
colour with a job (petrol = this call, cream = the book/proof, burgundy = action only),
and a calm countdown strip on every slide.
Usage: python3 garden_launch.py -> launch/*.png
"""
import json, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'launch'
OUT.mkdir(exist_ok=True)
PETROL, CREAM, PAPER, INK, BURG, PIST, LINE = '#025054', '#F9EEE5', '#FBF6EF', '#1C1310', '#6A0620', '#D0D996', '#D9CBBF'
LOGO = (HERE / 'art' / 'logo-open-calls.svg').read_text().replace('viewBox="-78.00 -156.47 750.45 302.01"', 'viewBox="-2 -84 600 156"')
DAYS, CLOSE = 30, '13 December 2026'
N = 8

CSS = f'''
@font-face{{font-family:IS;src:url(fonts/InstrumentSerif-Regular.ttf)}}
@font-face{{font-family:IS;font-style:italic;src:url(fonts/InstrumentSerif-Italic.ttf)}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{background:#999;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;margin-bottom:30px}}
.a{{position:absolute}}
.lab{{font:600 18px/1 Inter;letter-spacing:.22em;text-transform:uppercase}}
.serif{{font-family:IS,Georgia,serif;font-weight:400;letter-spacing:-.015em;line-height:.95}}
.serif em{{font-style:italic}}
.body{{font:400 30px/1.45 Inter}}
.small{{font:400 22px/1.45 Inter}}
.strip{{position:absolute;left:80px;right:80px;bottom:64px;padding-top:22px;border-top:1.5px solid;display:flex;justify-content:space-between;align-items:center}}
.strip p{{font:600 17px/1 Inter;letter-spacing:.18em;text-transform:uppercase}}
.strip svg{{height:38px;width:auto;display:block}}
.wall{{font:400 18px/1.4 Inter;margin-top:14px}}
.wall i{{font-family:IS;font-size:22px}}
'''
S = []


def frame(n, label, fg, rule):
    return (f'<p class="lab a" style="left:80px;top:72px;color:{fg}">{label}</p>'
            f'<p class="lab a" style="right:80px;top:72px;color:{fg};opacity:.7">Edition 16 · {n} / {N}</p>'
            f'<div class="strip" style="color:{fg};border-color:{rule}"><p>{DAYS} days left · Submissions close {CLOSE}</p>{LOGO}</div>')


def slide(name, bg, html):
    S.append((name, f'<section class="s" id="{name}" style="background:{bg}">{html}</section>'))


# 1 COVER: exhibition poster
slide('01-cover', PETROL, f'''{frame(1, 'Submissions open', CREAM, 'rgba(249,238,229,.35)')}
<h1 class="serif a" style="left:76px;right:80px;top:150px;font-size:118px;color:{CREAM}">101 Art Book<br><em style="color:{PIST}">Garden Edition</em></h1>
<p class="body a" style="left:80px;right:200px;top:410px;color:{CREAM};opacity:.9">A juried, hardcover publication of 101 contemporary artists.</p>
<div class="a" style="left:80px;right:80px;top:560px">
  <div style="height:520px;background:url(art/call-garden.jpg) 50% 40%/cover;box-shadow:0 0 0 14px {CREAM}"></div>
  <p class="wall" style="color:{CREAM};margin-top:30px"><i>Artist Name</i>, Title of Work, Year · Oil on canvas</p>
</div>''')

# 2 THE SERIES: a shelf of real editions, the 16th slot open
eds = ['Floral', 'Animal', 'Portrait', 'Nature', 'Abstract', 'Landscape', 'Collage', 'Food', 'Photography', 'Dog', 'Nature II', 'Pattern', 'Colors', 'Faces', 'Texture']
tones = ['#6A0620', '#2F3B33', '#B9897A', '#025054', '#1C1310', '#8C6A4F', '#A34A3A', '#C9B38E', '#3E4A5C', '#7A5C3E', '#4D6B57', '#D9A9B4', '#E2B94C', '#5A2230', '#9A8F80']
spines = ''.join(f'<div style="width:50px;height:{430 + (i * 37) % 80}px;background:{t};display:flex;align-items:flex-end;justify-content:center;padding-bottom:18px">'
                 f'<span style="writing-mode:vertical-rl;transform:rotate(180deg);font:400 20px/1 IS;color:{CREAM if t not in ("#E2B94C", "#D9A9B4", "#C9B38E") else INK}">{e}</span></div>'
                 for i, (e, t) in enumerate(zip(eds, tones)))
slide('02-series', PAPER, f'''{frame(2, 'The series', PETROL, LINE)}
<h2 class="serif a" style="left:76px;right:80px;top:150px;font-size:96px;color:{INK}">The sixteenth edition<br>of a growing <em>collection.</em></h2>
<div class="a" style="left:80px;right:80px;top:420px;height:560px;display:flex;align-items:flex-end;gap:6px;border-bottom:6px solid {INK}">
  {spines}
  <div style="width:58px;height:520px;border:2.5px dashed {PETROL};display:flex;align-items:flex-end;justify-content:center;padding-bottom:18px;margin-left:6px">
    <span style="writing-mode:vertical-rl;transform:rotate(180deg);font:italic 400 22px/1 IS;color:{PETROL}">Garden</span></div>
</div>
<div class="a" style="left:80px;right:80px;top:1030px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;color:{INK}">
  <div><p class="serif" style="font-size:58px">1,300+</p><p class="small" style="margin-top:6px">artists published</p></div>
  <div><p class="serif" style="font-size:58px">15</p><p class="small" style="margin-top:6px">editions since 2023</p></div>
  <div><p class="small" style="margin-top:8px">Cover artists include <i style="font-family:IS;font-size:26px">Ian Davenport</i> and <i style="font-family:IS;font-size:26px">Tana Gaxiola</i></p></div>
</div>''')

# 3 THE THEME: the curatorial voice
slide('03-theme', PETROL, f'''{frame(3, 'The theme', CREAM, 'rgba(249,238,229,.35)')}
<div class="a" style="left:120px;right:120px;top:400px;text-align:center;color:{CREAM}">
  <p class="serif" style="font-size:96px;line-height:1"><em>“A garden is more than a place where things grow.”</em></p>
  <p class="body" style="margin-top:56px;opacity:.9">It can be found in a single flower, the shape of a leaf, the flight of a butterfly, an overgrown landscape, or a world that exists only in memory.</p>
  <p class="lab" style="margin-top:56px;color:{PIST}">From the curatorial brief</p>
</div>''')

# 4 SELECTION: the curator and the criteria, like a document
slide('04-selection', PAPER, f'''{frame(4, 'Selection', PETROL, LINE)}
<h2 class="serif a" style="left:76px;right:80px;top:150px;font-size:96px;color:{INK}">How work <em>is selected</em></h2>
<div class="a" style="left:80px;top:330px;width:380px;height:480px;background:#E7DDD3;display:flex;align-items:center;justify-content:center;text-align:center;padding:30px">
  <p class="small" style="color:#8B7B72">Guest curator portrait<br>(to add)</p></div>
<p class="wall a" style="left:80px;top:830px;width:380px;color:{INK}"><i>Guest curator name</i><br>Role, gallery or institution</p>
<div class="a" style="left:510px;right:80px;top:330px;color:{INK}">
  <p class="body">Every submission is reviewed by our jury, led by the guest curator.</p>
  <p class="lab" style="margin:44px 0 10px;color:{PETROL}">The jury looks for</p>
  {''.join(f'<p class="body" style="padding:16px 0;border-top:1.5px solid {LINE}">{t}</p>' for t in ['Originality', 'A considered interpretation of the theme', 'The quality of the work'])}
  <p class="small" style="margin-top:34px;padding-top:20px;border-top:1.5px solid {LINE}">101 artists selected · Results within three weeks of the deadline</p>
</div>''')

# 5 INSIDE THE EDITION: real books
slide('05-inside', PAPER, f'''{frame(5, 'Inside the edition', PETROL, LINE)}
<h2 class="serif a" style="left:76px;right:80px;top:150px;font-size:96px;color:{INK}">More than <em>a catalogue</em></h2>
<div class="a" style="left:80px;right:80px;top:340px;display:grid;grid-template-columns:1fr 1fr;gap:24px">
  <div><div style="height:440px;background:url(art/call-women.jpg) 50% 40%/cover"></div><p class="wall" style="color:{INK}"><i>Women Artists on the Rise</i></p></div>
  <div><div style="height:440px;background:url(art/call-aoty.jpg) 45% 50%/cover"></div><p class="wall" style="color:{INK}"><i>Artists of the Year 2025</i></p></div>
</div>
<p class="body a" style="left:80px;right:120px;top:900px;color:{INK}">Alongside the 101 artists: interviews with our guest curator, collectors, galleries and the cover artist. A premium hardcover with gold-foil detailing.</p>''')

# 6 FOR SELECTED ARTISTS: career value, like a CV entry
rows = [('Publication credit', 'For your CV, website and grant applications'), ('Certificate of Recognition', 'A formal record of your selection'),
        ('Distribution', 'Amazon, Barnes & Noble and independent bookstores'), ('Introduction', 'To our network of collectors, curators and galleries'),
        ('Promotion', 'To our 190,000+ community and 100,000+ email readers')]
slide('06-value', PETROL, f'''{frame(6, 'For selected artists', CREAM, 'rgba(249,238,229,.35)')}
<h2 class="serif a" style="left:76px;right:80px;top:150px;font-size:92px;color:{CREAM}">What selection means<br>for <em style="color:{PIST}">your practice</em></h2>
<div class="a" style="left:80px;right:80px;top:420px;color:{CREAM}">
  {''.join(f'<div style="display:grid;grid-template-columns:380px 1fr;gap:20px;padding:26px 0;border-top:1.5px solid rgba(249,238,229,.3)"><p class="serif" style="font-size:40px;line-height:1.1">{a}</p><p class="small" style="opacity:.85;padding-top:6px">{b}</p></div>' for a, b in rows)}
</div>''')

# 7 RECOGNITION: the awards, set quietly
aw = [('Winner', '$500 award · 4-page feature · Glass trophy · Artsy artist listing'),
      ('First runner-up', '2-page feature · Glass trophy · Artsy artist listing'),
      ('Second runner-up', '2-page feature · Glass trophy · Artsy artist listing')]
slide('07-recognition', PAPER, f'''{frame(7, 'Recognition', PETROL, LINE)}
<h2 class="serif a" style="left:76px;right:80px;top:150px;font-size:92px;color:{INK}">Three artists will receive <em>additional recognition</em></h2>
<div class="a" style="left:80px;right:80px;top:470px;color:{INK}">
  {''.join(f'<div style="padding:34px 0;border-top:1.5px solid {LINE}"><p class="lab" style="color:{PETROL}">{a}</p><p class="serif" style="font-size:46px;line-height:1.15;margin-top:14px">{b}</p></div>' for a, b in aw)}
  <p class="small" style="padding-top:26px;border-top:1.5px solid {LINE}">Selected by the jury from the 101 published artists.</p>
</div>''')

# 8 SUBMIT: one burgundy action, the date
slide('08-submit', PAPER, f'''{frame(8, 'Submit', PETROL, LINE)}
<p class="lab a" style="left:80px;top:290px;color:{PETROL}">Submissions close</p>
<h2 class="serif a" style="left:72px;right:80px;top:330px;font-size:190px;color:{INK}">13 <em>December</em></h2>
<p class="body a" style="left:80px;right:140px;top:620px;color:{INK}">Submit one original artwork for 101 Art Book: Garden Edition. Open to artists 18+ worldwide, in all media.</p>
<div class="a" style="left:80px;top:840px;display:flex;flex-direction:column;gap:18px;align-items:flex-start">
  <span style="display:inline-flex;align-items:center;gap:16px;height:96px;padding:0 40px;border-radius:12px;background:{BURG};color:{CREAM};font:500 32px/1 Inter">Submit through the link in bio →</span>
  <span style="display:inline-flex;align-items:center;height:96px;padding:0 40px;border-radius:12px;border:2px solid {INK};color:{INK};font:500 32px/1 Inter">DM us “GARDEN” for the full brief</span>
</div>''')

(HERE / 'launch.html').write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(h for _, h in S)}</body></html>')
(HERE / '.shot12.cjs').write_text(f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1080,height:1350}},deviceScaleFactor:1}});
await p.goto('file://{HERE}/launch.html');await p.evaluate(()=>document.fonts.ready);
for(const id of {json.dumps([n for n, _ in S])}){{await p.locator('[id="'+id+'"]').screenshot({{path:'{OUT}/'+id+'.png'}});}}await b.close();}})();""")
subprocess.run(['node', str(HERE / '.shot12.cjs')], check=True, cwd='/tmp')
print('rendered', len(S))
